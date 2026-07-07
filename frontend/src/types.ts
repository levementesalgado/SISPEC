export interface Lote {
  id: number
  nome: string
  descricao?: string
  modalidade: 'CORTE' | 'LEITE'
  ativo: boolean
  created_at?: string
}

export interface Animal {
  id: number
  brinco: string
  raca: string
  sexo: 'MACHO' | 'FEMEA'
  data_entrada: string
  peso_entrada: number
  peso_atual?: number
  gmd?: number
  gmd_status?: 'ok' | 'warn' | 'crit'
  lote_id?: number | null
  lote_nome?: string
  status?: string
  observacao?: string
  composicao?: { raca: string; porcentagem: number }[]
}

export interface Pesagem {
  id: number
  animal_id: number
  data_pesagem: string
  peso: number
  tecnico: string
  observacao?: string
}

export interface Producao {
  id: number
  animal_id: number
  data_producao: string
  quantidade: number
  ccs?: number
  gordura?: number
  proteina?: number
  observacao?: string
}

export interface Alerta {
  tipo: 'crit' | 'warn' | 'info'
  titulo: string
  descricao: string
}

export interface KPI_Corte {
  total_animais: number
  gmd_medio: number
  peso_medio: number
  conversao_alimentar: number
}

export interface KPI_Leite {
  total_animais: number
  producao_media: number
  ccs_medio: number
  dias_lactacao_medio: number
}

export type KPIs = KPI_Corte | KPI_Leite

export interface DashboardOperacionalCorte {
  kpis: Record<string, number>
  timeline: { semana: string; gmd: number; peso: number }[]
  alertas: Alerta[]
}

export interface DashboardOperacionalLeite {
  kpis: Record<string, number>
  alertas: Alerta[]
}

export type DashboardOperacionalData = DashboardOperacionalCorte | DashboardOperacionalLeite

export interface ComposicaoRacial {
  raca: string
  porcentagem: number
}

export interface AnimalFormData {
  brinco: string
  raca: string
  sexo: string
  data_entrada: string
  peso_entrada: string
  lote_id: string
  observacao: string
  composicao?: ComposicaoRacial[]
}
