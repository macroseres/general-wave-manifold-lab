import test from 'node:test'
import assert from 'node:assert/strict'
import {candidateWaveSpeeds,candidatePhysicalGeometry,candidatePhysicalProfiles} from '../src/geometry/physical/riemannCandidatePhysical.js'

test('two shocks generate two shock rays and no fan',()=>{
 const c={status:'sampled-candidate',kind:'two-shock',speeds:[-1,2],states:[[1,0],[0,0],[-1,0]]}
 const g=candidatePhysicalGeometry(c,{tMax:2})
 assert.deepEqual(g.shocks,[-1,2]);assert.equal(g.fans.length,0)
 assert.ok(g.xMin<-2&&g.xMax>4)
 const profile=candidatePhysicalProfiles(c,{time:1,count:60})
 assert.equal(profile.points[0].u,1);assert.equal(profile.points.at(-1).u,-1)
})
test('mixed chain creates fan and shock rays',()=>{
 const c={status:'sampled-candidate',kind:'rarefaction-shock',fanSpeeds:[0,1],fanStates:[[0,0],[1,0]],shockSpeed:2,left:[0,0],middle:[1,0],right:[2,0]}
 const g=candidatePhysicalGeometry(c,{tMax:1})
 assert.deepEqual(g.shocks,[2]);assert.deepEqual([g.fans[0].left,g.fans[0].right],[0,1]);assert.equal(g.fans[0].rays.length,13)
 const p=candidatePhysicalProfiles(c,{time:1,count:80});assert.ok(p.points.some(q=>q.u>0&&q.u<1))
})
test('rejects missing and nonfinite wave speeds',()=>{
 assert.equal(candidateWaveSpeeds({status:'unverified-chain'}),null)
 assert.equal(candidatePhysicalGeometry({status:'sampled-candidate',kind:'shock-rarefaction',shockSpeed:NaN,fanSpeeds:[0,1]}),null)
 assert.equal(candidatePhysicalProfiles(null),null)
})

test('one-sided traces for two shocks preserve intermediate state',()=>{
 const c={status:'sampled-candidate',kind:'two-shock',speeds:[-1,2],states:[[3,4],[1,2],[-1,-2]]}
 const profile=candidatePhysicalProfiles(c,{time:2,count:3})
 assert.deepEqual(profile.shockTraces.map(q=>[q.x,q.left,q.right]),[[-2,[3,4],[1,2]],[4,[1,2],[-1,-2]]])
})
test('one-sided traces for mixed chains have physical orientation',()=>{
 const common={status:'sampled-candidate',fanSpeeds:[0,1],fanStates:[[0,0],[1,2]],shockSpeed:2,left:[0,0],middle:[1,2],right:[3,4]}
 const a=candidatePhysicalProfiles({...common,kind:'rarefaction-shock'},{time:1})
 const b=candidatePhysicalProfiles({...common,kind:'shock-rarefaction'},{time:1})
 assert.deepEqual(a.shockTraces[0].left,[1,2]);assert.deepEqual(a.shockTraces[0].right,[3,4])
 assert.deepEqual(b.shockTraces[0].left,[0,0]);assert.deepEqual(b.shockTraces[0].right,[1,2])
})

test('fixed tMax keeps physical profile x range stable while shock positions move',()=>{
 const c={status:'sampled-candidate',kind:'two-shock',speeds:[-1,2],states:[[1,0],[0,0],[-1,0]]}
 const early=candidatePhysicalProfiles(c,{time:0.25,tMax:1})
 const late=candidatePhysicalProfiles(c,{time:0.75,tMax:1})
 assert.equal(early.xMin,late.xMin)
 assert.equal(early.xMax,late.xMax)
 assert.deepEqual(early.shockTraces.map(s=>s.x),[-0.25,0.5])
 assert.deepEqual(late.shockTraces.map(s=>s.x),[-0.75,1.5])
})
