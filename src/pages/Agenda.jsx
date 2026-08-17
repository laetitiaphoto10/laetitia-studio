import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listenSessions, createSession, updateSession, deleteSession, listenContrats } from '../lib/data'

const STATUS_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmée',
  annule: 'Annulée',
  termine: 'Terminée'
}

const SESSION_TYPES = ['Grossesse', 'Naissance', 'Mariage', 'Couple', 'Autre']

export default function Agenda() {
  const [sessions, setSessions] = useState([])
  const [contrats, setContrats] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', email: '', type: '', date: '', time: '', location: '', notes: '' })
  const [proposing, setProposing] = useState(null) // id de la session en cours de proposition de date
  const [proposedDate, setProposedDate] = useState({ date: '', time: '' })

  useEffect(() => {
    const u1 = listenSessions(setSessions)
    const u2 = listenContrats(setContrats)
    return () => { u1(); u2() }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createSession({ ...form, status: 'confirme' })
    setForm({ clientName: '', email: '', type: '', date: '', time: '', location: '', notes: '' })
    setShowForm(false)
  }

  const startProposing = (s) => {
    setProposing(s.id)
    setProposedDate({ date: s.date || '', time: s.time || '' })
  }

  const confirmProposedDate = async (id) => {
    await updateSession(id, { date: proposedDate.date, time: proposedDate.time, status: 'confirme' })
    setProposing(null)
  }

  const gmailComposeLink = (s) => {
    const subject = encodeURIComponent(`Votre séance ${s.type ? '(' + s.type + ')' : ''} — Studio Laetitia Fey`)
    const body = encodeURIComponent(`Bonjour ${s.clientName},\n\n`)
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(s.email)}&su=${subject}&body=${body}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Agenda</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber text-ink px-4 py-2 rounded text-sm font-medium"
        >
          {showForm ? 'Annuler' : '+ Nouvelle séance'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="filmcard py-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="Nom du client" value={form.clientName}
            onChange={e => setForm({ ...form, clientName: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <select required value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2 rounded border border-border bg-white">
            <option value="" disabled>Type de séance</option>
            {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input required type="date" value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input type="time" value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input placeholder="Lieu" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <textarea placeholder="Notes" value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="px-3 py-2 rounded border border-border md:col-span-2" rows={2} />
          <button type="submit" className="bg-charcoal text-paper px-4 py-2 rounded text-sm md:col-span-2">
            Enregistrer la séance
          </button>
        </form>
      )}

      <div className="space-y-3">
        {sessions.map(s => (
          <div key={s.id} className="filmcard py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-medium">{s.clientName} {s.type && `— ${s.type}`}</p>
                <p className="text-sm text-charcoal/70">
                  {s.date ? (
                    <>{s.date} {s.time && `à ${s.time}`} {s.location && `· ${s.location}`}</>
                  ) : (
                    <span className="text-amber font-medium">Aucune date proposée pour l'instant</span>
                  )}
                </p>
                {s.notes && <p className="text-xs text-charcoal/50 mt-1">{s.notes}</p>}
                {(() => {
                  const linkedContrat = contrats.find(c => c.sessionId === s.id)
                  if (linkedContrat) {
                    return (
                      <p className="text-xs mt-1">
                        Contrat : <span className={linkedContrat.status === 'signe' ? 'text-green-700' : 'text-amber'}>
                          {linkedContrat.status === 'signe' ? 'signé' : 'en attente de signature'}
                        </span>
                      </p>
                    )
                  }
                  return (
                    <p className="text-xs mt-1">
                      <Link to="/admin/contrats" className="text-amber underline">Créer un contrat pour cette séance</Link>
                    </p>
                  )
                })()}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {!s.date && s.status === 'en_attente' && proposing !== s.id && (
                  <button onClick={() => startProposing(s)} className="text-sm bg-amber text-ink px-3 py-1.5 rounded font-medium">
                    Proposer une date
                  </button>
                )}
                {s.email && (
                  <a href={gmailComposeLink(s)} target="_blank" rel="noopener noreferrer" className="text-sm text-amber underline">
                    Répondre par email
                  </a>
                )}
                <select
                  value={s.status}
                  onChange={e => updateSession(s.id, { status: e.target.value })}
                  className="text-sm border border-border rounded px-2 py-1 bg-white"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <button onClick={() => deleteSession(s.id)} className="text-sm text-red-700/70 hover:text-red-700">
                  Supprimer
                </button>
              </div>
            </div>

            {proposing === s.id && (
              <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-end gap-2">
                <div>
                  <label className="block text-xs text-charcoal/60 mb-1">Date proposée</label>
                  <input type="date" value={proposedDate.date}
                    onChange={e => setProposedDate({ ...proposedDate, date: e.target.value })}
                    className="px-3 py-2 rounded border border-border" />
                </div>
                <div>
                  <label className="block text-xs text-charcoal/60 mb-1">Heure</label>
                  <input type="time" value={proposedDate.time}
                    onChange={e => setProposedDate({ ...proposedDate, time: e.target.value })}
                    className="px-3 py-2 rounded border border-border" />
                </div>
                <button onClick={() => confirmProposedDate(s.id)} className="bg-charcoal text-paper px-4 py-2 rounded text-sm">
                  Valider et confirmer
                </button>
                <button onClick={() => setProposing(null)} className="text-sm text-charcoal/60">
                  Annuler
                </button>
              </div>
            )}
          </div>
        ))}
        {sessions.length === 0 && <p className="text-charcoal/60 text-sm">Aucune séance enregistrée pour l'instant.</p>}
      </div>
    </div>
  )
}
