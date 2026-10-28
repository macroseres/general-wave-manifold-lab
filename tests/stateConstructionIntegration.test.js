import test from 'node:test'
import assert from 'node:assert/strict'
import {stateConstructionSearch} from '../src/math/solution/stateConstructionSearch.js'
import {candidateStateGeometry,stateShockArc} from '../src/geometry/state/candidateStateGeometry.js'
import {riemannMonotoneRarefactions} from '../src/math/rarefaction/monotoneBranches.js'
import {directShockDiagnostic} from '../src/math/solution/directShockDiagnostic.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
import {traceStateRarefaction} from '../src/math/rarefaction/stateIntegralCurves.js'

const burgers={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:5}
const build=(states,p,requested=true)=>stateConstructionSearch(states,riemannMonotoneRarefactions(states,p),{left:[],right:[]},p,requested)
const near=(a,b)=>assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6)

test('explicit construction stays empty before request and rejects missing states without throwing',()=>{
  const pending=build({left:[2,2],right:[0,0]},burgers,false)
  assert.equal(pending.allProfiles.length,0)
  assert.ok(pending.reports.every(r=>r.status==='not-requested'))
  assert.equal(pending.stateBranches,null)
  const invalid=build({left:null,right:null},burgers)
  assert.ok(invalid.reports.every(r=>r.status==='invalid-input'))
})

test('all four classical patterns are constructible without projected manifold curves',()=>{
  for(const [pattern,left,right] of [['SS',[2,2],[0,0]],['RS',[0,2],[2,0]],['SR',[2,0],[0,2]],['RR',[0,0],[2,2]]]){
    const result=build({left,right},burgers)
    const candidate=result.allProfiles.find(q=>q.pattern===pattern)
    assert.ok(candidate,`${pattern} must be selectable`)
    const geometry=candidateStateGeometry(candidate,burgers)
    assert.equal(geometry.complete,true,`${pattern} has a complete independent state layer`)
    assert.equal(geometry.segments.length,2)
    near(geometry.segments[0].from,left);near(geometry.segments.at(-1).to,right)
    near(geometry.segments[0].to,geometry.segments[1].from)
    for(const segment of geometry.segments.filter(s=>s.type==='shock')){
      near(segment.arc.points[0],segment.from);near(segment.arc.points.at(-1),segment.to)
      const fixed=segment.arc.reverse?segment.to:segment.from
      for(const U of segment.arc.points)if(Math.hypot(U[0]-fixed[0],U[1]-fixed[1])>1e-10)
        assert.ok(directShockDiagnostic(fixed,U,burgers).rankineHugoniot)
    }
    assert.equal(candidate.evidence.entropyCertified,false)
    assert.equal(result.stateBranches.complete,false)
  }
})

test('a composite preserves its internal fan, shock, sonic junction and full fit points',()=>{
  const p=oldWavePreset({B2:0})
  const left=traceStateRarefaction([1,-1],p,'slow',-1,{step:.01,maxLength:.15}).points.at(-1)
  const right=traceStateRarefaction([1,1],p,'fast',1,{step:.01,maxLength:.15}).points.at(-1)
  const candidate=build({left,right},p).allProfiles.find(q=>q.pattern==='KR')
  assert.ok(candidate)
  const geometry=candidateStateGeometry(candidate,p)
  assert.equal(geometry.complete,true)
  assert.deepEqual(geometry.segments.map(s=>s.type),['rarefaction','shock','rarefaction'])
  near(geometry.junctions[0],candidate.blocks[0].sonicJunction)
  near(geometry.segments[1].from,geometry.junctions[0])
  assert.ok(Math.abs(geometry.segments[0].speeds.at(-1)-geometry.segments[1].speed)<1e-6)
  for(const segment of geometry.segments)for(const U of segment.states??segment.arc.points)
    assert.ok(geometry.points.some(q=>q[0]===U[0]&&q[1]===U[1]))
})

test('nonconservative jumps never get a connecting arc; contact model retains separate segments',()=>{
  const arc=stateShockArc({from:[0,0],to:[1,1],family:'slow'},burgers)
  assert.equal(arc.status,'rh-unverified');assert.deepEqual(arc.points,[])
  const linear={...burgers,a20:0,a10:1,b02:0,b01:2}
  const q=build({left:[0,0],right:[1,1]},linear).allProfiles.find(q=>q.pattern==='CC')
  assert.ok(q)
  const g=candidateStateGeometry(q,linear)
  assert.deepEqual(g.segments.map(s=>s.type),['contact','contact'])
  assert.ok(g.segments.every(s=>s.rh.rankineHugoniot))
})
