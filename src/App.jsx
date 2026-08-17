import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AdminLayout from './components/Layout/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Agenda from './pages/Agenda'
import Devis from './pages/Devis'
import Factures from './pages/Factures'
import Contrats from './pages/Contrats'
import ClientBooking from './pages/client/ClientBooking'
import ClientPortal from './pages/client/ClientPortal'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-ink flex items-center justify-center text-paper">Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/reserver" replace />} />
      <Route path="/reserver" element={<ClientBooking />} />
      <Route path="/espace/:token" element={<ClientPortal />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="devis" element={<Devis />} />
        <Route path="factures" element={<Factures />} />
        <Route path="contrats" element={<Contrats />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
