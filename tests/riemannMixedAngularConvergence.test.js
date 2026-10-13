import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedAngularConvergence} from '../src/math/solution/riemannMixedAngularConvergence.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0}
test('reports refinement levels for a straight characteristic integral curve',()=>{
  const result=mixedAngularConvergence([2,0],[2.5,0],p,{family:'fast',sign:1,step:0.08,maxLength:1})
  assert.equal(result.rows.length,3)
  assert.ok(result.rows.every(row=>Number.isFinite(row.angleDegrees)))
  assert.ok(result.rows.every(row=>row.angleDegrees<1e-4))
})
test('reports an inconclusive experiment when the reference point is outside the traced branch',()=>{
  const result=mixedAngularConvergence([2,0],[10,10],p,{family:'fast',sign:1,step:0.04,maxLength:1})
  assert.equal(result.status,'inconclusive')
  assert.ok(result.rows.every(row=>row.status==='branch-not-localized'))
})
test('rejects invalid characteristic families and step sizes',()=>{
  assert.equal(mixedAngularConvergence([2,0],[2.5,0],p,{family:'unknown',sign:1}).status,'invalid-input')
  assert.equal(mixedAngularConvergence([2,0],[2.5,0],p,{family:'fast',sign:1,step:0}).status,'invalid-input')
})
