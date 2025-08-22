import os
import logging
from openai import OpenAI
from dotenv import load_dotenv

# It's good practice to load environment variables at the top of the module.
load_dotenv()

# --- Client Initialization ---
# It's better to initialize the client only if the API key exists.
# This prevents errors on startup if the key is missing.
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    logging.warning("GEMINI_API_KEY not found in environment. Agent functions will not work.")
    client = None
else:
    client = OpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

# =====================================================================================
# AGENT FUNCTIONS
# =====================================================================================

def run_research_analyst(objective: str, subreddits: list[str], posts_data: str) -> str:
    """
    This function embodies the 'Research Analyst' agent.
    It takes the campaign goals and raw post data, and uses an LLM
    to select the single best post to engage with.
    """
    # Check if the client was initialized successfully.
    if not client:
        return "Error: Gemini client not initialized. Check API key."

    # It's good practice to put the core instructions in a system prompt.
    system_prompt = (
        "You are an expert Reddit Research Analyst. Your goal is to find the single best engagement opportunity from the provided data. "
        "Analyze the posts based on the campaign objective. Your final answer MUST be only the URL of the single best post."
    )
    
    user_prompt = f"""
    Campaign Objective: "{objective}"
    Target Subreddits: {', '.join(subreddits)}

    You have scanned the subreddits and found the following recent, engaging posts:
    --- POST DATA ---
    {posts_data}
    --- END POST DATA ---

    Based on the campaign objective, which ONE post is the most relevant and provides the best opportunity for a valuable, authentic comment?
    Return only the URL.
    """

    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2, # Low temperature for analytical, deterministic tasks
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error in run_research_analyst LLM call: {e}", exc_info=True)
        return f"Error: LLM call failed. Details: {e}"


def run_creative_writer(objective: str, post_context: str) -> str:
    """
    This function embodies the 'Creative Writer' agent.
    It takes the campaign objective and the context of a specific post
    and generates a high-quality comment.
    """
    if not client:
        return "Error: Gemini client not initialized. Check API key."

    system_prompt = (
        "You are an expert Reddit Content Writer, a master of authentic, engaging communication. "
        "Your task is to write a comment for the provided Reddit post context. "
        "Your comment MUST be authentic, add value to the discussion, and subtly align with the strategic objective. "
        "IMPORTANT: You are writing for a Tier 1 Executor. DO NOT mention any brand names or products. Your goal is to build trust and be helpful. "
        "Keep the tone conversational and natural for the subreddit. Your final answer is ONLY the text of the comment itself."
    )
    
    user_prompt = f"""
    The strategic objective of our campaign is: "{objective}"

    --- POST CONTEXT TO COMMENT ON ---
    {post_context}
    --- END POST CONTEXT ---

    Now, write the comment.
    """
    
    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7, # Higher temperature for more creative, human-like responses
            extra_body={"reasoning_effort": "high"} # Use high reasoning effort for quality
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error in run_creative_writer LLM call: {e}", exc_info=True)
        return f"Error: LLM call failed. Details: {e}"