import test from 'node:test'
import assert from 'node:assert/strict'
import {oldWavePreset,flux} from '../src/math/flux/quadraticFlux.js'
import {quadraticSonicPartners} from '../src/math/solution/sonicPartners.js'
import {compositeBlockChainCandidates} from '../src/math/solution/compositeBlockChainCandidates.js'
import {traceStateRarefaction} from '../src/math/rarefaction/stateIntegralCurves.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {candidatePhysicalGeometry,candidatePhysicalProfiles} from '../src/geometry/physical/riemannCandidatePhysical.js'
import {evaluateSelfSimilarCandidate} from '../src/math/solution/riemannSelfSimilarCandidate.js'
import {compareRiemannCandidates} from '../src/math/solution/riemannCandidateComparison.js'
import {groupRiemannCandidates} from '../src/math/solution/riemannCandidateGroups.js'

const p=oldWavePreset({B2:0})
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`)
export function krFixture(){
  const left=traceStateRarefaction([1,-1],p,'slow',-1,{step:.01,maxLength:.15}).points.at(-1)
  const right=traceStateRarefaction([1,1],p,'fast',1,{step:.01,maxLength:.15}).points.at(-1)
  const states={left,right},branches=riemannMonotoneRarefactions(states,p,{step:.01,maxLength:.6,maxSteps:100})
  return {p,states,branches}
}

test('state sonic partner equations recover nontrivial slow and fast quadratic jumps',()=>{
  const slow=quadraticSonicPartners([1,-1],p,'slow','left')
  assert.ok(slow.some(q=>Math.hypot(q.point[0]-1,q.point[1]-1)<1e-8))
  const fast=quadraticSonicPartners([(1-Math.sqrt(71))/7,0],p,'fast','right')
  assert.ok(fast.some(q=>Math.hypot(q.point[0]+1,q.point[1]+1)<1e-8))
  for(const q of [...slow,...fast]){
    const a=flux(q.from,p),b=flux(q.to,p)
    for(let i=0;i<2;i++)close(b[i]-a[i],q.speed*(q.to[i]-q.from[i]))
    assert.equal(q.evidence.passes,true)
  }
})

test('KR constructs a slow R-S composite followed by a fast rarefaction without chart fibres',()=>{
  const {states,branches}=krFixture()
  const found=compositeBlockChainCandidates(states,branches,{},p,{maxSourceSamples:48})
  const q=found.find(q=>q.pattern==='KR')
  assert.ok(q);close(q.middle[0],1);close(q.middle[1],1)
  assert.deepEqual(q.blocks.map(b=>b.type),['K','R'])
  assert.deepEqual(q.segments.map(s=>s.type),['rarefaction','shock','rarefaction'])
  close(q.blocks[0].sonicJunction[0],1);close(q.blocks[0].sonicJunction[1],-1)
  assert.equal(q.entropyCertified,false);assert.equal(q.search.complete,false)
  const geometry=candidatePhysicalGeometry(q)
  assert.equal(geometry.fans.length,2);assert.equal(geometry.shocks.length,1)
  const profile=candidatePhysicalProfiles(q,{time:1})
  assert.equal(profile.jumpTraces.length,1)
  const speed=q.segments[1].speed
  evaluateSelfSimilarCandidate(q,speed).forEach((v,i)=>close(v,q.middle[i]))
  const [c]=compareRiemannCandidates([q],p)
  assert.ok(c.speedGap>8);assert.equal(c.shockSpeeds.length,1)
  const g=groupRiemannCandidates([q,structuredClone(q)])
  assert.equal(g[0].groupId,g[1].groupId)
})

test('RK constructs a slow rarefaction then a fast S-R composite',()=>{
  const middle=[-1,-1],junction=[(1-Math.sqrt(71))/7,0]
  const left=traceStateRarefaction(middle,p,'slow',-1,{step:.01,maxLength:.15}).points.at(-1)
  const right=traceStateRarefaction(junction,p,'fast',1,{step:.01,maxLength:.15}).points.at(-1)
  const states={left,right},branches=riemannMonotoneRarefactions(states,p,{step:.01,maxLength:.6,maxSteps:100})
  const q=compositeBlockChainCandidates(states,branches,{},p,{maxSourceSamples:48}).find(q=>q.pattern==='RK')
  assert.ok(q);close(q.middle[0],-1);close(q.middle[1],-1)
  assert.deepEqual(q.blocks.map(b=>b.type),['R','K'])
  assert.equal(q.blocks[1].construction,'shock-rarefaction')
})

test('composite search rejects missing inputs and does not manufacture K for separated Burgers/contact fields',()=>{
  assert.deepEqual(compositeBlockChainCandidates(null,[],{},p),[])
  assert.deepEqual(compositeBlockChainCandidates({left:[1,0],right:[2,1]},[],{},p,{stateTolerance:-1}),[])
  const b={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:3}
  const states={left:[1,0],right:[2,1]},branches=riemannMonotoneRarefactions(states,b,{maxSteps:40,maxLength:1})
  assert.deepEqual(compositeBlockChainCandidates(states,branches,{},b),[])
})

test('SK and KS retain strict ordinary shocks separately from sonic shocks inside K',()=>{
  const middle=[-1,-1],junction=[(1-Math.sqrt(71))/7,0]
  const right=traceStateRarefaction(junction,p,'fast',1,{step:.01,maxLength:.15}).points.at(-1)
  const states={left:[-.8,-1],right},branches=riemannMonotoneRarefactions(states,p,{step:.01,maxLength:.6,maxSteps:100})
  const sk=compositeBlockChainCandidates(states,branches,{left:[{points:[[...states.left],middle,[-1.2,-1]]}]},p).find(q=>q.pattern==='SK')
  assert.ok(sk);assert.deepEqual(sk.segments.map(s=>s.type),['shock','shock','rarefaction'])
  assert.ok(sk.segments[0].speed<sk.segments[1].speed)
  const {states:krStates}=krFixture(),end=[105/113,111/113]
  const ks=compositeBlockChainCandidates({left:krStates.left,right:end},[
    {side:'left',family:'slow',sign:1,points:[krStates.left,[1,-1]]}],{right:[{points:[end,[1,1]]}]},p).find(q=>q.pattern==='KS')
  assert.ok(ks);assert.deepEqual(ks.segments.map(s=>s.type),['rarefaction','shock','shock'])
  assert.ok(ks.segments[1].speed<ks.segments[2].speed)
})

test('T05: KR composite has an explicit sonic junction, conserved jump and ordered elementary speeds',()=>{
  const {states,branches}=krFixture()
  const q=compositeBlockChainCandidates(states,branches,{},p,{maxSourceSamples:48}).find(x=>x.pattern==='KR')
  assert.ok(q)
  assert.deepEqual(q.segments[0].from,states.left)
  assert.deepEqual(q.segments.at(-1).to,states.right)
  assert.deepEqual(q.segments[0].to,q.blocks[0].sonicJunction)
  assert.deepEqual(q.segments[1].from,q.blocks[0].sonicJunction)
  q.segments[1].to.forEach((value,i)=>close(value,q.middle[i]))
  q.segments[2].from.forEach((value,i)=>close(value,q.middle[i]))
  const jump=q.segments[1],leftFlux=flux(jump.from,p),rightFlux=flux(jump.to,p)
  for(let i=0;i<2;i++)close(rightFlux[i]-leftFlux[i],jump.speed*(jump.to[i]-jump.from[i]))
  assert.ok(q.segments[0].speeds.at(-1)<=jump.speed+1e-6)
  assert.ok(jump.speed<q.segments[2].speeds[0])
  assert.equal(q.blocks[0].construction,'rarefaction-shock')
  assert.equal(q.evidence.liu,'not-evaluated')
  assert.equal(q.entropyCertified,false)
})

test('T05: the seven formal K patterns remain distinct from evidence of positive fixtures',()=>{
  const catalog=['RK','KR','SK','KS','CK','KC','KK']
  assert.equal(new Set(catalog).size,7)
  const {states,branches}=krFixture()
  const found=compositeBlockChainCandidates(states,branches,{},p,{maxSourceSamples:48})
  assert.ok(found.some(q=>q.pattern==='KR'))
  for(const q of found){
    assert.ok(catalog.includes(q.pattern))
    assert.equal(q.blocks.length,2)
    assert.equal(q.blocks.map(b=>b.type).join(''),q.pattern)
    assert.ok(q.blocks.some(b=>b.type==='K'))
    assert.equal(q.search.complete,false)
    assert.equal(q.entropyCertified,false)
  }
  // This bounded fixture is not a completeness test for CK, KC or KK.
})
