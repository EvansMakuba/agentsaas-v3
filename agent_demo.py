import os
import asyncio
import json
import time
import datetime
import praw
from google.adk.agents import Agent
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types

# --- Configuration: Replace with your actual values ---
# Google API Key for Gemini (from https://aistudio.google.com/app/apikey)
os.environ["GOOGLE_API_KEY"] = "YOUR_GOOGLE_API_KEY"  # <--- REPLACE

# Reddit API Credentials (from https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID = "YOUR_REDDIT_CLIENT_ID"  # <--- REPLACE
REDDIT_CLIENT_SECRET = "YOUR_REDDIT_CLIENT_SECRET"  # <--- REPLACE
REDDIT_USER_AGENT = "your_app_name/1.0 by your_username"  # <--- REPLACE

# Keywords for Reddit search (space-separated in query)
KEYWORDS = ["AI ethics", "machine learning bias"]  # Example; replace as needed

# Number of subagents (comments) per post
N_SUBAGENTS = 5

# Limit number of posts to process
MAX_POSTS = 10

# Model to use (from the documentation constants)
MODEL = "gemini-1.5-flash"  # Or "gemini-2.0-flash" if available; adjust as per your access

# Output JSON file
OUTPUT_FILE = "reddit_post_comments.json"

# Personas for subagents (to make comments diverse)
PERSONAS = [
    "funny and sarcastic",
    "helpful and informative",
    "critical and debating",
    "supportive and encouraging",
    "random and off-topic sometimes but relevant"
]

# Ensure personas match N_SUBAGENTS
if len(PERSONAS) < N_SUBAGENTS:
    PERSONAS += ["general and engaging"] * (N_SUBAGENTS - len(PERSONAS))

# --- Helper Function to Call Agent (Adapted from Documentation) ---
async def call_agent_async(query: str, runner, user_id, session_id):
    """Sends a query to the agent and returns the final response text."""
    content = types.Content(role='user', parts=[types.Part(text=query)])
    final_response_text = ""
    async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=content):
        if event.is_final_response():
            if event.content and event.content.parts:
                final_response_text = event.content.parts[0].text.strip()
            break
    return final_response_text

# --- Main Async Function ---
async def main():
    # Setup PRAW
    reddit = praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )

    # Calculate one month ago timestamp
    one_month_ago = time.time() - (30 * 24 * 3600)

    # Search query
    search_query = ' '.join(KEYWORDS)
    print(f"Searching Reddit for: '{search_query}' (posts from last month)")

    # Collect results
    results = []

    # Search Reddit
    submissions = reddit.search(search_query, sort='new', time_filter='month', limit=MAX_POSTS * 2)  # Extra to account for filtering
    post_count = 0
    for submission in submissions:
        if post_count >= MAX_POSTS:
            break
        if submission.created_utc < one_month_ago:
            continue  # Skip older than one month

        title = submission.title
        selftext = submission.selftext
        url = submission.url
        print(f"Processing post: {title} ({url})")

        # Generated comments list
        generated_comments = []

        # Setup ADK Session Service (shared for simplicity, but new session per post)
        session_service = InMemorySessionService()
        app_name = "reddit_comment_generator"
        user_id = "reddit_user"
        session_id = f"post_{submission.id}"  # Unique per post

        # Create session
        await session_service.create_session(app_name=app_name, user_id=user_id, session_id=session_id)

        # Sequentially generate comments with each subagent seeing previous ones
        for i in range(N_SUBAGENTS):
            # Define subagent with persona
            persona = PERSONAS[i]
            comment_agent = Agent(
                name=f"comment_agent_{i+1}",
                model=MODEL,
                description="Generates human-like Reddit comments.",
                instruction=f"You are a Reddit user who is {persona}. "
                            "Generate ONLY a single, unique, human-like top-level comment for the given post. "
                            "Make it engaging and different from any previous comments provided. "
                            "Do not include any extra text, just the comment itself.",
                tools=[],  # No tools needed
            )

            # Create runner for this subagent
            runner = Runner(
                agent=comment_agent,
                app_name=app_name,
                session_service=session_service
            )

            # Build query with post and previous comments
            previous_comments_str = ""
            if generated_comments:
                previous_comments_str = "\nPrevious comments:\n" + "\n".join(
                    [f"Comment {j+1}: {c}" for j, c in enumerate(generated_comments)]
                )
            query = f"Post Title: {title}\nPost Content: {selftext}\n{previous_comments_str}"

            # Call subagent (new session for each subagent to isolate, but query includes history)
            sub_session_id = f"{session_id}_sub_{i+1}"
            await session_service.create_session(app_name=app_name, user_id=user_id, session_id=sub_session_id)
            comment = await call_agent_async(query, runner, user_id, sub_session_id)

            # Append if valid
            if comment:
                generated_comments.append(comment)
            else:
                print(f"Warning: Empty comment from subagent {i+1}")

        # Add to results
        results.append({
            "url": url,
            "title": title,
            "generated_comments": generated_comments
        })

        post_count += 1

    # Save to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)
    print(f"Results saved to {OUTPUT_FILE}")

# --- Run the Script ---
if __name__ == "__main__":
    asyncio.run(main())
