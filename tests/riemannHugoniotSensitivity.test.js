import test from 'node:test'
import assert from 'node:assert/strict'
import {refineHugoniotSegmentEndpoint} from '../src/math/solution/riemannBranchHighlight.js'

const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:1,b02:0,b10:0,b01:0}
const fixed=[0,0]
test('tracks transverse Hugoniot root under small coefficient perturbations',()=>{
  const result=refineHugoniotSegmentEndpoint([1,-1],[1,1],fixed,[1,0],p,{tolerance:0.1})
  assert.ok(result)
  assert.equal(result.coefficientSensitivity.trials.length,10)
  assert.equal(result.coefficientSensitivity.status,'locally-tracked')
  assert.ok(result.coefficientSensitivity.maximumParameterShift<0.01)
})
test('sensitivity may be explicitly disabled',()=>{
  const result=refineHugoniotSegmentEndpoint([1,-1],[1,1],fixed,[1,0],p,{tolerance:0.1,analyzeSensitivity:false})
  assert.ok(result)
  assert.equal(result.coefficientSensitivity,null)
})
test('reports unresolved perturbations at a tangential root',()=>{
  const result=refineHugoniotSegmentEndpoint([-1,1],[1,1],fixed,[0,1],p,{tolerance:0.1})
  assert.ok(result)
  assert.ok(['unresolved-perturbation','locally-tracked'].includes(result.coefficientSensitivity.status))
  assert.equal(result.rootCondition,'near-tangential')
})
