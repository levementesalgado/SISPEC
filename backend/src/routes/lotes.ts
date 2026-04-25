import { Hono } from "hono";
import { readDB, nextId } from "../db/json.ts";

const lotes = new Hono();

// Listar lotes
lotes.get("/", async (c) => {
  const db = await readDB();
  return c.json(db.lotes);
});

// Buscar lote por ID
lotes.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  const lote = db.lotes.find((l: any) => l.id === id);
  
  if (!lote) {
    return c.json({ error: "Lote não encontrado" }, 404);
  }
  
  return c.json(lote);
});

// Criar lote
lotes.post("/", async (c) => {
  const body = await c.req.json();
  
  if (!body.nome) {
    return c.json({ error: "Nome é obrigatório" }, 400);
  }
  
  const db = await readDB();
  
  // Verifica se já existe
  if (db.lotes.find((l: any) => l.nome === body.nome)) {
    return c.json({ error: "Lote já existe" }, 400);
  }
  
  const id = await nextId("loteId");
  const novoLote = {
    id,
    nome: body.nome,
    descricao: body.descricao || null,
    ativo: 1,
    created_at: new Date().toISOString()
  };
  
  db.lotes.push(novoLote);
  
  const dbModule = await import("../db/json.ts");
  await dbModule.writeDB(db);
  
  return c.json(novoLote, 201);
});

// Atualizar lote
lotes.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const db = await readDB();
  
  const index = db.lotes.findIndex((l: any) => l.id === id);
  if (index === -1) {
    return c.json({ error: "Lote não encontrado" }, 404);
  }
  
  db.lotes[index] = {
    ...db.lotes[index],
    ...body,
    updated_at: new Date().toISOString()
  };
  
  const dbModule = await import("../db/json.ts");
  await dbModule.writeDB(db);
  
  return c.json(db.lotes[index]);
});

// Deletar lote (soft delete)
lotes.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  
  const index = db.lotes.findIndex((l: any) => l.id === id);
  if (index === -1) {
    return c.json({ error: "Lote não encontrado" }, 404);
  }
  
  db.lotes[index].ativo = 0;
  
  const dbModule = await import("../db/json.ts");
  await dbModule.writeDB(db);
  
  return c.body(null, 204);
});

export default lotes;