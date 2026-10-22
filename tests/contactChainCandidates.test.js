import test from 'node:test'
import assert from 'node:assert/strict'
import {constantContactDirections,constantContactConnection,contactChainCandidates} from '../src/math/solution/contactChainCandidates.js'
import {evaluateSelfSimilarCandidate} from '../src/math/solution/riemannSelfSimilarCandidate.js'
import {candidatePhysicalGeometry,candidatePhysicalProfiles} from '../src/geometry/physical/riemannCandidatePhysical.js'
import {compareRiemannCandidates} from '../src/math/solution/riemannCandidateComparison.js'
import {groupRiemannCandidates} from '../src/math/solution/riemannCandidateGroups.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'

const zero={a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
const fastContact={...zero,a20:.5,b01:3}
const slowContact={...zero,a10:1,b02:.5,b01:3}
const linear={...zero,a10:1,b01:2}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`)

test('constant contact model is checked in the quadratic coefficients',()=>{
  const models=constantContactDirections(fastContact)
  assert.equal(models.length,1)
  assert.deepEqual(models[0].direction,[0,1]);close(models[0].speed,3)
  assert.ok(constantContactConnection([2,0],[2,1],fastContact,'fast'))
  assert.equal(constantContactConnection([2,0],[2,1],fastContact,'slow'),null)
  assert.equal(constantContactConnection([3,0],[3,1],fastContact,'fast'),null)
  assert.equal(constantContactConnection([2,0],[2,0],fastContact,'fast'),null)
  assert.equal(constantContactConnection([2,0],[2.1,1],fastContact,'fast'),null)
})

test('an isolated sonic connection is not classified as an LD contact',()=>{
  const triangular={...zero,a20:.5,b02:.5,b10:.75}
  assert.deepEqual(constantContactDirections(triangular),[])
  assert.equal(constantContactConnection([0,.75],[0,-.75],triangular,'fast'),null)
  assert.deepEqual(constantContactDirections({...zero,a01:-1,b10:1}),[])
})

test('RC builds a slow fan and a fast contact with the correct right trace',()=>{
  const states={left:[1,0],right:[2,1]}
  const [q]=contactChainCandidates(states,[{side:'left',family:'slow',sign:1,points:[[1,0],[1.5,0],[2.5,0]]}],{},fastContact)
  assert.equal(q.pattern,'RC');assert.deepEqual(q.middle,[2,0])
  assert.deepEqual(q.segments.map(s=>s.type),['rarefaction','contact'])
  assert.deepEqual(evaluateSelfSimilarCandidate(q,.5),[1,0])
  assert.deepEqual(evaluateSelfSimilarCandidate(q,1.5),[1.5,0])
  assert.deepEqual(evaluateSelfSimilarCandidate(q,2.5),[2,0])
  assert.deepEqual(evaluateSelfSimilarCandidate(q,3),[2,1])
  assert.equal(q.entropyCertified,false)
})

test('SC accepts a slow Lax shock followed by a fast contact, never a contact Lax check',()=>{
  const [q]=contactChainCandidates({left:[2,0],right:[1,1]},[],{},fastContact)
  assert.equal(q.pattern,'SC');assert.deepEqual(q.middle,[1,0])
  assert.deepEqual(q.segments.map(s=>s.type),['shock','contact'])
  assert.equal(q.provenance.intersection,'affine-rh-on-contact-line')
  close(q.segments[0].speed,1.5);close(q.segments[1].speed,3)
  assert.deepEqual(evaluateSelfSimilarCandidate(q,1.5),[1,0])
  const geometry=candidatePhysicalGeometry(q)
  assert.deepEqual(geometry.shocks,[1.5]);assert.deepEqual(geometry.contacts,[3])
})

test('CR and CS preserve the slow contact before the fast family',()=>{
  const [cr]=contactChainCandidates({left:[0,0],right:[1,1]},[
    {side:'right',family:'fast',sign:-1,points:[[1,1],[1,.5],[1,-.5]]}],{},slowContact)
  assert.equal(cr.pattern,'CR');assert.deepEqual(cr.middle,[1,0])
  assert.deepEqual(evaluateSelfSimilarCandidate(cr,2),[1,0])
  const U=evaluateSelfSimilarCandidate(cr,3.5);close(U[0],1);close(U[1],.5)
  const [cs]=contactChainCandidates({left:[0,1],right:[1,0]},[],{},slowContact)
  assert.equal(cs.pattern,'CS');assert.deepEqual(cs.middle,[1,1])
  assert.deepEqual(cs.segments.map(s=>s.type),['contact','shock'])
  close(cs.segments[1].speed,3.5)
})

test('CC is constructed analytically for two linearly degenerate families',()=>{
  const [q]=contactChainCandidates({left:[0,0],right:[1,1]},[],{},linear)
  assert.equal(q.pattern,'CC');assert.deepEqual(q.middle,[1,0])
  assert.deepEqual(q.segments.map(s=>s.speed),[1,2])
  assert.deepEqual(evaluateSelfSimilarCandidate(q,.5),[0,0])
  assert.deepEqual(evaluateSelfSimilarCandidate(q,1),[1,0])
  assert.deepEqual(evaluateSelfSimilarCandidate(q,2),[1,1])
  const data=candidatePhysicalProfiles(q,{time:2,count:1})
  assert.deepEqual(data.shockTraces,[])
  assert.equal(data.contactTraces.length,2)
  assert.deepEqual(data.jumpTraces.map(j=>[j.x,j.left,j.right]),[[2,[0,0],[1,0]],[4,[1,0],[1,1]]])
  const [c]=compareRiemannCandidates([q],linear)
  assert.deepEqual(c.shockSpeeds,[]);assert.deepEqual(c.contactSpeeds,[1,2]);assert.equal(c.lax,'not-applicable')
  const grouped=groupRiemannCandidates([q,structuredClone(q)])
  assert.equal(grouped[0].groupId,grouped[1].groupId)
})

test('CC also handles eigenvectors not aligned with state axes',()=>{
  const p={...zero,a10:2,a01:1,b10:1,b01:2}
  const [q]=contactChainCandidates({left:[0,0],right:[2,0]},[],{},p)
  assert.equal(q.pattern,'CC')
  close(q.middle[0],1);close(q.middle[1],-1)
  close(q.segments[0].speed,1);close(q.segments[1].speed,3)
})

test('contact search accepts integrated rarefactions but rejects reversed fans and malformed data',()=>{
  const states={left:[1,0],right:[2,1]}
  const branches=riemannMonotoneRarefactions(states,fastContact,{maxLength:2,step:.03,maxSteps:100})
  assert.ok(contactChainCandidates(states,branches,{},fastContact).some(q=>q.pattern==='RC'))
  const alternatives=contactChainCandidates({left:[2,0],right:[1,1]},[
    {side:'left',family:'slow',points:[[2,0],[.5,0]]}],{},fastContact)
  assert.ok(!alternatives.some(q=>q.pattern==='RC'))
  assert.ok(alternatives.some(q=>q.pattern==='SC'))
  assert.deepEqual(contactChainCandidates(states,[],{},fastContact),[])
  assert.deepEqual(contactChainCandidates(states,[],{},null),[])
  assert.deepEqual(contactChainCandidates(null,[],{},linear),[])
  assert.deepEqual(contactChainCandidates(states,branches,{},fastContact,{speedTolerance:-1}),[])
})
