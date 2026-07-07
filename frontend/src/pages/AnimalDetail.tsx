import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Scale, TrendingUp, Calendar, Plus, X } from 'lucide-react'
import { fetchAnimal, fetchPesagens, criarPesagem, fetchLotes, atualizarAnimal } from '../utils/api'
import { useToasts } from '../components/Toast'
import type { Animal, Pesagem, Lote } from '../types'

export default function AnimalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToast } = useToasts()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [pesagens, setPesagens] = useState<Pesagem[]>([])
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingLote, setEditingLote] = useState(false)
  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null)
  const [novaPesagem, setNovaPesagem] = useState({ peso: '', observacao: '' })

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    if (!id) return
    try {
      const [animalData, pesagensData, lotesData] = await Promise.all([
        fetchAnimal(id),
        fetchPesagens({ animal_id: id }),
        fetchLotes()
      ])
      setAnimal(animalData)
      setPesagens(pesagensData)
      setLotes(lotesData)
    } catch (err) {
      addToast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleTrocarLote() {
    if (!id || !animal) return
    if (selectedLoteId === (animal.lote_id || null)) {
      setEditingLote(false)
      return
    }
    setSubmitting(true)
    try {
      const updated = await atualizarAnimal(id, { lote_id: selectedLoteId })
      setAnimal(updated)
      setEditingLote(false)
      addToast('Lote atualizado!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNovaPesagem(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)

    try {
      await criarPesagem({
        animal_id: parseInt(id),
        data_pesagem: new Date().toISOString().split('T')[0],
        peso: parseFloat(novaPesagem.peso),
        tecnico: 'Sistema',
        observacao: novaPesagem.observacao || null
      })

      addToast('Pesagem registrada!', 'success')
      setShowForm(false)
      setNovaPesagem({ peso: '', observacao: '' })
      await loadData()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Erro', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const calcularGMD = (p1: Pesagem, p2: Pesagem): number => {
    const diffDias = (new Date(p2.data_pesagem).getTime() - new Date(p1.data_pesagem).getTime()) / (1000 * 60 * 60 * 24)
    const diffPeso = p2.peso - p1.peso
    return diffDias > 0 ? diffPeso / diffDias : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Animal não encontrado</p>
        <button onClick={() => navigate('/animais')} className="btn-secondary mt-4">
          Voltar ao rebanho
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/animais')} className="btn-secondary">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-serif text-sage">{animal.brinco}</h1>
            <p className="text-white/60">{animal.raca} • {animal.sexo}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nova Pesagem
        </button>
      </div>

      {showForm && (
        <div className="card border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Nova Pesagem</h2>
            <button onClick={() => setShowForm(false)} className="text-white/40">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleNovaPesagem} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={novaPesagem.peso}
                  onChange={(e) => setNovaPesagem({ ...novaPesagem, peso: e.target.value })}
                  className="input"
                  placeholder={String(animal.peso_atual || animal.peso_entrada)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Observação</label>
                <input
                  type="text"
                  value={novaPesagem.observacao}
                  onChange={(e) => setNovaPesagem({ ...novaPesagem, observacao: e.target.value })}
                  className="input"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Registrar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Scale size={16} /> Peso Entrada
          </div>
          <p className="text-2xl font-semibold">{animal.peso_entrada} kg</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Scale size={16} /> Peso Atual
          </div>
          <p className="text-2xl font-semibold">{animal.peso_atual || animal.peso_entrada} kg</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <TrendingUp size={16} /> GMD Atual
          </div>
          <p className={`text-2xl font-semibold ${animal.gmd && animal.gmd >= 1 ? 'text-green-400' : 'text-amber'}`}>
            {animal.gmd ? `${animal.gmd} kg/d` : '—'}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Calendar size={16} /> Dias no Sistema
          </div>
          <p className="text-2xl font-semibold">
            {Math.floor((Date.now() - new Date(animal.data_entrada).getTime()) / (1000 * 60 * 60 * 24))} dias
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} /> Histórico de Pesagens
        </h2>

        {pesagens.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-sage/20"></div>
            <div className="space-y-4">
              {pesagens.map((p, index) => {
                const pesoAnterior = index < pesagens.length - 1 ? pesagens[index + 1].peso : animal.peso_entrada
                const gmd = index < pesagens.length - 1 ? calcularGMD(pesagens[index + 1], p) : null
                const daysDiff = index < pesagens.length - 1
                  ? Math.floor((new Date(p.data_pesagem).getTime() - new Date(pesagens[index + 1].data_pesagem).getTime()) / (1000 * 60 * 60 * 24))
                  : 0

                return (
                  <div key={p.id} className="relative flex items-start gap-4 pl-8">
                    <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-ink ${
                      gmd !== null && gmd >= 1 ? 'bg-green-500' :
                      gmd !== null && gmd < 0.5 ? 'bg-red-500' : 'bg-sage'
                    }`} />
                    <div className="flex-1 card !p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sage">
                            {new Date(p.data_pesagem).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-white/60">{p.tecnico}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold">{p.peso} kg</p>
                          {gmd !== null && (
                            <p className={`text-sm ${gmd >= 1 ? 'text-green-400' : 'text-amber'}`}>
                              {gmd.toFixed(2)} kg/dia ({daysDiff} dias)
                            </p>
                          )}
                        </div>
                      </div>
                      {p.observacao && <p className="text-sm text-white/40 mt-2">{p.observacao}</p>}
                    </div>
                  </div>
                )
              })}

              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-2 w-4 h-4 rounded-full border-2 border-ink bg-field" />
                <div className="flex-1 card !p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sage">
                        {new Date(animal.data_entrada).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-white/60">Entrada</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold">{animal.peso_entrada} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-white/40 text-center py-8">Nenhuma pesagem registrada</p>
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Dados do Animal</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40">Data de Entrada</p>
            <p>{new Date(animal.data_entrada).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-white/40">Lote</p>
            {editingLote ? (
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={selectedLoteId ?? ''}
                  onChange={(e) => setSelectedLoteId(e.target.value ? parseInt(e.target.value) : null)}
                  className="input text-sm py-1"
                >
                  <option value="">Sem lote</option>
                  {lotes.map((l) => (
                    <option key={l.id} value={l.id}>{l.nome}</option>
                  ))}
                </select>
                <button onClick={handleTrocarLote} disabled={submitting} className="btn-primary !py-1 !px-3 text-xs">
                  {submitting ? '…' : 'Salvar'}
                </button>
                <button onClick={() => setEditingLote(false)} className="btn-secondary !py-1 !px-3 text-xs">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{animal.lote_nome || 'Sem lote'}</span>
                <button onClick={() => { setSelectedLoteId(animal.lote_id ?? null); setEditingLote(true) }} className="text-sage hover:text-dew">
                  <Edit size={14} />
                </button>
              </div>
            )}
          </div>
          <div>
            <p className="text-white/40">Sexo</p>
            <p>{animal.sexo === 'MACHO' ? 'Macho' : 'Fêmea'}</p>
          </div>
          <div>
            <p className="text-white/40">Raça</p>
            <p>{animal.raca}</p>
          </div>
          {animal.observacao && (
            <div className="md:col-span-2">
              <p className="text-white/40">Observação</p>
              <p>{animal.observacao}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Edit(props: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
