const API_BASE = '/api/v1'

function getHeaders() {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function fetchKPIs() {
  const res = await fetch(`${API_BASE}/dashboard/kpis`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar KPIs')
  return res.json()
}

export async function fetchGMDData() {
  const res = await fetch(`${API_BASE}/dashboard/gmd-semanas`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar dados de GMD')
  return res.json()
}

export async function fetchAlertas() {
  const res = await fetch(`${API_BASE}/dashboard/alertas`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar alertas')
  return res.json()
}

export async function fetchAnimais(params = {}) {
  const query = new URLSearchParams(params)
  const res = await fetch(`${API_BASE}/animais?${query}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar animais')
  return res.json()
}

export async function fetchAnimal(id) {
  const res = await fetch(`${API_BASE}/animais/${id}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar animal')
  return res.json()
}

export async function fetchPesagens(params = {}) {
  const query = new URLSearchParams(params)
  const res = await fetch(`${API_BASE}/pesagens?${query}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar pesagens')
  return res.json()
}

export async function fetchLotes() {
  const res = await fetch(`${API_BASE}/lotes`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Erro ao buscar lotes')
  return res.json()
}

export async function criarAnimal(data) {
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

export async function criarPesagem(data) {
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

export async function criarLote(data) {
  const res = await fetch(`${API_BASE}/lotes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || error.error || 'Erro ao criar lote')
  }
  return res.json()
}