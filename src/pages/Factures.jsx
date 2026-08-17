import { useEffect, useState } from 'react'
import { listenFactures, createFacture, updateFacture, deleteFacture } from '../lib/data'

const STATUS_LABELS = { impayee: 'Impayée', payee: 'Payée', en_retard: 'En retard' }
const STATUS_COLOR = { impayee: 'text-amber', payee: 'text-green-700', en_retard: 'text-red-700' }

export default function Factures() {
  const [factures, setFactures] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', email: '', total: '', dueDate: '' })
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => listenFactures(setFactures), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createFacture({ ...form, total: parseFloat(form.total) || 0 })
    setForm({ clientName: '', email: '', total: '', dueDate: '' })
    setShowForm(false)
  }

  const copyLink = (token, id) => {
    navigator.clipboard.writeText(`${window.location.origin}/espace/${token}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Factures</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-amber text-ink px-4 py-2 rounded text-sm font-medium">
          {showForm ? 'Annuler' : '+ Nouvelle facture'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="filmcard py-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="Nom du client" value={form.clientName}
            onChange={e => setForm({ ...form, clientName: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input type="email" placeholder="Email du client" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input required type="number" placeholder="Montant €" value={form.total}
            onChange={e => setForm({ ...form, total: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input type="date" placeholder="Échéance" value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <button type="submit" className="bg-charcoal text-paper px-4 py-2 rounded text-sm md:col-span-2">
            Créer la facture
          </button>
        </form>
      )}

      <div className="space-y-3">
        {factures.map(f => (
          <div key={f.id} className="filmcard py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-medium">{f.clientName} <span className={`text-sm ml-2 ${STATUS_COLOR[f.status]}`}>{STATUS_LABELS[f.status]}</span></p>
              <p className="text-sm text-charcoal/70">{f.total?.toFixed?.(2)} € {f.dueDate && `· échéance ${f.dueDate}`}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={f.status} onChange={e => updateFacture(f.id, { status: e.target.value })}
                className="text-sm border border-border rounded px-2 py-1 bg-white">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={() => copyLink(f.token, f.id)} className="text-sm text-amber">
                {copiedId === f.id ? 'Copié !' : 'Lien client'}
              </button>
              <button onClick={() => deleteFacture(f.id)} className="text-sm text-red-700/70">Supprimer</button>
            </div>
          </div>
        ))}
        {factures.length === 0 && <p className="text-charcoal/60 text-sm">Aucune facture pour l'instant.</p>}
      </div>
    </div>
  )
}
