// frontend/utils/storage.js
// Wrapper seguro para localStorage — nunca armazena dados sensíveis

import { safeJsonParse } from './sanitize.js';

const PREFIX = 'bb_';

// Chaves que NUNCA devem ir para localStorage
const SENSITIVE_KEYS = ['password', 'token', 'apiKey', 'secret'];

function isSensitive(key) {
  return SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s));
}

export function lsSet(key, value) {
  if (isSensitive(key)) return; // nunca persiste dados sensíveis
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // quota exceeded ou private mode — falha silenciosa
  }
}

export function lsGet(key, fallback = null) {
  if (isSensitive(key)) return fallback;
  try {
    return safeJsonParse(localStorage.getItem(PREFIX + key), fallback);
  } catch {
    return fallback;
  }
}

export function lsRemove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {}
}

export function lsClear(keys = []) {
  keys.forEach(k => lsRemove(k));
}

export function lsGetAll(keys) {
  const result = {};
  keys.forEach(k => { result[k] = lsGet(k); });
  return result;
}
