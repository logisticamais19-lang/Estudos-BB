const admin = require('firebase-admin');
const db    = admin.firestore;

const VALID_KEYS = ['profile','subjects','daily','sessions','reviews','tasks','gamification','notes','books'];

/**
 * Carrega todos os documentos de dados do usuário
 */
async function loadUserData(uid) {
  const refs  = VALID_KEYS.map(k => db().collection('users').doc(uid).collection('data').doc(k));
  const snaps = await Promise.all(refs.map(r => r.get()));
  const result = {};
  snaps.forEach((snap, i) => {
    result[VALID_KEYS[i]] = snap.exists ? snap.data() : null;
  });
  return result;
}

/**
 * Salva um documento de dados do usuário
 */
async function saveUserDoc(uid, key, data) {
  if (!VALID_KEYS.includes(key)) throw new Error('Chave inválida.');
  const ref = db().collection('users').doc(uid).collection('data').doc(key);
  await ref.set(data, { merge: false });
  return true;
}

/**
 * Salva múltiplos documentos em batch
 */
async function saveUserDataBatch(uid, payload) {
  const batch = db().batch();
  for (const [key, data] of Object.entries(payload)) {
    if (!VALID_KEYS.includes(key)) continue;
    const ref = db().collection('users').doc(uid).collection('data').doc(key);
    batch.set(ref, data);
  }
  await batch.commit();
  return true;
}

/**
 * Lê o perfil do usuário (inclui plano)
 */
async function getUserProfile(uid) {
  const ref  = db().collection('users').doc(uid);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

/**
 * Cria/atualiza perfil do usuário (inclui plano padrão)
 */
async function upsertUserProfile(uid, data) {
  const ref = db().collection('users').doc(uid);
  await ref.set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

/**
 * Deleta todos os dados do usuário
 */
async function deleteUserData(uid) {
  const batch = db().batch();
  const refs  = VALID_KEYS.map(k => db().collection('users').doc(uid).collection('data').doc(k));
  refs.forEach(r => batch.delete(r));
  batch.delete(db().collection('users').doc(uid));
  await batch.commit();
}

module.exports = { loadUserData, saveUserDoc, saveUserDataBatch, getUserProfile, upsertUserProfile, deleteUserData };
