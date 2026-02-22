# RAG Chatbot Application

A retrieval-augmented generation chatbot built with FastAPI and React that allows users to upload PDF documents, process them into a vector database, and query the content using natural language with Google Gemini AI.

## Project Overview

This application implements a question-answering system that retrieves relevant context from uploaded documents and generates accurate responses using large language models. The system consists of a Python backend for document processing and API endpoints, paired with a React frontend for user interaction.

### Key Features

- PDF document upload and automatic text extraction
- Text chunking and embedding generation using sentence transformers
- Vector similarity search for relevant context retrieval
- Integration with Google Gemini for natural language responses
- Real-time chat interface with document context awareness
- Supabase for vector storage and similarity matching

## Technology Stack

### Backend
- FastAPI: Web framework for building REST APIs
- Python 3.12: Core programming language
- Sentence Transformers: Text embedding generation
- Google Gemini: Language model for answer generation
- Supabase: PostgreSQL database with vector extensions
- LangChain: Text splitting and document processing
- PyPDF: PDF text extraction
- Uvicorn: ASGI server

### Frontend
- React 19: User interface framework
- Vite: Build tool and development server
- Axios: HTTP client for API requests
- Tailwind CSS: Utility-first styling
- Lucide React: Icon components
- Framer Motion: Animation library

## Project Structure

```
rag-chatbot/
├── backend/
│   ├── app/
│   │   └── main.py                    # FastAPI application and route definitions
│   ├── utils/
│   │   ├── embeddings.py              # Sentence transformer model and embedding generation
│   │   ├── llm.py                     # Google Gemini client and response generation
│   │   ├── pdf_ingest.py              # PDF processing and chunking logic
│   │   ├── retrieve.py                # Vector similarity search functions
│   │   ├── store_documents.py         # Text file ingestion for sample data
│   │   └── supabase_client.py         # Database connection configuration
│   ├── data/
│   │   └── sample.txt                 # Sample text file for testing
│   ├── requirements.txt               # Python dependencies
│   └── runtime.txt                    # Python version specification
├── frontend/
│   └── RAG-ChatBOT/
│       ├── src/
│       │   ├── Components/
│       │   │   ├── Chat.jsx           # Chat interface component
│       │   │   └── UploadPDF.jsx      # PDF upload component
│       │   ├── App.jsx                # Main application component
│       │   ├── main.jsx               # React entry point
│       │   └── index.css              # Global styles
│       ├── public/                    # Static assets
│       ├── package.json               # Node dependencies
│       ├── vite.config.js             # Vite configuration
│       └── tailwind.config.js         # Tailwind configuration
├── .venv/                             # Python 3.12 virtual environment
└── README.md                          # Project documentation
```

## Component Descriptions

### Backend Components

**main.py**
The central FastAPI application file that defines all API endpoints. It handles CORS configuration, routes for document ingestion, PDF uploads, search queries, and chat interactions. This file imports utility modules for document processing, embeddings, and language model integration.

**embeddings.py**
Manages the sentence transformer model for converting text into numerical vectors. Uses the all-MiniLM-L6-v2 model for efficient and accurate embeddings. The model is loaded once and cached for performance.

**llm.py**
Contains the Google Gemini client configuration and the answer generation logic. Takes retrieved document context and user queries to produce natural language responses using the gemini-2.5-flash model.

**pdf_ingest.py**
Handles PDF file processing by extracting text, splitting it into manageable chunks using recursive character text splitters, generating embeddings, and storing the results in the database. Configured for 800-character chunks with 150-character overlap.

**retrieve.py**
Implements vector similarity search by converting user queries into embeddings and calling the Supabase match_documents function. Returns the top 3 most relevant document chunks based on cosine similarity.

**supabase_client.py**
Establishes the connection to the Supabase database using environment variables for authentication. Provides a shared client instance used throughout the backend.

**store_documents.py**
Processes plain text files from the data directory for initial testing. Splits text into 500-character chunks with 100-character overlap and stores them with embeddings.

### Frontend Components

**App.jsx**
The root component that orchestrates the layout and theme management. Contains the UploadPDF and Chat components with responsive design and styling.

**UploadPDF.jsx**
File upload interface that accepts PDF files, sends them to the backend endpoint, and displays upload status. Includes validation for PDF file types and loading states.

**Chat.jsx**
Interactive chat component that sends user queries to the backend and displays responses. Maintains conversation history and handles loading states during API calls.

## Setup Instructions

### Prerequisites

Before starting, ensure you have the following installed on your system:
- Python 3.12 or higher
- Node.js 18 or higher
- Git for version control
- A Supabase account with a configured project

### Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone <repository-url>
cd rag-chatbot
```

### Step 2: Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cd backend
touch .env
```

Add the following variables to the `.env` file:

```
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

To obtain these credentials:
- Gemini API Key: Visit Google AI Studio and create an API key
- Supabase URL and Key: Found in your Supabase project settings under API

### Step 3: Set Up Supabase Database

Log in to your Supabase project dashboard and run the following SQL to create the necessary table and function:

```sql
-- Create documents table with vector support
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(384) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops);

-- Create function for similarity matching
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(384),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    id BIGINT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        id,
        content,
        1 - (embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;
```

### Step 4: Set Up Backend Environment

Navigate to the project root directory:

```bash
cd ..
```

Create and activate a Python virtual environment:

On Windows:
```bash
python -m venv .venv
.venv\Scripts\activate
```

On macOS or Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

This will install FastAPI, Uvicorn, the Supabase client, sentence transformers, and all other dependencies.

### Step 5: Set Up Frontend Environment

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend/RAG-ChatBOT
```

Install Node.js dependencies:

```bash
npm install
```

This will install React, Vite, Axios, Tailwind CSS, and all other frontend dependencies.

### Step 6: Start the Backend Server

In the terminal with the activated virtual environment:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at http://127.0.0.1:8000

You should see output indicating the server has started successfully. The reload flag enables automatic reloading when code changes are detected.

### Step 7: Start the Frontend Development Server

In the second terminal window:

```bash
cd frontend/RAG-ChatBOT
npm run dev
```

The frontend will be available at http://localhost:5173

Open your web browser and navigate to the provided URL to access the application interface.

## Usage Guide

### Uploading Documents

1. Click the "Choose File" button in the upload section
2. Select a PDF file from your computer
3. Wait for the upload and processing to complete
4. You will see a confirmation message when the document is ready

The system will extract text from the PDF, split it into chunks, generate embeddings, and store everything in the database. This process may take a few moments depending on document size.

### Asking Questions

1. Type your question in the chat input field
2. Press Enter or click the Send button
3. The system will search for relevant document sections
4. A response will be generated based on the retrieved context
5. The answer appears in the chat interface

The chatbot retrieves the most relevant passages from your uploaded documents and uses them to generate accurate, context-aware responses.

### Testing the System

You can test the ingestion endpoint directly using the sample text file:

```bash
curl -X POST http://127.0.0.1:8000/ingest
```

This will process the sample.txt file and store its contents in the database for testing purposes.

## API Endpoints

### GET /
Health check endpoint that returns the server status and confirms whether the Gemini API key is loaded.

**Response:**
```json
{
  "message": "RAG Chatbot Backend Running",
  "gemini_key_loaded": true
}
```

### POST /upload-pdf
Accepts a PDF file upload, processes it, and stores the content in the database.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (PDF file)

**Response:**
```json
{
  "status": "PDF ingested",
  "filename": "document.pdf",
  "response": {
    "chunks_stored": 15
  }
}
```

### POST /ingest
Processes the sample text file from the data directory for testing purposes.

**Response:**
```json
{
  "status": "Document stored",
  "response": {
    "chunks_stored": 8
  }
}
```

### GET /search
Searches for relevant document chunks based on a query string.

**Parameters:**
- query (string): The search query

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "content": "Document chunk text...",
      "similarity": 0.85
    }
  ]
}
```

### GET /chat
Retrieves relevant context and generates an answer to the user query.

**Parameters:**
- query (string): The user's question

**Response:**
```json
{
  "answer": "Based on the documents, the answer is..."
}
```

## Configuration Details

### Environment Variables

**GEMINI_API_KEY**
Your Google Gemini API key for language model access. Required for generating answers to user queries.

**SUPABASE_URL**
The URL of your Supabase project. This is where document embeddings and content are stored.

**SUPABASE_KEY**
The anonymous public key for your Supabase project. Used to authenticate API requests to the database.

### Model Configuration

**Embedding Model**
The system uses the all-MiniLM-L6-v2 model from Sentence Transformers. This model produces 384-dimensional vectors and is optimized for semantic similarity tasks.

**Language Model**
Google Gemini 2.5 Flash is used for answer generation. This model provides fast responses while maintaining high quality output.

**Text Chunking**
- PDF chunks: 800 characters with 150-character overlap
- Text file chunks: 500 characters with 100-character overlap
- Overlap ensures context continuity across chunk boundaries

**Retrieval Settings**
- Match count: 3 chunks per query
- Similarity threshold: 0.2 (minimum cosine similarity)
- These values balance between precision and recall

## Troubleshooting

### Backend Issues

**Import Errors**
If you see module not found errors, ensure your virtual environment is activated and all dependencies are installed:
```bash
pip install -r requirements.txt
```

**Database Connection Errors**
Verify that your Supabase credentials in the .env file are correct. Test the connection by visiting your Supabase dashboard.

**Port Already in Use**
If port 8000 is occupied, change the port in the uvicorn command:
```bash
uvicorn app.main:app --reload --port 8001
```
Remember to update the frontend API URL accordingly.

### Frontend Issues

**API Connection Failures**
Ensure the backend server is running on port 8000. Check that the API URL in the frontend components matches your backend address.

**Build Errors**
Clear the node_modules directory and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

**CORS Errors**
The backend is configured to accept requests from any origin during development. For production, update the allow_origins setting in main.py to specify allowed domains.

## Development Notes

### Adding New Endpoints

To add new API endpoints, edit backend/app/main.py and define new route functions. Follow the existing pattern for error handling and response formatting.

### Modifying the Embedding Model

To use a different embedding model, update the model name in backend/utils/embeddings.py. Ensure the vector dimension in the Supabase schema matches the new model output size.

### Customizing the UI

Frontend styling is handled with Tailwind CSS. Modify the className attributes in the component files or update tailwind.config.js for global theme changes.

### Adjusting Chunk Settings

Chunk size and overlap can be modified in pdf_ingest.py and store_documents.py. Larger chunks provide more context but may reduce retrieval precision.

## Production Deployment

### Backend Deployment

The backend can be deployed to any platform supporting Python applications. Render, Railway, and Fly.io are recommended options. Ensure environment variables are configured in your hosting platform.

### Frontend Deployment

Build the production frontend:
```bash
npm run build
```

The dist directory contains static files that can be deployed to Vercel, Netlify, or any static hosting service. Update API endpoints to point to your production backend URL.

### Security Considerations

- Replace wildcard CORS origins with specific allowed domains
- Use environment variables for all sensitive credentials
- Enable HTTPS for all production traffic
- Implement rate limiting on API endpoints
- Set up database row-level security policies in Supabase

## License

This project is available for use under standard open source terms. Review the LICENSE file for specific details.

## Author

**Om Sudhamsh Padma**

## Support

For questions or issues, please review the troubleshooting section first. Additional support resources include the FastAPI documentation, React documentation, and Supabase guides.