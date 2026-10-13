import { fiber } from '../charts/zChart.js'
import { fiberZ } from '../charts/reciprocalChart.js'

/** Audit the same physical state in the two overlapping projective charts.
 * At Z=0 the reciprocal chart remains meaningful; no finite z is invented.
 */
export function characteristicChartAudit(z, tau, p) {
  const finite = fiber(z, tau, p)
  if (!Number.isFinite(z) || z === 0) return { finite, reciprocal: null, overlap: false, stateError: null }
  const Z = 1 / z
  const eta = tau / (Z * Z)
  if (!Number.isFinite(eta)) return { finite, reciprocal: null, overlap: false, stateError: null }
  const reciprocal = fiberZ(Z, eta, p)
  const overlap = finite.kind === 'regular' && reciprocal.kind === 'regular'
  const stateError = overlap ? Math.hypot(finite.Ubar[0] - reciprocal.Ubar[0], finite.Ubar[1] - reciprocal.Ubar[1]) : null
  return { finite, reciprocal, overlap, stateError }
}

/** A vanishing fiber equation 0=0 has a full state-plane fiber.
 * It cannot be replaced by an arbitrary tau-line in either chart.
 */
export function characteristicFiberStatus(z, p) {
  const finite = fiber(z, 0, p)
  if (z === 0 || !Number.isFinite(z)) return { kind: finite.kind, finite: finite.kind, reciprocal: null }
  const reciprocal = fiberZ(1 / z, 0, p)
  return { kind: finite.kind === reciprocal.kind ? finite.kind : 'chart-disagreement', finite: finite.kind, reciprocal: reciprocal.kind }
}

/** Classify the missing projective direction z=infinity using the regular
 * reciprocal chart Z=0. Never infer it by substituting a huge finite z.
 * A degenerate equation 0=0 represents the entire state plane in this fiber;
 * an absent equation represents no states. Neither is a regular tau-line.
 */
export function characteristicInfinityFiber(p) {
  const result = fiberZ(0, 0, p)
  return {
    kind: result.kind,
    chart: 'reciprocal',
    Z: 0,
    coefficients: { P: result.P, Q: result.Q, R: result.R },
    ...(result.kind === 'regular' ? { base: result.base, tangent: result.tangent } : {}),
  }
}

/** Return a truthful description of the state fiber in the appropriate chart.
 * The caller must not render an absent or degenerate fiber as a line.
 */
export function characteristicProjectiveFiber(z, p) {
  if (z === Infinity || z === -Infinity) return characteristicInfinityFiber(p)
  if (!Number.isFinite(z)) return { kind: 'invalid', chart: null }
  const result = fiber(z, 0, p)
  return {
    kind: result.kind,
    chart: 'finite',
    z,
    coefficients: { P: result.P, Q: result.Q, R: result.R },
    ...(result.kind === 'regular' ? { base: result.base, tangent: result.tangent } : {}),
  }
}

/** Geometric state-space realization of a projective characteristic fiber.
 * This is deliberately not a (tau,Y,zc) mesh: a degenerate fiber has
 * two state dimensions, so the regular tau chart cannot represent it.
 * Reuses the projective classification and its coefficients.
 */
export function characteristicFiberGeometry(z, p) {
  const status = characteristicProjectiveFiber(z, p)
  if (status.kind === 'regular') {
    return {
      kind: 'line', chart: status.chart,
      base: status.base, tangent: status.tangent,
      stateDimension: 1,
      projectiveCoordinate: status.chart === 'reciprocal' ? status.Z : status.z,
    }
  }
  if (status.kind === 'degenerate') {
    return { kind: 'plane', chart: status.chart, stateDimension: 2,
      equation: '0 = 0', coefficients: status.coefficients }
  }
  if (status.kind === 'absent') {
    return { kind: 'empty', chart: status.chart, stateDimension: -1,
      equation: '0 = nonzero', coefficients: status.coefficients }
  }
  return { kind: 'invalid', chart: status.chart ?? null, stateDimension: null }
}
