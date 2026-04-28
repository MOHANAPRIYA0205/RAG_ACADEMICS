#!/bin/bash
# Run AcademicAI RAG Project
# This script starts the FastAPI backend and opens the frontend

echo ""
echo "========================================"
echo "    AcademicAI RAG Platform - Startup"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please add your OpenAI API key to .env"
    exit 1
fi

# Check if backend directory exists
if [ ! -d backend ]; then
    echo "ERROR: backend directory not found!"
    exit 1
fi

# Check Python
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3.11+ is required but not installed!"
    echo "Download from: https://www.python.org/downloads/"
    exit 1
fi

# Create virtual environment if needed
if [ ! -d backend/venv ]; then
    echo ""
    echo "Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source backend/venv/bin/activate

# Install requirements
echo ""
echo "Installing dependencies..."
pip install -q -r backend/requirements.txt

# Start backend
echo ""
echo "========================================"
echo "Starting FastAPI Backend on port 8000..."
echo "========================================"
echo ""
echo "Open your browser to: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd backend
python main.py
