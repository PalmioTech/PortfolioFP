(function () {
  const $ = (id) => document.getElementById(id);
  const KEY = 'cervello_client_id';

  function clientId() {
    let s = '';
    try { s = localStorage.getItem(KEY) || ''; } catch (e) {}
    return (window.CONFIG && CONFIG.CLIENT_ID) || s || '';
  }

  function status(msg, err) {
    const el = $('status');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('err', !!err);
  }

  // una sola region visibile: setup | connectBar | list | empty
  function show(which) {
    ['setup', 'connectBar', 'list', 'empty'].forEach((id) => { const el = $(id); if (el) el.hidden = id !== which; });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function etichetta(g) {
    if (g === 0) return 'oggi';
    if (g === 1) return 'domani';
    if (g < 0) return 'scaduta da ' + (-g) + (g === -1 ? ' giorno' : ' giorni');
    return 'mancano ' + g + ' giorni';
  }

  async function render() {
    const list = $('list'), empty = $('empty');
    if (!list || !empty) return;
    const n = new Date();
    const oggi = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
    const anno = oggi.slice(0, 4);
    let scadenze;
    try {
      scadenze = await GCal.list(anno + '-01-01T00:00:00Z');
    } catch (e) {
      list.innerHTML = ''; show('connectBar');
      status(e && e.message === 'TOKEN_SCADUTO' ? 'Sessione scaduta — riconnetti' : 'Errore di lettura — riconnetti', true);
      return;
    }
    status('Connesso');
    const rows = scadenze.map((s) => {
      const d = s.ricorrente ? Model.prossimaOccorrenza(s.dateISO, oggi) : s.dateISO;
      return { s, d, g: Model.giorniMancanti(d, oggi) };
    }).sort((a, b) => a.g - b.g);
    show(rows.length ? 'list' : 'empty');
    list.innerHTML = rows.map(({ s, d, g }) => {
      const cat = Model.CATEGORIES[s.categoria] || Model.CATEGORIES.altro;
      return '<article class="card c-' + cat.colore + '"><span class="ico" aria-hidden="true">' + cat.icon + '</span>' +
        '<div class="body"><div class="nome">' + esc(s.nome) + '</div><div class="data">' + esc(d) + '</div></div>' +
        '<div class="giorni">' + etichetta(g) + '</div></article>';
    }).join('');
  }

  function showConnect() {
    const btn = $('btnConnetti');
    show('connectBar');
    if (btn) btn.onclick = async () => {
      try { await GCal.connect(); await render(); }
      catch (e) { status('Connessione non riuscita — riprova', true); }
    };
  }

  function boot() {
    const id = clientId();
    if (!id) {
      show('setup');
      const btn = $('btnSalva');
      if (btn) btn.onclick = () => {
        const inp = $('clientIdInput');
        const v = ((inp && inp.value) || '').trim();
        if (!v) return;
        try { localStorage.setItem(KEY, v); } catch (e) {}
        location.reload();
      };
      return;
    }
    // GIS e' async: init solo quando google.accounts.oauth2 esiste
    status('Caricamento Google…');
    let tries = 0;
    const t = setInterval(() => {
      if (window.google && google.accounts && google.accounts.oauth2) {
        clearInterval(t);
        try { GCal.init(id); status(''); showConnect(); }
        catch (e) { status('Errore di inizializzazione', true); }
      } else if (++tries > 100) { // ~10s
        clearInterval(t);
        status('Impossibile caricare Google — ricarica la pagina', true);
      }
    }, 100);
  }

  window.App = { render, clientId };
  boot();
})();
