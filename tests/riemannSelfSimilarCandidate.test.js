import test from 'node:test'
import assert from 'node:assert/strict'
import {twoShockSelfSimilarCandidate,mixedSelfSimilarCandidate,evaluateSelfSimilarCandidate} from '../src/math/solution/riemannSelfSimilarCandidate.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:3}
test('two shocks define three constant states with ordered speeds',()=>{
 const q=twoShockSelfSimilarCandidate([1,1],[0,1],[0,0],p)
 assert.equal(q.status,'sampled-candidate')
 assert.deepEqual(evaluateSelfSimilarCandidate(q,-1),[1,1])
 assert.deepEqual(evaluateSelfSimilarCandidate(q,1),[0,1])
 assert.deepEqual(evaluateSelfSimilarCandidate(q,4),[0,0])
 assert.equal(q.entropyCertified,false)
})
test('unordered shocks do not produce a profile',()=>{
 const q=twoShockSelfSimilarCandidate([0,1],[0,0],[1,0],p)
 assert.equal(q.status,'unordered-speeds');assert.equal(evaluateSelfSimilarCandidate(q,1),null)
})
test('left rarefaction and right shock define a sampled self-similar profile',()=>{
 const candidate={kind:'rarefaction-shock',family:'slow',branchSign:1,branchIndex:.5,
  middle:[1,0],refinement:{status:'refined-candidate',middle:[1,0]},
  evidence:{status:'mixed-ordered-lax-candidate'},fanArc:{passes:true}}
 const q=mixedSelfSimilarCandidate([0,0],[1,-1],candidate,[{side:'left',family:'slow',sign:1,points:[[0,0],[2,0]]}],p)
 assert.equal(q.status,'sampled-candidate');assert.deepEqual(evaluateSelfSimilarCandidate(q,-1),[0,0])
 assert.deepEqual(evaluateSelfSimilarCandidate(q,.5),[.5,0])
 assert.deepEqual(evaluateSelfSimilarCandidate(q,5),[1,-1])
})
test('unrefined middle state cannot be presented as a profile',()=>{
 const q=mixedSelfSimilarCandidate([0,0],[1,-1],{kind:'rarefaction-shock',evidence:{status:'mixed-ordered-lax-candidate'},fanArc:{passes:true},middle:[1,0]},[],p)
 assert.equal(q.status,'unrefined-middle')
})
test('invalid xi or incomplete candidates cannot be evaluated',()=>{
 assert.equal(evaluateSelfSimilarCandidate(null,0),null)
 assert.equal(evaluateSelfSimilarCandidate({status:'sampled-candidate',kind:'two-shock',states:[[0,0],[1,1],[2,2]],speeds:[0,1]},NaN),null)
})
