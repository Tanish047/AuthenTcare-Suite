#!/usr/bin/env python3
"""
Simple ChromaDB server for AI Knowledge Base
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    print("🚀 ChromaDB Server for AI Knowledge Base")
    print("=" * 45)
    print("🔒 100% Private Local Document Storage")
    print("📁 Data: chromadb_data/ (on your computer)")
    print("🌐 Server: http://localhost:8000")
    print("=" * 45)
    print()
    
    # Create data directory
    data_dir = Path("chromadb_data")
    data_dir.mkdir(exist_ok=True)
    
    # Set environment variables
    env = os.environ.copy()
    env.update({
        "CHROMA_SERVER_HOST": "localhost",
        "CHROMA_SERVER_HTTP_PORT": "8000",
        "ANONYMIZED_TELEMETRY": "False"
    })
    
    try:
        print("✅ Starting ChromaDB server...")
        print("💡 Keep this window open while using AI Knowledge Base")
        print("🛑 Press Ctrl+C to stop")
        print("-" * 45)
        
        # Try to run ChromaDB server using uvicorn
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "chromadb.app:app",
            "--host", "localhost",
            "--port", "8000",
            "--log-level", "info"
        ]
        
        subprocess.run(cmd, env=env, check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 ChromaDB server stopped")
        print("💾 Your documents are safely stored locally")
        
    except FileNotFoundError:
        print("❌ uvicorn not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "uvicorn"], check=True)
        print("✅ Please run the script again")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Alternative: Your AI Knowledge Base works without ChromaDB server")
        print("   It will use embedded mode for document storage")

if __name__ == "__main__":
    main()