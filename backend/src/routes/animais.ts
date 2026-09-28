import { Hono } from "hono";
import { getRepo } from "../db/index.ts";
import { getMetricsAnimal, getMetricsAnimalLeite } from "../services/metrics.ts";
import type { AnimalCreate, ComposicaoRacial, Sexo, StatusAnimal } from "../types.ts";

const animais = new Hono();

const STATUS_VALIDOS: StatusAnimal[] = ["ATIVO", "VENDIDO", "BAIXA", "MORTE"];

function validarComposicao(composicao: unknown): string | null {
  if (!Array.isArray(composicao)) return null;
  const itens = composicao as ComposicaoRacial[];
  for (const item of itens) {
    if (typeof item?.raca !== "string" || !item.raca.trim()) {
      return "Composição racial exige raça válida";
    }
    if (typeof item.porcentagem !== "number" || item.porcentagem < 0 || item.porcentagem > 100) {
      return "Porcentagem da composição deve estar entre 0 e 100";
    }
  }
  const total = itens.reduce((sum, c) => sum + (c.porcentagem || 0), 0);
  if (total > 100) return `Porcentagem total (${total}%) não pode passar de 100%`;
  return null;
}

animais.get("/", async (c) => {
  const { status, lote_id, modalidade, search, limit, offset } = c.req.query();
  const repo = getRepo();

  const lista = await repo.listAnimais({
    status: status || undefined,
    loteId: lote_id ? parseInt(lote_id) : undefined,
    modalidade: modalidade || undefined,
    search: search || undefined,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  });

  // Métricas exigem o snapshot (N+1 aceitável: é leitura analítica, não CRUD)
  const db = lista.length ? await repo.snapshot() : null;
  const lotesPorId = new Map(db?.lotes.map((l) => [l.id, l.nome]) ?? []);

  return c.json(await Promise.all(lista.map(async (animal) => {
    const metrics = db ? await getMetricsAnimal(animal.id, db) : null;
    return {
      ...animal,
      peso_atual: metrics?.peso_atual || animal.peso_entrada,
      gmd: metrics?.gmd && metrics.gmd > 0 ? metrics.gmd : null,
      gmd_status: metrics?.gmd_status || null,
      lote_nome: animal.lote_id != null ? lotesPorId.get(animal.lote_id) ?? null : null,
    };
  })));
});

animais.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const repo = getRepo();
  const animal = await repo.getAnimal(id);
  if (!animal) return c.json({ error: "Animal não encontrado" }, 404);

  const db = await repo.snapshot();
  const lote = animal.lote_id != null ? db.lotes.find((l) => l.id === animal.lote_id) : null;
  const metrics = await getMetricsAnimal(id, db) ?? await getMetricsAnimalLeite(id, db);

  return c.json({ ...animal, lote_nome: lote?.nome ?? null, metrics });
});

animais.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.brinco) return c.json({ error: "Brinco é obrigatório" }, 400);
  if (!body.data_entrada) return c.json({ error: "Data de entrada é obrigatória" }, 400);
  if (!body.peso_entrada || body.peso_entrada <= 0) {
    return c.json({ error: "Peso de entrada é obrigatório" }, 400);
  }

  const dataEntrada = new Date(body.data_entrada);
  if (Number.isNaN(dataEntrada.getTime())) {
    return c.json({ error: "Data de entrada inválida" }, 400);
  }
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  if (dataEntrada > hoje) {
    return c.json({ error: "Data de entrada não pode ser futura" }, 400);
  }

  if (body.raca === "Cruzado" && body.composicao) {
    const erro = validarComposicao(body.composicao);
    if (erro) return c.json({ error: erro }, 400);
  }

  const repo = getRepo();

  if (body.lote_id !== undefined && body.lote_id !== null) {
    if (!(await repo.getLote(body.lote_id))) {
      return c.json({ error: "Lote não encontrado" }, 400);
    }
  }

  if (await repo.findAnimalByBrinco(body.brinco)) {
    return c.json({ error: "Brinco já cadastrado" }, 400);
  }

  const data: AnimalCreate = {
    brinco: body.brinco,
    raca: body.raca || "Nelore",
    sexo: (body.sexo || "MACHO") as Sexo,
    data_entrada: body.data_entrada,
    peso_entrada: body.peso_entrada,
    lote_id: body.lote_id || null,
    observacao: body.observacao || null,
    composicao: body.composicao || null,
  };

  const novoAnimal = await repo.createAnimal(data);

  // Pesagem de entrada, para que o GMD tenha ponto de partida
  await repo.createPesagem({
    animal_id: novoAnimal.id,
    data_pesagem: body.data_entrada,
    peso: body.peso_entrada,
    tecnico: "Sistema",
  });

  const db = await repo.snapshot();
  const lote = novoAnimal.lote_id != null ? db.lotes.find((l) => l.id === novoAnimal.lote_id) : null;

  return c.json({
    ...novoAnimal,
    lote_nome: lote?.nome ?? null,
    metrics: await getMetricsAnimal(novoAnimal.id, db),
  }, 201);
});

animais.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json();
  const repo = getRepo();
  const atual = await repo.getAnimal(id);
  if (!atual) return c.json({ error: "Animal não encontrado" }, 404);

  if (body.lote_id !== undefined && body.lote_id !== null) {
    if (!(await repo.getLote(body.lote_id))) {
      return c.json({ error: "Lote não encontrado" }, 400);
    }
  }

  if (body.brinco && body.brinco !== atual.brinco) {
    const duplicado = await repo.findAnimalByBrinco(body.brinco);
    if (duplicado && duplicado.id !== id) {
      return c.json({ error: "Brinco já cadastrado" }, 400);
    }
  }

  if (body.raca === "Cruzado" && body.composicao) {
    const erro = validarComposicao(body.composicao);
    if (erro) return c.json({ error: erro }, 400);
  }

  if (body.status !== undefined && !STATUS_VALIDOS.includes(body.status)) {
    return c.json({ error: `Status inválido: ${body.status}` }, 400);
  }

  const patch: Record<string, unknown> = {};
  for (const campo of ["brinco", "raca", "sexo", "data_entrada", "peso_entrada", "lote_id", "observacao", "status", "composicao"] as const) {
    if (body[campo] !== undefined) patch[campo] = body[campo];
  }

  const atualizado = await repo.updateAnimal(id, patch);
  if (!atualizado) return c.json({ error: "Animal não encontrado" }, 404);

  const db = await repo.snapshot();
  const lote = atualizado.lote_id != null ? db.lotes.find((l) => l.id === atualizado.lote_id) : null;

  return c.json({
    ...atualizado,
    lote_nome: lote?.nome ?? null,
    metrics: await getMetricsAnimal(id, db),
  });
});

animais.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  if (!(await getRepo().getAnimal(id))) {
    return c.json({ error: "Animal não encontrado" }, 404);
  }

  if (!(await getRepo().deleteAnimal(id))) {
    return c.json({ error: "Falha ao remover animal" }, 500);
  }

  return c.body(null, 204);
});

export default animais;
