import { useEffect, useState } from 'react'
import { listenDevis, createDevis, deleteDevis } from '../lib/data'

const STATUS_LABELS = { brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé' }
const STATUS_COLOR = { brouillon: 'text-charcoal/60', envoye: 'text-amber', accepte: 'text-green-700', refuse: 'text-red-700' }

export default function Devis() {
  const [devis, setDevis] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', email: '', items: [{ label: '', price: '' }] })
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => listenDevis(setDevis), [])

  const total = form.items.reduce((sum, it) => sum + (parseFloat(it.price) || 0), 0)

  const updateItem = (i, field, value) => {
    const items = [...form.items]
    items[i] = { ...items[i], [field]: value }
    setForm({ ...form, items })
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { label: '', price: '' }] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createDevis({ ...form, total })
    setForm({ clientName: '', email: '', items: [{ label: '', price: '' }] })
    setShowForm(false)
  }

  const copyLink = (token, id) => {
    const url = `${window.location.origin}/espace/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl">Devis</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-amber text-ink px-4 py-2 rounded text-sm font-medium">
          {showForm ? 'Annuler' : '+ Nouveau devis'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="filmcard py-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <input required placeholder="Nom du client" value={form.clientName}
              onChange={e => setForm({ ...form, clientName: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
            <input type="email" placeholder="Email du client" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3 py-2 rounded border border-border" />
          </div>

          <p className="text-sm font-medium mb-2">Prestations</p>
          {form.items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Description" value={item.label}
                onChange={e => updateItem(i, 'label', e.target.value)}
                className="flex-1 px-3 py-2 rounded border border-border" />
              <input type="number" placeholder="Prix €" value={item.price}
                onChange={e => updateItem(i, 'price', e.target.value)}
                className="w-28 px-3 py-2 rounded border border-border" />
              {form.items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="text-red-700/70 px-2">×</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-sm text-amber mb-4">+ Ajouter une ligne</button>

          <p className="text-right font-display text-xl mb-4">Total : {total.toFixed(2)} €</p>
          <button type="submit" className="bg-charcoal text-paper px-4 py-2 rounded text-sm w-full">
            Créer et envoyer le devis
          </button>
        </form>
      )}

      <div className="space-y-3">
        {devis.map(d => (
          <div key={d.id} className="filmcard py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-medium">{d.clientName} <span className={`text-sm ml-2 ${STATUS_COLOR[d.status]}`}>{STATUS_LABELS[d.status]}</span></p>
              <p className="text-sm text-charcoal/70">{d.total?.toFixed?.(2)} €</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => copyLink(d.token, d.id)} className="text-sm text-amber">
                {copiedId === d.id ? 'Lien copié !' : 'Copier le lien client'}
              </button>
              <button onClick={() => deleteDevis(d.id)} className="text-sm text-red-700/70">Supprimer</button>
            </div>
          </div>
        ))}
        {devis.length === 0 && <p className="text-charcoal/60 text-sm">Aucun devis pour l'instant.</p>}
      </div>
    </div>
  )
}
