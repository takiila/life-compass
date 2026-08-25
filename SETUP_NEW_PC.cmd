@echo off
setlocal
cd /d "%~dp0"

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo Windows PowerShell is required.
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Setup-NewPC.ps1"
set "LIFE_COMPASS_SETUP_EXIT=%errorlevel%"

if not "%LIFE_COMPASS_SETUP_EXIT%"=="0" (
  echo.
  echo Life Compass setup failed. Keep this window open and review the error above.
)

exit /b %LIFE_COMPASS_SETUP_EXIT%
