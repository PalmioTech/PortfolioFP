// Config privata di Cervello: incolla qui il tuo OAuth Client ID di Google.
(typeof window !== 'undefined' ? window : globalThis).CONFIG = { CLIENT_ID: '' };
if (typeof module !== 'undefined' && module.exports) { module.exports = globalThis.CONFIG; }
