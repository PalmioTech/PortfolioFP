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
    const f = $('form'); if (f) f.hidden = which === 'setup' || which === 'connectBar';
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
    const rows = scadenze.map((s) => {
      const d = s.ricorrente ? Model.prossimaOccorrenza(s.dateISO, oggi) : s.dateISO;
      return { s, d, g: Model.giorniMancanti(d, oggi) };
    }).sort((a, b) => a.g - b.g);
    show(rows.length ? 'list' : 'empty');
    list.innerHTML = rows.map(({ s, d, g }) => {
      const cat = Model.CATEGORIES[s.categoria] || Model.CATEGORIES.altro;
      return '<article role="button" tabindex="0" class="card c-' + cat.colore + '"><span class="ico" aria-hidden="true">' + cat.icon + '</span>' +
        '<div class="body"><div class="nome">' + esc(s.nome) + '</div><div class="data">' + esc(s.ora ? d + ' · ' + s.ora : d) + '</div></div>' +
        '<div class="giorni">' + etichetta(g) + '</div></article>';
    }).join('');
    list.querySelectorAll('.card').forEach((el, i) => { 
      el.onclick = () => edit(rows[i].s);
      el.onkeydown = (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); edit(rows[i].s); } };
    });
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
    $('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  let inflight = false;
  async function write(fn) {
    if (inflight) return;
    inflight = true;
    $('fSalva').disabled = $('fElimina').disabled = true;
    try { await fn(); resetForm(); await render(); }
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
    // GIS e' async: init solo quando google.accounts.oauth2 esiste
    status('Caricamento Google…');
    let tries = 0;
    const t = setInterval(() => {
      if (window.google && google.accounts && google.accounts.oauth2) {
        clearInterval(t);
        try {
          GCal.init(id); status('Caricamento…');
          Promise.race([GCal.connect({ prompt: '' }), new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 4000))]).then(() => { status(''); return render(); }).catch(() => { status(''); showConnect(); });
        }
        catch (e) { status('Errore di inizializzazione', true); }
      } else if (++tries > 100) { // ~10s
        clearInterval(t);
        status('Impossibile caricare Google — ricarica la pagina', true);
      }
    }, 100);
  }

  window.App = { render, clientId };
  initForm();
  boot();
})();
