import { NUMERICAL_POLICY } from '../numerics/policy.js'
import { fiber } from '../charts/zChart.js'
import { jacobian } from '../flux/quadraticFlux.js'

/** Discriminant of the characteristic polynomial of DF(U). */
export function discriminant(U, p) {
  const J = jacobian(U, p)
  const A = J[0][0], B = J[0][1], C = J[1][0], D = J[1][1]
  return (A - D) ** 2 + 4 * B * C
}

/**
 * Spectral data of the point (tau,z) on the characteristic surface C.
 * The projective direction r=(z,1) selects one eigenvalue s.  The second
 * eigenvalue is trace(DF)-s.  Their ordering defines C_s and C_f away from E.
 */
export function characteristicSpectrum(tau, z, p, eps = NUMERICAL_POLICY.spectrum.coincidenceRelativeTolerance) {
  const f = fiber(z, tau, p, eps)
  if (f.kind !== 'regular') return { ...f, branch: 'undefined' }

  const J = jacobian(f.Ubar, p)
  // On the characteristic fiber, r=(z,1) is an eigenvector.
  // Reuse the same exact signed gap for both leaves and coincidence.
  const s = J[1][0] * z + J[1][1]
  const other = J[0][0] - J[1][0] * z
  const gap = s - other
  const scale = 1 + Math.abs(s) + Math.abs(other)
  const branch = Math.abs(gap) <= eps * scale ? 'coincidence' : gap < 0 ? 'slow' : 'fast'

  return { ...f, s, other, gap, branch, discriminant: discriminant(f.Ubar, p) }
}
