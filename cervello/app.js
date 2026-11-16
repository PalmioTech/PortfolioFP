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

  // una sola region visibile: setup | connectBar | list | empty (timeline e tabs li gestisce paintView)
  function show(which) {
    ['setup', 'connectBar', 'list', 'empty', 'timeline'].forEach((id) => { const el = $(id); if (el) el.hidden = id !== which; });
    const tb = $('toolbar'); if (tb) tb.hidden = true;
  }

  function openModal() {
    const m = $('modal'); if (!m) return;
    m.hidden = false; document.body.classList.add('modal-open');
    const nome = $('fNome'); if (nome) nome.focus();
  }
  function closeModal() {
    const m = $('modal'); if (m) m.hidden = true;
    document.body.classList.remove('modal-open');
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

  let lastRows = [];
  let view = 'lista';

  async function render() {
    const list = $('list'), empty = $('empty');
    if (!list || !empty) return;
    const n = new Date();
    const oggi = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
    let scadenze;
    try {
      scadenze = await GCal.list('1970-01-01T00:00:00Z');
    } catch (e) {
      console.error(e);
      list.innerHTML = ''; show('connectBar');
      status(e && e.message === 'TOKEN_SCADUTO' ? 'Sessione scaduta — riconnetti' : 'Errore di lettura — riconnetti', true);
      return;
    }
    status('Connesso');
    lastRows = scadenze.map((s) => {
      const d = s.ricorrente ? Model.prossimaOccorrenza(s.dateISO, oggi) : s.dateISO;
      return { s, d, g: Model.giorniMancanti(d, oggi) };
    }).sort((a, b) => a.g - b.g);
    if (!lastRows.length) { show('empty'); const tb = $('toolbar'); if (tb) tb.hidden = false; $('viewTabs').hidden = true; return; }
    show('list');
    paintView();
  }

  // commuta lista/timeline sui dati già caricati (lastRows), preservando la vista scelta
  function paintView() {
    $('toolbar').hidden = false;
    $('viewTabs').hidden = false;
    $('tabLista').classList.toggle('is-on', view === 'lista');
    $('tabTimeline').classList.toggle('is-on', view === 'timeline');
    if (view === 'timeline') { $('list').hidden = true; $('timeline').hidden = false; renderTimeline(lastRows); }
    else { $('timeline').hidden = true; $('list').hidden = false; renderList(lastRows); }
  }

  function wireEdit(el, s) {
    el.onclick = () => { edit(s); openModal(); };
    el.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); edit(s); openModal(); } };
  }

  function renderList(rows) {
    const list = $('list');
    list.innerHTML = rows.map(({ s, d, g }) => {
      const cat = Model.CATEGORIES[s.categoria] || Model.CATEGORIES.altro;
      return '<article role="button" tabindex="0" class="card c-' + cat.colore + '"><span class="ico" aria-hidden="true">' + cat.icon + '</span>' +
        '<div class="body"><div class="nome">' + esc(s.nome) + '</div><div class="data">' + esc(s.ora ? d + ' · ' + s.ora : d) + '</div></div>' +
        '<div class="giorni">' + etichetta(g) + '</div></article>';
    }).join('');
    list.querySelectorAll('.card').forEach((el, i) => wireEdit(el, rows[i].s));
  }

  // timeline verticale: ordine per urgenza, salti >45gg segnati come "+ N mesi"
  function renderTimeline(rows) {
    const tl = $('timeline'); if (!tl) return;
    let h = '<div class="tl">';
    rows.forEach(({ s, d, g }, i) => {
      if (i > 0) {
        const diff = g - rows[i - 1].g;
        if (diff > 45) { const m = Math.round(diff / 30); h += '<div class="tl-gap"><span>+ ' + m + ' ' + (m === 1 ? 'mese' : 'mesi') + '</span></div>'; }
      }
      const cat = Model.CATEGORIES[s.categoria] || Model.CATEGORIES.altro;
      h += '<div class="tl-item c-' + cat.colore + '" role="button" tabindex="0"><span class="tl-dot" aria-hidden="true"></span>' +
        '<div class="tl-main"><div class="tl-nome">' + esc(s.nome) + '</div><div class="tl-meta">' + esc(s.ora ? d + ' · ' + s.ora : d) + '</div></div>' +
        '<div class="tl-giorni">' + etichetta(g) + '</div></div>';
    });
    h += '</div>';
    tl.innerHTML = h;
    tl.querySelectorAll('.tl-item').forEach((el, i) => wireEdit(el, rows[i].s));
  }

  // ---- form CRUD ----
  let editId = null;
  const C = Model.CATEGORIES;

  function fMsg(m) { const el = $('fMsg'); if (el) el.textContent = m || ''; }

  function resetForm() {
    editId = null;
    $('fCategoria').value = 'altro';
    $('fNome').value = ''; $('fData').value = '';
    $('fOra').value = ''; $('fAvvisa').value = '';
    prefill(); fMsg('');
    $('fNuova').hidden = true; $('fElimina').hidden = true; $('fTitolo').textContent = 'Nuova scadenza';
  }

  function prefill() {
    const c = C[$('fCategoria').value] || C.altro;
    $('fGiorniPrima').value = c.giorniPrima;
    $('fRicorrente').checked = !!c.ricorrente;
    toggleAvvisa();
  }

  function toggleAvvisa() { $('avvisaRow').hidden = $('fRicorrente').checked; }

  function onCategoria() {
    prefill();
    const c = C[$('fCategoria').value];
    if (c && c.meseDefault && !$('fData').value) {
      const n = new Date(), y = n.getFullYear();
      const oggi = y + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
      let d = y + '-' + String(c.meseDefault).padStart(2, '0') + '-' + String(c.giornoDefault).padStart(2, '0');
      if (d < oggi) d = (y + 1) + d.slice(4);
      $('fData').value = d;
    }
  }

  function edit(s) {
    editId = s.id;
    $('fCategoria').value = C[s.categoria] ? s.categoria : 'altro';
    $('fNome').value = s.nome; $('fData').value = s.dateISO;
    prefill();
    if (s.giorniPrima != null) $('fGiorniPrima').value = s.giorniPrima;
    $('fRicorrente').checked = !!s.ricorrente;
    $('fOra').value = s.ora || ''; $('fAvvisa').value = s.avvisa || '';
    toggleAvvisa();
    $('fNuova').hidden = false; $('fElimina').hidden = false; $('fTitolo').textContent = 'Modifica scadenza'; fMsg('');
  }

  let inflight = false;
  async function write(fn) {
    if (inflight) return;
    inflight = true;
    $('fSalva').disabled = $('fElimina').disabled = true;
    try { await fn(); closeModal(); resetForm(); await render(); }
    catch (e) {
      console.error(e);
      if (e && e.message === 'TOKEN_SCADUTO') { show('connectBar'); status('Sessione scaduta — riconnetti', true); }
      else fMsg('Operazione non riuscita — riprova.');
    } finally { inflight = false; $('fSalva').disabled = $('fElimina').disabled = false; }
  }

  function initForm() {
    const sel = $('fCategoria'), form = $('form');
    if (!sel || !form) return;
    sel.innerHTML = Object.keys(C).map((k) => '<option value="' + k + '">' + C[k].icon + ' ' + esc(C[k].label) + '</option>').join('');
    sel.onchange = onCategoria;
    form.onsubmit = (ev) => {
      ev.preventDefault();
      const nome = $('fNome').value.trim(), dateISO = $('fData').value;
      if (!nome || !dateISO) { fMsg('Inserisci nome e data.'); return; }
      const oraISO = $('fOra').value, avvisaISO = $('fAvvisa').value, ric = $('fRicorrente').checked;
      if (avvisaISO && !ric && !(Model.minutiPrima(dateISO, oraISO, avvisaISO) > 0)) { fMsg("L'avviso deve essere prima dell'appuntamento."); return; }
      fMsg('');
      const e = Model.buildEvent({
        categoria: sel.value, nome, dateISO,
        giorniPrima: Math.max(0, Number($('fGiorniPrima').value) || 0),
        ricorrente: ric, oraISO, avvisaISO
      });
      write(() => editId ? GCal.patch(editId, e) : GCal.insert(e));
    };
    $('fRicorrente').onchange = toggleAvvisa;
    $('fNuova').onclick = resetForm;
    $('fElimina').onclick = () => {
      if (editId && confirm('Eliminare questa scadenza?')) write(() => GCal.remove(editId));
    };
    const tabL = $('tabLista'), tabT = $('tabTimeline');
    if (tabL) tabL.onclick = () => { view = 'lista'; paintView(); };
    if (tabT) tabT.onclick = () => { view = 'timeline'; paintView(); };
    const add = $('btnAdd'); if (add) add.onclick = () => { resetForm(); openModal(); };
    const close = $('fClose'); if (close) close.onclick = closeModal;
    const back = $('modalBack'); if (back) back.onclick = closeModal;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const m = $('modal'); if (m && !m.hidden) closeModal(); } });
    resetForm();
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
    status('Caricamento…');
    // Token valido salvato (entro ~1h) → avvio immediato, nessun popup, non serve nemmeno attendere GIS.
    const cached = GCal.hasToken();
    if (cached) { status(''); render(); }
    // GIS e' async: init solo quando google.accounts.oauth2 esiste (serve per rinnovo silenzioso su 401 / primo Connetti)
    let tries = 0;
    const t = setInterval(() => {
      if (window.google && google.accounts && google.accounts.oauth2) {
        clearInterval(t);
        try {
          GCal.init(id);
          if (!cached) {
            Promise.race([GCal.connect({ prompt: '' }), new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 8000))]).then(() => { status(''); return render(); }).catch(() => { status(''); showConnect(); });
          }
        }
        catch (e) { if (!cached) status('Errore di inizializzazione', true); }
      } else if (++tries > 100) { // ~10s
        clearInterval(t);
        if (!cached) status('Impossibile caricare Google — ricarica la pagina', true);
      }
    }, 100);
  }

  window.App = { render, clientId };
  initForm();
  boot();
})();
