const assert = require('node:assert');
const { test } = require('node:test');
const { detectBins, scanText } = require('../src/lib/clamav.js');

test('detectBins returns an object', async () => {
  const bins = await detectBins();
  assert.strictEqual(typeof bins, 'object');
});

test('scanText returns structured status', async () => {
  const res = await scanText('hi');
  assert.ok(['clean','infected','not_configured','error'].includes(res.status));
});
