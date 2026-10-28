import test from 'node:test'
import assert from 'node:assert/strict'
import {auditStateWorkspace,reportedEmptyCase,comparisonAuditCase} from '../scripts/audit-state-construction.js'
import {stateConstructionSearch} from '../src/math/solution/stateConstructionSearch.js'
import {constructionRarefactionBranches} from '../src/math/solution/stateConstructionSampling.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {classifyLaxShock} from '../src/math/solution/twoShockFamilyEvidence.js'
import {directShockDiagnostic} from '../src/math/solution/directShockDiagnostic.js'
import {candidateStateGeometry} from '../src/geometry/state/candidateStateGeometry.js'
import {compareRiemannCandidates} from '../src/math/solution/riemannCandidateComparison.js'

test('reported empty case recovers SR under finer sampling, with RH, Lax and ordered fan preserved',()=>{
  const {states,p}=reportedEmptyCase
  const profiles=[]
  for(const step of [.02,.01,.005]){
    const branches=riemannMonotoneRarefactions(states,p,{step,maxSteps:Math.ceil(12/step)*2,maxLength:12})
    const result=stateConstructionSearch(states,branches,{},p,true)
    const profile=result.allProfiles.find(q=>q.pattern==='SR')
    assert.ok(profile,`SR missing at step ${step}`)
    const jump=directShockDiagnostic(states.left,profile.middle,p)
    assert.equal(jump.rankineHugoniot,true)
    assert.ok(jump.relativeResidual<1e-8)
    assert.ok(classifyLaxShock(states.left,profile.middle,p).families.includes('slow'))
    assert.ok(profile.shockSpeed<profile.fanSpeeds[0])
    assert.ok(profile.fanSpeeds.every((v,i)=>i===0||v>profile.fanSpeeds[i-1]))
    assert.equal(candidateStateGeometry(profile,p).complete,true)
    profiles.push(profile)
  }
  assert.ok(Math.hypot(...profiles[0].middle.map((v,i)=>v-profiles[2].middle[i]))<1e-7)
  const integrated=stateConstructionSearch(states,constructionRarefactionBranches(states,p),{},p,true)
  assert.ok(integrated.allProfiles.some(q=>q.pattern==='SR'))
})

test('all 13 documented positive patterns are selectable and render complete finite state geometry',async()=>{
  const rows=await auditStateWorkspace()
  const expected={RR:[0,2,0],RS:[1,1,0],SR:[1,1,0],SS:[2,0,0],RC:[0,1,1],SC:[1,0,1],
    CR:[0,1,1],CS:[1,0,1],CC:[0,0,2],RK:[1,2,0],SK:[2,1,0],KR:[1,2,0],KS:[2,1,0]}
  assert.equal(rows.length,13)
  for(const row of rows){
    assert.notEqual(row.index,null,row.pattern)
    assert.equal(row.selectedGroup,true,row.pattern)
    assert.equal(row.inspection,true,row.pattern)
    assert.equal(row.incomplete,false,row.pattern)
    assert.equal(row.finite,true,row.pattern)
    assert.deepEqual([row.shocks,row.fans,row.contacts],expected[row.pattern],row.pattern)
  }
})

test('comparison retains separate SR and SK segments and reports an unresolved internal shock',()=>{
  const {p,states}=comparisonAuditCase
  const result=stateConstructionSearch(states,constructionRarefactionBranches(states,p),{},p,true)
  const sr=result.allProfiles.find(q=>q.pattern==='SR'),sk=result.allProfiles.find(q=>q.pattern==='SK')
  assert.ok(sr);assert.ok(sk)
  const a=candidateStateGeometry(sr,p),b=candidateStateGeometry(sk,p)
  assert.deepEqual(a.segments.map(q=>q.type),['shock','rarefaction'])
  assert.deepEqual(b.segments.map(q=>q.type),['shock','shock','rarefaction'])
  assert.equal(a.complete,true)
  assert.equal(b.complete,false)
  assert.ok(b.segments.some(q=>q.arc?.status==='continuation-inconclusive'))
  assert.ok(compareRiemannCandidates([sr,sk],p).every(q=>q.entropyCertified===false))
})
