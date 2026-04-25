@echo off
REM SISPEC Backend Starter
REM Windows

set PORT=3000
set DENO_DIR=%USERPROFILE%\.deno\bin

echo 🚀 Iniciando SISPEC Backend...

REM Verifica Deno (já instalado ou ~/.deno/bin)
where deno >nul 2>nul
if %errorlevel% neq 0 (
    if not exist "%DENO_DIR%\deno.exe" (
        echo 📦 Instalando Deno...
        powershell -Command "Invoke-WebRequest -Uri https://deno.land/install.ps1 -OutFile install-deno.ps1"
        powershell -ExecutionPolicy Bypass -File install-deno.ps1
        del install-deno.ps1
    )
    set PATH=%DENO_DIR%;%PATH%
)

cd /d "%~dp0"

echo 🌐 Servidor em http://localhost:%PORT%
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts