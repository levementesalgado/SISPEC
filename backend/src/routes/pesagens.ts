import { Hono } from "hono";
import { readDB, writeDB, nextId } from "../db/json.ts";

const pesagens = new Hono();

// Listar pesagens
pesagens.get("/", async (c) => {
  const db = await readDB();
  const { animal_id } = c.req.query();
  
  let filtered = db.pesagens;
  
  if (animal_id) {
    filtered = filtered.filter((p: any) => p.animal_id === parseInt(animal_id));
  }
  
  // Ordenar por data descendente
  filtered.sort((a: any, b: any) => 
    new Date(b.data_pesagem).getTime() - new Date(a.data_pesagem).getTime()
  );
  
  return c.json(filtered);
});

// Buscar pesagem por ID
pesagens.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  const pesagem = db.pesagens.find((p: any) => p.id === id);
  
  if (!pesagem) {
    return c.json({ error: "Pesagem não encontrada" }, 404);
  }
  
  return c.json(pesagem);
});

// Criar pesagem
pesagens.post("/", async (c) => {
  const body = await c.req.json();
  const db = await readDB();
  
  // Validações
  if (!body.animal_id) {
    return c.json({ error: "ID do animal é obrigatório" }, 400);
  }
  if (!body.data_pesagem) {
    return c.json({ error: "Data da pesagem é obrigatória" }, 400);
  }
  if (!body.peso || body.peso <= 0) {
    return c.json({ error: "Peso é obrigatório" }, 400);
  }
  
  // Verifica se animal existe
  const animal = db.animais.find((a: any) => a.id === body.animal_id);
  if (!animal) {
    return c.json({ error: "Animal não encontrado" }, 400);
  }
  
  // Verifica se data não é anterior à entrada
  if (new Date(body.data_pesagem) < new Date(animal.data_entrada)) {
    return c.json({ error: "Data da pesagem não pode ser anterior à entrada do animal" }, 400);
  }
  
  const id = await nextId("pesagemId");
  
  const novaPesagem = {
    id,
    animal_id: body.animal_id,
    data_pesagem: body.data_pesagem,
    peso: body.peso,
    tecnico: body.tecnico || null,
    observacao: body.observacao || null,
    created_at: new Date().toISOString()
  };
  
  db.pesagens.push(novaPesagem);
  await writeDB(db);
  
  return c.json(novaPesagem, 201);
});

// Deletar pesagem
pesagens.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  
  const index = db.pesagens.findIndex((p: any) => p.id === id);
  if (index === -1) {
    return c.json({ error: "Pesagem não encontrada" }, 404);
  }
  
  db.pesagens.splice(index, 1);
  await writeDB(db);
  
  return c.body(null, 204);
});

export default pesagens;