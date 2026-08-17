import { useEffect, useState } from 'react'
import { listenSessions, listenDevis, listenFactures } from '../lib/data'

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [devis, setDevis] = useState([])
  const [factures, setFactures] = useState([])

  useEffect(() => {
    const u1 = listenSessions(setSessions)
    const u2 = listenDevis(setDevis)
    const u3 = listenFactures(setFactures)
    return () => { u1(); u2(); u3() }
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const prochaines = sessions.filter(s => s.date >= today && s.status !== 'annule').slice(0, 5)
  const devisEnAttente = devis.filter(d => d.status === 'envoye')
  const facturesImpayees = factures.filter(f => f.status === 'impayee' || f.status === 'en_retard')

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Tableau de bord</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Séances à venir" value={prochaines.length} frame="01" />
        <StatCard label="Devis en attente" value={devisEnAttente.length} frame="02" />
        <StatCard label="Factures impayées" value={facturesImpayees.length} frame="03" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-display text-lg mb-3">Prochaines séances</h3>
          {prochaines.length === 0 && <p className="text-charcoal/60 text-sm">Aucune séance à venir.</p>}
          <div className="space-y-3">
            {prochaines.map(s => (
              <div key={s.id} className="filmcard py-4">
                <p className="font-medium">{s.clientName} — {s.type}</p>
                <p className="text-sm text-charcoal/70">{s.date} {s.time && `à ${s.time}`} {s.location && `· ${s.location}`}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg mb-3">Devis en attente de réponse</h3>
          {devisEnAttente.length === 0 && <p className="text-charcoal/60 text-sm">Rien en attente.</p>}
          <div className="space-y-3">
            {devisEnAttente.map(d => (
              <div key={d.id} className="filmcard py-4">
                <p className="font-medium">{d.clientName}</p>
                <p className="text-sm text-charcoal/70">{d.total} € · envoyé le {d.createdAt?.toDate?.().toLocaleDateString?.('fr-FR') || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, frame }) {
  return (
    <div className="filmcard py-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-charcoal/60">{label}</p>
        <p className="font-display text-3xl mt-1">{value}</p>
      </div>
      <span className="frame-number text-lg">{frame}</span>
    </div>
  )
}
