// Runner headless: node cervello/tests/node.js
global.window = global;
const path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'config.js'));
require(path.join(root, 'model.js'));
require('./harness.js');
require('./suite.js');
summary();
process.exit(window.__results.fail ? 1 : 0);
