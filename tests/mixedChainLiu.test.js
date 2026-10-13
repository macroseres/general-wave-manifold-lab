import test from 'node:test'
import assert from 'node:assert/strict'
import {mixedChainLiuAtMiddle,assessMixedChainsWithLiu} from '../src/math/solution/mixedChainLiu.js'
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
