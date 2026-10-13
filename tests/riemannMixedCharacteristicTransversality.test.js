import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedCharacteristicTransversality} from '../src/math/solution/riemannMixedTransversality.js'
import {stateCharacteristicDirection} from '../src/math/rarefaction/stateIntegralCurves.js'

const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:2,b02:0,b10:0,b01:0}

test('uses characteristic eigenvector instead of sampled chord',()=>{
  const U=[1,0],field=stateCharacteristicDirection(U,p,'slow')
  assert.ok(field)
  const result=mixedCharacteristicTransversality([0,0],U,'fast',p)
  assert.equal(result.tangentSource,'characteristic-field')
  assert.equal(result.status,'transverse-numerical')
  assert.ok(result.angleIndicator>0.99)
})
test('identifies characteristic tangency to incidence locus',()=>{
  const result=mixedCharacteristicTransversality([0,0],[1,0],'slow',p)
  assert.equal(result.status,'near-tangential-numerical')
  assert.ok(result.angleIndicator<1e-6)
})
test('does not classify a nonhyperbolic or undefined family',()=>{
  assert.equal(mixedCharacteristicTransversality([0,0],[0,0],'slow',p).status,'characteristic-unavailable')
  assert.equal(mixedCharacteristicTransversality([0,0],[1,0],'other',p).status,'characteristic-unavailable')
})
