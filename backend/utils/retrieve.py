from utils.embeddings import generate_embedding
from utils.supabase_client import supabase

def retrieve_docs(query: str):
    query_embedding = generate_embedding(query)

    response = supabase.rpc(
        "match_documents",
        {
            "query_embedding": query_embedding,
            "match_threshold": 0.2,
            "match_count": 3,
        },
    ).execute()

    return response.data