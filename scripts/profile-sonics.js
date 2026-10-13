import process from 'node:process'
import { performance } from 'node:perf_hooks'
import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'

const args = process.argv.slice(2)
function numberArg(flag, fallback) {
  const index = args.indexOf(`--${flag}`)
  if (index < 0) return fallback
  const value = Number(args[index + 1])
  if (!Number.isFinite(value)) throw new Error(`Invalid --${flag}`)
  return value
}
const repeats = numberArg('repeats', 2)
const nTau = numberArg('ntau', 34)
const nY = numberArg('ny', 28)
const nZ = numberArg('nz', 50)
if (![repeats,nTau,nY,nZ].every(Number.isInteger) || repeats < 1 || repeats > 8 || [nTau,nY,nZ].some(n => n < 2 || n > 80)) throw new Error('Invalid repetitions or resolution')
const domain = { tauMin: numberArg('tau-min', -5), tauMax: numberArg('tau-max', 5), YMin: numberArg('y-min', -6), YMax: numberArg('y-max', 6) }
if (domain.tauMin >= domain.tauMax || domain.YMin >= domain.YMax) throw new Error('Invalid domain')
const diagnostics = !args.includes('--no-audit')
const opts = { ...domain, nTau, nY, nZ, side: 'minus', diagnostics, profile: true }
const trials = []
for (let i = 0; i < repeats; i++) {
  const started = performance.now()
  const mesh = sonicSurfaceTriangles(defaultCoefficients, opts)
  const elapsedMs = performance.now() - started
  const convertStart = performance.now()
  const positions = Float32Array.from(mesh.positions)
  const indices = Uint32Array.from(mesh.indices)
  const conversionMs = performance.now() - convertStart
  trials.push({elapsedMs: Math.round(elapsedMs), conversionMs: Number(conversionMs.toFixed(2)), triangles: mesh.triangleCount, vertices: mesh.vertexCount, edgeRoots: mesh.canonicalEdgeRootCount, sharedFaces: mesh.sharedFaceCount, sharedFaceViolations: mesh.sharedFaceViolationCount, bytes: positions.byteLength + indices.byteLength, baseEvaluations: mesh.baseEvaluationCount, timings: Object.fromEntries(Object.entries(mesh.timings).map(([key,value])=>[key,Number(value.toFixed(2))]))})
}
const times = trials.map(t => t.elapsedMs).sort((a,b) => a-b)
console.log(JSON.stringify({ mode: 'manual-sonic-performance-profile', resolution: {nTau,nY,nZ}, domain, diagnostics, repeats, medianMs: times[Math.floor(times.length/2)], trials, note: 'Measures complete extraction and typed-array conversion in Node.js. It does not measure browser Worker startup, transfer, GPU upload, or individual extraction stages. Use --no-audit to benchmark without diagnostic face recording/comparison; production behavior is unchanged.' }, null, 2))
