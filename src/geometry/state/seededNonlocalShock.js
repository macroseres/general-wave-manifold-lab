import {waveState} from '../../math/manifold/waveState.js'
import {characteristicLiftPolynomial,stateFiberPoint} from '../../math/state/fibers.js'
import {zFromZc} from '../../math/charts/zChart.js'
import {regularFibreInterval} from '../../math/solution/forwardLiuOnFiniteFibre.js'

/** Continue only a verified terminal composite point on the corresponding fixed-state fibre. */
export function seededNonlocalShock(arc,ks,p,{tauMin=-Infinity,tauMax=Infinity,side="minus",speedSign=-1,family="slow"}={}){
  if(!arc?.complete||!ks?.complete||ks.points.length<2)return null
  const start=ks.points.at(-1),before=ks.points.at(-2),seed=arc.points[0]
  const state=waveState(seed.tau,0,zFromZc(seed.zc),p)
  const U=side==="minus"?state.Um:state.Up
  return continueNonlocalShock(U,start,before,p,{tauMin,tauMax,side,speedSign,family})
}

/** Follow the speed-monotone segment of a fixed-state fibre from a verified junction. */
export function continueNonlocalShock(U,start,before,p,{tauMin=-Infinity,tauMax=Infinity,side="minus",speedSign=-1,family="slow"}={}){
  const evaluate=zc=>{
    if(Math.abs(zc)>=.996)return null
    const q=stateFiberPoint(U,zFromZc(zc),p,side)
    if(q.kind!=='regular'||q.tau<tauMin||q.tau>tauMax||Math.abs(q.Y)>50)return null
    const s=waveState(q.tau,q.Y,zFromZc(zc),p).s
    return Number.isFinite(s)?{tau:q.tau,Y:q.Y,zc,speed:s,denominator:q.denominator,L:q.L,z:q.z}:null
  }
  const exact=evaluate(start.zc),distance=(a,b)=>Math.hypot(a.tau-b.tau,a.Y-b.Y,a.zc-b.zc)
  if(!exact||distance(start,exact)>1e-6*(1+Math.hypot(start.tau,start.Y))||Math.abs(exact.speed-start.speed)>1e-7*(1+Math.abs(start.speed)))return null
  const options=[-1,1].map(sign=>({sign,q:evaluate(start.zc+sign*.001)})).filter(({q})=>
    q&&q.denominator*exact.denominator>0&&speedSign*(q.speed-start.speed)>1e-10)
  const tangent=[start.tau-before.tau,start.Y-before.Y,start.zc-before.zc]
  const score=q=>(q.tau-start.tau)*tangent[0]+(q.Y-start.Y)*tangent[1]+(q.zc-start.zc)*tangent[2]
  options.sort((a,b)=>score(b.q)-score(a.q))
  if(!options.length)return {family,kind:'nonlocal',points:[{...start}],junction:{...start},sourceState:U,status:'speed-direction-unverified'}
  const direction=options[0].sign,points=[{...start}],step=.001
  const {a,b}=characteristicLiftPolynomial(U,p)
  // On either fixed-state fibre, s = a*z + constant - 2*L*B/denominator.
  const orientedSpeedSlope=({z,L,denominator})=>{
    const B=(p.b20*z+p.b11)*z+p.b02
    const dB=2*p.b20*z+p.b11
    const dDenominator=(6*p.b20*z+4*(p.b11-p.a20))*z+2*(p.b02-p.a11)
    const numerator=a*denominator**2-2*((2*a*z+b)*B*denominator+L*(dB*denominator-B*dDenominator))
    return speedSign*direction*numerator
  }
  const publicPoint=({tau,Y,zc,speed})=>({tau,Y,zc,speed})
  let previous={...exact,...start},endpoint=null,status='step-limit'
  for(let i=1;i<=2000;i++){
    const nextZc=start.zc+direction*step*i
    if(Math.abs(nextZc)>=.996){status='projective-cutoff';break}
    const next=evaluate(nextZc)
    if(!next||!regularFibreInterval(previous.z,next.z,p)||
      distance(next,previous)>.2*(1+Math.hypot(previous.tau,previous.Y))){
      status='continuation-limit'
      break
    }
    const nextSlope=orientedSpeedSlope(next)
    if(orientedSpeedSlope(previous)>0&&nextSlope<=0){
      let lo=previous.zc,hi=next.zc
      for(let j=0;j<42;j++){
        const mid=(lo+hi)/2,point=evaluate(mid)
        if(!point)break
        if(orientedSpeedSlope(point)>0)lo=mid
        else hi=mid
      }
      const point=evaluate((lo+hi)/2)
      if(point&&Math.abs(hi-lo)<1e-12){
        endpoint=publicPoint(point)
        if(Math.abs(endpoint.zc-previous.zc)>1e-12)points.push(endpoint)
      }
      status=endpoint?'finite-speed-extremum':'speed-extremum-unresolved'
      break
    }
    if(!(speedSign*(next.speed-previous.speed)>1e-11)){status='speed-extremum-unresolved';break}
    points.push(publicPoint(next))
    previous=next
  }
  return points.length>1?{family,kind:'nonlocal',points,junction:{...start},sourceState:U,status,endpoint}:null
}
