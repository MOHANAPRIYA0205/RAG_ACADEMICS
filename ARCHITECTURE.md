# 🔄 AcademicAI Workflow Diagrams

## 📊 User Flow

```
┌─────────────────────────────────────────────────────┐
│           AcademicAI Platform                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. USER ARRIVES                                    │
│     ↓                                               │
│     http://localhost:8000                           │
│     ↓                                               │
│     ┌────────────────────────────────┐             │
│     │  Dashboard                      │             │
│     │  - Welcome message              │             │
│     │  - Quick start guide            │             │
│     │  - Recent activities            │             │
│     └──────┬──────────────────────────┘             │
│            ↓                                        │
│     ┌──────────────────────────┐                    │
│     │ SELECT ACTION            │                    │
│     ├──────────────────────────┤                    │
│     │ • Chat (RAG Q&A)         │                    │
│     │ • Upload Documents       │                    │
│     │ • Generate Quiz          │                    │
│     │ • View Analytics         │                    │
│     │ • Profile Settings       │                    │
│     └──────────────────────────┘                    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Document Upload & Query Flow

```
USER UPLOADS DOCUMENT
     ↓
┌─────────────────────────────────────────┐
│ Frontend: Upload Form                   │
│ (index.html → js/upload.js)            │
└──────────┬──────────────────────────────┘
           ↓ POST /api/documents/upload
┌─────────────────────────────────────────┐
│ Backend: Document Route                 │
│ (routes/documents.py)                   │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Extract Text                            │
│ - PDF: PyMuPDF (fitz)                  │
│ - DOCX: python-docx                     │
│ - TXT: UTF-8 decode                     │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ RAG Pipeline (rag/pipeline.py)         │
│ - Split into chunks (512 tokens)        │
│ - Generate embeddings (OpenAI)          │
│ - Store in ChromaDB                     │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Store Metadata in SQLite                │
│ - Filename, doc_id, chunk_count         │
│ - Upload timestamp                      │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Return: {"status": "indexed", ...}      │
│ Frontend: Show success message          │
└─────────────────────────────────────────┘

═══════════════════════════════════════════

USER ASKS A QUESTION
     ↓
┌─────────────────────────────────────────┐
│ Frontend: Chat Interface                │
│ (index.html → js/chat.js)              │
└──────────┬──────────────────────────────┘
           ↓ POST /api/chat/query
┌─────────────────────────────────────────┐
│ Backend: Chat Route                     │
│ (routes/chat.py)                        │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Agent Router (agents/agents.py)         │
│ - Analyze query intent                  │
│ - Route to appropriate agent            │
│ - Selected: AcademicAgent               │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ RAG Query Pipeline                      │
│ 1. Embed user question (OpenAI)         │
│ 2. Search ChromaDB (MMR search)         │
│ 3. Retrieve top-4 relevant chunks       │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ LLM Processing (GPT-4o)                 │
│ Input: Question + Retrieved Context     │
│ Output: Structured Answer               │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Format Response                         │
│ - Main answer                           │
│ - Source documents                      │
│ - Confidence score                      │
│ - Follow-up suggestions                 │
└──────────┬──────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Return: {"answer": "...", "sources": []}│
│ Frontend: Render with markdown & sources│
└─────────────────────────────────────────┘
```

---

## 🎓 Quiz Generation Flow

```
USER SELECTS: Generate Quiz
     ↓
┌──────────────────────────────────┐
│ Frontend Form                    │
│ - Topic input                    │
│ - Number of questions (1-10)     │
│ - Difficulty (easy/medium/hard)  │
└──────────┬───────────────────────┘
           ↓ POST /api/quiz/generate
┌──────────────────────────────────┐
│ Backend: Quiz Route              │
│ (routes/quiz.py)                 │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ Agent: QuizAgent                 │
│ (agents/agents.py)               │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ RAG Query for Topic Context      │
│ Search ChromaDB for relevant docs│
│ Retrieve key concepts            │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ LLM: Generate Questions          │
│ Input: Topic + Context + Config  │
│ Output: MCQ JSON                 │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ Format Quiz                      │
│ [{                               │
│   "question": "...",             │
│   "options": ["A","B","C","D"],  │
│   "correct": 0,                  │
│   "explanation": "..."           │
│ }]                               │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ Frontend: Display Quiz           │
│ - Show questions one by one      │
│ - Track answers                  │
│ - Allow submission               │
└──────────┬───────────────────────┘
           ↓
USER SUBMITS ANSWERS
           ↓
┌──────────────────────────────────┐
│ Frontend: Calculate Score        │
│ - Compare with correct answers   │
│ - Calculate percentage           │
│ - Award XP points                │
└──────────┬───────────────────────┘
           ↓ POST /api/quiz/submit
┌──────────────────────────────────┐
│ Backend: Process Results         │
│ - Store in database              │
│ - Update user stats              │
│ - Return feedback                │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ Frontend: Show Results           │
│ - Score & percentage             │
│ - Explanations for wrong answers │
│ - Performance insights           │
│ - Continue learning              │
└──────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                       │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Browser Interface                                      │
│  ┌──────────────┐                                       │
│  │  index.html  │ + CSS + JavaScript                   │
│  │  (Single     │   (Styling + Interactivity)          │
│  │   Page App)  │                                       │
│  └──────────────┘                                       │
│                                                         │
│  JavaScript Modules:                                    │
│  • app.js (SPA Router)                                  │
│  • chat.js (Chat Logic)                                │
│  • upload.js (File Upload)                             │
│  • quiz.js (Quiz Interface)                            │
│  • analytics.js (Dashboard)                            │
│  • rag.js (RAG Queries)                                │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │ HTTP/REST API
┌────────────▼────────────────────────────────────────────┐
│              API/BACKEND LAYER (FastAPI)               │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Routes (API Endpoints)                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ /api/    │  │ /api/    │  │ /api/    │             │
│  │ auth     │  │ chat     │  │ documents│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  ┌──────────┐  ┌──────────┐                            │
│  │ /api/    │  │ /api/    │                            │
│  │ quiz     │  │ analytics│                            │
│  └──────────┘  └──────────┘                            │
│                                                         │
│  Multi-Agent System                                    │
│  ┌─────────────────────────────────┐                   │
│  │ Agent Router (LLM-based)        │                   │
│  │ - Analyze request               │                   │
│  │ - Route to appropriate agent    │                   │
│  └────────┬────────────────────────┘                   │
│           │                                             │
│  ┌────────┴─────────────────────────┐                  │
│  │                                  │                  │
│  ├────────────────────────────────┐ │                  │
│  │ Agents:                        │ │                  │
│  │ • Academic Agent (RAG Q&A)    │ │                  │
│  │ • Quiz Agent                  │ │                  │
│  │ • Scheduler Agent             │ │                  │
│  │ • Coding Agent                │ │                  │
│  │ • Analytics Agent             │ │                  │
│  └────────────────────────────────┘ │                  │
│                                      │                  │
│  RAG Pipeline                                           │
│  ┌──────────────────────────────────┐                  │
│  │ LangChain + OpenAI               │                  │
│  │ • Text Splitting                 │                  │
│  │ • Embedding Generation           │                  │
│  │ • Retrieval (ChromaDB)           │                  │
│  │ • LLM Response Generation        │                  │
│  └──────────────────────────────────┘                  │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│              DATA LAYER                                │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌──────────────┐                │
│  │  SQLite DB      │  │  ChromaDB    │                │
│  │  (Structured)   │  │  (Vectors)   │                │
│  │                 │  │              │                │
│  │ • Users         │  │ • Embeddings │                │
│  │ • Documents     │  │ • Chunks     │                │
│  │ • Chat Sessions │  │ • Metadata   │                │
│  │ • Quiz Results  │  │              │                │
│  └─────────────────┘  └──────────────┘                │
│                                                         │
│  ┌──────────────────┐                                  │
│  │  Redis Cache     │                                  │
│  │  (Optional)      │                                  │
│  │                  │                                  │
│  │ • Session Cache  │                                  │
│  │ • Query Cache    │                                  │
│  └──────────────────┘                                  │
│                                                         │
└────────────┬────────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────────┐
│          EXTERNAL SERVICES                             │
├────────────────────────────────────────────────────────┤
│                                                         │
│  OpenAI API                                             │
│  • GPT-4o (LLM)                                         │
│  • text-embedding-3-small (Embeddings)                 │
│                                                         │
└────────────────────────────────────────────────────────┘
```

---

## 🔄 Request-Response Cycle

```
┌─────────────────────────────────────────────────────┐
│ USER INTERACTION                                    │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │ Frontend (JS)   │
    │ - Capture input │
    │ - Validate data │
    │ - Show loading  │
    └────────┬────────┘
             │
    ┌────────▼──────────────────────┐
    │ HTTP Request                  │
    │ POST /api/chat/query          │
    │ {                             │
    │   "query": "...",             │
    │   "agent": null,              │
    │   "history": [...]            │
    │ }                             │
    └────────┬──────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ Backend (FastAPI)           │
    │ - Parse request             │
    │ - Validate input            │
    │ - Call appropriate route    │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ Route Handler               │
    │ (routes/chat.py)            │
    │ - Process business logic    │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ Agent System                │
    │ - Route query               │
    │ - Select agent              │
    │ - Prepare context           │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ RAG Pipeline                │
    │ - Query embeddings          │
    │ - Search ChromaDB           │
    │ - Get top chunks            │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ LLM Call (OpenAI)           │
    │ - Prepare prompt            │
    │ - Include context           │
    │ - Generate response         │
    └────────┬────────────────────┘
             │
    ┌────────▼────────────────────┐
    │ Format Response             │
    │ - Extract answer            │
    │ - Add metadata              │
    │ - Structure JSON            │
    └────────┬────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ HTTP Response                 │
    │ 200 OK                        │
    │ {                             │
    │   "answer": "...",            │
    │   "sources": [...],           │
    │   "agent": "academic"         │
    │ }                             │
    └────────┬──────────────────────┘
             │
    ┌────────▼────────────┐
    │ Frontend (JS)       │
    │ - Parse response    │
    │ - Render answer     │
    │ - Show sources      │
    │ - Hide loading      │
    └────────┬────────────┘
             │
    ┌────────▼────────────────────┐
    │ USER SEES ANSWER            │
    │ - With citations            │
    │ - Professional formatting   │
    │ - Action buttons            │
    └────────────────────────────┘
```

---

## 🎯 Technology Stack

```
Frontend
├─ HTML5
├─ CSS3 (with animations)
└─ JavaScript ES6+
   ├─ Chart.js (analytics)
   └─ Marked.js (markdown)

Backend
├─ FastAPI 0.110
├─ Uvicorn (ASGI server)
└─ Python 3.11+

AI/ML
├─ LangChain (orchestration)
├─ OpenAI API (LLM + embeddings)
└─ ChromaDB (vector store)

Database
├─ SQLite (relational data)
├─ ChromaDB (vector DB)
└─ Redis (caching, optional)

Deployment
├─ Docker (containerization)
└─ Docker Compose (orchestration)
```

---

## 📈 Data Flow Summary

```
User Input 
    ↓
Frontend (HTML/CSS/JS)
    ↓
FastAPI Backend
    ↓
Route Handler
    ↓
Agent System
    ↓
RAG Pipeline
    ↓
LLM (OpenAI)
    ↓
Database (SQLite/ChromaDB)
    ↓
Backend Response
    ↓
Frontend Display
    ↓
User Output
```

---

This is your complete technical architecture. Each component works together to provide an intelligent, responsive academic assistant! 🚀
