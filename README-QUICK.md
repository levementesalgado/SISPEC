# SISPEC — Sistema Inteligente de Pecuária de Confinamento

> ML + IoT + 3 dashboards · Agro 5.0

## Quick Start (Full Stack)

```bash
docker compose up -d
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| ML Service | http://localhost:8001/docs |
| PostgreSQL | localhost:5432 |

## Quick Start (Dev)

### Backend
```bash
cd backend && deno run --allow-net --allow-read --allow-write --allow-env src/main.ts
```

### ML Service
```bash
cd ml_service && pip install -r requirements.txt && uvicorn api.main:app --reload --port 8001
```

### Frontend
```bash
cd frontend && npm install && npm run dev
```

## Login de Teste

| Usuário | Senha | Função |
|---------|-------|--------|
| admin | sispec123 | Administrador |
| tecnico | tecnico123 | Operador |

## Dashboards

| Nível | Público | KPIs | Atualização |
|-------|---------|------|-------------|
| Operacional | Tratador | 12 KPIs em tempo real | 5s |
| Tático | Gerente | 8 indicadores + ranking | Semanal |
| Estratégico | Executivo | 6 indicadores + ESG | Mensal |

## Deploy

```bash
./deploy.sh
```

## Problemas?

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- ML: http://localhost:8001/docs
