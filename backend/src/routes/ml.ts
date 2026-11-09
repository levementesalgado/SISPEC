import { Hono } from "hono";
import { predicao, anomalias, treinar, health } from "../services/mlClient.ts";

const ml = new Hono();

ml.post("/predicao", async (c) => {
  const body = await c.req.json();
  const result = await predicao(body);
  if (!result) {
    return c.json({
      animal_id: body.animal_id,
      peso_projetado: 0,
      dias_para_abate: 0,
      confianca: 0,
      erro: "ML Service indisponivel",
    }, 503);
  }
  return c.json(result);
});

ml.post("/anomalias", async (c) => {
  const body = await c.req.json();
  const result = await anomalias(body);
  if (!result) {
    return c.json({ anomalia: false, score: 0, motivo: "ML Service indisponivel" }, 503);
  }
  return c.json(result);
});

ml.post("/treinar", async (c) => {
  const result = await treinar();
  if (!result) {
    return c.json({ status: "erro", mensagem: "ML Service indisponivel" }, 503);
  }
  return c.json(result);
});

ml.get("/health", async (c) => {
  const result = await health();
  if (!result) {
    return c.json({ status: "offline", version: "0.0.0" });
  }
  return c.json(result);
});

export default ml;
