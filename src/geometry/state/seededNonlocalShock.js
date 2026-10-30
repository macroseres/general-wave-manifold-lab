import {waveState} from '../../math/manifold/waveState.js'
import {stateFiberPoint} from '../../math/state/fibers.js'
import {zFromZc} from '../../math/charts/zChart.js'

/** Continue only a verified terminal Ks point on the forward fibre of UL. */
export function seededNonlocalShock(arc,ks,p,{tauMin=-Infinity,tauMax=Infinity}={}){
  if(!arc?.complete||!ks?.complete||ks.points.length<2)return null
  const start=ks.points.at(-1),before=ks.points.at(-2),seed=arc.points[0]
  const U=waveState(seed.tau,0,zFromZc(seed.zc),p).Um
  const evaluate=zc=>{
    if(Math.abs(zc)>=.996)return null
    const q=stateFiberPoint(U,zFromZc(zc),p,'minus')
    if(q.kind!=='regular'||q.tau<tauMin||q.tau>tauMax||Math.abs(q.Y)>50)return null
    const s=waveState(q.tau,q.Y,zFromZc(zc),p).s
    return Number.isFinite(s)?{tau:q.tau,Y:q.Y,zc,speed:s}:null
  }
  const exact=evaluate(start.zc),distance=(a,b)=>Math.hypot(a.tau-b.tau,a.Y-b.Y,a.zc-b.zc)
  if(!exact||distance(start,exact)>1e-6*(1+Math.hypot(start.tau,start.Y))||Math.abs(exact.speed-start.speed)>1e-7*(1+Math.abs(start.speed)))return null
  const options=[-1,1].map(sign=>({sign,q:evaluate(start.zc+sign*.001)})).filter(({q})=>q&&q.speed<start.speed-1e-10)
  const tangent=[start.tau-before.tau,start.Y-before.Y,start.zc-before.zc]
  const score=q=>(q.tau-start.tau)*tangent[0]+(q.Y-start.Y)*tangent[1]+(q.zc-start.zc)*tangent[2]
  options.sort((a,b)=>score(b.q)-score(a.q))
  if(!options.length)return {family:'slow',kind:'nonlocal',points:[{...start}],junction:{...start},sourceState:U,status:'speed-direction-unverified'}
  const direction=options[0].sign,points=[{...start}],step=.001
  for(let i=1;i<=2000;i++){
    const next=evaluate(start.zc+direction*step*i),last=points.at(-1)
    if(!next||!(next.speed<last.speed-1e-11)||distance(next,last)>.2*(1+Math.hypot(last.tau,last.Y)))break
    points.push(next)
  }
  return points.length>1?{family:'slow',kind:'nonlocal',points,junction:{...start},sourceState:U}:null
}
