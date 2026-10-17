// Shared dependency-free contract v1. Copy unchanged into participating embeds.
export const LANGUAGES = Object.freeze({ fr: { name: 'Français', dir: 'ltr' }, en: { name: 'English', dir: 'ltr' } });
export const STORAGE_KEY = 'jpdb.language.v1';
export const CHANNEL = 'jpdb-language';
export function language(value) {
  if (typeof value !== 'string' || value.length > 40) return null;
  try {
    const base = Intl.getCanonicalLocales(value.trim())[0]?.split('-')[0];
    return Object.hasOwn(LANGUAGES, base) ? base : null;
  } catch { return null; }
}
export function resolveLanguage({ host, url, stored, browser = [] } = {}) {
  return [host, url, stored, ...browser].map(language).find(Boolean) || 'fr';
}
export function readChoice(storage) {
  try { return language(storage.getItem(STORAGE_KEY)); } catch { return null; }
}
export function saveChoice(storage, value) {
  const code = language(value);
  if (!code) return false;
  try { storage.setItem(STORAGE_KEY, code); return true; } catch { return false; }
}
export function applyDocument(document, value) {
  const code = language(value) || 'fr';
  document.documentElement.lang = code;
  document.documentElement.dir = LANGUAGES[code].dir;
}
export function packet(type, value) {
  return { channel: CHANNEL, version: 1, type, ...(value ? { language: language(value) } : {}) };
}
export function isPacket(data, type) {
  return !!data && data.channel === CHANNEL && data.version === 1 && data.type === type;
}
export function validateCatalogs(catalogs) {
  const errors = [];
  const base = catalogs.fr || {};
  const placeholders = value => [...String(value).matchAll(/\{([a-zA-Z][\w]*)\}/g)].map(m => m[1]).sort().join(',');
  for (const code of Object.keys(LANGUAGES)) {
    const catalog = catalogs[code] || {};
    for (const key of new Set([...Object.keys(base), ...Object.keys(catalog)])) {
      if (!Object.hasOwn(base, key) || !Object.hasOwn(catalog, key)) errors.push(`${code}:${key}: missing or extra key`);
      else if (typeof catalog[key] !== 'string' || !catalog[key].trim()) errors.push(`${code}:${key}: empty/non-string`);
      else if (placeholders(base[key]) !== placeholders(catalog[key])) errors.push(`${code}:${key}: placeholders differ`);
    }
  }
  return errors;
}
export function translate(catalogs, code, key, values = {}) {
  const selected = language(code) || 'fr';
  const text = (Object.hasOwn(catalogs[selected] || {}, key) ? catalogs[selected][key] : undefined)
    ?? (Object.hasOwn(catalogs.fr || {}, key) ? catalogs.fr[key] : undefined) ?? key;
  // Return plain text: consumers use textContent, never HTML interpolation.
  return String(text).replace(/\{([a-zA-Z][\w]*)\}/g, (match, name) => Object.hasOwn(values, name) ? String(values[name]) : match);
}
export function formatNumber(value, code, options = {}) {
  return new Intl.NumberFormat(language(code) || 'fr', options).format(value);
}
export function formatDate(value, code, timeZone, options = {}) {
  if (!timeZone) throw new TypeError('An explicit event time zone is required');
  return new Intl.DateTimeFormat(language(code) || 'fr', { ...options, timeZone }).format(new Date(value));
}
export function formatMoney(amount, currency, code) {
  if (!/^[A-Z]{3}$/.test(currency || '')) throw new TypeError('Explicit currency code required');
  return formatNumber(amount, code, { style: 'currency', currency });
}
export function connectEmbed({ window, origins, onLanguage }) {
  let hostOrigin = null;
  const embedded = window.parent !== window;
  const send = data => {
    if (!embedded) return;
    for (const origin of hostOrigin ? [hostOrigin] : origins) window.parent.postMessage(data, origin);
  };
  const receive = event => {
    if (!embedded || event.source !== window.parent || !origins.includes(event.origin)) return;
    if (!isPacket(event.data, 'set') || !language(event.data.language)) return;
    hostOrigin = event.origin;
    onLanguage(language(event.data.language));
  };
  window.addEventListener('message', receive);
  const ready = () => send(packet('ready'));
  if (window.document.readyState === 'complete') ready();
  else window.addEventListener('load', ready, { once: true });
  // Bounded retry covers host onReady racing the iframe load event.
  let attempts = 0;
  const timer = window.setInterval(() => {
    if (hostOrigin || ++attempts >= 10) window.clearInterval(timer);
    else ready();
  }, 500);
  return {
    choose(value) { if (language(value)) send(packet('choose', value)); },
    destroy() { window.clearInterval(timer); window.removeEventListener('message', receive); window.removeEventListener('load', ready); }
  };
}
export function initialLanguage(window, legacyKey) {
  let storage;
  let legacy;
  try { storage = window.localStorage; legacy = legacyKey && storage.getItem(legacyKey); } catch { /* Storage is optional. */ }
  return resolveLanguage({ url: new URL(window.location.href).searchParams.get('lang'), stored: readChoice(storage) || legacy, browser: window.navigator.languages || [] });
}
export function createLanguageController(window, onChange, legacyKey) {
  let storage;
  try { storage = window.localStorage; } catch { /* Third-party storage can be blocked. */ }
  const apply = code => { applyDocument(window.document, code); onChange(code); };
  const bridge = connectEmbed({ window, origins: ['https://www.jouerpourdebon.ca', 'https://jouerpourdebon.ca'], onLanguage: apply });
  apply(initialLanguage(window, legacyKey));
  return {
    choose(value) {
      const code = language(value);
      if (!code) return;
      saveChoice(storage, code);
      apply(code);
      bridge.choose(code);
    },
    destroy: bridge.destroy
  };
}
