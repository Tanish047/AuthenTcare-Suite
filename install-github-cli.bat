@echo off
echo.
echo ========================================
echo  GitHub CLI Installation
echo ========================================
echo.

REM Check if gh is already installed
gh --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ GitHub CLI is already installed!
    gh --version
    echo.
    goto setup_auth
)

echo Installing GitHub CLI...
echo.

REM Try winget first (most reliable on Windows 10/11)
echo Attempting installation with winget...
winget install --id GitHub.cli --silent

if not errorlevel 1 (
    echo ✅ GitHub CLI installed successfully with winget!
    goto verify_install
)

echo Winget installation failed. Trying alternative methods...
echo.

REM Try chocolatey if available
choco --version >nul 2>&1
if not errorlevel 1 (
    echo Attempting installation with Chocolatey...
    choco install gh -y
    if not errorlevel 1 (
        echo ✅ GitHub CLI installed successfully with Chocolatey!
        goto verify_install
    )
)

REM Try scoop if available
scoop --version >nul 2>&1
if not errorlevel 1 (
    echo Attempting installation with Scoop...
    scoop install gh
    if not errorlevel 1 (
        echo ✅ GitHub CLI installed successfully with Scoop!
        goto verify_install
    )
)

REM If all automated methods fail, provide manual instructions
echo.
echo ❌ Automated installation failed.
echo.
echo Please install manually:
echo 1. Go to: https://github.com/cli/cli/releases/latest
echo 2. Download: gh_*_windows_amd64.msi
echo 3. Run the installer
echo 4. Restart Command Prompt
echo.
goto end

:verify_install
echo.
echo Verifying installation...
timeout /t 3 /nobreak >nul

REM Refresh PATH
call refreshenv >nul 2>&1

gh --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Installation completed but command not found.
    echo Please restart Command Prompt and try again.
    goto end
)

echo ✅ GitHub CLI is working!
gh --version
echo.

:setup_auth
echo ========================================
echo  GitHub Authentication Setup
echo ========================================
echo.
echo To use GitHub CLI with your repositories, you need to authenticate.
echo.
echo Options:
echo 1. Authenticate now (recommended)
echo 2. Skip authentication (you can do this later)
echo.
set /p auth_choice="Choose option (1-2): "

if "%auth_choice%"=="1" (
    echo.
    echo Starting GitHub authentication...
    echo This will open your browser to authenticate with GitHub.
    echo.
    pause
    gh auth login
    
    if not errorlevel 1 (
        echo.
        echo ✅ Authentication successful!
        echo.
        echo Testing authentication...
        gh auth status
    ) else (
        echo.
        echo ❌ Authentication failed.
        echo You can try again later with: gh auth login
    )
) else (
    echo.
    echo Skipping authentication.
    echo To authenticate later, run: gh auth login
)

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo GitHub CLI is now installed and ready to use!
echo.
echo Common commands:
echo   gh auth login          - Authenticate with GitHub
echo   gh repo view           - View repository info
echo   gh pr create           - Create a pull request
echo   gh pr list             - List pull requests
echo   gh issue list          - List issues
echo.
echo Your pull.bat script will now work with full GitHub CLI integration!
echo.

:end
pause