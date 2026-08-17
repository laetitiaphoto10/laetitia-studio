import { useEffect, useState } from 'react'
import { listenContrats, createContrat, deleteContrat } from '../lib/data'

export default function Contrats() {
  const [contrats, setContrats] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', email: '', content: '' })
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => listenContrats(setContrats), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createContrat(form)
    setForm({ clientName: '', email: '', content: '' })
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
        <h2 className="font-display text-2xl">Contrats</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-amber text-ink px-4 py-2 rounded text-sm font-medium">
          {showForm ? 'Annuler' : '+ Nouveau contrat'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="filmcard py-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input required placeholder="Nom du client" value={form.clientName}
              onChange={e => setForm({ ...form, clientName: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
            <input type="email" placeholder="Email du client" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
          </div>
          <textarea required placeholder="Texte du contrat (prestations, conditions, droits à l'image...)"
            value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
            className="w-full px-3 py-2 rounded border border-border mb-3" rows={8} />
          <button type="submit" className="bg-charcoal text-paper px-4 py-2 rounded text-sm w-full">
            Créer le contrat
          </button>
        </form>
      )}

      <div className="space-y-3">
        {contrats.map(c => (
          <div key={c.id} className="filmcard py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-medium">
                {c.clientName}
                <span className={`text-sm ml-2 ${c.status === 'signe' ? 'text-green-700' : 'text-amber'}`}>
                  {c.status === 'signe' ? 'Signé' : 'En attente de signature'}
                </span>
              </p>
              {c.signedAt && <p className="text-sm text-charcoal/70">Signé le {c.signedAt}</p>}
            </div>
            <div className="flex items-center gap-3">
              {c.signature && (
                <img src={c.signature} alt="Signature" className="h-8 border border-border rounded bg-white" />
              )}
              <button onClick={() => copyLink(c.token, c.id)} className="text-sm text-amber">
                {copiedId === c.id ? 'Copié !' : 'Lien client'}
              </button>
              <button onClick={() => deleteContrat(c.id)} className="text-sm text-red-700/70">Supprimer</button>
            </div>
          </div>
        ))}
        {contrats.length === 0 && <p className="text-charcoal/60 text-sm">Aucun contrat pour l'instant.</p>}
      </div>
    </div>
  )
}
