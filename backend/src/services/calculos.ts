export function calcularGMD(pesoEntrada: number, pesoAtual: number, dataEntrada: string, dataPesagem: string): number {
  const d1 = new Date(dataEntrada);
  const d2 = new Date(dataPesagem);
  const dias = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  
  if (dias <= 0) return 0;
  return Math.round(((pesoAtual - pesoEntrada) / dias) * 100) / 100;
}

export function calcularDiasConfinamento(dataEntrada: string): number {
  const d1 = new Date(dataEntrada);
  const d2 = new Date();
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function getGMDStatus(gmd: number, meta: number): string {
  if (gmd >= meta) return "ok";
  if (gmd >= meta * 0.7) return "warn";
  return "crit";
}

export function getDiasParaAbate(pesoAtual: number, gmd: number, pesoAbate: number): number | null {
  if (gmd <= 0) return null;
  const falta = pesoAbate - pesoAtual;
  if (falta <= 0) return 0;
  return Math.ceil(falta / gmd);
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}