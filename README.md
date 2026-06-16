# SISPEC
**Sistema Inteligente de Pecuária de Confinamento**

> Da caderneta de campo ao Agro 4.0 — em etapas reais, ano a ano.

## 📋 Descrição

Sistema para gestão de confinamento bovino com:
- Cadastro de animais e lotes *(CRUD completo)*
- Registro de pesagens *(com timeline por animal)*
- Cálculo automático de GMD (Ganho Médio Diário)
- Dashboard com KPIs, gráficos e alertas
- Projeção de peso de abate
- Busca e filtro por brinco, raça ou lote

## 🏗️ Arquitetura

```
sispec/
├── backend/                  # FastAPI + SQLAlchemy + SQLite (ativo)
│   ├── app/
│   │   ├── api/endpoints/    # animais.py, lotes.py, pesagens.py, dashboard.py
│   │   ├── models/           # Animal, Lote, Pesagem, Usuario
│   │   ├── schemas/          # Pydantic (validação entrada/saída)
│   │   ├── services/         # animal_service.py (GMD, métricas)
│   │   └── core/             # database.py, config.py
│   ├── requirements.txt
│   └── seed.py               # Dados de exemplo (48 animais, 131 pesagens)
│
├── frontend/                 # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── pages/            # Dashboard, Animais, AnimalDetail, Lotes, Cadastro, Login
│   │   ├── utils/api.js      # Cliente HTTP (fetch puro)
│   │   └── App.jsx           # Rotas + navegação + auth guard
│   ├── vercel.json           # Config de deploy Vercel
│   └── package.json
│
├── planejamento-sispec/      # Documentos de planejamento
└── README.md
```

## 🚀 Quick Start

### Login de Teste

| Usuário | Senha | Função |
|---------|-------|--------|
| admin | sispec123 | Administrador |
| tecnico | tecnico123 | Operador |

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Linux/Mac
pip install -r requirements.txt

# Seed com dados de exemplo
python seed.py

# Rodar
uvicorn app.main:app --reload --port 8000
```

API docs automáticas: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🌐 Deploy (Vercel)

O frontend está configurado para deploy no Vercel:

```bash
cd frontend
npm install
vercel login              # ou use VERCEL_TOKEN
vercel --prod
```

**Variáveis de ambiente (Vercel):**

| Variável | Valor | Obrigatória |
|----------|-------|-------------|
| `VITE_API_URL` | URL do backend em produção | Sim, se backend não estiver no mesmo domínio |

> ⚠️ O backend (FastAPI + SQLite) **não roda no Vercel** (plano gratuito não suporta Python serverless + SQLite). Hospede o backend separadamente (Render, Railway, ou VPS) e aponte `VITE_API_URL` para ele.

## 🗺️ Rotas do Frontend

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | Login | Autenticação (demo: admin/sispec123) |
| `/` | Dashboard | KPIs, gráfico GMD, alertas |
| `/animais` | Rebanho | Lista com busca, status, GMD |
| `/animais/:id` | Detalhe Animal | Timeline pesagens, métricas |
| `/lotes` | Lotes | Gerenciamento de lotes |
| `/cadastro` | Novo Animal | Wizard 3 etapas |

## 📊 Tecnologias

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) — Framework web Python
- [SQLAlchemy 2.0](https://www.sqlalchemy.org/) — ORM
- [SQLite](https://www.sqlite.org/) — Banco de dados embarcado
- [Pydantic 2](https://docs.pydantic.dev/) — Validação de schemas
- [Uvicorn](https://www.uvicorn.org/) — Servidor ASGI

**Frontend:**
- [React 18](https://react.dev/) via Preact compat
- [Vite 5](https://vitejs.dev/) — Build tool
- [Tailwind CSS 3](https://tailwindcss.com/) — Estilos utilitários
- [Recharts 2](https://recharts.org/) — Gráficos
- [Lucide React](https://lucide.dev/) — Ícones
- [React Router DOM 6](https://reactrouter.com/) — Roteamento SPA

## 📚 Documentação

- [Apresentação](apresentacao_sispec(5).html)
- [Planejamento](planejamento-sispec/planejamento-geral.txt)

## 👥 Equipe

| Nome | Função |
|------|--------|
| Mateus Iuri (Tech Lead) | Backend, API, Banco de Dados |
| Pedro Utsumi | Frontend React |
| Pedro Lima | Relatórios e Dashboards |
| Patrick | Mobile/PWA |
| João | QA e Testes |
| Edil | DevOps e Design |

## 📄 Licença

GNU General Public License v3 (GPLv3) — © 2025 ROCHA, M. I.