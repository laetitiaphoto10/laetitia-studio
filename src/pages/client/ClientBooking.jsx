import { useState } from 'react'
import { createSession } from '../../lib/data'

const SESSION_TYPES = ['Grossesse', 'Naissance', 'Mariage', 'Couple', 'Autre']

export default function ClientBooking() {
  const [form, setForm] = useState({ clientName: '', email: '', phone: '', type: '', location: '', notes: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createSession(form)
    // On tente d'envoyer une notification par email à Laetitia ; si ça échoue,
    // ça ne doit pas bloquer la confirmation côté client (la demande est
    // déjà bien enregistrée dans Firestore).
    try {
      await fetch('/.netlify/functions/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    } catch (err) {
      // silencieux : la demande reste visible dans l'admin même sans email
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-6">
        <div className="filmcard py-10 max-w-md text-center">
          <h1 className="font-display text-2xl mb-2">Demande envoyée</h1>
          <p className="text-charcoal/70">
            Merci ! Votre demande de séance a bien été transmise à Laetitia. Elle revient vers vous rapidement pour vous proposer une date.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-3xl text-paper text-center mb-1">Réserver une séance</h1>
        <p className="text-paper/50 text-center text-sm mb-8">Studio Laetitia Fey — Photographe</p>
        <form onSubmit={handleSubmit} className="filmcard py-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="Votre nom" value={form.clientName}
            onChange={e => setForm({ ...form, clientName: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input required type="email" placeholder="Votre email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <input placeholder="Téléphone" value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="px-3 py-2 rounded border border-border" />
          <select required value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2 rounded border border-border bg-white">
            <option value="" disabled>Type de séance</option>
            {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Lieu souhaité" value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            className="px-3 py-2 rounded border border-border md:col-span-2" />
          <textarea placeholder="Un mot sur votre projet, vos disponibilités..." value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="px-3 py-2 rounded border border-border md:col-span-2" rows={3} />
          <p className="text-xs text-charcoal/60 md:col-span-2">
            Laetitia reviendra vers vous pour vous proposer une date de séance.
          </p>
          <button type="submit" className="bg-amber text-ink font-medium px-4 py-2.5 rounded md:col-span-2">
            Envoyer ma demande
          </button>
        </form>
      </div>
    </div>
  )
}
