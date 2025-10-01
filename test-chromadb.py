#!/usr/bin/env python3
"""
Test ChromaDB local setup
"""

import chromadb
from chromadb.config import Settings
import os

def test_chromadb():
    """Test ChromaDB local functionality"""
    try:
        print("🧪 Testing ChromaDB local setup...")
        
        # Create data directory
        data_dir = "./chromadb_data"
        os.makedirs(data_dir, exist_ok=True)
        
        # Create ChromaDB client with local persistence
        client = chromadb.PersistentClient(
            path=data_dir,
            settings=Settings(
                anonymized_telemetry=False,  # No telemetry for privacy
                allow_reset=True
            )
        )
        
        # Test creating a collection
        collection = client.get_or_create_collection(
            name="test_collection",
            metadata={"description": "Test collection for regulatory documents"}
        )
        
        # Test adding a document
        collection.add(
            documents=["This is a test FDA regulation document about Class II medical devices."],
            metadatas=[{"source": "test", "type": "regulation"}],
            ids=["test_doc_1"]
        )
        
        # Test querying
        results = collection.query(
            query_texts=["medical device requirements"],
            n_results=1
        )
        
        print("✅ ChromaDB local setup successful!")
        print(f"📁 Data stored in: {os.path.abspath(data_dir)}")
        print(f"📄 Test document added and retrieved")
        print(f"🔍 Query results: {len(results['documents'][0])} documents found")
        print()
        print("🎉 ChromaDB is ready for local document storage!")
        print("🔒 All data stays on your computer - completely private")
        
        return True
        
    except Exception as e:
        print(f"❌ ChromaDB test failed: {e}")
        return False

if __name__ == "__main__":
    test_chromadb()