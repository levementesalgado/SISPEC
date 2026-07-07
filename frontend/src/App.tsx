import { useState, lazy, Suspense, createContext, useContext, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { Menu, X, LayoutDashboard, Users, FolderTree, PlusCircle, LogOut, Loader2, Beef, Milk } from 'lucide-react'

interface ModalidadeContextType {
  modalidade: string
}

export const ModalidadeContext = createContext<ModalidadeContextType>({ modalidade: 'CORTE' })
export function useModalidade(): string {
  return useContext(ModalidadeContext).modalidade
}

const Dashboard = lazy(() => import('./pages/Dashboard'))
const DashboardOperacional = lazy(() => import('./pages/DashboardOperacional'))
const DashboardTatico = lazy(() => import('./pages/DashboardTatico'))
const DashboardEstrategico = lazy(() => import('./pages/DashboardEstrategico'))
const Animais = lazy(() => import('./pages/Animais'))
const Lotes = lazy(() => import('./pages/Lotes'))
const Cadastro = lazy(() => import('./pages/Cadastro'))
const Login = lazy(() => import('./pages/Login'))
const AnimalDetail = lazy(() => import('./pages/AnimalDetail'))

function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-sage" size={32} />
    </div>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ size: number }>
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalidade, setModalidade] = useState(() => localStorage.getItem('modalidade') || 'CORTE')
  const [user, setUser] = useState<Record<string, any> | null>(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') }
    catch { return null }
  })
  const location = useLocation()
  const navigate = useNavigate()

  const toggleModalidade = (mod: string) => {
    setModalidade(mod)
    localStorage.setItem('modalidade', mod)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/operacional', label: 'Operacional', icon: LayoutDashboard },
    { path: '/dashboard/tatico', label: 'Tático', icon: LayoutDashboard },
    { path: '/dashboard/estrategico', label: 'Estratégico', icon: LayoutDashboard },
    { path: '/animais', label: 'Rebanho', icon: Users },
    { path: '/lotes', label: 'Lotes', icon: FolderTree },
    { path: '/cadastro', label: 'Novo Animal', icon: PlusCircle },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif italic text-sage">SIS</span>
            <span className="text-2xl font-serif text-paper">PEC</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(path)
                    ? 'bg-sage/20 text-sage'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-1 mx-2 px-2 py-1 bg-white/5 rounded-lg">
              <button
                onClick={() => toggleModalidade('CORTE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  modalidade === 'CORTE' ? 'bg-sage text-ink' : 'text-white/50 hover:text-white'
                }`}
              >
                <Beef size={14} /> Corte
              </button>
              <button
                onClick={() => toggleModalidade('LEITE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  modalidade === 'LEITE' ? 'bg-sage text-ink' : 'text-white/50 hover:text-white'
                }`}
              >
                <Milk size={14} /> Leite
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-white/60 hover:text-white">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-white/5 bg-ink/98">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive(path) ? 'bg-sage/20 text-sage' : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-white/40 w-full">
              <LogOut size={20} /> Sair
            </button>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Suspense fallback={<Loading />}>
          <ModalidadeContext.Provider value={{ modalidade }}>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/operacional" element={<ProtectedRoute><DashboardOperacional /></ProtectedRoute>} />
              <Route path="/dashboard/tatico" element={<ProtectedRoute><DashboardTatico /></ProtectedRoute>} />
              <Route path="/dashboard/estrategico" element={<ProtectedRoute><DashboardEstrategico /></ProtectedRoute>} />
              <Route path="/animais" element={<ProtectedRoute><Animais /></ProtectedRoute>} />
              <Route path="/animais/:id" element={<ProtectedRoute><AnimalDetail /></ProtectedRoute>} />
              <Route path="/lotes" element={<ProtectedRoute><Lotes /></ProtectedRoute>} />
              <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
            </Routes>
          </ModalidadeContext.Provider>
        </Suspense>
      </main>
    </div>
  )
}

export default function Root() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<App />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ToastProvider>
  )
}
