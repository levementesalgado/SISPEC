import { Hono } from "hono";
import { readDB, writeDB, nextId } from "../db/json.ts";
import { getMetricsAnimal, getDashboardKPIs } from "../services/metrics.ts";
import { calcularGMD } from "../services/calculos.ts";
import { formatDate } from "../services/calculos.ts";

const animais = new Hono();

// Listar animais
animais.get("/", async (c) => {
  const db = await readDB();
  const { status, lote_id } = c.req.query();
  
  let filtered = db.animais;
  
  if (status) {
    filtered = filtered.filter((a: any) => a.status === status);
  }
  
  if (lote_id) {
    filtered = filtered.filter((a: any) => a.lote_id === parseInt(lote_id));
  }
  
  // Adicionar métricas
  const result = [];
  for (const animal of filtered) {
    const metrics = await getMetricsAnimal(animal.id);
    const lote = db.lotes.find((l: any) => l.id === animal.lote_id);
    
    result.push({
      ...animal,
      peso_atual: metrics?.peso_atual || animal.peso_entrada,
      gmd: metrics?.gmd > 0 ? metrics.gmd : null,
      gmd_status: metrics?.gmd_status || null,
      lote_nome: lote?.nome || null
    });
  }
  
  return c.json(result);
});

// Buscar animal por ID
animais.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  const animal = db.animais.find((a: any) => a.id === id);
  
  if (!animal) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }
  
  const metrics = await getMetricsAnimal(animal.id);
  
  return c.json({
    ...animal,
    metrics
  });
});

// Criar animal
animais.post("/", async (c) => {
  const body = await c.req.json();
  
  // Validações obrigatórias
  if (!body.brinco) {
    return c.json({ error: "Brinco é obrigatório" }, 400);
  }
  if (!body.data_entrada) {
    return c.json({ error: "Data de entrada é obrigatória" }, 400);
  }
  if (!body.peso_entrada || body.peso_entrada <= 0) {
    return c.json({ error: "Peso de entrada é obrigatório" }, 400);
  }
  
  // Validação: data não pode ser futura
  const dataEntrada = new Date(body.data_entrada);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  if (dataEntrada > hoje) {
    return c.json({ error: "Data de entrada não pode ser futura" }, 400);
  }
  
  // Validação: peso não pode ser negativo
  if (body.peso_entrada < 0) {
    return c.json({ error: "Peso não pode ser negativo" }, 400);
  }
  
  // Validação: composição cruzado não pode passar de 100%
  if (body.raca === 'Cruzado' && body.composicao) {
    const total = body.composicao.reduce((sum: number, c: any) => sum + (c.porcentagem || 0), 0);
    if (total > 100) {
      return c.json({ error: `Porcentagem total (${total}%) não pode passar de 100%` }, 400);
    }
  }
  
  const db = await readDB();
  
  // Verifica brinco duplicado
  if (db.animais.find((a: any) => a.brinco === body.brinco)) {
    return c.json({ error: "Brinco já cadastrado" }, 400);
  }
  
  const id = await nextId("animalId");
  
  const novoAnimal = {
    id,
    brinco: body.brinco,
    raca: body.raca || "Nelore",
    composicao: body.composicao || null,
    sexo: body.sexo || "MACHO",
    data_entrada: body.data_entrada,
    peso_entrada: body.peso_entrada,
    lote_id: body.lote_id || null,
    observacao: body.observacao || null,
    status: body.status || "ATIVO",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.animais.push(novoAnimal);
  
  // Cria pesagem inicial automática
  db.pesagens.push({
    id: await nextId("pesagemId"),
    animal_id: id,
    data_pesagem: body.data_entrada,
    peso: body.peso_entrada,
    tecnico: "Sistema",
    created_at: new Date().toISOString()
  });
  
  await writeDB(db);
  
  const metrics = await getMetricsAnimal(id);
  
  return c.json({
    ...novoAnimal,
    metrics
  }, 201);
});

// Atualizar animal
animais.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const body = await c.req.json();
  const db = await readDB();
  
  const index = db.animais.findIndex((a: any) => a.id === id);
  if (index === -1) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }
  
  // Verifica brinco duplicado se mudou
  if (body.brinco && body.brinco !== db.animais[index].brinco) {
    if (db.animais.find((a: any) => a.brinco === body.brinco && a.id !== id)) {
      return c.json({ error: "Brinco já cadastrado" }, 400);
    }
  }
  
  db.animais[index] = {
    ...db.animais[index],
    ...body,
    updated_at: new Date().toISOString()
  };
  
  await writeDB(db);
  
  const metrics = await getMetricsAnimal(id);
  
  return c.json({
    ...db.animais[index],
    metrics
  });
});

// Deletar animal
animais.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = await readDB();
  
  const index = db.animais.findIndex((a: any) => a.id === id);
  if (index === -1) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }
  
  // Remove pesagens
  db.pesagens = db.pesagens.filter((p: any) => p.animal_id !== id);
  
  // Remove animal
  db.animais.splice(index, 1);
  
  await writeDB(db);
  
  return c.body(null, 204);
});

export default animais;