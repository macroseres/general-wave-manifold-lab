import {waveState} from '../../math/manifold/waveState.js'
import {zFromZc,zcFromZ} from '../../math/charts/zChart.js'
import {compositeLeafIntersections,certifyCompositePoint} from '../../math/state/compositeTrace.js'
import {doubleSonicBasePoints} from '../../math/sonic/intersections.js'
import {stateFiberPoint} from '../../math/state/fibers.js'
import {localEndpointStates} from '../../math/state/stateRoles.js'

function doubleSonicCrossing(a,b,base,p,side){
  const evaluate=t=>{
    const source={tau:a.source.tau+t*(b.source.tau-a.source.tau),zc:a.source.zc+t*(b.source.zc-a.source.zc)}
    const P=waveState(source.tau,0,zFromZc(source.zc),p)
    const U=localEndpointStates(P)?.[side]
    const Q=U&&stateFiberPoint(U,base.z,p,side)
    return Q?.kind==='regular'?{P,Q,source,residual:Q.tau-base.tau}:null
  }
  let lo=0,hi=1
  const first=evaluate(lo),last=evaluate(hi)
  if(!first||!last||first.residual*last.residual>0)return null
  for(let i=0;i<45;i++){
    const t=(lo+hi)/2,trial=evaluate(t)
    if(!trial)return null
    const {P,Q,source,residual}=trial
    if(Math.abs(residual)<1e-10){
      const certificate=certifyCompositePoint(P,Q,p,side)
      if(!certificate.valid||Math.abs(Q.Y)<1e-8)return null
      return {tau:base.tau,Y:Q.Y,zc:base.zc,speed:P.s,source,certificate}
    }
    if(first.residual*residual<=0)hi=t
    else lo=t
  }
  return null
}

/** Follow the corresponding saturation on its sonic sheet backwards from the first inflection.
 * Missing or discontinuous roots stop continuation; unrelated roots are not joined.
 */
export function seededCompositeKs(arc,p,{side="minus",speedSign=-1,family="slow"}={}){
  if(!arc?.complete||arc.points.length<2)return null
  const source=[...arc.points].reverse(),end=source[0]
  const points=[{...end,Y:0,speed:arc.speeds.at(-1),source:end}],stride=Math.max(1,Math.ceil((source.length-1)/512))
  let status='source-start-reached'
  for(let i=1;i<source.length;i=Math.min(source.length-1,i+stride)){
    const sample=source[i],P=waveState(sample.tau,0,zFromZc(sample.zc),p),previous=points.at(-1)
    const candidates=compositeLeafIntersections(P,p,side).flatMap(Q=>{
      if(![Q.tau,Q.Y,Q.z].every(Number.isFinite)||Math.abs(Q.Y)<1e-8)return []
      const certificate=certifyCompositePoint(P,Q,p,side),state=waveState(Q.tau,Q.Y,Q.z,p)
      if(!certificate.valid||state.kind!=='regular'||Math.abs(state.s-P.s)>1e-7*(1+Math.abs(P.s)))return []
      return [{tau:Q.tau,Y:Q.Y,zc:zcFromZ(Q.z),speed:P.s,source:sample,certificate}]
    })
    const distance=q=>Math.hypot(q.tau-previous.tau,q.Y-previous.Y,q.zc-previous.zc)
    candidates.sort((a,b)=>distance(a)-distance(b))
    const next=candidates[0]
    if(!next||distance(next)>.3*(1+Math.hypot(previous.tau,previous.Y))||Math.abs(next.zc-previous.zc)>1){status='continuation-stopped';break}
    if(!(speedSign*(next.speed-previous.speed)>0)){status='speed-order-unverified';break}
    points.push(next)
    if(i===source.length-1)break
  }
  const tauValues=points.map(q=>q.tau)
  const bases=family==='slow'?doubleSonicBasePoints(p,{tauMin:Math.min(...tauValues),tauMax:Math.max(...tauValues)}):[]
  const doubleSonicPoints=[]
  for(let i=points.length-1;i>0;i--){
    const a=points[i-1],b=points[i]
    const crossings=bases.filter(q=>(a.zc-q.zc)*(b.zc-q.zc)<0)
      .map(base=>doubleSonicCrossing(a,b,base,p,side)).filter(Boolean)
      .sort((left,right)=>speedSign*(left.speed-right.speed))
    points.splice(i,0,...crossings)
    doubleSonicPoints.unshift(...crossings)
  }
  return {family,kind:'composite',points,doubleSonicPoints,status,complete:status==='source-start-reached'}
}
