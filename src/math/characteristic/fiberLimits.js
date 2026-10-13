import { exceptionalFiberNeighborhood } from './exceptionalNeighborhood.js'

/** Limiting state-space equation of nearby regular projective fibers.
 * For an isolated exceptional direction x0, divide the polynomial equation
 * P(x)u+Q(x)v+R(x)=0 by (x-x0)^k, where k is the common vanishing order.
 * This yields the exact finite-state limit without sampling, eigensolvers,
 * or a second computation of the characteristic coefficients.
 */
export function exceptionalFiberLimit(z, parameters, tolerance = 1e-10) {
  const neighborhood = exceptionalFiberNeighborhood(z, parameters, tolerance)
  if (neighborhood.kind !== 'degenerate') {
    return { ...neighborhood, limitKind: 'not-degenerate', limitEquation: null }
  }
  if (!Number.isFinite(neighborhood.order)) {
    return { ...neighborhood, limitKind: 'persistent', limitEquation: null }
  }
  const [P, Q, R] = neighborhood.leadingCoefficients
  const scale = Math.max(1, ...neighborhood.taylor.flat().map(Math.abs))
  const hasNormal = Math.hypot(P, Q) > tolerance * scale
  return {
    ...neighborhood,
    limitKind: hasNormal ? 'line' : 'no-finite-state-limit',
    limitEquation: hasNormal ? { P, Q, R } : null,
    ...(hasNormal ? {
      base: [-R * P / (P * P + Q * Q), -R * Q / (P * P + Q * Q)],
      tangent: [-Q, P],
    } : {}),
  }
}
