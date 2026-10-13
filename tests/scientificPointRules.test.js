import test from 'node:test'
import assert from 'node:assert/strict'
import {scientificPointStyle,scientificPointShape3D} from '../src/config/scientificMarkerRules.js'

test('mesmo tipo matemático preserva cor e preenchimento nas duas famílias',()=>{
  const l=scientificPointStyle({referenceState:'left',pointType:'sonicContact'})
  const r=scientificPointStyle({referenceState:'right',pointType:'sonicContact'})
  assert.equal(l.shape,'circle');assert.equal(r.shape,'diamond')
  assert.equal(l.color,r.color);assert.equal(l.filled,r.filled)
})
test('evento de rarefação tem forma de origem e cor própria',()=>{
  const r=scientificPointStyle({referenceState:'right',pointType:'rarefactionEvent'})
  assert.equal(r.shape,'diamond');assert.equal(r.color,'#ffd60a');assert.equal(r.filled,true)
})
test('interseção compartilhada usa marcador neutro',()=>{
  assert.equal(scientificPointStyle({pointType:'intersection'}).shape,'circle')
  assert.equal(scientificPointShape3D('right'),'octahedron')
  assert.equal(scientificPointShape3D(null),'sphere')
})
test('não infere origem para estados inválidos',()=>{
  assert.throws(()=>scientificPointStyle({referenceState:'other',pointType:'sonicContact'}))
  assert.throws(()=>scientificPointStyle({pointType:'other'}))
})
