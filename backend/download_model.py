from sentence_transformers import SentenceTransformer
import os

print("Pre-downloading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model downloaded successfully!")
