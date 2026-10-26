import { jacobian } from '../flux/quadraticFlux.js'
import { discriminant } from '../characteristic/spectrum.js'

/** Local real characteristic field in the state plane. No entropy claim. */
export function stateCharacteristicDirection(U, p, family, reference = null, tolerance = 1e-10) {
  if (!Array.isArray(U) || !U.every(Number.isFinite)) return null
  const J = jacobian(U, p), delta = discriminant(U, p)
  const scale = 1 + J.flat().reduce((s, x) => s + x * x, 0)
  if (!Number.isFinite(delta) || delta <= tolerance * scale) return null
  const lambda = (J[0][0] + J[1][1] + (family === 'fast' ? 1 : -1) * Math.sqrt(delta)) / 2
  if (family !== 'fast' && family !== 'slow') return null
  const a = [J[0][1], lambda - J[0][0]], b = [lambda - J[1][1], J[1][0]]
  const candidate = Math.hypot(...a) >= Math.hypot(...b) ? a : b
  const norm = Math.hypot(...candidate)
  if (norm <= 1e-12 * Math.sqrt(scale)) return null
  let r = candidate.map(x => x / norm)
  if (reference && r[0] * reference[0] + r[1] * reference[1] < 0) r = r.map(x => -x)
  else if (!reference && (Math.abs(r[0]) > 1e-12 ? r[0] < 0 : r[1] < 0)) r = r.map(x => -x)
  return { direction: r, lambda, delta }
}

const add = (U, v, h) => U.map((x, i) => x + h * v[i])
function rk4(U, p, family, h, reference) {
  const f = (q, ref) => stateCharacteristicDirection(q, p, family, ref)?.direction
  const k1 = f(U, reference); if (!k1) return null
  const k2 = f(add(U, k1, h / 2), k1); if (!k2) return null
  const k3 = f(add(U, k2, h / 2), k2); if (!k3) return null
  const k4 = f(add(U, k3, h), k3); if (!k4) return null
  return { point: U.map((x, i) => x + h * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) / 6), direction: k4 }
}

/** Trace one oriented branch with RK4 step-doubling and a hyperbolicity stop. */
export function traceStateRarefaction(U, p, family, sign = 1, options = {}) {
  const { maxSteps = 320, maxLength = 12, step = 0.04, minStep = 1e-5, tolerance = 2e-5, boundedLength = false } = options
  if (!U || !Array.isArray(U) || U.length !== 2 || !U.every(Number.isFinite)) return { points: [], stop: 'missing-state' }
  if (![step,minStep,tolerance,maxLength].every(x=>Number.isFinite(x)&&x>0)||
    !Number.isInteger(maxSteps)||maxSteps<1||![1,-1].includes(sign)) return { points: [], stop: 'invalid-options' }
  const initial = stateCharacteristicDirection(U, p, family)
  if (!initial) return { points: [], stop: 'non-strict-hyperbolicity' }
  const points = [[...U]]
  const parameters = [0]
  let current = [...U], ref = initial.direction.map(x => x * sign), h = Math.min(step, maxLength), length = 0
  for (let i = 0; i < maxSteps && length < maxLength; i++) {
    if (boundedLength) h = Math.min(h, maxLength-length)
    const advance = size => rk4(current, p, family, size, ref)
    const full = advance(h), half1 = advance(h / 2)
    const half2 = half1 && rk4(half1.point, p, family, h / 2, half1.direction)
    if (!full || !half2) {
      if (h > minStep * 1.01) { h /= 2; continue }
      return { points, parameters, stop: 'hyperbolicity-boundary' }
    }
    const error = Math.hypot(...full.point.map((x, j) => x - half2.point[j]))
    if (error > tolerance && h > minStep * 1.01) { h /= 2; continue }
    if (error > tolerance) return { points, parameters, stop: 'integration-tolerance' }
    const next = half2.point
    if (!stateCharacteristicDirection(next, p, family)) return { points, parameters, stop: 'hyperbolicity-boundary' }
    length += boundedLength ? h : Math.hypot(next[0]-current[0],next[1]-current[1])
    current = next; ref = half2.direction; points.push(current)
    parameters.push(parameters.at(-1)+h)
    if (error < tolerance / 16) h = Math.min(step * 2, h * 1.5)
  }
  return { points, parameters, stop: length >= maxLength ? 'max-length' : 'max-steps' }
}

export function riemannRarefactionBranches(states, p, options = {}) {
  return ['left', 'right'].flatMap(side => {
    const U = states?.[side]
    return U ? ['slow', 'fast'].flatMap(family => [-1, 1].map(sign => ({
      side, family, sign, ...traceStateRarefaction(U, p, family, sign, options),
    }))) : []
  })
}
