/** Manual J outlier localization. Not imported by the 3D application. */
import process from 'node:process'
import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles, doubleSonicGeometry, inflectionGeometry } from '../src/geometry/sonic/surface.js'
import { intersectSonicTriangleMeshes } from '../src/geometry/sonic/triangleIntersection.js'
import { pointSegmentDistance } from '../src/geometry/sonic/commonIntersectionAudit.js'

const args = process.argv.slice(2)
const get = (key, fallback) => { const i = args.indexOf(`--${key}`); return i < 0 ? fallback : Number(args[i + 1]) }
const resolution = { nTau: get('ntau', 24), nY: get('ny', 16), nZ: get('nz', 28) }
if (Object.values(resolution).some(v => !Number.isInteger(v) || v < 2 || v > 80)) throw Error('Invalid resolution')
const domain = { tauMin: -5, tauMax: 5, YMin: -6, YMax: 6 }
const p = defaultCoefficients
const meshes = ['minus', 'plus'].map(side => sonicSurfaceTriangles(p, { ...domain, ...resolution, side }))
const intersections = intersectSonicTriangleMeshes(...meshes).segments
const j = inflectionGeometry(p, { tauMin: domain.tauMin, tauMax: domain.tauMax, nTau: 80, nZ: 120 })
const ds = doubleSonicGeometry(p, domain)
const jSegments = j.flatMap(curve => curve.slice(1).map((q, i) => [[curve[i].tau, 0, curve[i].zc], [q.tau, 0, q.zc]]))
const dsSegments = ds.map(line => [[line.tau, domain.YMin, line.zc], [line.tau, domain.YMax, line.zc]])
const nearest = (q, segments) => segments.reduce((v, segment) => Math.min(v, pointSegmentDistance(q, segment)), Infinity)
const records = intersections.map((segment, index) => {
  const midpoint = segment[0].map((x, k) => (x + segment[1][k]) / 2)
  const dJ = nearest(midpoint, jSegments)
  const dDS = nearest(midpoint, dsSegments)
  const samples = [segment[0], midpoint, segment[1]]
  return { index, midpoint, length: Math.hypot(...segment[0].map((x, k) => x - segment[1][k])), dJ, dDS,
    assigned: dJ <= dDS ? 'J' : 'DS', maxDistanceToJ: Math.max(...samples.map(q => nearest(q, jSegments))),
    maxDistanceToDS: Math.max(...samples.map(q => nearest(q, dsSegments))),
    classificationMargin: Math.abs(dJ - dDS) }
})
const jRecords = records.filter(r => r.assigned === 'J')
const top = [...jRecords].sort((a, b) => b.maxDistanceToJ - a.maxDistanceToJ).slice(0, 12)
console.log(JSON.stringify({ mode: 'manual-j-outlier-diagnostics', resolution, totalSegments: records.length,
  assignedJ: jRecords.length, assignedDS: records.length - jRecords.length,
  worstJSegments: top, ambiguousJSegments: jRecords.filter(r => r.classificationMargin < 0.06).length,
  note: 'Classification uses nearest canonical locus at the midpoint. Outliers can be extraction, interpolation, or classification artifacts; coordinates are (tau,Y,zc).' }, null, 2))
