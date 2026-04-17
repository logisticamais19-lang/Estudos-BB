// frontend/utils/sanitize.js
// Sanitização segura para usar no lugar de innerHTML com dados externos

/**
 * Escapa HTML — use para dados vindos do usuário/Firebase/localStorage
 */
export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#x27;');
}

/**
 * Cria elemento e define textContent — zero XSS
 */
export function createTextEl(tag, text, attrs = {}) {
  const el = document.createElement(tag);
  el.textContent = text;
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

/**
 * Para templates com dados dinâmicos: sanitiza cada valor antes de interpolar
 * Uso: safeTemplate`<div>${userInput}</div>`
 */
export function safeTemplate(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const val = values[i - 1];
    return acc + escapeHtml(val == null ? '' : String(val)) + str;
  });
}

/**
 * Sanitiza um objeto vindo do Firebase/localStorage antes de usar
 */
export function sanitizeInput(val, maxLen = 5000) {
  if (typeof val === 'string') return escapeHtml(val.trim().slice(0, maxLen));
  if (typeof val === 'number') return isFinite(val) ? val : 0;
  if (typeof val === 'boolean') return val;
  if (Array.isArray(val)) return val.map(v => sanitizeInput(v, maxLen));
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[escapeHtml(k)] = sanitizeInput(v, maxLen);
    }
    return out;
  }
  return '';
}

/**
 * Parse seguro de JSON do localStorage
 */
export function safeJsonParse(str, fallback = null) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
