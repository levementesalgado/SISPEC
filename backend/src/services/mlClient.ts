// Cliente tipado base para o ML Service (Rust). Só proxy com timeout.
// TODO: enriquecer /animais/:id com peso_projetado usando métricas do repo.

export interface PredicaoInput {
  animal_id: string;
  peso_entrada: number;
  dias_confinamento: number;
  gmd_medio: number;
}

export interface PredicaoOutput {
  peso_projetado: number;
  dias_para_abate: number;
  confianca: number;
  animal_id?: string;
  erro?: string;
}

export interface AnomaliasInput {
  peso_atual: number;
  gmd_atual: number;
  gmd_medio_lote: number;
  dias_confinamento: number;
}

export interface AnomaliasOutput {
  anomalia: boolean;
  score: number;
  motivo: string;
}

const ML_SERVICE_URL = Deno.env.get("ML_SERVICE_URL") || "http://localhost:8001";

async function request<T>(
  path: string,
  method: "GET" | "POST",
  body?: unknown,
  timeoutMs = 3000,
): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const opts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${ML_SERVICE_URL}${path}`, opts);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function predicao(body: PredicaoInput): Promise<PredicaoOutput | null> {
  return request<PredicaoOutput>("/ml/predicao", "POST", body);
}

export async function anomalias(body: AnomaliasInput): Promise<AnomaliasOutput | null> {
  return request<AnomaliasOutput>("/ml/anomalias", "POST", body);
}

export async function treinar(): Promise<unknown> {
  return request<unknown>("/ml/treinar", "POST");
}

export async function health(): Promise<unknown> {
  return request<unknown>("/ml/health", "GET");
}
