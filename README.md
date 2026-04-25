# SISPEC
**Sistema Inteligente de Pecuária de Confinamento**

> Da caderneta de campo ao Agro 4.0 — em etapas reais, ano a ano.

## 📋 Descrição

Sistema para gestão de confinamento bovino com:
- Cadastro de animais e lotes
- Registro de pesagens
- Cálculo automático de GMD (Ganho Médio Diário)
- Dashboard com métricas e alertas
- Projeção de peso de abate

## 🏗️ Arquitetura

```
sispec/
├── backend/           # FastAPI + SQLAlchemy + SQLite
│   ├── app/
│   │   ├── api/      # Endpoints REST
│   │   ├── models/   # Models SQLAlchemy
│   │   ├── schemas/  # Schemas Pydantic
│   │   ├── services/ # Lógica de negócio
│   │   └── core/    # Configurações
│   └── requirements.txt
│
├── frontend/        # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/    # Páginas (Dashboard, Animais, Lotes, Cadastro)
│   │   ├── utils/    # API client
│   │   └── App.jsx
│   └── package.json
│
├── docs/            # Documentação do projeto
└── README.md
```

## 🚀 Quick Start

### Login de Teste

| Usuário | Senha | Função |
|---------|-------|--------|
| admin | sispec123 | Administrador |
| tecnico | tecnico123 | Operador |

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Seed com dados de exemplo
python seed.py

# Rodar
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
pnpm install  # ou npm install
pnpm dev
```

Acesse:
- Frontend: http://localhost:5173
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## 📊 Tecnologias

**Backend:**
- FastAPI (Python)
- SQLAlchemy (ORM)
- SQLite (banco de dados)
- Pydantic (validação)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Recharts (gráficos)
- Lucide React (ícones)

## 📚 Documentação

- [Slides da Apresentação](../Documents/Facul/SISPEC/apresentacao_sispec.html)
- [Planejamento do Projeto](../Documents/planejamento-sispec/planejamento-geral.txt)

## 👥 Equipe

| Nome | Função |
|------|--------|
| Mateus Iuri (Tech Lead) | Backend, API, Banco |
| Pedro Utsumi | Frontend React |
| Pedro Lima | Relatórios e Dashboards |
| Patrick | Mobile/PWA |
| João | QA e Testes |
| Edil | DevOps e Design |

## 📄 Licença

GNU General Public License v3 (GPLv3) - © 2025 ROCHA, M. I.