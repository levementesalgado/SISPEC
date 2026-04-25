@echo off
REM SISPEC Backend Starter
REM Windows

set PORT=3000

echo 🚀 Iniciando SISPEC Backend...

REM Verifica Deno
where deno >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Instalando Deno...
    powershell -Command "Invoke-WebRequest -Uri https://deno.land/install.ps1 -OutFile install-deno.ps1"
    powershell -ExecutionPolicy Bypass -File install-deno.ps1
    del install-deno.ps1
    set PATH=%USERPROFILE%\.deno\bin;%PATH%
)

cd /d "%~dp0backend"

echo 🌐 Servidor em http://localhost:%PORT%
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts