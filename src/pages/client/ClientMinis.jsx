import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listenCreneaux, reserverCreneau } from '../../lib/minis'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const jourFr = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function ClientMinis() {
  const [creneaux, setCreneaux] = useState(null)
  const [choix, setChoix] = useState(null)
  const [form, setForm] = useState({ clientName: '', email: '', phone: '', notes: '' })
  const [etat, setEtat] = useState('') // '', 'envoi', 'ok', 'pris'

  useEffect(() => listenCreneaux(today(), setCreneaux), [])

  const libres = (creneaux || []).filter(c => !c.booked)
  const parJour = libres.reduce((acc, c) => { (acc[c.date] = acc[c.date] || []).push(c); return acc }, {})

  const envoyer = async (e) => {
    e.preventDefault()
    setEtat('envoi')
    try {
      await reserverCreneau(choix.id, form)
    } catch (err) {
      setEtat('pris'); setChoix(null); return
    }
    try {
      await fetch('/.netlify/functions/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName, email: form.email, phone: form.phone,
          type: `${choix.label} — ${jourFr(choix.date)} à ${choix.start}`,
          location: '', notes: form.notes
        })
      })
    } catch (err) { /* silencieux */ }
    setEtat('ok')
  }

  const input = 'px-3 py-2 rounded border border-border w-full'

  if (etat === 'ok') {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-6">
        <div className="filmcard py-10 max-w-md text-center">
          <h1 className="font-display text-2xl mb-2">Créneau réservé</h1>
          <p className="text-charcoal/70 mb-6">
            Merci ! Votre créneau du {jourFr(choix.date)} à {choix.start} est réservé. Laetitia vous contactera pour confirmer.
          </p>
          <Link to="/" className="text-sm text-amber underline">Retour au site</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink text-paper p-6">
      <div className="max-w-lg mx-auto">
        <Link to="/" className="text-sm text-paper/60 hover:text-amber">← Retour au site</Link>
        <h1 className="font-display text-3xl text-center mt-4 mb-1">Mini-séances</h1>
        <p className="text-paper/50 text-center text-sm mb-8">Choisissez votre créneau</p>

        {etat === 'pris' && <p className="bg-amber text-ink rounded px-3 py-2 mb-4 text-sm">Ce créneau vient d'être pris. Choisissez-en un autre.</p>}
        {creneaux === null && <p className="text-center text-paper/60">Chargement...</p>}
        {creneaux && libres.length === 0 && <p className="text-center text-paper/60">Aucun créneau disponible pour le moment.</p>}

        {!choix && Object.entries(parJour).map(([date, list]) => (
          <section key={date} className="mb-6">
            <h2 className="font-display text-xl capitalize mb-2">{jourFr(date)}</h2>
            {list[0].prix && <p className="text-paper/60 text-sm mb-2">{list[0].label} · {list[0].prix}</p>}
            <div className="grid grid-cols-3 gap-2">
              {list.map(c => (
                <button key={c.id} onClick={() => { setChoix(c); setEtat('') }}
                  className="border border-amber/60 text-amber rounded py-2 hover:bg-amber hover:text-ink transition-colors">
                  {c.start}
                </button>
              ))}
            </div>
          </section>
        ))}

        {choix && (
          <form onSubmit={envoyer} className="filmcard py-8 grid gap-3 text-ink">
            <p className="font-display text-lg capitalize">{jourFr(choix.date)} · {choix.start} – {choix.end}</p>
            <input required placeholder="Votre nom" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className={input} />
            <input required type="email" placeholder="Votre email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={input} />
            <input placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={input} />
            <textarea rows={2} placeholder="Un message (nombre de personnes, enfants...)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={input} />
            <button disabled={etat === 'envoi'} className="bg-amber text-ink font-medium px-4 py-2.5 rounded disabled:opacity-50">
              {etat === 'envoi' ? 'Envoi...' : 'Réserver ce créneau'}
            </button>
            <button type="button" onClick={() => setChoix(null)} className="text-sm underline text-charcoal/70">Changer de créneau</button>
          </form>
        )}
      </div>
    </div>
  )
}
