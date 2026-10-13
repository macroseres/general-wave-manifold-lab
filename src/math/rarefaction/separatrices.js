import { zcFromZ } from '../charts/zChart.js'
import { rarefactionFieldZ } from './field.js'
import { infinityRarefactionSingularities } from './singularities.js'
import { adaptiveRK4Step, normalized2 } from '../numerics/integration.js'
import { NUMERICAL_POLICY } from '../numerics/policy.js'

const N = NUMERICAL_POLICY.rarefaction
const DEFAULT_BOUNDARY_TOL = NUMERICAL_POLICY.charts.reciprocalBoundaryTolerance

/**
 * Project a reciprocal-chart point to the finite z chart.
 *
 * Z=0 is the projective boundary itself.  It has no finite-z representative:
 * collapsing it to zc=+/-1 would erase the eta direction and can make a
 * genuine separatrix look missing.  We therefore return null on the boundary.
 */
export function reciprocalPointToFiniteDisplay(x, boundaryTol = DEFAULT_BOUNDARY_TOL) {
  if (!Number.isFinite(x.eta) || !Number.isFinite(x.Z) || Math.abs(x.Z) <= boundaryTol) return null
  const z = 1 / x.Z
  return {
    tau: x.eta * x.Z * x.Z,
    z,
    zc: zcFromZ(z),
    eta: x.eta,
    Z: x.Z,
  }
}

/**
 * Four local half-separatrices of the reciprocal-chart saddle at infinity.
 *
 * `reciprocalPoints` is the canonical representation. `points` is only the
 * part representable in the finite z chart and is kept for renderer
 * compatibility.  A stable branch may lie entirely in Z=0; in that case its
 * finite projection is necessarily empty, not a collapsed fake curve.
 */
export function infinityRarefactionSeparatrices(p, {
  steps = N.separatrixMaxSteps,
  step = N.separatrixStep,
  ZMax = N.separatrixZMax,
  tauMin = -Infinity,
  tauMax = Infinity,
  seed = N.separatrixSeed,
  boundaryTol = DEFAULT_BOUNDARY_TOL,
  onIntegrationDiagnostic = null,
} = {}) {
  const ss = infinityRarefactionSingularities(p)
  if (!ss.length || ss[0].type !== 'sela' || !ss[0].eigenvectors) return []
  const q = ss[0], curves = []

  const vf = x => {
    const d = rarefactionFieldZ(x.eta, x.Z, p)
    if (d.kind !== 'regular') return null
    return normalized2([d.etaDot, d.ZDot], N.separatrixFieldFloor)
  }

  const add = (x, v, h) => ({ eta: x.eta + h * v[0], Z: x.Z + h * v[1] })
  const advance = (x, timeDirection, h) => adaptiveRK4Step(
    x, h,
    y => { const v = vf(y); return v && [timeDirection * v[0], timeDirection * v[1]] }, add,
    {absoluteTolerance:N.adaptiveAbsoluteTolerance,relativeTolerance:N.adaptiveRelativeTolerance,
      minStep:N.adaptiveMinStep,maxStep:step,maxReject:N.adaptiveMaxReject,safety:N.adaptiveSafety,
      norm:y=>Math.hypot(y.eta,y.Z),distance:(a,b)=>Math.hypot(a.eta-b.eta,a.Z-b.Z)},
  )

  for (let eigenIndex = 0; eigenIndex < 2; eigenIndex++) {
    const eigenvalue = q.eigenvalues[eigenIndex]
    const stable = eigenvalue < 0
    // To trace away from the saddle, stable branches use backward time and
    // unstable branches use forward time.
    const timeDirection = stable ? -1 : 1
    const v = q.eigenvectors[eigenIndex]
    const vn = Math.hypot(v[0], v[1]) || 1

    for (const branch of [-1, 1]) {
      let x = {
        eta: q.eta + branch * seed * v[0] / vn,
        Z: branch * seed * v[1] / vn,
      }
      const reciprocalPoints = [{ ...x }]
      let h=step

      for (let k = 0; k < steps; k++) {
        const a = advance(x, timeDirection, h)
        if (typeof onIntegrationDiagnostic === 'function') onIntegrationDiagnostic({source:'infinity-separatrix',eigenIndex,branch,stepIndex:k,...a})
        if (a.kind !== 'accepted') break
        const nx=a.state; h=Math.abs(a.nextStep)
        if (!Number.isFinite(nx.eta) || !Number.isFinite(nx.Z) || Math.abs(nx.Z) > ZMax) break
        const finite = reciprocalPointToFiniteDisplay(nx, boundaryTol)
        if (finite && (finite.tau < tauMin - N.separatrixTauMargin || finite.tau > tauMax + N.separatrixTauMargin)) break
        reciprocalPoints.push({ ...nx })
        x = nx
      }

      const points = reciprocalPoints
        .map(pt => reciprocalPointToFiniteDisplay(pt, boundaryTol))
        .filter(Boolean)
      const maxAbsZ = reciprocalPoints.reduce((m, pt) => Math.max(m, Math.abs(pt.Z)), 0)
      const liesOnInfinityBoundary = maxAbsZ <= boundaryTol

      curves.push({
        id: `${stable ? 'stable' : 'unstable'}:${branch < 0 ? '-' : '+'}`,
        eigenIndex,
        eigenvalue,
        stable,
        branch,
        timeDirection,
        reciprocalPoints,
        points,
        liesOnInfinityBoundary,
        visibleInFiniteChart: points.length > 1,
      })
    }
  }
  return curves
}
