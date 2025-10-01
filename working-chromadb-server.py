#!/usr/bin/env python3
"""
Working ChromaDB Server - Simple and Reliable
"""

import chromadb
import os
import json
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

# Initialize ChromaDB
data_dir = Path("./chromadb_data")
data_dir.mkdir(exist_ok=True)
os.environ["ANONYMIZED_TELEMETRY"] = "False"

try:
    client = chromadb.PersistentClient(path=str(data_dir.absolute()))
    print(f"✅ ChromaDB initialized: {data_dir.absolute()}")
except Exception as e:
    print(f"❌ ChromaDB failed: {e}")
    exit(1)

class ChromaDBHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path
        
        if path == "/api/v1/heartbeat":
            self.send_json({"nanosecond heartbeat": 1234567890123456789})
        elif path == "/api/v1/collections":
            try:
                collections = client.list_collections()
                result = [{"id": col.id, "name": col.name} for col in collections]
                self.send_json(result)
            except Exception as e:
                self.send_error_json(str(e))
        else:
            self.send_error(404)
    
    def do_POST(self):
        path = urlparse(self.path).path
        content_length = int(self.headers.get('Content-Length', 0))
        
        if content_length > 0:
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
            except:
                data = {}
        else:
            data = {}
        
        try:
            if path == "/api/v1/collections":
                # Create collection
                name = data.get("name", "default")
                collection = client.get_or_create_collection(name)
                self.send_json({"id": collection.id, "name": collection.name})
                
            elif "/add" in path:
                # Add documents
                collection_name = path.split("/")[-2]
                collection = client.get_or_create_collection(collection_name)
                collection.add(
                    documents=data["documents"],
                    metadatas=data["metadatas"],
                    ids=data["ids"]
                )
                self.send_json({"success": True})
                
            elif "/query" in path:
                # Query documents
                collection_name = path.split("/")[-2]
                collection = client.get_or_create_collection(collection_name)
                results = collection.query(
                    query_texts=data["query_texts"],
                    n_results=data.get("n_results", 5)
                )
                self.send_json(results)
                
            elif "/get" in path:
                # Get documents
                collection_name = path.split("/")[-2]
                collection = client.get_or_create_collection(collection_name)
                results = collection.get()
                self.send_json(results)
                
            elif "/delete" in path:
                # Delete documents
                collection_name = path.split("/")[-2]
                collection = client.get_or_create_collection(collection_name)
                collection.delete(ids=data["ids"])
                self.send_json({"success": True})
                
            else:
                self.send_error(404)
                
        except Exception as e:
            self.send_error_json(str(e))
    
    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_json(self, error):
        self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"error": error}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

def main():
    print("🚀 ChromaDB Working Server")
    print("=" * 30)
    print("📍 http://localhost:8000")
    print("📁 Data: chromadb_data/")
    print("🔒 Privacy: 100% local")
    print("=" * 30)
    
    try:
        server = HTTPServer(('localhost', 8000), ChromaDBHandler)
        print("✅ Server started successfully!")
        print("🌐 API: http://localhost:8000/api/v1/heartbeat")
        print("💡 Keep this window open")
        print("🛑 Press Ctrl+C to stop")
        print("-" * 30)
        
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n✅ ChromaDB server stopped")
    except Exception as e:
        print(f"\n❌ Server error: {e}")

if __name__ == "__main__":
    main()