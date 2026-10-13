import test from 'node:test'
import assert from 'node:assert/strict'
import { characteristicInfinityFiber, characteristicProjectiveFiber } from '../src/math/characteristic/chartAudit.js'
import { fiberZ } from '../src/math/charts/reciprocalChart.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'

const keys=['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
const zero=Object.fromEntries(keys.map(key=>[key,0]))

test('a direção infinita é calculada diretamente na carta recíproca',()=>{
  const status=characteristicInfinityFiber(defaultCoefficients)
  const expected=fiberZ(0,0,defaultCoefficients)
  assert.equal(status.kind,expected.kind)
  assert.deepEqual(status.coefficients,{P:expected.P,Q:expected.Q,R:expected.R})
  assert.equal(characteristicProjectiveFiber(Infinity,defaultCoefficients).chart,'reciprocal')
  assert.equal(characteristicProjectiveFiber(-Infinity,defaultCoefficients).chart,'reciprocal')
})

test('direção infinita degenerada não cria reta arbitrária',()=>{
  const status=characteristicInfinityFiber(zero)
  assert.equal(status.kind,'degenerate')
  assert.equal('tangent' in status,false)
})

test('direção infinita ausente não cria reta arbitrária',()=>{
  const status=characteristicInfinityFiber({...zero,b20:0,b11:0,b10:1})
  assert.equal(status.kind,'absent')
  assert.equal('base' in status,false)
})

test('fibra finita usa a mesma classificação do módulo de cartas',()=>{
  assert.equal(characteristicProjectiveFiber(2,zero).kind,'degenerate')
  assert.equal(characteristicProjectiveFiber(NaN,zero).kind,'invalid')
})
