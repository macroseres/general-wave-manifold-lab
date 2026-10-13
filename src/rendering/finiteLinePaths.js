/** Validate line vertices before they reach three-stdlib LineGeometry.
 * Invalid vertices break a polyline: never bridge a discontinuity.
 */
export function finiteLinePaths(points, { segments = false } = {}) {
  if (!Array.isArray(points)) return []
  const valid = p => Array.isArray(p) && p.length >= 3 && p.slice(0, 3).every(v => typeof v === 'number' && Number.isFinite(v))
  const paths = []
  if (segments) {
    // Drei's segments mode consumes pairs of vertices.
    for (let i = 0; i + 1 < points.length; i += 2) {
      if (valid(points[i]) && valid(points[i + 1])) paths.push([points[i], points[i + 1]])
    }
    return paths
  }
  let current = []
  for (const point of points) {
    if (valid(point)) current.push(point)
    else {
      if (current.length >= 2) paths.push(current)
      current = []
    }
  }
  if (current.length >= 2) paths.push(current)
  return paths
}
