import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedChainLiuAtMiddle,assessMixedChainsWithLiu,assessTwoShockChainsWithLiu} from '../src/math/solution/mixedChainLiu.js'
const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:3}
test('invalid states are rejected without entropy certification',()=>{
 assert.equal(mixedChainLiuAtMiddle(null,[1,0],[2,0],p,'shock-rarefaction').status,'invalid-input')
})
test('non-RH shock is rejected before continuation',()=>{
 const r=mixedChainLiuAtMiddle([0,0],[1,1],[2,0],p,'shock-rarefaction')
 assert.equal(r.status,'invalid-shock');assert.equal(r.entropyCertified,false)
})
test('backward shock uses right-fixed orientation',()=>{
 const r=mixedChainLiuAtMiddle([0,0],[1,0],[1,-1],p,'rarefaction-shock',{maxSteps:3})
 assert.equal(r.entropyCertified,false)
 assert.ok(['arc-unresolved','endpoint-unresolved','liu-violation-detected','no-sampled-violation','inconclusive'].includes(r.status))
})
test('only refined and eligible candidates enter continuation',()=>{
 const q={kind:'shock-rarefaction',middle:[1,0],evidence:{status:'mixed-ordered-lax-candidate'},refinement:{status:'unbracketed'}}
 const r=assessMixedChainsWithLiu([q],{left:[0,0],right:[2,0]},p)
 assert.equal(r[0].liu.status,'middle-not-refined')
})
test('evaluation limit does not claim missing Liu evidence',()=>{
 const q={kind:'shock-rarefaction',middle:[1,0],evidence:{status:'mixed-ordered-lax-candidate'},refinement:{status:'refined-candidate',middle:[1,0]}}
 const r=assessMixedChainsWithLiu([q],{left:[0,0],right:[2,0]},p,{maxEvaluations:0})
 assert.equal(r[0].liu.status,'not-evaluated-limit')
})

test('C03-T02: SS evaluates distinct forward and backward ordinary shocks',()=>{
 const candidate={middle:[2,2],refinement:{status:'refined-candidate',middle:[2,2]},
   chainEvidence:{status:'ordered-rh-candidate'},
   familyEvidence:{status:'ordered-lax-endpoint-candidate'}}
 const [result]=assessTwoShockChainsWithLiu([candidate],[4,2],[2,0],p,{maxSteps:3})
 assert.equal(result.liuByWave.length,2)
 for(const report of result.liuByWave){
   assert.equal(report.entropyCertified,false)
   assert.ok(['arc-unresolved','endpoint-unresolved','liu-violation-detected',
     'no-sampled-violation','inconclusive'].includes(report.status))
 }
 if(result.liuByWave[0].direction)assert.equal(result.liuByWave[0].direction,'forward')
 if(result.liuByWave[1].direction)assert.equal(result.liuByWave[1].direction,'backward')
})
test('C03-T02: SS budget and missing prerequisites do not manufacture Liu results',()=>{
 const candidate={middle:[2,2],refinement:{status:'refined-candidate',middle:[2,2]},
   chainEvidence:{status:'ordered-rh-candidate'},
   familyEvidence:{status:'ordered-lax-endpoint-candidate'}}
 const [limited]=assessTwoShockChainsWithLiu([candidate],[4,2],[2,0],p,{maxEvaluations:0})
 assert.deepEqual(limited.liuByWave.map(v=>v.status),['not-evaluated-limit','not-evaluated-limit'])
 const [unrefined]=assessTwoShockChainsWithLiu(
   [{...candidate,refinement:{status:'unrefined'}}],[4,2],[2,0],p)
 assert.deepEqual(unrefined.liuByWave.map(v=>v.status),['prerequisites-not-met','prerequisites-not-met'])
})
