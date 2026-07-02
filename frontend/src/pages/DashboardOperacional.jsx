import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle, Scale, Activity, Thermometer, Droplets, Clock, Target, Milk, FlaskConical, Droplet, Percent } from 'lucide-react'
import { fetchDashboardOperacional } from '../utils/api'
import { useModalidade } from '../App'

const KPI_CARDS_CORTE = [
  { label: 'GMD Hoje', key: 'gmd_hoje', unit: 'kg/dia', icon: TrendingUp },
  { label: 'GMD do Lote', key: 'gmd_lote', unit: 'kg/dia', icon: Activity },
  { label: 'Peso Médio', key: 'peso_medio', unit: 'kg', icon: Scale },
  { label: 'Desvio Padrão', key: 'desvio_peso', unit: 'kg', icon: Scale },
  { label: 'Dias em Confinamento', key: 'dias_conf', unit: 'dias', icon: Clock },
  { label: 'Projeção Abate', key: 'proj_abate', unit: 'dias', icon: Target },
  { label: 'Temperatura', key: 'temp', unit: '°C', icon: Thermometer },
  { label: 'ITU', key: 'itu', unit: '', icon: Droplets },
  { label: 'Consumo Estimado', key: 'consumo', unit: 'kg/dia', icon: Activity },
  { label: 'Eficiência Alimentar', key: 'eficiencia', unit: '', icon: TrendingUp },
  { label: 'Total Animais', key: 'total_animais', unit: 'cab', icon: Activity },
  { label: 'Alertas Ativos', key: 'alertas_ativos', unit: '', icon: AlertTriangle },
]

const KPI_CARDS_LEITE = [
  { label: 'Produção Média', key: 'producao_media', unit: 'L/dia', icon: Milk },
  { label: 'CCS Médio', key: 'ccs_medio', unit: 'mil/mL', icon: FlaskConical },
  { label: 'Dias Lactação', key: 'dias_lactacao_medio', unit: 'dias', icon: Clock },
  { label: 'Gordura Média', key: 'gordura_media', unit: '%', icon: Droplet },
  { label: 'Proteína Média', key: 'proteina_media', unit: '%', icon: Percent },
  { label: 'Vacas em Lactação', key: 'vacas_em_lactacao', unit: 'cab', icon: Milk },
  { label: 'Vacas Secas', key: 'vacas_secas', unit: 'cab', icon: Activity },
  { label: 'Total Animais', key: 'total_animais', unit: 'cab', icon: Activity },
  { label: 'Alertas Ativos', key: 'alertas_ativos', unit: '', icon: AlertTriangle },
]

export default function DashboardOperacional() {
  const modalidade = useModalidade()
  const isCorte = modalidade === 'CORTE'
  const KPI_CARDS = isCorte ? KPI_CARDS_CORTE : KPI_CARDS_LEITE
  const [kpis, setKpis] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDashboardOperacional(`?modalidade=${modalidade}`)
        setKpis(data.kpis)
        if (isCorte) {
          setTimeline(data.timeline && data.timeline.length ? data.timeline : [
            { semana: 'S1', gmd: 1.1, peso: 310 },
            { semana: 'S2', gmd: 1.3, peso: 325 },
            { semana: 'S3', gmd: 0.9, peso: 338 },
            { semana: 'S4', gmd: 1.2, peso: 355 },
            { semana: 'S5', gmd: 1.0, peso: 368 },
            { semana: 'S6', gmd: 1.4, peso: 385 },
            { semana: 'S7', gmd: 1.1, peso: 398 },
            { semana: 'S8', gmd: 0.8, peso: 408 },
            { semana: 'S9', gmd: 1.3, peso: 425 },
            { semana: 'S10', gmd: 1.0, peso: 438 },
          ])
        }
        setAlertas(data.alertas)
      } catch { /* fallback silencioso */ }
      setLoading(false)
    }
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [modalidade])

  const kpisAtuais = kpis || (isCorte ? {
    gmd_hoje: 1.05, gmd_lote: 1.12, peso_medio: 365, desvio_peso: 42,
    dias_conf: 78, proj_abate: 45, temp: 28.5, itu: 72,
    consumo: 9.8, eficiencia: 0.11, total_animais: 48, alertas_ativos: 3,
  } : {
    producao_media: 25, ccs_medio: 200, dias_lactacao_medio: 120,
    gordura_media: 3.8, proteina_media: 3.3, vacas_em_lactacao: 20,
    vacas_secas: 4, total_animais: 24, alertas_ativos: 0,
  })

  if (loading) return <div className="text-white/40 text-center py-20">Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-paper">Dashboard Operacional — {isCorte ? 'Corte' : 'Leite'}</h1>
          <p className="text-white/40 text-sm mt-1">{isCorte ? '12 KPIs' : '9 KPIs'} em tempo real · atualização a cada 10s</p>
        </div>
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-mono">LIVE</span>
      </div>

      {/* 12 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {KPI_CARDS.map(({ label, key, unit, icon: Icon }) => (
          <div key={key} className="card !p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono truncate">{label}</span>
              <Icon size={14} className="text-sage" />
            </div>
            <div className="text-xl font-serif text-paper">
              {typeof kpisAtuais[key] === 'number' ? kpisAtuais[key].toFixed(kpisAtuais[key] < 10 ? 2 : 0) : kpisAtuais[key]}
              {unit && <span className="text-[10px] text-white/40 ml-1">{unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Timeline GMD + Peso (só para Corte) */}
      {isCorte && (
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-white/80">Curva de GMD por Semana</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <XAxis dataKey="semana" stroke="#52b788" fontSize={11} />
                <YAxis stroke="#52b788" fontSize={11} domain={[0, 1.8]} />
                <Tooltip contentStyle={{ background: '#1b4332', border: '1px solid #52b788', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="gmd" stroke="#52b788" fill="#52b788" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-white/80">Evolução de Peso</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <XAxis dataKey="semana" stroke="#52b788" fontSize={11} />
                <YAxis stroke="#52b788" fontSize={11} domain={[300, 480]} />
                <Tooltip contentStyle={{ background: '#1b4332', border: '1px solid #52b788', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="peso" stroke="#52b788" strokeWidth={2} dot={{ fill: '#52b788', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}

      {/* Alertas em tempo real */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber" />
          Alertas Ativos
        </h2>
        <div className="space-y-2">
          {alertas.length === 0 && (
            <div className="p-3 rounded-lg bg-white/5 text-white/40 text-sm text-center">Nenhum alerta ativo</div>
          )}
          {alertas.map((a, i) => (
            <div key={i} className={`p-3 rounded-lg border ${
              a.tipo === 'crit' ? 'bg-red-500/10 border-red-500/30' :
              a.tipo === 'warn' ? 'bg-amber/10 border-amber/30' :
              'bg-blue-500/10 border-blue-500/30'
            }`}>
              <span className={`font-semibold text-sm ${
                a.tipo === 'crit' ? 'text-red-400' : a.tipo === 'warn' ? 'text-amber' : 'text-blue-400'
              }`}>{a.titulo}</span>
              <span className={`text-sm ml-2 ${
                a.tipo === 'crit' ? 'text-red-400/70' : a.tipo === 'warn' ? 'text-amber/70' : 'text-blue-400/70'
              }`}>{a.descricao}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
