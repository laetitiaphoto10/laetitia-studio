import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err) {
      setError("Email ou mot de passe incorrect.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl text-paper text-center mb-1">Studio Laetitia Fey</h1>
        <p className="text-paper/50 text-center text-sm mb-8">Espace photographe</p>
        <form onSubmit={handleSubmit} className="filmcard py-8">
          <div className="mb-4">
            <label className="block text-sm text-charcoal mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-white focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm text-charcoal mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-white focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-700 mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber text-ink font-medium py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
