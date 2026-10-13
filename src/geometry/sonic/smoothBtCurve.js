import { betheWendroffData } from '../../math/sonic/betheWendroff.js'
import { sonicImplicit } from '../../math/sonic/sonic.js'
import { zFromZc } from '../../math/charts/zChart.js'

// Stitch triangle intersection segments into polylines without joining separate branches.
export function stitchBtSegments(segments, epsilon = 2e-6) {
  const nodes = new Map(), edges = [], adjacency = new Map()
  const key = p => p.map(x => Math.round(x / epsilon)).join(':')
  const finite = p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite)
  const node = p => {
    const k = key(p)
    if (!nodes.has(k)) nodes.set(k, { point: p, edges: [] })
    return k
  }
  for (const segment of segments) {
    if (!Array.isArray(segment) || segment.length !== 2 || !finite(segment[0]) || !finite(segment[1])) continue
    const a = node(segment[0]), b = node(segment[1])
    if (a === b) continue
    const id = edges.length
    edges.push([a, b])
    nodes.get(a).edges.push(id)
    nodes.get(b).edges.push(id)
  }
  for (const [k, n] of nodes) adjacency.set(k, n.edges)
  const visited = new Set(), paths = []
  function walk(start, firstEdge) {
    const path = [nodes.get(start).point]
    let current = start, edge = firstEdge
    while (edge !== undefined && !visited.has(edge)) {
      visited.add(edge)
      const [a, b] = edges[edge]
      current = current === a ? b : a
      path.push(nodes.get(current).point)
      const choices = adjacency.get(current).filter(e => !visited.has(e))
      edge = adjacency.get(current).length === 2 ? choices[0] : undefined
    }
    if (path.length > 1) paths.push(path)
  }
  for (const [k, incident] of adjacency) if (incident.length !== 2)
    for (const e of incident) if (!visited.has(e)) walk(k, e)
  for (let i = 0; i < edges.length; i++) if (!visited.has(i)) walk(edges[i][0], i)
  return paths
}

function residual(point, p, side) {
  const [tau, displayY, zc] = point
  const Y = side === 'plus' ? -displayY : displayY
  const z = zFromZc(zc)
  const sonic = sonicImplicit(tau, Y, z, p, side)
  const spectral = betheWendroffData(tau, Y, zc, p, side)
  return spectral.kind === 'regular' ? [sonic, spectral.trace] : null
}

// Newton correction in (tau,Y) at fixed zc: each inserted point remains
// on BOTH the sonic surface and the BT trace-zero locus.
export function projectBtPoint(point, p, side) {
  let q = [...point]
  for (let iteration = 0; iteration < 10; iteration++) {
    const f = residual(q, p, side)
    if (!f || !f.every(Number.isFinite)) return null
    if (Math.max(...f.map(Math.abs)) < 1e-8) return q
    const h0 = 1e-5 * Math.max(1, Math.abs(q[0]))
    const h1 = 1e-5 * Math.max(1, Math.abs(q[1]))
    const fx = residual([q[0] + h0, q[1], q[2]], p, side)
    const fy = residual([q[0], q[1] + h1, q[2]], p, side)
    if (!fx || !fy) return null
    const a = (fx[0] - f[0]) / h0, b = (fy[0] - f[0]) / h1
    const c = (fx[1] - f[1]) / h0, d = (fy[1] - f[1]) / h1
    const det = a * d - b * c
    if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null
    const dx = (d * f[0] - b * f[1]) / det
    const dy = (-c * f[0] + a * f[1]) / det
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null
    q = [q[0] - dx, q[1] - dy, q[2]]
  }
  const f = residual(q, p, side)
  return f && Math.max(...f.map(Math.abs)) < 1e-6 ? q : null
}

// Adaptive midpoint correction of the polygonal BT intersection. Unlike visual
// spline smoothing, every added point is projected onto BOTH defining equations.
// The original endpoints and component connectivity are never changed.
export function smoothBtSegments(segments, p, side = 'minus', subdivisions = 3, maxProjections = 320) {
  const paths = stitchBtSegments(segments)
  let budget = Math.max(0, Math.floor(maxProjections))
  const maxDepth = Math.max(0, Math.min(4, Math.floor(subdivisions)))
  const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]))
  // The original triangulation may have small edges near folds and long edges
  // elsewhere. Prioritize refinement by physical length, not by path index.
  const edges = []
  paths.forEach((path, pi) => {
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i], b = path[i + 1]
      const length = distance(a, b)
      if (Number.isFinite(length) && length > 1e-8) edges.push({ pi, i, length })
    }
  })
  edges.sort((a, b) => b.length - a.length)
  const selected = new Map()
  // Avoid consuming the entire budget on the first large edge.
  const eligible = edges.slice(0, Math.min(edges.length, Math.max(0, budget)))
  for (const { pi, i } of eligible) {
    if (!selected.has(pi)) selected.set(pi, new Set())
    selected.get(pi).add(i)
  }
  const refine = (a, b, depth) => {
    if (depth >= maxDepth || budget <= 0) return []
    const midpoint = a.map((v, i) => (v + b[i]) / 2)
    budget--
    const q = projectBtPoint(midpoint, p, side)
    if (!q || !q.every(Number.isFinite)) return []
    // Do not introduce a folded-back edge when projection is ill-conditioned.
    const chord = distance(a, b)
    if (distance(a, q) > chord * 1.5 || distance(q, b) > chord * 1.5) return []
    return [...refine(a, q, depth + 1), q, ...refine(q, b, depth + 1)]
  }
  return paths.map((path, pi) => {
    if (path.length < 2) return path
    const result = [path[0]]
    for (let i = 0; i < path.length - 1; i++) {
      if (selected.get(pi)?.has(i)) result.push(...refine(path[i], path[i + 1], 0))
      result.push(path[i + 1])
    }
    return result
  })
}
