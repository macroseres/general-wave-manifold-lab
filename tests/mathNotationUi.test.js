import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
test('inspeção matemática reutiliza MathLabel com expressões LaTeX',()=>{
  assert.match(app,/import \{ MathLabel \} from '\.\/components\/math\/MathLabel\.jsx'/)
  for(const tex of ['P\\in\\mathcal W','\\bar U','U_-','U_+','\\Phi_-(P)','\\Phi_+(P)','\\dot\\tau','\\dot z_{\\mathrm c}','\\mathcal C','\\mathcal E']) assert.ok(app.includes(tex),`faltando ${tex}`)
})
test('rótulos de equações sônicas não usam caracteres Unicode misturados',()=>{
  assert.ok(!app.includes('<b>Φ₋(P):</b>'))
  assert.ok(!app.includes('<b>Φ₊(P):</b>'))
})
