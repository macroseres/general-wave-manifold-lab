/** Diagnostic-only root multiplicity and tangency analysis for degree <= 3.
 * Does not change the production root solvers or continuation matching.
 */
import { cubicRealRoots, quadraticRoots } from './polynomialRoots.js'

export function polynomialRootDiagnostics(coefficients, { tolerance = 1e-9 } = {}) {
  if (!Array.isArray(coefficients) || coefficients.length < 2 || coefficients.length > 4 ||
      coefficients.some(c => !Number.isFinite(c)) || !(tolerance > 0)) {
    throw new TypeError('Expected finite polynomial coefficients (degree 1..3) and positive tolerance')
  }
  const scale = Math.max(1, ...coefficients.map(Math.abs))
  const cs = [...coefficients]
  while (cs.length > 1 && Math.abs(cs[0]) <= tolerance * scale) cs.shift()
  const degree = cs.length - 1
  if (degree === 0) return { degree, roots: [], identicallyZero: Math.abs(cs[0]) <= tolerance * scale }
  const roots = degree === 1 ? [-cs[1] / cs[0]]
    : degree === 2 ? quadraticRoots(...cs, tolerance * scale)
      : cubicRealRoots(...cs, tolerance * scale)
  // Critical points are independently checked: even-multiplicity roots may not change sign.
  const derivative = cs.slice(0, -1).map((c, i) => c * (degree - i))
  const stationary = degree === 2 ? [-cs[1] / (2 * cs[0])]
    : degree === 3 ? quadraticRoots(...derivative, tolerance * scale) : []
  const evalPoly = (arr, x) => arr.reduce((acc, c) => acc * x + c, 0)
  const candidates = [...roots]
  for (const x of stationary) {
    const bound = scale * Math.max(1, Math.abs(x) ** degree)
    if (Math.abs(evalPoly(cs, x)) <= tolerance * bound &&
        !candidates.some(r => Math.abs(r - x) <= tolerance * 10 * Math.max(1, Math.abs(x)))) candidates.push(x)
  }
  candidates.sort((a, b) => a - b)
  return { degree, identicallyZero: false, roots: candidates.map(value => {
    let d = [...cs], multiplicity = 0
    while (d.length > 1) {
      const bound = scale * Math.max(1, Math.abs(value) ** (d.length - 1))
      if (Math.abs(evalPoly(d, value)) > tolerance * bound) break
      multiplicity++
      d = d.slice(0, -1).map((c, i) => c * (d.length - 1 - i))
    }
    return { value, multiplicity: Math.max(1, multiplicity), tangential: multiplicity % 2 === 0,
      residual: evalPoly(cs, value) }
  }) }
}

/** Explicitly report changes in root counts, without inventing branch connections. */
export function continuationEventDiagnostics(samples) {
  if (!Array.isArray(samples)) throw new TypeError('Expected an array of root samples')
  const counts = samples.map(sample => {
    if (!Array.isArray(sample)) throw new TypeError('Each sample must be an array of roots')
    return sample.length
  })
  const events = []
  for (let i = 1; i < counts.length; i++) {
    if (counts[i] !== counts[i - 1]) events.push({ between: [i - 1, i],
      before: counts[i - 1], after: counts[i], kind: 'root-count-change',
      classification: 'unresolved' })
  }
  return { counts, events }
}

/** Diagnostic-only sensitivity sweep; never alters production continuation. */
export function rootStabilityDiagnostics(coefficients, {
  tolerance = 1e-9, relativePerturbation = 1e-8,
} = {}) {
  if (!(relativePerturbation > 0) || !Number.isFinite(relativePerturbation)) {
    throw new TypeError('relativePerturbation must be finite and positive')
  }
  const baseline = polynomialRootDiagnostics(coefficients, { tolerance })
  const scale = Math.max(1, ...coefficients.map(Math.abs))
  const perturbation = relativePerturbation * scale
  const perturbations = [-perturbation, perturbation].map(delta => {
    const altered = [...coefficients]
    altered[altered.length - 1] += delta
    const result = polynomialRootDiagnostics(altered, { tolerance })
    return { delta, rootCount: result.roots.length, roots: result.roots.map(r => r.value) }
  })
  const roots = baseline.roots.map(r => r.value).sort((a, b) => a - b)
  const minimumSeparation = roots.length < 2 ? null : Math.min(...roots.slice(1).map((r, i) => r - roots[i]))
  const countSensitive = perturbations.some(p => p.rootCount !== roots.length)
  return { baseline, minimumSeparation, perturbation, perturbations, countSensitive,
    assessment: countSensitive ? 'sensitive' : 'no-count-change-observed' }
}

/** Annotate a sampled continuation without claiming branch identity or bifurcation type. */
export function polynomialContinuationDiagnostics(coefficientSamples, options = {}) {
  if (!Array.isArray(coefficientSamples)) throw new TypeError('Expected coefficient samples')
  const analyses = coefficientSamples.map(cs => rootStabilityDiagnostics(cs, options))
  const counts = analyses.map(a => a.baseline.roots.length)
  const changes = continuationEventDiagnostics(analyses.map(a => a.baseline.roots))
  return { counts, samples: analyses, events: changes.events,
    sensitiveSamples: analyses.flatMap((a, i) => a.countSensitive ? [i] : []) }
}
