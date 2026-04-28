#!/usr/bin/env python3
"""
Simple test script to verify OpenAI API key and RAG functionality
Run: python test_api.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

def test_api_key():
    """Test if OpenAI API key is set and valid"""
    print("\n" + "="*60)
    print("🔑 Testing OpenAI API Key")
    print("="*60)
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("\n❌ API Key Not Found!")
        print("\nSolution:")
        print("  1. Get your API key from: https://platform.openai.com/api-keys")
        print("  2. Edit .env file in project root")
        print("  3. Add: OPENAI_API_KEY=sk-your-key-here")
        print("  4. Run again")
        return False
    
    if api_key == "your_openai_api_key_here":
        print("\n⚠️  API Key is a placeholder!")
        print("\nSolution:")
        print("  1. Replace the placeholder with your actual API key")
        print("  2. Get key from: https://platform.openai.com/api-keys")
        return False
    
    print(f"\n✅ API Key found (length: {len(api_key)} chars)")
    print(f"   Key preview: {api_key[:10]}...{api_key[-4:]}")
    
    # Try to use it
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        print("\n✅ OpenAI client initialized")
        
        # List available models
        print("\n🔄 Fetching available models...")
        models = client.models.list()
        print(f"✅ Successfully connected to OpenAI API!")
        print(f"   Available models: {len(list(models))}")
        
        return True
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nPossible solutions:")
        print("  1. Check API key is correct")
        print("  2. Check internet connection")
        print("  3. Try generating a new API key")
        return False

def test_rag_pipeline():
    """Test if RAG pipeline is configured"""
    print("\n" + "="*60)
    print("🧠 Testing RAG Pipeline")
    print("="*60)
    
    try:
        from rag.pipeline import rag
        print("\n✅ RAG pipeline imported successfully")
        print("✅ ChromaDB available")
        return True
    except Exception as e:
        print(f"\n⚠️  Could not load RAG pipeline: {e}")
        print("\nSolution: Install dependencies")
        print("  Run: pip install -r backend/requirements.txt")
        return False

def test_simple_query():
    """Test a simple query without documents"""
    print("\n" + "="*60)
    print("💬 Testing Simple Query (Without Documents)")
    print("="*60)
    
    try:
        from openai import OpenAI
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your_openai_api_key_here":
            print("\n⚠️  Skipping: API key not configured")
            return False
        
        client = OpenAI(api_key=api_key)
        
        print("\n🔄 Sending test query to OpenAI...")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful academic AI assistant."
                },
                {
                    "role": "user",
                    "content": "What is machine learning? Give a 1-sentence answer."
                }
            ],
            temperature=0.7,
            max_tokens=100
        )
        
        answer = response.choices[0].message.content
        print(f"\n✅ Query successful!")
        print(f"\n📝 Response from AI:")
        print(f"   {answer}")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def test_rag_query():
    """Test RAG query (will return 'no documents' message)"""
    print("\n" + "="*60)
    print("📚 Testing RAG Query (Without Uploaded Documents)")
    print("="*60)
    
    try:
        from rag.pipeline import rag
        
        print("\n🔄 Querying RAG pipeline...")
        result = rag.query("What is artificial intelligence?")
        
        print("\n✅ RAG query executed!")
        print(f"\n📝 Response:")
        print(f"   Answer: {result['answer']}")
        print(f"   Sources found: {len(result['sources'])}")
        
        if len(result['sources']) == 0:
            print("\n   (No sources because no documents uploaded yet)")
        
        return True
        
    except Exception as e:
        print(f"\n⚠️  RAG query issue: {str(e)}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n")
    print("█" * 60)
    print("█  AcademicAI RAG Project - System Tests")
    print("█" * 60)
    
    results = {
        "API Key": test_api_key(),
        "RAG Pipeline": test_rag_pipeline(),
        "Simple Query": test_simple_query(),
        "RAG Query": test_rag_query(),
    }
    
    print("\n" + "="*60)
    print("📊 Test Results Summary")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("\n" + "🎉"*30)
        print("ALL TESTS PASSED! Your system is ready to go!")
        print("🎉"*30)
        print("\nNext steps:")
        print("  1. Upload documents via the web interface")
        print("  2. Ask questions about your documents")
        print("  3. Generate quizzes")
        print("  4. Track your analytics")
        return 0
    elif passed >= 2:
        print("\n⚠️  Some tests failed, but you can still run the project.")
        print("Check the errors above and fix them.")
        return 1
    else:
        print("\n❌ Critical tests failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
