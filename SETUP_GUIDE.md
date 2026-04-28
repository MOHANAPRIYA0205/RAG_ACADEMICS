# Setup Guide - Academic AI RAG Platform

Complete step-by-step guide to set up and run the Academic AI RAG Platform.

---

## 📋 Prerequisites

### Required
- **Python**: 3.11 or higher
- **pip**: Python package manager
- **Git**: Version control

### Optional
- **Docker**: For containerized deployment
- **OpenAI API Key**: For full AI features (works in fallback mode without it)

---

## 🚀 Installation Methods

### Method 1: Local Installation (Recommended for Development)

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/academic-ai-rag.git
cd academic-ai-rag
```

#### Step 2: Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

#### Step 4: Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=your-api-key-here
```

#### Step 5: Run the Application
```bash
# Windows
python backend/main.py

# Linux/Mac
python3 backend/main.py
```

The application will be available at: **http://localhost:8000**

---

### Method 2: Docker Installation

#### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/academic-ai-rag.git
cd academic-ai-rag
```

#### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

#### Step 3: Build and Run with Docker Compose
```bash
docker-compose up -d
```

#### Step 4: Access the Application
- **Frontend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

#### Stop the Application
```bash
docker-compose down
```

---

## ⚙️ Configuration

### Environment Variables

Edit `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Database Configuration
DATABASE_URL=sqlite:///./academic_ai.db

# Redis Configuration (optional)
REDIS_URL=redis://redis:6379
```

### Getting OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key and paste it in `.env`

**Note**: The application works in fallback mode without an API key, using text search and templates.

---

## 🧪 Verification

### 1. Check Server Health
```bash
# Windows PowerShell
Invoke-RestMethod -Uri http://localhost:8000/health

# Linux/Mac
curl http://localhost:8000/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "pipeline": "RAG active",
  "agents": 5
}
```

### 2. Access Web Interface
Open your browser and navigate to:
- **Main App**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 3. Run Tests
```bash
# Install test dependencies
pip install -r requirements-dev.txt

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=backend --cov-report=html
```

---

## 📁 Project Structure After Setup

```
academic-ai-rag/
├── backend/
│   ├── main.py                 # ✅ Server entry point
│   ├── chroma_db/              # 🔄 Created on first document upload
│   └── academic_ai.db          # 🔄 Created on first run
├── venv/                       # 🔄 Virtual environment (if created)
├── .env                        # ⚙️ Your configuration
└── ...
```

---

## 🎯 First Steps After Setup

### 1. Upload a Document
1. Open http://localhost:8000
2. Click **"Documents"** in the sidebar
3. Upload a PDF, DOCX, or TXT file
4. Wait for "✅ Indexed" status

### 2. Chat with AI
1. Click **"AI Chat"** in the sidebar
2. Type: "Summarize the uploaded document"
3. Press Enter
4. See AI response with sources

### 3. Generate a Quiz
1. Click **"Quiz Engine"** in the sidebar
2. Select topic and difficulty
3. Click "Generate AI Quiz"
4. Take the quiz!

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution:**
```bash
pip install -r backend/requirements.txt
```

### Issue: Port 8000 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Issue: ChromaDB warnings
**Solution:** These warnings are harmless and can be ignored:
```
Failed to send telemetry event ClientStartEvent...
```

### Issue: OpenAI API quota exceeded
**Solution:** The app works in fallback mode. For full features:
1. Get a new API key from https://platform.openai.com/api-keys
2. Update `.env` file
3. Restart the server

### Issue: Database locked
**Solution:**
```bash
# Stop the server (Ctrl+C)
# Delete the database file
rm backend/academic_ai.db
# Restart the server
python backend/main.py
```

### Issue: Permission denied on Linux/Mac
**Solution:**
```bash
chmod +x run.sh
./run.sh
```

---

## 🔧 Advanced Configuration

### Custom Port
Edit `backend/main.py`:
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
```

### Custom Database
Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### Custom Embedding Model
Edit `backend/rag/pipeline.py`:
```python
self.embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
```

### Custom LLM Model
Edit `backend/rag/pipeline.py`:
```python
self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.1)
```

---

## 📊 Performance Optimization

### 1. Increase Chunk Size
Edit `backend/rag/pipeline.py`:
```python
self.splitter = RecursiveCharacterTextSplitter(
    chunk_size=1024,  # Increase from 512
    chunk_overlap=128,  # Increase from 64
)
```

### 2. Enable Redis Caching
```bash
# Install Redis
# Windows: Download from https://redis.io/download
# Linux: sudo apt-get install redis-server
# Mac: brew install redis

# Start Redis
redis-server

# Update .env
REDIS_URL=redis://localhost:6379
```

### 3. Use Production Server
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## 🔒 Security Considerations

### 1. Protect API Keys
- Never commit `.env` to Git
- Use environment variables in production
- Rotate keys regularly

### 2. Enable HTTPS
Use a reverse proxy like Nginx:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
    }
}
```

### 3. Add Authentication
Implement JWT authentication in `backend/routes/auth.py`

---

## 📞 Getting Help

- **Documentation**: See [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues**: https://github.com/yourusername/academic-ai-rag/issues
- **Discussions**: https://github.com/yourusername/academic-ai-rag/discussions

---

## ✅ Setup Complete!

Your Academic AI RAG Platform is now ready to use.

**Next Steps:**
1. Upload your study materials
2. Start chatting with AI
3. Generate quizzes
4. Track your progress

**Happy Learning! 🎓**
