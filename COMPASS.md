# SISPEC — Compass

Registro consolidado das mudanças do projeto, para síntese do relatório CNPq.

> Período: 2026-03-01 a 2026-09-28 · 50 commits · GPLv3

**Sistema Inteligente de Pecuária de Confinamento com Aprendizado de Máquina**

---

## Linha do tempo

### Fase 1 — Fundação (março–abril 2026)

| Data | Commit | Mudança |
|------|--------|---------|
| 2026-03-01 | `2f8587f` | Criação do README |
| 2026-03-01 | `7fd6d08` | Criação da LICENSE (GPLv3) |
| 2026-04-25 | `f882cf2` | Estrutura inicial completa do projeto |
| 2026-04-25 | `ed76c35` | Backend Hono com Deno |
| 2026-04-25 | `ca77578` | Composição racial para animais cruzados |
| 2026-04-25 | `b5769b9` | Validações de data futura e peso negativo |
| 2026-04-25 | `7c2800a` | Wizard de cadastro em 3 etapas |
| 2026-04-25 | `7967412` | Notificações toast |
| 2026-04-25 | `a6397f2` | Modo escuro |
| 2026-04-25 | `d1c2f50` | Sistema de autenticação |
| 2026-04-25 | `6744e1c` | Wrapper de rotas protegidas |
| 2026-04-25 | `64c3004` | Validação de composição cruzada máx. 100% |
| 2026-04-25 | `ce7e6d1` | Lista de animais expansível em Lotes |
| 2026-04-25 | `487df7c` | Página de detalhe com timeline de pesagens |
| 2026-04-25 | `c863c7c` | Registro de pesagens |
| 2026-04-25 | `0db55d3` | Correção de div duplicada no Cadastro |
| 2026-04-25 | `46b63a6` | ToastContext para estado compartilhado |
| 2026-04-25 | `99cca2f` | Otimização do build Vite |
| 2026-04-25 | `0345437` | Atualização do README principal |
| 2026-04-25 | `0af08fa`, `c0f1d40` | Executáveis cross-platform com menu |
| 2026-04-25 | `9c9f69d`, `ec3adcb`, `5c8a74d` | Correções de caminho, verificação de processo e proxy |

### Fase 2 — Auditoria de segurança (junho 2026)

| Data | Commit | Mudança |
|------|--------|---------|
| 2026-06-11 | `d3ddc68` | Estado compartilhado de toast e validação de cadastro |
| 2026-06-11 | `f056c36` | **Auditoria**: aviso de senha hardcoded, token falsificável, dynamic imports em hot path, código morto, dados mockados, validação morta. Lista de pendências no TODO |

### Fase 3 — Deploy e performance (junho 2026)

| Data | Commit | Mudança |
|------|--------|---------|
| 2026-06-16 | `0321c4a` | Deploy: Vercel (frontend) + Render (backend) com Redis |
| 2026-06-16 | `18219af`, `d8bb9b1`, `c650250` | Dockerfile para deploy Deno no Render |
| 2026-06-16 | `06a69ce` | Rewrite proxy Vercel → API Render |
| 2026-06-16 | `4b7a707` | Otimização de leituras N+1; troca de lote via `PUT /animais/:id` com validação |
| 2026-06-16 | `ae9eed1` | `lote_nome` nos endpoints GET/POST/PUT |
| 2026-06-17 | `7ae475d` | Code splitting, remoção do axios, debounce na busca, `React.memo` |

### Fase 4 — ML Service em Rust e persistência (julho 2026)

| Data | Commit | Mudança |
|------|--------|---------|
| 2026-07-01 | `b5d050c`, `2cf00af` | Seed realista (Corte + Leite), proxy de ML, **auth JWT**, métricas reais, **ML Service em Rust** |
| 2026-07-01 | `2079db8`, `c30dad0`, `80b1aab` | Seed roda no startup via import dinâmico para dados fresh |
| 2026-07-02 | `ca69e1b` | Modalidades Corte/Leite (backend + frontend) |
| 2026-07-02 | `b9321de` | Suporte PostgreSQL: driver, migrations, camada de dados |
| 2026-07-02 | `6a3d7a5` | Placeholder de `DATABASE_URL` no `render.yaml` |
| 2026-07-07 | `105cad1` | `.gitignore` e remoção de docx |

### Fase 5 — Consolidação (setembro 2026)

| Data | Commit | Mudança |
|------|--------|---------|
| 2026-09-28 | `9b72881` | Documentação: direção "tudo Rust, sem Python" |
| 2026-09-28 | `6bd68f0` | **Remoção de Python** e scripts de conveniência; documentação completa de dependências e deploy |
| 2026-09-28 | `b179165` | **Tipagem completa** backend e frontend |
| 2026-09-28 | `e0a0823` | **Auth completa**: bcrypt, JWT HS256, refresh com rotação, rotas protegidas |

---

## Remoção de Python (setembro 2026)

A escolha de stack foi unificada em **Rust + Deno + React, sem Python**. O repositório mantinha
código FastAPI legado de uma fase anterior, que não era executado — o backend real já era Deno.

| Removido | Quantidade | Motivo |
|----------|-----------|--------|
| `backend/app/` | 19 arquivos | FastAPI legado, substituído pelo backend Deno |
| `backend/venv/` | 59 MB | Ambiente virtual Python **versionado no git** |
| `backend/seed.py` | 1 arquivo | Substituído por `backend/src/seed.ts` |
| `backend/requirements.txt` | 1 arquivo | Dependências Python (fastapi, uvicorn, sqlalchemy) |
| Scripts `.sh` / `.bat` | 8 arquivos | Convenience wrappers; Docker Compose cobre start e deploy |

**Total: 1776 arquivos removidos** (o commit tocou 1803 ao todo, incluindo 27 modificados).

O `backend/venv/` estar versionado era o item mais grave: 59 MB de código de terceiro no
repositório, inflando clones e expondo dependências desnecessárias.

Correção associada: `.gitignore` passou a ignorar `venv/`, `requirements.txt` e scripts de
conveniência, com exceção para `.github/**/*.sh` (CI).

### Frontend: Preact em vez de React

A avaliação identificou que o projeto **já rodava em Preact** — o `vite.config.ts` faz alias de
`react` para `preact/compat`, então React nunca entrava no bundle, mas continuava instalado e
criava confusão.

| Medida | Valor |
|--------|-------|
| Bundle total | 502 kB (117 kB gzip no maior chunk) |
| recharts | 423 kB — **82% do bundle** |
| React → Preact | economia de ~38 kB gzip |

Ações: `@preact/compat` removido (redundante, o alias usa o subpath `preact/compat`); React movido
para `devDependencies` — `recharts`, `react-router-dom` e `lucide-react` declaram React como peer
dependency, então removê-lo quebrava a resolução do npm, mas o alias garante que não entre no
bundle.

Correção de infraestrutura associada: os Dockerfiles declaravam `EXPOSE 10000` hardcoded, enquanto
`env.ts` lê `PORT` com default `3000`. Padronizado para `3000`, com `PORT` explícito no compose.

---

## Tipagem completa (setembro 2026)

Antes, `deno check` reportava 44 erros e `deno lint` 262 problemas. A maior parte era `any` em
cascata — `readDB()` sem tipo de retorno contaminava toda a cadeia.

| Métrica | Antes | Depois |
|---------|-------|--------|
| `deno check` (erros) | 44 | **0** |
| `deno lint` (problemas) | 262 | **0** |
| `tsc --noEmit` (erros) | 9 | **0** |
| `eslint` (erros) | sem config | **0** |
| `cargo clippy` (warnings) | 1 | **0** |

### Tipagem centralizada

`backend/src/types.ts` novo, espelhando o schema SQL de `V001__initial_schema.sql`. Tipos de
entrada (`AnimalCreate`, `PesagemCreate`, `LoteCreate`, `ProducaoCreate`, `AnimalUpdate`) e de
saída (`MetricasAnimal`, `MetricasAnimalLeite`, `Alerta`).

Tipar revelou **6 bugs reais** que estavam ocultos por trás do `any`:

1. **Listas de campos opcionais** — `ccs`, `gordura` e `proteina` eram `number | undefined`, e o
   `reduce` com `(a: number, b: number)` produziria `NaN` em runtime. Substituído por `flatMap`
   com guarda.
2. **Seed assumia lote em todo animal** — `lotesCorteIds.includes(a.lote_id)` quebraria com
   `lote_id` nulo. Adicionado `a.lote_id != null &&`.
3. **`.filter(Boolean)` não narrowava** — o tipo continuava `T | null`. Substituído por type
   predicate `(m): m is MetricasAnimal => m !== null`.
4. **Narrow de parâmetro opcional** — `if (!db) db = await readDB()` não é estreitado pelo TypeScript
   (a variável continua `Database | undefined`). Resolvido com alias local.
5. **Dependências remotas inline** — `postgres` e `redis` vinham de URLs hardcoded no código.
   Movidas para o import map do `deno.json`.
6. **Query sem genericidade** — `querySQL` retornava `any`, mascarando erros de shape.

### Código morto removido

| Removido | Motivo |
|----------|--------|
| `fetchDashboardTatico` / `fetchDashboardEstrategico` | Dashboards usam mock local; nunca chamados |
| `getDashboardKPIs` em `getDashboardEstrategico` | Calculado e não usado (I/O desperdiçado) |
| `mapRow` em `db/pg.ts` | Função sem chamadas |
| `readAll` remoto | Import não usado de URL externa |
| 4 imports não usados | `animais.ts`, `metrics.ts` |
| `user` state no `App.tsx` | Nunca lido no render; guard real é o `ProtectedRoute` |
| `pesoAnterior` em `AnimalDetail` | Calculado e nunca usado |
| `import.meta as Record<string, any>` | `vite-env.d.ts` criado para tipar `import.meta.env` |

### Configuração de lint

`npm run lint` estava no `package.json` mas não existia configuração de ESLint — o comando falhava.Criado `eslint.config.js` (flat config) com `@eslint/js`, `globals` e `typescript-eslint` em
versões compatíveis com ESLint 8. O script perdeu a flag `--ext`, inválida em flat config.

**6 warnings restantes** (todos pré-existentes): `react-hooks/exhaustive-deps` em 3 dashboards e
`react-refresh/only-export-components` em 2 arquivos. Alterar as dependências dos `useEffect`
causaria loop de refetch, então foram deixados.

---

## Segurança: autenticação (setembro 2026)

### Vulnerabilidade encontrada

A avaliação do item "JWT + bcrypt" do TODO revelou um problema **mais grave que o descrição**: a API
**não estava protegida**. `verifyToken` existia em `auth.ts` mas não era chamado por nada.

Verificação empírica antes da correção:

```
GET /api/v1/animais         sem token  →  200
GET /api/v1/dashboard/kpis   sem token  →  200
```

A proteção existia apenas no frontend (SPA, `localStorage`), que é contornável. Todo o restante
do trabalho de token seria decorativo.

Outros problemas identificados no código existente:

- **Senhas em texto puro** no objeto `USERS` em memória
- **`btoa` corrompia caracteres não-ASCII** — `btoa('acentuação')` produz bytes inválidos
  (`efjbw==` no lugar dos 2 bytes corretos), quebrando o token de usuários com nome acentuado

### Implementação

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| JWT | `auth/jwt.ts` | HS256 via `crypto.subtle`, base64url UTF-8-safe, `jti` por token |
| Senhas | `auth/users.ts` | bcrypt custo 10, store com dispatch PostgreSQL/Redis/JSON |
| Proteção | `auth/middleware.ts` | `requireAuth()` e `requireRole()`, claims via `c.set()` |
| Rotas | `routes/auth.ts` | login, refresh, logout, me |

**Rotação de refresh token**: cada uso emite um par novo e revoga o anterior. Reenvio de um token
consumido retorna 401 (*reuse detection*). Tabelas `usuarios` (com `refresh_jti`) e
`refresh_tokens_revogados` no schema.

**`JWT_SECRET` obrigatório, sem fallback.** Sem ele o servidor sobe mas todo login retorna 500 com
mensagem no log. Um segredo padrão embutido seria pior — falharia em silêncio até alguém auditar.
`generateValue: true` no `render.yaml` e `${JWT_SECRET:-...}` no compose para desenvolvimento.

### Frontend

`apiFetch` e `apiSend` centralizam as chamadas: um 401 dispara refresh automático e reenvia a
requisição; se o refresh também falhar, a sessão é limpa e o usuário volta ao login. Requisições
concorrentes são deduplicadas (uma única ida ao refresh em voo). O logout revoga o token no
servidor antes de limpar o `localStorage`.

### Cenários verificados

| Cenário | Resultado |
|---------|-----------|
| Sem token em `/animais` | 401 |
| Token válido | 200 |
| Token adulterado | 401 |
| Header sem `Bearer` | 401 |
| Senha incorreta | 401 |
| Refresh válido | 200 + par novo |
| Reuso de refresh consumido | 401 (*token revogado*) |
| Access token como refresh | 401 |
| Logup | refresh invalidado |
| Sem `JWT_SECRET` | 500 + mensagem no log |
| Token com acento | roundtrip íntegro |

---

## Dimensão do projeto

| Componente | Tecnologia | Linhas | Arquivos |
|------------|-----------|--------|----------|
| Backend | Deno 2 + Hono | 2.370 | 19 |
| Frontend | React 18 / Preact + Vite + Tailwind | 2.267 | 16 |
| ML Service | Rust + axum + smartcore | 376 | 5 |
| **Total** | | **5.013** | **40** |

| Ativo | Quantidade |
|-------|-----------|
| Endpoints REST (backend) | 36 |
| Endpoints ML Service | 4 |
| Tabelas no schema | 6 |
| Dashboards (3 níveis) | 3 + 6 páginas de gestão |
| Dependências Rust | 10 crates |

**Endpoints ML**: `/ml/health`, `/ml/predicao`, `/ml/anomalias`, `/ml/treinar`.

**Dependências Rust**: axum, tokio, serde, serde_json, tower-http, tracing, tracing-subscriber,
smartcore, csv, chrono.

---

## Arquitetura

```
[Frontend React/Preact] ──HTTP/WS──> [Backend Deno + Hono] ──REST──> [ML Service Rust]
                                            │
                                       [PostgreSQL]
                                       [Redis]
```

O backend Deno é a API principal e atua como **proxy** para o ML Service — o frontend nunca chama
a porta 8001 diretamente.

| Componente | Porta | Responsabilidade |
|-----------|-------|------------------|
| Frontend | 5173 | SPAs de dashboards, formulários, gráficos |
| Backend | 3000 | API REST, autenticação, proxy pro ML |
| ML Service | 8001 | Random Forest, Isolation Forest |
| PostgreSQL | 5432 | Persistência transacional |
| Redis | 6379 | Cache |

Rotas públicas: `/api/v1/auth/*` e `/api/v1/health` (usado pelo Render para health check).
Todo o resto exige `Authorization: Bearer <token>`.

---

## Modelos de aprendizado de máquina

| Modelo | Aplicação | crate |
|--------|-----------|-------|
| Random Forest | Predição de peso futuro | smartcore |
| Isolation Forest | Detecção de anomalias | smartcore |

Endpoints verificados em runtime:

```json
POST /ml/predicao
{"animal_id":"A001","peso_entrada":280,"dias_confinamento":120,"gmd_medio":1.2}
→ {"peso_projetado":462.04,"dias_para_abate":166,"confianca":0.7}

POST /ml/anomalias
{"peso_atual":500,"gmd_atual":3.5,"gmd_medio_lote":1.1,"dias_confinamento":120}
→ {"anomalia":true,"score":1.0,"motivo":"GMD crítico: animal muito abaixo da média do lote"}

POST /ml/treinar
→ {"status":"ok","mensagem":"Modelo treinado com dados sintéticos via smartcore"}
```

---

## Deploy

| Alvo | Componente | Configuração |
|------|-----------|--------------|
| Vercel | Frontend | `frontend/vercel.json` (SPA rewrite, output em `dist/`) |
| Render | Backend (`sispec-api`) | `render.yaml`, porta 10000 (injetada pelo Render) |
| Render | ML Service (`sispec-ml`) | `render.yaml`, porta 8001 |

Health checks: `/api/v1/health` (backend) e `/ml/health` (ML).

O Render injeta `PORT=10000` automaticamente, sobrescrevendo o default `3000` do `env.ts` — por
isso o `EXPOSE 3000` do Dockerfile é o valor local, e o Render o ajusta via variável de ambiente.

---

## Itens concluídos do TODO

- Dashboards em 3 níveis (operacional, tático, estratégico) com rotas frontend e endpoints backend
- Remoção de IoT do escopo (ESP32, sensores, RFID, câmeras)
- Docker Compose (PostgreSQL + Redis + ML Service)
- Migration Flyway com schema inicial
- README-QUICK sem Python e sem scripts `.bat`
- Artigo PIBIT revisado (sem IoT, ML em Rust)
- Remoção de Python do repositório
- Remoção de scripts de conveniência
- Frontend enxuto (Preact)
- Documentação completa de dependências e deploy
- Tipagem completa (backend e frontend)
- Auth completa (bcrypt, JWT, refresh com rotação, rotas protegidas)
- Portas consistentes entre Dockerfiles e código

## Pendências

**Alta**

- Migração de JSON para PostgreSQL completo — o backend ainda opera em JSON por padrão
  (`readDB` reporta `{"database":"json"}`); a camada PG existe mas atomicidade e concorrência não
  foram validadas
- Suíte de testes automatizados (Deno.test, Cypress, k6)
- Integração do ML Service no backend Deno — o proxy existe, mas o modelo treinado ainda usa
  dados sintéticos

**Média**

- Pipeline de treinamento contínuo e detecção de drift
- RBAC: `requireRole()` foi implementado no middleware mas ainda não aplicado às rotas
- Persistência de refresh tokens em memória quando não há PostgreSQL (não sobrevive a restart)
