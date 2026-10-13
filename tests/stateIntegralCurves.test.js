import test from 'node:test'
import assert from 'node:assert/strict'
import {stateCharacteristicDirection,traceStateRarefaction,riemannRarefactionBranches} from '../src/math/rarefaction/stateIntegralCurves.js'
const p={a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2}
test('real eigenvector branches are distinguished',()=>{
  assert.equal(stateCharacteristicDirection([0,0],p,'slow').lambda,0)
  assert.equal(stateCharacteristicDirection([0,0],p,'fast').lambda,2)
})
test('characteristic integral curve stays in the correct eigendirection',()=>{
  const t=traceStateRarefaction([0,0],p,'slow',1,{maxSteps:15})
  assert.ok(t.points.length>5)
  assert.ok(t.points.every(q=>Math.abs(q[1])<1e-8))
})
test('elliptic and repeated eigenvalues stop before integration',()=>{
  const elliptic={a20:0,a11:0,a02:0,a10:0,a01:-1,b20:0,b11:0,b02:0,b10:1,b01:0}
  assert.equal(traceStateRarefaction([0,0],elliptic,'fast').stop,'non-strict-hyperbolicity')
  assert.equal(traceStateRarefaction([1,0],{...p,b01:2},'fast').stop,'non-strict-hyperbolicity')
})
test('left and right seeds remain independent and absent seeds produce no branches',()=>{
  assert.equal(riemannRarefactionBranches({left:null,right:null},p).length,0)
  assert.equal(riemannRarefactionBranches({left:[0,0],right:null},p).length,4)
})
