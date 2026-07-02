# SISPEC

**Sistema Inteligente de Pecuária de Confinamento com Aprendizado de Máquina**

> Da caderneta de campo ao Agro 5.0: Inteligência Artificial na Pecuária de Precisão

## Descrição

Muitos produtores ainda utilizam cadernetas de campo ou planilhas para registrar informações do rebanho, dificultando o acompanhamento do desempenho individual dos animais e a tomada de decisões baseada em dados. O SISPEC é uma plataforma web para gestão de rebanho bovino que integra tecnologias modernas de desenvolvimento de software com indicadores zootécnicos para monitoramento do desempenho produtivo:

- **Gestão zootécnica**: cadastro de animais e lotes, registro de pesagens, timeline por animal
- **Machine Learning em Rust**: predição de peso futuro (Random Forest, XGBoost, LSTM), detecção de anomalias (Isolation Forest, DBSCAN), projeção de abate com simulação de cenários
- **Dashboards em 3 níveis**: operacional (12 KPIs em tempo real), tático (8 indicadores gerenciais + ranking lotes + simulação cenários), estratégico (6 indicadores executivos + scorecard ESG + série histórica)
- **Alertas inteligentes**: regras fixas + ML para detecção precoce de animais críticos
- **Infra completa**: Docker Compose (PostgreSQL, Redis, ML Service Rust), migrations Flyway

## Arquitetura

```
sispec/
├── backend/                          # Deno + Hono (API principal)
│   ├── src/
│   │   ├── routes/                   # animais, lotes, pesagens, dashboard
│   │   ├── models/                   # schemas e tipos
│   │   ├── services/                 # cálculos zootécnicos, GMD, métricas
│   │   └── core/                     # database (PostgreSQL), config, auth
│   ├── migrations/                   # Flyway
│   └── seed/
│
├── ml_service/                       # Rust + axum + smartcore
│   ├── src/
│   │   ├── models/                   # implementação dos modelos
│   │   └── api/                      # endpoints de inferência e treinamento
│   └── Cargo.toml
│
├── frontend/                         # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── pages/                    # Dashboard (3 níveis), Animais, Lotes, etc.
│   │   └── components/               # gráficos, tabelas, alertas
│   └── vercel.json
│
└── README.md
```

```
[Frontend React] ──HTTP/WS──> [Backend Deno + Hono] ──REST──> [ML Service Rust]
                                    │
                               [PostgreSQL]
```

## Quick Start

### Full Stack (Docker Compose)

```bash
docker compose up -d
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| ML Service | http://localhost:8001 |
| PostgreSQL | localhost:5432 |

### Login de Teste

| Usuário | Senha | Função |
|---------|-------|--------|
| admin | sispec123 | Administrador |
| tecnico | tecnico123 | Operador |

### Backend (Deno + Hono)

```bash
cd backend
deno run --allow-net --allow-read --allow-write --allow-env src/index.ts
```

### ML Service (Rust)

```bash
cd ml_service
cargo build --release
./target/release/ml_service
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Dashboards

| Nível | Público | KPIs | Atualização |
|-------|---------|------|-------------|
| Operacional | Tratador | 12 KPIs em tempo real (GMD, peso, alertas) | 5s |
| Tático | Gerente | 8 indicadores gerenciais + ranking lotes + simulação cenários | Semanal |
| Estratégico | Executivo | 6 indicadores executivos + scorecard ESG + série histórica | Mensal |

## Rotas do Frontend

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | Login | Autenticação |
| `/` | Dashboard | Visão geral com KPIs |
| `/dashboard/operacional` | Dashboard Operacional | 12 KPIs em tempo real |
| `/dashboard/tatico` | Dashboard Tático | 8 indicadores gerenciais |
| `/dashboard/estrategico` | Dashboard Estratégico | 6 indicadores executivos |
| `/animais` | Rebanho | Lista com busca, status, GMD |
| `/animais/:id` | Detalhe Animal | Timeline pesagens + ML predição |
| `/lotes` | Lotes | Gerenciamento de lotes |
| `/cadastro` | Novo Animal | Wizard 3 etapas |
| `/alertas` | Central de Alertas | Alertas inteligentes + ML |

## Tecnologias

**Backend:** Deno, Hono, PostgreSQL, Redis, Docker, Flyway
**ML:** Rust, axum, smartcore (Random Forest, K-Means, regressão linear)
**Frontend:** React 18, Vite, Tailwind CSS 3, Recharts 2, Lucide React
**Infra:** Docker, Render, Vercel, WebSockets

## Pipeline de ML

1. **Coleta**: dados de pesagens + clima + dieta via API e importação CSV
2. **Feature engineering**: GMD acumulado, ITU, eficiência alimentar, ECC
3. **Modelos**: Random Forest, XGBoost, LSTM, Prophet, Isolation Forest
4. **Avaliação**: RMSE < 8 kg, MAPE < 5%, validação TimeSeriesSplit
5. **Monitoramento**: drift detection com Evidently AI, retreinamento a cada 30 dias

## Autor

| Nome | Função |
|------|--------|
| Mateus Iuri | Backend, API, ML, Frontend, Banco de Dados, DevOps |

## Licença

GNU General Public License v3 (GPLv3), Copyright 2025 ROCHA, M. I.
