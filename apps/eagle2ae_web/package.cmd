@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Batch file started...

REM Change to the script's directory
echo Changing to script directory: %~dp0
cd /d "%~dp0"
echo ERRORLEVEL after cd: !ERRORLEVEL!
if not !ERRORLEVEL! == 0 (
    echo Error: Could not change to script directory.
    pause
    exit /b 1
)

echo Checking if Node.js is available...
node -v >nul 2>&1
echo ERRORLEVEL after node -v: !ERRORLEVEL!
pause
if not !ERRORLEVEL! == 0 (
    echo Error: Node.js not found. Please ensure Node.js is installed and added to your system PATH.
    pause
    exit /b 1
)
echo Node.js found.

echo Running packaging script...
call node scripts/package-extension.js
if not !ERRORLEVEL! == 0 (
    echo. 
    echo Error: Packaging script failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo Packaging process completed. Check the dist directory.
pause
