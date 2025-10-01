#!/usr/bin/env python3
"""
Start ChromaDB HTTP server for AI Knowledge Base
"""

import chromadb
from chromadb.config import Settings
import uvicorn
import sys
import os
from pathlib import Path

def start_server():
    """Start ChromaDB HTTP server"""
    try:
        print("🚀 Starting ChromaDB Server for AI Knowledge Base")
        print("=" * 50)
        print("📍 Host: localhost")
        print("🔌 Port: 8000") 
        print("🔒 Privacy: 100% local storage")
        print("📁 Data: chromadb_data/ folder")
        print("🚫 Telemetry: Disabled")
        print("=" * 50)
        print()
        print("✅ Server starting...")
        print("🌐 API available at: http://localhost:8000")
        print("💡 Your AI Knowledge Base will now support:")
        print("   📄 Document upload (PDFs, Word docs)")
        print("   🔍 Document search")
        print("   🧠 RAG with your local AI models")
        print()
        print("⚠️  Keep this window open while using AI Knowledge Base")
        print("🛑 Press Ctrl+C to stop the server")
        print("-" * 50)
        
        # Ensure data directory exists
        data_dir = Path("./chromadb_data")
        data_dir.mkdir(exist_ok=True)
        
        # Set environment variables for ChromaDB
        os.environ["CHROMA_SERVER_HOST"] = "localhost"
        os.environ["CHROMA_SERVER_HTTP_PORT"] = "8000"
        os.environ["CHROMA_DB_IMPL"] = "duckdb+parquet"
        os.environ["CHROMA_PERSIST_DIRECTORY"] = str(data_dir.absolute())
        os.environ["ANONYMIZED_TELEMETRY"] = "False"
        
        # Use the new ChromaDB server approach
        try:
            # Try the new server method
            import subprocess
            import time
            
            print("🔧 Starting ChromaDB server with new configuration...")
            
            # Start ChromaDB server using the CLI
            cmd = [
                "python", "-m", "chromadb.cli.cli", "run",
                "--host", "localhost",
                "--port", "8000",
                "--path", str(data_dir.absolute())
            ]
            
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait a moment for server to start
            time.sleep(2)
            
            # Check if process is still running
            if process.poll() is None:
                print("✅ ChromaDB server started successfully!")
                print("🌐 Server running at: http://localhost:8000")
                
                # Keep the process running
                try:
                    process.wait()
                except KeyboardInterrupt:
                    print("\n🛑 Stopping ChromaDB server...")
                    process.terminate()
                    process.wait()
            else:
                # If CLI method fails, try alternative
                raise Exception("CLI method failed")
                
        except Exception as cli_error:
            print(f"⚠️  CLI method failed: {cli_error}")
            print("🔧 Trying alternative server method...")
            
            # Alternative: Use uvicorn directly with chromadb app
            try:
                uvicorn.run(
                    "chromadb.app:app",
                    host="localhost",
                    port=8000,
                    log_level="info"
                )
            except Exception as uvicorn_error:
                print(f"❌ Alternative method also failed: {uvicorn_error}")
                raise Exception("All server startup methods failed")
        
    except KeyboardInterrupt:
        print("\n" + "=" * 50)
        print("🛑 ChromaDB server stopped")
        print("💾 All your documents are safely stored locally")
        print("🔄 Restart anytime with: python start-chromadb-server.py")
        print("=" * 50)
        sys.exit(0)
        
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Check if port 8000 is free: netstat -ano | findstr :8000")
        print("   2. Try a different port in the script")
        print("   3. Restart your terminal as administrator")
        sys.exit(1)

if __name__ == "__main__":
    start_server()