import { useEffect, useState } from 'react'
import { listenCreneaux, createSerie, deleteCreneau, deleteCreneaux, libererCreneau } from '../lib/minis'

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const jourFr = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

export default function MiniSessions() {
  const [creneaux, setCreneaux] = useState([])
  const [f, setF] = useState({ date: today(), start: '10:00', duree: 20, pause: 10, nombre: 6, label: 'Mini-séance', prix: '' })
  const [busy, setBusy] = useState(false)

  useEffect(() => listenCreneaux(today(), setCreneaux), [])

  const creer = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await createSerie({ ...f, duree: +f.duree, pause: +f.pause, nombre: +f.nombre })
    } finally { setBusy(false) }
  }

  const parJour = creneaux.reduce((acc, c) => { (acc[c.date] = acc[c.date] || []).push(c); return acc }, {})
  const lienPublic = `${window.location.origin}/mini-sessions`
  const input = 'px-3 py-2 rounded border border-border bg-white w-full'

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-1">Mini-sessions</h1>
      <p className="text-charcoal/70 mb-6">Crée une série de créneaux sur une journée. Tes clients choisissent leur horaire depuis un lien.</p>

      <div className="filmcard py-6 mb-8">
        <p className="text-sm mb-1">Lien à partager avec tes clients :</p>
        <div className="flex gap-2 flex-wrap items-center">
          <code className="text-sm bg-white border border-border rounded px-2 py-1 break-all">{lienPublic}</code>
          <button type="button" onClick={() => navigator.clipboard?.writeText(lienPublic)} className="text-sm underline text-amber">Copier</button>
        </div>
      </div>

      <form onSubmit={creer} className="bg-white border border-border rounded p-5 mb-8 grid grid-cols-2 md:grid-cols-3 gap-3">
        <label className="text-sm col-span-2 md:col-span-1">Date
          <input type="date" required min={today()} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className={input} /></label>
        <label className="text-sm">Premier créneau à
          <input type="time" required value={f.start} onChange={e => setF({ ...f, start: e.target.value })} className={input} /></label>
        <label className="text-sm">Nombre de créneaux
          <input type="number" min="1" max="30" required value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} className={input} /></label>
        <label className="text-sm">Durée (min)
          <input type="number" min="5" step="5" required value={f.duree} onChange={e => setF({ ...f, duree: e.target.value })} className={input} /></label>
        <label className="text-sm">Pause (min)
          <input type="number" min="0" step="5" required value={f.pause} onChange={e => setF({ ...f, pause: e.target.value })} className={input} /></label>
        <label className="text-sm">Prix (optionnel)
          <input placeholder="ex : 60 €" value={f.prix} onChange={e => setF({ ...f, prix: e.target.value })} className={input} /></label>
        <label className="text-sm col-span-2 md:col-span-3">Nom de la mini-session
          <input value={f.label} onChange={e => setF({ ...f, label: e.target.value })} className={input} placeholder="ex : Mini-séance Noël" /></label>
        <button disabled={busy} className="bg-ink text-paper px-4 py-2.5 rounded col-span-2 md:col-span-3 disabled:opacity-50">
          {busy ? 'Création...' : 'Créer les créneaux'}
        </button>
      </form>

      {Object.keys(parJour).length === 0 && <p className="text-charcoal/60">Aucun créneau à venir.</p>}
      {Object.entries(parJour).map(([date, list]) => (
        <section key={date} className="mb-6">
          <h2 className="font-display text-xl capitalize mb-2 flex items-center gap-3 flex-wrap">{jourFr(date)}
            <span className="text-sm text-charcoal/60 font-sans">{list.filter(c => c.booked).length}/{list.length} réservés</span>
            <button
              onClick={() => confirm(`Supprimer les ${list.length} créneaux de cette journée${list.some(c => c.booked) ? ' (certains sont réservés !)' : ''} ?`) && deleteCreneaux(list.map(c => c.id))}
              className="text-xs text-red-700 underline font-sans normal-case">
              Supprimer toute la journée
            </button></h2>
          <div className="space-y-2">
            {list.map(c => (
              <div key={c.id} className={`flex items-center gap-3 flex-wrap border rounded px-3 py-2 ${c.booked ? 'bg-amber/10 border-amber' : 'bg-white border-border'}`}>
                <span className="font-medium w-28">{c.start} – {c.end}</span>
                <span className="text-sm text-charcoal/70 flex-1 min-w-[10rem]">
                  {c.booked ? <>{c.clientName} · {c.email}{c.phone ? ` · ${c.phone}` : ''}{c.notes ? ` · ${c.notes}` : ''}</> : `Libre · ${c.label}`}
                </span>
                {c.booked && <button onClick={() => confirm('Libérer ce créneau ?') && libererCreneau(c.id)} className="text-xs underline">Libérer</button>}
                <button onClick={() => confirm('Supprimer ce créneau ?') && deleteCreneau(c.id)} className="text-xs text-red-700 underline">Supprimer</button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
