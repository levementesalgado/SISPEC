import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle, Scale, Activity, BarChart3, Target, Milk } from 'lucide-react'
import { fetchKPIs, fetchGMDData, fetchAlertas } from '../utils/api'
import { useModalidade } from '../App'
import type { KPIs } from '../types'

export default function Dashboard() {
  const modalidade = useModalidade()
  const isCorte = modalidade === 'CORTE'
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [gmdData, setGmdData] = useState<{ semana: string; gmd: number; meta: number }[]>([])
  const [alertas, setAlertas] = useState<{ tipo: string; titulo: string; descricao: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const params = `?modalidade=${modalidade}`
        const [kpisData, gmd, alertasData] = await Promise.all([
          fetchKPIs(params),
          isCorte ? fetchGMDData() : Promise.resolve([]),
          fetchAlertas(params)
        ])
        setKpis(kpisData)
        setGmdData(gmd)
        setAlertas(alertasData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [modalidade])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-red-500/30 bg-red-500/10">
        <p className="text-red-400">Erro: {error}</p>
        <p className="text-white/60 text-sm mt-2">Verifique se o backend está rodando em http://localhost:8000</p>
      </div>
    )
  }

  const kpiCorte = kpis as Record<string, number> | null
  const kpiCards = isCorte ? [
    { label: 'Total de Animais', value: kpiCorte?.total_animais || 0, unit: 'cabeças', icon: Activity, color: 'text-sage' },
    { label: 'GMD Médio', value: kpiCorte?.gmd_medio || 0, unit: 'kg/dia', icon: TrendingUp, color: (kpiCorte?.gmd_medio || 0) >= 1 ? 'text-green-400' : 'text-amber' },
    { label: 'Peso Médio', value: kpiCorte?.peso_medio || 0, unit: 'kg', icon: Scale, color: 'text-sage' },
    { label: 'ICA', value: kpiCorte?.conversao_alimentar || 0, unit: ':1', icon: Scale, color: (kpiCorte?.conversao_alimentar || 0) <= 6 ? 'text-green-400' : 'text-amber' },
  ] : [
    { label: 'Total de Vacas', value: kpiCorte?.total_animais || 0, unit: 'cabeças', icon: Milk, color: 'text-sage' },
    { label: 'Prod. Média', value: kpiCorte?.producao_media || 0, unit: 'L/dia', icon: TrendingUp, color: (kpiCorte?.producao_media || 0) >= 20 ? 'text-green-400' : 'text-amber' },
    { label: 'CCS Médio', value: kpiCorte?.ccs_medio || 0, unit: 'mil/mL', icon: Scale, color: (kpiCorte?.ccs_medio || 0) <= 200 ? 'text-green-400' : 'text-amber' },
    { label: 'Dias Lactação', value: kpiCorte?.dias_lactacao_medio || 0, unit: 'dias', icon: Activity, color: 'text-sage' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-paper">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/dashboard/operacional" className="card group hover:border-sage/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center">
              <Activity size={20} className="text-sage" />
            </div>
            <div>
              <h3 className="font-semibold text-paper group-hover:text-sage transition-colors">Operacional</h3>
              <p className="text-xs text-white/40 mt-0.5">12 KPIs em tempo real</p>
            </div>
          </div>
        </Link>
        <Link to="/dashboard/tatico" className="card group hover:border-sage/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center">
              <BarChart3 size={20} className="text-sage" />
            </div>
            <div>
              <h3 className="font-semibold text-paper group-hover:text-sage transition-colors">Tático</h3>
              <p className="text-xs text-white/40 mt-0.5">8 indicadores gerenciais</p>
            </div>
          </div>
        </Link>
        <Link to="/dashboard/estrategico" className="card group hover:border-sage/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center">
              <Target size={20} className="text-sage" />
            </div>
            <div>
              <h3 className="font-semibold text-paper group-hover:text-sage transition-colors">Estratégico</h3>
              <p className="text-xs text-white/40 mt-0.5">6 indicadores executivos</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, unit, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-white/40 font-mono">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <div className="text-3xl font-serif text-paper">
              {typeof value === 'number' ? value.toFixed(2) : value}
              <span className="text-sm text-white/40 ml-1">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-amber" />
            Alertas
          </h2>
          <div className="space-y-3">
            {alertas.slice(0, 5).map((alerta, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  alerta.tipo === 'crit'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : alerta.tipo === 'warn'
                    ? 'bg-amber/10 border-amber/30 text-amber'
                    : 'bg-green-500/10 border-green-500/30 text-green-400'
                }`}
              >
                <div className="font-semibold">{alerta.titulo}</div>
                <div className="text-sm opacity-70 mt-1">{alerta.descricao}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCorte && (
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Ganho Médio Diário por Semana</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gmdData}>
              <XAxis dataKey="semana" stroke="#52b788" fontSize={12} />
              <YAxis stroke="#52b788" fontSize={12} domain={[0, 1.5]} />
              <Tooltip
                contentStyle={{ background: '#1b4332', border: '1px solid #52b788', borderRadius: '8px' }}
                labelStyle={{ color: '#f4f1eb' }}
              />
              <Bar dataKey="gmd" fill="#52b788" name="GMD Real" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" fill="#52b788" opacity={0.2} name="Meta" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      <div className="text-center text-white/40 text-sm">
        <p>API: /api/v1 · Banco SQLite: backend/sispec.db</p>
      </div>
    </div>
  )
}
