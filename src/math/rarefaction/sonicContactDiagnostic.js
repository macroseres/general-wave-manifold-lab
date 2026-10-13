import { jacobian } from '../flux/quadraticFlux.js'
import { stateCharacteristicDirection } from './stateIntegralCurves.js'
import { genuineNonlinearityAt } from './genuineNonlinearity.js'

/**
 * Infinitesimal shock/rarefaction contact at the coincidence locus.
 * For a simple eigenvalue and a unit right eigenvector r, a Hugoniot branch
 * U(h)=U+h*r+O(h²) has s'(0)=1/2 ∇λ_i(U)·r.
 * The coefficient is evaluated analytically from the constant Hessian of the
 * quadratic flux and a normalized left eigenvector. This is a local necessary
 * diagnostic, NOT a solution of the nonlinear sonic-contact equations S±.
 */
export function infinitesimalSonicContact(U, p, family, { tolerance = 1e-7 } = {}) {
  const eigen = stateCharacteristicDirection(U, p, family)
  if (!eigen) return { status: 'undefined-characteristic' }
  const A = jacobian(U, p)
  const lambda = eigen.lambda
  const r = eigen.direction
  // Left eigenvector of A: a row annihilating (A - lambda I).
  const candidates = [[A[1][0], lambda - A[0][0]], [lambda - A[1][1], A[0][1]]]
  const left = candidates.reduce((a, b) => Math.hypot(...a) >= Math.hypot(...b) ? a : b)
  const dot = left[0] * r[0] + left[1] * r[1]
  if (!Number.isFinite(dot) || Math.abs(dot) < 1e-11 * (1 + Math.hypot(...left)))
    return { status: 'ill-conditioned-left-eigenvector' }
  const [u, v] = r
  const H = [2 * (p.a20 * u * u + p.a11 * u * v + p.a02 * v * v),
    2 * (p.b20 * u * u + p.b11 * u * v + p.b02 * v * v)]
  const derivative = (left[0] * H[0] + left[1] * H[1]) / dot
  const scale = 1 + Math.hypot(...H)
  const finiteDifference = genuineNonlinearityAt(U, p, family)
  return {
    status: 'evaluated', family, lambda, direction: r,
    genuineNonlinearity: derivative,
    shockSpeedDerivative: derivative / 2,
    candidateContact: Math.abs(derivative) <= tolerance * scale,
    finiteDifference: finiteDifference.status === 'estimated' ? finiteDifference.value : null,
    consistencyResidual: finiteDifference.status === 'estimated' ? Math.abs(derivative - finiteDifference.value) : null,
    // The full sonic surface condition at nonzero jump is not tested here.
    scope: 'infinitesimal-coincidence-only',
  }
}

export function annotateGenuineNonlinearityContact(branch, p) {
  return {
    ...branch,
    events: (branch.events ?? []).map(event => ({
      ...event,
      sonicContact: infinitesimalSonicContact(event.point, p, branch.family),
    })),
  }
}
