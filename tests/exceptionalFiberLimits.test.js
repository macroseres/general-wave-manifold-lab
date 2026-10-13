import test from 'node:test'
import assert from 'node:assert/strict'
import { exceptionalFiberLimit } from '../src/math/characteristic/fiberLimits.js'
const zero = Object.fromEntries(['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01'].map(k => [k,0]))

test('first-order isolated degeneracy has limiting line u=0', () => {
  const result = exceptionalFiberLimit(0, {...zero,a20:1})
  assert.equal(result.limitKind, 'line')
  assert.deepEqual(result.limitEquation, {P:-2,Q:0,R:0})
})
test('second-order isolated degeneracy has limiting line u=0', () => {
  const result = exceptionalFiberLimit(0, {...zero,b20:1})
  assert.equal(result.limitKind, 'line')
  assert.deepEqual(result.limitEquation, {P:2,Q:0,R:0})
})
test('reciprocal chart computes infinity limiting line without huge z', () => {
  const result = exceptionalFiberLimit(Infinity, {...zero,a20:1})
  assert.equal(result.chart,'reciprocal')
  assert.equal(result.limitKind,'line')
})
test('identically vanishing characteristic equation has no preferred limiting line', () => {
  assert.equal(exceptionalFiberLimit(0,zero).limitKind,'persistent')
  assert.equal(exceptionalFiberLimit(Infinity,zero).limitKind,'persistent')
})
test('regular fiber is not mistaken for a singular limit', () => {
  assert.equal(exceptionalFiberLimit(1,{...zero,a20:1}).limitKind,'not-degenerate')
})
test('exceptional direction can have no finite-state limit', () => {
  // At z=0: P=Q=0 identically, R=z, so regular fibers are absent.
  // The leading equation 1=0 has no finite-state solution.
  const result = exceptionalFiberLimit(0,{...zero,b01:1,a10:1,b10:1})
  assert.equal(result.limitKind,'no-finite-state-limit')
})
