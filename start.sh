#!/bin/bash

# SISPEC Full Starter
# Linux/macOS - Inicia Backend + Frontend

PORT=${PORT:-3000}

echo "🚀 Iniciando SISPEC..."

# Mata processos nas portas 3000 e 5173
echo "🧹 Limpando portas..."
fuser -k 3000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null
sleep 1

# Verifica Deno
DENO_DIR="$HOME/.deno/bin"
if ! command -v deno &> /dev/null && [ ! -x "$DENO_DIR/deno" ]; then
    echo "📦 Instalando Deno..."
    curl -fsSL https://deno.land/install.sh | sh
fi
if [ -x "$DENO_DIR/deno" ]; then
    export PATH="$DENO_DIR:$PATH"
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Menu
echo ""
echo "Escolha uma opção:"
echo "  1) Ambos (backend + frontend)"
echo "  2) Apenas Backend"
echo "  3) Apenas Frontend"
echo "  4) Sair"
echo ""
read -p "Opção [1]: " opcao
opcao=${opcao:-1}

case $opcao in
    1)
        # Verifica se já está rodando
        if curl -s http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
            echo "⚠️  Backend já rodando em http://localhost:$PORT"
        else
            echo "🌐 Iniciando Backend em http://localhost:$PORT..."
            cd "$SCRIPT_DIR/backend"
            deno run --allow-net --allow-read --allow-write --allow-env src/index.ts &
            sleep 2
        fi
        
        echo "🎨 Iniciando Frontend em http://localhost:5173..."
        cd "$SCRIPT_DIR/frontend"
        npm run dev &
        sleep 2
        
        echo ""
        echo "✅ SISPEC rodando!"
        echo "   Backend: http://localhost:$PORT"
        echo "   Frontend: http://localhost:5173"
        echo ""
        echo "Pressione Ctrl+C para parar..."
        wait
        ;;
    2)
        if curl -s http://localhost:$PORT/api/v1/health > /dev/null 2>&1; then
            echo "⚠️  Backend já rodando em http://localhost:$PORT"
        else
            cd "$SCRIPT_DIR/backend"
            deno run --allow-net --allow-read --allow-write --allow-env src/index.ts
        fi
        ;;
    3)
        echo "🎨 Frontend em http://localhost:5173..."
        cd "$SCRIPT_DIR/frontend"
        npm run dev
        ;;
    4)
        echo "👋 Até mais!"
        ;;
esac