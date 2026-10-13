import { stateCharacteristicDirection, riemannRarefactionBranches } from './stateIntegralCurves.js'

/**
 * Necessary characteristic-speed ordering for a centered rarefaction.
 * From U_L towards a right-going intermediate state, lambda must increase.
 * From U_R backwards towards a left intermediate state, lambda must decrease.
 * This does not certify genuine nonlinearity or a complete Riemann solution.
 */
export function monotoneRarefactionSegment(branch, p, { tolerance = 1e-7 } = {}) {
  const points = branch?.points ?? []
  const accepted = []
  const speeds = []
  const direction = branch?.side === 'left' ? 1 : branch?.side === 'right' ? -1 : 0
  if (!direction || !['slow', 'fast'].includes(branch?.family)) return { ...branch, points: [], speeds: [], status: 'invalid-branch' }
  let status = 'complete-local-trace'
  for (const point of points) {
    const eigen = stateCharacteristicDirection(point, p, branch.family)
    if (!eigen) { status = 'non-strict-hyperbolicity'; break }
    const speed = eigen.lambda
    if (speeds.length && direction * (speed - speeds[speeds.length - 1]) < -tolerance * (1 + Math.abs(speed))) {
      status = 'speed-order-reversal'; break
    }
    accepted.push(point)
    speeds.push(speed)
  }
  if (accepted.length < 2 && points.length >= 2 && status === 'speed-order-reversal') status = 'not-expansive'
  return { ...branch, points: accepted, speeds, status, speedStart: speeds[0] ?? null, speedEnd: speeds.at(-1) ?? null }
}

export function riemannMonotoneRarefactions(states, p, options = {}) {
  return riemannRarefactionBranches(states, p, options).map(branch => monotoneRarefactionSegment(branch, p, options))
}
