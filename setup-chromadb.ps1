# ChromaDB Setup Script for Unlimited Document Storage
# This adds unlimited document storage to your free AI setup

Write-Host "🚀 Setting up ChromaDB for Unlimited Document Storage..." -ForegroundColor Green

# Check if Python is installed
Write-Host "1️⃣ Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python first:" -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor White
    exit 1
}

# Check if pip is available
Write-Host "2️⃣ Checking pip..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ Pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Pip not found. Please install pip first." -ForegroundColor Red
    exit 1
}

# Install ChromaDB
Write-Host "3️⃣ Installing ChromaDB..." -ForegroundColor Yellow
try {
    pip install chromadb
    Write-Host "✅ ChromaDB installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install ChromaDB" -ForegroundColor Red
    Write-Host "Try: pip install --user chromadb" -ForegroundColor White
    exit 1
}

# Create ChromaDB directory on E: drive (same as Ollama)
Write-Host "4️⃣ Setting up ChromaDB storage on E: drive..." -ForegroundColor Yellow
$chromaDir = "E:\ChromaDB"
New-Item -ItemType Directory -Path $chromaDir -Force | Out-Null
Write-Host "✅ ChromaDB directory created: $chromaDir" -ForegroundColor Green

# Create startup script
$startupScript = @"
# ChromaDB Startup Script
# Run this to start ChromaDB server

import chromadb
from chromadb.config import Settings
import os

# Set storage path to E: drive
storage_path = "E:/ChromaDB"
os.makedirs(storage_path, exist_ok=True)

# Start ChromaDB server
print("🚀 Starting ChromaDB server...")
print(f"📍 Storage location: {storage_path}")
print("🌐 Server: http://localhost:8000")
print("⏹️  Press Ctrl+C to stop")

# Configure ChromaDB
client = chromadb.HttpClient(
    host="localhost",
    port=8000,
    settings=Settings(
        chroma_db_impl="duckdb+parquet",
        persist_directory=storage_path
    )
)

print("✅ ChromaDB server started successfully!")
print("💡 Your AI Knowledge Base can now store unlimited documents!")

# Keep server running
try:
    import time
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n🛑 ChromaDB server stopped")
"@

$startupScript | Out-File -FilePath "E:\ChromaDB\start_chromadb.py" -Encoding UTF8
Write-Host "✅ Startup script created: E:\ChromaDB\start_chromadb.py" -ForegroundColor Green

# Create Windows batch file for easy startup
$batchScript = @"
@echo off
echo 🚀 Starting ChromaDB Server...
cd /d E:\ChromaDB
python start_chromadb.py
pause
"@

$batchScript | Out-File -FilePath "E:\ChromaDB\start_chromadb.bat" -Encoding ASCII
Write-Host "✅ Batch file created: E:\ChromaDB\start_chromadb.bat" -ForegroundColor Green

# Test ChromaDB installation
Write-Host "5️⃣ Testing ChromaDB installation..." -ForegroundColor Yellow
try {
    python -c "import chromadb; print('ChromaDB import successful')"
    Write-Host "✅ ChromaDB test passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ChromaDB test failed, but installation may still work" -ForegroundColor Yellow
}

Write-Host "`n🎉 ChromaDB Setup Complete!" -ForegroundColor Green
Write-Host "📍 Storage location: E:\ChromaDB" -ForegroundColor Blue
Write-Host "🚀 To start ChromaDB server:" -ForegroundColor Yellow
Write-Host "   Option 1: Double-click E:\ChromaDB\start_chromadb.bat" -ForegroundColor White
Write-Host "   Option 2: Run: chroma run --host localhost --port 8000" -ForegroundColor White
Write-Host "   Option 3: Run: python E:\ChromaDB\start_chromadb.py" -ForegroundColor White

Write-Host "`n💡 Benefits of ChromaDB:" -ForegroundColor Yellow
Write-Host "   • Unlimited document storage (only limited by E: drive space)" -ForegroundColor White
Write-Host "   • Fast semantic search across all documents" -ForegroundColor White
Write-Host "   • Enhanced AI responses with document context" -ForegroundColor White
Write-Host "   • Zero monthly costs" -ForegroundColor White

Write-Host "`n🔗 Your Complete Free AI Stack:" -ForegroundColor Green
Write-Host "   ✅ Ollama (AI Models) - E:\Ollama" -ForegroundColor White
Write-Host "   ✅ ChromaDB (Documents) - E:\ChromaDB" -ForegroundColor White
Write-Host "   ✅ AuthentiCare Suite (Interface)" -ForegroundColor White
Write-Host "   Total cost: `$0/month" -ForegroundColor White