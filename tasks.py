import logging
import os
from celery_app import celery
import firebase_admin
# from firebase_admin import credentials, firestore
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
load_dotenv()

# Import our agent functions and the specific tool instances
from agents import run_research_analyst, run_creative_writer
from tools import reddit_tool # We import the single instance of our RedditTool

# --- Firebase Initialization for Celery Workers ---
if not firebase_admin._apps:
    try:
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "google-application-credentials.json")
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)


            # --- THIS IS THE FIX ---
            # Give this Firebase app instance a unique name for the Celery workers.
            firebase_admin.initialize_app(cred, name='celery_worker')
        else:
            # This fallback is less common with named apps but kept for safety
            firebase_admin.initialize_app(name='celery_worker')
        
        logging.info("Firebase initialized successfully for Celery worker.")


        #     firebase_admin.initialize_app(cred)
        #     logging.info("Firebase initialized successfully for Celery worker.")
        # else:
        #     firebase_admin.initialize_app()
        #     logging.info("Firebase initialized successfully for Celery worker using default credentials.")
    except Exception as e:
        logging.critical(f"FATAL: Could not initialize Firebase for Celery worker: {e}")

# db = firestore.client()
db = firestore.client(app=firebase_admin.get_app(name='celery_worker'))

# =====================================================================================
# CELERY TASKS
# =====================================================================================

@celery.task(name='tasks.campaign_orchestrator')
def campaign_orchestrator():
    """
    This is the main conductor. It now only processes campaigns that haven't
    had a task generated for them recently.
    """
    logging.info("--- Campaign Orchestrator Started ---")
    
    try:
        cooldown_period = datetime.now(timezone.utc) - timedelta(hours=1)
        campaigns_ref = db.collection('campaigns')
        
        # --- THIS IS THE CRITICAL FIX ---
        # Add the third 'where' clause to respect the cooldown period.
        query = campaigns_ref.where(filter=FieldFilter("status", "==", "active")) \
                             .where(filter=FieldFilter("budget_usd", ">", 0)) \
                             .where(filter=FieldFilter("last_task_generated_at", "<", cooldown_period))
        
        active_campaigns = query.stream()
        campaign_count = 0
        for campaign in active_campaigns:
            campaign_count += 1
            campaign_id = campaign.id
            campaign_data = campaign.to_dict()
            
            logging.info(f"Processing active campaign: {campaign_id} for Brand {campaign_data.get('brand_user_id')}")
            
            generate_task_for_marketplace.delay(campaign_id)

            # Update the timestamp to put the campaign on cooldown
            db.collection('campaigns').document(campaign_id).update({
                "last_task_generated_at": firestore.SERVER_TIMESTAMP
            })

        if campaign_count == 0:
            logging.info("No active campaigns found (or all are on cooldown).")
        else:
            logging.info(f"Orchestrator processed {campaign_count} active campaigns.")

    except Exception as e:
        logging.error(f"An error occurred in the campaign orchestrator: {e}", exc_info=True)
        campaign_count = 0
    
    logging.info("--- Campaign Orchestrator Finished ---")
    return f"Processed {campaign_count} campaigns."


@celery.task(name='tasks.generate_task_for_marketplace')
def generate_task_for_marketplace(campaign_id: str):
    """
    This worker task executes our custom, framework-free agentic workflow.
    It finds an opportunity, generates content, and saves the result as a
    new task in the marketplace for Executors.
    """
    logging.info(f"--- Task Generation Started for Campaign: {campaign_id} ---")
    
    try:
        # --- 1. Fetch Campaign Details ---
        campaign_ref = db.collection('campaigns').document(campaign_id)
        campaign_doc = campaign_ref.get()
        if not campaign_doc.exists:
            logging.error(f"Campaign {campaign_id} not found in Firestore. Ending task.")
            return f"Campaign {campaign_id} not found."

        campaign_data = campaign_doc.to_dict()
        objective = campaign_data.get('objective')
        subreddits = campaign_data.get('target_subreddits')
        brand_user_id = campaign_data.get('brand_user_id')

        # --- OUR NEW FRAMEWORK-FREE WORKFLOW ---

        # --- 2. Scan for Posts (Opportunity Finding) ---
        logging.info(f"Scanning subreddits: {subreddits} for campaign {campaign_id}...")
        all_posts_data = ""
        for sub in subreddits:
            posts = reddit_tool.scan_subreddit(subreddit=sub)
            # ---BUG FIX 1: Check if the tool returned an error
            if "Error:" not in posts:
            # --- THIS IS THE CORRECTED LINE ---
            # We now call the specific, descriptive method from our tool.
                all_posts_data += posts +'\n'

        if not all_posts_data.strip():
            logging.warning(f"No engaging posts found for campaign {campaign_id}. Ending task.")
            return f"No opportunities found for {campaign_id}"

        # --- 3. Run the Research Analyst Agent (Triage) ---
        logging.info(f"Deploying Research Analyst Agent for campaign {campaign_id}...")
        best_post_url = run_research_analyst(objective, subreddits, all_posts_data)
        
        if not best_post_url or not best_post_url.startswith("https://www.reddit.com"):
            logging.error(f"Research Analyst for campaign {campaign_id} failed to return a valid URL. Output: {best_post_url}")
            return f"Analyst failed for {campaign_id}"
        logging.info(f"Research Analyst selected post: {best_post_url}")

        # --- 4. Get Context for the Selected Post ---
        logging.info(f"Fetching full context for post: {best_post_url}")
        post_context = reddit_tool.get_post_context(post_url=best_post_url)
        
        if "Error:" in post_context:
             logging.error(f"Failed to fetch context for {best_post_url}. Error: {post_context}")
             return f"Context fetch failed for {campaign_id}"

        # --- 5. Run the Creative Writer Agent (Content Generation) ---
        logging.info(f"Deploying Creative Writer Agent for campaign {campaign_id}...")
        generated_comment = run_creative_writer(objective, post_context)

        # --- 6. Save the Result to the Marketplace ---
        if generated_comment:
            logging.info(f"Content generated for campaign {campaign_id}: {generated_comment[:100]}...")
            
            task_reward = 1.00

            tasks_ref = db.collection('available_tasks')
            tasks_ref.add({
                "campaign_id": campaign_id,
                "brand_user_id": brand_user_id,
                "submission_body": generated_comment,
                "submission_url": best_post_url,
                "status": "open",
                "reward_usd": task_reward,
                "task_tier": 1,
                "created_at": firestore.SERVER_TIMESTAMP
            })
            logging.info(f"Successfully saved new task to marketplace for campaign {campaign_id}.")

            campaign_ref.update({
                "budget_usd": firestore.Increment(-task_reward)
            })
            logging.info(f"Decremented budget for campaign {campaign_id} by ${task_reward}.")
            
        else:
            logging.error(f"Creative Writer failed to generate content for campaign {campaign_id}.")

    except Exception as e:
        logging.error(f"An unhandled error occurred in generate_task_for_marketplace for campaign {campaign_id}: {e}", exc_info=True)

    logging.info(f"--- Task Generation Finished for Campaign: {campaign_id} ---")
    return f"Task generation process complete for {campaign_id}"


@celery.task(name='tasks.analyze_reddit_profile')
def analyze_reddit_profile(user_id: str):
    """
    Scrapes a new Executor's Reddit profile to determine their karma,
    account age, and calculate their initial Trust Tier.
    """
    logging.info(f"--- Starting Reddit Profile Analysis for User: {user_id} ---")
    user_ref = db.collection('users').document(user_id)
    
    try:
        user_doc = user_ref.get()
        if not user_doc.exists: raise Exception("User doc not found")
        
        creds = user_doc.to_dict().get('reddit_credentials')
        if not creds or not creds.get('username'):
            raise Exception("Reddit username not found in user doc")
        
        username = creds.get('username')
        profile_stats = reddit_tool.get_profile_stats(username=username)
        
        if "error" in profile_stats:
            user_ref.update({
                "reddit_profile_status": "analysis_failed",
                "reddit_profile_error": profile_stats["error"]
            })
            raise Exception(f"RedditTool failed: {profile_stats['error']}")

        # --- THIS IS THE IMPROVEMENT ---
        # Use .get() with a default value of 0 for safety
        comment_karma = profile_stats.get('comment_karma', 0)
        post_karma = profile_stats.get('post_karma', 0)
        account_age = profile_stats.get('account_age_days', 0)
        total_karma = comment_karma + post_karma
        
        trust_tier = 1
        # Only established accounts can be promoted
        if account_age > 30:
            if total_karma > 5000:
                trust_tier = 3
            elif total_karma > 1000:
                trust_tier = 2

        user_ref.update({
            "reddit_profile": {
                "username": username,
                "total_karma": total_karma,
                "comment_karma": comment_karma,
                "post_karma": post_karma,
                "account_age_days": account_age,
            },
            "trust_tier": trust_tier,
            "reddit_profile_status": "analysis_complete"
        })
        logging.info(f"Successfully analyzed profile for {user_id} ({username}). Set Trust Tier to {trust_tier}.")

    except Exception as e:
        user_ref.update({"reddit_profile_status": "analysis_failed"})
        logging.error(f"Error analyzing Reddit profile for {user_id}: {e}", exc_info=True)

    return f"Analysis complete for {user_id}"