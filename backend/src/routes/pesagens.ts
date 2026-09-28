import { Hono } from "hono";
import { getRepo } from "../db/index.ts";
import type { NewPesagem } from "../types.ts";

const pesagens = new Hono();

pesagens.get("/", async (c) => {
  const { animal_id } = c.req.query();
  const animalId = animal_id ? parseInt(animal_id) : undefined;
  if (animalId !== undefined && Number.isNaN(animalId)) {
    return c.json({ error: "animal_id inválido" }, 400);
  }
  return c.json(await getRepo().listPesagens(animalId));
});

pesagens.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const pesagem = await getRepo().getPesagem(id);
  if (!pesagem) return c.json({ error: "Pesagem não encontrada" }, 404);
  return c.json(pesagem);
});

pesagens.post("/", async (c) => {
  const body = await c.req.json();

  if (!body.animal_id) return c.json({ error: "ID do animal é obrigatório" }, 400);
  if (!body.data_pesagem) return c.json({ error: "Data da pesagem é obrigatória" }, 400);
  if (!body.peso || body.peso <= 0) return c.json({ error: "Peso é obrigatório" }, 400);
  if (body.peso < 0) return c.json({ error: "Peso não pode ser negativo" }, 400);

  const dataPesagem = new Date(body.data_pesagem);
  if (Number.isNaN(dataPesagem.getTime())) {
    return c.json({ error: "Data da pesagem inválida" }, 400);
  }

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  if (dataPesagem > hoje) {
    return c.json({ error: "Data da pesagem não pode ser futura" }, 400);
  }

  const repo = getRepo();
  const animal = await repo.getAnimal(body.animal_id);
  if (!animal) return c.json({ error: "Animal não encontrado" }, 400);

  if (new Date(dataPesagem) < new Date(animal.data_entrada)) {
    return c.json({
      error: "Data da pesagem não pode ser anterior à entrada do animal",
    }, 400);
  }

  const data: NewPesagem = {
    animal_id: body.animal_id,
    data_pesagem: body.data_pesagem,
    peso: body.peso,
    tecnico: body.tecnico || "Sistema",
    observacao: body.observacao || null,
  };

  return c.json(await repo.createPesagem(data), 201);
});

pesagens.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  if (!(await getRepo().deletePesagem(id))) {
    return c.json({ error: "Pesagem não encontrada" }, 404);
  }
  return c.body(null, 204);
});

export default pesagens;
