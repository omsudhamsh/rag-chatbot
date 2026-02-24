# RAG Chatbot Application

A retrieval-augmented generation chatbot that lets you upload PDFs and ask questions using Google Gemini AI. Built with FastAPI backend and React frontend.

## Quick Overview

Upload a PDF, ask questions, get answers based on your document content. The system extracts text, converts it to vectors, stores them in a database, and retrieves relevant context to generate accurate responses.

## Tech Stack

**Backend:** FastAPI, Python 3.12, Sentence Transformers, Google Gemini, Supabase, Uvicorn
**Frontend:** React 19, Vite, Axios, Tailwind CSS

## Folder Structure

```
rag-chatbot/
├── backend/
│   ├── app/
│   │   └── main.py                  # FastAPI routes
│   ├── utils/
│   │   ├── embeddings.py            # Text to vector conversion
│   │   ├── llm.py                   # Gemini AI integration
│   │   ├── pdf_ingest.py            # PDF processing
│   │   ├── retrieve.py              # Vector search
│   │   ├── store_documents.py       # Document storage
│   │   └── supabase_client.py       # Database connection
│   ├── data/                        # Data directory
│   ├── models/                      # Model files
│   ├── routes/                      # API routes
│   ├── requirements.txt
│   └── runtime.txt
├── frontend/
│   └── RAG-ChatBOT/
│       ├── src/
│       │   ├── Components/
│       │   │   ├── Chat.jsx         # Chat interface
│       │   │   └── UploadPDF.jsx    # PDF upload
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   ├── App.css
│       │   └── index.css
│       ├── public/                  # Static assets
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       └── eslint.config.js
├── data/
│   └── sample.txt                   # Sample data
├── docs/                            # Documentation
├── .venv/                           # Python environment
├── LICENSE
├── README.md
└── render.yaml
```

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 18+
- Supabase account
- Google Gemini API key

### Step 1: Clone and Install

```bash
git clone https://github.com/omsudhamsh/rag-chatbot.git
cd rag-chatbot
```

### Step 2: Setup Supabase

In Supabase SQL editor, run:

```sql
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(384), match_threshold FLOAT, match_count INT
) RETURNS TABLE (id BIGINT, content TEXT, similarity FLOAT) AS $$
    SELECT id, content, 1 - (embedding <=> query_embedding) AS similarity
    FROM documents WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC LIMIT match_count;
$$ LANGUAGE SQL;
```

### Step 3: Backend Setup

```bash
cd backend

# Create environment file
echo "GEMINI_API_KEY=your_key_here" > .env
echo "SUPABASE_URL=your_url" >> .env
echo "SUPABASE_KEY=your_key" >> .env

# Create virtual environment
python -m venv .venv

# Windows activation
.venv\Scripts\activate
# Mac/Linux activation
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --port 8000
```

Backend runs at http://127.0.0.1:8000

### Step 4: Frontend Setup

In a new terminal:

```bash
cd frontend/RAG-ChatBOT
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## How to Use

1. **Upload PDF:** Click "Choose File" and select a PDF document
2. **Ask Questions:** Type a question in the chat box
3. **Get Answers:** The system retrieves relevant sections and generates responses using Gemini AI

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/health` | GET | Simple health status |
| `/upload-pdf` | POST | Upload and process PDF |
| `/search` | GET | Search documents (query param) |
| `/chat` | GET | Get AI response (query param) |

## Environment Variables

```
GEMINI_API_KEY          # Google Gemini API key
SUPABASE_URL            # Supabase project URL
SUPABASE_KEY            # Supabase anonymous key
```

## Common Issues

**Port 8000 in use?**
```bash
uvicorn app.main:app --reload --port 8001
```

**Module not found?**
```bash
pip install -r requirements.txt
```

**Database connection error?**
Check your .env file has correct Supabase credentials

**CORS errors?**
Backend is configured for all origins in development. For production, update CORS in main.py

**Model weights downloading?**
First run downloads the embedding model. This is normal and happens only once.

## License

This project is available for use under standard open source terms. Review the LICENSE file for specific details.

## Author

**Om Sudhamsh Padma**

## Support

For questions or issues, please review the troubleshooting section first. Additional support resources include the FastAPI documentation, React documentation, and Supabase guides.
