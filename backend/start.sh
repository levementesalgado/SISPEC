#!/bin/bash

# SISPEC Backend Starter
# Linux/macOS

PORT=${PORT:-3000}
DENO_DIR="$HOME/.deno/bin"

echo "🚀 Iniciando SISPEC Backend..."

# Verifica Deno (já instalado ou ~/.deno/bin)
if ! command -v deno &> /dev/null && [ ! -x "$DENO_DIR/deno" ]; then
    echo "📦 Instalando Deno..."
    curl -fsSL https://deno.land/install.sh | sh
fi

# Adiciona ao PATH se necessário
if ! command -v deno &> /dev/null && [ -x "$DENO_DIR/deno" ]; then
    export PATH="$DENO_DIR:$PATH"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🌐 Servidor em http://localhost:$PORT"
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts