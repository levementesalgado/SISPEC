import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { criarAnimal, fetchLotes } from '../utils/api'

export default function Cadastro() {
  const navigate = useNavigate()
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3
  
  const [form, setForm] = useState({
    brinco: '',
    raca: 'Nelore',
    sexo: 'MACHO',
    data_entrada: new Date().toISOString().split('T')[0],
    peso_entrada: '',
    lote_id: '',
    observacao: ''
  })

  const [composicao, setComposicao] = useState([
    { raca: 'Nelore', porcentagem: 50 },
    { raca: 'Angus', porcentagem: 50 }
  ])

  const racasBase = ['Nelore', 'Angus', 'Brahman', 'Senepol', 'Girolando']
  const porcentagens = [25, 50, 75, 100]

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

  const handleRacaChange = (e) => {
    const novaRaca = e.target.value
    setForm({ ...form, raca: novaRaca })
    if (novaRaca === 'Cruzado') {
      setComposicao([
        { raca: 'Nelore', porcentagem: 50 },
        { raca: 'Angus', porcentagem: 50 }
      ])
    }
  }

  const atualizaComposicao = (index, campo, valor) => {
    const nova = [...composicao]
    nova[index][campo] = valor
    setComposicao(nova)
  }

  const adicionaRaca = () => {
    if (composicao.length < 4) {
      setComposicao([...composicao, { raca: '', porcentagem: 25 }])
    }
  }

  const removeRaca = (index) => {
    if (composicao.length > 2) {
      const nova = composicao.filter((_, i) => i !== index)
      setComposicao(nova)
    }
  }

  const nextStep = () => {
    if (step === 1 && !form.brinco) {
      setError('Brinco é obrigatório')
      return
    }
    if (step === 2 && (!form.data_entrada || !form.peso_entrada)) {
      setError('Data e peso são obrigatórios')
      return
    }
    setError(null)
    if (step < totalSteps) setStep(step + 1)
  }

  const prevStep = () => {
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const animalData = {
        ...form,
        peso_entrada: parseFloat(form.peso_entrada),
        lote_id: form.lote_id ? parseInt(form.lote_id) : null
      }
      if (form.raca === 'Cruzado') {
        animalData.composicao = composicao.filter(c => c.raca && c.porcentagem)
      }
      await criarAnimal(animalData)
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

  const steps = [
    { num: 1, title: 'Identificação' },
    { num: 2, title: 'Dados' },
    { num: 3, title: 'Lote' }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-serif text-paper">Cadastrar Animal</h1>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
              step >= s.num 
                ? 'bg-green-500 text-white' 
                : 'bg-white/10 text-white/40'
            }`}>
              {step > s.num ? <CheckCircle size={20} /> : s.num}
            </div>
            <span className={`ml-2 text-sm ${step >= s.num ? 'text-white' : 'text-white/40'}`}>
              {s.title}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight size={16} className="mx-2 text-white/20" />
            )}
          </div>
        ))}
      </div>

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

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        {/* Step 1: Identificação */}
        {step === 1 && (
          <>
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
                  onChange={handleRacaChange}
                  className="input"
                >
                  {racasBase.map(r => <option key={r} value={r}>{r}</option>)}
                  <option value="Cruzado">Cruzado</option>
                </select>
              </div>
            </div>

            {form.raca === 'Cruzado' && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-3">
                <label className="block text-sm text-white/60 mb-2">Composição Racial (%)</label>
                {composicao.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={item.raca}
                      onChange={(e) => atualizaComposicao(index, 'raca', e.target.value)}
                      className="input flex-1"
                    >
                      <option value="">Selecione</option>
                      {racasBase.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <select
                      value={item.porcentagem}
                      onChange={(e) => atualizaComposicao(index, 'porcentagem', parseInt(e.target.value))}
                      className="input w-24"
                    >
                      {porcentagens.map(p => <option key={p} value={p}>{p}%</option>)}
                    </select>
                    {composicao.length > 2 && (
                      <button type="button" onClick={() => removeRaca(index)} className="text-red-400 hover:text-red-300">✕</button>
                    )}
                  </div>
                ))}
                {composicao.length < 4 && (
                  <button type="button" onClick={adicionaRaca} className="text-sm text-green-400 hover:text-green-300">
                    + Adicionar raça
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Step 2: Dados */}
        {step === 2 && (
          <>
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
          </>
        )}

        {/* Step 3: Lote */}
        {step === 3 && (
          <>
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
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary flex items-center gap-2">
              <ChevronLeft size={18} /> Voltar
            </button>
          )}
          
          {step < totalSteps && (
            <button type="button" onClick={nextStep} className="btn-primary flex items-center gap-2">
              Próximo <ChevronRight size={18} />
            </button>
          )}
          
          {step === totalSteps && (
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Registrar Animal'}
            </button>
          )}
          
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}