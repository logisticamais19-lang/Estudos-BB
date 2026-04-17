// frontend/services/firebaseService.js
// Camada de serviço — o front nunca acessa Firestore diretamente

const VALID_KEYS = ['profile','subjects','daily','sessions','reviews','tasks','gamification','notes','books'];

let _db  = null;
let _uid = null;
let _fb  = null;

export function initService(firebase, uid) {
  _fb  = firebase;
  _db  = firebase.db;
  _uid = uid;
}

function docRef(key) {
  return _fb.doc(_db, 'users', _uid, 'data', key);
}

export async function loadAllData() {
  const snaps = await Promise.all(
    VALID_KEYS.map(k => _fb.getDoc(docRef(k)))
  );
  const result = {};
  snaps.forEach((snap, i) => {
    result[VALID_KEYS[i]] = snap.exists() ? snap.data() : null;
  });
  return result;
}

export async function saveDoc(key, data) {
  if (!VALID_KEYS.includes(key)) throw new Error('Chave inválida');
  return _fb.setDoc(docRef(key), data);
}

export async function saveAllDocs(payload) {
  const entries = Object.entries(payload).filter(([k]) => VALID_KEYS.includes(k));
  return Promise.all(entries.map(([k, v]) => saveDoc(k, v)));
}

export async function getUserPlan() {
  try {
    const snap = await _fb.getDoc(_fb.doc(_db, 'users', _uid));
    return snap.exists() ? (snap.data().plan || 'free') : 'free';
  } catch {
    return 'free';
  }
}
