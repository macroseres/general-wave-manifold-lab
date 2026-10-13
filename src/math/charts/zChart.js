import { NUMERICAL_POLICY } from '../numerics/policy.js'

/**
 * Finite projective chart z for the characteristic direction r=(z,1).
 *
 * This module owns only chart/fiber geometry. Wave states and conservation-law
 * residuals live in the manifold layer.
 */
export function zChartCoefficients(z, p) {
  return {
    P: 2 * p.b20 * z * z + (p.b11 - 2 * p.a20) * z - p.a11,
    Q: p.b11 * z * z + (2 * p.b02 - p.a11) * z - 2 * p.a02,
    R: p.b10 * z * z + (p.b01 - p.a10) * z - p.a01,
  }
}

export function zcFromZ(z) {
  return (2 / Math.PI) * Math.atan(z)
}

export function zFromZc(zc) {
  const q = Math.max(-1 + NUMERICAL_POLICY.charts.zcClampMargin, Math.min(1 - NUMERICAL_POLICY.charts.zcClampMargin, zc))
  return Math.tan((Math.PI / 2) * q)
}

export function fiber(z, tau, p, eps = NUMERICAL_POLICY.charts.finiteFiberTolerance) {
  const { P, Q, R } = zChartCoefficients(z, p)
  const D = P * P + Q * Q
  if (D <= eps * eps) return { kind: Math.abs(R) > eps ? 'absent' : 'degenerate', P, Q, R, D }

  // Canonical section: orthogonal foot of P u + Q v + R = 0.
  // tau multiplies the tangent vector (-Q,P); it is not arc length.
  const base = [-R * P / D, -R * Q / D]
  const tangent = [-Q, P]
  return {
    kind: 'regular', P, Q, R, D, base, tangent,
    Ubar: [base[0] + tau * tangent[0], base[1] + tau * tangent[1]],
  }
}

export function chartCoordinates(z) {
  return { z, Z: Math.abs(z) > NUMERICAL_POLICY.charts.reciprocalZeroTolerance ? 1 / z : null, zc: zcFromZ(z) }
}
