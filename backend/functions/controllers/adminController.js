const admin = require('firebase-admin')

const VALID_PLANS = ['free', 'basico', 'basicoAnual', 'pro', 'proAnual']
const DATA_KEYS = [
  'profile','subjects','daily','sessions','reviews','tasks',
  'gamification','notes','books','cronograma','distribuicao'
]

async function listUsers(req, res) {
  try {
    const snap = await admin.firestore().collection('users').get()
    const promises = snap.docs.map(async doc => {
      const d = doc.data()
      let name  = d.name  || ''
      let email = d.email || ''
      if (!name || !email) {
        try {
          const profileSnap = await admin.firestore().doc(`users/${doc.id}/data/profile`).get()
          if (profileSnap.exists) {
            const p = profileSnap.data()
            if (!name)  name  = p.name  || ''
            if (!email) email = p.email || ''
          }
        } catch(e) {}
      }
      return { uid: doc.id, name: name || '—', email: email || '', plan: d.plan || 'free', createdAt: d.createdAt || null }
    })
    const users = await Promise.all(promises)
    res.json(users)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function changePlan(req, res) {
  const { uid } = req.params
  const { plan } = req.body
  if (!plan || !VALID_PLANS.includes(plan)) {
    return res.status(400).json({ error: `Plano invalido. Use: ${VALID_PLANS.join(', ')}` })
  }
  try {
    await admin.firestore().doc(`users/${uid}`).set(
      { plan, planUpdatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    )
    res.json({ ok: true, uid, plan })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function deleteUser(req, res) {
  const { uid } = req.params
  try {
    const batch = admin.firestore().batch()
    DATA_KEYS.forEach(k => { batch.delete(admin.firestore().doc(`users/${uid}/data/${k}`)) })
    await batch.commit()
  } catch (e) { console.warn('deleteUser subcollection:', e.message) }
  try { await admin.firestore().doc(`users/${uid}`).delete() } catch (e) { console.warn('deleteUser doc:', e.message) }
  try { await admin.auth().deleteUser(uid) } catch (e) { console.warn('deleteUser auth:', e.message) }
  res.json({ ok: true, uid })
}

module.exports = { listUsers, changePlan, deleteUser }
