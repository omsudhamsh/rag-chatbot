import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

_genai_client = None

def get_genai_client():
    global _genai_client
    if _genai_client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable must be set")
        _genai_client = genai.Client(api_key=api_key)
    return _genai_client

def generate_answer(context, query):
    try:
        client = get_genai_client()
        prompt = f"""
        Answer ONLY using this context:

        Context:
        {context}

        Question:
        {query}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        return response.text

    except Exception as e:
        return f"LLM Error: {str(e)}"