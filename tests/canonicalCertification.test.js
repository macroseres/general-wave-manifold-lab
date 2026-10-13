import test from 'node:test'
import assert from 'node:assert/strict'
import { flux, jacobian, oldWavePreset } from '../src/math/flux/quadraticFlux.js'
import { zChartCoefficients, fiber } from '../src/math/charts/zChart.js'
import { ZChartCoefficients, fiberZ } from '../src/math/charts/reciprocalChart.js'
import { waveState, rhResidual, eigenResidual } from '../src/math/manifold/waveState.js'
import { directionalJacobian, sonicData, sonicImplicit, sonicDeterminant } from '../src/math/sonic/sonic.js'
import { rarefactionField, rarefactionFieldZ } from '../src/math/rarefaction/field.js'

const presets = [oldWavePreset(), { ...oldWavePreset(), a20: 1.9, b20: 0.3, a11: 0.2 },
  { a20: -0.7, a11: 0.6, a02: 1.2, a10: -0.4, a01: 0.3, b20: 0.8, b11: -0.5, b02: 0.2, b10: 1.1, b01: -0.6 }]
const close = (actual, expected, scale = 1) => assert.ok(Math.abs(actual - expected) < 2e-7 * Math.max(scale, Math.abs(actual), Math.abs(expected)), `${actual} != ${expected}`)
const det = (a, b) => a[0] * b[1] - a[1] * b[0]

for (const [presetIndex, p] of presets.entries()) {
  test(`canonical: flux Jacobian and midpoint identity, preset ${presetIndex}`, () => {
    const h = 1e-6
    for (const U of [[0.2, -0.4], [1.1, 0.7], [-0.9, 1.5]]) {
      const J = jacobian(U, p)
      for (let j = 0; j < 2; j++) {
        const plus = [...U], minus = [...U]
        plus[j] += h; minus[j] -= h
        const fp = flux(plus, p), fm = flux(minus, p)
        for (let i = 0; i < 2; i++) close((fp[i] - fm[i]) / (2 * h), J[i][j])
      }
      for (const d of [[0.6, -0.8], [-1.2, 0.4]]) {
        const up = U.map((x, i) => x + d[i] / 2)
        const um = U.map((x, i) => x - d[i] / 2)
        const fup = flux(up, p), fum = flux(um, p)
        for (let i = 0; i < 2; i++) close(fup[i] - fum[i], J[i][0] * d[0] + J[i][1] * d[1])
      }
    }
  })

  test(`canonical: chart constraint, projective overlap and RH, preset ${presetIndex}`, () => {
    for (const z of [-2.3, -0.8, 0.3, 1.7, 3.1]) for (const tau of [-0.5, 0.2, 0.9]) {
      const f = fiber(z, tau, p)
      if (f.kind !== 'regular') continue
      const { P, Q, R } = zChartCoefficients(z, p)
      close(P * f.Ubar[0] + Q * f.Ubar[1] + R, 0)
      close(det(f.tangent, [-Q, P]), 0)
      const Z = 1 / z, eta = tau / (Z * Z)
      const g = fiberZ(Z, eta, p)
      assert.equal(g.kind, 'regular')
      const c = ZChartCoefficients(Z, p)
      close(c.P, Z * Z * P); close(c.Q, Z * Z * Q); close(c.R, Z * Z * R)
      for (let i = 0; i < 2; i++) close(f.Ubar[i], g.Ubar[i])
      for (const Y of [-1.2, 0, 0.6]) {
        const s = waveState(tau, Y, z, p)
        assert.equal(s.kind, 'regular')
        assert.ok(rhResidual(s, p) < 1e-8)
        assert.ok(eigenResidual(s, p) < 1e-8)
        for (let i = 0; i < 2; i++) close(s.Up[i] - s.Um[i], Y * s.r[i])
      }
    }
  })

  test(`canonical: directional Jacobian and both sonic determinant factors, preset ${presetIndex}`, () => {
    const h = 1e-6
    for (const z of [-1.7, -0.4, 0.8, 2.2]) for (const tau of [-0.6, 0.4]) {
      const f = fiber(z, tau, p)
      if (f.kind !== 'regular') continue
      const M = directionalJacobian(z, p)
      const r = [z, 1]
      const up = f.Ubar.map((v, i) => v + h * r[i])
      const um = f.Ubar.map((v, i) => v - h * r[i])
      const jp = jacobian(up, p), jm = jacobian(um, p)
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) close((jp[i][j] - jm[i][j]) / (2 * h), M[i][j])
      const data = sonicData(tau, z, p)
      for (const Y of [-1.1, 0, 0.7]) for (const side of ['minus', 'plus']) {
        close(sonicDeterminant(tau, Y, z, p, side), Y * sonicImplicit(tau, Y, z, p, side) / 4)
        if (Y === 0) close(sonicDeterminant(tau, Y, z, p, side), 0)
        if (side === 'minus') close(sonicImplicit(tau, Y, z, p, side), Y * data.detM - 2 * data.K)
      }
    }
  })

  test(`canonical: finite and reciprocal rarefaction tangent directions, preset ${presetIndex}`, () => {
    for (const z of [-2.2, -0.7, 0.4, 1.8]) for (const tau of [-0.3, 0.6]) {
      const a = rarefactionField(tau, z, p)
      if (a.kind !== 'regular') continue
      const du = [a.T[0] * a.tauDot + a.Uz[0] * a.zDot, a.T[1] * a.tauDot + a.Uz[1] * a.zDot]
      close(det(du, [z, 1]), 0)
      const Z = 1 / z, eta = tau / (Z * Z)
      const b = rarefactionFieldZ(eta, Z, p)
      assert.equal(b.kind, 'regular')
      const dv = [b.T[0] * b.etaDot + b.UZ[0] * b.ZDot, b.T[1] * b.etaDot + b.UZ[1] * b.ZDot]
      close(det(dv, [1, Z]), 0)
      // Tangency is certified separately in each chart; no unproved time factor is asserted.
    }
  })
}
