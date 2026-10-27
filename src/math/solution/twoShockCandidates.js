import {directShockDiagnostic} from './directShockDiagnostic.js'
import {flux} from '../flux/quadraticFlux.js'

const cross=(a,b)=>a[0]*b[1]-a[1]*b[0]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const finitePoint=q=>q&&Number.isFinite(q.u)&&Number.isFinite(q.v)


const norm=q=>Math.hypot(...q)
const distance=(a,b)=>norm(sub(a,b))
const finite=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const lineSolve=(matrix,rhs)=>{
  const a=matrix.map((row,i)=>[...row,rhs[i]])
  for(let k=0;k<4;k++){
    let pivot=k
    for(let i=k+1;i<4;i++)if(Math.abs(a[i][k])>Math.abs(a[pivot][k]))pivot=i
    if(Math.abs(a[pivot][k])<1e-12)return null
    ;[a[k],a[pivot]]=[a[pivot],a[k]]
    const d=a[k][k]
    for(let j=k;j<5;j++)a[k][j]/=d
    for(let i=0;i<4;i++)if(i!==k){
      const d2=a[i][k]
      for(let j=k;j<5;j++)a[i][j]-=d2*a[k][j]
    }
  }
  return a.map(row=>row[4])
}
/** Local four-equation Newton correction of two Rankine–Hugoniot jumps.
 * Does not assert branch completeness or entropy admissibility.
 */
export function refineTwoShockMiddle(left,right,seed,p,{
  residualTolerance=1e-10,maxIterations=32,maxStateDisplacement=.1,
}={}){
  if(![left,right,seed].every(finite)||!Number.isFinite(residualTolerance)||
    residualTolerance<=0||!Number.isFinite(maxStateDisplacement)||maxStateDisplacement<=0)
    return {status:'invalid-input'}
  const first=directShockDiagnostic(left,seed,p),second=directShockDiagnostic(seed,right,p)
  if(first.kind!=='jump'||second.kind!=='jump')return {status:'trivial-jump'}
  let x=[...seed,first.speed,second.speed]
  const residual=y=>{
    const U=y.slice(0,2),fL=flux(left,p),fM=flux(U,p),fR=flux(right,p)
    return [0,1].map(i=>fM[i]-fL[i]-y[2]*(U[i]-left[i]))
      .concat([0,1].map(i=>fR[i]-fM[i]-y[3]*(right[i]-U[i])))
  }
  for(let iteration=0;iteration<=maxIterations;iteration++){
    const r=residual(x),size=norm(r),scale=1+norm(flux(left,p))+norm(flux(x.slice(0,2),p))+norm(flux(right,p))
    if(size<=residualTolerance*scale){
      const middle=x.slice(0,2),a=directShockDiagnostic(left,middle,p),b=directShockDiagnostic(middle,right,p)
      if(!a.rankineHugoniot||!b.rankineHugoniot)return {status:'rh-unverified',residual:size}
      return {status:'refined-candidate',middle,speeds:[a.speed,b.speed],residual:size,
        iterations,displacement:distance(middle,seed),entropyCertified:false}
    }
    if(iteration===maxIterations)return {status:'iteration-limit',residual:size}
    const J=Array.from({length:4},()=>Array(4))
    for(let j=0;j<4;j++){
      const h=1e-5*(1+Math.abs(x[j])),xp=[...x],xm=[...x]
      xp[j]+=h;xm[j]-=h
      const rp=residual(xp),rm=residual(xm)
      for(let i=0;i<4;i++)J[i][j]=(rp[i]-rm[i])/(2*h)
    }
    const step=lineSolve(J,r.map(v=>-v))
    if(!step)return {status:'singular-corrector',residual:size}
    let accepted=false
    for(let k=0;k<22;k++){
      const alpha=2**(-k),next=x.map((v,i)=>v+alpha*step[i])
      if(distance(next.slice(0,2),seed)>maxStateDisplacement*(1+norm(seed))||
        distance(next.slice(0,2),left)<1e-10||distance(next.slice(0,2),right)<1e-10)continue
      if(norm(residual(next))<size*(1-1e-4*alpha)){x=next;accepted=true;break}
    }
    if(!accepted)return {status:'line-search-failed',residual:size}
  }
}

/** Intersections of sampled forward and backward Hugoniot projections.
 * Geometric candidates only: mesh sampling may miss intersections and no
 * entropy, wave-family or viscous-profile admissibility is asserted.
 */
export function twoShockCandidates(left,right,forward=[],backward=[],p,{tolerance=1e-8,maxCandidates=40}={}){
  if(!left?.every?.(Number.isFinite)||!right?.every?.(Number.isFinite))return []
  const found=[]
  for(const f of forward){
    for(let i=1;i<(f.points?.length??0);i++){
      const a=f.points[i-1],b=f.points[i];if(!finitePoint(a)||!finitePoint(b))continue
      const A=[a.u,a.v],r=sub([b.u,b.v],A)
      for(const g of backward){
        for(let j=1;j<(g.points?.length??0);j++){
          const c=g.points[j-1],d=g.points[j];if(!finitePoint(c)||!finitePoint(d))continue
          const C=[c.u,c.v],s=sub([d.u,d.v],C),den=cross(r,s)
          const scale=Math.hypot(...r)*Math.hypot(...s)
          if(scale===0||Math.abs(den)<=1e-12*scale)continue
          const diff=sub(C,A),t=cross(diff,s)/den,u=cross(diff,r)/den
          if(t<0||t>1||u<0||u>1)continue
          const seed=[A[0]+t*r[0],A[1]+t*r[1]]
          const refinement=refineTwoShockMiddle(left,right,seed,p)
          const middle=refinement.status==='refined-candidate'?refinement.middle:seed
          if(found.some(q=>Math.hypot(q.middle[0]-middle[0],q.middle[1]-middle[1])<=tolerance))continue
          const first=directShockDiagnostic(left,middle,p)
          const second=directShockDiagnostic(middle,right,p)
          if(first.kind!=='jump'||second.kind!=='jump')continue
          found.push({middle,first,second,ordered:first.speed<second.speed,
            rhBoth:first.rankineHugoniot&&second.rankineHugoniot,
            forwardSegment:f.id,backwardSegment:g.id,refinement,
            geometryStatus:refinement.status==='refined-candidate'?'corrected-rh-junction':'sampled-only'})
          if(found.length>=maxCandidates)return found
        }
      }
    }
  }
  return found
}
