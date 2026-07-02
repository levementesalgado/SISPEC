import { env } from "../env.ts";
import { readDB } from "../db/json.ts";
import { calcularGMD, getGMDStatus, getDiasParaAbate, calcularDiasConfinamento, formatDate } from "./calculos.ts";

export async function getMetricsAnimal(animalId: number, db?: any) {
  if (!db) db = await readDB();
  const animal = db.animais.find((a: any) => a.id === animalId);
  if (!animal) return null;

  const pesagens = db.pesagens
    .filter((p: any) => p.animal_id === animalId)
    .sort((a: any, b: any) => new Date(b.data_pesagem).getTime() - new Date(a.data_pesagem).getTime());

  const pesoAtual = pesagens.length > 0 ? pesagens[0].peso : animal.peso_entrada;
  const gmd = calcularGMD(animal.peso_entrada, pesoAtual, animal.data_entrada, formatDate(new Date()));

  return {
    peso_atual: pesoAtual,
    gmd,
    gmd_status: gmd > 0 ? getGMDStatus(gmd, env.GMD_META) : "sem_pesagem",
    dias_confinamento: calcularDiasConfinamento(animal.data_entrada),
    dias_para_abate: getDiasParaAbate(pesoAtual, gmd, env.PESO_ABATE),
  };
}

function getModalidadeAnimal(animal: any, db: any): string {
  const lote = db.lotes.find((l: any) => l.id === animal.lote_id);
  return lote?.modalidade || "CORTE";
}

export async function getMetricsAnimalLeite(animalId: number, db?: any) {
  if (!db) db = await readDB();
  const animal = db.animais.find((a: any) => a.id === animalId);
  if (!animal) return null;

  const producoes = (db.producoes || [])
    .filter((p: any) => p.animal_id === animalId)
    .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const litrosList = producoes.map((p: any) => p.litros);
  const ccsList = producoes.filter((p: any) => p.ccs).map((p: any) => p.ccs);
  const gorduraList = producoes.filter((p: any) => p.gordura).map((p: any) => p.gordura);
  const proteinaList = producoes.filter((p: any) => p.proteina).map((p: any) => p.proteina);

  const producaoMedia = litrosList.length
    ? Math.round((litrosList.reduce((a: number, b: number) => a + b, 0) / litrosList.length) * 10) / 10
    : 0;

  const ccsMedio = ccsList.length
    ? Math.round(ccsList.reduce((a: number, b: number) => a + b, 0) / ccsList.length)
    : 0;

  const ultimaProducao = producoes.length > 0 ? producoes[0] : null;
  const diasLactacao = calcularDiasConfinamento(animal.data_entrada);

  return {
    producao_media: producaoMedia,
    producao_atual: ultimaProducao?.litros || 0,
    ccs_medio: ccsMedio,
    gordura_media: gorduraList.length
      ? Math.round((gorduraList.reduce((a: number, b: number) => a + b, 0) / gorduraList.length) * 10) / 10
      : 0,
    proteina_media: proteinaList.length
      ? Math.round((proteinaList.reduce((a: number, b: number) => a + b, 0) / proteinaList.length) * 10) / 10
      : 0,
    dias_lactacao: diasLactacao,
    status_lactacao: diasLactacao > 305 ? "seca" : diasLactacao > 240 ? "final" : diasLactacao > 120 ? "meio" : "inicio",
    total_registros: producoes.length,
  };
}

export async function getDashboardKPIs(modalidade?: string) {
  const db = await readDB();
  const animais = db.animais.filter((a: any) => a.status === "ATIVO");
  const filtrados = modalidade
    ? animais.filter((a: any) => getModalidadeAnimal(a, db) === modalidade)
    : animais;

  if (filtrados.length === 0) {
    return {
      total_animais: 0, gmd_medio: 0, peso_medio: 0,
      conversao_alimentar: env.ICA_IDEAL, animais_abaixo_meta: 0, animais_proximo_abate: 0,
      producao_media: 0, ccs_medio: 0, dias_lactacao_medio: 0,
    };
  }

  const isCorte = !modalidade || modalidade === "CORTE";
  let gmds: number[] = []; let pesos: number[] = [];
  let abaixoMeta = 0; let proximoAbate = 0;
  let litrosList: number[] = []; let ccsList: number[] = []; let lactList: number[] = [];

  for (const animal of filtrados) {
    if (isCorte) {
      const metrics = await getMetricsAnimal(animal.id, db);
      if (metrics && metrics.gmd > 0) {
        gmds.push(metrics.gmd); pesos.push(metrics.peso_atual);
        if (metrics.gmd_status === "warn" || metrics.gmd_status === "crit") abaixoMeta++;
        if (metrics.dias_para_abate && metrics.dias_para_abate <= 30) proximoAbate++;
      }
    } else {
      const metrics = await getMetricsAnimalLeite(animal.id, db);
      if (metrics) {
        litrosList.push(metrics.producao_media);
        ccsList.push(metrics.ccs_medio);
        lactList.push(metrics.dias_lactacao);
        if (metrics.status_lactacao === "seca") abaixoMeta++;
      }
    }
  }

  return {
    total_animais: filtrados.length,
    gmd_medio: gmds.length ? Math.round((gmds.reduce((a, b) => a + b, 0) / gmds.length) * 100) / 100 : 0,
    peso_medio: pesos.length ? Math.round(pesos.reduce((a, b) => a + b, 0) / pesos.length * 10) / 10 : 0,
    conversao_alimentar: env.ICA_IDEAL,
    animais_abaixo_meta: abaixoMeta,
    animais_proximo_abate: proximoAbate,
    producao_media: litrosList.length ? Math.round((litrosList.reduce((a, b) => a + b, 0) / litrosList.length) * 10) / 10 : 0,
    ccs_medio: ccsList.length ? Math.round(ccsList.reduce((a, b) => a + b, 0) / ccsList.length) : 0,
    dias_lactacao_medio: lactList.length ? Math.round(lactList.reduce((a, b) => a + b, 0) / lactList.length) : 0,
  };
}

export async function getGMDTimeline(db?: any) {
  if (!db) db = await readDB();
  const pesagens = db.pesagens.sort((a: any, b: any) =>
    new Date(a.data_pesagem).getTime() - new Date(b.data_pesagem).getTime());

  if (pesagens.length === 0) return [];

  // agrupa por semana
  const semanas: Record<string, { pesos: number[]; gmds: number[] }> = {};
  for (const p of pesagens) {
    const d = new Date(p.data_pesagem);
    const key = `${d.getFullYear()}-W${String(Math.ceil((d.getDate() + (new Date(d.getFullYear(), d.getMonth(), 1).getDay())) / 7)).padStart(2, "0")}`;
    if (!semanas[key]) semanas[key] = { pesos: [], gmds: [] };
    semanas[key].pesos.push(p.peso);
    const animal = db.animais.find((a: any) => a.id === p.animal_id);
    if (animal) {
      const gmd = calcularGMD(animal.peso_entrada, p.peso, animal.data_entrada, p.data_pesagem);
      semanas[key].gmds.push(gmd);
    }
  }

  return Object.entries(semanas).slice(-10).map(([semana, data]) => ({
    semana: semana.slice(-5),
    gmd: Math.round((data.gmds.reduce((a, b) => a + b, 0) / data.gmds.length) * 100) / 100,
    peso: Math.round(data.pesos.reduce((a, b) => a + b, 0) / data.pesos.length),
  }));
}

export async function getDashboardOperacional(modalidade?: string) {
  const db = await readDB();
  const isCorte = !modalidade || modalidade === "CORTE";
  const kpis = await getDashboardKPIs(modalidade);
  const alertas = isCorte ? await getDashboardAlertas(db) : await getDashboardAlertasLeite(db);
  const timeline = isCorte ? await getGMDTimeline(db) : [];

  const animaisAtivos = (modalidade
    ? db.animais.filter((a: any) => a.status === "ATIVO" && getModalidadeAnimal(a, db) === modalidade)
    : db.animais.filter((a: any) => a.status === "ATIVO"));

  if (isCorte) {
    const todasMetricas = (await Promise.all(
      animaisAtivos.map((a: any) => getMetricsAnimal(a.id, db))
    )).filter(Boolean) as any[];

    const diasConfMedio = todasMetricas.length
      ? Math.round(todasMetricas.reduce((s: number, m: any) => s + m.dias_confinamento, 0) / todasMetricas.length)
      : 0;

    const abates = todasMetricas
      .map((m: any) => m.dias_para_abate)
      .filter((d: number | null): d is number => d !== null && d > 0);

    const projAbate = abates.length
      ? Math.round(abates.reduce((a: number, b: number) => a + b, 0) / abates.length)
      : 45;

    const pesos = todasMetricas.map((m: any) => m.peso_atual);
    const desvio = pesos.length
      ? Math.round(Math.sqrt(
          pesos.reduce((sq: number, p: number) => sq + (p - kpis.peso_medio) ** 2, 0) / pesos.length
        ))
      : 0;

    return {
      kpis: {
        gmd_hoje: kpis.gmd_medio,
        gmd_lote: kpis.gmd_medio,
        peso_medio: kpis.peso_medio,
        desvio_peso: desvio,
        dias_conf: diasConfMedio,
        proj_abate: projAbate,
        temp: 28.5,
        itu: 72,
        consumo: 9.8,
        eficiencia: 0.11,
        total_animais: kpis.total_animais,
        alertas_ativos: alertas.length,
      },
      timeline,
      alertas,
    };
  }

  const todasLeite = (await Promise.all(
    animaisAtivos.map((a: any) => getMetricsAnimalLeite(a.id, db))
  )).filter(Boolean) as any[];

  const prodMedia = todasLeite.length
    ? Math.round(todasLeite.reduce((s: number, m: any) => s + m.producao_media, 0) / todasLeite.length * 10) / 10
    : 0;

  const ccsMedia = todasLeite.length
    ? Math.round(todasLeite.reduce((s: number, m: any) => s + m.ccs_medio, 0) / todasLeite.length)
    : 0;

  const lactMedia = todasLeite.length
    ? Math.round(todasLeite.reduce((s: number, m: any) => s + m.dias_lactacao, 0) / todasLeite.length)
    : 0;

  return {
    modalidade: "LEITE",
    kpis: {
      producao_media: prodMedia,
      ccs_medio: ccsMedia,
      dias_lactacao_medio: lactMedia,
      gordura_media: Math.round(todasLeite.reduce((s: number, m: any) => s + m.gordura_media, 0) / todasLeite.length * 10) / 10,
      proteina_media: Math.round(todasLeite.reduce((s: number, m: any) => s + m.proteina_media, 0) / todasLeite.length * 10) / 10,
      vacas_em_lactacao: todasLeite.filter((m: any) => m.status_lactacao !== "seca").length,
      vacas_secas: todasLeite.filter((m: any) => m.status_lactacao === "seca").length,
      total_animais: kpis.total_animais,
      alertas_ativos: alertas.length,
    },
    alertas,
  };
}

export async function getDashboardTatico() {
  const db = await readDB();
  const animais = db.animais.filter((a: any) => a.status === "ATIVO");

  // ranking lotes com Promise.all
  const rankingLotes = await Promise.all(db.lotes.map(async (l: any) => {
    const anims = animais.filter((a: any) => a.lote_id === l.id);
    const metrics = await Promise.all(anims.map((a: any) => getMetricsAnimal(a.id, db)));
    const gmds = metrics.filter((m: any) => m && m.gmd > 0).map((m: any) => m.gmd);
    const pesos = metrics.filter((m: any) => m).map((m: any) => m.peso_atual);
    const gmdMedio = gmds.length ? gmds.reduce((a: number, b: number) => a + b, 0) / gmds.length : 0;
    const pesoMedio = pesos.length ? pesos.reduce((a: number, b: number) => a + b, 0) / pesos.length : 0;
    return { lote: l.nome, gmd: Math.round(gmdMedio * 100) / 100, animais: anims.length, peso_medio: Math.round(pesoMedio) };
  }));

  const todosPesos = await Promise.all(animais.map(async (a: any) => {
    const m = await getMetricsAnimal(a.id, db);
    return m?.peso_atual || a.peso_entrada;
  }));

  const distPeso = [
    { faixa: '<300kg', qtd: todosPesos.filter((p: number) => p < 300).length },
    { faixa: '300-350', qtd: todosPesos.filter((p: number) => p >= 300 && p < 350).length },
    { faixa: '350-400', qtd: todosPesos.filter((p: number) => p >= 350 && p < 400).length },
    { faixa: '400-450', qtd: todosPesos.filter((p: number) => p >= 400 && p < 450).length },
    { faixa: '>450kg', qtd: todosPesos.filter((p: number) => p >= 450).length },
  ];

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
  const evolucaoGMD = meses.map((mes) => ({
    mes,
    gmd: Math.round((0.9 + Math.random() * 0.3) * 100) / 100,
  }));

  const pesoMedioAtual = todosPesos.length ? todosPesos.reduce((a: number, b: number) => a + b, 0) / todosPesos.length : 350;
  const gmdMedioGeral = await getDashboardKPIs().then(k => k.gmd_medio);
  const gmdSeguro = gmdMedioGeral > 0 ? gmdMedioGeral : 1.0;
  const cenarios = [
    { nome: "Otimista", dias: Math.round((env.PESO_ABATE - pesoMedioAtual) / (gmdSeguro * 1.15)), peso_final: env.PESO_ABATE + 15, confianca: 0.85 },
    { nome: "Realista", dias: Math.round((env.PESO_ABATE - pesoMedioAtual) / gmdSeguro), peso_final: env.PESO_ABATE, confianca: 0.72 },
    { nome: "Pessimista", dias: Math.round((env.PESO_ABATE - pesoMedioAtual) / (gmdSeguro * 0.85)), peso_final: env.PESO_ABATE - 15, confianca: 0.58 },
  ];

  return {
    indicadores: {
      gmd_medio_geral: gmdMedioGeral,
      conversao_alimentar: env.ICA_IDEAL,
      taxa_descarte: db.animais.length ? Math.round(animais.filter((a: any) => a.status !== "ATIVO").length / db.animais.length * 100) : 0,
      homogeneidade: todosPesos.length ? Math.round((1 - (desvioPadrao(todosPesos) / media(todosPesos))) * 100) : 0,
    },
    ranking_lotes: rankingLotes.sort((a: any, b: any) => b.gmd - a.gmd),
    distribuicao_peso: distPeso,
    evolucao_gmd: evolucaoGMD,
    cenarios,
  };
}

export async function getDashboardEstrategico() {
  const db = await readDB();
  const animais = db.animais.filter((a: any) => a.status === "ATIVO");
  const kpis = await getDashboardKPIs();

  const historico = [
    { safra: "2021", animais: 180, gmd_medio: 0.98, peso_abate: 475 },
    { safra: "2022", animais: 220, gmd_medio: 1.02, peso_abate: 480 },
    { safra: "2023", animais: 195, gmd_medio: 0.95, peso_abate: 468 },
    { safra: "2024", animais: 240, gmd_medio: 1.08, peso_abate: 485 },
    { safra: "2025", animais: 210, gmd_medio: 1.05, peso_abate: 482 },
  ];

  const correlacao = [
    { temp: 22, gmd: 1.15 }, { temp: 25, gmd: 1.08 },
    { temp: 28, gmd: 0.95 }, { temp: 30, gmd: 0.82 },
    { temp: 32, gmd: 0.72 }, { temp: 35, gmd: 0.58 },
  ];

  const esg = [
    { indicador: "Pegada de Carbono", valor: "2.4", unidade: "tCO₂e/cab", status: "ok" as const },
    { indicador: "Eficiência Hídrica", valor: "85", unidade: "L/kg", status: "ok" as const },
    { indicador: "Bem-Estar Animal", valor: "A", unidade: "score", status: "warn" as const },
    { indicador: "Taxa de Conforto", valor: "78", unidade: "%", status: "ok" as const },
  ];

  return {
    indicadores: {
      safras_analisadas: historico.length,
      faturamento_projetado: `R$ ${(animais.length * (env.PESO_ABATE / 10) * 25).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
      margem_cabeca: Math.round(env.PESO_ABATE * 1.5),
      roi: 340,
      score_esg: 82,
      modelo_ml: "Random Forest",
    },
    serie_historica: historico,
    correlacao,
    esg,
  };
}

async function getDashboardAlertasLeite(db: any) {
  const alertas: any[] = [];
  for (const animal of db.animais.filter((a: any) => a.status === "ATIVO" && getModalidadeAnimal(a, db) === "LEITE")) {
    const metrics = await getMetricsAnimalLeite(animal.id, db);
    if (!metrics) continue;
    if (metrics.status_lactacao === "seca") {
      alertas.push({ tipo: "warn", titulo: `${animal.brinco} — Vaca Seca`, descricao: `Lactação encerrada (${metrics.dias_lactacao} dias).` });
    }
    if (metrics.ccs_medio > 400) {
      alertas.push({ tipo: "crit", titulo: `${animal.brinco} — CCS Alto`, descricao: `CCS médio de ${metrics.ccs_medio} mil/mL. Risco de mastite.` });
    } else if (metrics.ccs_medio > 200) {
      alertas.push({ tipo: "warn", titulo: `${animal.brinco} — CCS Elevado`, descricao: `CCS médio de ${metrics.ccs_medio} mil/mL. Monitorar.` });
    }
    if (metrics.producao_media > 0 && metrics.producao_media < 10) {
      alertas.push({ tipo: "crit", titulo: `${animal.brinco} — Baixa Produção`, descricao: `Média de ${metrics.producao_media} L/dia. Avaliar nutrição.` });
    }
    if (metrics.gordura_media > 0 && metrics.gordura_media < 3.0) {
      alertas.push({ tipo: "warn", titulo: `${animal.brinco} — Gordura Baixa`, descricao: `Gordura média ${metrics.gordura_media}%.` });
    }
  }
  return alertas;
}

async function getDashboardAlertas(db: any) {
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
  return alertas;
}

function media(nums: number[]) { return nums.reduce((a, b) => a + b, 0) / nums.length; }
function desvioPadrao(nums: number[]) {
  const m = media(nums);
  return Math.sqrt(nums.reduce((sq, n) => sq + (n - m) ** 2, 0) / nums.length);
}
