@echo off
echo 🚀 Starting ChromaDB Server for AI Knowledge Base
echo ================================================
echo 📍 Host: localhost
echo 🔌 Port: 8000
echo 🔒 Privacy: 100%% local storage
echo 📁 Data: chromadb_data folder
echo ================================================
echo.
echo ✅ Starting server...
echo 💡 Keep this window open while using AI Knowledge Base
echo 🛑 Press Ctrl+C to stop the server
echo ------------------------------------------------
echo.

python start-chromadb-server.py

pause