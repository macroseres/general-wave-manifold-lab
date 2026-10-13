import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedIntersectionTransversality} from '../src/math/solution/riemannMixedTransversality.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:1,b02:0,b10:0,b01:0}
// For fixed origin D(u,v)=u²v/2; at (1,0), grad D=(0,1/2).
test('identifies a transversal sampled tangent',()=>{
  const r=mixedIntersectionTransversality([0,0],[1,0],[0,1],p)
  assert.equal(r.status,'transverse-numerical')
  assert.ok(r.angleIndicator>0.99)
})
test('identifies a tangential sampled tangent',()=>{
  const r=mixedIntersectionTransversality([0,0],[1,0],[1,0],p)
  assert.equal(r.status,'near-tangential-numerical')
  assert.ok(r.angleIndicator<1e-6)
})
test('does not classify off-locus points',()=>{
  assert.equal(mixedIntersectionTransversality([0,0],[1,1],[1,0],p).status,'off-hugoniot')
})
