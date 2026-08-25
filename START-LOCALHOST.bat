@echo off
setlocal

title TFS Living Catalogue Launcher
cd /d "%~dp0"

set "PNPM_CMD="
for /f "delims=" %%P in ('where pnpm 2^>nul') do if not defined PNPM_CMD set "PNPM_CMD=%%P"
if not defined PNPM_CMD set "PNPM_CMD=C:\Users\varun\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"

if not exist "%PNPM_CMD%" (
  echo ERROR: pnpm could not be found.
  echo Install pnpm or update PNPM_CMD in this file.
  pause
  exit /b 1
)

if not exist "frontend\node_modules\.bin\next.cmd" (
  echo Installing project dependencies...
  set "CI=true"
  call "%PNPM_CMD%" install
  if errorlevel 1 (
    set "CI="
    echo.
    echo ERROR: Dependency installation failed.
    pause
    exit /b 1
  )
  set "CI="
)

echo Starting TFS Living Catalogue...

set "NEXT_TEST_WASM_DIR=%~dp0frontend\node_modules\@next\swc-wasm-nodejs"
start "TFS Living - Frontend" /D "%~dp0" cmd.exe /k ""%PNPM_CMD%" --dir frontend dev"
start "TFS Living - Backend" /D "%~dp0" cmd.exe /k ""%PNPM_CMD%" --dir backend dev"

echo Waiting for localhost to start...
timeout /t 6 /nobreak >nul

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
) else (
  start "" "http://localhost:3000"
)

echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000/api/health
echo.
echo You can close this launcher window. Keep the two server windows open.
pause
