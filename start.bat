@echo off
REM SISPEC Full Starter
REM Windows - Inicia Backend + Frontend

set PORT=3000
set DENO_DIR=%USERPROFILE%\.deno\bin

echo 🚀 Iniciando SISPEC...

REM Verifica Deno
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

echo.
echo Escolha uma opção:
echo   1) Ambos (backend + frontend)
echo   2) Apenas Backend
echo   3) Apenas Frontend
echo   4) Sair
echo.
set /p opcao="Opção [1]: "
if "%opcao%"=="" set opcao=1

if "%opcao%"=="1" (
    echo 🌐 Iniciando Backend em http://localhost:%PORT%...
    start "SISPEC Backend" cmd /c "deno run --allow-net --allow-read --allow-write --allow-env src/index.ts"
    
    timeout /t 2 /nobreak > nul
    
    echo 🎨 Iniciando Frontend em http://localhost:5173...
    cd frontend
    start "SISPEC Frontend" cmd /c "npm run dev"
    
    echo.
    echo ✅ SISPEC rodando!
    echo    Backend: http://localhost:%PORT%
    echo    Frontend: http://localhost:5173
    echo.
    echo Pressione qualquer tecla para sair...
    pause > nul
)

if "%opcao%"=="2" (
    echo 🌐 Backend em http://localhost:%PORT%...
    deno run --allow-net --allow-read --allow-write --allow-env src/index.ts
)

if "%opcao%"=="3" (
    echo 🎨 Frontend em http://localhost:5173...
    cd frontend
    npm run dev
)

if "%opcao%"=="4" (
    echo 👋 Até mais!
)