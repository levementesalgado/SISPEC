# SISPEC — TODO

## 🔴 Alto
- [ ] **ML Service: reescrever de Python para Rust** — axum + smartcore (Random Forest, predição peso, anomalias). Endpoints: `/ml/predicao`, `/ml/anomalias`, `/ml/treinar`
- [ ] **AUTH: JWT para bcrypt + refresh token** — substituir token base64 falsificável
- [ ] **DB: migrar de JSON para PostgreSQL completo** — atomicidade, concorrência, migrations Flyway (schema inicial criado em `migrations/V001__initial_schema.sql`)
- [ ] **Integrar ML Service no backend Deno** — chamadas REST para `/ml/predicao` e `/ml/anomalias`
- [ ] **Testes: suíte automatizada** — Deno.test (backend) + Cypress (frontend) + k6 (carga)
- [ ] **Remover código legado Python/FastAPI** — dead code no repositório

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
- [x] **README-QUICK.md** — guia rápido de start e deploy
- [x] **DOCX revisado** — artigo sem IoT, com ML em Rust

## 🔵 Baixo
- [ ] **PWA: cache offline para uso em campo** — Service Workers + IndexedDB
- [ ] **i18n: internacionalização** — suporte a inglês e espanhol
- [ ] **RBAC: controle de acesso granular** — admin, técnico, visualizador, produtor
- [ ] **Exportação avançada** — PDF com gráficos embutidos + CSV + Excel
- [ ] **Múltiplos protocolos de balança** — RS-232, Bluetooth LE
- [ ] **OAuth 2.0** — login com Google, Facebook, gov.br
- [ ] **Visão computacional: YOLOv8 para BCS** — escore de condição corporal automático (futuro)
- [ ] **Blockchain: rastreabilidade do boi ao corte** — (futuro)
