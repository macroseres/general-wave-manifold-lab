import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
test('main controls use canonical KaTeX notation for sonic and composite surfaces',()=>{
  const visibilityRow=readFileSync(new URL('../src/components/SceneVisibilityRow.jsx',import.meta.url),'utf8')
  for(const name of [String.raw`\mathcal S^-`,String.raw`\mathcal S^+`]){
    assert.ok(app.includes('<SceneVisibilityRow tex={String.raw`'+name+'`}'),name)
  }
  assert.match(visibilityRow,/<MathLabel>\{tex\}<\/MathLabel>/)
  assert.match(app,/side:'minus',sign:'-'/)
  assert.match(app,/side:'plus',sign:'\+'/)
  assert.ok(app.includes('const tex=String.raw`\\mathcal K_{${sign}}`'))
  assert.ok(app.includes('Campo composto <MathLabel>{tex}</MathLabel>'))
})
test('flux coefficient labels use MathLabel',()=>{
  const parameters=readFileSync(new URL('../src/components/ParametersWorkspace.jsx',import.meta.url),'utf8')
  assert.match(parameters,/<MathLabel>\{coefficientLatex\(k\)\}/)
})
