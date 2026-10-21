import { useEffect, useState } from 'react'
import { listenSessions, createSession, updateSession } from '../lib/data'

// Séances récupérées de l'agenda Fotostudio (export PDF du 21/10/2026)
const SEANCES = [
  {"clientName": "Elodie Obre", "type": "Noël 2026", "date": "2026-10-30", "time": "11:50", "end": "12:50"},
  {"clientName": "Megane Perignon", "type": "Noël 2026", "date": "2026-10-31", "time": "09:15", "end": "10:15"},
  {"clientName": "Melanie Lacher", "type": "Noël 2026", "date": "2026-10-31", "time": "10:00", "end": "11:00"},
  {"clientName": "Cristel Henriques", "type": "Noël 2026", "date": "2026-10-31", "time": "10:55", "end": "11:55"},
  {"clientName": "Debora Torrao Santana", "type": "Noël 2026", "date": "2026-10-31", "time": "12:45", "end": "13:45"},
  {"clientName": "Sara Carvalho", "type": "Noël 2026", "date": "2026-10-31", "time": "13:50", "end": "14:50"},
  {"clientName": "Carmen Ribeiro", "type": "Noël 2026", "date": "2026-10-31", "time": "15:30", "end": "16:30"},
  {"clientName": "Adeline Palumbo", "type": "Noël 2026", "date": "2026-10-31", "time": "16:25", "end": "17:25"},
  {"clientName": "Lia Marinelli", "type": "Noël 2026", "date": "2026-10-31", "time": "17:30", "end": "18:30"},
  {"clientName": "Isabel Macedo", "type": "Noël 2026", "date": "2026-11-01", "time": "10:00", "end": "11:00"},
  {"clientName": "Angela De Michele", "type": "Noël 2026", "date": "2026-11-01", "time": "10:55", "end": "11:55"},
  {"clientName": "Mélodie Toi mon amour", "type": "Noël 2026", "date": "2026-11-01", "time": "13:15", "end": "14:15"},
  {"clientName": "Juliette Clément", "type": "Noël 2026", "date": "2026-11-01", "time": "15:05", "end": "16:05"},
  {"clientName": "Lucie Collin", "type": "Noël 2026", "date": "2026-11-01", "time": "16:55", "end": "17:45"},
  {"clientName": "Katy Timoteo", "type": "Noël 2026", "date": "2026-11-02", "time": "11:30", "end": "12:30"},
  {"clientName": "Christel Di matteo", "type": "Noël 2026", "date": "2026-11-04", "time": "15:30", "end": "16:30"},
  {"clientName": "Tânia Silva", "type": "Noël 2026", "date": "2026-11-07", "time": "10:00", "end": "11:00"},
  {"clientName": "Jennifer Martin", "type": "Noël 2026", "date": "2026-11-07", "time": "10:55", "end": "11:55"},
  {"clientName": "Isabel Ferreira", "type": "Noël 2026", "date": "2026-11-07", "time": "12:45", "end": "13:45"},
  {"clientName": "Filipa Macedo", "type": "Noël 2026", "date": "2026-11-07", "time": "13:40", "end": "14:40"},
  {"clientName": "Floryn Ketelaere", "type": "Noël 2026", "date": "2026-11-07", "time": "14:40", "end": "15:40"},
  {"clientName": "Stephanie Garcia Martins", "type": "Noël 2026", "date": "2026-11-07", "time": "15:30", "end": "16:30"},
  {"clientName": "Ophélia BONNET", "type": "Noël 2026", "date": "2026-11-08", "time": "15:30", "end": "16:30"},
  {"clientName": "Marion De Paulis", "type": "Grossesse", "date": "2026-11-18", "time": "13:00", "end": "15:00"},
  {"clientName": "Marion Messsin", "type": "Grossesse", "date": "2026-11-21", "time": "10:30", "end": "12:00"},
  {"clientName": "Laetitia Becker", "type": "Grossesse", "date": "2026-12-08", "time": "14:00", "end": "15:00"},
  {"clientName": "Melissa Mafaro", "type": "Grossesse", "date": "2026-12-09", "time": "10:00", "end": "15:00"},
  {"clientName": "Adeline Declerck", "type": "Grossesse", "date": "2026-12-19", "time": "14:00", "end": "15:00"},
  {"clientName": "Céline Covarel", "type": "Mariage", "date": "2027-06-26", "time": "", "end": ""}
]


// ---- Lecture du fichier de contacts (CSV avec ; ), directement dans le navigateur ----
function parseCSV(text) {
  const rows = []
  let row = [], cur = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') q = false
      else cur += c
    } else if (c === '"') q = true
    else if (c === ';') { row.push(cur); cur = '' }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
    else if (c !== '\r') cur += c
  }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  const head = rows.shift().map(h => h.replace(/^\uFEFF/, '').trim())
  return rows.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])))
}
const norm = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean).sort().join(' ')
const tel = (t) => (/\d{6,}/.test(t || '') ? t : '')

const LIEU = "13bis rue de l'abbé Henrion, 54400 Longwy"

export default function ImportFotostudio() {
  const [existantes, setExistantes] = useState(null)
  const [etat, setEtat] = useState('') // '', 'en cours', 'fini'
  const [fait, setFait] = useState(0)
  const [contacts, setContacts] = useState(null)
  const [majEtat, setMajEtat] = useState('')

  useEffect(() => listenSessions(setExistantes), [])

  const cle = (nom, date) => `${nom.toLowerCase().trim()}|${date}`
  const dejaLa = new Set((existantes || []).map(s => cle(s.clientName || '', s.date || '')))
  const aImporter = SEANCES.filter(s => !dejaLa.has(cle(s.clientName, s.date)))


  // Contacts : on associe email / téléphone aux séances (même nom + prénom)
  const lireFichier = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setContacts(parseCSV(await f.text()))
  }
  const parNom = {}
  ;(contacts || []).forEach(c => {
    const k = norm(`${c['Prénom']} ${c['Nom']}`)
    const cur = parNom[k]
    if (!cur || (!cur.Email && c.Email)) parNom[k] = c
  })
  const aCompleter = (existantes || []).filter(s => {
    const c = parNom[norm(s.clientName)]
    return c && ((!s.email && c.Email) || (!s.phone && tel(c['Téléphone'])))
  })
  const completer = async () => {
    setMajEtat('en cours')
    for (const s of aCompleter) {
      const c = parNom[norm(s.clientName)]
      const maj = {}
      if (!s.email && c.Email) maj.email = c.Email.toLowerCase()
      if (!s.phone && tel(c['Téléphone'])) maj.phone = c['Téléphone']
      await updateSession(s.id, maj)
    }
    setMajEtat('fini')
  }

  const importer = async () => {
    setEtat('en cours')
    let n = 0
    for (const s of aImporter) {
      await createSession({
        clientName: s.clientName, email: '', phone: '',
        type: s.type, date: s.date, time: s.time,
        location: LIEU,
        notes: s.end ? `Importé de Fotostudio (fin prévue ${s.end})` : 'Importé de Fotostudio',
        status: 'confirme'
      })
      n++; setFait(n)
    }
    setEtat('fini')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-1">Import Fotostudio</h1>
      <h2 className="font-display text-2xl mb-1 mt-4">1. Séances</h2>
      <p className="text-charcoal/70 mb-6">
        {SEANCES.length} séances trouvées dans l'agenda Fotostudio. Celles déjà présentes (même nom, même date) sont ignorées.
      </p>

      {existantes === null && <p>Chargement...</p>}
      {existantes !== null && etat === '' && (
        <>
          <p className="mb-4"><strong>{aImporter.length}</strong> séance(s) à importer.</p>
          <ul className="text-sm mb-6 bg-white border border-border rounded p-3 max-h-80 overflow-auto">
            {aImporter.map(s => (
              <li key={s.clientName + s.date + s.time}>{s.date} {s.time} · {s.clientName} · {s.type}</li>
            ))}
          </ul>
          <button onClick={importer} disabled={aImporter.length === 0}
            className="bg-ink text-paper px-5 py-2.5 rounded disabled:opacity-50">
            Importer {aImporter.length} séances
          </button>
        </>
      )}
      {etat === 'en cours' && <p>Import en cours... {fait} / {aImporter.length}</p>}
      {etat === 'fini' && <p className="text-green-700">Terminé : {fait} séances importées. Vérifie dans Agenda et Calendrier.</p>}

      <hr className="my-10 border-border" />
      <h2 className="font-display text-2xl mb-1">2. Emails et téléphones</h2>
      <p className="text-charcoal/70 mb-4">
        Choisis le fichier de contacts exporté de Fotostudio. Il est lu uniquement dans ton navigateur : rien n'est envoyé ailleurs.
      </p>
      <input type="file" accept=".csv,.txt" onChange={lireFichier} className="mb-4 block" />
      {contacts && majEtat === '' && (
        <>
          <p className="mb-3"><strong>{contacts.length}</strong> contacts lus. <strong>{aCompleter.length}</strong> séance(s) à compléter avec un email ou un téléphone.</p>
          <button onClick={completer} disabled={aCompleter.length === 0}
            className="bg-ink text-paper px-5 py-2.5 rounded disabled:opacity-50">
            Compléter {aCompleter.length} séances
          </button>
        </>
      )}
      {majEtat === 'en cours' && <p>Mise à jour en cours...</p>}
      {majEtat === 'fini' && <p className="text-green-700">Terminé : emails et téléphones ajoutés. Vérifie dans Agenda.</p>}
    </div>
  )
}
