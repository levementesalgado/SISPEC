import { Hono } from "hono";
import { readDB, writeDB, nextId } from "../db/json.ts";

const producoes = new Hono();

producoes.get("/", async (c) => {
  const db = await readDB();
  const { animal_id } = c.req.query();
  let filtered = db.producoes || [];
  if (animal_id) filtered = filtered.filter((p: any) => p.animal_id === parseInt(animal_id));
  filtered.sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime());
  return c.json(filtered);
});

producoes.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  const prod = (db.producoes || []).find((p: any) => p.id === id);
  if (!prod) return c.json({ error: "Produção não encontrada" }, 404);
  return c.json(prod);
});

producoes.post("/", async (c) => {
  const body = await c.req.json();
  if (!body.animal_id) return c.json({ error: "ID do animal é obrigatório" }, 400);
  if (!body.data) return c.json({ error: "Data é obrigatória" }, 400);
  if (!body.litros || body.litros <= 0) return c.json({ error: "Produção em litros é obrigatória" }, 400);

  const db = await readDB();
  const animal = db.animais.find((a: any) => a.id === body.animal_id);
  if (!animal) return c.json({ error: "Animal não encontrado" }, 400);

  const dataPesagem = new Date(body.data);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  if (dataPesagem > hoje) return c.json({ error: "Data não pode ser futura" }, 400);

  const id = await nextId("producaoId");
  const nova = {
    id,
    animal_id: body.animal_id,
    data: body.data,
    litros: body.litros,
    ccs: body.ccs || null,
    gordura: body.gordura || null,
    proteina: body.proteina || null,
    created_at: new Date().toISOString()
  };

  if (!db.producoes) db.producoes = [];
  db.producoes.push(nova);
  await writeDB(db);
  return c.json(nova, 201);
});

producoes.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  if (!db.producoes) return c.json({ error: "Nenhuma produção encontrada" }, 404);
  const index = db.producoes.findIndex((p: any) => p.id === id);
  if (index === -1) return c.json({ error: "Produção não encontrada" }, 404);
  db.producoes.splice(index, 1);
  await writeDB(db);
  return c.body(null, 204);
});

export default producoes;
