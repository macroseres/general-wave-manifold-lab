import test from 'node:test'
import assert from 'node:assert/strict'
import {assessTwoShockChain,assessTwoShockCandidates} from '../src/math/solution/riemannWaveChains.js'

// Decoupled Burgers components with separated characteristic speeds.
const p={a20:0.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0.5,b10:0,b01:0}
test('missing states remain inconclusive',()=>{
  assert.equal(assessTwoShockChain(null,[1,1],[0,0],p).status,'missing-states')
})
test('two exact shocks with increasing speeds yield an ordered candidate',()=>{
  // First changes u: speed 1.5; second changes v: speed 2.5.
  const q=assessTwoShockChain([2,3],[1,3],[1,2],p)
  assert.equal(q.status,'ordered-rh-candidate')
  assert.equal(q.entropyCertified,false)
})
test('reversed shock speeds fail ordering even with exact RH',()=>{
  const q=assessTwoShockChain([3,2],[2,2],[2,1],p)
  assert.equal(q.status,'speed-ordering-unverified')
  assert.equal(q.rhBoth,true)
})
test('off-Hugoniot first jump is not accepted',()=>{
  const q=assessTwoShockChain([2,3],[1,2],[1,1],p)
  assert.equal(q.status,'rankine-hugoniot-unverified')
})
test('candidate mapping retains original data and appends evidence',()=>{
  const candidates=[{middle:[1,3],forwardSegment:'f'}]
  const result=assessTwoShockCandidates([2,3],[1,2],candidates,p)
  assert.equal(result[0].forwardSegment,'f')
  assert.equal(result[0].chainEvidence.status,'ordered-rh-candidate')
  assert.equal(candidates[0].chainEvidence,undefined)
})
