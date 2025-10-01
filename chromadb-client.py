#!/usr/bin/env python3
"""
ChromaDB Client - Simple Python interface for document operations
This script provides a simple command-line interface to ChromaDB operations
that can be called from JavaScript/Node.js
"""

import chromadb
import sys
import json
import argparse
from pathlib import Path

class ChromaDBClient:
    def __init__(self, host="localhost", port=8000):
        self.client = chromadb.HttpClient(host=host, port=port)
        self.collection_name = "regulatory_documents"
        self.collection = None
        
    def initialize(self):
        """Initialize or get collection"""
        try:
            # Try to get existing collection
            self.collection = self.client.get_collection(name=self.collection_name)
            print(f"✅ Connected to existing collection: {self.collection_name}")
        except Exception:
            # Create new collection
            self.collection = self.client.create_collection(
                name=self.collection_name,
                metadata={"description": "Regulatory documents for AI analysis"}
            )
            print(f"✅ Created new collection: {self.collection_name}")
        return True
    
    def add_document(self, doc_id, content, metadata=None):
        """Add document to collection"""
        if not self.collection:
            self.initialize()
            
        if metadata is None:
            metadata = {}
            
        # Split content into chunks
        chunks = self.split_into_chunks(content, 1000)
        
        documents = []
        metadatas = []
        ids = []
        
        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            ids.append(f"{doc_id}_chunk_{i}")
            chunk_metadata = {
                **metadata,
                "documentId": doc_id,
                "chunkIndex": i,
                "totalChunks": len(chunks)
            }
            metadatas.append(chunk_metadata)
        
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        return {"success": True, "chunks": len(chunks)}
    
    def query_documents(self, query, n_results=5):
        """Query documents"""
        if not self.collection:
            self.initialize()
            
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        # Format results
        formatted_results = []
        documents = results['documents'][0] if results['documents'] else []
        metadatas = results['metadatas'][0] if results['metadatas'] else []
        distances = results['distances'][0] if results['distances'] else []
        
        for i, doc in enumerate(documents):
            formatted_results.append({
                "content": doc,
                "metadata": metadatas[i] if i < len(metadatas) else {},
                "relevanceScore": 1 - (distances[i] if i < len(distances) else 0),
                "documentId": metadatas[i].get("documentId") if i < len(metadatas) else None
            })
        
        return formatted_results
    
    def list_documents(self):
        """List all documents"""
        if not self.collection:
            self.initialize()
            
        try:
            results = self.collection.get()
            
            # Group by document ID
            documents = {}
            for metadata in results['metadatas']:
                doc_id = metadata.get('documentId')
                if doc_id and doc_id not in documents:
                    documents[doc_id] = {
                        "id": doc_id,
                        "title": metadata.get('title', doc_id),
                        "type": metadata.get('type', 'document'),
                        "totalChunks": metadata.get('totalChunks', 1)
                    }
            
            return list(documents.values())
        except Exception as e:
            print(f"Error listing documents: {e}")
            return []
    
    def delete_document(self, doc_id):
        """Delete document"""
        if not self.collection:
            self.initialize()
            
        # Get all chunk IDs for this document
        results = self.collection.get(
            where={"documentId": doc_id}
        )
        
        if results['ids']:
            self.collection.delete(ids=results['ids'])
            return {"success": True, "deletedChunks": len(results['ids'])}
        else:
            return {"success": True, "deletedChunks": 0}
    
    def get_stats(self):
        """Get collection statistics"""
        if not self.collection:
            self.initialize()
            
        try:
            count = self.collection.count()
            documents = self.list_documents()
            return {
                "totalDocuments": len(documents),
                "totalChunks": count,
                "collectionName": self.collection_name
            }
        except Exception as e:
            return {"totalDocuments": 0, "totalChunks": 0}
    
    def split_into_chunks(self, text, max_chunk_size=1000):
        """Split text into chunks"""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) > max_chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                current_chunk += (". " if current_chunk else "") + sentence
        
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        return chunks if chunks else [text]

def main():
    parser = argparse.ArgumentParser(description='ChromaDB Client')
    parser.add_argument('action', choices=['init', 'add', 'query', 'list', 'delete', 'stats'])
    parser.add_argument('--doc-id', help='Document ID')
    parser.add_argument('--content', help='Document content')
    parser.add_argument('--query', help='Query text')
    parser.add_argument('--metadata', help='Metadata as JSON string')
    parser.add_argument('--n-results', type=int, default=5, help='Number of results')
    
    args = parser.parse_args()
    
    client = ChromaDBClient()
    
    try:
        if args.action == 'init':
            result = client.initialize()
            print(json.dumps({"success": result}))
            
        elif args.action == 'add':
            if not args.doc_id or not args.content:
                print(json.dumps({"error": "doc-id and content required"}))
                sys.exit(1)
            
            metadata = json.loads(args.metadata) if args.metadata else {}
            result = client.add_document(args.doc_id, args.content, metadata)
            print(json.dumps(result))
            
        elif args.action == 'query':
            if not args.query:
                print(json.dumps({"error": "query required"}))
                sys.exit(1)
            
            result = client.query_documents(args.query, args.n_results)
            print(json.dumps(result))
            
        elif args.action == 'list':
            result = client.list_documents()
            print(json.dumps(result))
            
        elif args.action == 'delete':
            if not args.doc_id:
                print(json.dumps({"error": "doc-id required"}))
                sys.exit(1)
            
            result = client.delete_document(args.doc_id)
            print(json.dumps(result))
            
        elif args.action == 'stats':
            result = client.get_stats()
            print(json.dumps(result))
            
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()