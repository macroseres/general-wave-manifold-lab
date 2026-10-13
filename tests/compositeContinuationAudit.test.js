import test from 'node:test'
import assert from 'node:assert/strict'
import { auditCompositeContinuation, decomposeCompositeBranches } from '../src/math/state/compositeTrace.js'

const sample = (...z) => ({ P: null, intersections: z.map(v => ({ tau: 0, Y: 0, z: v })) })

test('audit preserves production branch geometry and identity', () => {
  const trace = [sample(0, 2), sample(0.1, 2.1), sample(0.2, 2.2)]
  const result = auditCompositeContinuation(trace)
  assert.deepEqual(result.branches, decomposeCompositeBranches(trace))
  assert.deepEqual(result.diagnostics.counts, [2, 2, 2])
  assert.equal(result.diagnostics.events.length, 0)
})

test('root disappearance is reported without bridging missing samples', () => {
  const trace = [sample(0), sample(), sample(0.1)]
  const result = auditCompositeContinuation(trace)
  assert.equal(result.branches.length, 2)
  assert.equal(result.diagnostics.events.filter(e => e.kind === 'root-count-change').length, 2)
  assert.ok(result.diagnostics.events.every(e => e.classification === 'unresolved'))
})

test('close competing roots are flagged without changing selected branch', () => {
  const trace = [sample(0), sample(-0.0001, 0.0001)]
  const result = auditCompositeContinuation(trace, { ambiguityTolerance: 0.001 })
  assert.equal(result.diagnostics.ambiguousMatches, 1)
  assert.deepEqual(result.branches, decomposeCompositeBranches(trace))
})

test('invalid matching thresholds are rejected', () => {
  assert.throws(() => auditCompositeContinuation([sample(0)], { maxMatchDistance: -1 }), TypeError)
})
