#!/bin/bash

# SISPEC Backend Starter
# Linux/macOS

PORT=${PORT:-3000}

echo "🚀 Iniciando SISPEC Backend..."

# Verifica Deno
if ! command -v deno &> /dev/null; then
    echo "📦 Instalando Deno..."
    curl -fsSL https://deno.land/install.sh | sh
    export DENO_INSTALL="$HOME/.deno"
    export PATH="$DENO_INSTALL/bin:$PATH"
fi

cd "$(dirname "$0")/backend"

echo "🌐 Servidor em http://localhost:$PORT"
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts