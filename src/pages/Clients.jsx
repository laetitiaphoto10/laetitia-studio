import { useEffect, useMemo, useState } from 'react'
import { listenSessions, listenDevis, listenFactures, listenContrats } from '../lib/data'

const STATUTS = {
  en_attente: 'En attente', confirme: 'Confirmée', annule: 'Annulée', termine: 'Terminée',
  envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé', brouillon: 'Brouillon',
  impayee: 'Impayée', payee: 'Payée', en_retard: 'En retard', signe: 'Signé'
}

const clientKey = (x) => (x.email || x.clientName || '').toLowerCase().trim()
const fmtDate = (ts) => ts?.toDate?.().toLocaleDateString?.('fr-FR') || ''

export default function Clients() {
  const [sessions, setSessions] = useState([])
  const [devis, setDevis] = useState([])
  const [factures, setFactures] = useState([])
  const [contrats, setContrats] = useState([])
  const [recherche, setRecherche] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const u1 = listenSessions(setSessions)
    const u2 = listenDevis(setDevis)
    const u3 = listenFactures(setFactures)
    const u4 = listenContrats(setContrats)
    return () => { u1(); u2(); u3(); u4() }
  }, [])

  // Les clients sont reconstitués automatiquement à partir de tout ce qui existe déjà
  const clients = useMemo(() => {
    const map = {}
    const get = (x) => {
      const key = clientKey(x)
      if (!key) return null
      if (!map[key]) map[key] = { key, name: x.clientName, email: x.email || '', phone: '', sessions: [], devis: [], factures: [], contrats: [] }
      const c = map[key]
      if (!c.email && x.email) c.email = x.email
      if (!c.name && x.clientName) c.name = x.clientName
      if (!c.phone && x.phone) c.phone = x.phone
      return c
    }
    sessions.forEach(s => get(s)?.sessions.push(s))
    devis.forEach(d => get(d)?.devis.push(d))
    factures.forEach(f => get(f)?.factures.push(f))
    contrats.forEach(c => get(c)?.contrats.push(c))
    return Object.values(map).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [sessions, devis, factures, contrats])

  const filtres = clients.filter(c =>
    (c.name + ' ' + c.email).toLowerCase().includes(recherche.toLowerCase())
  )

  const client = selected ? clients.find(c => c.key === selected) : null

  if (client) return <Fiche client={client} onBack={() => setSelected(null)} />

  return (
    <div>
      <h2 className="font-display text-2xl mb-6">Clients</h2>
      <input
        placeholder="Rechercher un client (nom ou email)"
        value={recherche}
        onChange={e => setRecherche(e.target.value)}
        className="w-full px-3 py-2 rounded border border-border mb-4 bg-white"
      />
      <div className="space-y-3">
        {filtres.map(c => (
          <button key={c.key} onClick={() => setSelected(c.key)}
            className="filmcard py-4 w-full text-left flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-charcoal/70">{c.email || 'pas d\'email'}</p>
            </div>
            <p className="text-xs text-charcoal/60 text-right">
              {c.sessions.length} séance(s)<br />{c.factures.length} facture(s)
            </p>
          </button>
        ))}
        {filtres.length === 0 && <p className="text-charcoal/60 text-sm">Aucun client pour l'instant. Ils apparaissent automatiquement dès qu'une demande, un devis, une facture ou un contrat est créé.</p>}
      </div>
    </div>
  )
}

function Fiche({ client, onBack }) {
  const facture = client.factures.reduce((s, f) => s + (f.total || 0), 0)
  const impaye = client.factures
    .filter(f => f.status !== 'payee')
    .reduce((s, f) => s + (f.total || 0), 0)

  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(client.email)}&su=${encodeURIComponent('Studio Laetitia Fey')}&body=${encodeURIComponent(`Bonjour ${client.name},\n\n`)}`

  return (
    <div>
      <button onClick={onBack} className="text-sm text-amber mb-4">← Tous les clients</button>
      <h2 className="font-display text-2xl mb-1">{client.name}</h2>
      <div className="flex flex-wrap gap-4 text-sm mb-6">
        {client.email && <a href={gmail} target="_blank" rel="noopener noreferrer" className="text-amber underline">{client.email}</a>}
        {client.phone && <a href={`tel:${client.phone}`} className="text-amber underline">{client.phone}</a>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="filmcard py-5">
          <p className="text-sm text-charcoal/60">Total facturé</p>
          <p className="font-display text-2xl mt-1">{facture.toFixed(2)} €</p>
        </div>
        <div className="filmcard py-5">
          <p className="text-sm text-charcoal/60">Reste à payer</p>
          <p className="font-display text-2xl mt-1">{impaye.toFixed(2)} €</p>
        </div>
      </div>

      <Bloc titre="Séances" vide="Aucune séance." items={client.sessions.map(s => ({
        id: s.id,
        titre: `${s.type || 'Séance'}${s.date ? ' — ' + s.date : ''}${s.time ? ' à ' + s.time : ''}`,
        detail: [s.location, s.notes].filter(Boolean).join(' · '),
        statut: STATUTS[s.status]
      }))} />
      <Bloc titre="Devis" vide="Aucun devis." items={client.devis.map(d => ({
        id: d.id, titre: `${d.total} €`, detail: fmtDate(d.createdAt), statut: STATUTS[d.status]
      }))} />
      <Bloc titre="Factures" vide="Aucune facture." items={client.factures.map(f => ({
        id: f.id, titre: `${f.total} €`, detail: f.dueDate ? 'échéance ' + f.dueDate : fmtDate(f.createdAt), statut: STATUTS[f.status]
      }))} />
      <Bloc titre="Contrats" vide="Aucun contrat." items={client.contrats.map(c => ({
        id: c.id, titre: c.status === 'signe' ? 'Contrat signé' : 'Contrat à signer', detail: c.signedAt ? 'signé le ' + c.signedAt : fmtDate(c.createdAt), statut: STATUTS[c.status]
      }))} />
    </div>
  )
}

function Bloc({ titre, items, vide }) {
  return (
    <div className="mb-6">
      <h3 className="font-display text-lg mb-2">{titre}</h3>
      {items.length === 0 && <p className="text-charcoal/60 text-sm">{vide}</p>}
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.id} className="bg-white border border-border rounded px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{i.titre}</p>
              {i.detail && <p className="text-xs text-charcoal/60 mt-0.5">{i.detail}</p>}
            </div>
            <span className="text-xs text-amber whitespace-nowrap">{i.statut}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
