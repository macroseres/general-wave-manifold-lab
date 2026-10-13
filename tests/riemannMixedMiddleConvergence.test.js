import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedMiddleConvergence} from '../src/math/solution/riemannMixedMiddleConvergence.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0}
test('rejects incomplete convergence inputs',()=>{
  assert.equal(mixedMiddleConvergence([0,0],[1,0],[2,0],p,{kind:'invalid',family:'fast',sign:1}).status,'invalid-input')
})
test('reports all requested refinement levels even without a localized intersection',()=>{
  const result=mixedMiddleConvergence([2,0],[10,10],[0,0],p,{kind:'rarefaction-shock',family:'fast',sign:1,levels:3,maxLength:1})
  assert.equal(result.rows.length,3)
  assert.equal(result.status,'inconclusive')
  assert.ok(result.rows.every(r=>r.status==='root-not-localized'))
})
test('retains explicit no-entropy-certification status',()=>{
  const result=mixedMiddleConvergence([2,0],[2.5,0],[0,0],p,{kind:'rarefaction-shock',family:'fast',sign:1,levels:2,maxLength:1})
  assert.equal(result.entropyCertified,false)
})
