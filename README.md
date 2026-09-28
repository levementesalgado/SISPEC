# SISPEC

**Sistema Inteligente de Pecuária de Confinamento com Aprendizado de Máquina**

> Da caderneta de campo ao Agro 5.0: Inteligência Artificial na Pecuária de Precisão

Registro cronológico das mudanças e decisões técnicas: [COMPASS.md](COMPASS.md).

## Descrição

Plataforma web para gestão de rebanho bovino que integra indicadores zootécnicos com aprendizado de máquina para monitoramento do desempenho produtivo:

- **Gestão zootécnica**: cadastro de animais e lotes, registro de pesagens, timeline por animal
- **Machine Learning em Rust**: predição de peso futuro (Random Forest), detecção de anomalias (Isolation Forest), projeção de abate com simulação de cenários
- **Dashboards em 3 níveis**: operacional (12 KPIs em tempo real), tático (8 indicadores gerenciais), estratégico (6 indicadores executivos + scorecard ESG)
- **Alertas inteligentes**: regras fixas + ML para detecção precoce de animais críticos

**Stack: Rust + Deno + React. Sem Python.**

## Arquitetura

```
[Frontend React/Preact] ──HTTP/WS──> [Backend Deno + Hono] ──REST──> [ML Service Rust]
                                            │
                                       [PostgreSQL]
                                       [Redis]
```

| Componente | Tecnologia | Porta | Papel |
|-----------|-----------|-------|-------|
| Frontend | React 18 / Preact + Vite + Tailwind | 5173 | SPAs de dashboards, formulários, gráficos |
| Backend | Deno 2 + Hono | 3000 | API REST, autenticação, proxy pro ML |
| ML Service | Rust + axum + smartcore | 8001 | Modelos preditivos (Random Forest, Isolation Forest) |
| PostgreSQL | 16-alpine | 5432 | Persistência transacional |
| Redis | 7-alpine | 6379 | Cache e filas |

O backend Deno é a API principal e atua como **proxy** para o ML Service — o frontend nunca chama a porta 8001 diretamente.

## Dependências

### Runtime (precisa instalar)

| Ferramenta | Versão | Para quê |
|-----------|--------|-----------|
| [Deno](https://deno.land) | 2.x | Backend API |
| [Rust](https://rustup.rs) | 1.85+ | ML Service |
| [Node.js](https://nodejs.org) | 18+ | Build do frontend |
| [Docker](https://docker.com) + Compose | 24+ | Orquestração (Postgres, Redis, ML) |
| PostgreSQL | 16 | Banco (ou via Docker) |
| Flyway | 10+ | Migrations de schema |

### Backend (Deno)

| Dependência | Uso |
|-------------|-----|
| `hono` (jsr) | Framework HTTP, roteamento, middleware |
| `@hono/node-server` (npm) | Adaptador para `serve()` no Deno |
| `deno-postgres` | Driver PostgreSQL |
| `bcryptjs` (npm) | Hash de senha (bcrypt, custo 10) |
| `crypto.subtle` | HS256 nativo para JWT, sem dependência |

Instaladas via `deno.json` (import map). Comandos:

```bash
cd backend
deno task dev     # watch mode
deno task start   # produção
```

### ML Service (Rust)

| Crate | Versão | Uso |
|-------|--------|-----|
| `axum` | 0.8 | Servidor HTTP assíncrono |
| `tokio` | 1 (full) | Runtime assíncrono |
| `smartcore` | 0.4 | ML: Random Forest, Isolation Forest, K-Means |
| `serde` / `serde_json` | 1 | Serialização |
| `tower-http` | 0.6 | Middleware CORS |
| `tracing` / `tracing-subscriber` | 0.1 / 0.3 | Logs estruturados |
| `csv` | 1.3 | Importação de dados de treino |
| `chrono` | 0.4 | Timestamps e séries temporais |
| `rand` | 0.8 | Aleatoriedade para split e sampling |

```bash
cd ml_service
cargo build --release
./target/release/ml_service
```

### Frontend (Node)

| Dependência | Versão | Uso |
|-------------|--------|-----|
| `preact` | 10.29 | **Runtime real** (via alias, ver abaixo) |
| `react-router-dom` | 6.21 | Roteamento SPA |
| `recharts` | 2.10 | Gráficos dos dashboards |
| `lucide-react` | 0.303 | Ícones |
| `axios` | 1.6 | Cliente HTTP |
| `vite` | 5.0 | Bundler e dev server |
| `tailwindcss` | 3.4 | Estilos |
| `typescript` | 5.9 | Tipagem |

> **Sobre Preact vs React**: o `vite.config.ts` faz alias de `react` → `preact/compat`, então o bundle
> final usa **Preact** (3 kB em vez de 42 kB). O código-fonte continua importando de `react` para
> manter compatibilidade com `recharts` e `react-router-dom`, que declaram React como peer dependency.
> `react` e `react-dom` estão em `devDependencies` — satisfazem o resolver do npm, mas **nunca entram
> no bundle** por causa do alias.

```bash
cd frontend
npm install
npm run dev        # dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Quick Start

### Opção 1 — Docker Compose (tudo junto)

```bash
docker compose up -d
```

Sobe PostgreSQL, Redis, backend Deno e ML Service Rust. O frontend é separado (Vercel em prod, Vite em dev).

| Serviço | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| ML Service | http://localhost:8001 |
| Frontend (dev) | http://localhost:5173 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Opção 2 — Desenvolvimento local separado

Terminal 1 — banco:
```bash
docker compose up -d postgres redis
```

Terminal 2 — ML Service:
```bash
cd ml_service && cargo run --release
```

Terminal 3 — backend:
```bash
cd backend && deno task dev
```

Terminal 4 — frontend:
```bash
cd frontend && npm install && npm run dev
```

### Migrations

```bash
cd backend
flyway -url jdbc:postgresql://localhost:5432/sispec -user sispec -password sispec2025 migrate
```

Schema inicial em `backend/migrations/V001__initial_schema.sql` (tabelas `usuarios`, `lotes`, `animais`, `pesagens`, `producoes`).

### Autenticação

Todas as rotas exceto `/api/v1/auth/*` e `/api/v1/health` exigem `Authorization: Bearer <token>`.
Senhas em **bcrypt** (custo 10), access token HS256 de 1 h, refresh token de 7 dias com
**rotação**: cada uso emite um par novo e o anterior é revogado, então reenvio de um token
consumido é rejeitado.

```bash
# login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"sispec123"}'

# usar o token
curl http://localhost:3000/api/v1/animais -H "Authorization: Bearer <token>"
```

No frontend, um 401 dispara o refresh automaticamente e reenvia a requisição; se o refresh
também falhar, a sessão é limpa e o usuário volta ao login.

> **`JWT_SECRET` é obrigatório.** Sem ele o servidor sobe mas todo login retorna 500 — não há
> fallback inseguro. Gere com `openssl rand -base64 48`.

| Usuário | Senha | Papel |
|---------|-------|-------|
| admin | sispec123 | `admin` — acesso total |
| tecnico | tecnico123 | `tecnico` — operador |

As contas são criadas no startup (idempotente) com hash bcrypt; em PostgreSQL vão para a tabela
`usuarios`, em JSON para `backend/data/usuarios.json` (ignorado pelo git).

## API

Base: `/api/v1`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/health` | Status do serviço (público) |
| POST | `/auth/login` | Autenticação, retorna access + refresh token |
| POST | `/auth/refresh` | Rotaciona o par de tokens |
| POST | `/auth/logout` | Revoga o refresh token do usuário |
| GET | `/auth/me` | Dados do usuário autenticado |
| GET | `/animais` | Lista rebanho com filtros |
| POST | `/animais` | Cadastra animal |
| GET | `/animais/:id` | Detalhe + timeline de pesagens |
| GET | `/lotes` | Lista lotes |
| POST | `/lotes` | Cria lote |
| GET | `/pesagens` | Registros de pesagem |
| POST | `/pesagens` | Registra pesagem |
| GET | `/dashboard/operacional` | 12 KPIs em tempo real |
| GET | `/dashboard/tatico` | 8 indicadores gerenciais |
| GET | `/dashboard/estrategico` | 6 indicadores + ESG |
| GET | `/producoes` | Registros de produção |
| POST | `/ml/predicao` | **Proxy** → ML Service |
| POST | `/ml/anomalias` | **Proxy** → ML Service |
| POST | `/ml/treinar` | **Proxy** → ML Service |
| GET | `/ml/health` | **Proxy** → ML Service |

Endpoints do ML Service (porta 8001, prefixo `/ml`):

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/ml/health` | Health check |
| POST | `/ml/predicao` | Predição de peso futuro |
| POST | `/ml/anomalias` | Detecção de anomalias |
| POST | `/ml/treinar` | Retreina modelos |

## Dashboards

| Nível | Público | KPIs | Atualização |
|-------|---------|------|-------------|
| Operacional | Tratador | 12 KPIs em tempo real (GMD, peso, alertas) | 5s |
| Tático | Gerente | 8 indicadores + ranking lotes + simulação | Semanal |
| Estratégico | Executivo | 6 indicadores + scorecard ESG + série histórica | Mensal |

## Rotas do Frontend

| Rota | Página |
|------|--------|
| `/login` | Autenticação |
| `/` | Dashboard principal |
| `/dashboard/operacional` | Operacional |
| `/dashboard/tatico` | Tático |
| `/dashboard/estrategico` | Estratégico |
| `/animais` | Rebanho |
| `/animais/:id` | Detalhe do animal |
| `/lotes` | Lotes |
| `/cadastro` | Novo animal |
| `/alertas` | Central de alertas |

## Variáveis de ambiente

### Backend

| Variável | Default | Descrição |
|----------|---------|-----------|
| `PORT` | `3000` | Porta do servidor |
| `HOST` | `0.0.0.0` | Interface de bind |
| `DATABASE_URL` | — | `postgres://user:pass@host:5432/db` |
| `REDIS_URL` | — | `redis://host:6379` |
| `ML_SERVICE_URL` | `http://localhost:8001` | Endpoint do ML Service |
| `JWT_SECRET` | — | **Obrigatório.** Chave HS256. Sem ela o login retorna 500 |

### ML Service

| Variável | Default | Descrição |
|----------|---------|-----------|
| `PORT` | `8001` | Porta do servidor |
| `HOST` | `0.0.0.0` | Interface de bind |
| `RUST_LOG` | `info` | Nível de log |

## Deploy

### Frontend — Vercel

Conectado ao repositório GitHub, detecta `frontend/` automaticamente.

```bash
cd frontend
npx vercel --prod
```

Configuração: `frontend/vercel.json` (SPA rewrite para `index.html`,Output em `dist/`).

### Backend e ML Service — Render

`render.yaml` na raiz define os dois serviços Docker. No Render:

1. Conectar o repositório
2. O Blueprint é detectado automaticamente
3. Configurar `DATABASE_URL` como **secret** (Render não injeta em Blueprint)
4. Usar a **Internal Database URL** para menor latência

| Serviço | Runtime | Raiz | Porta |
|---------|---------|------|-------|
| `sispec-api` | Docker | `backend/` | 10000 (Render injeta) |
| `sispec-ml` | Docker | `ml_service/` | 8001 |

> **Porta no Render**: o Render injeta `PORT=10000` automaticamente. Por isso o `Dockerfile` do
> backend declara `EXPOSE 3000` (default local) mas o Render sobrescreve via env var. O
> `env.ts` sempre lê `PORT` do ambiente.

Health checks configurados: `/api/v1/health` (backend) e `/ml/health` (ML).

### Build local dos Dockerfiles

```bash
# Backend
docker build -t sispec-backend ./backend

# ML Service
docker build -t sispec-ml ./ml_service
```

## Licença

GNU General Public License v3 (GPLv3), Copyright 2025 ROCHA, M. I.
