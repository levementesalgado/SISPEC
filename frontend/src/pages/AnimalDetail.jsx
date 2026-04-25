import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Scale, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { fetchAnimal, fetchPesagens } from '../utils/api'
import { useToasts } from '../components/Toast'

export default function AnimalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToasts()
  const [animal, setAnimal] = useState(null)
  const [pesagens, setPesagens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    try {
      const [animalData, pesagensData] = await Promise.all([
        fetchAnimal(id),
        fetchPesagens({ animal_id: id })
      ])
      setAnimal(animalData)
      setPesagens(pesagensData)
    } catch (err) {
      addToast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
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

  // Calcular GMD entre pesagens
  const calcularGMD = (p1, p2) => {
    const diffDias = (new Date(p2.data_pesagem) - new Date(p1.data_pesagem)) / (1000 * 60 * 60 * 24)
    const diffPeso = p2.peso - p1.peso
    return diffDias > 0 ? (diffPeso / diffDias).toFixed(2) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/animais')} className="btn-secondary">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-3xl font-serif text-sage">{animal.brinco}</h1>
          <p className="text-white/60">{animal.raca} • {animal.sexo}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Scale size={16} />
            Peso Entrada
          </div>
          <p className="text-2xl font-semibold">{animal.peso_entrada} kg</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Scale size={16} />
            Peso Atual
          </div>
          <p className="text-2xl font-semibold">{animal.peso_atual || animal.peso_entrada} kg</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <TrendingUp size={16} />
            GMD Atual
          </div>
          <p className={`text-2xl font-semibold ${animal.gmd >= 1 ? 'text-green-400' : 'text-amber'}`}>
            {animal.gmd ? `${animal.gmd} kg/d` : '—'}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-white/60 mb-1">
            <Calendar size={16} />
            Dias no Sistema
          </div>
          <p className="text-2xl font-semibold">
            {Math.floor((new Date() - new Date(animal.data_entrada)) / (1000 * 60 * 60 * 24))} dias
          </p>
        </div>
      </div>

      {/* Timeline de Pesagens */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Histórico de Pesagens
        </h2>

        {pesagens.length > 0 ? (
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-sage/20"></div>

            {/* Lista de pesagens */}
            <div className="space-y-4">
              {pesagens.map((p, index) => {
                const pesoAnterior = index < pesagens.length - 1 ? pesagens[index + 1].peso : animal.peso_entrada
                const gmd = index < pesagens.length - 1 ? calcularGMD(pesagens[index + 1], p) : null
                const daysDiff = index < pesagens.length - 1 
                  ? Math.floor((new Date(p.data_pesagem) - new Date(pesagens[index + 1].data_pesagem)) / (1000 * 60 * 60 * 24))
                  : 0

                return (
                  <div key={p.id} className="relative flex items-start gap-4 pl-8">
                    {/* Ponto na linha */}
                    <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-ink ${
                      gmd && parseFloat(gmd) >= 1 ? 'bg-green-500' : 
                      gmd && parseFloat(gmd) < 0.5 ? 'bg-red-500' : 'bg-sage'
                    }`}></div>

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
                          {gmd && (
                            <p className={`text-sm ${parseFloat(gmd) >= 1 ? 'text-green-400' : 'text-amber'}`}>
                              {gmd} kg/dia ({daysDiff} dias)
                            </p>
                          )}
                        </div>
                      </div>
                      {p.observacao && (
                        <p className="text-sm text-white/40 mt-2">{p.observacao}</p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Primeira pesagem (entrada) */}
              <div className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-2 w-4 h-4 rounded-full border-2 border-ink bg-field"></div>
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

      {/* Dados do animal */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Dados do Animal</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/40">Data de Entrada</p>
            <p>{new Date(animal.data_entrada).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-white/40">Lote</p>
            <p>{animal.lote_nome || 'Sem lote'}</p>
          </div>
          <div>
            <p className="text-white/40">Status</p>
            <p className={animal.status === 'ATIVO' ? 'text-green-400' : 'text-amber'}>
              {animal.status}
            </p>
          </div>
          {animal.observacao && (
            <div>
              <p className="text-white/40">Observação</p>
              <p>{animal.observacao}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}