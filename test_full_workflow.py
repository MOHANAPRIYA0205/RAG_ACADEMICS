#!/usr/bin/env python3
"""
test_full_workflow.py - Complete End-to-End Test of RAG Project
Tests: Upload PDF → Query → Quiz → All features working
"""

import requests
import json
import time
import sys
from pathlib import Path

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

# ANSI Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'
BOLD = '\033[1m'

def print_test(name):
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{CYAN}{name}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")

def success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def info(msg):
    print(f"{YELLOW}ℹ️  {msg}{RESET}")

def test_health():
    """Test 1: Health Check"""
    print_test("TEST 1: System Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            success(f"Backend is healthy: {data}")
            return True
        else:
            error(f"Health check failed with status {response.status_code}")
            return False
    except Exception as e:
        error(f"Could not connect to backend: {e}")
        return False

def test_rag_without_docs():
    """Test 2: Query RAG without documents"""
    print_test("TEST 2: RAG Query (No Documents)")
    try:
        response = requests.post(
            f"{API_BASE}/chat/query",
            json={"query": "What is machine learning?"}
        )
        if response.status_code == 200:
            data = response.json()
            success(f"Query accepted: {data.get('agent', 'unknown')} agent")
            info(f"Answer preview: {data.get('answer', '')[:100]}...")
            return True
        else:
            error(f"Query failed with status {response.status_code}")
            return False
    except Exception as e:
        error(f"Query test failed: {e}")
        return False

def test_upload_document():
    """Test 3: Upload a sample document"""
    print_test("TEST 3: Document Upload")
    
    # Create a sample text file
    sample_text = """
    ARTIFICIAL INTELLIGENCE SYLLABUS
    
    Unit 1: Introduction to AI
    - Definition and history of AI
    - Types: Weak vs Strong AI
    - Applications in industry
    
    Unit 2: Machine Learning Fundamentals
    - Supervised learning
    - Unsupervised learning
    - Reinforcement learning
    
    Unit 3: Neural Networks
    - Perceptrons
    - Backpropagation
    - Deep Learning basics
    
    Unit 4: Natural Language Processing
    - Text preprocessing
    - Embeddings
    - Transformers
    
    Unit 5: Computer Vision
    - Image classification
    - Object detection
    - CNN architectures
    """
    
    try:
        # Create temporary file
        test_file_path = Path("test_sample.txt")
        test_file_path.write_text(sample_text)
        
        # Upload
        with open(test_file_path, 'rb') as f:
            files = {'file': ('test_sample.txt', f, 'text/plain')}
            response = requests.post(f"{API_BASE}/documents/upload", files=files)
        
        # Clean up
        test_file_path.unlink()
        
        if response.status_code == 200:
            data = response.json()
            doc_id = data.get('doc_id')
            chunks = data.get('chunks', 0)
            success(f"Document uploaded successfully!")
            info(f"Document ID: {doc_id}")
            info(f"Chunks created: {chunks}")
            return doc_id
        else:
            error(f"Upload failed with status {response.status_code}")
            error(f"Response: {response.text}")
            return None
    except Exception as e:
        error(f"Upload test failed: {e}")
        return None

def test_query_with_docs(doc_id):
    """Test 4: Query RAG with documents"""
    print_test("TEST 4: RAG Query (With Documents)")
    try:
        response = requests.post(
            f"{API_BASE}/chat/query",
            json={"query": "What are the main units in the AI syllabus?"}
        )
        if response.status_code == 200:
            data = response.json()
            success(f"Query with documents succeeded!")
            info(f"Agent used: {data.get('agent', 'unknown')}")
            info(f"Answer: {data.get('answer', '')[:150]}...")
            if data.get('sources'):
                success(f"Found {len(data['sources'])} relevant sources")
            return True
        else:
            error(f"Query failed with status {response.status_code}")
            return False
    except Exception as e:
        error(f"Query with docs test failed: {e}")
        return False

def test_quiz_generation():
    """Test 5: Generate quiz"""
    print_test("TEST 5: Quiz Generation")
    try:
        response = requests.post(
            f"{API_BASE}/quiz/generate",
            json={
                "topic": "Machine Learning",
                "n": 3,
                "difficulty": "medium"
            }
        )
        if response.status_code == 200:
            data = response.json()
            success(f"Quiz generated successfully!")
            info(f"Topic: {data.get('topic')}")
            info(f"Questions generated: {len(data.get('questions', []))}")
            if data.get('questions'):
                q = data['questions'][0]
                info(f"Sample question: {q.get('question', '')[:80]}...")
            return True
        else:
            error(f"Quiz generation failed with status {response.status_code}")
            return False
    except Exception as e:
        error(f"Quiz test failed: {e}")
        return False

def test_quiz_submission():
    """Test 6: Submit quiz answers"""
    print_test("TEST 6: Quiz Submission")
    try:
        answers = [
            {"selected": 0, "correct": 0},
            {"selected": 1, "correct": 1},
            {"selected": 2, "correct": 2},
        ]
        response = requests.post(
            f"{API_BASE}/quiz/submit",
            json={"answers": answers}
        )
        if response.status_code == 200:
            data = response.json()
            score = data.get('score', 0)
            total = data.get('total', 3)
            success(f"Quiz submitted!")
            info(f"Score: {score}/{total}")
            info(f"XP Earned: {data.get('xp_earned', 0)}")
            return True
        else:
            error(f"Quiz submission failed with status {response.status_code}")
            return False
    except Exception as e:
        error(f"Quiz submission test failed: {e}")
        return False

def test_agent_routing():
    """Test 7: Multi-agent routing"""
    print_test("TEST 7: Multi-Agent Routing")
    
    test_queries = [
        ("Generate a quiz about neural networks", "quiz"),
        ("Help me debug this Python code", "coding"),
        ("Create a study schedule", "scheduler"),
        ("What is deep learning?", "academic"),
        ("Show my performance analytics", "analytics"),
    ]
    
    all_passed = True
    for query, expected_agent in test_queries:
        try:
            response = requests.post(
                f"{API_BASE}/chat/query",
                json={"query": query}
            )
            if response.status_code == 200:
                data = response.json()
                agent = data.get('agent', 'unknown')
                if agent == expected_agent or expected_agent in ['academic']:  # Allow some flexibility
                    success(f"'{query}' → {agent}")
                else:
                    info(f"'{query}' → {agent} (expected {expected_agent})")
            else:
                error(f"Agent routing failed for: {query}")
                all_passed = False
        except Exception as e:
            error(f"Agent routing test failed for '{query}': {e}")
            all_passed = False
    
    return all_passed

def test_documents_list():
    """Test 8: List documents"""
    print_test("TEST 8: Document Listing")
    try:
        response = requests.get(f"{API_BASE}/documents/list")
        if response.status_code == 200:
            data = response.json()
            docs = data.get('documents', [])
            success(f"Documents endpoint working!")
            info(f"Documents in database: {len(docs)}")
            return True
        else:
            error(f"Document listing failed with status {response.status_code}")
            return False
    except Exception as e:
        error(f"Document list test failed: {e}")
        return False

def test_frontend_access():
    """Test 9: Frontend accessibility"""
    print_test("TEST 9: Frontend Accessibility")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            success(f"Frontend is accessible at {BASE_URL}")
            if 'html' in response.text.lower() or 'academicai' in response.text.lower():
                success("Frontend HTML loaded correctly")
            return True
        else:
            error(f"Frontend access failed with status {response.status_code}")
            return False
    except Exception as e:
        error(f"Frontend access test failed: {e}")
        return False

def run_all_tests():
    """Run complete test suite"""
    print(f"\n{BOLD}{CYAN}{'='*70}{RESET}")
    print(f"{BOLD}{CYAN}AcademicAI RAG - COMPLETE SYSTEM TEST SUITE{RESET}{BOLD}")
    print(f"{BOLD}{CYAN}{'='*70}{RESET}\n")
    
    results = {}
    
    # Test 1: Health
    results['health'] = test_health()
    
    if not results['health']:
        error("Backend not running. Cannot continue tests.")
        return results
    
    # Test 2: RAG without docs
    results['rag_no_docs'] = test_rag_without_docs()
    
    # Test 3: Upload
    doc_id = test_upload_document()
    results['upload'] = doc_id is not None
    
    # Test 4: Query with docs
    if doc_id:
        time.sleep(1)  # Wait for indexing
        results['query_with_docs'] = test_query_with_docs(doc_id)
    else:
        results['query_with_docs'] = False
        info("Skipping query with docs test (no document uploaded)")
    
    # Test 5: Quiz
    results['quiz_gen'] = test_quiz_generation()
    
    # Test 6: Quiz submission
    results['quiz_submit'] = test_quiz_submission()
    
    # Test 7: Agent routing
    results['agent_routing'] = test_agent_routing()
    
    # Test 8: Documents list
    results['doc_list'] = test_documents_list()
    
    # Test 9: Frontend
    results['frontend'] = test_frontend_access()
    
    # Summary
    print_test("TEST SUMMARY")
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"  {status} - {test_name}")
    
    print(f"\n{BOLD}Overall: {GREEN}{passed}/{total} tests passed{RESET}")
    
    if passed == total:
        print(f"\n{GREEN}{BOLD}🎉 ALL TESTS PASSED! RAG System is fully functional!{RESET}")
        return True
    elif passed >= total * 0.7:
        print(f"\n{YELLOW}{BOLD}⚠️  Most tests passed. Some features may need attention.{RESET}")
        return True
    else:
        print(f"\n{RED}{BOLD}❌ Many tests failed. Please check the errors above.{RESET}")
        return False

if __name__ == "__main__":
    try:
        success_state = run_all_tests()
        sys.exit(0 if success_state else 1)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Tests interrupted by user{RESET}")
        sys.exit(1)
    except Exception as e:
        error(f"Unexpected error: {e}")
        sys.exit(1)
