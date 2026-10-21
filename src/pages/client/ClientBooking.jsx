import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createSession } from '../../lib/data'
import { listenCreneaux } from '../../lib/minis'

const SESSION_TYPES = ['Grossesse', 'Naissance', 'Mariage', 'Couple', 'Autre']

const aujourdhui = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const jourFr = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export default function ClientBooking() {
  const [form, setForm] = useState({ clientName: '', email: '', phone: '', type: '', location: '', notes: '' })
  const [sent, setSent] = useState(false)
  const [creneaux, setCreneaux] = useState([])

  useEffect(() => listenCreneaux(aujourdhui(), setCreneaux), [])

  // Jours qui ont encore des créneaux libres
  const jours = Object.entries(
    creneaux.filter(c => !c.booked).reduce((acc, c) => {
      acc[c.date] = acc[c.date] || { n: 0, label: c.label }
      acc[c.date].n++
      return acc
    }, {})
  )

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
          <p className="text-charcoal/70 mb-6">
            Merci ! Votre demande de séance a bien été transmise à Laetitia. Elle revient vers vous rapidement pour vous proposer une date.
          </p>
          <Link to="/" className="text-sm text-amber underline">Retour au site</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link to="/" className="text-sm text-paper/60 hover:text-amber">← Retour au site</Link>
        <img
          src="/photos/accueil.jpg"
          alt="Laetitia Fey, photographe"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="w-full h-48 md:h-64 object-cover rounded mt-4 mb-6"
        />
        <h1 className="font-display text-3xl text-paper text-center mb-1">Réserver une séance</h1>
        <p className="text-paper/50 text-center text-sm mb-8">Studio Laetitia Fey — Photographe</p>
        {jours.length > 0 && (
          <div className="border border-amber/60 rounded p-4 mb-6 text-paper">
            <p className="font-display text-lg text-amber mb-1">Mini-séances disponibles</p>
            <ul className="text-sm text-paper/80 mb-3">
              {jours.slice(0, 4).map(([date, info]) => (
                <li key={date} className="mb-1">
                  <span className="text-paper font-medium">{info.label}</span>
                  <span className="capitalize"> · {jourFr(date)} · {info.n} créneau{info.n > 1 ? 'x' : ''} libre{info.n > 1 ? 's' : ''}</span>
                </li>
              ))}
            </ul>
            <Link to="/mini-sessions" className="inline-block bg-amber text-ink font-medium px-4 py-2 rounded text-sm">
              Choisir un créneau
            </Link>
          </div>
        )}
        <p className="text-paper/50 text-center text-xs mb-3">Ou envoyez une demande pour une séance classique :</p>
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
