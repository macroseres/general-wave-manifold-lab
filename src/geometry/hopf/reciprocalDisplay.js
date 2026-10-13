import { reciprocalHopfSurfaceMesh } from './reciprocalSurface.js'
import { fromReciprocal } from '../../math/charts/reciprocalTransition.js'
import { reciprocalHopfAt } from '../../math/sonic/hopfReciprocal.js'

/** Project an implicit reciprocal patch onto the finite display chart.
 * Clip intersecting faces instead of dropping a whole face when one vertex
 * leaves the display window. The projective boundary Z=0 is not finite here.
 */
export function reciprocalHopfDisplayMesh(p,{
  side='minus',tauMin=-1,tauMax=1,YMin=-6,YMax=6,
  freeMin=-8,freeMax=8,XMin=-8,XMax=8,
  zAbsMin=0.001,zAbsMax=0.35,nZ=90,nLine=96,
}={}){
  const positions=[],indices=[]
  const stats={nativeTriangles:0,displayTriangles:0,rejectedOverlap:0,rejectedWindow:0,rejectedDet:0,clippedWindow:0}
  const inside=(q,axis,bound,sign)=>sign*(q[axis]-bound)>=-1e-10
  const clipPlane=(poly,axis,bound,sign)=>{
    const out=[]
    for(let k=0;k<poly.length;k++){
      const a=poly[k],b=poly[(k+1)%poly.length]
      const ia=inside(a,axis,bound,sign),ib=inside(b,axis,bound,sign)
      if(ia)out.push(a)
      if(ia!==ib){
        const t=Math.max(0,Math.min(1,(bound-a[axis])/(b[axis]-a[axis])))
        out.push(a.map((x,i)=>x+t*(b[i]-x)))
      }
    }
    return out
  }
  for(const sign of [-1,1]){
    const native=reciprocalHopfSurfaceMesh(p,{side,freeMin,freeMax,XMin,XMax,
      ZMin:sign<0?-zAbsMax:zAbsMin,ZMax:sign<0?-zAbsMin:zAbsMax,nZ,nLine})
    if(native.kind!=='regular')continue
    for(let k=0;k<native.indices.length;k+=3){
      stats.nativeTriangles++
      let tri=[]
      for(let j=0;j<3;j++){
        const ix=native.indices[k+j]*3
        const [free,X,Z]=native.positions.slice(ix,ix+3)
        const h=reciprocalHopfAt(free,X,Z,p,side)
        const v=fromReciprocal(free,X,Z,p)
        // Boundary vertices created by det clipping may have det=0.
        if(h.kind!=='regular'||h.det < -1e-7||v.kind!=='regular'||v.projectionResidual>1e-5){tri=[];stats.rejectedOverlap++;break}
        tri.push([v.tau,v.Y,v.zc])
      }
      if(tri.length!==3)continue
      const original=tri
      for(const [axis,bound,direction] of [[0,tauMin,1],[0,tauMax,-1],[1,YMin,1],[1,YMax,-1]]){
        tri=clipPlane(tri,axis,bound,direction)
        if(tri.length<3)break
      }
      if(tri.length<3){stats.rejectedWindow++;continue}
      if(tri.length!==original.length||tri.some((q,i)=>q!==original[i]))stats.clippedWindow++
      for(let j=1;j+1<tri.length;j++){
        const a=tri[0],b=tri[j],c=tri[j+1]
        const ab=b.map((x,i)=>x-a[i]),ac=c.map((x,i)=>x-a[i])
        const area=Math.hypot(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0])
        if(area<1e-11)continue
        const base=positions.length/3
        positions.push(...a,...b,...c);indices.push(base,base+1,base+2)
        stats.displayTriangles++
      }
    }
  }
  return {positions,indices,stats,chart:'reciprocal-overlap'}
}
