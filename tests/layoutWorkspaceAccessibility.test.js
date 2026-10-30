import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

test('link de salto aponta para a região central identificada', () => {
  assert.match(app, /href="#scientific-workspace"/)
  assert.match(app, /<WorkspaceLayout as="main"[^>]*id="scientific-workspace" tabIndex=\{-1\}/)
  assert.match(css, /\.skipToWorkspace:focus-visible\{transform:translateY\(0\)\}/)
})
test('botões de painéis móveis expõem relação e estado para tecnologias assistivas', () => {
  for (const [name,id] of [['controls','three-d-controls'],['inspection','three-d-inspection']]) {
    assert.ok(app.includes(`aria-expanded={mobile3dPanel==='${name}'}`))
    assert.ok(app.includes(`aria-controls="${id}"`))
    assert.ok(app.includes(`<aside id="${id}"`)||app.includes(`<WorkspaceDrawer as="aside" id="${id}"`))
  }
})
test('manual e documentação permanecem em superfícies distintas', () => {
  assert.match(app, /activeWorkspace==='docs'&&<DocumentationWorkspace\/>/)
  assert.match(app, /<UserManualDialog open=\{manualOpen\}/)
})
