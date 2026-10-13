import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const css = readFileSync(new URL('../src/styles/scientific-ui.css', import.meta.url), 'utf8')
const math = readFileSync(new URL('../src/components/math/MathLabel.jsx', import.meta.url), 'utf8')
test('blocos matemáticos preservam rolagem horizontal', () => {
  assert.match(css, /(?:\.mathBlock\s*,\s*\.helpEq|\.helpEq\s*,\s*\.mathBlock)\s*\{[^}]*overflow-x:\s*auto/s)
})
test('estado expandido tem indicação visual sem interferir na geometria', () => {
  assert.match(css, /aria-expanded="true"/)
  assert.doesNotMatch(css.slice(css.indexOf('/* Etapa 6 — legibilidade matemática')), /\.chartStable|\.chartUnstable|\.stateRareSlow/)
})
test('rótulos matemáticos usam HTML KaTeX com alternativa acessível', () => {
  assert.match(math, /output:'html'/)
  assert.match(math, /className=\{`mathLabel/)
  assert.match(math, /role="math" aria-label=\{tex\}/)
})
