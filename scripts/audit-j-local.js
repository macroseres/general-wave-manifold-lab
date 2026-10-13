/** Manual, offline diagnostics for J outliers; never imported by the renderer. */
import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicData } from '../src/math/sonic/sonic.js'
import { sonicSurfaceTriangles, inflectionGeometry, doubleSonicGeometry } from '../src/geometry/sonic/surface.js'
import { intersectSonicTriangleMeshes } from '../src/geometry/sonic/triangleIntersection.js'
import { pointSegmentDistance } from '../src/geometry/sonic/commonIntersectionAudit.js'

const p = defaultCoefficients
const domain = { tauMin: -5, tauMax: 5, YMin: -6, YMax: 6 }
const resolution = { nTau: 24, nY: 16, nZ: 28 }
const zFromHat = h => Math.tan(Math.PI * h / 2)
const K = (tau, h) => { const d = sonicData(tau, zFromHat(h), p); return d.kind === 'regular' ? d.K : NaN }
const nearest = (q, segments) => segments.reduce((d, s) => Math.min(d, pointSegmentDistance(q, s)), Infinity)
const jSegments = n => inflectionGeometry(p, { tauMin: -5, tauMax: 5, nTau: n, nZ: Math.round(n * 1.5) }).flatMap(curve => curve.slice(1).map((q, i) => [[curve[i].tau, 0, curve[i].zc], [q.tau, 0, q.zc]]))
const dsSegments = doubleSonicGeometry(p, domain).map(q => [[q.tau, -6, q.zc], [q.tau, 6, q.zc]])
const meshes = ['minus', 'plus'].map(side => sonicSurfaceTriangles(p, { ...domain, ...resolution, side }))
const intersections = intersectSonicTriangleMeshes(...meshes).segments
const coarse = jSegments(80), fine = jSegments(320)
const records = intersections.map((segment, index) => {
  const mid = segment[0].map((x, i) => (x + segment[1][i]) / 2)
  return { index, segment, mid, dJ: nearest(mid, coarse), dDS: nearest(mid, dsSegments) }
}).filter(r => r.dJ <= r.dDS).sort((a, b) => b.dJ - a.dJ).slice(0, 6)
const out = records.map(r => {
  const samples = [r.segment[0], r.mid, r.segment[1]]
  return { index: r.index, midpoint: r.mid, length: Math.hypot(...r.segment[0].map((v, i) => v - r.segment[1][i])),
    residualsK: samples.map(q => Math.abs(K(q[0], q[2]))),
    distanceToJCoarse: Math.max(...samples.map(q => nearest(q, coarse))),
    distanceToJFine: Math.max(...samples.map(q => nearest(q, fine))),
    midpointDistanceToDS: r.dDS }
})
console.log(JSON.stringify({ mode: 'manual-j-local-audit', resolution, jPolyline: { coarse: 80, fine: 320 }, worst: out, note: 'K residual is evaluated at endpoints and midpoint; fine contour is an independent higher-resolution polygonal reference, not an exact implicit distance.' }, null, 2))
