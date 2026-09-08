window.__results = { pass: 0, fail: 0, fails: [] };
function test(name, fn) {
  try { fn(); window.__results.pass++; console.log('✅ ' + name); }
  catch (e) { window.__results.fail++; window.__results.fails.push(name + ': ' + e.message); console.error('❌ ' + name + ' — ' + e.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }
function assertEqual(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || '') + ' expected ' + JSON.stringify(expected) + ' got ' + JSON.stringify(actual));
}
function summary() {
  const r = window.__results;
  const line = 'TESTS: ' + r.pass + ' passed, ' + r.fail + ' failed';
  console.log(line);
  document.body.textContent = line + (r.fail ? ' — ' + r.fails.join(' | ') : '');
  return line;
}
