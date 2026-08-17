import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'
import { getDocByToken, updateDevis, updateContrat } from '../../lib/data'

export default function ClientPortal() {
  const { token } = useParams()
  const [devis, setDevis] = useState(undefined)
  const [facture, setFacture] = useState(undefined)
  const [contrat, setContrat] = useState(undefined)
  const sigRef = useRef(null)

  useEffect(() => {
    (async () => {
      setDevis(await getDocByToken('devis', token))
      setFacture(await getDocByToken('factures', token))
      setContrat(await getDocByToken('contrats', token))
    })()
  }, [token])

  const loaded = devis !== undefined && facture !== undefined && contrat !== undefined
  const nothingFound = loaded && !devis && !facture && !contrat

  const acceptDevis = async (accepted) => {
    await updateDevis(devis.id, { status: accepted ? 'accepte' : 'refuse' })
    setDevis({ ...devis, status: accepted ? 'accepte' : 'refuse' })
  }

  const signContrat = async () => {
    if (sigRef.current.isEmpty()) return
    const signature = sigRef.current.getCanvas().toDataURL('image/png')
    const signedAt = new Date().toLocaleDateString('fr-FR')
    await updateContrat(contrat.id, { signature, signedAt, status: 'signe' })
    setContrat({ ...contrat, signature, signedAt, status: 'signe' })
  }

  if (!loaded) {
    return <div className="min-h-screen bg-ink flex items-center justify-center text-paper">Chargement...</div>
  }

  if (nothingFound) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-6">
        <div className="filmcard py-10 max-w-md text-center">
          <h1 className="font-display text-xl mb-2">Lien introuvable</h1>
          <p className="text-charcoal/70 text-sm">Ce lien n'est plus valide. Contactez Laetitia pour un nouveau lien.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink p-6">
      <div className="max-w-xl mx-auto space-y-6 py-8">
        <h1 className="font-display text-2xl text-paper text-center mb-2">Votre espace — Studio Laetitia Fey</h1>

        {devis && (
          <div className="filmcard py-6">
            <h2 className="font-display text-lg mb-3">Devis</h2>
            <ul className="text-sm mb-3 space-y-1">
              {devis.items?.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>{it.label}</span><span>{it.price} €</span>
                </li>
              ))}
            </ul>
            <p className="text-right font-display text-xl mb-4">Total : {devis.total?.toFixed?.(2)} €</p>
            {devis.status === 'envoye' ? (
              <div className="flex gap-3">
                <button onClick={() => acceptDevis(true)} className="flex-1 bg-amber text-ink py-2 rounded text-sm font-medium">
                  Accepter le devis
                </button>
                <button onClick={() => acceptDevis(false)} className="flex-1 border border-charcoal py-2 rounded text-sm">
                  Refuser
                </button>
              </div>
            ) : (
              <p className={`text-sm font-medium ${devis.status === 'accepte' ? 'text-green-700' : 'text-red-700'}`}>
                {devis.status === 'accepte' ? 'Devis accepté, merci !' : 'Devis refusé'}
              </p>
            )}
          </div>
        )}

        {contrat && (
          <div className="filmcard py-6">
            <h2 className="font-display text-lg mb-3">Contrat</h2>
            <p className="text-sm whitespace-pre-wrap mb-4 max-h-64 overflow-y-auto border border-border rounded p-3 bg-white">
              {contrat.content}
            </p>
            {contrat.status === 'signe' ? (
              <div>
                <p className="text-sm text-green-700 font-medium mb-2">Signé le {contrat.signedAt}</p>
                <img src={contrat.signature} alt="Votre signature" className="h-16 border border-border rounded bg-white" />
              </div>
            ) : (
              <div>
                <p className="text-sm text-charcoal/70 mb-2">Signez ci-dessous pour valider le contrat :</p>
                <div className="border border-border rounded bg-white mb-3">
                  <SignatureCanvas ref={sigRef} penColor="#1A1816" canvasProps={{ className: 'w-full h-32' }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={signContrat} className="flex-1 bg-amber text-ink py-2 rounded text-sm font-medium">
                    Valider ma signature
                  </button>
                  <button onClick={() => sigRef.current.clear()} className="border border-charcoal px-4 py-2 rounded text-sm">
                    Effacer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {facture && (
          <div className="filmcard py-6">
            <h2 className="font-display text-lg mb-3">Facture</h2>
            <p className="font-display text-xl mb-1">{facture.total?.toFixed?.(2)} €</p>
            {facture.dueDate && <p className="text-sm text-charcoal/70 mb-2">Échéance : {facture.dueDate}</p>}
            <p className={`text-sm font-medium ${facture.status === 'payee' ? 'text-green-700' : 'text-amber'}`}>
              {facture.status === 'payee' ? 'Payée — merci !' : 'En attente de paiement'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
