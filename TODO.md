# SISPEC — TODO

## 🔴 Alto
- [ ] **AUTH: senhas hardcoded + token falsificável** — trocar por bcrypt + JWT ou Supabase Auth
- [ ] **DB JSON sem atomicidade** — duas requests simultâneas perdem dados
- [ ] **Dual backends** — Deno (usado) + Python/FastAPI (dead code); decidir um

## 🟡 Médio
- [ ] **Dynamic imports em lotes.ts** — `await import()` em TODA request, trocar por import direto
- [ ] **Dashboard retorna dados mockados** — GMD é Math.random(), não dados reais
- [ ] **Client-side auth only** — localStorage.setItem dá acesso a qualquer rota
- [ ] **window.location.href em vez de React Router** — full page reload em Animais.jsx
- [ ] **env.ts: parseInt sem validação** — PORT="abc" vira NaN

## 🔵 Baixo
- [ ] **animais.ts: validação morta** — `peso_entrada < 0` inatingível
- [ ] **ToastContainer retorna null** — componente morto
- [ ] **seed.py vs seed.ts** — Python seed pra backend que não roda
- [ ] **deno.json importa @hono/node-server** — adapter Node em runtime Deno
- [ ] **formatDate import vs definição local** — redundante
- [ ] **Testes** — ao menos unitários pro backend
