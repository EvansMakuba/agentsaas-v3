import os
import praw
import requests
import logging
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

#



# =====================================================================================
# This file contains simple, standalone Python classes for our tools.
# They DO NOT inherit from any external framework (like Langchain or CrewAI).
# This gives us absolute control, stability, and simplicity.
# =====================================================================================

class PerplexitySearchTool:
    """
    A simple tool to perform web searches using the Perplexity API.
    It has one method: run(query).
    """
    def run(self, query: str) -> str:
        """Performs a search and returns the result as a string."""
        logging.info(f"Executing Perplexity Search for query: {query[:50]}...")
        try:
            url = "https://api.perplexity.ai/chat/completions"
            api_key = os.environ.get("PERPLEXITY_API_KEY")
            if not api_key:
                return "Error: PERPLEXITY_API_KEY is not set."

            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": "sonar",
                "messages": [{"role": "user", "content": query}]
            }
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            return response.json()["choices"][0]['message']['content']
        except Exception as e:
            logging.error(f"Error during Perplexity search: {e}", exc_info=True)
            return f"Error during Perplexity search: {e}"

class RedditTool:
    """
    A tool to interact with the Reddit API using PRAW.
    It has two methods:
    - scan_subreddit(subreddit): To find recent engaging posts.
    - get_post_context(post_url): To get the full content of a specific post.
    """
    def __init__(self):
        self.reddit = None
        try:
            self.reddit = praw.Reddit(
                client_id=os.environ.get("REDDIT_CLIENT_ID"),
                client_secret=os.environ.get("REDDIT_CLIENT_SECRET"),
                user_agent=os.environ.get("REDDIT_USER_AGENT"),
                refresh_token=os.environ.get("REDDIT_REFRESH_TOKEN"),
                timeout=15
            )
            if self.reddit.user.me() is None:
                raise Exception("Authentication failed, user is None.")
            logging.info(f"Successfully authenticated with Reddit as user: {self.reddit.user.me()}")
        except Exception as e:
            logging.critical(f"CRITICAL: Failed to initialize PRAW Reddit instance. Error: {e}", exc_info=True)

    def scan_subreddit(self, subreddit: str) -> str:
        """Fetches recent, engaging posts from a specified subreddit."""
        # lets clean up the name
        subreddit = subreddit.split('/')[1]
        if not self.reddit:
            return "Error: Reddit client is not initialized due to an earlier authentication failure."
        
        logging.info(f"Scanning subreddit: r/{subreddit}")
        try:
            posts_data = []
            subreddit_instance = self.reddit.subreddit(subreddit)
            for submission in subreddit_instance.hot(limit=10):
                if not submission.stickied and submission.num_comments > 15:
                    posts_data.append(
                        f"URL: https://reddit.com{submission.permalink}\n"
                        f"Title: {submission.title}\n"
                        f"Content: {submission.selftext[:500]}...\n---"
                    )
            return "\n".join(posts_data) if posts_data else f"No engaging posts found in r/{subreddit}."
        except Exception as e:
            logging.error(f"Error fetching posts from subreddit r/{subreddit}: {e}", exc_info=True)
            return f"Error fetching posts from subreddit r/{subreddit}: {e}"

    def get_post_context(self, post_url: str) -> str:
        """Fetches the full content and top comments for a single Reddit post URL."""
        if not self.reddit:
            return "Error: Reddit client is not initialized due to an earlier authentication failure."
        
        logging.info(f"Fetching context for post: {post_url}")
        try:
            submission = self.reddit.submission(url=post_url)
            submission.comments.replace_more(limit=0)
            top_comments = sorted(
                [c for c in submission.comments if isinstance(c, praw.models.Comment)],
                key=lambda c: c.score,
                reverse=True
            )[:5]
            comments_summary = "\n".join([f"- {c.body[:200]}..." for c in top_comments])
            full_context = (
                f"Post Title: {submission.title}\n"
                f"Post Body:\n{submission.selftext}\n\n"
                f"--- Top Comments ---\n{comments_summary}"
            )
            return full_context
        except Exception as e:
            logging.error(f"Error fetching context for post {post_url}: {e}", exc_info=True)
            return f"Error fetching context for post {post_url}: {e}"

    def get_profile_stats(self, username: str) -> dict:
        """
        Fetches a public Reddit user's profile stats (karma, age).
        Handles cases where the user might be suspended or does not exist.
        """
        logging.info(f"Fetching Reddit profile stats for username: {username}")
        if not self.reddit:
            return {"error": "Reddit client is not initialized."}
        
        try:
            # Fetch the redditor object
            redditor = self.reddit.redditor(username)

            # --- THIS IS THE FORWARD-LOOKING FIX ---
            # When we need the password later, we'll do this:
            # encrypted_password_string = creds['password_encrypted']
            # encrypted_password_bytes = encrypted_password_string.encode('utf-8')
            # decrypted_password = cipher.decrypt(encrypted_password_bytes).decode()
            
            # Accessing an attribute will trigger the API call and raise an exception if the user doesn't exist.
            # We wrap this in a try block to catch that specific case.
            try:
                account_created_utc = redditor.created_utc
            except Exception as e:
                 # This handles suspended, banned, or non-existent users
                logging.warning(f"Could not fetch profile for u/{username}. They may be suspended or banned. Error: {e}")
                return {"error": f"Could not find or access the Reddit user '{username}'. The account may be suspended, banned, or spelled incorrectly."}

            comment_karma = redditor.comment_karma
            post_karma = redditor.link_karma
            
            account_age_seconds = datetime.now(timezone.utc).timestamp() - account_created_utc
            account_age_days = int(account_age_seconds / (60 * 60 * 24))

            logging.info(f"Successfully fetched stats for Reddit user '{username}': CK={comment_karma}, PK={post_karma}")

            return {
                "username": username,
                "comment_karma": comment_karma,
                "post_karma": post_karma,
                "account_age_days": account_age_days
            }

        except Exception as e:
            logging.error(f"An unexpected error occurred in get_profile_stats for u/{username}: {e}", exc_info=True)
            return {"error": str(e)}

# --- INSTANTIATE OUR TOOLS ---
# We create single instances of our tools to be imported and used by our agent functions.
perplexity_search = PerplexitySearchTool()
reddit_tool = RedditTool()