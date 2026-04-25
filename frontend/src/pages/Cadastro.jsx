import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { criarAnimal, fetchLotes } from '../utils/api'

export default function Cadastro() {
  const navigate = useNavigate()
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    brinco: '',
    raca: 'Nelore',
    sexo: 'MACHO',
    data_entrada: new Date().toISOString().split('T')[0],
    peso_entrada: '',
    lote_id: '',
    observacao: ''
  })

  useEffect(() => {
    async function loadLotes() {
      try {
        const data = await fetchLotes()
        setLotes(data)
      } catch (err) {
        console.error('Erro ao carregar lotes:', err)
      }
    }
    loadLotes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await criarAnimal({
        ...form,
        peso_entrada: parseFloat(form.peso_entrada),
        lote_id: form.lote_id ? parseInt(form.lote_id) : null
      })
      setSuccess(true)
      setForm({
        brinco: '',
        raca: 'Nelore',
        sexo: 'MACHO',
        data_entrada: new Date().toISOString().split('T')[0],
        peso_entrada: '',
        lote_id: '',
        observacao: ''
      })
      setTimeout(() => navigate('/animais'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-serif text-paper">Cadastrar Animal</h1>

      {/* Success */}
      {success && (
        <div className="card border-green-500/30 bg-green-500/10 flex items-center gap-3">
          <CheckCircle className="text-green-400" size={24} />
          <div>
            <p className="font-semibold text-green-400">Animal cadastrado com sucesso!</p>
            <p className="text-sm text-white/60">Redirecionando para o rebanho...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-500/30 bg-red-500/10 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={24} />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nº do Brinco *</label>
            <input
              type="text"
              value={form.brinco}
              onChange={(e) => setForm({ ...form, brinco: e.target.value })}
              className="input"
              placeholder="BR-0001"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Raça *</label>
            <select
              value={form.raca}
              onChange={(e) => setForm({ ...form, raca: e.target.value })}
              className="input"
            >
              <option value="Nelore">Nelore</option>
              <option value="Angus">Angus</option>
              <option value="Brahman">Brahman</option>
              <option value="Senepol">Senepol</option>
              <option value="Girolando">Girolando</option>
              <option value="Cruzado">Cruzado</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Data de Entrada *</label>
            <input
              type="date"
              value={form.data_entrada}
              onChange={(e) => setForm({ ...form, data_entrada: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Peso de Entrada (kg) *</label>
            <input
              type="number"
              value={form.peso_entrada}
              onChange={(e) => setForm({ ...form, peso_entrada: e.target.value })}
              className="input"
              placeholder="380"
              min="100"
              step="0.1"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Sexo</label>
            <select
              value={form.sexo}
              onChange={(e) => setForm({ ...form, sexo: e.target.value })}
              className="input"
            >
              <option value="MACHO">Macho</option>
              <option value="FEMEA">Fêmea</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Lote</label>
            <select
              value={form.lote_id}
              onChange={(e) => setForm({ ...form, lote_id: e.target.value })}
              className="input"
            >
              <option value="">Selecione um lote</option>
              {lotes.map((lote) => (
                <option key={lote.id} value={lote.id}>{lote.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Observação</label>
            <input
              type="text"
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
              className="input"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Registrar Animal'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}