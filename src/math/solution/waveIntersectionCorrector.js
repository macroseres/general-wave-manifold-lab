export function refineWaveIntersection(a,b,hit,evaluate,{maxIterations,junctionTolerance}){
  let x=hit.aIndex,y=hit.bIndex
  const x0=Math.floor(Math.min(x,a.points.length-1-1e-10)),y0=Math.floor(Math.min(y,b.points.length-1-1e-10))
  for(let step=0;step<=maxIterations;step++){
    const A=evaluate(a,x),B=evaluate(b,y)
    if(!A||!B)return null
    const f=A.point.map((v,i)=>v-B.point[i])
    if(Math.hypot(...f)<=junctionTolerance)return {A,B,middle:A.point}
    if(step===maxIterations)return null
    const column=(curve,t,lo)=>{
      const h=1e-4,l=Math.max(lo,t-h),r=Math.min(lo+1,t+h),L=evaluate(curve,l),R=evaluate(curve,r)
      return L&&R&&r>l?R.point.map((v,i)=>(v-L.point[i])/(r-l)):null
    }
    const da=column(a,x,x0),db=column(b,y,y0)
    if(!da||!db)return null
    const det=da[1]*db[0]-da[0]*db[1]
    if(Math.abs(det)<1e-12*(1+Math.hypot(...da)*Math.hypot(...db)))return null
    const dx=(-db[1]*f[0]+db[0]*f[1])/det,dy=(-da[1]*f[0]+da[0]*f[1])/det
    let accepted=false
    for(let damping=1;damping>=1/64;damping/=2){
      const X=x-damping*dx,Y=y-damping*dy
      if(X<x0||X>x0+1||Y<y0||Y>y0+1)continue
      const AA=evaluate(a,X),BB=evaluate(b,Y)
      if(AA&&BB&&Math.hypot(...AA.point.map((v,i)=>v-BB.point[i]))<Math.hypot(...f)){x=X;y=Y;accepted=true;break}
    }
    if(!accepted)return null
  }
  return null
}

