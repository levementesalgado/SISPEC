import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Target, BarChart3, Layers } from 'lucide-react'

const RANKING_LOTES = [
  { lote: 'A-01', gmd: 1.25, animais: 12, peso_medio: 398 },
  { lote: 'B-03', gmd: 1.18, animais: 8, peso_medio: 375 },
  { lote: 'A-12', gmd: 0.82, animais: 10, peso_medio: 342 },
  { lote: 'C-07', gmd: 1.05, animais: 6, peso_medio: 361 },
  { lote: 'B-01', gmd: 0.95, animais: 12, peso_medio: 355 },
]

const DISTRIBUICAO_PESO = [
  { faixa: '<300kg', qtd: 5 },
  { faixa: '300-350', qtd: 12 },
  { faixa: '350-400', qtd: 18 },
  { faixa: '400-450', qtd: 10 },
  { faixa: '>450kg', qtd: 3 },
]

const EVOLUCAO_GMD = [
  { mes: 'Jan', gmd: 1.02 },
  { mes: 'Fev', gmd: 1.08 },
  { mes: 'Mar', gmd: 0.95 },
  { mes: 'Abr', gmd: 1.12 },
  { mes: 'Mai', gmd: 1.05 },
  { mes: 'Jun', gmd: 1.11 },
]

const CENARIOS = [
  { nome: 'Otimista', dias: 38, peso_final: 502, confianca: 0.85 },
  { nome: 'Realista', dias: 45, peso_final: 485, confianca: 0.72 },
  { nome: 'Pessimista', dias: 52, peso_final: 468, confianca: 0.58 },
]

export default function DashboardTatico() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-paper">Dashboard Tático</h1>
        <p className="text-white/40 text-sm mt-1">8 indicadores gerenciais · atualização semanal</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">GMD Médio Geral</span>
          <div className="text-2xl font-serif text-paper mt-1">1.05 <span className="text-sm text-white/40">kg/dia</span></div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Conversão Alimentar</span>
          <div className="text-2xl font-serif text-paper mt-1">5.8 <span className="text-sm text-white/40">:1</span></div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Taxa de Descarte</span>
          <div className="text-2xl font-serif text-paper mt-1">2.1 <span className="text-sm text-white/40">%</span></div>
        </div>
        <div className="card !p-3">
          <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono">Homogeneidade</span>
          <div className="text-2xl font-serif text-paper mt-1">82 <span className="text-sm text-white/40">%</span></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Ranking de Lotes */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
            <BarChart3 size={16} /> Ranking de GMD por Lote
          </h2>
          <div className="space-y-2">
            {RANKING_LOTES.sort((a, b) => b.gmd - a.gmd).map((lote, idx) => (
              <div key={lote.lote} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/40">#{idx + 1}</span>
                  <span className="text-sm font-semibold">{lote.lote}</span>
                  <span className="text-xs text-white/40">{lote.animais} anim.</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono">{lote.gmd.toFixed(2)}</span>
                  <span className="text-xs text-white/40 ml-1">kg/dia</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição de Peso */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
            <Layers size={16} /> Distribuição de Peso
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRIBUICAO_PESO}>
                <XAxis dataKey="faixa" stroke="#52b788" fontSize={11} />
                <YAxis stroke="#52b788" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1b4332', border: '1px solid #52b788', borderRadius: '8px' }} />
                <Bar dataKey="qtd" fill="#52b788" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Simulação de Cenários */}
      <div className="card">
        <h2 className="text-sm font-semibold mb-3 text-white/80 flex items-center gap-2">
          <Target size={16} /> Projeção de Abate — Simulação de Cenários
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {CENARIOS.map((c) => (
            <div key={c.nome} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs uppercase tracking-wider text-white/40 font-mono mb-2">{c.nome}</div>
              <div className="text-2xl font-serif text-paper">{c.dias} <span className="text-sm text-white/40">dias</span></div>
              <div className="mt-2 space-y-1 text-sm text-white/60">
                <div>Peso final: <span className="text-paper">{c.peso_final} kg</span></div>
                <div>Confiança: <span className="text-paper">{(c.confianca * 100).toFixed(0)}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
