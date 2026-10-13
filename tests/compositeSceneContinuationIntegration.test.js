import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCompositeSceneData } from '../src/geometry/composite/compositeSceneData.js'
import { defaultCoefficients } from '../src/math/quadraticFlux.js'

test('continuation audit is opt-in and preserves disabled scene results', () => {
  const base = buildCompositeSceneData(defaultCoefficients, -0.2, 0.2, {showMinus:false,showPlus:false})
  const audited = buildCompositeSceneData(defaultCoefficients, -0.2, 0.2, {showMinus:false,showPlus:false,auditContinuation:true})
  assert.deepEqual(audited, base)
})

test('enabled audit exposes continuation diagnostics without modifying composite geometry', () => {
  const opts={showMinus:true,showPlus:false,YMin:-1,YMax:1}
  const base=buildCompositeSceneData(defaultCoefficients,-0.1,0.1,opts)
  const audited=buildCompositeSceneData(defaultCoefficients,-0.1,0.1,{...opts,auditContinuation:true})
  assert.deepEqual(audited.minus.geometry,base.minus.geometry)
  assert.deepEqual(audited.plus.geometry,base.plus.geometry)
  assert.deepEqual(audited.minus.diagnostics.topology,base.minus.diagnostics.topology)
  assert.equal(typeof audited.minus.diagnostics.continuation.traces,'number')
  assert.ok(Array.isArray(audited.minus.diagnostics.continuation.events))
  assert.equal(base.minus.diagnostics.continuation,undefined)
})
