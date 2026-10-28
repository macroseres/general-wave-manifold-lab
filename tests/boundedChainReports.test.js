import test from 'node:test'
import assert from 'node:assert/strict'
import {contactChainCandidates,searchContactChains} from '../src/math/solution/contactChainCandidates.js'
import {compositeBlockChainCandidates,searchCompositeBlockChains} from '../src/math/solution/compositeBlockChainCandidates.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {stateAuditFixtures} from '../scripts/audit-state-construction.js'
import {boundedSearchReport,recordSearchAttempt} from '../src/math/solution/boundedSearchReport.js'

test('contact reports preserve the candidates and explain rejected expansive/shock alternatives',()=>{
  for(const fixture of stateAuditFixtures().filter(q=>['RC','SC','CR','CS','CC'].includes(q.pattern))){
    const {states,p,pattern}=fixture,branches=riemannMonotoneRarefactions(states,p)
    const {candidates,report}=searchContactChains(states,branches,{},p)
    assert.deepEqual(candidates,contactChainCandidates(states,branches,{},p))
    assert.ok(candidates.some(q=>q.pattern===pattern),pattern)
    assert.equal(report.selectable,candidates.length)
    assert.equal(report.complete,false)
    assert.equal(Object.values(report.reasonCounts).reduce((a,b)=>a+b,0),report.attemptCount)
    assert.ok(report.attempts.some(q=>q.status==='sampled-candidate'))
    assert.ok(report.attempts.some(q=>q.status!=='sampled-candidate'))
  }
})

test('composite reports preserve KR and expose finite intersection/reconstruction outcomes',()=>{
  const {states,p}=stateAuditFixtures().find(q=>q.pattern==='KR')
  const branches=riemannMonotoneRarefactions(states,p,{step:.01,maxLength:.6,maxSteps:100})
  const {candidates,report}=searchCompositeBlockChains(states,branches,{},p)
  assert.deepEqual(candidates,compositeBlockChainCandidates(states,branches,{},p))
  assert.ok(candidates.some(q=>q.pattern==='KR'))
  assert.equal(report.selectable,candidates.length)
  assert.ok(report.sonicCurves>0)
  assert.equal(Object.values(report.reasonCounts).reduce((a,b)=>a+b,0),report.attemptCount)
  assert.ok(report.attempts.some(q=>q.status==='sampled-candidate'))
  const rejected=searchCompositeBlockChains(states,branches,{right:[{points:[[20,20],[21,21]]}]},p).report
  assert.ok(rejected.attempts.some(q=>q.status!=='sampled-candidate'))
})

test('unsupported models and invalid inputs receive explicit statuses',()=>{
  const {states,p}=stateAuditFixtures().find(q=>q.pattern==='SS')
  assert.equal(searchContactChains(states,[],{},p).report.reasonCounts['no-constant-contact-model'],1)
  assert.equal(searchCompositeBlockChains(states,[],{},p).report.reasonCounts['no-sampled-composite-curve'],1)
  assert.equal(searchContactChains(null,[],{},p).report.status,'invalid-input')
  assert.equal(searchCompositeBlockChains(null,[],{},p).report.status,'invalid-input')
})

test('diagnostic detail storage is bounded without dropping outcome counts',()=>{
  const report=boundedSearchReport()
  for(let i=0;i<200;i++)recordSearchAttempt(report,'KK','no-sampled-intersection')
  assert.equal(report.attemptCount,200)
  assert.equal(report.reasonCounts['no-sampled-intersection'],200)
  assert.equal(report.attempts.length,128)
  assert.equal(report.detailsTruncated,true)
})
