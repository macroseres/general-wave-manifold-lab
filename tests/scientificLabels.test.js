import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
test('main controls use canonical KaTeX notation for sonic and composite surfaces',()=>{
  for(const name of [String.raw`\mathcal S^-`,String.raw`\mathcal S^+`,String.raw`\mathcal K_-`,String.raw`\mathcal K_+`]){
    assert.ok(app.includes('<MathLabel>{String.raw`'+name+'`}</MathLabel>'),name)
  }
})
test('flux coefficient labels use MathLabel',()=>{
  assert.match(app,/<MathLabel>\{k\.replace/)
})
