import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

// Petites icônes en SVG (aucune bibliothèque à installer)
const Icon = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const ICONS = {
  dashboard: <Icon><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Icon>,
  agenda: <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon>,
  calendrier: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>,
  clients: <Icon><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><path d="M17 11a3 3 0 1 0-1-5.8M18.5 14.5c2 .7 3 2.5 3 5.5" /></Icon>,
  devis: <Icon><path d="M6 3h9l4 4v14H6z" /><path d="M15 3v4h4M9 12h7M9 16h7" /></Icon>,
  factures: <Icon><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" /><path d="M9 8h6M9 12h6" /></Icon>,
  contrats: <Icon><path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z" /><path d="M14 7l3 3" /></Icon>
}

const NAV = [
  { to: '/admin', label: 'Tableau de bord', icon: 'dashboard' },
  { to: '/admin/agenda', label: 'Agenda', icon: 'agenda' },
  { to: '/admin/calendrier', label: 'Calendrier', icon: 'calendrier' },
  { to: '/admin/clients', label: 'Clients', icon: 'clients' },
  { to: '/admin/devis', label: 'Devis', icon: 'devis' },
  { to: '/admin/factures', label: 'Factures', icon: 'factures' },
  { to: '/admin/contrats', label: 'Contrats', icon: 'contrats' }
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col md:flex-row">
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-charcoal flex md:flex-col">
        <div className="p-5 border-b border-charcoal hidden md:block">
          <h1 className="font-display text-xl">Laetitia Fey</h1>
          <p className="text-xs text-paper/50 mt-1">Studio photo</p>
        </div>
        <nav className="flex md:flex-col flex-1 overflow-x-auto md:overflow-visible">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 whitespace-nowrap border-b md:border-b border-charcoal transition-colors ${
                  isActive ? 'bg-charcoal text-amber' : 'text-paper/70 hover:text-paper'
                }`
              }
            >
              {ICONS[item.icon]}
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-5 hidden md:block">
          <button
            onClick={handleLogout}
            className="text-sm text-paper/50 hover:text-amber transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
      <main className="flex-1 p-5 md:p-10 bg-paper text-ink">
        <Outlet />
      </main>
    </div>
  )
}
