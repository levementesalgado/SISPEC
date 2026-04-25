@echo off
REM SISPEC Deploy Script for Windows
REM Usa start para rodar em background

set NOME=sispec
set PORT_BACKEND=3000
set PORT_FRONTEND=5173

echo 🚀 SISPEC Deploy...
echo 🧹 Limpando portas...

REM Mata processos anteriores
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul

timeout /t 1 /nobreak > nul

REM Backend
start "SISPEC Backend" cmd /c "cd %~dp0backend && deno run --allow-net --allow-read --allow-write --allow-env src/index.ts"

timeout /t 2 /nobreak > nul

REM Frontend
start "SISPEC Frontend" cmd /c "cd %~dp0frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo ✅ Deploy concluído!
echo    Backend: http://localhost:%PORT_BACKEND%
echo    Frontend: http://localhost:%PORT_FRONTEND%
echo.
echo Pressione qualquer tecla para sair...
pause > nul