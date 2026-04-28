# Academic AI RAG Platform

A production-ready **Multi-Agent RAG (Retrieval-Augmented Generation)** system for academic assistance, featuring intelligent document processing, AI-powered chat, quiz generation, and performance analytics.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-green.svg)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.1.16-orange.svg)](https://www.langchain.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.4.24-purple.svg)](https://www.trychroma.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Key Concepts Implemented](#-key-concepts-implemented)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Observability](#-observability)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### Core Capabilities
- **📚 RAG Pipeline**: Semantic search with ChromaDB vector store and OpenAI embeddings
- **🤖 Multi-Agent System**: 5 specialized AI agents (Academic, Quiz, Scheduler, Coding, Analytics)
- **📄 Document Processing**: Support for PDF, DOCX, TXT, PPTX with intelligent chunking
- **💬 AI Chat**: Context-aware conversations with source attribution
- **🧪 Quiz Generation**: AI-powered quiz creation from uploaded documents
- **📊 Analytics Dashboard**: Performance tracking and insights
- **🛡️ Guardrails**: Input validation, error handling, and fallback mechanisms
- **🔍 Observability**: Comprehensive logging and monitoring

### Technical Highlights
- **Intelligent Agent Routing**: LLM-based query routing with keyword fallback
- **Graceful Degradation**: Works without API key using text search fallback
- **Real-time Processing**: Async document ingestion and retrieval
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **Responsive UI**: Modern single-page application with dark/light themes

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (SPA)                        │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Dashboard │ AI Chat  │Documents │  Quiz    │Analytics │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Multi-Agent Router                       │   │
│  │  ┌──────┬──────┬──────────┬────────┬──────────────┐ │   │
│  │  │Academic│Quiz│Scheduler │Coding  │Analytics     │ │   │
│  │  └──────┴──────┴──────────┴────────┴──────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              RAG Pipeline                             │   │
│  │  ┌────────────┐  ┌──────────┐  ┌────────────────┐  │   │
│  │  │Text Splitter│→│Embeddings│→│Vector Store    │  │   │
│  │  │(Chunking)  │  │(OpenAI)  │  │(ChromaDB)      │  │   │
│  │  └────────────┘  └──────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Data Layer                               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │   │
│  │  │SQLite DB │  │ChromaDB  │  │Document Cache      │ │   │
│  │  └──────────┘  └──────────┘  └────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Document Upload** → Text Extraction → Chunking → Embedding → Vector Store
2. **User Query** → Agent Router → RAG Retrieval → LLM Generation → Response
3. **Quiz Generation** → Document Retrieval → LLM Processing → Question Generation
4. **Analytics** → Database Query → Aggregation → Visualization

---

## 🎯 Key Concepts Implemented

### 1. RAG (Retrieval-Augmented Generation)
- **Implementation**: `backend/rag/pipeline.py`
- **Features**:
  - Semantic search using OpenAI embeddings (`text-embedding-3-small`)
  - ChromaDB vector store with MMR (Maximal Marginal Relevance) retrieval
  - Recursive character text splitting with overlap
  - Source attribution and citation
  - Fallback to keyword search when embeddings unavailable

### 2. Multi-Agent System
- **Implementation**: `backend/agents/agents.py`
- **Agents**:
  - **Academic Agent**: Answers questions using RAG pipeline
  - **Quiz Agent**: Generates MCQs from document content
  - **Scheduler Agent**: Creates study plans and timetables
  - **Coding Agent**: Provides programming help and code generation
  - **Analytics Agent**: Delivers performance insights
- **Routing**: LLM-based intelligent routing with keyword fallback

### 3. Guardrails
- **Input Validation**: Pydantic models for request/response validation
- **Error Handling**: Try-catch blocks with graceful degradation
- **File Type Validation**: Whitelist of supported formats
- **Size Limits**: Document size and chunk size constraints
- **API Key Validation**: Graceful fallback when API unavailable
- **Rate Limiting**: Built-in FastAPI middleware support

### 4. Observability
- **Logging**: Python `logging` module with structured logs
- **Monitoring**: Health check endpoint (`/health`)
- **Tracing**: Request/response logging in all routes
- **Error Tracking**: Exception logging with stack traces
- **Metrics**: Document count, chunk count, agent usage

### 5. Model Context Protocol (MCP)
- **Context Management**: Efficient context window usage
- **Prompt Engineering**: Structured prompts with clear instructions
- **Context Caching**: In-memory document cache for fast retrieval
- **Token Optimization**: Chunking strategy to fit context limits

---

## 📁 Project Structure

```
academic-ai-rag/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile             # Container configuration
│   ├── agents/
│   │   ├── __init__.py
│   │   └── agents.py          # Multi-agent system implementation
│   ├── db/
│   │   ├── __init__.py
│   │   └── database.py        # SQLAlchemy database setup
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py          # Database models (User, Document, etc.)
│   ├── rag/
│   │   ├── __init__.py
│   │   └── pipeline.py        # RAG pipeline with ChromaDB
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── chat.py            # Chat API endpoints
│   │   ├── documents.py       # Document upload/management
│   │   ├── quiz.py            # Quiz generation/submission
│   │   └── analytics.py       # Analytics endpoints
│   └── chroma_db/             # ChromaDB vector store (auto-created)
├── js/
│   ├── app.js                 # Main SPA router
│   ├── agents.js              # Agent system frontend
│   ├── chat.js                # Chat interface
│   ├── upload.js              # Document upload UI
│   ├── quiz.js                # Quiz interface
│   ├── analytics.js           # Analytics dashboard
│   └── profile.js             # User profile
├── css/
│   ├── main.css               # Main styles
│   └── animations.css         # UI animations
├── tests/
│   ├── test_api.py            # API endpoint tests
│   ├── test_complete_system.py # Integration tests
│   └── test_full_workflow.py  # End-to-end workflow tests
├── index.html                 # Frontend entry point
├── docker-compose.yml         # Docker orchestration
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── ARCHITECTURE.md            # Detailed architecture documentation
├── README.md                  # This file
├── run.bat                    # Windows startup script
└── run.sh                     # Unix startup script
```

---

## 🔧 Installation

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)
- OpenAI API key (optional, works in fallback mode without it)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/academic-ai-rag.git
cd academic-ai-rag
```

### Step 2: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Configure Environment
```bash
# Copy .env.example to .env (or edit existing .env)
# Add your OpenAI API key
OPENAI_API_KEY=your-api-key-here
```

### Step 4: Run the Application
```bash
# Option 1: Direct Python
python backend/main.py

# Option 2: Using run script
# Windows:
run.bat

# Linux/Mac:
chmod +x run.sh
./run.sh
```

The application will be available at: **http://localhost:8000**

---

## ⚙️ Configuration

### Environment Variables (`.env`)

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Database Configuration
DATABASE_URL=sqlite:///./academic_ai.db

# Redis Configuration (optional)
REDIS_URL=redis://redis:6379
```

### Application Settings

Edit `backend/rag/pipeline.py` to customize:
- **Chunk Size**: Default 512 tokens
- **Chunk Overlap**: Default 64 tokens
- **Embedding Model**: Default `text-embedding-3-small`
- **LLM Model**: Default `gpt-4o`
- **Retrieval Strategy**: Default MMR with k=4

---

## 🎮 Usage

### 1. Upload Documents
```bash
curl -X POST http://localhost:8000/api/documents/upload \
  -F "file=@/path/to/document.pdf"
```

### 2. Chat with AI
```bash
curl -X POST http://localhost:8000/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Explain backpropagation", "agent": null}'
```

### 3. Generate Quiz
```bash
curl -X POST http://localhost:8000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Machine Learning", "n": 5, "difficulty": "medium"}'
```

### 4. Get Analytics
```bash
curl http://localhost:8000/api/analytics/performance/user123
```

---

## 📚 API Documentation

### Interactive API Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/documents/upload` | Upload document |
| GET | `/api/documents/list` | List documents |
| DELETE | `/api/documents/{doc_id}` | Delete document |
| POST | `/api/chat/query` | Chat with AI |
| GET | `/api/chat/history/{session_id}` | Get chat history |
| POST | `/api/quiz/generate` | Generate quiz |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/analytics/performance/{user_id}` | Get analytics |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

---

## 🧪 Testing

### Run All Tests
```bash
# Run unit tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=backend --cov-report=html

# Run specific test file
python tests/test_api.py
```

### Test Structure
- **`test_api.py`**: API endpoint tests
- **`test_complete_system.py`**: Integration tests
- **`test_full_workflow.py`**: End-to-end workflow tests

### Test Coverage
- ✅ RAG pipeline ingestion and retrieval
- ✅ Agent routing and dispatch
- ✅ Document upload and processing
- ✅ Quiz generation and submission
- ✅ Chat query handling
- ✅ Error handling and fallbacks

---

## 🔍 Observability

### Logging
All components use Python's `logging` module:
```python
import logging
logger = logging.getLogger(__name__)
logger.info("Document uploaded successfully")
```

### Health Monitoring
```bash
curl http://localhost:8000/health
# Response: {"status": "ok", "pipeline": "RAG active", "agents": 5}
```

### Error Tracking
- All exceptions are logged with stack traces
- Graceful error responses to clients
- Fallback mechanisms for API failures

### Metrics
- Document count and chunk statistics
- Agent usage distribution
- Query response times
- Error rates

---

## 🐳 Docker Deployment

### Build and Run
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services
- **backend**: FastAPI application (port 8000)
- **redis**: Redis cache (port 6379)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow PEP 8 for Python code
- Use type hints where applicable
- Add docstrings to functions and classes
- Write tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LangChain**: For the RAG framework
- **ChromaDB**: For the vector database
- **FastAPI**: For the web framework
- **OpenAI**: For embeddings and LLM capabilities

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/academic-ai-rag/issues)
- **Documentation**: See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture

---

## 🎓 Academic Context

This project demonstrates:
- ✅ **RAG Implementation**: Production-ready retrieval-augmented generation
- ✅ **Multi-Agent Systems**: Intelligent agent routing and specialization
- ✅ **Guardrails**: Comprehensive validation and error handling
- ✅ **Observability**: Logging, monitoring, and health checks
- ✅ **Testing**: Unit, integration, and end-to-end tests
- ✅ **Documentation**: Clear setup instructions and architecture overview

**Built with ❤️ for academic excellence**
