import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle, Scale, Activity } from 'lucide-react'
import { fetchKPIs, fetchGMDData, fetchAlertas } from '../utils/api'

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [gmdData, setGmdData] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [kpisData, gmd, alertasData] = await Promise.all([
          fetchKPIs(),
          fetchGMDData(),
          fetchAlertas()
        ])
        setKpis(kpisData)
        setGmdData(gmd)
        setAlertas(alertasData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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

  const kpiCards = [
    { label: 'Total de Animais', value: kpis?.total_animais || 0, unit: 'cabeças', icon: Activity, color: 'text-sage' },
    { label: 'GMD Médio', value: kpis?.gmd_medio || 0, unit: 'kg/dia', icon: TrendingUp, color: kpis?.gmd_medio >= 1 ? 'text-green-400' : 'text-amber' },
    { label: 'Peso Médio', value: kpis?.peso_medio || 0, unit: 'kg', icon: Scale, color: 'text-sage' },
    { label: 'ICA', value: kpis?.conversao_alimentar || 0, unit: ':1', icon: Scale, color: kpis?.conversao_alimentar <= 6 ? 'text-green-400' : 'text-amber' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif text-paper">Dashboard</h1>

      {/* KPIs */}
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

      {/* Alerts */}
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

      {/* GMD Chart */}
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

      {/* Info */}
      <div className="text-center text-white/40 text-sm">
        <p>API: /api/v1 · Banco SQLite: backend/sispec.db</p>
      </div>
    </div>
  )
}