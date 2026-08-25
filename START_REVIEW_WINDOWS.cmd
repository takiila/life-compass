@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required.
  echo Install the LTS version from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

if not exist "node_modules\expo\package.json" (
  echo Running first-time setup. This can take several minutes.
  call "%~dp0SETUP_NEW_PC.cmd"
  if errorlevel 1 goto :error
)

echo.
echo Starting Life Compass for browser review.
echo The browser should open automatically.
echo If it does not, open http://localhost:8081
echo To stop, press Ctrl+C in this window.
echo.
call npm run web -- --localhost --port 8081
exit /b %errorlevel%

:error
echo Startup failed. Keep this window open and save the last 20 lines.
pause
exit /b 1
