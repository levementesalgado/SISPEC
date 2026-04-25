#!/bin/bash

# SISPEC Frontend Starter
# Linux/macOS (sem admin)

echo "🚀 Iniciando SISPEC Frontend..."

cd "$(dirname "$0")/frontend"

# Verifica Node.js ou instala portable
if ! command -v node &> /dev/null; then
    echo "📦 Baixando Node.js portable..."
    curl -fsSL https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz | tar -xJ
    export PATH="$(pwd)/node-v20.10.0-linux-x64/bin:$PATH"
fi

npm install
echo "🌐 Frontend em http://localhost:5173"
npm run dev