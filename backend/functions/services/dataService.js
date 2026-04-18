const admin = require('firebase-admin')

const VALID_KEYS = [
  'profile','subjects','daily','sessions','reviews','tasks',
  'gamification','notes','books','cronograma','distribuicao'
]

function ref(uid, key) {
  return admin.firestore().doc(`users/${uid}/data/${key}`)
}

async function loadAll(uid) {
  const snaps = await Promise.all(VALID_KEYS.map(k => ref(uid, k).get()))
  const result = {}
  snaps.forEach((s, i) => { result[VALID_KEYS[i]] = s.exists ? s.data() : null })
  return result
}

async function save(uid, key, data) {
  if (!VALID_KEYS.includes(key)) throw new Error('Chave inválida: ' + key)
  return ref(uid, key).set(data, { merge: true })
}

async function saveAll(uid, payload) {
  const entries = Object.entries(payload).filter(([k]) => VALID_KEYS.includes(k))
  return Promise.all(entries.map(([k, v]) => ref(uid, k).set(v)))
}

async function getUserPlan(uid) {
  try {
    const snap = await admin.firestore().doc(`users/${uid}`).get()
    return snap.exists ? (snap.data().plan || 'free') : 'free'
  } catch {
    return 'free'
  }
}

async function initUser(uid, data) {
  return admin.firestore().doc(`users/${uid}`).set(
    { plan: 'free', createdAt: admin.firestore.FieldValue.serverTimestamp(), ...data },
    { merge: true }
  )
}

module.exports = { VALID_KEYS, loadAll, save, saveAll, getUserPlan, initUser }
