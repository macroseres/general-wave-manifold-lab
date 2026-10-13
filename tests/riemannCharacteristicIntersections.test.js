import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyRiemannCharacteristicLifts,riemannCharacteristicIntersections} from '../src/math/characteristic/riemannLifts.js'
const p=(a20,a11,a02,b20,b11,b02)=>({a20,a11,a02,a10:0,a01:0,b20,b11,b02,b10:0,b01:0})
test('diagonal Jacobian: two projective directions, one at infinity',()=>{
  const q=classifyRiemannCharacteristicLifts([1,1],p(1,0,0,0,0,2))
  assert.equal(q.kind,'strictly-hyperbolic');assert.equal(q.directions.length,2)
  assert.equal(q.directions.filter(d=>d.chart==='reciprocal').length,1)
  assert(q.directions.every(d=>d.eigenResidual<1e-8))
})
test('elliptic Jacobian has no real characteristic directions',()=>{
  const q=classifyRiemannCharacteristicLifts([1,1],p(0,1,0,-1,0,0))
  assert.equal(q.kind,'elliptic');assert.equal(q.directions.length,0)
})
test('non-scalar repeated eigenvalue has one projective direction',()=>{
  const q=classifyRiemannCharacteristicLifts([1,1],{...p(0,0,0,0,0,0),a01:1})
  assert.equal(q.kind,'repeated-defective');assert.equal(q.directions.length,1)
})
test('scalar Jacobian is not mislabeled as a single tangency',()=>{
  const q=classifyRiemannCharacteristicLifts([1,1],p(1,0,0,0,0,1))
  assert.equal(q.kind,'scalar-degenerate');assert.equal(q.directions.length,0)
})
test('forward uses pi-minus and backward uses pi-plus',()=>{
  const q=riemannCharacteristicIntersections([1,1],[2,2],p(1,0,0,0,0,2))
  assert.equal(q.forward.projection,'minus');assert.equal(q.backward.projection,'plus')
})
test('unplaced Riemann states are not invented',()=>{
  const q=riemannCharacteristicIntersections(null,null,p(1,0,0,0,0,2))
  assert.equal(q.forward.kind,'missing-state');assert.equal(q.backward.kind,'missing-state')
})
