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
    const oggi = new Date().toISOString().slice(0, 10);
    const anno = oggi.slice(0, 4);
    let scadenze;
    try {
      scadenze = await GCal.list(anno + '-01-01T00:00:00Z');
    } catch (e) {
      list.innerHTML = ''; empty.hidden = true;
      status(e && e.message === 'TOKEN_SCADUTO' ? 'Sessione scaduta — riconnetti' : 'Errore di lettura — riconnetti', true);
      return;
    }
    status('Connesso');
    const rows = scadenze.map((s) => {
      const d = s.ricorrente ? Model.prossimaOccorrenza(s.dateISO, oggi) : s.dateISO;
      return { s, d, g: Model.giorniMancanti(d, oggi) };
    }).sort((a, b) => a.g - b.g);
    empty.hidden = rows.length > 0;
    list.innerHTML = rows.map(({ s, d, g }) => {
      const cat = Model.CATEGORIES[s.categoria] || Model.CATEGORIES.altro;
      return '<article class="card c-' + cat.colore + '"><span class="ico" aria-hidden="true">' + cat.icon + '</span>' +
        '<div class="body"><div class="nome">' + esc(s.nome) + '</div><div class="data">' + esc(d) + '</div></div>' +
        '<div class="giorni">' + etichetta(g) + '</div></article>';
    }).join('');
  }

  function showConnect() {
    const bar = $('connectBar'), btn = $('btnConnetti');
    if (bar) bar.hidden = false;
    if (btn) btn.onclick = async () => {
      try { await GCal.connect(); await render(); }
      catch (e) { status('Connessione non riuscita — riprova', true); }
    };
  }

  function boot() {
    const id = clientId();
    if (!id) {
      const setup = $('setup');
      if (setup) setup.hidden = false;
      const btn = $('btnSalva');
      if (btn) btn.onclick = () => {
        const v = ($('clientIdInput').value || '').trim();
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
