import { stateCharacteristicDirection } from './stateIntegralCurves.js'

/** Directional derivative ∇λ_i(U)·r_i(U), with unit, continuously oriented r_i.
 * Central differences estimate the derivative; no claim of exact zeros is made.
 */
export function genuineNonlinearityAt(U, p, family, { relativeStep = 1e-4 } = {}) {
  const eigen = stateCharacteristicDirection(U, p, family)
  if (!eigen) return { status: 'non-strict-hyperbolicity', value: null }
  const h = relativeStep * (1 + Math.hypot(...U))
  const r = eigen.direction
  const forward = stateCharacteristicDirection(U.map((x, i) => x + h * r[i]), p, family, r)
  const backward = stateCharacteristicDirection(U.map((x, i) => x - h * r[i]), p, family, r)
  if (!forward || !backward) return { status: 'near-hyperbolicity-boundary', value: null }
  return { status: 'estimated', value: (forward.lambda - backward.lambda) / (2 * h), lambda: eigen.lambda, direction: r }
}

/** Find approximate loss-of-genuine-nonlinearity events on sampled integral curves.
 * Sign changes are bracketed; near-zero samples are flagged, not certified.
 */
export function genuineNonlinearityEvents(branch, p, { zeroTolerance = 1e-5 } = {}) {
  const points = branch?.points ?? []
  const values = points.map(U => genuineNonlinearityAt(U, p, branch.family).value)
  const events = []
  for (let i = 0; i < values.length; i++) {
    const a = values[i]
    if (a === null || !Number.isFinite(a)) continue
    if (Math.abs(a) <= zeroTolerance) {
      events.push({ kind: 'near-zero', point: [...points[i]], index: i, value: a })
    } else if (i > 0 && values[i - 1] !== null && Number.isFinite(values[i - 1]) && a * values[i - 1] < 0) {
      const b = values[i - 1], weight = Math.abs(b) / (Math.abs(b) + Math.abs(a))
      events.push({ kind: 'sign-change', point: points[i].map((x, j) => points[i - 1][j] * (1 - weight) + x * weight), index: i, bracket: [i - 1, i] })
    }
  }
  return { ...branch, genuineNonlinearity: values, events }
}
