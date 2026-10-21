import { collection, doc, onSnapshot, query, where, writeBatch, deleteDoc, runTransaction } from 'firebase/firestore'
import { db } from './firebase'

const col = collection(db, 'creneaux')

// Écoute les créneaux à partir d'une date (YYYY-MM-DD)
export function listenCreneaux(fromDate, cb) {
  const q = query(col, where('date', '>=', fromDate))
  return onSnapshot(q, snap => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
    cb(list)
  })
}

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
const toHHMM = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`

// Crée une série de créneaux sur une journée
export async function createSerie({ date, start, duree, pause, nombre, label, prix }) {
  const batch = writeBatch(db)
  let t = toMin(start)
  for (let i = 0; i < nombre; i++) {
    const ref = doc(col)
    batch.set(ref, {
      date, start: toHHMM(t), end: toHHMM(t + duree),
      label: label || 'Mini-séance', prix: prix || '',
      booked: false, createdAt: new Date().toISOString()
    })
    t += duree + pause
  }
  await batch.commit()
}

export const deleteCreneau = (id) => deleteDoc(doc(db, 'creneaux', id))

// Réservation côté client, sécurisée (un créneau ne peut être pris qu'une fois)
export async function reserverCreneau(id, data) {
  const ref = doc(db, 'creneaux', id)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists() || snap.data().booked) throw new Error('deja_pris')
    tx.update(ref, {
      booked: true,
      clientName: data.clientName, email: data.email,
      phone: data.phone || '', notes: data.notes || '',
      bookedAt: new Date().toISOString()
    })
  })
}

// Libère un créneau réservé (admin)
export async function libererCreneau(id) {
  const ref = doc(db, 'creneaux', id)
  await runTransaction(db, async (tx) => {
    tx.update(ref, { booked: false, clientName: '', email: '', phone: '', notes: '', bookedAt: '' })
  })
}

// Supprime plusieurs créneaux d'un coup (ex : toute une journée de test)
export async function deleteCreneaux(ids) {
  const batch = writeBatch(db)
  ids.forEach(id => batch.delete(doc(db, 'creneaux', id)))
  await batch.commit()
}
