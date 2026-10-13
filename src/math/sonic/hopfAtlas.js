import { hopfAt } from './hopf.js'
import { reciprocalHopfAt } from './hopfReciprocal.js'
import { fiberZ } from '../charts/reciprocalChart.js'
import { zFromZc } from '../charts/zChart.js'

/**
 * Spectral atlas. For large |z|, reconstruct the characteristic fiber from
 * coefficients homogenized in Z=1/z. This avoids z^2 and z^4 intermediate
 * terms in the ordinary fiber and the subtraction in its eigenvalue formula.
 * The physical state can still diverge when tau is held fixed as Z -> 0.
 */
export function hopfAtlasAt(tau, Y, zc, p, side, { reciprocalThreshold = 0.92 } = {}) {
  if (!Number.isFinite(zc) || Math.abs(zc) >= 1) return { kind: 'outside-chart' }
  if (!Number.isFinite(tau) || !Number.isFinite(Y) || !['minus', 'plus'].includes(side)) return { kind: 'invalid-input' }
  const ordinary = () => ({ ...hopfAt(tau, Y, zc, p, side), chart: 'z' })
  if (Math.abs(zc) < reciprocalThreshold) return ordinary()
  const z = zFromZc(zc)
  if (!Number.isFinite(z) || z === 0) return { kind: 'numerical-limit', chart: 'Z' }
  const Z = 1 / z
  const eta = tau / (Z * Z)
  const X = Y / Z
  if (![eta, X].every(Number.isFinite)) return { kind: 'numerical-limit', chart: 'Z' }
  const f = fiberZ(Z, eta, p)
  if (f.kind !== 'regular') return { kind: f.kind, chart: 'Z' }
  const [u, v] = f.Ubar
  if (![u, v].every(Number.isFinite)) return { kind: 'numerical-limit', chart: 'Z' }
  // The reciprocal evaluator determines its free coordinate from the
  // characteristic constraint, and computes s using the regular vector (1,Z).
  const candidate = reciprocalHopfAt(v, X, Z, p, side)
  const h = candidate.kind === 'regular' && candidate.coordinate === 'v'
    ? candidate : reciprocalHopfAt(u, X, Z, p, side)
  if (h.kind !== 'regular') return { kind: h.kind, chart: 'Z' }
  const residual = Math.hypot(h.Ubar[0] - u, h.Ubar[1] - v)
  const scale = 1 + Math.hypot(u, v)
  if (!Number.isFinite(residual) || residual > 1e-7 * scale) {
    return { kind: 'chart-mismatch', chart: 'Z', chartResidual: residual }
  }
  if (![h.trace, h.det, h.discriminant].every(Number.isFinite)) return { kind: 'numerical-limit', chart: 'Z' }
  return { kind: 'regular', trace: h.trace, det: h.det,
    discriminant: h.discriminant, chart: 'Z', chartResidual: residual }
}
