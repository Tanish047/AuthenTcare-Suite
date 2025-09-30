# Move Ollama Storage to E: Drive
# This script safely moves your Ollama models to E: drive

Write-Host "🚀 Moving Ollama Storage to E: Drive..." -ForegroundColor Green

# Stop Ollama service first
Write-Host "1️⃣ Stopping Ollama service..." -ForegroundColor Yellow
try {
    Get-Process -Name "ollama*" | Stop-Process -Force
    Start-Sleep -Seconds 3
    Write-Host "✅ Ollama stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  Ollama was not running" -ForegroundColor Blue
}

# Create E: drive directories
Write-Host "2️⃣ Creating E: drive directories..." -ForegroundColor Yellow
$ollamaDir = "E:\Ollama"
$modelsDir = "E:\Ollama\models"

New-Item -ItemType Directory -Path $ollamaDir -Force | Out-Null
New-Item -ItemType Directory -Path $modelsDir -Force | Out-Null
Write-Host "✅ Directories created on E: drive" -ForegroundColor Green

# Check current storage
$currentPath = "$env:USERPROFILE\.ollama"
if (Test-Path $currentPath) {
    $currentSize = (Get-ChildItem -Path $currentPath -Recurse | Measure-Object -Property Length -Sum).Sum
    $sizeGB = [math]::Round($currentSize / 1GB, 2)
    Write-Host "📊 Current storage: $sizeGB GB" -ForegroundColor Blue
    
    # Move the models
    Write-Host "3️⃣ Moving models to E: drive..." -ForegroundColor Yellow
    try {
        Copy-Item -Path "$currentPath\*" -Destination $ollamaDir -Recurse -Force
        Write-Host "✅ Models copied to E: drive" -ForegroundColor Green
        
        # Verify the copy
        $newSize = (Get-ChildItem -Path $ollamaDir -Recurse | Measure-Object -Property Length -Sum).Sum
        $newSizeGB = [math]::Round($newSize / 1GB, 2)
        
        if ($newSizeGB -eq $sizeGB) {
            Write-Host "✅ Copy verified: $newSizeGB GB" -ForegroundColor Green
            
            # Backup original (don't delete yet)
            $backupPath = "$env:USERPROFILE\.ollama_backup"
            if (Test-Path $backupPath) {
                Remove-Item -Path $backupPath -Recurse -Force
            }
            Rename-Item -Path $currentPath -NewName ".ollama_backup"
            Write-Host "✅ Original backed up to .ollama_backup" -ForegroundColor Green
        } else {
            Write-Host "❌ Copy verification failed" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Failed to copy models: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  No existing Ollama data found" -ForegroundColor Blue
}

# Set environment variable for new location
Write-Host "4️⃣ Setting OLLAMA_MODELS environment variable..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "E:\Ollama\models", "User")
$env:OLLAMA_MODELS = "E:\Ollama\models"
Write-Host "✅ Environment variable set" -ForegroundColor Green

Write-Host "`n🎉 Ollama storage moved to E: drive successfully!" -ForegroundColor Green
Write-Host "📍 New location: E:\Ollama\models" -ForegroundColor Blue
Write-Host "💾 Space saved on C: drive: $sizeGB GB" -ForegroundColor Blue

Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Ollama: ollama serve" -ForegroundColor White
Write-Host "2. Test models: ollama list" -ForegroundColor White
Write-Host "3. If everything works, delete backup: Remove-Item '$env:USERPROFILE\.ollama_backup' -Recurse -Force" -ForegroundColor White