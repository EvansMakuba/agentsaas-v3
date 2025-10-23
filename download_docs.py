import os
from dotenv import load_dotenv
load_dotenv()

documentation = {
    "agent_team":"https://google.github.io/adk-docs/tutorials/agent-team/"
}

from tavily import TavilyClient

tavily_client = TavilyClient(api_key=os.getenv('TAVILY_API_KEY'))

for title in documentation.keys():

    response = tavily_client.extract(f"{documentation[title]}")

    # Save to a text file
    if 'results' in response and len(response['results']) > 0:
        documentation_text = response['results'][0]['raw_content']
        
        with open(f'{title}.txt', 'w', encoding='utf-8') as f:
            f.write(documentation_text)
        
        print("Documentation saved ")
    else:
        print("No results found in response")
