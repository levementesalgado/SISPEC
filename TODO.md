# SISPEC — TODO

> **Direção: tudo Rust.** Sem Python. Backend Deno + ML Service Rust + Frontend React.

## 🔴 Alto
- [x] **ML Service em Rust** — axum + smartcore (Random Forest, predição peso, anomalias). Endpoints: `/ml/predicao`, `/ml/anomalias`, `/ml/treinar`
- [ ] **AUTH: JWT para bcrypt + refresh token** — substituir token base64 falsificável
- [ ] **DB: migrar de JSON para PostgreSQL completo** — atomicidade, concorrência, migrations Flyway (schema inicial criado em `migrations/V001__initial_schema.sql`)
- [ ] **Integrar ML Service no backend Deno** — chamadas REST para `/ml/predicao` e `/ml/anomalias`
- [ ] **Testes: suíte automatizada** — Deno.test (backend) + Cypress (frontend) + k6 (carga)
- [ ] **Tipagem do backend** — 44 erros `TS7006` (implícito `any`) nos handlers Hono
- [ ] **Tipagem do frontend** — erros TS2322 em `Lotes.tsx` e validadores Recharts

## 🟡 Médio
- [ ] **ML: pipeline de treinamento contínuo** — integração com MLflow + retreinamento automático
- [ ] **ML: drift detection** — Evidently AI para monitorar qualidade das predições
- [ ] **Dynamic imports em lotes.ts** — trocar `await import()` por import direto
- [ ] **Client-side auth only** — localStorage.setItem dá acesso a qualquer rota
- [ ] **window.location.href em vez de React Router** — full page reload em Animais.jsx
- [ ] **Dockerfile do ML Service Rust** — multi-stage build com cargo

## 🟢 Concluído
- [x] **Dashboard operacional** — página `DashboardOperacional.jsx` (12 KPIs, timeline GMD/peso, alertas)
- [x] **Dashboard tático** — página `DashboardTatico.jsx` (8 indicadores, ranking lotes, distribuição peso, simulação 3 cenários)
- [x] **Dashboard estratégico** — página `DashboardEstrategico.jsx` (6 indicadores, série histórica 5 safras, correlação temp×GMD, scorecard ESG)
- [x] **Rotas frontend** — App.jsx com `/dashboard/operacional`, `/dashboard/tatico`, `/dashboard/estrategico`
- [x] **Dashboard principal** — links para os 3 sub-dashboards
- [x] **Backend endpoints de dashboard** — `/operacional`, `/tatico`, `/estrategico` (dados reais do JSON, fallback mock)
- [x] **Frontend api.js** — fetchDashboardOperacional, fetchDashboardTatico, fetchDashboardEstrategico
- [x] **IoT removido do projeto** — iot/ deletado, rotas removidas, docker-compose limpo, migrations sem iot_eventos
- [x] **Docker Compose** — PostgreSQL + Redis + ML Service (sem Mosquitto/IoT)
- [x] **Migration Flyway** — `migrations/V001__initial_schema.sql` (lotes, animais, pesagens)
- [x] **README-QUICK.md** — guia rápido de start (sem Python, sem scripts .bat)
- [x] **DOCX revisado** — artigo sem IoT, com ML em Rust
- [x] **Python removido do repositório** — `backend/app/` (FastAPI), `seed.py`, `venv/` (59M), `requirements.txt` deletados
- [x] **Scripts de conveniência removidos** — `deploy.sh/.bat`, `start*.sh/.bat` (raiz e backend). Docker Compose cobre
- [x] **Frontend enxuto** — `@preact/compat` fora (redundante), React movido pra devDependencies (peer deps, fora do bundle)
- [x] **Documentação completa** — README com todas as dependências (Deno/Rust/Node), API, env vars e deploy (Vercel + Render)
- [x] **Portas consistentes** — `EXPOSE 3000` nos Dockerfiles (era 10000), `PORT` explícito no docker-compose

## 🔵 Baixo
- [ ] **PWA: cache offline para uso em campo** — Service Workers + IndexedDB
- [ ] **i18n: internacionalização** — suporte a inglês e espanhol
- [ ] **RBAC: controle de acesso granular** — admin, técnico, visualizador, produtor
- [ ] **Exportação avançada** — PDF com gráficos embutidos + CSV + Excel
- [ ] **Múltiplos protocolos de balança** — RS-232, Bluetooth LE
- [ ] **OAuth 2.0** — login com Google, Facebook, gov.br
- [ ] **Visão computacional: YOLOv8 para BCS** — escore de condição corporal automático (futuro)
- [ ] **Blockchain: rastreabilidade do boi ao corte** — (futuro)
