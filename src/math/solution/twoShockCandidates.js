import {directShockDiagnostic} from './directShockDiagnostic.js'

const cross=(a,b)=>a[0]*b[1]-a[1]*b[0]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const finitePoint=q=>q&&Number.isFinite(q.u)&&Number.isFinite(q.v)

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
          const middle=[A[0]+t*r[0],A[1]+t*r[1]]
          if(found.some(q=>Math.hypot(q.middle[0]-middle[0],q.middle[1]-middle[1])<=tolerance))continue
          const first=directShockDiagnostic(left,middle,p)
          const second=directShockDiagnostic(middle,right,p)
          if(first.kind!=='jump'||second.kind!=='jump')continue
          found.push({middle,first,second,ordered:first.speed<second.speed,
            rhBoth:first.rankineHugoniot&&second.rankineHugoniot,
            forwardSegment:f.id,backwardSegment:g.id})
          if(found.length>=maxCandidates)return found
        }
      }
    }
  }
  return found
}
