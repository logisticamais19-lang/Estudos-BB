const admin = require('firebase-admin');

/**
 * Valida o Firebase ID Token no header Authorization.
 * Garante que req.uid e req.user estejam populados.
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente.' });
  }

  const token = header.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid  = decoded.uid;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

/**
 * Garante que o uid da rota bate com o uid do token.
 * Previne acesso cross-user.
 */
function ownerOnly(req, res, next) {
  const routeUid = req.params.userId || req.body?.userId;
  if (routeUid && routeUid !== req.uid) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
}

/**
 * Verifica plano do usuário (free | pro).
 * Adiciona req.plan.
 */
async function checkPlan(req, res, next) {
  try {
    const db  = admin.firestore();
    const ref = db.collection('users').doc(req.uid);
    const doc = await ref.get();
    req.plan  = doc.exists ? (doc.data().plan || 'free') : 'free';
    next();
  } catch {
    req.plan = 'free';
    next();
  }
}

function requirePro(req, res, next) {
  if (req.plan !== 'pro') {
    return res.status(403).json({ error: 'Recurso exclusivo do plano Pro.', upgrade: true });
  }
  next();
}

module.exports = { authenticate, ownerOnly, checkPlan, requirePro };
