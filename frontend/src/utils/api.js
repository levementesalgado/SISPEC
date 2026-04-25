const API_BASE = '/api/v1'

export async function fetchKPIs() {
  const res = await fetch(`${API_BASE}/dashboard/kpis`)
  if (!res.ok) throw new Error('Erro ao buscar KPIs')
  return res.json()
}

export async function fetchGMDData() {
  const res = await fetch(`${API_BASE}/dashboard/gmd-semanas`)
  if (!res.ok) throw new Error('Erro ao buscar dados de GMD')
  return res.json()
}

export async function fetchAlertas() {
  const res = await fetch(`${API_BASE}/dashboard/alertas`)
  if (!res.ok) throw new Error('Erro ao buscar alertas')
  return res.json()
}

export async function fetchAnimais(params = {}) {
  const query = new URLSearchParams(params)
  const res = await fetch(`${API_BASE}/animais?${query}`)
  if (!res.ok) throw new Error('Erro ao buscar animais')
  return res.json()
}

export async function fetchLotes() {
  const res = await fetch(`${API_BASE}/lotes`)
  if (!res.ok) throw new Error('Erro ao buscar lotes')
  return res.json()
}

export async function criarAnimal(data) {
  const res = await fetch(`${API_BASE}/animais`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Erro ao criar animal')
  }
  return res.json()
}

export async function criarLote(data) {
  const res = await fetch(`${API_BASE}/lotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Erro ao criar lote')
  }
  return res.json()
}