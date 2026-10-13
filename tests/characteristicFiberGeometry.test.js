import test from 'node:test'
import assert from 'node:assert/strict'
import { characteristicFiberGeometry } from '../src/math/characteristic/chartAudit.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'

const zero = Object.fromEntries(['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01'].map(k => [k,0]))

test('fibra degenerada corresponde ao plano de estados, não a uma linha', () => {
  for (const z of [2,Infinity]) {
    const f = characteristicFiberGeometry(z,zero)
    assert.equal(f.kind,'plane')
    assert.equal(f.stateDimension,2)
    assert.equal('tangent' in f,false)
  }
})

test('fibra ausente corresponde ao conjunto vazio', () => {
  const f = characteristicFiberGeometry(Infinity,{...zero,b10:1})
  assert.equal(f.kind,'empty')
  assert.equal(f.stateDimension,-1)
})

test('fibra regular fornece reta no espaço de estados', () => {
  const f = characteristicFiberGeometry(2,defaultCoefficients)
  assert.equal(f.kind,'line')
  assert.equal(f.stateDimension,1)
  assert.equal(f.base.length,2)
  assert.equal(f.tangent.length,2)
})
