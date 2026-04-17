const admin = require('firebase-admin');
const db    = admin.firestore;

const PLANS = {
  free: {
    maxSubjects:  10,
    maxBooks:     3,
    maxNotes:     50,
    maxTasks:     100,
    heatmap:      true,
    export:       false,
    aiFeatures:   false
  },
  pro: {
    maxSubjects:  Infinity,
    maxBooks:     Infinity,
    maxNotes:     Infinity,
    maxTasks:     Infinity,
    heatmap:      true,
    export:       true,
    aiFeatures:   true
  }
};

async function getUserPlan(uid) {
  const ref  = db().collection('users').doc(uid);
  const snap = await ref.get();
  return snap.exists ? (snap.data().plan || 'free') : 'free';
}

async function setPlan(uid, plan) {
  if (!['free','pro'].includes(plan)) throw new Error('Plano inválido.');
  await db().collection('users').doc(uid).set({
    plan,
    planUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

function getPlanLimits(plan) {
  return PLANS[plan] || PLANS.free;
}

module.exports = { getUserPlan, setPlan, getPlanLimits, PLANS };
