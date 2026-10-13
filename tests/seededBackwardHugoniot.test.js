import test from 'node:test'
import assert from 'node:assert/strict'
import {traceSeededBackwardHugoniot} from '../src/math/solution/seededBackwardHugoniot.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
const p=oldWavePreset()
test('backward requires a converged sonic-minus contact',()=>{
  assert.equal(traceSeededBackwardHugoniot([0,0],null,p).status,'unrefined-backward-contact')
  assert.equal(traceSeededBackwardHugoniot([0,0],{sonicSide:'plus',refinement:{status:'converged',point:[1,0]}},p).status,'unrefined-backward-contact')
})
test('backward refuses a nonconverged contact',()=>{
  assert.equal(traceSeededBackwardHugoniot([0,0],{sonicSide:'minus',refinement:{status:'candidate',point:[1,0]}},p).arc,null)
})
test('backward continuation cannot claim Liu admissibility for missing geometry',()=>{
  const q=traceSeededBackwardHugoniot([0,0],{family:'slow',sonicSide:'minus',refinement:{status:'converged',point:[0,0]}},p,{maxSteps:2})
  assert.equal(q.passes,false)
  assert.equal(q.arc,null)
})
