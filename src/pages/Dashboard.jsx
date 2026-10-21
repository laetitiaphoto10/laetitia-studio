import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listenSessions, listenDevis, listenFactures, listenContrats } from '../lib/data'

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [devis, setDevis] = useState([])
  const [factures, setFactures] = useState([])
  const [contrats, setContrats] = useState([])

  useEffect(() => {
    const u1 = listenSessions(setSessions)
    const u2 = listenDevis(setDevis)
    const u3 = listenFactures(setFactures)
    const u4 = listenContrats(setContrats)
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const prochaines = sessions.filter(s => s.date && s.date >= today && s.status !== 'annule').slice(0, 5)
  const devisEnAttente = devis.filter(d => d.status === 'envoye')
  const facturesImpayees = factures.filter(f => f.status === 'impayee' || f.status === 'en_retard')
  const totalImpaye = facturesImpayees.reduce((sum, f) => sum + (f.total || 0), 0)

  // ---- ALERTES : ce qui demande une action de Laetitia ----
  const alertes = []

  // Demandes reçues sans date proposée
  sessions
    .filter(s => !s.date && s.status === 'en_attente')
    .forEach(s => alertes.push({
      id: 'date-' + s.id, to: '/admin/agenda',
      titre: `Demande de ${s.clientName} : aucune date proposée`,
      detail: s.type || ''
    }))

  // Séances à venir sans contrat signé
  sessions
    .filter(s => s.date && s.date >= today && s.status === 'confirme')
    .forEach(s => {
      const contrat = contrats.find(c => c.sessionId === s.id)
      if (contrat?.status === 'signe') return
      alertes.push({
        id: 'contrat-' + s.id, to: '/admin/contrats',
        titre: `Séance du ${s.date} avec ${s.clientName} : ${contrat ? 'contrat en attente de signature' : 'pas de contrat'}`,
        detail: s.type || ''
      })
    })

  // Devis sans réponse depuis plus de 7 jours
  devisEnAttente.forEach(d => {
    const created = d.createdAt?.toDate?.()
    if (!created) return
    const jours = Math.floor((Date.now() - created.getTime()) / 86400000)
    if (jours >= 7) alertes.push({
      id: 'devis-' + d.id, to: '/admin/devis',
      titre: `Devis de ${d.clientName} sans réponse depuis ${jours} jours`,
      detail: `${d.total} €`
    })
  })

  // Factures impayées (en retard si l'échéance est dépassée)
  facturesImpayees.forEach(f => {
    const enRetard = f.status === 'en_retard' || (f.dueDate && f.dueDate < today)
    alertes.push({
      id: 'facture-' + f.id, to: '/admin/factures',
      titre: `Facture de ${f.clientName} ${enRetard ? 'en retard de paiement' : 'impayée'}`,
      detail: `${f.total} €${f.dueDate ? ' · échéance ' + f.dueDate : ''}`
    })
  })

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Tableau de bord</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Séances à venir" value={prochaines.length} />
        <StatCard label="Devis en attente" value={devisEnAttente.length} />
        <StatCard label="Impayé" value={`${totalImpaye.toFixed(2)} €`} sub={`${facturesImpayees.length} facture(s)`} />
      </div>

      <div className="mb-8">
        <h3 className="font-display text-lg mb-3">
          À traiter {alertes.length > 0 && <span className="text-amber">({alertes.length})</span>}
        </h3>
        {alertes.length === 0 && <p className="text-charcoal/60 text-sm">Rien à signaler, tout est à jour.</p>}
        <div className="space-y-2">
          {alertes.map(a => (
            <Link key={a.id} to={a.to}
              className="block bg-white border border-border border-l-4 border-l-amber rounded px-4 py-3 hover:bg-paper transition-colors">
              <p className="text-sm font-medium">{a.titre}</p>
              {a.detail && <p className="text-xs text-charcoal/60 mt-0.5">{a.detail}</p>}
            </Link>
          ))}
        </div>
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

function StatCard({ label, value, sub }) {
  return (
    <div className="filmcard py-6">
      <p className="text-sm text-charcoal/60">{label}</p>
      <p className="font-display text-3xl mt-1">{value}</p>
      {sub && <p className="text-xs text-charcoal/50 mt-1">{sub}</p>}
    </div>
  )
}
