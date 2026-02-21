import os
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from utils.embeddings import generate_embedding
from utils.supabase_client import supabase


def ingest_pdf(file_path):
    # Read PDF
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text() + "\n"

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
    )

    chunks = splitter.split_text(text)

    # Store embeddings
    for chunk in chunks:
        embedding = generate_embedding(chunk)

        data = {
            "content": chunk,
            "embedding": embedding,
        }

        supabase.table("documents").insert(data).execute()

    return {"chunks_stored": len(chunks)}