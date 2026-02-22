from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from utils.store_documents import ingest_document
from utils.pdf_ingest import ingest_pdf
from utils.retrieve import retrieve_docs
from utils.llm import generate_answer

# --------------------
from dotenv import load_dotenv
import os
import tempfile

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

@app.get("/health")
def health_check():
    """Simple health check that doesn't require external services"""
    return {"status": "healthy", "service": "rag-chatbot-api"}

@app.post("/ingest")
def ingest():
    try:
        response = ingest_document()
        return {"status": "Document stored", "response": response}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ingesting document: {str(e)}")


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    suffix = os.path.splitext(file.filename)[1] or ".pdf"

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        response = ingest_pdf(temp_path)
        return {"status": "PDF ingested", "filename": file.filename, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ingesting PDF: {str(e)}")
    finally:
        try:
            if "temp_path" in locals() and os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass

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