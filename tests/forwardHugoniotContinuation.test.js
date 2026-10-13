import test from 'node:test'
import assert from 'node:assert/strict'
import {forwardHugoniotIncidence,forwardHugoniotGradient,correctForwardHugoniotPoint,continueSampledForwardHugoniot} from '../src/math/solution/forwardHugoniotContinuation.js'
import {sampledLiuAtForwardContact} from '../src/math/solution/orientedLiuArc.js'
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0}
const L=[0,0]
test('RH incidence and gradient vanish on a decoupled u-axis shock',()=>{
  assert.equal(forwardHugoniotIncidence(L,[1,0],p),0)
  assert.ok(Math.abs(forwardHugoniotGradient(L,[1,0],p)[1]+0.5)<1e-12)
})
test('corrector returns an actual Rankine–Hugoniot state',()=>{
  const q=correctForwardHugoniotPoint(L,[1,0.01],p)
  assert.equal(q.status,'converged')
  assert.ok(Math.abs(q.point[1])<1e-7)
})
test('sampled forward arc is corrected and densified',()=>{
  const q=continueSampledForwardHugoniot(L,[[0,0],[0.5,0.001],[1,0.001]],p,{maxChord:0.1})
  assert.equal(q.status,'continued-sampled-arc')
  assert.ok(q.inserted>0)
  assert.ok(q.arc.slice(1).every(x=>Math.abs(forwardHugoniotIncidence(L,x,p))<1e-8))
})
test('unresolvable vertices do not yield a Liu pass',()=>{
  const segments=[{points:[{u:0,v:0},{u:0.5,v:0.5},{u:1,v:0}]}]
  const q=sampledLiuAtForwardContact(L,{refinement:{status:'converged',point:[1,0]}},segments,p)
  assert.equal(q.passes,false)
})
