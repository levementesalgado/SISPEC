import { env } from "../env.ts";
import { readDB } from "../db/json.ts";
import { calcularGMD, getGMDStatus, getDiasParaAbate, calcularDiasConfinamento } from "./calculos.ts";

export async function getMetricsAnimal(animalId: number) {
  const db = await readDB();
  const animal = db.animais.find((a: any) => a.id === animalId);
  
  if (!animal) return null;
  
  // Pegar última pesagem
  const pesagens = db.pesagens
    .filter((p: any) => p.animal_id === animalId)
    .sort((a: any, b: any) => new Date(b.data_pesagem).getTime() - new Date(a.data_pesagem).getTime());
  
  const pesoAtual = pesagens.length > 0 ? pesagens[0].peso : animal.peso_entrada;
  const gmd = calcularGMD(animal.peso_entrada, pesoAtual, animal.data_entrada, formatDate(new Date()));
  
  return {
    peso_atual: pesoAtual,
    gmd: gmd,
    gmd_status: gmd > 0 ? getGMDStatus(gmd, env.GMD_META) : "sem_pesagem",
    dias_confinamento: calcularDiasConfinamento(animal.data_entrada),
    dias_para_abate: getDiasParaAbate(pesoAtual, gmd, env.PESO_ABATE)
  };
}

export async function getDashboardKPIs() {
  const db = await readDB();
  const animais = db.animais.filter((a: any) => a.status === "ATIVO");
  
  if (animais.length === 0) {
    return {
      total_animais: 0,
      gmd_medio: 0,
      peso_medio: 0,
      conversao_alimentar: env.ICA_IDEAL,
      animais_abaixo_meta: 0,
      animais_proximo_abate: 0
    };
  }
  
  let gmds: number[] = [];
  let pesos: number[] = [];
  let abaixoMeta = 0;
  let proximoAbate = 0;
  
  for (const animal of animais) {
    const metrics = await getMetricsAnimal(animal.id);
    if (metrics && metrics.gmd > 0) {
      gmds.push(metrics.gmd);
      pesos.push(metrics.peso_atual);
      
      if (metrics.gmd_status === "warn" || metrics.gmd_status === "crit") {
        abaixoMeta++;
      }
      
      if (metrics.dias_para_abate && metrics.dias_para_abate <= 30) {
        proximoAbate++;
      }
    }
  }
  
  return {
    total_animais: animais.length,
    gmd_medio: gmds.length > 0 ? Math.round((gmds.reduce((a, b) => a + b, 0) / gmds.length) * 100) / 100 : 0,
    peso_medio: pesos.length > 0 ? Math.round(pesos.reduce((a, b) => a + b, 0) / pesos.length * 10) / 10 : 0,
    conversao_alimentar: env.ICA_IDEAL,
    animais_abaixo_meta: abaixoMeta,
    animais_proximo_abate: proximoAbate
  };
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}