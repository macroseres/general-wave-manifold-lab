/** Closest *existing sample* to a pointer, without inventing an interpolated state. */
export function nearestProjectedSample(pointer, curve) {
  if (!Array.isArray(pointer) || !curve?.points?.length || !curve?.screenPoints?.length) return null
  let best = null
  const count = Math.min(curve.points.length, curve.screenPoints.length)
  for (let i = 0; i < count; i++) {
    const pixel = curve.screenPoints[i], state = curve.points[i]
    if (!Array.isArray(pixel) || !pixel.every(Number.isFinite) || !Number.isFinite(state?.u) || !Number.isFinite(state?.v)) continue
    const distance = Math.hypot(pointer[0] - pixel[0], pointer[1] - pixel[1])
    if (!best || distance < best.distance) best = { index:i, state:[state.u,state.v], distance }
  }
  return best
}
/** The variable endpoint depends on the selected canonical projection. */
export function projectedHugoniotEndpoints(side, fixed, variable) {
  if (![fixed,variable].every(v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite))) return null
  if (side==='plus') return {left:[...fixed],right:[...variable]}
  if (side==='minus') return {left:[...variable],right:[...fixed]}
  return null
}
