# SISPEC Backend

Backend em Hono + JSON para o Sistema Inteligente de Pecuária de Confinamento.

## Instalação

```bash
# Instalar Deno
curl -fsSL https://deno.land/install.sh | sh

# Rodar seed (dados de exemplo)
deno run --allow-net --allow-read --allow-write src/seed.ts

# Iniciar servidor
deno run --allow-net --allow-read --allow-write src/index.ts
```

## Endpoints

- `GET /api/v1/health` - Status da API
- `GET /api/v1/lotes` - Listar lotes
- `GET /api/v1/animais` - Listar animais
- `GET /api/v1/dashboard/kpis` - Métricas do dashboard
- `GET /api/v1/dashboard/alertas` - Alertas do sistema

## Variáveis de Ambiente

Criar arquivo `.env`:

```env
PORT=3000
HOST=0.0.0.0
GMD_META=1.0
PESO_ABATE=480
ICA_IDEAL=6.0
```