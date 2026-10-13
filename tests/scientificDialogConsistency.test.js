import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const css = read('../src/styles/scientific-ui.css');
test('scientific dialogs share semantic theme tokens', () => {
  for (const token of ['--gwml-bg-panel','--gwml-bg-elevated','--gwml-text-primary','--gwml-border-subtle','--gwml-focus'])
    assert.ok(css.includes(token), token);
  assert.match(css, /\.helpDialog\s*,\s*\.localChartDialog\s*,\s*\.spectralRegionsModal\s*\{/);
  assert.match(css, /\.spectralRegionsScroll\b/);
});
test('spectral-region dialog has accessible title', () => {
  const jsx = read('../src/components/SpectralRegionsDialog.jsx');
  assert.match(jsx, /aria-labelledby="spectral-regions-title"/);
  assert.match(jsx, /id="spectral-regions-title"/);
});
test('empty local chart dialog has accessible title', () => {
  const jsx = read('../src/components/LocalChartDialog.jsx');
  assert.match(jsx, /aria-labelledby="local-chart-empty-title"/);
  assert.match(jsx, /id="local-chart-empty-title"/);
});
