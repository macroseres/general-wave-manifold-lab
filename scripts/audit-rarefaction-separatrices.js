import { readFileSync } from 'node:fs'
import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { finiteRarefactionSeparatrices } from '../src/math/rarefaction/finiteSeparatrices.js'
import { infinityRarefactionSeparatrices } from '../src/math/rarefaction/separatrices.js'

const input = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], 'utf8')) : {}
const p = { ...defaultCoefficients, ...(input.coefficients ?? input.p ?? {}) }
const tauMin = input.tauMin ?? -5
const tauMax = input.tauMax ?? 5
const diagnostics = new Map()
const record = d => {
  const key = `${d.source}:${d.singularityIndex ?? 'inf'}:${d.eigenIndex}:${d.branch}`
  const s = diagnostics.get(key) ?? { attempts: 0, accepted: 0, terminal: null }
  s.attempts++
  if (d.kind === 'accepted') s.accepted++
  else s.terminal = d.kind
  diagnostics.set(key, s)
}
const finite = finiteRarefactionSeparatrices(p, tauMin, tauMax, { onIntegrationDiagnostic: record })
const infinity = infinityRarefactionSeparatrices(p, { tauMin, tauMax, onIntegrationDiagnostic: record })
const extent = points => ({
  count: points.length,
  tau: points.length ? [Math.min(...points.map(q => q.tau)), Math.max(...points.map(q => q.tau))] : null,
  zc: points.length ? [Math.min(...points.map(q => q.zc)), Math.max(...points.map(q => q.zc))] : null,
})
const result = {
  parameters: p, window: { tauMin, tauMax },
  finiteSingularities: finite.singularities.map(q => ({ tau:q.tau, zc:q.zc, type:q.type, eigenvalues:q.eigenvalues })),
  finiteSeparatrices: finite.separatrices.map(c => ({ id:c.id, stable:c.stable, branch:c.branch, ...extent(c.points) })),
  infinitySeparatrices: infinity.map(c => ({ id:c.id, stable:c.stable, boundary:c.liesOnInfinityBoundary, visibleInFiniteChart:c.visibleInFiniteChart, reciprocalPointCount:c.reciprocalPoints.length, ...extent(c.points) })),
  integration: Object.fromEntries(diagnostics),
}
console.log(JSON.stringify(result, null, 2))
