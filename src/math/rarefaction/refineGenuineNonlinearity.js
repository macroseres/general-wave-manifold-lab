import { genuineNonlinearityAt } from './genuineNonlinearity.js'

const mix = (a, b, t) => a.map((x, i) => x + t * (b[i] - x))

/** Refine a sign-change candidate on a sampled characteristic segment.
 * This is a root of the directional derivative along the interpolated chord,
 * not a certified root on the exact integral curve.
 */
export function refineGenuineNonlinearityBracket(a, b, p, family, options = {}) {
  const { maxIterations = 48, parameterTolerance = 1e-9, valueTolerance = 1e-7 } = options
  const evaluate = t => genuineNonlinearityAt(mix(a, b, t), p, family)
  let lo = 0, hi = 1
  let left = evaluate(lo), right = evaluate(hi)
  if (left.status !== 'estimated' || right.status !== 'estimated' || !Number.isFinite(left.value) || !Number.isFinite(right.value))
    return { status: 'unresolved', reason: 'undefined-characteristic-derivative' }
  if (left.value * right.value > 0) return { status: 'unresolved', reason: 'not-bracketed' }
  let current = left
  let t = lo
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    t = (lo + hi) / 2
    current = evaluate(t)
    if (current.status !== 'estimated' || !Number.isFinite(current.value))
      return { status: 'unresolved', reason: 'derivative-undefined-inside-bracket' }
    if (Math.abs(current.value) <= valueTolerance || hi - lo <= parameterTolerance)
      return { status: 'refined-candidate', point: mix(a, b, t), value: current.value, t, iterations: iteration + 1, chordLength: Math.hypot(b[0] - a[0], b[1] - a[1]) }
    if (left.value * current.value <= 0) { hi = t; right = current }
    else { lo = t; left = current }
  }
  return { status: 'refined-candidate', point: mix(a, b, t), value: current.value, t, iterations: maxIterations, chordLength: Math.hypot(b[0] - a[0], b[1] - a[1]) }
}

export function refineGenuineNonlinearityEvents(branch, p, options = {}) {
  return { ...branch, events: (branch.events ?? []).map(event => {
    if (event.kind !== 'sign-change' || !event.bracket) return event
    const [i, j] = event.bracket
    const refined = refineGenuineNonlinearityBracket(branch.points[i], branch.points[j], p, branch.family, options)
    return refined.status === 'refined-candidate' ? { ...event, ...refined, kind: 'refined-sign-change' } : { ...event, refinement: refined }
  }) }
}
