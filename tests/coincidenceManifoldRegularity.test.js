import test from 'node:test'
import assert from 'node:assert/strict'
import {auditCoincidenceIncidence} from '../src/math/characteristic/coincidenceIncidenceAudit.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'

const window={uMin:-3,uMax:3,vMin:-3,vMax:3}
test('auditoria da coincidência inclui o posto do nível desingularizado',()=>{
  const result=auditCoincidenceIncidence(defaultCoefficients,window,{steps:20})
  assert.ok(result.manifold)
  assert.equal(Object.values(result.manifold).reduce((a,b)=>a+b,0),Object.values(result.counts).reduce((a,b)=>a+b,0))
  assert.ok(result.manifold.regular+result.manifold.singular+result.manifold.uncertain+result.manifold.scalar>0)
})
test('jacobiano escalar não é tratado como uma direção isolada',()=>{
  const zero={a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
  const result=auditCoincidenceIncidence(zero,window,{steps:8})
  assert.ok(result.manifold.scalar>0)
  assert.equal(result.manifold.regular,0)
})
