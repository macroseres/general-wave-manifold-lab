import test from 'node:test'
import assert from 'node:assert/strict'
import {physicalChainEvidence} from '../src/math/solution/physicalChainEvidence.js'
const profile={status:'sampled-candidate',kind:'rarefaction-shock'}
const source={evidence:{status:'mixed-ordered-lax-candidate'},fanArc:{status:'sampled-fan-ordered',passes:true}}
test('mixed candidate retains necessary checks without entropy certification',()=>{
 const r=physicalChainEvidence(profile,{...source,liu:{status:'no-sampled-violation'}})
 assert.equal(r.status,'necessary-tests-passed');assert.equal(r.entropyCertified,false);assert.equal(r.liu,'no-sampled-violation')
})
test('detected Liu violation overrides endpoint checks',()=>{
 assert.equal(physicalChainEvidence(profile,{...source,liu:{status:'liu-violation-detected'}}).status,'liu-violation-detected')
})
test('missing fan evidence remains unverified',()=>{
 assert.equal(physicalChainEvidence(profile,{...source,fanArc:{passes:false}}).status,'prerequisites-unverified')
})
test('two shocks have no Liu certificate',()=>{
 const r=physicalChainEvidence({status:'sampled-candidate',kind:'two-shock'}, {chainEvidence:{status:'ordered-rh-candidate'},familyEvidence:{status:'ordered-lax-endpoint-candidate'}})
 assert.equal(r.status,'necessary-tests-passed');assert.equal(r.liu,'not-evaluated');assert.equal(r.entropyCertified,false)
})
