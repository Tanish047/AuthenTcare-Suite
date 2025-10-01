#!/usr/bin/env python3
"""
ChromaDB Server - Final Working Version
"""

import chromadb
import os
import sys
from pathlib import Path

def start_server():
    """Start ChromaDB server using the official method"""
    
    print("🚀 ChromaDB Server - Final Version")
    print("=" * 40)
    print("📍 Host: localhost:8000")
    print("🔒 Privacy: 100% local")
    print("=" * 40)
    
    # Create data directory
    data_dir = Path("./chromadb_data")
    data_dir.mkdir(exist_ok=True)
    
    # Set environment variables
    os.environ["ANONYMIZED_TELEMETRY"] = "False"
    
    try:
        print("🔧 Starting ChromaDB server...")
        
        # Method 1: Use ChromaDB's built-in server
        import subprocess
        
        # Use the official ChromaDB server command
        cmd = [
            sys.executable, "-m", "chromadb.cli.cli", "run",
            "--host", "localhost",
            "--port", "8000",
            "--path", str(data_dir.absolute()),
            "--log-config-path", ""  # Disable verbose logging
        ]
        
        print(f"📋 Command: {' '.join(cmd[:6])}...")
        print("⏳ Starting server (this may take a moment)...")
        
        # Start the server process
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Give it time to start
        import time
        time.sleep(3)
        
        # Check if it's running
        if process.poll() is None:
            print("✅ ChromaDB server started successfully!")
            print("🌐 Server: http://localhost:8000")
            print("📁 Data: chromadb_data/")
            print("\n💡 Server is running in background")
            print("🛑 To stop: Ctrl+C or close this window")
            print("-" * 40)
            
            # Keep the server running
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping ChromaDB server...")
                process.terminate()
                process.wait()
                print("✅ Server stopped")
        else:
            # Get error output
            stdout, stderr = process.communicate()
            print(f"❌ Server failed to start")
            if stderr:
                print(f"Error: {stderr}")
            raise Exception("ChromaDB CLI failed")
            
    except Exception as e:
        print(f"⚠️ CLI method failed: {e}")
        print("\n🔧 Trying alternative method...")
        
        try:
            # Method 2: Direct uvicorn approach
            import uvicorn
            
            print("📋 Using uvicorn with chromadb.app...")
            
            # Set ChromaDB environment
            os.environ["CHROMA_DB_IMPL"] = "duckdb+parquet"
            os.environ["CHROMA_PERSIST_DIRECTORY"] = str(data_dir.absolute())
            
            print("✅ Starting server on localhost:8000...")
            print("💡 Keep this window open")
            print("🛑 Press Ctrl+C to stop")
            
            # Start uvicorn server
            uvicorn.run(
                "chromadb.app:app",
                host="localhost",
                port=8000,
                log_level="warning",  # Reduce log verbosity
                access_log=False
            )
            
        except Exception as uvicorn_error:
            print(f"❌ Uvicorn method failed: {uvicorn_error}")
            print("\n💡 Both methods failed. Possible solutions:")
            print("   1. Update ChromaDB: pip install --upgrade chromadb")
            print("   2. Clear old data: rm -rf chromadb_data")
            print("   3. Check port 8000: netstat -ano | findstr :8000")
            print("   4. Your fallback mode still works perfectly!")
            return False
    
    return True

if __name__ == "__main__":
    try:
        start_server()
    except KeyboardInterrupt:
        print("\n✅ ChromaDB server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)