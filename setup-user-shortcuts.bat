@echo off
echo.
echo ========================================
echo  Git Shortcuts Setup (User Level)
echo ========================================
echo.

REM Get current directory
set "SCRIPT_DIR=%~dp0"
set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

echo Installing Git shortcuts for current user...
echo Script directory: %SCRIPT_DIR%
echo.

REM Check if directory is already in user PATH
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%B"

if "%USER_PATH%"=="" (
    set "NEW_PATH=%SCRIPT_DIR%"
) else (
    echo %USER_PATH% | find /i "%SCRIPT_DIR%" >nul
    if not errorlevel 1 (
        echo Directory is already in user PATH!
        goto test_commands
    )
    set "NEW_PATH=%USER_PATH%;%SCRIPT_DIR%"
)

REM Add directory to user PATH
echo Adding %SCRIPT_DIR% to user PATH...
reg add "HKCU\Environment" /v PATH /t REG_EXPAND_SZ /d "%NEW_PATH%" /f >nul

if errorlevel 1 (
    echo ERROR: Failed to update user PATH!
    goto manual_instructions
) else (
    echo ✅ Successfully added to user PATH!
)

:test_commands
echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Available commands (after restarting Command Prompt):
echo.
echo   push    - Force push to context-router-index branch
echo   pull    - Pull request helper for context-router-index
echo.
echo Usage:
echo   1. Restart Command Prompt
echo   2. Navigate to your project directory
echo   3. Type 'push' to force push changes
echo   4. Type 'pull' to create/manage pull requests
echo.
echo Note: You need to restart Command Prompt for the
echo       PATH changes to take effect.
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
echo 1. Press Win + R, type 'rundll32 sysdm.cpl,EditEnvironmentVariables' and press Enter
echo 2. Under 'User variables', find 'Path' (create if it doesn't exist)
echo 3. Click 'Edit' or 'New'
echo 4. Add: %SCRIPT_DIR%
echo 5. Click 'OK' on all dialogs
echo 6. Restart Command Prompt
echo.

:end
pause