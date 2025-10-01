#!/usr/bin/env python3
"""
Start ChromaDB server for local document storage and RAG
"""

import chromadb
from chromadb.config import Settings
import uvicorn
import sys
import os

def start_chromadb_server():
    """Start ChromaDB server on localhost:8000"""
    try:
        print("🚀 Starting ChromaDB server...")
        print("📍 Host: localhost")
        print("🔌 Port: 8000")
        print("🔒 Mode: Local storage (private)")
        print("📁 Data: Stored locally on your computer")
        print()
        print("✅ ChromaDB server is starting...")
        print("🌐 Access at: http://localhost:8000")
        print("⚠️  Keep this terminal open while using AI Knowledge Base")
        print("🛑 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Create data directory if it doesn't exist
        data_dir = "./chromadb_data"
        os.makedirs(data_dir, exist_ok=True)
        
        # Start ChromaDB server using uvicorn directly
        uvicorn.run(
            "chromadb.app:app",
            host="localhost",
            port=8000,
            log_level="info",
            reload=False
        )
        
    except KeyboardInterrupt:
        print("\n🛑 ChromaDB server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting ChromaDB server: {e}")
        print("💡 Make sure port 8000 is not in use by another application")
        print("💡 Try: netstat -ano | findstr :8000")
        sys.exit(1)

if __name__ == "__main__":
    start_chromadb_server()