const admin = require('firebase-admin')

const VALID_PLANS = ['free', 'basico', 'basicoAnual', 'pro', 'proAnual']
const DATA_KEYS = [
  'profile','subjects','daily','sessions','reviews','tasks',
  'gamification','notes','books','cronograma','distribuicao'
]

async function listUsers(req, res) {
  try {
    const snap = await admin.firestore().collection('users').get()
    const users = []
    snap.forEach(doc => {
      const d = doc.data()
      users.push({
        uid:       doc.id,
        name:      d.name      || '—',
        email:     d.email     || '',
        plan:      d.plan      || 'free',
        createdAt: d.createdAt || null
      })
    })
    res.json(users)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function changePlan(req, res) {
  const { uid } = req.params
  const { plan } = req.body

  if (!plan || !VALID_PLANS.includes(plan)) {
    return res.status(400).json({ error: `Plano inválido. Use: ${VALID_PLANS.join(', ')}` })
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

  // ETAPA 1 — deletar docs da subcoleção data
  try {
    const batch = admin.firestore().batch()
    DATA_KEYS.forEach(k => {
      batch.delete(admin.firestore().doc(`users/${uid}/data/${k}`))
    })
    await batch.commit()
  } catch (e) {
    console.warn(`deleteUser: erro ao deletar subcoleção de ${uid}:`, e.message)
  }

  // ETAPA 2 — deletar doc users/:uid
  try {
    await admin.firestore().doc(`users/${uid}`).delete()
  } catch (e) {
    console.warn(`deleteUser: erro ao deletar doc do usuário ${uid}:`, e.message)
  }

  // ETAPA 3 — deletar no Firebase Auth
  try {
    await admin.auth().deleteUser(uid)
  } catch (e) {
    console.warn(`deleteUser: erro ao deletar auth de ${uid}:`, e.message)
  }

  res.json({ ok: true, uid })
}

module.exports = { listUsers, changePlan, deleteUser }
