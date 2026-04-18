const functions = require('firebase-functions');
const admin     = require('firebase-admin');
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

admin.initializeApp();

const app = express();

// — Segurança
app.use(helmet({ contentSecurityPolicy: false })); // CSP via firebase.json
app.use(cors({ origin: ['https://estudobb.com.br', 'https://estudobb-5c661.web.app'] }));
app.use(express.json({ limit: '512kb' }));

// — Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

app.use(globalLimiter);

// — Rotas existentes
const userRoutes = require('./routes/userRoutes');
const dataRoutes = require('./routes/dataRoutes');
const planRoutes = require('./routes/planRoutes');

app.use('/auth',  authLimiter);
app.use('/users', userRoutes);
app.use('/data',  dataRoutes);
app.use('/plan',  planRoutes);

// — Rotas admin (NOVO)
const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

// — Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// — Error handler
app.use((err, req, res, next) => {
  console.error(`[EstudoBB Error]`, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno' });
});

exports.api = functions
  .region('southamerica-east1')
  .https.onRequest(app);
