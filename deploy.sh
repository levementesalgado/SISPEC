#!/bin/bash

# SISPEC Deploy Script
# Usa screen para rodar em segundo plano

NOME="sispec"
PORT_BACKEND=3000
PORT_FRONTEND=5173

echo "🚀 SISPEC Deploy..."
echo "🧹 Limpando portas..."

# Mata processos nas portas
fuser -k $PORT_BACKEND/tcp 2>/dev/null
fuser -k $PORT_FRONTEND/tcp 2>/dev/null
sleep 1

# Verifica screen
if ! command -v screen &> /dev/null; then
    echo "📦 Instalando screen..."
    sudo apt-get install -y screen
fi

# Mata sessões anteriores
screen -S $NOME -X quit 2>/dev/null
sleep 1

# Cria nova sessão
screen -dmS $NOME

# Backend
screen -S $NOME -X stuff "cd $(pwd)/backend
export PORT=$PORT_BACKEND
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts > backend.log 2>&1 &
echo 'Backend iniciado'
"

sleep 2

# Frontend  
screen -S $NOME -X stuff "cd $(pwd)/frontend
npm run dev > frontend.log 2>&1 &
echo 'Frontend iniciado'
"

sleep 3

echo "✅ Deploy concluído!"
echo "   Backend: http://localhost:$PORT_BACKEND"
echo "   Frontend: http://localhost:$PORT_FRONTEND"
echo ""
echo "Ver logs:"
echo "  screen -r $NOME"
echo ""
echo "Para parar:"
echo "  screen -S $NOME -X quit"