import test from 'node:test'
import assert from 'node:assert/strict'
import { oldWavePreset } from '../src/math/flux/quadraticFlux.js'
import { rarefactionOrbits } from '../src/math/rarefaction/orbits.js'
import { finiteRarefactionSeparatrices } from '../src/math/rarefaction/finiteSeparatrices.js'
import { infinityRarefactionSeparatrices } from '../src/math/rarefaction/separatrices.js'

const p = oldWavePreset()

test('orbit diagnostic callback preserves the returned geometry', () => {
  const options = { maxSteps: 5, nTau: 4, nZ: 4 }
  const baseline = rarefactionOrbits(p, -1, 1, options)
  const records = []
  const observed = rarefactionOrbits(p, -1, 1, { ...options, onIntegrationDiagnostic: d => records.push(d) })
  assert.deepEqual(observed, baseline)
  assert.ok(records.length > 0)
  for (const d of records) {
    assert.equal(d.source, 'orbit')
    assert.ok(d.kind === 'accepted' || d.kind === 'failure')
    assert.ok(Number.isInteger(d.stepIndex))
  }
})

test('finite separatrix diagnostic callback preserves geometry', () => {
  const options = { maxSteps: 5 }
  const baseline = finiteRarefactionSeparatrices(p, -2, 2, options)
  const records = []
  const observed = finiteRarefactionSeparatrices(p, -2, 2, { ...options, onIntegrationDiagnostic: d => records.push(d) })
  assert.deepEqual(observed, baseline)
  for (const d of records) assert.equal(d.source, 'finite-separatrix')
})

test('infinity separatrix diagnostic callback preserves geometry', () => {
  const options = { steps: 5 }
  const baseline = infinityRarefactionSeparatrices(p, options)
  const records = []
  const observed = infinityRarefactionSeparatrices(p, { ...options, onIntegrationDiagnostic: d => records.push(d) })
  assert.deepEqual(observed, baseline)
  for (const d of records) assert.equal(d.source, 'infinity-separatrix')
})
