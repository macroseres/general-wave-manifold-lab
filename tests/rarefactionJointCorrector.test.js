import test from 'node:test'
import assert from 'node:assert/strict'
import {rrStudy} from '../scripts/audit-rr-convergence.js'
import {refineRarefactionMiddleJoint} from '../src/math/solution/rarefactionJointCorrector.js'
import {traceStateRarefaction} from '../src/math/rarefaction/stateIntegralCurves.js'
import {rarefactionPairCandidates,evaluateRarefactionPair} from '../src/math/solution/rarefactionPairCandidates.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {candidatePhysicalProfiles} from '../src/geometry/physical/riemannCandidatePhysical.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:.5,b11:0,b02:.5,b10:0,b01:2}
test('RR curved quadratic fluxes converge independently of source sampling',()=>{
  for(const b20 of [.5,1]){
    const study=rrStudy(b20)
    assert.ok(study.referenceDifference<1e-13)
    for(const h of [.08,.04,.02]){
      const rows=study.rows.filter(r=>r.samplingStep===h)
      assert.ok(rows.every(r=>r.residual<4e-13&&r.conditionNumber<10))
      assert.ok(rows.at(-1).middleError<rows[0].middleError/100)
      assert.ok(rows.at(-1).middleError<2e-9)
      assert.ok(rows.at(-1).profileError<rows[0].profileError/10)
    }
  }
})
test('RR shared fan endpoints, plateau and physical profiles use the corrected middle',()=>{
  const states={left:[0,0],right:[.5,.5]},branches=riemannMonotoneRarefactions(states,p,{maxLength:1})
  const [q]=rarefactionPairCandidates(states,branches,p)
  assert.deepEqual(q.fans[0].states.at(-1),q.middle)
  assert.deepEqual(q.fans[1].states[0],q.middle)
  assert.deepEqual(evaluateRarefactionPair(q,1),q.middle)
  for(const time of [.25,1,2])for(const point of candidatePhysicalProfiles(q,{time,count:30}).points)
    assert.deepEqual([point.u,point.v],evaluateRarefactionPair(q,point.x/time))
  assert.equal(q.entropyCertified,false)
  assert.equal(q.search.complete,false)
})
test('RR rejects an intersection outside supplied branch extent and invalid orientation',()=>{
  const left={side:'left',family:'slow',sign:1,points:[[0,0],[.1,-.0025]]}
  const right={side:'right',family:'fast',sign:-1,points:[[.5,.5],[.5,-.2]]}
  const result=refineRarefactionMiddleJoint(left,right,p,{aIndex:.5,bIndex:.5})
  assert.notEqual(result.status,'refined-candidate')
  assert.equal(refineRarefactionMiddleJoint({...left,sign:0},right,p,{aIndex:.5,bIndex:.5}).status,'invalid-branch')
})
test('state trace respects arclength bounds and reports unsatisfied tolerance',()=>{
  const q=traceStateRarefaction([0,0],p,'slow',1,{step:.08,maxLength:.13,boundedLength:true})
  assert.equal(q.parameters.at(-1),.13)
  assert.equal(q.points.length,q.parameters.length)
  const failed=traceStateRarefaction([0,0],p,'slow',1,{step:.5,minStep:.5,tolerance:1e-20})
  assert.equal(failed.stop,'integration-tolerance')
})
test('RR reports poorly transverse characteristic families even at a zero residual',()=>{
  const linear={...p,a20:0,a01:1000,b20:0,b02:0,b01:1}
  const left={side:'left',family:'slow',sign:1,points:[[0,0],[1,0]]}
  const right={side:'right',family:'fast',sign:-1,points:[[1,.001],[0,0]]}
  const q=refineRarefactionMiddleJoint(left,right,linear,{aIndex:0,bIndex:1},{conditioningTolerance:.01})
  assert.equal(q.status,'ill-conditioned')
  assert.ok(q.transversality<.01)
})
test('RR recovers a manufactured intersection with both characteristic curves bent',()=>{
  const general={...p,a02:.1},middle=[.4,-.1]
  const fine={step:.001,tolerance:1e-14,maxSteps:10000,boundedLength:true}
  const slow=traceStateRarefaction(middle,general,'slow',-1,{...fine,maxLength:.3})
  const fast=traceStateRarefaction(middle,general,'fast',-1,{...fine,maxLength:.4})
  const states={left:slow.points.at(-1),right:fast.points.at(-1)}
  // Both traces depart measurably from their initial tangent lines.
  for(const branch of [slow,fast]){
    const a=branch.points[0],b=branch.points[1],c=branch.points.at(-1)
    const deviation=Math.abs((c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0]))/Math.hypot(b[0]-a[0],b[1]-a[1])
    assert.ok(deviation>1e-4)
  }
  const branches=riemannMonotoneRarefactions(states,general,{step:.04,maxLength:.8})
  const [q]=rarefactionPairCandidates(states,branches,general,{corrector:{integrationStep:.01,residualTolerance:1e-13}})
  assert.ok(q)
  assert.ok(Math.hypot(...q.middle.map((x,i)=>x-middle[i]))<1e-9)
  assert.ok(q.refinement.parameters.every((s,i)=>s>=0&&s<=q.refinement.bounds[i]))
})

