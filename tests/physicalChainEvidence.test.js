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
test('two shocks with missing Liu reports remain unverified',()=>{
 const r=physicalChainEvidence({status:'sampled-candidate',kind:'two-shock'}, {chainEvidence:{status:'ordered-rh-candidate'},familyEvidence:{status:'ordered-lax-endpoint-candidate'}})
 assert.equal(r.status,'prerequisites-unverified');assert.equal(r.liu,'not-evaluated');assert.equal(r.entropyCertified,false)
})

const ssProfile={status:'sampled-candidate',kind:'two-shock'}
const ssSource={chainEvidence:{status:'ordered-rh-candidate'},familyEvidence:{status:'ordered-lax-endpoint-candidate'}}
test('C03-T04: unresolved SS Liu cannot pass aggregated necessary checks',()=>{
 const r=physicalChainEvidence(ssProfile,{...ssSource,liuByWave:[{status:'no-sampled-violation'},{status:'arc-unresolved'}]})
 assert.equal(r.status,'prerequisites-unverified')
 assert.deepEqual(r.liuByWave.map(q=>q.status),['no-sampled-violation','arc-unresolved'])
 assert.equal(r.entropyCertified,false)
})
test('C03-T04: both independently sampled SS Liu reports can pass without entropy certification',()=>{
 const r=physicalChainEvidence(ssProfile,{...ssSource,liuByWave:[{status:'no-sampled-violation'},{status:'no-sampled-violation'}]})
 assert.equal(r.status,'necessary-tests-passed')
 assert.equal(r.entropyCertified,false)
})
test('C03-T04: SS Liu violation takes precedence over unresolved report',()=>{
 const r=physicalChainEvidence(ssProfile,{...ssSource,liuByWave:[{status:'liu-violation-detected'},{status:'arc-unresolved'}]})
 assert.equal(r.status,'liu-violation-detected')
 assert.equal(r.entropyCertified,false)
})
test('C03-T04: incomplete and unknown SS Liu reports remain unverified',()=>{
 for(const liuByWave of [[{status:'no-sampled-violation'}],[{status:'no-sampled-violation'},{status:'unexpected'}]]){
  const r=physicalChainEvidence(ssProfile,{...ssSource,liuByWave})
  assert.equal(r.status,'prerequisites-unverified')
  assert.equal(r.entropyCertified,false)
 }
})
