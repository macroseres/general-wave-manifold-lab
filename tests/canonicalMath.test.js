import test from 'node:test'
import assert from 'node:assert/strict'
import { oldWavePreset } from '../src/math/flux/quadraticFlux.js'
import { fiber } from '../src/math/charts/zChart.js'
import { fiberZ } from '../src/math/charts/reciprocalChart.js'
import { waveState, rhResidual } from '../src/math/manifold/waveState.js'
import { sonicImplicit, sonicDeterminant } from '../src/math/sonic/sonic.js'
import { rarefactionField, rarefactionDirectionResidual } from '../src/math/rarefaction/field.js'

const presets = [oldWavePreset(), { ...oldWavePreset(), a20: 1.9, b20: 0.3, a11: 0.2 }]
for (const p of presets) {
  test(`canonical chart and sonic identities a20=${p.a20}`, () => {
    for (const z of [-3, -1, -0.4, 0.5, 1.2, 4]) {
      for (const tau of [-0.7, 0.2, 0.9]) {
        const f = fiber(z, tau, p)
        assert.equal(f.kind, 'regular')
        const Z = 1 / z
        const eta = tau / (Z * Z)
        const g = fiberZ(Z, eta, p)
        assert.equal(g.kind, 'regular')
        assert.ok(Math.hypot(f.Ubar[0] - g.Ubar[0], f.Ubar[1] - g.Ubar[1]) < 1e-8)
        for (const Y of [-1.2, 0, 0.6]) {
          const state = waveState(tau, Y, z, p)
          assert.ok(rhResidual(state, p) < 1e-8)
          for (const side of ['minus', 'plus']) {
            const actual = sonicDeterminant(tau, Y, z, p, side)
            const factored = Y * sonicImplicit(tau, Y, z, p, side) / 4
            assert.ok(Math.abs(actual - factored) < 1e-8)
          }
        }
        const d = rarefactionField(tau, z, p)
        assert.equal(d.kind, 'regular')
        assert.ok(rarefactionDirectionResidual(tau, z, p) < 1e-9)
      }
    }
  })
}
