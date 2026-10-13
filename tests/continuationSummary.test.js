import test from 'node:test'
import assert from 'node:assert/strict'
import { continuationSummary } from '../src/geometry/composite/continuationSummary.js'

test('no audit is explicitly unavailable, not a false zero-event result', () => {
  assert.equal(continuationSummary({}).available, false)
})
test('continuation events are counted without classifying bifurcations', () => {
  const value = continuationSummary({ continuation: { traces: 2, samples: 5, events: [
    { kind: 'root-count-change', classification: 'unresolved' },
    { kind: 'close-competing-roots', classification: 'unresolved' },
  ] } })
  assert.deepEqual(value, { available: true, traces: 2, samples: 5, events: 2, rootCountChanges: 1, competingRoots: 1, unresolved: 2 })
})
test('an available audit with no events is distinct from a missing audit', () => {
  const value = continuationSummary({ continuation: { traces: 1, samples: 3, events: [] } })
  assert.equal(value.available, true)
  assert.equal(value.events, 0)
})
