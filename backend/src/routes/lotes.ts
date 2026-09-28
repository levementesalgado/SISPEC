import { Hono } from "hono";
import { getRepo } from "../db/index.ts";
import type { LoteCreate } from "../types.ts";

const lotes = new Hono();

lotes.get("/", async (c) => {
  const { modalidade } = c.req.query();
  return c.json(await getRepo().listLotes({ modalidade: modalidade || undefined }));
});

lotes.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const lote = await getRepo().getLote(id);
  if (!lote) return c.json({ error: "Lote não encontrado" }, 404);

  const repo = getRepo();
  const totais = await repo.countAnimaisPorLote();
  return c.json({ ...lote, total_animais: totais.get(id) ?? 0 });
});

lotes.post("/", async (c) => {
  const body = await c.req.json();
  if (!body.nome) return c.json({ error: "Nome é obrigatório" }, 400);

  const repo = getRepo();
  if (await repo.findLoteByNome(body.nome)) {
    return c.json({ error: "Lote já existe" }, 400);
  }

  const modalidade = ["CORTE", "LEITE"].includes(body.modalidade) ? body.modalidade : "CORTE";
  const data: LoteCreate = { nome: body.nome, descricao: body.descricao ?? null, modalidade };

  return c.json(await repo.createLote(data), 201);
});

lotes.put("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  const body = await c.req.json();
  const patch: Record<string, unknown> = {};
  if (body.nome !== undefined) patch.nome = body.nome;
  if (body.descricao !== undefined) patch.descricao = body.descricao;
  if (body.modalidade !== undefined) patch.modalidade = body.modalidade;
  if (body.ativo !== undefined) patch.ativo = body.ativo;

  const updated = await getRepo().updateLote(id, patch);
  if (!updated) return c.json({ error: "Lote não encontrado" }, 404);

  return c.json(updated);
});

lotes.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (Number.isNaN(id)) return c.json({ error: "ID inválido" }, 400);

  if (!(await getRepo().deactivateLote(id))) {
    return c.json({ error: "Lote não encontrado" }, 404);
  }

  return c.body(null, 204);
});

export default lotes;
