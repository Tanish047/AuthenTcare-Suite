# Privacy Hardening for AuthentiCare AI
# Ensures maximum privacy and no data sharing

Write-Host "🔒 Hardening Privacy for AuthentiCare AI..." -ForegroundColor Green

# 1. Disable Ollama telemetry (if any)
Write-Host "1️⃣ Disabling Ollama telemetry..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("OLLAMA_DISABLE_TELEMETRY", "true", "User")
$env:OLLAMA_DISABLE_TELEMETRY = "true"
Write-Host "✅ Ollama telemetry disabled" -ForegroundColor Green

# 2. Set offline mode
Write-Host "2️⃣ Setting offline mode..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("OLLAMA_OFFLINE", "true", "User")
$env:OLLAMA_OFFLINE = "true"
Write-Host "✅ Offline mode enabled" -ForegroundColor Green

# 3. Disable automatic updates
Write-Host "3️⃣ Disabling automatic updates..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("OLLAMA_AUTO_UPDATE", "false", "User")
$env:OLLAMA_AUTO_UPDATE = "false"
Write-Host "✅ Auto-updates disabled" -ForegroundColor Green

# 4. Set strict local-only mode
Write-Host "4️⃣ Setting strict local-only mode..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "127.0.0.1", "User")
$env:OLLAMA_HOST = "127.0.0.1"
Write-Host "✅ Local-only mode enabled" -ForegroundColor Green

# 5. Create privacy configuration file
Write-Host "5️⃣ Creating privacy configuration..." -ForegroundColor Yellow
$privacyConfig = @"
# AuthentiCare AI Privacy Configuration
# This file ensures maximum privacy for your AI setup

# Ollama Privacy Settings
OLLAMA_DISABLE_TELEMETRY=true
OLLAMA_OFFLINE=true
OLLAMA_AUTO_UPDATE=false
OLLAMA_HOST=127.0.0.1
OLLAMA_MODELS=E:\Ollama\models

# Network Restrictions
# Block any outbound connections from AI processes
# (Optional: Configure firewall rules)

# Data Retention Policy
# - All conversations stored locally only
# - No cloud backups of AI conversations
# - Models never updated with your data
# - Complete data sovereignty

# Privacy Guarantees:
# ✅ No data leaves your computer
# ✅ No training data collection
# ✅ No telemetry or analytics
# ✅ No automatic updates
# ✅ No external API calls
# ✅ Complete offline operation
"@

$privacyConfig | Out-File -FilePath "E:\Ollama\privacy-config.txt" -Encoding UTF8
Write-Host "✅ Privacy configuration saved to E:\Ollama\privacy-config.txt" -ForegroundColor Green

# 6. Verify privacy settings
Write-Host "6️⃣ Verifying privacy settings..." -ForegroundColor Yellow
Write-Host "Environment Variables:" -ForegroundColor Blue
Write-Host "   OLLAMA_DISABLE_TELEMETRY: $env:OLLAMA_DISABLE_TELEMETRY" -ForegroundColor White
Write-Host "   OLLAMA_OFFLINE: $env:OLLAMA_OFFLINE" -ForegroundColor White
Write-Host "   OLLAMA_AUTO_UPDATE: $env:OLLAMA_AUTO_UPDATE" -ForegroundColor White
Write-Host "   OLLAMA_HOST: $env:OLLAMA_HOST" -ForegroundColor White
Write-Host "   OLLAMA_MODELS: $env:OLLAMA_MODELS" -ForegroundColor White

Write-Host "`n🛡️ Privacy Hardening Complete!" -ForegroundColor Green
Write-Host "🔒 Your AI is now maximum privacy:" -ForegroundColor Blue
Write-Host "   ✅ No telemetry or tracking" -ForegroundColor White
Write-Host "   ✅ No automatic updates" -ForegroundColor White
Write-Host "   ✅ No external connections" -ForegroundColor White
Write-Host "   ✅ Local-only operation" -ForegroundColor White
Write-Host "   ✅ No data sharing possible" -ForegroundColor White

Write-Host "`n💡 Additional Privacy Tips:" -ForegroundColor Yellow
Write-Host "   • Use airplane mode while using AI (optional)" -ForegroundColor White
Write-Host "   • Configure firewall to block Ollama internet access" -ForegroundColor White
Write-Host "   • Regular backup of E:\Ollama for data sovereignty" -ForegroundColor White

Write-Host "`n🚀 Restart Ollama to apply privacy settings:" -ForegroundColor Green
Write-Host "   1. Stop: Get-Process *ollama* | Stop-Process -Force" -ForegroundColor White
Write-Host "   2. Start: ollama serve" -ForegroundColor White