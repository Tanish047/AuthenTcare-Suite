@echo off
echo.
echo ========================================
echo  Force Push to context-router-index
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
echo Target branch: context-router-index
echo.

REM Switch to context-router-index branch if not already on it
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

REM Add all changes
echo Adding all changes...
git add .

REM Check if there are changes to commit
git diff --cached --quiet
if not errorlevel 1 (
    echo No changes to commit.
    pause
    exit /b 0
)

REM Commit with timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"

echo Committing changes...
git commit -m "Update: %timestamp%"

REM Force push to origin
echo.
echo ⚠️  WARNING: This will FORCE PUSH to origin/context-router-index
echo This will overwrite any remote changes!
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Push cancelled.
    pause
    exit /b 0
)

echo.
echo Force pushing to origin/context-router-index...
git push --force-with-lease origin context-router-index

if errorlevel 1 (
    echo.
    echo ERROR: Force push failed!
    echo This might be due to:
    echo - Network issues
    echo - Authentication problems
    echo - Remote repository conflicts
    echo.
    echo Try running: git push --force origin context-router-index
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Successfully force pushed to context-router-index!
    echo.
)

pause