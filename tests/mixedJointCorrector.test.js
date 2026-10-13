import test from 'node:test'
import assert from 'node:assert/strict'
import {refineMixedMiddleJoint} from '../src/math/solution/mixedJointCorrector.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:3}
test('joint corrector solves RH at an interior slow rarefaction state',()=>{
  const branch={family:'slow',points:[[0,0],[1,0]]}
  const q=refineMixedMiddleJoint([0,0],[.5,-1],branch,p,'rarefaction-shock',0,{initialFraction:.5})
  assert.equal(q.status,'refined-candidate')
  assert.ok(Math.abs(q.middle[0]-.5)<1e-7)
  assert.ok(q.relativeResidual<1e-8)
  assert.equal(q.entropyCertified,false)
})
test('joint corrector refuses invalid input and zero length',()=>{
  assert.equal(refineMixedMiddleJoint(null,[1,0],{},p,'rarefaction-shock',0).status,'invalid-input')
  assert.equal(refineMixedMiddleJoint([0,0],[1,0],{family:'slow',points:[[0,0],[0,0]]},p,'rarefaction-shock',0).status,'degenerate-segment')
})
test('joint corrector does not extrapolate beyond the sampled segment',()=>{
  const branch={family:'slow',points:[[0,0],[.2,0]]}
  const q=refineMixedMiddleJoint([0,0],[.5,-1],branch,p,'rarefaction-shock',0,{initialFraction:.5})
  assert.notEqual(q.status,'refined-candidate')
})
