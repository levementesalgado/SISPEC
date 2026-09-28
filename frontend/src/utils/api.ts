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

function clearSession(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight

  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return false

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!res.ok) {
        clearSession()
        return false
      }
      const data = await res.json()
      localStorage.setItem('token', data.token)
      localStorage.setItem('refresh_token', data.refresh_token)
      return true
    } catch {
      return false
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const send = () => fetch(`${API_BASE}${path}`, { ...init, headers: getHeaders() })

  let res = await send()

  if (res.status === 401) {
    const renewed = await refreshAccessToken()
    if (!renewed) {
      clearSession()
      window.location.href = '/login'
      throw new Error('Sessão expirada')
    }
    res = await send()
  }

  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar ${path}`)
  return res.json() as Promise<T>
}

async function apiSend<T>(path: string, method: string, data: unknown, errorFallback: string): Promise<T> {
  const init: RequestInit = {
    method,
    headers: getHeaders(),
    body: JSON.stringify(data),
  }

  let res = await fetch(`${API_BASE}${path}`, init)

  if (res.status === 401) {
    const renewed = await refreshAccessToken()
    if (!renewed) {
      clearSession()
      window.location.href = '/login'
      throw new Error('Sessão expirada')
    }
    res = await fetch(`${API_BASE}${path}`, init)
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail || error.error || errorFallback)
  }
  return res.json() as Promise<T>
}

export async function fetchKPIs(params = ''): Promise<KPIs> {
  return apiFetch(`/dashboard/kpis${params}`)
}

export async function fetchGMDData(): Promise<{ semana: string; gmd: number; meta: number }[]> {
  return apiFetch(`/dashboard/gmd-semanas`)
}

export async function fetchAlertas(params = ''): Promise<{ tipo: string; titulo: string; descricao: string }[]> {
  return apiFetch(`/dashboard/alertas${params}`)
}

export async function fetchDashboardOperacional(params = ''): Promise<DashboardOperacionalData> {
  return apiFetch(`/dashboard/operacional${params}`)
}

export async function fetchAnimais(params: Record<string, string> = {}): Promise<Animal[]> {
  const query = new URLSearchParams(params)
  return apiFetch(`/animais?${query}`)
}

export async function fetchAnimal(id: string): Promise<Animal> {
  return apiFetch(`/animais/${id}`)
}

export async function fetchPesagens(params: Record<string, string> = {}): Promise<Pesagem[]> {
  const query = new URLSearchParams(params)
  return apiFetch(`/pesagens?${query}`)
}

export async function fetchLotes(): Promise<Lote[]> {
  return apiFetch(`/lotes`)
}

export async function criarAnimal(data: AnimalCreate): Promise<Animal> {
  return apiSend(`/animais`, 'POST', data, 'Erro ao criar animal')
}

export async function criarPesagem(data: PesagemCreate): Promise<Pesagem> {
  return apiSend(`/pesagens`, 'POST', data, 'Erro ao criar pesagem')
}

export async function criarLote(data: LoteCreate): Promise<Lote> {
  return apiSend(`/lotes`, 'POST', data, 'Erro ao criar lote')
}

export async function fetchProducoes(params: Record<string, string> = {}): Promise<Producao[]> {
  const query = new URLSearchParams(params)
  return apiFetch(`/producoes?${query}`)
}

export async function criarProducao(data: ProducaoCreate): Promise<Producao> {
  return apiSend(`/producoes`, 'POST', data, 'Erro ao registrar produção')
}

export async function atualizarAnimal(id: string, data: AnimalUpdate): Promise<Animal> {
  return apiSend(`/animais/${id}`, 'PUT', data, 'Erro ao atualizar animal')
}
