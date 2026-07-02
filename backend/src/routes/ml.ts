import { Hono } from "hono";

const ml = new Hono();

const ML_SERVICE_URL = Deno.env.get("ML_SERVICE_URL") || "http://localhost:8001";

async function proxy(path: string, body?: unknown) {
  try {
    const url = `${ML_SERVICE_URL}${path}`;
    const opts: RequestInit = {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

ml.post("/predicao", async (c) => {
  const body = await c.req.json();
  const result = await proxy("/ml/predicao", body);
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
  const result = await proxy("/ml/anomalias", body);
  if (!result) {
    return c.json({ anomalia: false, score: 0, motivo: "ML Service indisponivel" }, 503);
  }
  return c.json(result);
});

ml.post("/treinar", async (c) => {
  const result = await proxy("/ml/treinar");
  if (!result) {
    return c.json({ status: "erro", mensagem: "ML Service indisponivel" }, 503);
  }
  return c.json(result);
});

ml.get("/health", async (c) => {
  const result = await proxy("/ml/health");
  if (!result) {
    return c.json({ status: "offline", version: "0.0.0" });
  }
  return c.json(result);
});

export default ml;
