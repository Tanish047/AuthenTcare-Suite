@echo off
echo.
echo ========================================
echo  Testing Git Shortcuts
echo ========================================
echo.

echo Checking if commands are available...
echo.

where push.bat >nul 2>&1
if errorlevel 1 (
    echo ❌ 'push' command not found in PATH
    echo Run setup-user-shortcuts.bat first
) else (
    echo ✅ 'push' command found
)

where pull.bat >nul 2>&1
if errorlevel 1 (
    echo ❌ 'pull' command not found in PATH
    echo Run setup-user-shortcuts.bat first
) else (
    echo ✅ 'pull' command found
)

echo.
echo Current directory: %CD%
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ❌ Not in a Git repository
    echo Navigate to your project directory to use git commands
) else (
    echo ✅ Git repository detected
    for /f "tokens=*" %%i in ('git branch --show-current') do echo Current branch: %%i
)

echo.
echo Test complete!
pause