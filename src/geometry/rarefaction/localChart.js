/**
 * Geometry adapter for the reciprocal rarefaction chart (eta,Z).
 *
 * The math layer owns the orbits. This module only turns those orbits into
 * bounded drawable polylines; it never changes or integrates the vector field.
 */
export function reciprocalChartGeometry(separatrices, singularity, {
  etaRadius = .55,
  ZRadius = .55,
} = {}) {
  if (!singularity || !Number.isFinite(singularity.eta)) return null
  const etaMin = singularity.eta - Math.abs(etaRadius)
  const etaMax = singularity.eta + Math.abs(etaRadius)
  const ZMin = -Math.abs(ZRadius)
  const ZMax = Math.abs(ZRadius)
  const inside = q => q.eta >= etaMin && q.eta <= etaMax && q.Z >= ZMin && q.Z <= ZMax
  const curves = separatrices.map(curve => ({
    id: curve.id,
    stable: curve.stable,
    branch: curve.branch,
    timeDirection: curve.timeDirection,
    eigenvalue: curve.eigenvalue,
    liesOnInfinityBoundary: curve.liesOnInfinityBoundary,
    points: curve.reciprocalPoints.filter(inside).map(({eta,Z}) => ({eta,Z})),
  })).filter(curve => curve.points.length > 1)
  for (const curve of curves) {
    // reciprocalPoints are stored away from the saddle. Physical-time
    // orientation is opposite on stable branches and identical on unstable ones.
    curve.orientedPoints = curve.timeDirection < 0 ? [...curve.points].reverse() : curve.points
    curve.label = `W${curve.stable ? 's' : 'u'}${curve.branch < 0 ? '−' : '+'}`
  }
  return {etaMin,etaMax,ZMin,ZMax,singularity:{eta:singularity.eta,Z:0},curves}
}

export function reciprocalChartToUnit(point, geometry) {
  return {
    x: (point.eta - geometry.etaMin) / (geometry.etaMax - geometry.etaMin),
    y: (point.Z - geometry.ZMin) / (geometry.ZMax - geometry.ZMin),
  }
}
