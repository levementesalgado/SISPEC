import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { TrendingUp, DollarSign, Leaf, BarChart3, BrainCircuit } from 'lucide-react'

const SERIE_HISTORICA = [
  { safra: '2021', animais: 180, gmd_medio: 0.98, peso_abate: 475 },
  { safra: '2022', animais: 220, gmd_medio: 1.02, peso_abate: 480 },
  { safra: '2023', animais: 195, gmd_medio: 0.95, peso_abate: 468 },
  { safra: '2024', animais: 240, gmd_medio: 1.08, peso_abate: 485 },
  { safra: '2025', animais: 210, gmd_medio: 1.05, peso_abate: 482 },
]

const CORRELACAO = [
  { temp: 22, gmd: 1.15 },
  { temp: 25, gmd: 1.08 },
  { temp: 28, gmd: 0.95 },
  { temp: 30, gmd: 0.82 },
  { temp: 32, gmd: 0.72 },
  { temp: 35, gmd: 0.58 },
]

const ESG_METRICAS: { indicador: string; valor: string; unidade: string; status: 'ok' | 'warn' }[] = [
  { indicador: 'Pegada de Carbono', valor: '2.4', unidade: 'tCO₂e/cab', status: 'ok' },
  { indicador: 'Eficiência Hídrica', valor: '85', unidade: 'L/kg', status: 'ok' },
  { indicador: 'Bem-Estar Animal', valor: 'A', unidade: 'score', status: 'warn' },
  { indicador: 'Taxa de Conforto', valor: '78', unidade: '%', status: 'ok' },
]

export default function DashboardEstrategico() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-paper">Dashboard Estratégico</h1>
        <p className="text-white/40 text-sm mt-1">6 indicadores executivos · atualização mensal</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Safras Analisadas</span>
          <div className="text-2xl font-serif text-paper mt-1">5</div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Faturamento Projetado</span>
          <div className="text-2xl font-serif text-paper mt-1">R$ 142.500</div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Margem por Cabeça</span>
          <div className="text-2xl font-serif text-paper mt-1">R$ 680</div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">ROI da Tecnologia</span>
          <div className="text-2xl font-serif text-paper mt-1">340 <span className="text-sm text-white/40">%</span></div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Score ESG</span>
          <div className="text-2xl font-serif text-paper mt-1">82 <span className="text-sm text-white/40">/100</span></div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Modelo ML Ativo</span>
          <div className="text-lg font-serif text-paper mt-1">Random Forest</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
            <BarChart3 size={16} /> Série Histórica de Desempenho
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SERIE_HISTORICA}>
                <XAxis dataKey="safra" stroke="#52b788" fontSize={11} />
                <YAxis stroke="#52b788" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1b4332', border: '1px solid #52b788', borderRadius: '8px' }} />
                <Bar dataKey="gmd_medio" fill="#52b788" name="GMD Médio" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
            <BrainCircuit size={16} /> Correlação Temperatura × GMD
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis dataKey="temp" name="Temperatura" unit="°C" stroke="#52b788" fontSize={11} />
                <YAxis dataKey="gmd" name="GMD" unit="kg/dia" stroke="#52b788" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1b4332', border: '1px solid #52b788', borderRadius: '8px' }} />
                <Scatter data={CORRELACAO} fill="#52b788" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
          <Leaf size={16} /> Scorecard ESG
        </h2>
        <div className="grid md:grid-cols-4 gap-3">
          {ESG_METRICAS.map((item) => (
            <div key={item.indicador} className={`p-3 rounded-lg border ${
              item.status === 'ok' ? 'bg-green-500/10 border-green-500/30' : 'bg-amber/10 border-amber/30'
            }`}>
              <div className="text-xs text-white/40 font-mono">{item.indicador}</div>
              <div className="text-xl font-serif text-paper mt-1">
                {item.valor}
                <span className="text-xs text-white/40 ml-1">{item.unidade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
