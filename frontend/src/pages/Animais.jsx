import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, AlertCircle } from 'lucide-react'
import { fetchAnimais } from '../utils/api'

export default function Animais() {
  const [animais, setAnimais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    async function loadAnimais() {
      try {
        const data = await fetchAnimais()
        setAnimais(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadAnimais()
  }, [])

  const animaisFiltrados = animais.filter(animal =>
    animal.brinco.toLowerCase().includes(filtro.toLowerCase()) ||
    animal.raca.toLowerCase().includes(filtro.toLowerCase()) ||
    (animal.lote_nome && animal.lote_nome.toLowerCase().includes(filtro.toLowerCase()))
  )

  const getStatusBadge = (status, gmd_status) => {
    if (gmd_status === 'crit') return <span className="badge badge-crit">Crítico</span>
    if (gmd_status === 'warn') return <span className="badge badge-warn">Atenção</span>
    return <span className="badge badge-ok">Normal</span>
  }

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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif text-paper">Rebanho</h1>
        <span className="text-white/40 font-mono">{animaisFiltrados.length} animais</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <input
          type="text"
          placeholder="Buscar por brinco, raça ou lote..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="input pl-12"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <table className="table">
          <thead>
            <tr>
              <th>Brinco</th>
              <th>Raça</th>
              <th>Peso Entrada</th>
              <th>Peso Atual</th>
              <th>GMD</th>
              <th>Lote</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {animaisFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-white/40">
                  Nenhum animal encontrado
                </td>
              </tr>
            ) : (
              animaisFiltrados.map((animal) => (
                <tr key={animal.id} className="hover:bg-white/5 cursor-pointer" onClick={() => window.location.href = `/animais/${animal.id}`}>
                  <td className="text-sage font-semibold">{animal.brinco}</td>
                  <td>
                    {animal.raca}
                    {animal.composicao && (
                      <span className="block text-xs text-green-400">
                        {animal.composicao.map(c => `${c.raca.substr(0,3)}/${c.porcentagem}%`).join(' + ')}
                      </span>
                    )}
                  </td>
                  <td>{animal.peso_entrada} kg</td>
                  <td>{animal.peso_atual ? `${animal.peso_atual} kg` : '—'}</td>
                  <td className={animal.gmd ? (animal.gmd >= 1 ? 'text-green-400' : 'text-amber') : 'text-white/40'}>
                    {animal.gmd ? `${animal.gmd} kg/d` : '—'}
                  </td>
                  <td className="text-white/60">{animal.lote_nome || '—'}</td>
                  <td>{getStatusBadge(animal.status, animal.gmd_status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}