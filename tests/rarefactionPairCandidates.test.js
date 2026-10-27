import test from 'node:test'
import assert from 'node:assert/strict'
import {rarefactionPairCandidates,searchRarefactionPairs} from '../src/math/solution/rarefactionPairCandidates.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {evaluateSelfSimilarCandidate} from '../src/math/solution/riemannSelfSimilarCandidate.js'
import {candidatePhysicalGeometry,candidatePhysicalProfiles} from '../src/geometry/physical/riemannCandidatePhysical.js'
import {compareRiemannCandidates} from '../src/math/solution/riemannCandidateComparison.js'
import {groupRiemannCandidates} from '../src/math/solution/riemannCandidateGroups.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:.75,b01:0}
const states={left:[0,-1],right:[1,.25]}
const branches=[
  {side:'left',family:'slow',sign:1,points:[[0,-1],[0,-.8],[0,-.6]]},
  {side:'right',family:'fast',sign:-1,points:[[1,.25],[.5,-.25],[-.5,-1.25]]},
]
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`)

test('RR constructs two oriented fans and the shared triangular intermediate state',()=>{
  const [q]=rarefactionPairCandidates(states,branches,p)
  assert.ok(q)
  close(q.middle[0],0);close(q.middle[1],-.75)
  assert.deepEqual(q.fans.map(f=>f.family),['slow','fast'])
  assert.equal(q.entropyCertified,false)
  assert.equal(q.search.complete,false)
  for(const [xi,expected] of [[-2,[0,-1]],[-.9,[0,-.9]],[-.4,[0,-.75]],[.4,[.4,-.35]],[2,[1,.25]]]){
    const U=evaluateSelfSimilarCandidate(q,xi)
    U.forEach((v,i)=>close(v,expected[i]))
  }
  const geometry=candidatePhysicalGeometry(q)
  assert.equal(geometry.fans.length,2);assert.deepEqual(geometry.shocks,[])
  const profile=candidatePhysicalProfiles(q,{time:1})
  assert.equal(profile.shockTraces.length,0)
  assert.ok(profile.points.every(v=>Number.isFinite(v.u)&&Number.isFinite(v.v)))
})

test('RR search works with numerically integrated state branches',()=>{
  const traced=riemannMonotoneRarefactions(states,p,{step:.03,maxLength:2,maxSteps:100})
  const found=rarefactionPairCandidates(states,traced,p)
  assert.ok(found.length>0)
  close(found[0].middle[0],0);close(found[0].middle[1],-.75)
})

test('RR rejects reversed fans, wrong families and traces not anchored at the data',()=>{
  assert.deepEqual(rarefactionPairCandidates({left:[0,-.6],right:states.right},[
    {...branches[0],points:[[0,-.6],[0,-1]]},branches[1]],p),[])
  assert.deepEqual(rarefactionPairCandidates(states,[{...branches[0],family:'fast'},branches[1]],p),[])
  assert.deepEqual(rarefactionPairCandidates({...states,left:[0,-2]},branches,p),[])
  assert.deepEqual(rarefactionPairCandidates(null,branches,p),[])
})

test('RR does not invent characteristic curves or fans from constant-speed contacts',()=>{
  const unrelated=[{...branches[0],points:[[0,-1],[.5,-.5]]},branches[1]]
  assert.deepEqual(rarefactionPairCandidates(states,unrelated,p),[])
  const linear={...p,a20:0,a10:1,b02:0,b10:0,b01:2}
  assert.deepEqual(rarefactionPairCandidates({left:[0,0],right:[1,1]},[
    {...branches[0],points:[[0,0],[1,0]]},{...branches[1],points:[[1,1],[1,0]]}],linear),[])
})

test('RR comparison and grouping do not invent shocks or RH residuals',()=>{
  const [q]=rarefactionPairCandidates(states,branches,p)
  const [comparison]=compareRiemannCandidates([q],p)
  assert.equal(comparison.status,'numerical-candidate')
  assert.deepEqual(comparison.shockSpeeds,[])
  assert.equal(comparison.maxRelativeShockResidual,null)
  assert.equal(comparison.lax,'not-applicable')
  const groups=groupRiemannCandidates([q,structuredClone(q)])
  assert.equal(groups[0].groupId,groups[1].groupId)
})

test('RR report distinguishes invalid inputs, missing branches and an exhausted seed search',()=>{
  assert.equal(searchRarefactionPairs(null,branches,p).report.status,'invalid-input')
  assert.equal(searchRarefactionPairs(states,branches,p,{maxCandidates:0}).report.status,'invalid-input')
  assert.equal(searchRarefactionPairs(states,branches,p,{corrector:null}).report.status,'invalid-input')
  assert.equal(searchRarefactionPairs(states,[],p,{corrector:{integrationStep:0}}).report.status,'invalid-input')
  assert.equal(searchRarefactionPairs(states,[],p).report.status,'incompatible-branches')
  const q=searchRarefactionPairs(states,[{...branches[0],points:[[0,-1],[0,-.9]]},branches[1]],p)
  assert.deepEqual(q.candidates,[])
  assert.equal(q.report.status,'no-candidates-found')
  assert.equal(q.report.stopReason,'supplied-branches-exhausted')
  assert.equal(q.report.seedSearchExhausted,true)
  assert.equal(q.report.complete,false)
  assert.equal(q.report.tolerances.corrector.integrationStep,.01)
})

test('RR report preserves inconclusive Newton diagnostics instead of implying nonexistence',()=>{
  const q=searchRarefactionPairs(states,branches,p,{corrector:{conditioningTolerance:1}})
  assert.deepEqual(q.candidates,[])
  assert.equal(q.report.status,'inconclusive')
  assert.equal(q.report.diagnostics[0].status,'ill-conditioned')
  assert.equal(q.report.diagnostics[0].classification,'inconclusive')
  assert.ok(Number.isFinite(q.report.diagnostics[0].refinement.residual))
  assert.deepEqual(q.report.diagnostics[0].seed,{aIndex:1.25,bIndex:1.5})
})

test('RR report preserves numerical integration failures and branch termination metadata',()=>{
  const q=searchRarefactionPairs(states,[{...branches[0],parameters:[0,2,4],stop:'max-steps'},branches[1]],p)
  assert.equal(q.report.status,'numerical-failure')
  assert.equal(q.report.diagnostics[0].status,'integration-failed')
  assert.equal(q.report.branches[0].stop,'max-steps')
  assert.equal(q.report.branches[0].parameterExtent,4)
  const failed=searchRarefactionPairs(states,[{...branches[0],points:[[0,-1]],stop:'integration-tolerance'},branches[1]],p)
  assert.equal(failed.report.status,'numerical-failure')
  const unrelated=searchRarefactionPairs(states,[{...branches[0],family:'fast',stop:'integration-tolerance'},
    {...branches[0],points:[[0,-1],[0,-.9]]},branches[1]],p)
  assert.equal(unrelated.report.status,'no-candidates-found')
  assert.equal(unrelated.report.branches[0].rejectionReason,'not-rr-family')
})

test('RR candidate cap records unvisited branch pairs and shares its report with candidates',()=>{
  const q=searchRarefactionPairs(states,[...branches,{...branches[1]}],p,{maxCandidates:1})
  assert.equal(q.candidates.length,1)
  assert.equal(q.report.stopReason,'candidate-limit')
  assert.equal(q.report.candidateLimitReached,true)
  assert.equal(q.report.seedSearchExhausted,false)
  assert.equal(q.report.pairs[1].status,'not-explored')
  assert.equal(q.report.pairs[1].seedsFound,null)
  assert.equal(q.candidates[0].search.report,q.report)
  assert.equal(q.report.complete,false)
  assert.doesNotThrow(()=>JSON.stringify(q))
  const partial=searchRarefactionPairs(states,[branches[0],{...branches[1],
    points:[...branches[1].points,[.5,-.05]]}],p,{maxCandidates:1})
  assert.equal(partial.report.pairs[0].status,'partially-examined')
  assert.equal(partial.report.pairs[0].unexaminedSeeds.length,1)
  const exact=searchRarefactionPairs(states,branches,p,{maxCandidates:1})
  assert.equal(exact.report.candidateLimitReached,true)
  assert.equal(exact.report.seedSearchExhausted,true)
  assert.equal(exact.report.complete,false)
})

test('RR report retains seed warnings, inconsistent trace failures and array compatibility',()=>{
  const input=[...branches,{...branches[1]}]
  const q=searchRarefactionPairs(states,input,p)
  assert.equal(q.report.candidateCount,1)
  assert.ok(q.report.diagnostics.some(d=>d.status==='duplicate-candidate'))
  assert.deepEqual(rarefactionPairCandidates(states,input,p),q.candidates)
  const rejected=searchRarefactionPairs(states,[{...branches[0],points:[[0,-1],[.5,0]]},branches[1]],p)
  assert.equal(rejected.report.diagnostics[0].status,'sampled-fan-warning')
  assert.equal(rejected.report.diagnostics[0].classification,'seed-warning')
  assert.equal(rejected.report.diagnostics[1].status,'branch-trace-mismatch')
  assert.deepEqual(rejected.candidates,[])
  assert.equal(rejected.report.status,'inconclusive')
})
