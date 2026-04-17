const Joi = require('joi');

// Sanitiza string: remove tags HTML e caracteres perigosos
function sanitizeStr(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .slice(0, 5000); // limite máximo
}

// Sanitiza recursivamente um objeto
function sanitizeObj(obj) {
  if (typeof obj === 'string') return sanitizeStr(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObj);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[sanitizeStr(k)] = sanitizeObj(v);
    }
    return out;
  }
  return obj;
}

// ── Schemas Joi ──
const schemas = {
  profile: Joi.object({
    name:         Joi.string().min(1).max(80).required(),
    dailyGoalH:   Joi.number().min(1).max(24).required(),
    monthlyGoalH: Joi.number().min(1).max(744).required(),
    plan:         Joi.string().valid('free','pro').default('free')
  }),

  subject: Joi.object({
    id:       Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    name:     Joi.string().min(1).max(120).required(),
    hours:    Joi.number().min(0).max(9999).required(),
    target:   Joi.number().min(0).max(9999).required(),
    progress: Joi.number().min(0).max(100).required()
  }),

  task: Joi.object({
    id:    Joi.string().max(64).required(),
    text:  Joi.string().min(1).max(500).required(),
    type:  Joi.string().valid('study','work','personal').required(),
    date:  Joi.string().isoDate().required(),
    done:  Joi.boolean().required(),
    start: Joi.string().allow('').optional(),
    end:   Joi.string().allow('').optional()
  }),

  saveData: Joi.object({
    key:  Joi.string().valid('profile','subjects','daily','sessions','reviews','tasks','gamification','notes','books').required(),
    data: Joi.object().required()
  })
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    // Sanitiza antes de validar
    req.body = sanitizeObj(req.body);

    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const msgs = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: `Dados inválidos: ${msgs}` });
    }
    req.body = value;
    next();
  };
}

module.exports = { validate, sanitizeStr, sanitizeObj };
