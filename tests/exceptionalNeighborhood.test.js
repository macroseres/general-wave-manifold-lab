import test from 'node:test'
import assert from 'node:assert/strict'
import { exceptionalFiberNeighborhood } from '../src/math/characteristic/exceptionalNeighborhood.js'
const zero = Object.fromEntries(['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01'].map(k => [k,0]))

test('identically zero characteristic equation is persistent, not a chosen line', () => {
  for (const z of [0,2,Infinity]) {
    const r = exceptionalFiberNeighborhood(z, zero)
    assert.equal(r.kind,'degenerate')
    assert.equal(r.order,Infinity)
    assert.equal(r.localType,'persistent-exceptional')
  }
})
test('isolated first-order degenerate direction in finite chart', () => {
  const r = exceptionalFiberNeighborhood(0, {...zero, a20:1})
  assert.equal(r.kind,'degenerate')
  assert.equal(r.order,1)
  assert.equal(r.localType,'isolated-exceptional')
  assert.deepEqual(r.leadingCoefficients,[-2,0,0])
})
test('isolated second-order degenerate direction in finite chart', () => {
  const r = exceptionalFiberNeighborhood(0, {...zero, b20:1})
  assert.equal(r.kind,'degenerate')
  assert.equal(r.order,2)
})
test('reciprocal infinity direction detects first-order degeneration', () => {
  const r = exceptionalFiberNeighborhood(Infinity, {...zero, a20:1})
  assert.equal(r.kind,'degenerate')
  assert.equal(r.order,1)
  assert.equal(r.chart,'reciprocal')
})
test('absent fiber is not falsely classified as degenerate', () => {
  const r = exceptionalFiberNeighborhood(Infinity, {...zero,b10:1})
  assert.equal(r.kind,'absent')
  assert.equal(r.order,0)
})
