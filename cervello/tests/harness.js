// Harness minimale (browser + Node). Espone test/assert/assertEq/summary come globali.
(function (g) {
  const R = (g.__results = { pass: 0, fail: 0, fails: [] });
  g.test = function (name, fn) {
    try { fn(); R.pass++; console.log('PASS ' + name); }
    catch (e) { R.fail++; R.fails.push(name + ': ' + e.message); console.error('FAIL ' + name + ' - ' + e.message); }
  };
  g.assert = function (cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); };
  g.assertEq = function (a, b, msg) {
    if (a !== b) throw new Error((msg || '') + ' expected ' + JSON.stringify(b) + ' got ' + JSON.stringify(a));
  };
  g.summary = function () {
    const line = 'TESTS: ' + R.pass + ' passed, ' + R.fail + ' failed';
    console.log(line);
    if (typeof document !== 'undefined') document.body.textContent = line + (R.fail ? ' - ' + R.fails.join(' | ') : '');
    return line;
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
