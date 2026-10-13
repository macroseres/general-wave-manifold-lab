import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'

const domain = { tauMin: -5, tauMax: 5, YMin: -6, YMax: 6, nTau: 34, nY: 28, nZ: 50 }
const sampleLimit = 6
const results = []
for (const side of ['minus', 'plus']) {
  const mesh = sonicSurfaceTriangles(defaultCoefficients, { ...domain, side, diagnostics: true })
  const violations = mesh.sharedFaceViolations
  const grouped = { 'zero-edge-degeneracy': [], 'regular-mismatch': [] }
  for (const violation of violations) grouped[violation.kind].push(violation)
  const summarize = (items) => {
    const patterns = {}
    const uniqueSegments = new Set()
    for (const v of items) {
      const key = `${v.segmentsA.length}:${v.segmentsB.length}`
      patterns[key] = (patterns[key] || 0) + 1
      for (const segment of [...v.segmentsA, ...v.segmentsB]) uniqueSegments.add(segment)
    }
    return {
      count: items.length,
      segmentCountPatterns: patterns,
      uniqueReportedSegments: uniqueSegments.size,
      samples: items.slice(0, sampleLimit).map(v => ({
        vertices: v.vertices,
        values: v.values,
        segmentsA: v.segmentsA,
        segmentsB: v.segmentsB
      }))
    }
  }
  results.push({
    side,
    facesCompared: mesh.sharedFaceCount,
    violations: mesh.sharedFaceViolationCount,
    zeroEdge: summarize(grouped['zero-edge-degeneracy']),
    regular: summarize(grouped['regular-mismatch']),
    caveat: 'This classifies audit disagreements; it does not prove that any disagreement is a geometric hole.'
  })
}
console.log(JSON.stringify({ mode: 'sonic-shared-face-diagnostic', resolution: domain, results }, null, 2))
