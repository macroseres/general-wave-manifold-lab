import test from 'node:test'
import assert from 'node:assert/strict'
import { rootStabilityDiagnostics, polynomialContinuationDiagnostics } from '../src/math/numerics/rootDiagnostics.js'

test('well separated linear root is stable under small constant perturbations', () => {
  const r = rootStabilityDiagnostics([1, -2], { relativePerturbation: 1e-8 })
  assert.equal(r.countSensitive, false)
  assert.equal(r.assessment, 'no-count-change-observed')
})
test('quadratic tangency is flagged as root-count sensitive', () => {
  const r = rootStabilityDiagnostics([1, 0, 0], { relativePerturbation: 1e-5, tolerance: 1e-12 })
  assert.equal(r.countSensitive, true)
  assert.deepEqual(r.perturbations.map(p => p.rootCount), [2, 0])
})
test('close quadratic roots trigger sensitivity when perturbed across discriminant', () => {
  const r = rootStabilityDiagnostics([1, 0, -1e-8], { relativePerturbation: 1e-7, tolerance: 1e-12 })
  assert.equal(r.countSensitive, true)
})
test('continuation reports sensitivity separately from sampled root-count changes', () => {
  const r = polynomialContinuationDiagnostics([[1, 0, 1], [1, 0, 0], [1, 0, -1]],
    { tolerance: 1e-12, relativePerturbation: 1e-5 })
  assert.deepEqual(r.counts, [0, 1, 2])
  assert.equal(r.events.length, 2)
  assert.ok(r.events.every(e => e.classification === 'unresolved'))
  assert.deepEqual(r.sensitiveSamples, [1])
})
test('invalid perturbation is rejected', () => {
  assert.throws(() => rootStabilityDiagnostics([1, 0], { relativePerturbation: 0 }), TypeError)
})
