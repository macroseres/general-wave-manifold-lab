import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedMiddleReconstructionSensitivity} from '../src/math/solution/riemannMixedMiddleSensitivity.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0}

test('rejects missing branch orientation',()=>{
  assert.equal(mixedMiddleReconstructionSensitivity([-2,2],[1,2],[1,3],p,{kind:'rarefaction-shock',family:'slow'}).status,'invalid-input')
})
test('reconstructs a slow rarefaction and a shock intersection after coefficient perturbations',()=>{
  const result=mixedMiddleReconstructionSensitivity([-2,2],[1,2],[1,3],p,{kind:'rarefaction-shock',family:'slow',sign:1,maxLength:4,step:0.04,matchTolerance:0.1})
  assert.ok(['sampled-reconstruction','partial-reconstruction'].includes(result.status),result.status)
  assert.ok(Math.hypot(...result.baseline.point.map((x,i)=>x-[1,2][i]))<0.01)
  assert.equal(result.rows.length,10)
  assert.ok(result.rows.some(r=>r.derivative))
  assert.equal(result.entropyCertified,false)
})
test('does not silently assign zero derivatives when root tracking fails',()=>{
  const result=mixedMiddleReconstructionSensitivity([-2,2],[1,2],[1,3],p,{kind:'rarefaction-shock',family:'slow',sign:1,maxLength:0.5})
  assert.notEqual(result.status,'sampled-reconstruction')
  assert.equal(result.rows.length,0)
})
