/**
 * Fibres of the canonical projections pi_- and pi_+ over a fixed state U*.
 *
 * A state U* belongs to state space.  Its inverse image in the wave manifold
 * is generically a curve, not a single wave-manifold point.
 */
import { fiber, zChartCoefficients } from '../charts/zChart.js'
import { fiberZ, ZChartCoefficients } from '../charts/reciprocalChart.js'
import { quadraticRoots } from '../numerics/polynomialRoots.js'
import { NUMERICAL_POLICY } from '../numerics/policy.js'

function sideSign(side) {
  if (side === 'minus') return -1
  if (side === 'plus') return 1
  throw new Error(`unknown projection side: ${side}`)
}

function statePair(U) {
  if (Array.isArray(U) && U.length >= 2) return [Number(U[0]), Number(U[1])]
  return [Number(U?.u), Number(U?.v)]
}

function coefficientValue(c, U) {
  const [u, v] = statePair(U)
  return c.P * u + c.Q * v + c.R
}

/**
 * One point of pi_side^{-1}(U*) in the finite z chart.
 *
 * U_side = Ubar + sign*Y*r/2, r=(z,1), with sign=-1 for pi_-.
 */
export function stateFiberPoint(U, z, p, side = 'minus', eps = NUMERICAL_POLICY.algebra.regularityTolerance) {
  const sign = sideSign(side)
  const c = zChartCoefficients(z, p)
  const L = coefficientValue(c, U)
  const den = c.P * z + c.Q
  if (Math.abs(den) <= eps) return { kind: Math.abs(L) <= eps ? 'singular-parameterization' : 'no-finite-point', side, z, L, denominator: den }

  const Y = 2 * L / (sign * den)
  const [u, v] = statePair(U)
  const Ubar = [u - sign * Y * z / 2, v - sign * Y / 2]
  const f0 = fiber(z, 0, p)
  if (f0.kind !== 'regular') return { ...f0, side, z, Y }
  const tau = ((Ubar[0] - f0.base[0]) * f0.tangent[0] + (Ubar[1] - f0.base[1]) * f0.tangent[1]) / f0.D
  return { kind: 'regular', side, z, tau, Y, Ubar, fixedState: [u, v], L, denominator: den }
}

/**
 * Reciprocal representation of a projection fibre.
 *
 * The full wave-manifold transition requires a reciprocal jump coordinate
 * Upsilon, because r(z)=(z,1)=Z^{-1}(1,Z):
 *   eta=tau/Z^2,  Upsilon=Y/Z.
 */
export function stateFiberPointReciprocal(U, Z, p, side = 'minus', eps = NUMERICAL_POLICY.algebra.regularityTolerance) {
  const sign = sideSign(side)
  const c = ZChartCoefficients(Z, p)
  const L = coefficientValue(c, U)
  const den = c.P + c.Q * Z
  if (Math.abs(den) <= eps) return { kind: Math.abs(L) <= eps ? 'singular-parameterization' : 'no-reciprocal-point', side, Z, L, denominator: den }

  const Upsilon = 2 * L / (sign * den)
  const [u, v] = statePair(U)
  const Ubar = [u - sign * Upsilon / 2, v - sign * Upsilon * Z / 2]
  const f0 = fiberZ(Z, 0, p)
  if (f0.kind !== 'regular') return { ...f0, side, Z, Upsilon }
  const eta = ((Ubar[0] - f0.base[0]) * f0.tangent[0] + (Ubar[1] - f0.base[1]) * f0.tangent[1]) / f0.D
  return { kind: 'regular', side, Z, eta, Upsilon, Ubar, fixedState: [u, v], L, denominator: den }
}

/** Characteristic-direction polynomial L_U(z)=P(z)u+Q(z)v+R(z). */
export function characteristicLiftPolynomial(U, p) {
  const [u, v] = statePair(U)
  return {
    a: 2 * p.b20 * u + p.b11 * v + p.b10,
    b: (p.b11 - 2 * p.a20) * u + (2 * p.b02 - p.a11) * v + (p.b01 - p.a10),
    c: -p.a11 * u - 2 * p.a02 * v - p.a01,
  }
}

/**
 * Projective characteristic lifts of U*.  Finite lifts use z; when the
 * leading homogeneous coefficient vanishes, the missing projective direction
 * is represented canonically by Z=0 rather than by a fake finite z.
 */
export function characteristicLifts(U, p, eps = NUMERICAL_POLICY.algebra.regularityTolerance) {
  const q = characteristicLiftPolynomial(U, p)
  const finite = quadraticRoots(q.a, q.b, q.c, eps).map(z => ({ kind: 'finite', z, Y: 0 }))
  const infinity = Math.abs(q.a) <= eps ? [{ kind: 'infinity', Z: 0, Upsilon: 0 }] : []
  return [...finite, ...infinity]
}
