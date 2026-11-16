// Guscio I/O Google Calendar: GIS (token) + REST. Nessuna logica, niente DOM.
(function (g) {
  const BASE = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  const TKEY = 'cervello_tok';
  let client = null, token = null, expiresAt = 0, pending = null, refreshing = null;

  // Token (scope calendar.events, ~1h) salvato nel browser dell'utente: riapertura entro l'ora senza popup.
  function saveTok() { try { localStorage.setItem(TKEY, JSON.stringify({ t: token, e: expiresAt })); } catch (e) {} }
  function clearTok() { token = null; expiresAt = 0; try { localStorage.removeItem(TKEY); } catch (e) {} }
  function hasToken() {
    if (!token) { try { const c = JSON.parse(localStorage.getItem(TKEY) || 'null'); if (c) { token = c.t; expiresAt = c.e; } } catch (e) {} }
    return !!token && Date.now() < expiresAt;
  }

  function init(clientId) {
    client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (r) => {
        if (r.access_token) {
          token = r.access_token;
          expiresAt = Date.now() + (r.expires_in || 3600) * 1000 - 30000;
          saveTok();
          pending && pending.resolve();
        } else pending && pending.reject(new Error(r.error || 'AUTH_FALLITA'));
        pending = null;
      },
      error_callback: (e) => { pending && pending.reject(new Error(e.type || 'AUTH_ANNULLATA')); pending = null; },
    });
  }

  // opts {prompt:''} = rinnovo silenzioso (niente popup); concorrenti condividono lo stesso rinnovo
  function connect(opts) {
    const silent = opts && opts.prompt === '';
    if (silent && refreshing) return refreshing;
    const p = new Promise((resolve, reject) => {
      pending = { resolve, reject };
      client.requestAccessToken(opts || {});
    });
    if (silent) refreshing = p.finally(() => { refreshing = null; });
    return silent ? refreshing : p;
  }


  async function req(method, path, body, _retried) {
    const headers = { Authorization: 'Bearer ' + token };
    if (body) headers['Content-Type'] = 'application/json';
    const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 401) {
      clearTok();
      if (_retried) throw new Error('TOKEN_SCADUTO');
      try { await connect({ prompt: '' }); } catch (e) { throw new Error('TOKEN_SCADUTO'); }
      return req(method, path, body, true);
    }
    if (!res.ok) throw new Error('GCAL ' + res.status + ': ' + await res.text());
    return res.status === 204 ? null : res.json();
  }

  g.GCal = {
    init, connect, hasToken,
    async list(timeMinISO) {
      const d = await req('GET', '?' + Model.buildListQuery({ timeMinISO }));
      return (d.items || []).map(Model.fromEvent);
    },
    async insert(ev) { return { id: (await req('POST', '', ev)).id }; },
    async patch(id, ev) { await req('PATCH', '/' + encodeURIComponent(id), ev); },
    async remove(id) { await req('DELETE', '/' + encodeURIComponent(id)); },
  };
})(typeof window !== 'undefined' ? window : globalThis);
