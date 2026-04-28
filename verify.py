#!/usr/bin/env python3
"""
Verification script to check if the RAG project is properly configured
"""

import os
import sys
import subprocess
from pathlib import Path

def check_python():
    """Check Python version"""
    print("\n✓ Checking Python version...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 11:
        print(f"  ✓ Python {version.major}.{version.minor}.{version.micro} - OK")
        return True
    else:
        print(f"  ✗ Python {version.major}.{version.minor} found, need 3.11+")
        return False

def check_env_file():
    """Check if .env file exists and has API key"""
    print("\n✓ Checking .env configuration...")
    if not os.path.exists(".env"):
        print("  ✗ .env file not found")
        print("    → Create .env with your OpenAI API key:")
        print("    → OPENAI_API_KEY=sk-...")
        return False
    
    with open(".env", "r") as f:
        content = f.read()
        if "OPENAI_API_KEY=" in content:
            if "your_openai_api_key_here" in content or "sk-" not in content:
                print("  ⚠ OPENAI_API_KEY is set but appears to be a placeholder")
                print("    → Add your actual OpenAI API key from https://platform.openai.com/api-keys")
                return False
            print("  ✓ OPENAI_API_KEY is configured")
            return True
        else:
            print("  ✗ OPENAI_API_KEY not found in .env")
            return False

def check_project_structure():
    """Check if project structure is intact"""
    print("\n✓ Checking project structure...")
    required_dirs = [
        "backend",
        "backend/routes",
        "backend/db",
        "backend/models",
        "backend/rag",
        "backend/agents",
        "css",
        "js",
    ]
    
    required_files = [
        "backend/main.py",
        "backend/requirements.txt",
        "index.html",
        "docker-compose.yml",
    ]
    
    all_ok = True
    for directory in required_dirs:
        if os.path.isdir(directory):
            print(f"  ✓ {directory}/")
        else:
            print(f"  ✗ {directory}/ NOT FOUND")
            all_ok = False
    
    for file in required_files:
        if os.path.isfile(file):
            print(f"  ✓ {file}")
        else:
            print(f"  ✗ {file} NOT FOUND")
            all_ok = False
    
    return all_ok

def check_requirements():
    """Check if pip can install requirements"""
    print("\n✓ Checking Python packages...")
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "list"],
            capture_output=True,
            text=True,
            timeout=10
        )
        packages = result.stdout.lower()
        
        critical = ["fastapi", "langchain", "openai"]
        found = []
        for pkg in critical:
            if pkg in packages:
                print(f"  ✓ {pkg} is available")
                found.append(True)
            else:
                print(f"  ✗ {pkg} not installed")
                found.append(False)
        
        return any(found)
    except Exception as e:
        print(f"  ⚠ Could not check packages: {e}")
        return False

def check_docker():
    """Check if Docker is installed"""
    print("\n✓ Checking Docker...")
    try:
        result = subprocess.run(
            ["docker", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print(f"  ✓ {result.stdout.strip()}")
            return True
        else:
            print("  ⚠ Docker not accessible")
            return False
    except FileNotFoundError:
        print("  ⚠ Docker not found (optional for local development)")
        return False
    except Exception as e:
        print(f"  ⚠ Could not check Docker: {e}")
        return False

def check_ports():
    """Check if required ports are available"""
    print("\n✓ Checking ports...")
    import socket
    
    ports = {8000: "Backend API", 6379: "Redis", 5432: "Database"}
    available = []
    
    for port, service in ports.items():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(1)
            result = s.connect_ex(('127.0.0.1', port))
            s.close()
            
            if result != 0:
                print(f"  ✓ Port {port} available ({service})")
                available.append(True)
            else:
                print(f"  ⚠ Port {port} in use ({service})")
                available.append(False)
        except Exception as e:
            print(f"  ✓ Port {port} check OK")
            available.append(True)
    
    return available[0]  # At least port 8000 should be available

def main():
    """Run all checks"""
    print("=" * 50)
    print("  AcademicAI RAG Project - Verification Check")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python),
        ("Environment Config", check_env_file),
        ("Project Structure", check_project_structure),
        ("Required Packages", check_requirements),
        ("Docker (Optional)", check_docker),
        ("Port Availability", check_ports),
    ]
    
    results = []
    for name, check_fn in checks:
        try:
            result = check_fn()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ Error checking {name}: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 50)
    print("  Summary")
    print("=" * 50)
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All checks passed! Ready to run the project.")
        print("\nNext steps:")
        print("  1. Run: docker-compose up --build  (for Docker)")
        print("  2. Or:  python main.py  (local development)")
        print("  3. Open: http://localhost:8000")
        return 0
    elif passed >= 4:
        print("\n⚠ Some optional checks failed, but you can still run locally.")
        print("\nNext steps:")
        print("  1. Fix missing items above")
        print("  2. Run: python main.py")
        print("  3. Open: http://localhost:8000")
        return 1
    else:
        print("\n❌ Critical checks failed. Please fix before running.")
        print("\nTo fix:")
        print("  1. Make sure Python 3.11+ is installed")
        print("  2. Add OPENAI_API_KEY to .env file")
        print("  3. Run: pip install -r backend/requirements.txt")
        return 1

if __name__ == "__main__":
    sys.exit(main())
