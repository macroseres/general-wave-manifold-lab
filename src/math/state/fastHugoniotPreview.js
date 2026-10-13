import { flux } from '../flux/quadraticFlux.js'

/** Lightweight Rankine–Hugoniot zero-contour preview.
 * Uses marching squares with an asymptotic decider in ambiguous cells.
 * The zero at V=U is a genuine double point: do not join branches across it.
 */
export function fastHugoniotPreviewPath(U, p, view, { width = 1040, height = 680, padding = 64, nx = 104, ny = 76 } = {}) {
  if (!U || !p || !view) return ''
  const { uMin, uMax, vMin, vMax } = view
  if (![...U, uMin, uMax, vMin, vMax].every(Number.isFinite) || uMax <= uMin || vMax <= vMin) return ''
  const [f0, f1] = flux(U, p)
  const evaluate = (u, v) => {
    const [a, b] = flux([u, v], p)
    return (a - f0) * (v - U[1]) - (b - f1) * (u - U[0])
  }
  const stride = nx + 1
  const grid = new Float64Array(stride * (ny + 1))
  const index = (i, j) => j * stride + i
  for (let j = 0; j <= ny; j++) {
    const v = vMin + (vMax - vMin) * j / ny
    for (let i = 0; i <= nx; i++) grid[index(i, j)] = evaluate(uMin + (uMax - uMin) * i / nx, v)
  }
  const px = i => padding + (width - 2 * padding) * i / nx
  const py = j => height - padding - (height - 2 * padding) * j / ny
  const segments = []
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const vals = [grid[index(i, j)], grid[index(i + 1, j)], grid[index(i + 1, j + 1)], grid[index(i, j + 1)]]
    if (!vals.every(Number.isFinite)) continue
    const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]
    const edges = []
    for (let k = 0; k < 4; k++) {
      const next = (k + 1) % 4
      const a = vals[k], b = vals[next]
      if (!((a < 0 && b >= 0) || (b < 0 && a >= 0))) continue
      let lo = 0, hi = 1
      const [x0, y0] = corners[k], [x1, y1] = corners[next]
      // Bisection removes linear-interpolation kinks on strongly curved cells.
      for (let iteration = 0; iteration < 7; iteration++) {
        const mid = (lo + hi) / 2
        const u = uMin + (uMax - uMin) * (x0 + (x1 - x0) * mid) / nx
        const v = vMin + (vMax - vMin) * (y0 + (y1 - y0) * mid) / ny
        if ((evaluate(u, v) < 0) === (a < 0)) lo = mid
        else hi = mid
      }
      const t = (lo + hi) / 2
      edges.push({ edge: k, x: px(x0 + (x1 - x0) * t), y: py(y0 + (y1 - y0) * t) })
    }
    if (edges.length === 2) segments.push([edges[0], edges[1]])
    else if (edges.length === 4) {
      // Asymptotic decider: unlike consecutive pairing, this respects
      // the topology of the bilinear zero set within a saddle cell.
      const determinant = vals[0] * vals[2] - vals[1] * vals[3]
      const byEdge = Object.fromEntries(edges.map(e => [e.edge, e]))
      const pairs = determinant * (vals[0] < 0 ? -1 : 1) > 0
        ? [[0, 3], [1, 2]] : [[0, 1], [2, 3]]
      for (const [a, b] of pairs) segments.push([byEdge[a], byEdge[b]])
    }
  }
  return segments.map(([a, b]) => `M${a.x.toFixed(2)} ${a.y.toFixed(2)}L${b.x.toFixed(2)} ${b.y.toFixed(2)}`).join(' ')
}
