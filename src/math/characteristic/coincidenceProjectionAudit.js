import { stateDiscriminant } from './discriminantRegions.js'

/** Independent, window-local numerical audit of the projected 3D coincidence.
 * Residual checks do not establish that every component of D=0 was lifted.
 */
export function auditCoincidenceProjection(loci, p, window, { tolerance = 1e-6 } = {}) {
  const e = loci.find(item => item.id === 'E')
  const scale = Math.max(1, Math.abs(window.uMax-window.uMin), Math.abs(window.vMax-window.vMin))
  const result = {}
  for (const side of ['minus', 'plus']) {
    const paths = e?.projected?.[side] ?? []
    let samples = 0, inWindow = 0, invalid = 0, offLocus = 0, maximumRelativeResidual = 0
    for (const path of paths) for (const q of path) {
      if (!Number.isFinite(q.u) || !Number.isFinite(q.v)) { invalid++; continue }
      samples++
      if (q.u < window.uMin || q.u > window.uMax || q.v < window.vMin || q.v > window.vMax) continue
      inWindow++
      const d = stateDiscriminant([q.u,q.v],p)
      // A quadratic discriminant scales like the square of the state scale.
      const residual = Math.abs(d) / (scale*scale + Math.abs(d))
      if (!Number.isFinite(residual)) { invalid++; continue }
      maximumRelativeResidual = Math.max(maximumRelativeResidual,residual)
      if (residual > tolerance) offLocus++
    }
    result[side] = { samples, inWindow, invalid, offLocus, maximumRelativeResidual,
      status: inWindow === 0 ? 'no-samples' : invalid || offLocus ? 'mismatch' : 'sample-consistent' }
  }
  return result
}
