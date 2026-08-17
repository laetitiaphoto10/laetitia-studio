import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const NAV = [
  { to: '/admin', label: 'Tableau de bord', frame: '01' },
  { to: '/admin/agenda', label: 'Agenda', frame: '02' },
  { to: '/admin/devis', label: 'Devis', frame: '03' },
  { to: '/admin/factures', label: 'Factures', frame: '04' },
  { to: '/admin/contrats', label: 'Contrats', frame: '05' }
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
              <span className="frame-number text-xs">{item.frame}</span>
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
