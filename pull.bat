@echo off
echo.
echo ========================================
echo  Create Pull Request Helper
echo ========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not in a Git repository!
    echo Please navigate to your project directory first.
    pause
    exit /b 1
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i

echo Current branch: %current_branch%
echo.

REM Check if current branch is context-router-index
if not "%current_branch%"=="context-router-index" (
    echo Switching to context-router-index branch...
    git checkout context-router-index
    if errorlevel 1 (
        echo ERROR: Failed to switch to context-router-index branch!
        pause
        exit /b 1
    )
    echo.
)

REM Pull latest changes from remote
echo Pulling latest changes from origin/context-router-index...
git pull origin context-router-index

if errorlevel 1 (
    echo.
    echo WARNING: Pull failed or conflicts detected!
    echo You may need to resolve conflicts manually.
    echo.
)

REM Get repository URL for pull request
for /f "tokens=*" %%i in ('git config --get remote.origin.url') do set repo_url=%%i

REM Convert SSH URL to HTTPS if needed
set "repo_url=%repo_url:git@github.com:=https://github.com/%"
set "repo_url=%repo_url:.git=%"

echo.
echo Repository: %repo_url%
echo Source branch: context-router-index
echo.

REM Check if gh CLI is available
gh --version >nul 2>&1
if not errorlevel 1 (
    echo GitHub CLI detected! 
    echo.
    echo Options:
    echo 1. Create pull request with GitHub CLI
    echo 2. Open browser to create pull request manually
    echo 3. Just show pull request URL
    echo.
    set /p choice="Choose option (1-3): "
    
    if "!choice!"=="1" (
        echo.
        set /p title="Enter PR title: "
        set /p body="Enter PR description (optional): "
        echo.
        echo Creating pull request...
        if "!body!"=="" (
            gh pr create --title "!title!" --head context-router-index --base main
        ) else (
            gh pr create --title "!title!" --body "!body!" --head context-router-index --base main
        )
        if not errorlevel 1 (
            echo.
            echo ✅ Pull request created successfully!
        )
    ) else if "!choice!"=="2" (
        echo.
        echo Opening browser to create pull request...
        start "" "%repo_url%/compare/main...context-router-index"
    ) else (
        goto show_url
    )
) else (
    echo GitHub CLI not found.
    echo.
    echo Options:
    echo 1. Open browser to create pull request
    echo 2. Show pull request URL
    echo.
    set /p choice="Choose option (1-2): "
    
    if "!choice!"=="1" (
        echo.
        echo Opening browser to create pull request...
        start "" "%repo_url%/compare/main...context-router-index"
    ) else (
        goto show_url
    )
)

goto end

:show_url
echo.
echo 📋 Pull Request URL:
echo %repo_url%/compare/main...context-router-index
echo.
echo Copy this URL to your browser to create a pull request.

:end
echo.
pause