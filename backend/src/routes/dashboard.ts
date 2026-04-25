import { Hono } from "hono";
import { env } from "../env.ts";
import { readDB } from "../db/json.ts";
import { getDashboardKPIs, getMetricsAnimal } from "../services/metrics.ts";

const dashboard = new Hono();

// KPIs
dashboard.get("/kpis", async (c) => {
  const kpis = await getDashboardKPIs();
  return c.json(kpis);
});

// GMD por semana (mock - após implementar histórico real)
dashboard.get("/gmd-semanas", async (c) => {
  const semanas = [];
  for (let i = 8; i >= 1; i--) {
    const gmd = Math.round((0.7 + (i * 0.05) + Math.random() * 0.1) * 100) / 100;
    semanas.push({
      semana: `S${i}`,
      gmd: Math.min(gmd, env.GMD_META + 0.2),
      meta: env.GMD_META
    });
  }
  return c.json(semanas);
});

// Alertas
dashboard.get("/alertas", async (c) => {
  const db = await readDB();
  const alertas: any[] = [];
  
  const animais = db.animais.filter((a: any) => a.status === "ATIVO");
  
  for (const animal of animais) {
    const metrics = await getMetricsAnimal(animal.id);
    
    if (metrics.gmd_status === "crit") {
      alertas.push({
        tipo: "crit",
        titulo: `${animal.brinco} — GMD Crítico`,
        descricao: `Ganho médio diário de ${metrics.gmd} kg/dia. Recomendado avaliação.`
      });
    } else if (metrics.gmd_status === "warn") {
      alertas.push({
        tipo: "warn",
        titulo: `${animal.brinco} — GMD Abaixo da Meta`,
        descricao: `GMD de ${metrics.gmd} kg/dia está abaixo do ideal de ${env.GMD_META} kg/dia.`
      });
    }
    
    if (metrics.dias_para_abate && metrics.dias_para_abate <= 14) {
      alertas.push({
        tipo: "ok",
        titulo: `${animal.brinco} — Próximo ao Abate`,
        descricao: `Animal atingirá peso de abate em ${metrics.dias_para_abate} dias.`
      });
    }
  }
  
  return c.json(alertas);
});

export default dashboard;