import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Animais from './pages/Animais'
import Lotes from './pages/Lotes'
import Cadastro from './pages/Cadastro'
import Login from './pages/Login'
import { Menu, X, LayoutDashboard, Users, FolderTree, PlusCircle, LogOut, Loader2 } from 'lucide-react'

// Loading component
function Loading() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-sage" size={32} />
    </div>
  )
}

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null
    } catch {
      return null
    }
  })
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/animais', label: 'Rebanho', icon: Users },
    { path: '/lotes', label: 'Lotes', icon: FolderTree },
    { path: '/cadastro', label: 'Novo Animal', icon: PlusCircle },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-ink text-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif italic text-sage">SIS</span>
            <span className="text-2xl font-serif text-paper">PEC</span>
          </Link>

          {/* Desktop Nav */}
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="md:hidden border-t border-white/5 bg-ink/98">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive(path)
                    ? 'bg-sage/20 text-sage'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-white/40 w-full"
            >
              <LogOut size={20} />
              Sair
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/animais" element={<ProtectedRoute><Animais /></ProtectedRoute>} />
          <Route path="/lotes" element={<ProtectedRoute><Lotes /></ProtectedRoute>} />
          <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}