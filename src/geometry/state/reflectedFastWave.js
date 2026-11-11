import {zFromZc} from '../../math/charts/zChart.js'
import {forwardLiuOnFiniteFibre,regularFibreInterval} from '../../math/solution/forwardLiuOnFiniteFibre.js'
import {waveState} from '../../math/manifold/waveState.js'
import {increasingInflectionArc} from '../../math/rarefaction/increasingInflectionArc.js'
import {seededCompositeKs} from './seededCompositeKs.js'
import {seededNonlocalShock} from './seededNonlocalShock.js'
import {intersectWavePolylines} from '../../math/solution/mixedWaveChains.js'
import {refineRarefactionMiddleJoint} from '../../math/solution/rarefactionJointCorrector.js'
import {interpolateCharacteristicSegment,stateCharacteristicDirection} from '../../math/rarefaction/stateIntegralCurves.js'
import {quadraticSonicPartners} from '../../math/solution/sonicPartners.js'
import {refineWaveIntersection} from '../../math/solution/waveIntersectionCorrector.js'
import {liftHugoniotSample} from '../../math/state/hugoniotWaveLift.js'
import {monotoneShockArcs,stateFibreCharacteristicIntersections} from './fibreGeometry.js'
import {stateFiberPoint} from '../../math/state/fibers.js'

export function twoShockMiddleLift(candidate,p){
  if(candidate?.kind!=='two-shock'||candidate.status!=='sampled-candidate'||candidate.states?.length!==3)return null
  const [left,middle,right]=candidate.states
  const slow=liftHugoniotSample(left,middle,p)
  const reflected=liftHugoniotSample(right,middle,p)
  if(slow.kind!=='regular'||reflected.kind!=='regular')return null
  const slowLiu=forwardLiuOnFiniteFibre({from:left,to:middle,family:'slow'},p)
  const fastLiu=forwardLiuOnFiniteFibre({from:middle,to:right,family:'fast'},p)
  if(slowLiu?.status!=='continuous-liu-compatible'||fastLiu?.status!=='continuous-liu-compatible')return null
  return {middle,position:[reflected.tau,reflected.Y,reflected.zc],
    slowPosition:[slow.tau,slow.Y,slow.zc]}
}

/** Sample the regular fibre to an endpoint already checked for Liu. */
export function twoShockFibreArc(fixed,seed,endpoint,p){
  if(!seed||!endpoint)return []
  const [tau,Y,endZc]=endpoint
  const startZ=zFromZc(seed.zc),endZ=zFromZc(endZc)
  if(!regularFibreInterval(startZ,endZ,p))return []

  const steps=Math.max(1,Math.ceil(Math.abs(endZc-seed.zc)/.002))
  const points=[{tau:seed.tau,Y:0,zc:seed.zc}]
  for(let i=1;i<steps;i++){
    const zc=seed.zc+(endZc-seed.zc)*i/steps
    const point=stateFiberPoint(fixed,zFromZc(zc),p,'minus')
    if(point.kind!=='regular')return []
    points.push({tau:point.tau,Y:point.Y,zc})
  }
  points.push({tau,Y,zc:endZc,selectedShockEndpoint:true})
  return points
}

export function fastWave(right,seed,p,sonicIntersections=[]){
  if(!seed)return []
  const options={side:'plus',speedSign:1,family:'fast'}
  const shocks=monotoneShockArcs(right,seed,p,'plus',1)
  // The exact finite characteristic seed can lie beyond the portrait's sampling cutoff.
  const fan=increasingInflectionArc(seed,p,-Infinity,Infinity,{family:'fast',speedSign:-1,zcLimit:1})
  const composite=seededCompositeKs(fan,p,options)
  const nonlocal=seededNonlocalShock(fan,composite,p,options)
  return [
    ...shocks.map(points=>{
      const start=points[0].zc,end=points.at(-1).zc
      const direction=Math.sign(end-start)
      // The sampled increasing prefix can end one step before the exact
      // sonic maximum. Include the verified root in that final bracket.
      const step=Math.abs(end-points.at(-2).zc)
      const junction=sonicIntersections.filter(q=>{
        if(direction*(q.zc-start)<=0||direction*(q.zc-end)>step+1e-12)return false
        if(direction*(q.zc-end)<=0)return true
        return regularFibreInterval(zFromZc(end),zFromZc(q.zc),p)&&
          waveState(q.tau,q.Y,zFromZc(q.zc),p).s>=points.at(-1).s
      })
        .sort((a,b)=>direction*(a.zc-b.zc))[0]
      const localPoints=junction?[...points.filter(q=>direction*(junction.zc-q.zc)>0),junction]:points
      return {kind:'local-shock',points:localPoints,junction}
    }),
    {kind:'rarefaction',points:fan.points},
    {kind:'composite',points:composite?.points},
    {kind:'nonlocal-shock',points:nonlocal?.points},
  ].filter(arc=>arc.points?.length>1)

}

function orientedRarefaction(points,side,family,p){
  if(!points.every(q=>Array.isArray(q)&&q.every(Number.isFinite)))return null
  const direction=stateCharacteristicDirection(points[0],p,family)?.direction
  if(!direction)return null
  const sign=Math.sign(direction.reduce((sum,value,i)=>sum+value*(points[1][i]-points[0][i]),0))
  return {points,side,family,sign}
}

function sampleIndexAtZc(points,zc,seedIndex){
  let closest=null
  for(let i=1;i<points.length;i++){
    const start=points[i-1].zc,end=points[i].zc
    if(start===end)continue
    const fraction=(zc-start)/(end-start)
    if(fraction<0||fraction>1)continue
    const index=i-1+fraction
    if(closest===null||Math.abs(index-seedIndex)<Math.abs(closest-seedIndex))closest=index
  }
  return closest
}

function refineCompositeRarefactionHit(source,arc,states,fast,hit,p){
  const slowSegment=Math.min(Math.floor(hit.aIndex),source.length-2)
  if(!source[slowSegment].source||!source[slowSegment+1].source||!arc.every(q=>!(q.Y??0)))return null
  const project=q=>waveState(q.tau,0,zFromZc(q.zc),p).Up
  const evaluate=(curve,index)=>{
    const i=Math.min(Math.floor(index),curve.points.length-2),t=index-i
    const [a,b]=curve.points.slice(i,i+2)
    if(curve.family==='fast'){
      const point=interpolateCharacteristicSegment(a,b,t,p,'fast')
      return point?{point,index}:null
    }
    const sonic=interpolateCharacteristicSegment(project(source[i].source),project(source[i+1].source),t,p,'slow')
    if(!sonic)return null
    const reference=a.map((value,j)=>value+t*(b[j]-value))
    const distance=q=>Math.hypot(...q.point.map((value,j)=>value-reference[j]))
    const root=quadraticSonicPartners(sonic,p,'slow','left').sort((a,b)=>distance(a)-distance(b))[0]
    return root?{point:root.point,index,sonic}:null
  }
  const result=refineWaveIntersection({points:states,family:'slow'},{points:fast,family:'fast'},hit,evaluate,
    {maxIterations:16,junctionTolerance:1e-10})
  if(!result)return null
  const characteristic=(U,family)=>stateFibreCharacteristicIntersections(U,p)
    .find(q=>q.shared&&q.chart==='z'&&q.branch===family)
  const fastLift=characteristic(result.middle,'fast')
  const rarefactionLift=characteristic(result.A.sonic,'slow')
  const slowLift=liftHugoniotSample(result.A.sonic,result.middle,p)
  if(!fastLift||!rarefactionLift||slowLift.kind!=='regular')return null
  return {middle:result.middle,position:[fastLift.tau,0,fastLift.zc],
    slowPosition:[slowLift.tau,slowLift.Y,slowLift.zc],rarefactionZc:rarefactionLift.zc,
    slowSampleIndex:result.A.index,fastSampleIndex:result.B.index,refined:true}
}

/** In the common right projection, a hit belongs to the generating backward fibre. */
export function sampledIntermediateIntersections(slowArcs,reflected,p){
  const project=arc=>arc.map(q=>waveState(q.tau,q.Y??0,zFromZc(q.zc),p).Up)
  const slow=slowArcs.map(project)
  const hits=[]
  for(const [fastIndex,arc] of reflected.entries()){
    const fast=project(arc)
    for(const [slowIndex,states] of slow.entries()){
      const source=slowArcs[slowIndex]
      const intersections=intersectWavePolylines(states,fast)
      // Two independently lifted RH endpoints can differ by roundoff or by
      // the solver's tolerance. Compare their projections at the terminal samples.
      if(source.at(-1)?.selectedShockEndpoint&&arc.at(-1)?.selectedShockEndpoint){
        const a=states.at(-1),b=fast.at(-1)
        if(a&&b&&Math.hypot(a[0]-b[0],a[1]-b[1])<=1e-6*(1+Math.hypot(...a))){
          intersections.unshift({point:a.map((value,i)=>(value+b[i])/2),
            aIndex:states.length-1,bIndex:fast.length-1})
        }
      }
      for(const {point,aIndex,bIndex} of intersections){
        const compositeHit=refineCompositeRarefactionHit(source,arc,states,fast,{aIndex,bIndex},p)
        if(compositeHit){
          if(!hits.some(q=>Math.hypot(...q.middle.map((v,i)=>v-compositeHit.middle[i]))<1e-7)){
            hits.push({slowIndex,fastIndex,...compositeHit})
          }
          continue
        }
        if(source.every(q=>!(q.Y??0))&&arc.every(q=>!(q.Y??0))){
          const left=orientedRarefaction(states,'left','slow',p)
          const right=orientedRarefaction(fast,'right','fast',p)
          const result=refineRarefactionMiddleJoint(left,right,p,{aIndex,bIndex})
          if(result.status==='refined-candidate'){
            const lifts=stateFibreCharacteristicIntersections(result.middle,p).filter(q=>q.shared&&q.chart==='z')
            const slowLift=lifts.find(q=>q.branch==='slow'),fastLift=lifts.find(q=>q.branch==='fast')
            const slowSampleIndex=slowLift?sampleIndexAtZc(source,slowLift.zc,aIndex):null
            const fastSampleIndex=fastLift?sampleIndexAtZc(arc,fastLift.zc,bIndex):null
            if(slowSampleIndex!==null&&fastSampleIndex!==null){
              if(!hits.some(q=>Math.hypot(q.middle[0]-result.middle[0],q.middle[1]-result.middle[1])<1e-7)){
                hits.push({slowIndex,fastIndex,slowSampleIndex,fastSampleIndex,
                  middle:result.middle,position:[fastLift.tau,0,fastLift.zc],
                  slowPosition:[slowLift.tau,0,slowLift.zc],rarefactionZc:null,refined:true})
              }
              continue
            }
          }
        }
        if(hits.some(q=>Math.hypot(q.middle[0]-point[0],q.middle[1]-point[1])<1e-7))continue
        const i=Math.min(Math.floor(bIndex),arc.length-2),t=bIndex-i
        const a=arc[i],b=arc[i+1]
        const zc=a.zc+t*(b.zc-a.zc)
        const fibrePoint=stateFiberPoint(point,zFromZc(zc),p,'plus')
        if(fibrePoint.kind!=='regular')continue
        const j=Math.min(Math.floor(aIndex),source.length-2)
        const fraction=aIndex-j
        const slowZc=source[j].zc+fraction*(source[j+1].zc-source[j].zc)
        const slowPoint=stateFiberPoint(point,zFromZc(slowZc),p,'plus')
        const start=source[j].source,end=source[j+1].source
        hits.push({
          slowIndex,fastIndex,slowSampleIndex:aIndex,fastSampleIndex:bIndex,
          middle:point,position:[fibrePoint.tau,fibrePoint.Y,zc],
          slowPosition:slowPoint.kind==='regular'?[slowPoint.tau,slowPoint.Y,slowZc]:null,
          rarefactionZc:start&&end?start.zc+fraction*(end.zc-start.zc):null,
        })
      }
    }
  }
  return hits
}

/** Restrict the forward fibre to the slow characteristic lift linked by K_s. */
export function slowCompositeForwardArc(hit,p){
  if(!hit?.slowPosition||hit.rarefactionZc==null)return []
  const [tau,Y,startZc]=hit.slowPosition
  const state=waveState(tau,Y,zFromZc(startZc),p)
  if(state.kind!=='regular')return []
  const lifts=stateFibreCharacteristicIntersections(state.Um,p)
    .filter(q=>q.shared&&q.chart==='z'&&q.branch==='slow')
  lifts.sort((a,b)=>Math.abs(a.zc-hit.rarefactionZc)-Math.abs(b.zc-hit.rarefactionZc))
  const end=lifts[0]
  return end?sampleFibreArc(state.Um,startZc,end.zc,p,'minus'):[]
}

export function middleBackwardArc(hit,p){
  if(!hit?.slowPosition)return []
  return sampleFibreArc(hit.middle,hit.position[2],hit.slowPosition[2],p,'plus')
}

function sampleFibreArc(U,startZc,endZc,p,side){
  if(Math.abs(endZc-startZc)<1e-8)return []
  const points=[]
  let previous
  for(let i=0;i<=128;i++){
    const zc=i===128?endZc:startZc+(endZc-startZc)*i/128
    const q=stateFiberPoint(U,zFromZc(zc),p,side)
    if(q.kind!=='regular'||(previous&&previous.denominator*q.denominator<=0))return []
    points.push([q.tau,q.Y,zc])
    previous=q
  }
  return points
}
