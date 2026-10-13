import test from 'node:test'
import assert from 'node:assert/strict'
import {pseudoArcForwardHugoniot} from '../src/math/solution/pseudoArcHugoniot.js'
import {forwardHugoniotIncidence} from '../src/math/solution/forwardHugoniotContinuation.js'
import {sampledLiuAtForwardContact} from '../src/math/solution/orientedLiuArc.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:0}
const left=[0,0]
const guide=[[0,0],[.1,0],[.4,0],[.8,0],[1,0]]
test('pseudo-arclength follows a guided RH branch with corrected intermediate states',()=>{
  const q=pseudoArcForwardHugoniot(left,guide,p)
  assert.equal(q.status,'pseudoarc-sampled-compatible')
  assert.ok(q.arc.length>guide.length)
  assert.ok(q.arc.slice(1).every(U=>Math.abs(forwardHugoniotIncidence(left,U,p))<1e-8))
  assert.deepEqual(q.arc.at(-1),[1,0])
})
test('pseudo-arclength rejects unanchored and degenerate guide arcs',()=>{
  assert.equal(pseudoArcForwardHugoniot(left,[[.2,0],[.4,0],[1,0]],p).status,'unanchored-arc')
  assert.equal(pseudoArcForwardHugoniot(left,[[0,0],[.1,0],[.1,0]],p).status,'degenerate-guide')
})
test('pseudo-arclength does not certify an unreachable endpoint',()=>{
  const q=pseudoArcForwardHugoniot(left,guide,p,{maxSteps:1})
  assert.equal(q.status,'max-steps')
  assert.equal(q.arc,null)
})
test('Liu evaluation can consume the pseudo-arclength branch',()=>{
  const segments=[{points:guide.map(([u,v])=>({u,v}))}]
  const q=sampledLiuAtForwardContact(left,{refinement:{status:'converged',point:[1,0]}},segments,p)
  assert.equal(q.continuationStatus,'pseudoarc-sampled-compatible')
  assert.equal(q.status,'sampled-liu-violation')
})
