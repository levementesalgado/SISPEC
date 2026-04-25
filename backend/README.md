# SISPEC Backend

Sistema Inteligente de Pecuária de Confinamento - Backend API

## Instalação

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Execução

```bash
# Sem seed
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Com dados de exemplo
python seed.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /` - Info da API
- `GET /api/v1/health` - Status do sistema
- `GET /api/v1/lotes` - Listar lotes
- `GET /api/v1/animais` - Listar animais
- `GET /api/v1/dashboard/kpis` - Métricas do dashboard
- `GET /docs` - Documentação Swagger
- `GET /redoc` - Documentação ReDoc

## API com dados de exemplo

```bash
# Após seed, use:
curl http://localhost:8000/api/v1/animais
curl http://localhost:8000/api/v1/dashboard/kpis
```