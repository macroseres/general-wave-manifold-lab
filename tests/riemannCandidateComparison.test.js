import test from 'node:test'
import assert from 'node:assert/strict'
import {compareRiemannCandidates} from '../src/math/solution/riemannCandidateComparison.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
const p=oldWavePreset()
test('empty comparison is empty',()=>assert.deepEqual(compareRiemannCandidates([],p),[]))
test('invalid candidate is not accepted',()=>{
 const [q]=compareRiemannCandidates([{status:'sampled-candidate',kind:'two-shock',states:[[0,0],null,[1,1]]}],p)
 assert.equal(q.status,'invalid-profile');assert.equal(q.entropyCertified,false)
})
test('two shocks have independently computed residuals',()=>{
 const [q]=compareRiemannCandidates([{status:'sampled-candidate',kind:'two-shock',states:[[0,0],[1,0],[2,0]],speeds:[1,3],evidence:{liu:'not-evaluated'}}],p)
 assert.equal(q.relativeShockResiduals.length,2);assert.equal(q.liu,'not-evaluated');assert.equal(q.entropyCertified,false)
})
test('Liu violation dominates the comparison',()=>{
 const [q]=compareRiemannCandidates([{status:'sampled-candidate',kind:'two-shock',states:[[0,0],[1,0],[2,0]],speeds:[1,3],evidence:{status:'liu-violation-detected'}}],p)
 assert.equal(q.status,'liu-violation-detected')
})
test('comparison retains input order and index',()=>{
 const qs=compareRiemannCandidates([{status:'bad'},{status:'bad'}],p)
 assert.deepEqual(qs.map(q=>q.index),[0,1])
})
