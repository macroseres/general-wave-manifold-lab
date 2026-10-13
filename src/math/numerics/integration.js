import { NUMERICAL_POLICY } from './policy.js'

const I = NUMERICAL_POLICY.integration

/** One classical RK4 step for an object state and vector-valued field. */
export function rk4Step(state, step, field, addScaled) {
  const k1 = field(state); if (!k1) return null
  const k2 = field(addScaled(state, k1, step / 2)); if (!k2) return null
  const k3 = field(addScaled(state, k2, step / 2)); if (!k3) return null
  const k4 = field(addScaled(state, k3, step)); if (!k4) return null
  return addScaled(state, [
    (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6,
    (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6,
  ], step)
}

/**
 * Adaptive RK4 by step doubling.
 *
 * One full RK4 step is compared with two half steps. For a fourth-order
 * method their difference divided by 15 estimates the local error of the
 * two-half-step result. The accepted state is the two-half-step state; the
 * caller owns semantic events/boundaries and supplies state norm/distance.
 */
export function adaptiveRK4Step(state, initialStep, field, addScaled, {
  absoluteTolerance = I.absoluteTolerance,
  relativeTolerance = I.relativeTolerance,
  minStep = I.minStep,
  maxStep = Math.abs(initialStep),
  maxReject = I.maxReject,
  safety = I.safety,
  minFactor = I.minFactor,
  maxFactor = I.maxFactor,
  minimumStepPolicy = I.minimumStepPolicy,
  norm = x => Math.hypot(...Object.values(x).filter(Number.isFinite)),
  distance = (a, b) => Math.hypot(...Object.keys(a).filter(k => Number.isFinite(a[k]) && Number.isFinite(b[k])).map(k => a[k] - b[k])),
} = {}) {
  if (minimumStepPolicy !== 'accept' && minimumStepPolicy !== 'reject') {
    return { kind: 'failure', reason: 'invalid_minimum_step_policy', rejected: 0 }
  }
  const direction = Math.sign(initialStep) || 1
  let h = Math.min(Math.max(Math.abs(initialStep), minStep), maxStep) * direction
  for (let rejected = 0; rejected <= maxReject; rejected++) {
    const full = rk4Step(state, h, field, addScaled)
    const half = rk4Step(state, h / 2, field, addScaled)
    const twoHalf = half && rk4Step(half, h / 2, field, addScaled)
    if (!full || !twoHalf) return { kind: 'failure', reason: 'field', rejected }
    const error = distance(full, twoHalf) / 15
    const scale = absoluteTolerance + relativeTolerance * Math.max(norm(state), norm(twoHalf))
    const ratio = error > 0 ? scale / error : Infinity
    const factor = Math.min(maxFactor, Math.max(minFactor, safety * Math.pow(ratio, 0.2)))
    const nextStep = Math.min(maxStep, Math.max(minStep, Math.abs(h) * factor)) * direction
    if (!Number.isFinite(error) || !Number.isFinite(scale) || scale < 0) {
      return { kind: 'failure', reason: 'nonfinite_error', rejected, stepUsed: h, error, scale }
    }
    const toleranceMet = error <= scale
    const atMinimumStep = Math.abs(h) <= minStep
    if (toleranceMet || (atMinimumStep && minimumStepPolicy === 'accept')) {
      return { kind: 'accepted', state: twoHalf, stepUsed: h, nextStep, error, scale, rejected,
        toleranceMet, stopReason: toleranceMet ? 'tolerance' : 'minimum_step_forced' }
    }
    if (atMinimumStep) {
      return { kind: 'failure', reason: 'minimum_step_tolerance', rejected, stepUsed: h, error, scale }
    }
    h = nextStep
  }
  return { kind: 'failure', reason: 'rejections', rejected: maxReject + 1 }
}

/** Normalize a 2D vector, reporting failure below the caller's semantic floor. */
export function normalized2(v, floor) {
  if (!v || !Number.isFinite(v[0]) || !Number.isFinite(v[1])) return null
  const n = Math.hypot(v[0], v[1])
  return n > floor ? [v[0] / n, v[1] / n] : null
}

/** Refine a scalar event already bracketed by two states. */
export function locateBracketedEvent(a, b, eventValue, interpolate, {
  valueTolerance = I.eventValueTolerance,
  iterations = I.eventIterations,
} = {}) {
  let lo=a,hi=b,flo=eventValue(lo),fhi=eventValue(hi)
  if(!Number.isFinite(flo)||!Number.isFinite(fhi)||flo*fhi>0)return null
  if(Math.abs(flo)<=valueTolerance)return lo
  if(Math.abs(fhi)<=valueTolerance)return hi
  for(let k=0;k<iterations;k++){
    const mid=interpolate(lo,hi,.5),fm=eventValue(mid)
    if(!Number.isFinite(fm))return null
    if(Math.abs(fm)<=valueTolerance)return mid
    if(flo*fm<=0){hi=mid;fhi=fm}else{lo=mid;flo=fm}
  }
  return interpolate(lo,hi,.5)
}
