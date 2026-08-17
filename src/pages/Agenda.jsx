import { useEffect, useState } from 'react'
import { listenSessions, createSession, updateSession, deleteSession } from '../lib/data'

const STATUS_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmée',
  annule: 'Annulée',
  termine: 'Terminée'
}

export default function Agenda() {
  const [sessions, setSessions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', email: '', type: '', date: '', time: '', location: '', notes: '' })

  useEffect(() => listenSessions(setSessions), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createSession(form)
    setForm({ clientName: '', email: '', type: '', date: '', time: '', location: '', notes: '' })
    setShowForm(false)
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
          <input required placeholder="Type de séance (mariage, portrait...)" value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
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
          <div key={s.id} className="filmcard py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-medium">{s.clientName} — {s.type}</p>
              <p className="text-sm text-charcoal/70">
                {s.date} {s.time && `à ${s.time}`} {s.location && `· ${s.location}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
        ))}
        {sessions.length === 0 && <p className="text-charcoal/60 text-sm">Aucune séance enregistrée pour l'instant.</p>}
      </div>
    </div>
  )
}
