import test from 'node:test'
import assert from 'node:assert/strict'
import {candidateProvenance} from '../src/math/solution/riemannCandidateProvenance.js'

test('two shocks retain their distinct Hugoniot origins and family order',()=>{
 const q=candidateProvenance({status:'sampled-candidate',kind:'two-shock',speeds:[1,3]}, {forwardSegment:'F1',backwardSegment:'B2'})
 assert.deepEqual(q.waves.map(w=>[w.family,w.origin,w.segment]),[['slow','forward-hugoniot','F1'],['fast','backward-hugoniot','B2']])
 assert.equal(q.entropyCertified,false)
})
test('left rarefaction followed by right Hugoniot shock',()=>{
 const q=candidateProvenance({status:'sampled-candidate',kind:'rarefaction-shock',fanSpeeds:[0,1],shockSpeed:2},{family:'slow',branchIndex:4,branchSign:1,curveId:'B',refinement:{status:'refined-candidate'}})
 assert.deepEqual(q.waves.map(w=>w.type),['rarefaction','shock'])
 assert.equal(q.waves[0].branchIndex,4)
 assert.equal(q.waves[1].origin,'backward-hugoniot')
})
test('left Hugoniot shock followed by right rarefaction',()=>{
 const q=candidateProvenance({status:'sampled-candidate',kind:'shock-rarefaction',fanSpeeds:[2,3],shockSpeed:1},{family:'fast',curveId:'F'})
 assert.deepEqual(q.waves.map(w=>w.family),['slow','fast'])
 assert.equal(q.waves[0].origin,'forward-hugoniot')
})
test('invalid candidates do not receive provenance',()=>{
 assert.equal(candidateProvenance({status:'rh-unverified',kind:'two-shock'},{}),null)
 assert.equal(candidateProvenance({status:'sampled-candidate',kind:'unknown'},{}),null)
})
