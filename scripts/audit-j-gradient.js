/** Offline, on-demand audit of K=0 near extracted sonic intersections. */
import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicData } from '../src/math/sonic/sonic.js'
import { sonicSurfaceTriangles, inflectionGeometry, doubleSonicGeometry } from '../src/geometry/sonic/surface.js'
import { intersectSonicTriangleMeshes } from '../src/geometry/sonic/triangleIntersection.js'
import { pointSegmentDistance } from '../src/geometry/sonic/commonIntersectionAudit.js'

const p = defaultCoefficients
const domain = { tauMin: -5, tauMax: 5, YMin: -6, YMax: 6 }
const resolution = { nTau: 24, nY: 16, nZ: 28 }
const zFromHat = h => Math.tan(Math.PI * h / 2)
const K = (t, h) => { const d = sonicData(t, zFromHat(h), p); return d.kind === 'regular' ? d.K : NaN }
const nearest = (q, segments) => segments.reduce((d, s) => Math.min(d, pointSegmentDistance(q, s)), Infinity)
const jSegments = inflectionGeometry(p, { tauMin: -5, tauMax: 5, nTau: 320, nZ: 480 }).flatMap(curve => curve.slice(1).map((q, i) => [[curve[i].tau, 0, curve[i].zc], [q.tau, 0, q.zc]]))
const dsSegments = doubleSonicGeometry(p, domain).map(q => [[q.tau, -6, q.zc], [q.tau, 6, q.zc]])
function gradient(t, h) {
  const ht = 1e-5 * Math.max(1, Math.abs(t))
  const hh = Math.min(1e-5, (1 - Math.abs(h)) / 4)
  if (!(hh > 1e-10)) return null
  const a = (K(t + ht, h) - K(t - ht, h)) / (2 * ht)
  const b = (K(t, h + hh) - K(t, h - hh)) / (2 * hh)
  return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null
}
function project(t, h) {
  const initial = [t, h]
  let steps = 0
  for (; steps < 40; steps++) {
    const value = K(t, h), g = gradient(t, h)
    if (!Number.isFinite(value) || !g) break
    const norm2 = g[0] ** 2 + g[1] ** 2
    if (!(norm2 > 1e-25)) break
    if (Math.abs(value) / Math.sqrt(norm2) < 1e-10) break
    const dt = value * g[0] / norm2, dh = value * g[1] / norm2
    let accepted = false
    for (let alpha = 1; alpha >= 1 / 4096; alpha /= 2) {
      const nt = t - alpha * dt, nh = h - alpha * dh
      if (Math.abs(nh) >= 0.999999 || nt < domain.tauMin || nt > domain.tauMax) continue
      const nv = K(nt, nh)
      if (Number.isFinite(nv) && Math.abs(nv) < Math.abs(value)) { t = nt; h = nh; accepted = true; break }
    }
    if (!accepted) break
  }
  const residual = Math.abs(K(t, h))
  const g = gradient(t, h)
  const normalized = g ? residual / Math.hypot(...g) : null
  return { distance: Math.hypot(t - initial[0], h - initial[1]), residual, normalizedResidual: normalized, iterations: steps, converged: normalized !== null && normalized < 1e-8, projected: [t, 0, h] }
}
const meshes = ['minus', 'plus'].map(side => sonicSurfaceTriangles(p, { ...domain, ...resolution, side }))
const segments = intersectSonicTriangleMeshes(...meshes).segments
const candidates = segments.map((segment, index) => {
  const midpoint = segment[0].map((v, i) => (v + segment[1][i]) / 2)
  return { index, segment, midpoint, dJ: nearest(midpoint, jSegments), dDS: nearest(midpoint, dsSegments) }
}).filter(r => r.dJ <= r.dDS).sort((a, b) => b.dJ - a.dJ).filter((r, i) => i < 12 || [45, 68, 137].includes(r.index))
const records = candidates.map(r => {
  const samples = [r.segment[0], r.midpoint, r.segment[1]]
  return { index: r.index, midpoint: r.midpoint, samples: samples.map(q => {
    const value = K(q[0], q[2]), g = gradient(q[0], q[2]), norm = g ? Math.hypot(...g) : null
    return { absK: Math.abs(value), gradientNorm: norm, normalizedResidual: norm > 0 ? Math.abs(value) / norm : null, projection: project(q[0], q[2]) }
  }) }
})
console.log(JSON.stringify({ mode: 'manual-j-gradient-audit', resolution, records, note: 'Finite-difference gradient in (tau,zc); projection is local Newton descent, not a certified global nearest-point distance. No renderer changes.' }, null, 2))
