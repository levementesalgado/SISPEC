import { Hono } from "hono";
import { getRepo } from "../db/index.ts";
import type { NewProducao } from "../types.ts";

const producoes = new Hono();

producoes.get("/", async (c) => {
  const { animal_id } = c.req.query();
  const animalId = animal_id ? parseInt(animal_id) : undefined;
  if (animalId !== undefined && Number.isNaN(animalId)) {
    return c.json({ error: "animal_id inválido" }, 400);
  }
  return c.json(await getRepo().listProducoes(animalId));
});

producoes.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const producao = await getRepo().getProducao(id);
  if (!producao) return c.json({ error: "Produção não encontrada" }, 404);
  return c.json(producao);
});

producoes.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.animal_id) return c.json({ error: "ID do animal é obrigatório" }, 400);
  if (!body.data) return c.json({ error: "Data é obrigatória" }, 400);
  if (!body.litros || body.litros <= 0) {
    return c.json({ error: "Produção em litros é obrigatória" }, 400);
  }

  const data = new Date(body.data);
  if (Number.isNaN(data.getTime())) return c.json({ error: "Data inválida" }, 400);

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  if (data > hoje) return c.json({ error: "Data não pode ser futura" }, 400);

  const repo = getRepo();
  const animal = await repo.getAnimal(body.animal_id);
  if (!animal) return c.json({ error: "Animal não encontrado" }, 400);

  const nova: NewProducao = {
    animal_id: body.animal_id,
    data: body.data,
    litros: body.litros,
    ccs: body.ccs || null,
    gordura: body.gordura || null,
    proteina: body.proteina || null,
  };

  return c.json(await repo.createProducao(nova), 201);
});

producoes.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  if (!(await getRepo().deleteProducao(id))) {
    return c.json({ error: "Produção não encontrada" }, 404);
  }
  return c.body(null, 204);
});

export default producoes;
