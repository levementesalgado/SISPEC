import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Animais from './pages/Animais'
import Lotes from './pages/Lotes'
import Cadastro from './pages/Cadastro'
import { Menu, X, LayoutDashboard, Users, FolderTree, PlusCircle } from 'lucide-react'

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

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
      <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-sm border-b border-sage/10">
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
          <nav className="md:hidden border-t border-sage/10 bg-ink/98">
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
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animais" element={<Animais />} />
          <Route path="/lotes" element={<Lotes />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Routes>
      </main>
    </div>
  )
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}