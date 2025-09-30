#!/usr/bin/env python3
"""
Simple ChromaDB Server Startup
Starts ChromaDB server for AuthentiCare AI Knowledge Base
"""

import os
import sys
import time

try:
    import chromadb
    from chromadb.config import Settings
    print("✅ ChromaDB imported successfully")
except ImportError as e:
    print(f"❌ Failed to import ChromaDB: {e}")
    print("💡 Try: pip install chromadb")
    sys.exit(1)

# Configuration
HOST = "localhost"
PORT = 8000
STORAGE_PATH = "E:/ChromaDB"

def start_chromadb_server():
    print("🚀 Starting ChromaDB Server...")
    print(f"📍 Host: {HOST}")
    print(f"🔌 Port: {PORT}")
    print(f"💾 Storage: {STORAGE_PATH}")
    
    # Ensure storage directory exists
    os.makedirs(STORAGE_PATH, exist_ok=True)
    
    try:
        # Start ChromaDB server using the CLI
        import subprocess
        cmd = [
            sys.executable, "-m", "chromadb.cli.cli", "run",
            "--host", HOST,
            "--port", str(PORT),
            "--path", STORAGE_PATH
        ]
        
        print(f"🔧 Running command: {' '.join(cmd)}")
        print("⏹️  Press Ctrl+C to stop the server")
        print("🌐 Server will be available at: http://localhost:8000")
        print("📚 Ready for document storage and retrieval!")
        
        # Start the server
        process = subprocess.run(cmd, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start ChromaDB server: {e}")
        print("💡 Trying alternative startup method...")
        
        # Alternative: Start with HTTP server directly
        try:
            from chromadb.server.fastapi import FastAPI
            import uvicorn
            
            print("🔄 Starting ChromaDB with FastAPI...")
            
            # Configure ChromaDB settings
            settings = Settings(
                chroma_db_impl="duckdb+parquet",
                persist_directory=STORAGE_PATH,
                chroma_server_host=HOST,
                chroma_server_http_port=PORT
            )
            
            # Start server
            uvicorn.run(
                "chromadb.app:app",
                host=HOST,
                port=PORT,
                log_level="info"
            )
            
        except Exception as alt_error:
            print(f"❌ Alternative startup failed: {alt_error}")
            print("💡 Please check ChromaDB installation")
            return False
    
    except KeyboardInterrupt:
        print("\n🛑 ChromaDB server stopped by user")
        return True
    
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 AuthentiCare AI - ChromaDB Server")
    print("=" * 60)
    
    success = start_chromadb_server()
    
    if success:
        print("\n✅ ChromaDB server started successfully!")
        print("🎉 Your AI Knowledge Base now has unlimited document storage!")
    else:
        print("\n❌ Failed to start ChromaDB server")
        print("💡 Check the error messages above for troubleshooting")