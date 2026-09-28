import type {
  Animal,
  Lote,
  Pesagem,
  Producao,
  DashboardOperacionalData,
  KPIs,
  AnimalCreate,
  AnimalUpdate,
  PesagemCreate,
  LoteCreate,
  ProducaoCreate,
} from '../types'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

function getHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function fetchKPIs(params = ''): Promise<KPIs> {
  const res = await fetch(`${API_BASE}/dashboard/kpis${params}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar KPIs')
  return res.json()
}

export async function fetchGMDData(): Promise<{ semana: string; gmd: number; meta: number }[]> {
  const res = await fetch(`${API_BASE}/dashboard/gmd-semanas`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar dados de GMD')
  return res.json()
}

export async function fetchAlertas(params = ''): Promise<{ tipo: string; titulo: string; descricao: string }[]> {
  const res = await fetch(`${API_BASE}/dashboard/alertas${params}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar alertas')
  return res.json()
}

export async function fetchDashboardOperacional(params = ''): Promise<DashboardOperacionalData> {
  const res = await fetch(`${API_BASE}/dashboard/operacional${params}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar dashboard operacional')
  return res.json()
}

export async function fetchAnimais(params: Record<string, string> = {}): Promise<Animal[]> {
  const query = new URLSearchParams(params)
  const res = await fetch(`${API_BASE}/animais?${query}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar animais')
  return res.json()
}

export async function fetchAnimal(id: string): Promise<Animal> {
  const res = await fetch(`${API_BASE}/animais/${id}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar animal')
  return res.json()
}

export async function fetchPesagens(params: Record<string, string> = {}): Promise<Pesagem[]> {
  const query = new URLSearchParams(params)
  const res = await fetch(`${API_BASE}/pesagens?${query}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar pesagens')
  return res.json()
}

export async function fetchLotes(): Promise<Lote[]> {
  const res = await fetch(`${API_BASE}/lotes`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar lotes')
  return res.json()
}

export async function criarAnimal(data: AnimalCreate): Promise<Animal> {
  const res = await fetch(`${API_BASE}/animais`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || error.error || 'Erro ao criar animal')
  }
  return res.json()
}

export async function criarPesagem(data: PesagemCreate): Promise<Pesagem> {
  const res = await fetch(`${API_BASE}/pesagens`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || error.error || 'Erro ao criar pesagem')
  }
  return res.json()
}

export async function criarLote(data: LoteCreate): Promise<Lote> {
  const res = await fetch(`${API_BASE}/lotes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Erro ao criar lote')
  }
  return res.json()
}

export async function fetchProducoes(params: Record<string, string> = {}): Promise<Producao[]> {
  const query = new URLSearchParams(params)
  const res = await fetch(`${API_BASE}/producoes?${query}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar produções')
  return res.json()
}

export async function criarProducao(data: ProducaoCreate): Promise<Producao> {
  const res = await fetch(`${API_BASE}/producoes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Erro ao registrar produção')
  }
  return res.json()
}

export async function atualizarAnimal(id: string, data: AnimalUpdate): Promise<Animal> {
  const res = await fetch(`${API_BASE}/animais/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Erro ao atualizar animal')
  }
  return res.json()
}
