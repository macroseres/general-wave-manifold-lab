import test from 'node:test'
import assert from 'node:assert/strict'
import { characteristicChartAudit, characteristicFiberStatus } from '../src/math/characteristic/chartAudit.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'

for (const z of [-40,-3,-0.5,0.25,2,30]) {
  test(`cartas sobrepostas representam o mesmo estado: z=${z}`, () => {
    const result = characteristicChartAudit(z, 0.3, defaultCoefficients)
    assert.equal(result.overlap, true)
    const scale = 1 + Math.hypot(...result.finite.Ubar)
    assert.ok(result.stateError / scale < 1e-9, `erro relativo: ${result.stateError / scale}`)
  })
}

test('fibra inteiramente degenerada não é inventada como reta', () => {
  const zero = Object.fromEntries(['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01'].map(k => [k,0]))
  assert.equal(characteristicFiberStatus(2,zero).kind,'degenerate')
  assert.equal(characteristicChartAudit(2,1,zero).overlap,false)
})

test('fibra ausente não é inventada como reta', () => {
  const p = { ...defaultCoefficients, a20:0,a11:0,a02:0,b20:0,b11:0,b02:0,a10:0,a01:0,b10:1,b01:0 }
  // At z=1, P=Q=0 while R=1.
  assert.equal(characteristicFiberStatus(1,p).kind,'absent')
})
