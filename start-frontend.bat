@echo off
REM SISPEC Frontend Setup + Run (sem admin)
REM Baixa Node.js portable e inicia

echo 📥 Baixando Node.js portable...
curl -fsSL -o "%TEMP%\node.zip" "https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip"
echo 📦 Extraindo...
powershell -Command "Expand-Archive -Path '%TEMP%\node.zip' -DestinationPath '%~dp0node_temp' -Force"

REM Move to local folder
move /Y "%~dp0node_temp\node-v20.10.0-win-x64" "%~dp0node_portable"

echo 🌐 Instalando dependências...
cd /d "%~dp0frontend"
call "%~dp0node_portable\npm.cmd" install

echo 🚀 Iniciando Frontend em http://localhost:5173
call "%~dp0node_portable\npm.cmd" run dev