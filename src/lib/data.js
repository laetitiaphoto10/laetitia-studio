import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { v4 as uuidv4 } from 'uuid'

// --- SESSIONS (séances / RDV) ---
export const listenSessions = (cb) => {
  const q = query(collection(db, 'sessions'), orderBy('date', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export const createSession = (data) => addDoc(collection(db, 'sessions'), {
  ...data,
  date: data.date || '', // vide tant que Laetitia n'a pas proposé de date
  status: data.status || 'en_attente', // en_attente | confirme | annule | termine
  token: uuidv4(),
  createdAt: serverTimestamp()
})

export const updateSession = (id, data) => updateDoc(doc(db, 'sessions', id), data)
export const deleteSession = (id) => deleteDoc(doc(db, 'sessions', id))

// --- EVENEMENTS PERSONNELS (calendrier de Laetitia : RDV persos, indispos...) ---
export const listenEvents = (cb) => {
  return onSnapshot(collection(db, 'events'), (snap) =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const createEvent = (data) => addDoc(collection(db, 'events'), {
  ...data,
  createdAt: serverTimestamp()
})

export const updateEvent = (id, data) => updateDoc(doc(db, 'events', id), data)
export const deleteEvent = (id) => deleteDoc(doc(db, 'events', id))

// --- PARAMETRES (modèle de contrat de Laetitia, etc.) ---
export const getSetting = async (key) => {
  const ref = doc(db, 'settings', key)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export const setSetting = (key, data) => setDocMerge(key, data)

async function setDocMerge(key, data) {
  const { setDoc } = await import('firebase/firestore')
  return setDoc(doc(db, 'settings', key), data, { merge: true })
}

// --- DEVIS ---
export const listenDevis = (cb) => {
  const q = query(collection(db, 'devis'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export const createDevis = (data) => addDoc(collection(db, 'devis'), {
  ...data,
  status: 'envoye', // brouillon | envoye | accepte | refuse
  token: uuidv4(),
  createdAt: serverTimestamp()
})

export const updateDevis = (id, data) => updateDoc(doc(db, 'devis', id), data)
export const deleteDevis = (id) => deleteDoc(doc(db, 'devis', id))

// --- FACTURES ---
export const listenFactures = (cb) => {
  const q = query(collection(db, 'factures'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export const createFacture = (data) => addDoc(collection(db, 'factures'), {
  ...data,
  status: 'impayee', // impayee | payee | en_retard
  token: uuidv4(),
  createdAt: serverTimestamp()
})

export const updateFacture = (id, data) => updateDoc(doc(db, 'factures', id), data)
export const deleteFacture = (id) => deleteDoc(doc(db, 'factures', id))

// --- CONTRATS ---
export const listenContrats = (cb) => {
  const q = query(collection(db, 'contrats'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
}

export const createContrat = (data) => addDoc(collection(db, 'contrats'), {
  ...data,
  status: 'en_attente', // en_attente | signe
  token: uuidv4(),
  createdAt: serverTimestamp()
})

export const updateContrat = (id, data) => updateDoc(doc(db, 'contrats', id), data)
export const deleteContrat = (id) => deleteDoc(doc(db, 'contrats', id))

// --- ACCES CLIENT PAR TOKEN (pages publiques, sans compte) ---
export const getDocByToken = async (collectionName, token) => {
  const q = query(collection(db, collectionName), where('token', '==', token))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

// --- DISPONIBILITES (créneaux publiés pour la réservation) ---
export const listenAvailability = (cb) => {
  return onSnapshot(collection(db, 'availability'), (snap) =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const setAvailability = (id, data) => updateDoc(doc(db, 'availability', id), data)
export const addAvailability = (data) => addDoc(collection(db, 'availability'), data)
