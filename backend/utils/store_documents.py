from langchain_text_splitters import RecursiveCharacterTextSplitter
from utils.embeddings import generate_embedding
from utils.supabase_client import supabase
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
FILE_PATH = os.path.join(BASE_DIR, "data", "sample.txt")

def ingest_document():
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = splitter.split_text(content)

    ingested_chunks = []

    for chunk in chunks:
        embedding = generate_embedding(chunk)

        data = {
            "content": chunk,
            "embedding": embedding
        }

        supabase.table("documents").insert(data).execute()
        ingested_chunks.append(data)

    return {
        "chunks_stored": len(chunks),
        "chunks": ingested_chunks
    }