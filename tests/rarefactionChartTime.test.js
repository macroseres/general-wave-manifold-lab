import test from 'node:test'
import assert from 'node:assert/strict'
import { oldWavePreset } from '../src/math/flux/quadraticFlux.js'
import { rarefactionField, rarefactionFieldZ } from '../src/math/rarefaction/field.js'

const presets = [oldWavePreset(), { ...oldWavePreset(), a20: 1.9, b20: 0.3, a11: 0.2 },
  { a20: -0.7, a11: 0.6, a02: 1.2, a10: -0.4, a01: 0.3, b20: 0.8, b11: -0.5, b02: 0.2, b10: 1.1, b01: -0.6 }]

function close(a, b) {
  assert.ok(Number.isFinite(a) && Number.isFinite(b))
  assert.ok(Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(a), Math.abs(b)), `${a} != ${b}`)
}

for (const [index, p] of presets.entries()) {
  test(`reciprocal chart time factor: D(Psi) Vz = -z VZ, preset ${index}`, () => {
    let checked = 0
    for (const z of [-3, -1.7, -0.4, 0.35, 1.2, 2.8]) {
      for (const tau of [-0.7, 0, 0.4, 1.1]) {
        const a = rarefactionField(tau, z, p)
        const b = rarefactionFieldZ(tau * z * z, 1 / z, p)
        if (a.kind !== 'regular' || b.kind !== 'regular') continue
        const pushedEta = z * z * a.tauDot + 2 * tau * z * a.zDot
        const pushedZ = -a.zDot / (z * z)
        close(pushedEta, -z * b.etaDot)
        close(pushedZ, -z * b.ZDot)
        checked++
      }
    }
    assert.ok(checked >= 15, `only ${checked} regular overlap points`)
  })
}
