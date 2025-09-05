@echo off
echo.
echo ========================================
echo  Git Shortcuts Setup
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if errorlevel 1 (
    echo This script needs to be run as Administrator to modify system PATH.
    echo.
    echo Please:
    echo 1. Right-click on this file
    echo 2. Select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Get current directory
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

echo Installing Git shortcuts...
echo Script directory: %SCRIPT_DIR%
echo.

REM Check if directory is already in PATH
echo %PATH% | find /i "%SCRIPT_DIR%" >nul
if not errorlevel 1 (
    echo Directory is already in PATH!
    goto test_commands
)

REM Add directory to system PATH
echo Adding %SCRIPT_DIR% to system PATH...
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "CURRENT_PATH=%%B"

REM Add our directory to PATH
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH /t REG_EXPAND_SZ /d "%CURRENT_PATH%;%SCRIPT_DIR%" /f >nul

if errorlevel 1 (
    echo ERROR: Failed to update system PATH!
    echo You may need to add the directory manually.
    goto manual_instructions
) else (
    echo ✅ Successfully added to system PATH!
)

:test_commands
echo.
echo Testing commands...
echo.

REM Test if commands are accessible
where push.bat >nul 2>&1
if errorlevel 1 (
    echo ❌ push command not found
) else (
    echo ✅ push command available
)

where pull.bat >nul 2>&1
if errorlevel 1 (
    echo ❌ pull command not found
) else (
    echo ✅ pull command available
)

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Available commands:
echo.
echo   push    - Force push to context-router-index branch
echo   pull    - Pull request helper for context-router-index
echo.
echo Usage:
echo   1. Open Command Prompt in your project directory
echo   2. Type 'push' to force push changes
echo   3. Type 'pull' to create/manage pull requests
echo.
echo Note: You may need to restart Command Prompt or
echo       log out and back in for PATH changes to take effect.
echo.
goto end

:manual_instructions
echo.
echo ========================================
echo  Manual Setup Instructions
echo ========================================
echo.
echo Since automatic setup failed, please add manually:
echo.
echo 1. Press Win + R, type 'sysdm.cpl' and press Enter
echo 2. Click 'Environment Variables' button
echo 3. Under 'System Variables', find and select 'Path'
echo 4. Click 'Edit' button
echo 5. Click 'New' and add: %SCRIPT_DIR%
echo 6. Click 'OK' on all dialogs
echo 7. Restart Command Prompt
echo.

:end
pause