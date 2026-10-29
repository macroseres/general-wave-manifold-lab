import {waveState} from '../../math/manifold/waveState.js'
import {zFromZc,zcFromZ} from '../../math/charts/zChart.js'
import {compositeLeafIntersections,certifyCompositePoint} from '../../math/state/compositeTrace.js'

/** Follow the forward saturation on S-minus backwards from the first inflection.
 * Missing or discontinuous roots stop continuation; unrelated roots are not joined.
 */
export function seededCompositeKs(arc,p){
  if(!arc?.complete||arc.points.length<2)return null
  const source=[...arc.points].reverse(),end=source[0]
  const points=[{...end,Y:0,speed:arc.speeds.at(-1),source:end}],stride=Math.max(1,Math.ceil((source.length-1)/128))
  let status='source-start-reached'
  for(let i=1;i<source.length;i=Math.min(source.length-1,i+stride)){
    const sample=source[i],P=waveState(sample.tau,0,zFromZc(sample.zc),p),previous=points.at(-1)
    const candidates=compositeLeafIntersections(P,p,'minus').flatMap(Q=>{
      if(![Q.tau,Q.Y,Q.z].every(Number.isFinite)||Math.abs(Q.Y)<1e-8)return []
      const certificate=certifyCompositePoint(P,Q,p,'minus'),state=waveState(Q.tau,Q.Y,Q.z,p)
      if(!certificate.valid||state.kind!=='regular'||Math.abs(state.s-P.s)>1e-7*(1+Math.abs(P.s)))return []
      return [{tau:Q.tau,Y:Q.Y,zc:zcFromZ(Q.z),speed:P.s,source:sample,certificate}]
    })
    const distance=q=>Math.hypot(q.tau-previous.tau,q.Y-previous.Y,q.zc-previous.zc)
    candidates.sort((a,b)=>distance(a)-distance(b))
    const next=candidates[0]
    if(!next||distance(next)>.3*(1+Math.hypot(previous.tau,previous.Y))||Math.abs(next.zc-previous.zc)>1){status='continuation-stopped';break}
    if(!(next.speed<previous.speed)){status='speed-order-unverified';break}
    points.push(next)
    if(i===source.length-1)break
  }
  return {family:'slow',kind:'composite',points,status,complete:status==='source-start-reached'}
}
