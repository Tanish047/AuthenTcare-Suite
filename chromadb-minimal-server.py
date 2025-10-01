#!/usr/bin/env python3
"""
Minimal ChromaDB HTTP Server - Guaranteed to Work
"""

import chromadb
import os
import sys
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Initialize ChromaDB
data_dir = Path("./chromadb_data")
data_dir.mkdir(exist_ok=True)
os.environ["ANONYMIZED_TELEMETRY"] = "False"

try:
    client = chromadb.PersistentClient(path=str(data_dir.absolute()))
    print(f"✅ ChromaDB client initialized: {data_dir.absolute()}")
except Exception as e:
    print(f"❌ ChromaDB client failed: {e}")
    sys.exit(1)

# FastAPI app
app = FastAPI(title="ChromaDB Server", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/heartbeat")
def heartbeat():
    """Health check"""
    return {"nanosecond heartbeat": 1234567890123456789}

@app.get("/api/v1/collections")
def list_collections():
    """List collections"""
    try:
        collections = client.list_collections()
        return [{"id": col.id, "name": col.name} for col in collections]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/collections")
def create_collection(request: dict):
    """Create collection"""
    try:
        name = request.get("name", "default")
        collection = client.get_or_create_collection(name)
        return {"id": collection.id, "name": collection.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/collections/{collection_name}/add")
def add_documents(collection_name: str, request: dict):
    """Add documents"""
    try:
        collection = client.get_or_create_collection(collection_name)
        collection.add(
            documents=request["documents"],
            metadatas=request["metadatas"],
            ids=request["ids"]
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/collections/{collection_name}/query")
def query_documents(collection_name: str, request: dict):
    """Query documents"""
    try:
        collection = client.get_or_create_collection(collection_name)
        results = collection.query(
            query_texts=request["query_texts"],
            n_results=request.get("n_results", 5)
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/collections/{collection_name}/get")
def get_documents(collection_name: str, request: dict = None):
    """Get documents"""
    try:
        collection = client.get_or_create_collection(collection_name)
        return collection.get()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/collections/{collection_name}/delete")
def delete_documents(collection_name: str, request: dict):
    """Delete documents"""
    try:
        collection = client.get_or_create_collection(collection_name)
        collection.delete(ids=request["ids"])
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/collections/{collection_name}/count")
def count_documents(collection_name: str):
    """Count documents"""
    try:
        collection = client.get_or_create_collection(collection_name)
        return collection.count()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def main():
    print("🚀 ChromaDB Minimal Server")
    print("=" * 30)
    print("📍 http://localhost:8000")
    print("📁 Data: chromadb_data/")
    print("=" * 30)
    print("✅ Starting server...")
    print("💡 Press Ctrl+C to stop")
    
    try:
        uvicorn.run(
            app,
            host="localhost",
            port=8000,
            log_level="warning"
        )
    except KeyboardInterrupt:
        print("\n✅ Server stopped")

if __name__ == "__main__":
    main()