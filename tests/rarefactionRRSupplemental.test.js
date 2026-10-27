import test from 'node:test'
import assert from 'node:assert/strict'
import {supplementalRRCase,rrJunctionStudy,referenceV} from '../scripts/audit-rr-convergence.js'
import {searchRarefactionPairs} from '../src/math/solution/rarefactionPairCandidates.js'
import {traceStateRarefaction} from '../src/math/rarefaction/stateIntegralCurves.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'

test('RR corrects coarse curved characteristic seeds despite polygonal fan warnings',()=>{
  for(const [b20,spacing] of [[.5,1],[.5,.4],[1,1]]){
    const {search}=supplementalRRCase(b20,spacing),q=search.candidates[0]
    assert.equal(search.candidates.length,1)
    assert.ok(search.report.diagnostics.some(d=>d.classification==='seed-warning'))
    assert.ok(Math.hypot(q.middle[0]-.5,q.middle[1]-referenceV(.5,b20))<1e-9)
    assert.ok(q.refinement.parameters.every((s,i)=>s>=0&&s<=q.refinement.bounds[i]))
    assert.ok(q.refinement.branchChecks.every(c=>c.status==='sampled-trace-compatible'))
    assert.ok(q.fans.every(f=>f.speeds.every((v,i)=>i===0||v>f.speeds[i-1])))
    assert.ok(q.fans[0].speeds.at(-1)<q.fans[1].speeds[0])
    assert.equal(q.entropyCertified,false)
    assert.equal(search.report.complete,false)
  }
})

test('RR coarse seed correction also recovers a manufactured intersection with both curves bent',()=>{
  const p={a20:.5,a11:0,a02:.1,a10:0,a01:0,b20:.5,b11:0,b02:.5,b10:0,b01:2},middle=[.4,-.1]
  const fine={step:.001,tolerance:1e-14,maxSteps:10000,boundedLength:true}
  const states={left:traceStateRarefaction(middle,p,'slow',-1,{...fine,maxLength:.3}).points.at(-1),
    right:traceStateRarefaction(middle,p,'fast',-1,{...fine,maxLength:.4}).points.at(-1)}
  const branches=riemannMonotoneRarefactions(states,p,{...fine,maxLength:.8}).map(b=>({...b,
    points:[b.points[0],b.points.at(-1)],parameters:[0,b.parameters.at(-1)]}))
  const {candidates,report}=searchRarefactionPairs(states,branches,p)
  assert.equal(candidates.length,1)
  assert.ok(report.diagnostics.some(d=>d.classification==='seed-warning'))
  assert.ok(Math.hypot(...candidates[0].middle.map((v,i)=>v-middle[i]))<1e-9)
})

test('RR midpoint diagnostic separates endpoint displacement, integration error and profile perturbation',()=>{
  for(const tol of [1e-10,1e-4]){
    const r=rrJunctionStudy(tol),j=r.junction
    assert.equal(j.convention,'endpoint-midpoint')
    for(const shift of j.displacements)assert.ok(Math.abs(shift-r.residual/2)<=j.roundoffAllowance)
    assert.ok(j.characteristicSpeedShifts.every(Number.isFinite))
    assert.ok(r.profileDifference>0&&r.profileDifference<2*j.maxDisplacement+j.roundoffAllowance)
    assert.ok(r.profileSamples>=10001)
  }
  const fine=rrJunctionStudy(1e-10),loose=rrJunctionStudy(1e-4)
  assert.ok(fine.middleError>100*fine.junction.maxDisplacement)
  assert.ok(loose.junction.maxDisplacement>1e-7)
  assert.ok(loose.profileDifference>loose.junction.maxDisplacement)
})

test('RR optional absolute junction budget rejects a loose join without changing closure tolerances',()=>{
  const {p,states,branches}=supplementalRRCase(.5,.2)
  const q=searchRarefactionPairs(states,branches,p,{corrector:{residualTolerance:1e-4,joinStateTolerance:1e-8}})
  assert.equal(q.candidates.length,0)
  assert.equal(q.report.status,'inconclusive')
  const d=q.report.diagnostics.find(d=>d.status==='join-tolerance-exceeded')
  assert.ok(d.refinement.junction.maxDisplacement>1e-8)
  const accepted=searchRarefactionPairs(states,branches,p,{corrector:{joinStateTolerance:1e-10}})
  assert.equal(accepted.candidates.length,1)
  assert.equal(searchRarefactionPairs(states,branches,p,{corrector:{joinStateTolerance:-1}}).report.status,'invalid-input')
})

test('RR warns about polygonal geometry but does not accept inconsistent supplied vertices',()=>{
  const {p,states,branches}=supplementalRRCase(.5,1)
  const wrong=[{...branches[0],points:branches[0].points.map((q,i)=>i?[q[0],q[1]-.15]:q)},branches[1]]
  const q=searchRarefactionPairs(states,wrong,p)
  assert.equal(q.candidates.length,0)
  assert.ok(q.report.diagnostics.some(d=>d.status==='branch-trace-mismatch'))
  const reversed=searchRarefactionPairs(states,[{...branches[0],sign:-1},branches[1]],p)
  assert.equal(reversed.candidates.length,0)
})
