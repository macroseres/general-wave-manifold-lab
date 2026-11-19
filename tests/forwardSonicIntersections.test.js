import test from 'node:test'
import assert from 'node:assert/strict'
import {boundedPolynomialRoots,forwardSonicIntersections} from '../src/geometry/state/forwardSonicIntersections.js'
import {defaultCoefficients as p} from '../src/math/flux/quadraticFlux.js'
import {sonicData,sonicImplicit} from '../src/math/sonic/sonic.js'
import {waveState,rhResidual} from '../src/math/manifold/waveState.js'
import {seededRarefactionCurves} from '../src/geometry/state/seededRarefactionCurves.js'
import {backwardArcToCharacteristic,nonlocalRarefactionToInflection,nonlocalCompositeArc,backwardArcFromComposite,nonlocalShockFromBackwardIntersection,fastWave,sonicShockConstruction,nonlocalShockRarefactionHits,trimReflectedNonlocalShock,trimReflectedAfterMiddle,trimSlowNonlocalShockAtMiddle} from '../src/geometry/state/reflectedFastWave.js'
import {zFromZc} from '../src/math/charts/zChart.js'
import {decreasingForwardShockArcs,extendSlowShock,trimForwardShockAtSonicPoint} from '../src/geometry/state/fibreGeometry.js'
import {stateFiberPoint} from '../src/math/state/fibers.js'
import {liftHugoniotSample} from '../src/math/state/hugoniotWaveLift.js'
import {fibreCharacteristicMarkers} from '../src/geometry/state/fibreCharacteristicMarkers.js'

test('the intermediate fibre clips only the reflected nonlocal shock past its junction',()=>{
  const points=[0,.2,.4].map(zc=>({tau:0,Y:0,zc}))
  const arcs=['local-shock','rarefaction','nonlocal-shock','composite'].map(kind=>({kind,points}))
  const hit={fastSampleIndex:1.5,position:[0,0,.3]}
  assert.equal(trimReflectedNonlocalShock(arcs,arcs[0],hit),arcs)
  const result=trimReflectedNonlocalShock(arcs,arcs[2],hit)
  assert.deepEqual(result[2].points,[...points.slice(0,2),{tau:0,Y:0,zc:.3}])
  for(const i of [0,1,3])assert.equal(result[i],arcs[i])
  assert.equal(arcs[2].points.length,3)
})

test('the SS endpoint trims the displayed nonlocal branch through the same point',()=>{
  const right=[-.20393582394248577,-.5144131425498188]
  const middle=[-.025451852844759343,.7983999836973455]
  const seed=fibreCharacteristicMarkers(right,p).find(q=>q.branch==='fast')
  const arcs=fastWave(right,seed,p).map(arc=>({...arc,points:arc.points.map(q=>({...q,Y:-(q.Y??0)}))}))
  const {tau,Y,zc}=liftHugoniotSample(right,middle,p)
  const nonlocal=arcs.findIndex(arc=>arc.kind==='nonlocal-shock')
  const matchedArc={kind:'local-shock'}
  const hit={position:[tau,Y,zc],fastSampleIndex:0}
  const result=trimReflectedNonlocalShock(arcs,matchedArc,hit,{right,p})
  assert.deepEqual(result[nonlocal].points.at(-1),{tau,Y,zc})
  assert.ok(result[nonlocal].points.length<arcs[nonlocal].points.length)
  for(let i=0;i<arcs.length;i++)if(i!==nonlocal)assert.equal(result[i],arcs[i])
})

test('the Q2 nonlocal shock meets the reflected fast rarefaction on Y=0',()=>{
  const left=[.1301793,-.7991479],right=[-.1566455,-1.141931]
  const seed=forwardSonicIntersections(left,p,'plus').points.find(q=>q.index===2)
  const {nonlocalShock}=sonicShockConstruction(seed,left,p)
  const fastSeed=fibreCharacteristicMarkers(right,p).find(q=>q.branch==='fast')
  const reflected=fastWave(right,fastSeed,p).map(arc=>({...arc,points:arc.points.map(q=>({...q,Y:-(q.Y??0)}))}))
  const hits=nonlocalShockRarefactionHits(nonlocalShock,reflected,p)
  assert.equal(hits.length,1)
  const {position,slowPosition,middle,fastIndex}=hits[0]
  const slowThroughMiddle=trimSlowNonlocalShockAtMiddle(nonlocalShock.points,hits[0])
  assert.deepEqual(Object.values(slowThroughMiddle.at(-1)),slowPosition)
  assert.ok(slowThroughMiddle.length<nonlocalShock.points.length)
  assert.equal(trimSlowNonlocalShockAtMiddle(nonlocalShock.points,null),nonlocalShock.points)
  assert.equal(reflected[fastIndex].kind,'rarefaction')
  assert.equal(position[1],0)
  const throughMiddle=trimReflectedAfterMiddle(reflected,reflected[fastIndex],hits[0])
  assert.deepEqual(throughMiddle.map(arc=>arc.kind),['local-shock','rarefaction'])
  assert.deepEqual(throughMiddle.at(-1).points.at(-1),{tau:position[0],Y:0,zc:position[2]})
  const project=([tau,Y,zc])=>waveState(tau,Y,zFromZc(zc),p).Up
  for(const point of [position,slowPosition])assert.ok(Math.hypot(...project(point).map((v,i)=>v-middle[i]))<1e-9)
})

test('root isolation includes zero, two, four and even-multiplicity tangencies',()=>{
  assert.deepEqual(boundedPolynomialRoots([1,0,1]),[])
  for(const [polynomial,expected] of [[[-.25,0,1],[-.5,.5]],[[.0576,0,-.73,0,1],[-.8,-.3,.3,.8]],[[.0625,0,-.5,0,1],[-.5,.5]]]){
    const roots=boundedPolynomialRoots(polynomial)
    assert.equal(roots.length,expected.length)
    roots.forEach((x,i)=>assert.ok(Math.abs(x-expected[i])<1e-8))
  }
})
test('all isolated forward S-minus roots preserve UL and satisfy sonic and RH equations',()=>{
  for(const U of [[.5,-1],[.4895,-.3109],[-.4,.7]]){
    const report=forwardSonicIntersections(U,p)
    if(U[0]<0)assert.equal(report.points.length,0)
    else assert.ok(report.points.length)
    for(const q of report.points){
      const w=waveState(q.tau,q.Y,q.z,p)
      assert.ok(Math.abs(sonicImplicit(q.tau,q.Y,q.z,p,'minus'))<1e-7)
      assert.ok(Math.hypot(...w.Um.map((v,i)=>v-U[i]))<1e-7)
      assert.ok(rhResidual(w,p)<1e-7)
    }
  }
})
test('known terminal composite junction belongs to the enumerated intersections without duplication',()=>{
  const U=[.5,-1],junction=seededRarefactionCurves({left:U},p,-1,1).find(q=>q.kind==='nonlocal').junction
  const points=forwardSonicIntersections(U,p).points
  assert.equal(points.filter(q=>Math.hypot(q.tau-junction.tau,q.Y-junction.Y,q.zc-junction.zc)<1e-6).length,1)
  assert.equal(forwardSonicIntersections(null,p).status,'missing-state')
})


test('forward S-plus enumeration uses the plus sonic equation and preserves the same fixed UL',()=>{
  const U=[.4895,-.3109],report=forwardSonicIntersections(U,p,'plus')
  assert.equal(report.sonicSide,'plus')
  assert.ok(report.points.length)
  for(const q of report.points){
    const w=waveState(q.tau,q.Y,q.z,p)
    assert.ok(Math.abs(sonicImplicit(q.tau,q.Y,q.z,p,'plus'))<1e-7)
    assert.ok(Math.hypot(...w.Um.map((v,i)=>v-U[i]))<1e-7)
    assert.ok(rhResidual(w,p)<1e-7)
    assert.ok(q.id.includes('plus'))
  }
  assert.equal(forwardSonicIntersections(null,p,'plus').sonicSide,'plus')
})

test('the backward arc from Q2+ preserves its right state and ends on the characteristic surface',()=>{
  const q=forwardSonicIntersections([.5,-1],p,'plus').points.find(point=>point.index===2)
  const {Up}=waveState(q.tau,q.Y,q.z,p)
  const arc=backwardArcToCharacteristic(q,p)
  assert.ok(arc.length>1)
  assert.deepEqual(arc[0],[q.tau,q.Y,q.zc])
  assert.equal(arc.at(-1)[1],0)
  for(const [tau,Y,zc] of arc){
    const state=waveState(tau,Y,zFromZc(zc),p)
    assert.equal(state.kind,'regular')
    assert.ok(Math.hypot(...state.Up.map((value,i)=>value-Up[i]))<1e-7)
  }
})

test('the slow forward shock from Ps stops exactly at the selected Q4+ root',()=>{
  const U=[.05,-.99]
  const seed=fibreCharacteristicMarkers(U,p).find(point=>point.branch==='slow')
  const q=forwardSonicIntersections(U,p,'plus').points.find(point=>point.index===4)
  const arcs=decreasingForwardShockArcs(U,seed,p)
  assert.ok(arcs[0].at(-1).zc<q.zc)
  const points=trimForwardShockAtSonicPoint(arcs,q)
  assert.deepEqual([points[0].tau,points[0].Y,points[0].zc],seed.position)
  assert.equal(points.at(-1),q)
  assert.ok(points.slice(0,-1).every(point=>point.zc>q.zc))
  assert.equal(trimForwardShockAtSonicPoint(arcs,{zc:seed.zc+.001}),null)
})

test('the selected SS slow shock extends toward the projective boundary without a finite minimum',()=>{
  const U=[.21842996697676798,-.3279007621433423]
  const seed=fibreCharacteristicMarkers(U,p).find(q=>q.branch==='slow')
  const middle=liftHugoniotSample(U,[-.025451852844759343,.7983999836973455],p)
  const {points,minimum}=extendSlowShock(U,seed,[middle.tau,middle.Y,middle.zc],p)
  assert.equal(minimum,null)
  assert.ok(points.at(-1).zc<-.998)
  assert.ok(points.at(-1).s<middle.s)
  assert.ok(points.every((q,i)=>i===0||q.s<points[i-1].s))
})

test('the slow shock extension ends exactly at a finite speed minimum when one exists',()=>{
  const U=[.1,-.95],seed=fibreCharacteristicMarkers(U,p).find(q=>q.branch==='slow')
  const {points,minimum}=extendSlowShock(U,seed,[0,0,seed.zc+.001],p)
  assert.equal(points.at(-1),minimum)
  assert.ok(points.every((q,i)=>i===0||q.s<points[i-1].s))
  for(const z of [minimum.z-.001,minimum.z+.001]){
    const {tau,Y}=stateFiberPoint(U,z,p,'minus')
    assert.ok(waveState(tau,Y,z,p).s>minimum.s)
  }
})

test('nonlocal rarefaction starts at the characteristic lift of Q2+ and stops at the first inflection',()=>{
  const q=forwardSonicIntersections([.5,-1],p,'plus').points.find(point=>point.index===2)
  const start=backwardArcToCharacteristic(q,p).at(-1)
  const arc=nonlocalRarefactionToInflection(start,p)
  assert.equal(arc.status,'inflection-reached')
  assert.deepEqual(arc.points[0],{tau:start[0],zc:start[2]})
  assert.ok(arc.speeds.every((speed,i)=>i===0||speed>arc.speeds[i-1]))
  const inflection=arc.points.at(-1)
  assert.ok(Math.abs(sonicData(inflection.tau,zFromZc(inflection.zc),p).K)<=1e-9)
})

test('the nonlocal composite runs from I2+ to the verified forward fibre intersection',()=>{
  const q=forwardSonicIntersections([.5,-1],p,'plus').points.find(point=>point.index===2)
  const seed=backwardArcToCharacteristic(q,p).at(-1)
  const rarefaction=nonlocalRarefactionToInflection(seed,p)
  const composite=nonlocalCompositeArc(rarefaction,seed,p)
  assert.equal(composite.intersection,'forward-hugoniot')
  assert.deepEqual(composite.points[0].source,rarefaction.points.at(-1))
  assert.equal(composite.points[0].Y,0)
  const end=composite.points.at(-1)
  assert.ok(Math.hypot(end.tau-q.tau,end.Y+q.Y,end.zc-q.zc)<1e-7)
  assert.ok(Math.abs(sonicImplicit(end.tau,end.Y,zFromZc(end.zc),p,'minus'))<1e-7)
  const forward=composite.forwardArc
  assert.ok(forward.length>1)
  assert.deepEqual(forward[0],seed)
  assert.deepEqual(forward.at(-1),[end.tau,end.Y,end.zc])
  const fixed=waveState(seed[0],seed[1],zFromZc(seed[2]),p).Um
  for(const [tau,Y,zc] of forward){
    const state=waveState(tau,Y,zFromZc(zc),p)
    assert.equal(state.kind,'regular')
    assert.ok(Math.hypot(state.Um[0]-fixed[0],state.Um[1]-fixed[1])<1e-7)
  }
})

test('the backward arc from the Q2+ composite junction meets the forward fibre of Ps',()=>{
  const U=[.16,-.8]
  const slowSeed=fibreCharacteristicMarkers(U,p).find(point=>point.branch==='slow')
  const q=forwardSonicIntersections(U,p,'plus').points.find(point=>point.index===2)
  const seed=backwardArcToCharacteristic(q,p).at(-1)
  const composite=nonlocalCompositeArc(nonlocalRarefactionToInflection(seed,p),seed,p)
  assert.equal(composite.intersection,'forward-hugoniot')
  const junction=composite.points.at(-1)
  const arc=backwardArcFromComposite(junction,slowSeed,p)
  assert.equal(arc.end.intersection,'forward-hugoniot')
  assert.deepEqual(arc.points[0],[junction.tau,junction.Y,junction.zc])
  const {Up}=waveState(junction.tau,junction.Y,zFromZc(junction.zc),p)
  for(const [tau,Y,zc] of arc.points){
    const point=waveState(tau,Y,zFromZc(zc),p)
    assert.ok(Math.hypot(point.Up[0]-Up[0],point.Up[1]-Up[1])<1e-7)
  }
  const end=waveState(arc.end.tau,arc.end.Y,arc.end.z,p)
  assert.ok(Math.hypot(end.Um[0]-U[0],end.Um[1]-U[1])<1e-7)

  const shock=nonlocalShockFromBackwardIntersection(arc,U,p)
  assert.ok(shock.points.length>1)
  assert.equal(shock.status,'projective-cutoff')
  assert.equal(shock.endpoint,null)
  assert.deepEqual([shock.points[0].tau,shock.points[0].Y,shock.points[0].zc],arc.points.at(-1))
  for(const [i,point] of shock.points.entries()){
    const sample=waveState(point.tau,point.Y,zFromZc(point.zc),p)
    assert.ok(Math.hypot(sample.Um[0]-U[0],sample.Um[1]-U[1])<1e-7)
    if(i>0)assert.ok(point.speed<shock.points[i-1].speed)
  }
})

test('the nonlocal shock from Q4+ stops at a verified finite speed minimum',()=>{
  const U=[.05,-.99]
  const sonicPoints=forwardSonicIntersections(U,p,'plus').points
  const q=sonicPoints.find(point=>point.index===4)
  const seed=backwardArcToCharacteristic(q,p).at(-1)
  const composite=nonlocalCompositeArc(nonlocalRarefactionToInflection(seed,p),seed,p)
  const slowSeed=fibreCharacteristicMarkers(U,p).find(point=>point.branch==='slow')
  const arc=backwardArcFromComposite(composite.points.at(-1),slowSeed,p)
  const shock=nonlocalShockFromBackwardIntersection(arc,U,p)
  assert.equal(shock.status,'finite-speed-extremum')
  assert.deepEqual(shock.points.at(-1),shock.endpoint)
  assert.ok(Math.abs(shock.endpoint.zc-sonicPoints.find(point=>point.index===2).zc)<1e-8)
  assert.ok(shock.points.every((point,i)=>i===0||point.speed<shock.points[i-1].speed))
})
