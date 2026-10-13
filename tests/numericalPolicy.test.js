import test from 'node:test'
import assert from 'node:assert/strict'
import { NUMERICAL_POLICY, numericalPolicySnapshot } from '../src/math/numerics/policy.js'
import { adaptiveRK4Step, locateBracketedEvent, normalized2 } from '../src/math/numerics/integration.js'

const add = (x, v, h) => ({ y: x.y + h * v[0] })
const field = x => [x.y]
const metric = x => Math.abs(x.y)
const distance = (a, b) => Math.abs(a.y - b.y)

test('numerical policy snapshot is independent and preserves integration defaults', () => {
  const snap = numericalPolicySnapshot()
  assert.deepEqual(snap.integration, NUMERICAL_POLICY.integration)
  snap.integration.absoluteTolerance = 999
  assert.equal(NUMERICAL_POLICY.integration.absoluteTolerance, 1e-8)
})

test('adaptive RK4 defaults match explicit central integration policy', () => {
  const opts = { norm: metric, distance }
  const explicit = { ...opts, ...NUMERICAL_POLICY.integration }
  const a = adaptiveRK4Step({ y: 1 }, 0.2, field, add, opts)
  const b = adaptiveRK4Step({ y: 1 }, 0.2, field, add, explicit)
  assert.deepEqual(a, b)
  assert.equal(a.kind, 'accepted')
  assert.ok(Math.abs(a.state.y - Math.exp(a.stepUsed)) < 2e-6)
})

test('adaptive RK4 integrates backward with the requested direction', () => {
  const r = adaptiveRK4Step({ y: 1 }, -0.1, field, add, { norm: metric, distance })
  assert.equal(r.kind, 'accepted')
  assert.ok(r.stepUsed < 0 && r.nextStep < 0)
  assert.ok(Math.abs(r.state.y - Math.exp(r.stepUsed)) < 2e-6)
})

test('bracketed event defaults match central policy and find a root', () => {
  const interpolate = (a, b, t) => a + (b - a) * t
  const a = locateBracketedEvent(0, 2, x => x * x - 2, interpolate)
  const b = locateBracketedEvent(0, 2, x => x * x - 2, interpolate, {
    valueTolerance: NUMERICAL_POLICY.integration.eventValueTolerance,
    iterations: NUMERICAL_POLICY.integration.eventIterations,
  })
  assert.equal(a, b)
  assert.ok(Math.abs(a - Math.sqrt(2)) < 1e-10)
})

test('event refinement rejects unbracketed roots and invalid evaluations', () => {
  const interp = (a, b, t) => a + (b - a) * t
  assert.equal(locateBracketedEvent(1, 2, x => x, interp), null)
  assert.equal(locateBracketedEvent(0, 2, () => NaN, interp), null)
})

test('normalization respects singularity floor', () => {
  assert.equal(normalized2([0, 0], 1e-12), null)
  assert.deepEqual(normalized2([3, 4], 1e-12), [0.6, 0.8])
})


test('minimum-step legacy acceptance is explicitly diagnosed', () => {
  const r = adaptiveRK4Step({ y: 1 }, 0.5, field, add, {
    norm: metric, distance, minStep: 0.5, maxStep: 0.5,
    absoluteTolerance: 1e-18, relativeTolerance: 0,
  })
  assert.equal(r.kind, 'accepted')
  assert.equal(r.toleranceMet, false)
  assert.equal(r.stopReason, 'minimum_step_forced')
  assert.ok(r.error > r.scale)
})

test('strict minimum-step policy rejects an inaccurate step', () => {
  const r = adaptiveRK4Step({ y: 1 }, 0.5, field, add, {
    norm: metric, distance, minStep: 0.5, maxStep: 0.5,
    absoluteTolerance: 1e-18, relativeTolerance: 0, minimumStepPolicy: 'reject',
  })
  assert.equal(r.kind, 'failure')
  assert.equal(r.reason, 'minimum_step_tolerance')
  assert.ok(r.error > r.scale)
})

test('strict policy still accepts a step satisfying tolerance', () => {
  const r = adaptiveRK4Step({ y: 1 }, 0.1, field, add, {
    norm: metric, distance, minimumStepPolicy: 'reject',
  })
  assert.equal(r.kind, 'accepted')
  assert.equal(r.toleranceMet, true)
  assert.equal(r.stopReason, 'tolerance')
})

test('invalid minimum-step policy is rejected deterministically', () => {
  const r = adaptiveRK4Step({ y: 1 }, 0.1, field, add, { minimumStepPolicy: 'ignore' })
  assert.deepEqual(r, { kind: 'failure', reason: 'invalid_minimum_step_policy', rejected: 0 })
})
