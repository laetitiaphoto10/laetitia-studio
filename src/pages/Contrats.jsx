import { useEffect, useState } from 'react'
import { listenContrats, createContrat, deleteContrat, listenSessions, getSetting, setSetting } from '../lib/data'

export default function Contrats() {
  const [contrats, setContrats] = useState([])
  const [sessions, setSessions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const [template, setTemplate] = useState('')
  const [form, setForm] = useState({ sessionId: '', clientName: '', email: '', content: '' })
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    const u1 = listenContrats(setContrats)
    const u2 = listenSessions(setSessions)
    getSetting('contratTemplate').then(s => setTemplate(s?.content || ''))
    return () => { u1(); u2() }
  }, [])

  const handleSelectSession = (sessionId) => {
    const s = sessions.find(sess => sess.id === sessionId)
    setForm({
      ...form,
      sessionId,
      clientName: s?.clientName || form.clientName,
      email: s?.email || form.email
    })
  }

  const insertTemplate = () => setForm({ ...form, content: template })

  const saveTemplate = async () => {
    await setSetting('contratTemplate', { content: template })
    setShowTemplate(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createContrat(form)
    setForm({ sessionId: '', clientName: '', email: '', content: '' })
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
        <div className="flex gap-2">
          <button onClick={() => setShowTemplate(!showTemplate)} className="border border-charcoal px-4 py-2 rounded text-sm">
            {showTemplate ? 'Fermer' : 'Mon modèle de contrat'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="bg-amber text-ink px-4 py-2 rounded text-sm font-medium">
            {showForm ? 'Annuler' : '+ Nouveau contrat'}
          </button>
        </div>
      </div>

      {showTemplate && (
        <div className="filmcard py-6 mb-6">
          <p className="text-sm text-charcoal/70 mb-2">
            Colle ici ton modèle de contrat habituel. Il sera réutilisable en un clic pour chaque nouveau contrat.
          </p>
          <textarea value={template} onChange={e => setTemplate(e.target.value)}
            className="w-full px-3 py-2 rounded border border-border mb-3" rows={10}
            placeholder="Colle ton modèle de contrat ici..." />
          <button onClick={saveTemplate} className="bg-charcoal text-paper px-4 py-2 rounded text-sm">
            Enregistrer le modèle
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="filmcard py-6 mb-6">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Lier à une séance (optionnel)</label>
            <select value={form.sessionId} onChange={e => handleSelectSession(e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-white">
              <option value="">— Aucune séance liée —</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.clientName} {s.type ? `(${s.type})` : ''} {s.date ? `— ${s.date}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input required placeholder="Nom du client" value={form.clientName}
              onChange={e => setForm({ ...form, clientName: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
            <input type="email" placeholder="Email du client" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Texte du contrat</label>
            {template && (
              <button type="button" onClick={insertTemplate} className="text-sm text-amber underline">
                Insérer mon modèle
              </button>
            )}
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
