import { Hono } from "hono";
import { env } from "../env.ts";
import { readDB } from "../db/json.ts";
import { getDashboardKPIs, getDashboardOperacional, getDashboardTatico, getDashboardEstrategico, getMetricsAnimal, getGMDTimeline } from "../services/metrics.ts";

const dashboard = new Hono();

// KPIs base
dashboard.get("/kpis", async (c) => {
  const kpis = await getDashboardKPIs();
  return c.json(kpis);
});

// GMD por semana
dashboard.get("/gmd-semanas", async (c) => {
  const timeline = await getGMDTimeline();
  return c.json(timeline.length ? timeline : gerarGMDMock());
});

// Alertas
dashboard.get("/alertas", async (c) => {
  const db = await readDB();
  const alertas: any[] = [];
  for (const animal of db.animais.filter((a: any) => a.status === "ATIVO")) {
    const metrics = await getMetricsAnimal(animal.id, db);
    if (!metrics) continue;
    if (metrics.gmd_status === "crit") {
      alertas.push({ tipo: "crit", titulo: `${animal.brinco} — GMD Crítico`, descricao: `GMD de ${metrics.gmd} kg/dia. Avaliação necessária.` });
    } else if (metrics.gmd_status === "warn") {
      alertas.push({ tipo: "warn", titulo: `${animal.brinco} — GMD Baixo`, descricao: `GMD ${metrics.gmd} kg/dia abaixo da meta ${env.GMD_META} kg/dia.` });
    }
    if (metrics.dias_para_abate && metrics.dias_para_abate <= 14) {
      alertas.push({ tipo: "ok", titulo: `${animal.brinco} — Próximo ao Abate`, descricao: `Abate em ${metrics.dias_para_abate} dias.` });
    }
  }
  return c.json(alertas);
});

// Dashboard Operacional — 12 KPIs + timeline + alertas
dashboard.get("/operacional", async (c) => {
  const data = await getDashboardOperacional();
  return c.json(data);
});

// Dashboard Tático — 8 indicadores + ranking + cenários
dashboard.get("/tatico", async (c) => {
  const data = await getDashboardTatico();
  return c.json(data);
});

// Dashboard Estratégico — 6 indicadores + série histórica + ESG
dashboard.get("/estrategico", async (c) => {
  const data = await getDashboardEstrategico();
  return c.json(data);
});

function gerarGMDMock() {
  const semanas = [];
  for (let i = 8; i >= 1; i--) {
    const gmd = Math.round((0.7 + (i * 0.05) + Math.random() * 0.1) * 100) / 100;
    semanas.push({ semana: `S${i}`, gmd: Math.min(gmd, env.GMD_META + 0.2), meta: env.GMD_META, peso: 300 + i * 15 + Math.round(Math.random() * 10) });
  }
  return semanas;
}

export default dashboard;
