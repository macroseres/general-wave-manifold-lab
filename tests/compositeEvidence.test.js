import test from 'node:test'
import assert from 'node:assert/strict'
import {compositeEvidence,classifyCompositeEvidence} from '../src/math/solution/compositeEvidence.js'
const forward={kind:'shock-rarefaction',contactSide:'left',status:'weak-lax-candidate'}
const backward={kind:'rarefaction-shock',contactSide:'right',status:'weak-lax-candidate'}
test('both orientations share the same conservative evidence classification',()=>{
 for(const q of [forward,backward]){
  const r=compositeEvidence({...q,liuStatus:'no-violation-detected'})
  assert.equal(r.classification,'no-violation-in-finite-tests');assert.equal(r.entropyCertified,false)
 }
})
test('a detected Liu violation overrides otherwise compatible evidence',()=>{
 const r=compositeEvidence({...backward,liuStatus:'violation-detected'})
 assert.equal(r.classification,'numerical-liu-violation')
})
test('geometric and weak Lax evidence remain distinct',()=>{
 const r=compositeEvidence({...forward,status:'ordered-geometric-candidate',liuStatus:'not-evaluated'})
 assert.equal(r.geometricOrdering,'compatible-in-sampled-trajectory')
 assert.equal(r.weakLax,'not-established')
 assert.equal(r.classification,'weak-lax-unverified')
})
test('unmatched orientation is never considered established',()=>{
 const r=compositeEvidence({...forward,contactSide:'right',liuStatus:'no-violation-detected'})
 assert.equal(r.classification,'unsupported-orientation');assert.equal(r.entropyCertified,false)
})
test('batch classification preserves prior diagnostics and handles empty input',()=>{
 assert.deepEqual(classifyCompositeEvidence(null),[])
 const [r]=classifyCompositeEvidence([{...forward,liuStatus:'inconclusive',liuReason:'arc missing'}])
 assert.equal(r.liuReason,'arc missing');assert.equal(r.evidence.classification,'inconclusive')
})
