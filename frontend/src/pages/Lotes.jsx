import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { fetchLotes, criarLote } from '../utils/api'

export default function Lotes() {
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [novoLote, setNovoLote] = useState({ nome: '', descricao: '' })

  useEffect(() => {
    async function loadLotes() {
      try {
        const data = await fetchLotes()
        setLotes(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadLotes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const created = await criarLote(novoLote)
      setLotes([...lotes, created])
      setNovoLote({ nome: '', descricao: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-paper">Lotes</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Novo Lote
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Criar Novo Lote</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Nome *</label>
              <input
                type="text"
                value={novoLote.nome}
                onChange={(e) => setNovoLote({ ...novoLote, nome: e.target.value })}
                className="input"
                placeholder="Ex: Lote A — Confinamento"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Descrição</label>
              <textarea
                value={novoLote.descricao}
                onChange={(e) => setNovoLote({ ...novoLote, descricao: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Descrição opcional do lote"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-500/30 bg-red-500/10">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lotes.map((lote) => (
          <div key={lote.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sage">{lote.nome}</h3>
                {lote.descricao && (
                  <p className="text-sm text-white/60 mt-1">{lote.descricao}</p>
                )}
              </div>
              <span className={`badge ${lote.ativo ? 'badge-ok' : 'badge-warn'}`}>
                {lote.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {lotes.length === 0 && !loading && (
        <div className="text-center py-12 text-white/40">
          <p>Nenhum lote cadastrado</p>
        </div>
      )}
    </div>
  )
}