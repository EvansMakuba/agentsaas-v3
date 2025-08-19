import logging
from celery_app import celery
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# --- Firebase Initialization for Celery Workers ---
# This block ensures that each Celery worker process initializes
# its own connection to Firebase.
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate("google-application-credentials.json")
        firebase_admin.initialize_app(cred)
        logging.info("Firebase initialized successfully for Celery worker.")
    except Exception as e:
        logging.critical(f"FATAL: Could not initialize Firebase for Celery worker: {e}")

db = firestore.client()

# --- The Main Orchestrator Task ---

@celery.task(name='tasks.campaign_orchestrator')
def campaign_orchestrator():
    """
    This is the main conductor of our platform. It runs periodically, finds
    active campaigns, and decides what kind of work needs to be done.
    """
    logging.info("--- Campaign Orchestrator Started ---")
    
    try:
        # Query Firestore for all campaigns that are active and have a budget
        campaigns_ref = db.collection('campaigns')
        query = campaigns_ref.where(filter=FieldFilter("status", "==", "active")) \
                             .where(filter=FieldFilter("budget_usd", ">", 0))
        
        active_campaigns = query.stream()

        campaign_count = 0
        for campaign in active_campaigns:
            campaign_count += 1
            campaign_id = campaign.id
            campaign_data = campaign.to_dict()
            
            logging.info(f"Processing active campaign: {campaign_id} for Brand {campaign_data.get('brand_user_id')}")
            
            # TODO: Implement the logic to decide if we need a post or a comment.
            # For now, we will just trigger a comment task.
            
            # Trigger the next step in the process: generating a task for the marketplace.
            # We pass the campaign_id so the next worker knows which campaign to work on.
            generate_task_for_marketplace.delay(campaign_id)

        if campaign_count == 0:
            logging.info("No active campaigns found in this cycle.")
        else:
            logging.info(f"Orchestrator processed {campaign_count} active campaigns.")

    except Exception as e:
        logging.error(f"An error occurred in the campaign orchestrator: {e}", exc_info=True)
    
    logging.info("--- Campaign Orchestrator Finished ---")
    return f"Processed {campaign_count} campaigns."


@celery.task(name='tasks.generate_task_for_marketplace')
def generate_task_for_marketplace(campaign_id: str):
    """
    This is the worker task that will eventually find an opportunity
    and deploy the AI Crew to generate content.
    """
    logging.info(f"--- Task Generation Started for Campaign: {campaign_id} ---")
    
    # Placeholder for our complex AI logic
    # We will build this out in the next steps.
    logging.info(f"Finding opportunity for campaign {campaign_id}...")
    # ... (Code to scan Reddit) ...
    
    logging.info(f"Deploying Content Generation Crew for campaign {campaign_id}...")
    # ... (Code to run CrewAI) ...
    
    # For now, we'll just log a success message.
    logging.info(f"--- Task Generation Finished for Campaign: {campaign_id} ---")
    return f"Task generation placeholder for {campaign_id}"