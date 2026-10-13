import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { sonicImplicit } from '../src/math/sonic/sonic.js'
import { zFromZc } from '../src/math/charts/zChart.js'

const p = { a20: 1.9, a11: 0, a02: .5, a10: 0, a01: 0, b20: 0, b11: 1, b02: -.1, b10: 1, b01: 0 }
const grids = [{ nTau: 34, nY: 28, nZ: 50 }, { nTau: 48, nY: 40, nZ: 72 }]
const evalPhi = (q, side) => sonicImplicit(q[0], q[1], zFromZc(q[2]), p, side)
const point = (mesh, id) => Array.from(mesh.positions.slice(3 * id, 3 * id + 3))
const midpoint = (a, b) => a.map((v, i) => (v + b[i]) / 2)
const centroid = (a, b, c) => a.map((v, i) => (v + b[i] + c[i]) / 3)
const distance = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]))
function localError(q, side, localScale) {
  const phi = evalPhi(q, side)
  if (!Number.isFinite(phi)) return null
  const derivatives = []
  for (let axis = 0; axis < 3; axis++) {
    const h = Math.min(1e-5 * Math.max(1, Math.abs(q[axis])), axis === 2 ? Math.max(1e-8, (1 - Math.abs(q[2])) / 4) : Infinity)
    const a = [...q], b = [...q]
    a[axis] -= h
    b[axis] += h
    const fa = evalPhi(a, side), fb = evalPhi(b, side)
    if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null
    derivatives.push((fb - fa) / (2 * h))
  }
  const grad = Math.hypot(...derivatives)
  if (!Number.isFinite(grad) || grad <= 1e-20) return null
  const estimate = Math.abs(phi) / grad
  return { absolute: Math.abs(phi), estimate, relativeToEdge: localScale > 0 ? estimate / localScale : null }
}
function summary(values) {
  if (!values.length) return { count: 0 }
  const sorted = values.toSorted((a, b) => a - b)
  const percentile = q => sorted[Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))]
  return { count: sorted.length, median: percentile(.5), p95: percentile(.95), p99: percentile(.99), max: sorted.at(-1) }
}
for (const grid of grids) for (const side of ['minus', 'plus']) {
  const mesh = sonicSurfaceTriangles(p, { tauMin: -5, tauMax: 5, YMin: -6, YMax: 6, zcMin: -.999, zcMax: .999, ...grid, side })
  const vertexResiduals = [], vertexEstimates = [], centerResiduals = [], centerEstimates = [], relativeErrors = []
  let invalidVertices = 0, invalidCenters = 0
  for (let i = 0; i < mesh.vertexCount; i++) {
    const result = localError(point(mesh, i), side, 1)
    if (!result) { invalidVertices++; continue }
    vertexResiduals.push(result.absolute)
    vertexEstimates.push(result.estimate)
  }
  for (let k = 0; k < mesh.indices.length; k += 3) {
    const [a, b, c] = Array.from(mesh.indices.slice(k, k + 3)).map(i => point(mesh, i))
    const edgeScale = Math.max(distance(a, b), distance(b, c), distance(c, a))
    const samples = [centroid(a, b, c), midpoint(a, b), midpoint(b, c), midpoint(c, a)]
    for (const sample of samples) {
      const result = localError(sample, side, edgeScale)
      if (!result) { invalidCenters++; continue }
      centerResiduals.push(result.absolute)
      centerEstimates.push(result.estimate)
      if (result.relativeToEdge !== null) relativeErrors.push(result.relativeToEdge)
    }
  }
  console.log(JSON.stringify({ grid, side, vertices: mesh.vertexCount, triangles: mesh.triangleCount, invalidVertices, invalidInteriorSamples: invalidCenters, vertexAbsoluteResidual: summary(vertexResiduals), vertexEstimatedDistance: summary(vertexEstimates), interiorAbsoluteResidual: summary(centerResiduals), interiorEstimatedDistance: summary(centerEstimates), interiorEstimatedDistanceOverMaxEdge: summary(relativeErrors) }))
}
