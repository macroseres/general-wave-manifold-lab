import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedCharacteristicChordError} from '../src/math/solution/riemannMixedTransversality.js'
const p={a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:1,b10:0,b01:0}
// DF(1,2) = diag(2,4), slow eigenline horizontal, fast vertical.
test('aligned sampled chord has zero angular error',()=>{
  const result=mixedCharacteristicChordError([1,2],[2,0],'slow',p)
  assert.equal(result.status,'aligned-numerical')
  assert.ok(result.angleDegrees<1e-7)
})
test('orthogonal chord has 90 degree discrepancy',()=>{
  const result=mixedCharacteristicChordError([1,2],[0,1],'slow',p)
  assert.equal(result.status,'angular-discrepancy')
  assert.ok(Math.abs(result.angleDegrees-90)<1e-8)
})
test('reversing chord does not change unoriented angle',()=>{
  const a=mixedCharacteristicChordError([1,2],[1,1],'slow',p)
  const b=mixedCharacteristicChordError([1,2],[-1,-1],'slow',p)
  assert.ok(Math.abs(a.angleDegrees-b.angleDegrees)<1e-9)
})
test('degenerate chord and repeated eigenvalues are unavailable',()=>{
  assert.equal(mixedCharacteristicChordError([1,2],[0,0],'slow',p).status,'degenerate-chord')
  assert.equal(mixedCharacteristicChordError([0,0],[1,0],'slow',p).status,'characteristic-unavailable')
})
