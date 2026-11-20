import { useEffect, useState } from 'react'
import { listenContrats, createContrat, updateContrat, deleteContrat } from '../lib/data'

const fmt = (v) => {
  if (!v) return ''
  const d = v?.toDate ? v.toDate() : new Date(v)
  if (isNaN(d)) return String(v)
  return d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

const gmail = (to, su, body) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to || '')}&su=${encodeURIComponent(su)}&body=${encodeURIComponent(body)}`

export default function Contrats() {
  const [contrats, setContrats] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', email: '', content: '' })
  const [copiedId, setCopiedId] = useState(null)
  const [filter, setFilter] = useState('tous') // tous | a_signer | signes
  const [openId, setOpenId] = useState(null)
  const [printId, setPrintId] = useState(null)

  useEffect(() => listenContrats(setContrats), [])

  const link = (c) => `${window.location.origin}/espace/${c.token}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createContrat(form)
    setForm({ clientName: '', email: '', content: '' })
    setShowForm(false)
    setFilter('a_signer')
  }

  const copyLink = (c) => {
    navigator.clipboard.writeText(link(c))
    setCopiedId(c.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Ouvre Gmail tout de suite (sinon le navigateur bloque), puis note l'envoi dans l'historique
  const envoyer = (c) => {
    window.open(
      gmail(
        c.email,
        'Votre contrat — Laetitia Fey Photography',
        `Bonjour ${c.clientName},\n\nVoici votre contrat à signer en ligne (depuis votre téléphone ou ordinateur, sans rien installer) :\n${link(c)}\n\nIl suffit de lire, signer avec le doigt puis valider. Vous pourrez ensuite télécharger votre exemplaire.\n\nMerci et à très bientôt,\nLaetitia Fey`
      ),
      '_blank'
    )
    updateContrat(c.id, { sentAt: new Date().toISOString(), sentTo: c.email || '' })
  }

  const envoyerCopie = (c) => {
    window.open(
      gmail(
        c.email,
        'Votre contrat signé — Laetitia Fey Photography',
        `Bonjour ${c.clientName},\n\nMerci d'avoir signé votre contrat. Vous pouvez retrouver et télécharger votre exemplaire signé (PDF) à tout moment ici :\n${link(c)}\n\nÀ très bientôt,\nLaetitia Fey`
      ),
      '_blank'
    )
    updateContrat(c.id, { copySentAt: new Date().toISOString() })
  }

  const imprimer = (c) => {
    setPrintId(c.id)
    setTimeout(() => window.print(), 300)
  }

  const supprimer = (c) => {
    const msg = c.status === 'signe'
      ? `Ce contrat est SIGNÉ par ${c.clientName}. Le supprimer efface définitivement la preuve de signature. Continuer ?`
      : `Supprimer le contrat de ${c.clientName} ?`
    if (window.confirm(msg)) deleteContrat(c.id)
  }

  const nbASigner = contrats.filter(c => c.status !== 'signe').length
  const nbSignes = contrats.filter(c => c.status === 'signe').length
  const liste = contrats.filter(c =>
    filter === 'tous' ? true : filter === 'signes' ? c.status === 'signe' : c.status !== 'signe'
  )
  const toPrint = contrats.find(c => c.id === printId)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Contrats</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-amber text-ink px-4 py-2 rounded text-sm font-medium">
          {showForm ? 'Annuler' : '+ Nouveau contrat'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 text-sm">
        {[
          ['tous', `Tous (${contrats.length})`],
          ['a_signer', `🔴 À signer (${nbASigner})`],
          ['signes', `🟢 Signés (${nbSignes})`]
        ].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded border ${filter === k ? 'bg-charcoal text-paper border-charcoal' : 'border-border'}`}>
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="filmcard py-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input required placeholder="Nom du client" value={form.clientName}
              onChange={e => setForm({ ...form, clientName: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
            <input type="email" placeholder="Email du client" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
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
        {liste.map(c => {
          const signe = c.status === 'signe'
          return (
            <div key={c.id}
              className={`filmcard py-4 border-l-4 ${signe ? 'border-green-600' : 'border-red-600'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${signe ? 'bg-green-600' : 'bg-red-600'}`} />
                    {c.clientName}
                    <span className={`text-sm ${signe ? 'text-green-700' : 'text-red-700'}`}>
                      {signe ? 'Signé' : 'À signer'}
                    </span>
                  </p>
                  {signe
                    ? <p className="text-sm text-charcoal/70">Signé le {c.signedAt}</p>
                    : <p className="text-sm text-charcoal/70">{c.sentAt ? `Envoyé le ${fmt(c.sentAt)}` : 'Pas encore envoyé'}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {c.signature && (
                    <img src={c.signature} alt="Signature" className="h-8 border border-border rounded bg-white" />
                  )}
                  {!signe && (
                    <button onClick={() => envoyer(c)} className="text-sm bg-amber text-ink px-3 py-1 rounded font-medium">
                      {c.sentAt ? 'Renvoyer par email' : 'Envoyer par email'}
                    </button>
                  )}
                  {signe && (
                    <>
                      <button onClick={() => imprimer(c)} className="text-sm bg-amber text-ink px-3 py-1 rounded font-medium">
                        PDF
                      </button>
                      <button onClick={() => envoyerCopie(c)} className="text-sm text-amber">
                        {c.copySentAt ? 'Renvoyer la copie' : 'Envoyer la copie au client'}
                      </button>
                    </>
                  )}
                  <button onClick={() => copyLink(c)} className="text-sm text-amber">
                    {copiedId === c.id ? 'Copié !' : 'Lien client'}
                  </button>
                  <button onClick={() => setOpenId(openId === c.id ? null : c.id)} className="text-sm text-charcoal/70">
                    Historique
                  </button>
                  <button onClick={() => supprimer(c)} className="text-sm text-red-700/70">Supprimer</button>
                </div>
              </div>

              {openId === c.id && (
                <ul className="mt-3 pt-3 border-t border-border text-sm space-y-1">
                  <li>📝 Créé le {fmt(c.createdAt)}</li>
                  {c.sentAt && <li>📧 Envoyé le {fmt(c.sentAt)}{c.sentTo ? ` à ${c.sentTo}` : ''}</li>}
                  {signe && <li>✅ Signé le {c.signedAt}</li>}
                  {c.copySentAt && <li>📧 Copie signée envoyée le {fmt(c.copySentAt)}</li>}
                </ul>
              )}
            </div>
          )
        })}
        {liste.length === 0 && <p className="text-charcoal/60 text-sm">Aucun contrat ici.</p>}
      </div>

      {toPrint && (
        <div id="contrat-print" className="print-only">
          <h1 style={{ fontSize: 22, marginBottom: 4 }}>Contrat de prestation — Studio Laetitia Fey</h1>
          <p style={{ marginBottom: 4 }}>Client : {toPrint.clientName}</p>
          <p style={{ marginBottom: 16 }}>Signé le {toPrint.signedAt}</p>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.5 }}>{toPrint.content}</p>
          <p style={{ marginTop: 24, fontSize: 13 }}>Signature du client :</p>
          {toPrint.signature && <img src={toPrint.signature} alt="Signature" style={{ height: 80 }} />}
        </div>
      )}

      <style>{`
        .print-only { display: none; }
        @media print {
          body * { visibility: hidden; }
          #contrat-print, #contrat-print * { visibility: visible; }
          #contrat-print { display: block; position: absolute; left: 0; top: 0; width: 100%; padding: 24px; color: #000; background: #fff; }
        }
      `}</style>
    </div>
  )
}
