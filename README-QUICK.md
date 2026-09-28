# SISPEC — Início Rápido

> Rust + Deno + React · sem Python

## Subir tudo (Docker)

```bash
docker compose up -d
```

| Serviço | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| ML Service | http://localhost:8001 |
| Frontend (dev) | http://localhost:5173 |
| PostgreSQL | localhost:5432 |

## Desenvolvimento local

```bash
# 1. banco
docker compose up -d postgres redis

# 2. ML Service (Rust)
cd ml_service && cargo run --release

# 3. backend (Deno)
cd backend && deno task dev

# 4. frontend
cd frontend && npm install && npm run dev
```

## Migrations

```bash
cd backend
flyway -url jdbc:postgresql://localhost:5432/sispec -user sispec -password sispec2025 migrate
```

## Login de teste

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

## Problemas?

- Backend: http://localhost:3000/api/v1/health
- ML: http://localhost:8001/ml/health
- Frontend: http://localhost:5173

Detalhes de dependências e deploy: ver [README.md](README.md).
