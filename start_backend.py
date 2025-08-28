#!/usr/bin/env python3
"""
IBS Care AI Backend Startup Script

This script starts the Flask backend server with the enhanced LangChain-based AI chat functionality.

Prerequisites:
1. Python 3.8+ installed
2. Install dependencies: pip install -r IBS_CARE_AI_FINAL/backend/requirements.txt
3. Set environment variables (see below)

Environment Variables Required:
- GEMINI_API_KEY: Your Google Gemini API key
- GROQ_API_KEY: Your Groq API key (optional, fallback)
- GOOGLE_APPLICATION_CREDENTIALS: Path to Firebase service account JSON

Usage:
    python start_backend.py
"""

import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """Check if all requirements are met"""
    print("🔍 Checking requirements...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        return False
    
    # Check if backend directory exists
    backend_dir = Path("IBS_CARE_AI_FINAL/backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Check if requirements.txt exists
    req_file = backend_dir / "requirements.txt"
    if not req_file.exists():
        print("❌ requirements.txt not found")
        return False
    
    print("✅ Basic requirements check passed")
    return True

def check_environment():
    """Check environment variables"""
    print("🔍 Checking environment variables...")
    
    required_vars = ["GEMINI_API_KEY", "GOOGLE_APPLICATION_CREDENTIALS"]
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("\n📋 Set these variables before running:")
        print("export GEMINI_API_KEY='your-gemini-api-key'")
        print("export GOOGLE_APPLICATION_CREDENTIALS='./keys/serviceAccount.json'")
        print("export GROQ_API_KEY='your-groq-api-key'  # Optional")
        return False
    
    print("✅ Environment variables check passed")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", 
            "IBS_CARE_AI_FINAL/backend/requirements.txt"
        ])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the Flask backend server"""
    print("🚀 Starting IBS Care AI Backend Server...")
    
    # Set up environment
    os.environ["FLASK_APP"] = "IBS_CARE_AI_FINAL.backend.app.main:app"
    os.environ["FLASK_ENV"] = "development"
    
    # Change to backend directory
    backend_dir = Path("IBS_CARE_AI_FINAL/backend")
    os.chdir(backend_dir)
    
    try:
        # Start Flask server
        subprocess.call([
            sys.executable, "-m", "flask", "run", 
            "--host", "127.0.0.1", 
            "--port", "8000",
            "--debug"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

def main():
    print("🏥 IBS Care AI Backend Startup")
    print("=" * 40)
    
    if not check_requirements():
        sys.exit(1)
    
    if not check_environment():
        sys.exit(1)
    
    # Ask user if they want to install dependencies
    install_deps = input("\n📦 Install/update dependencies? (y/N): ").lower().strip()
    if install_deps in ['y', 'yes']:
        if not install_dependencies():
            sys.exit(1)
    
    print("\n" + "=" * 40)
    print("🎯 Backend will be available at: http://localhost:8000")
    print("🔗 Frontend should connect automatically")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 40)
    
    start_server()

if __name__ == "__main__":
    main()
