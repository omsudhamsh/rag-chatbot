from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "RAG Chatbot Backend Running",
        "gemini_key_loaded": api_key is not None
        }