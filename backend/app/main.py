from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from utils.store_documents import ingest_document
from utils.retrieve import retrieve_docs
from utils.llm import generate_answer

# --------------------
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
@app.get("/")
def home():
    return {
        "message": "RAG Chatbot Backend Running",
        "gemini_key_loaded": api_key is not None
        }
@app.post("/ingest")
def ingest():
    try:
        response = ingest_document()
        return {"status": "Document stored", "response": response}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ingesting document: {str(e)}")
@app.get("/search")
def search(query: str):
    docs = retrieve_docs(query)
    return {"results": docs}

@app.get("/chat")
def chat(query: str):
    docs = retrieve_docs(query)

    if not docs:
        return {"answer": "No relevant data found."}

    context = "\n".join([doc["content"] for doc in docs])

    answer = generate_answer(context, query)

    return {"answer": answer}