import {jacobian} from '../flux/quadraticFlux.js'

export function stateDiscriminant(U,p){
  const [[a,b],[c,d]]=jacobian(U,p)
  return (a-d)**2+4*b*c
}

/** Grid-cell classification and piecewise-linear zero contour of Δ in the state plane.
 * The contour is a numerical approximation, not an exact algebraic classification.
 * A deterministic diagonal split avoids ambiguous marching-square saddle cases.
 */
export function sampleDiscriminantRegions(p,window,{steps=128}={}){
  const {uMin,uMax,vMin,vMax}=window
  if(![uMin,uMax,vMin,vMax].every(Number.isFinite)||uMin>=uMax||vMin>=vMax||!Number.isInteger(steps)||steps<2||steps>256)throw new RangeError('Invalid discriminant sampling window')
  const nodes=Array.from({length:steps+1},(_,j)=>Array.from({length:steps+1},(_,i)=>{
    const u=uMin+(uMax-uMin)*i/steps,v=vMin+(vMax-vMin)*j/steps
    return {u,v,delta:stateDiscriminant([u,v],p)}
  }))
  const cells=[],segments=[],ellipticPolygons=[]
  const du=(uMax-uMin)/steps,dv=(vMax-vMin)/steps
  const delta=(q)=>stateDiscriminant([q.u,q.v],p)
  // Refine crossings on each grid edge. Adjacent triangles share the same
  // numerical root, so the contour does not acquire cracks at cell edges.
  const interpolate=(a,b)=>{
    if(a.delta===0)return {u:a.u,v:a.v}
    if(b.delta===0)return {u:b.u,v:b.v}
    let lo=0,hi=1,sign=a.delta<0
    for(let k=0;k<12;k++){
      const t=(lo+hi)/2
      const d=delta({u:a.u+t*(b.u-a.u),v:a.v+t*(b.v-a.v)})
      if((d<0)===sign)lo=t
      else hi=t
    }
    const t=(lo+hi)/2
    return {u:a.u+t*(b.u-a.u),v:a.v+t*(b.v-a.v)}
  }
  // Newton projection onto Δ=0, with a bounded correction. The discriminant
  // of a quadratic flux is quadratic in (u,v), so this resolves curvature
  // without globally increasing the 128x128 sampling grid.
  const project=(q)=>{
    let out={...q}
    for(let k=0;k<4;k++){
      const f=delta(out)
      const hU=Math.max(1e-7,du*1e-3),hV=Math.max(1e-7,dv*1e-3)
      const gu=(delta({u:out.u+hU,v:out.v})-delta({u:out.u-hU,v:out.v}))/(2*hU)
      const gv=(delta({u:out.u,v:out.v+hV})-delta({u:out.u,v:out.v-hV}))/(2*hV)
      const norm=gu*gu+gv*gv
      if(!Number.isFinite(norm)||norm<1e-24)break
      const scale=Math.min(1,Math.max(0,Math.hypot(du,dv)*.5/(Math.abs(f)/Math.sqrt(norm)||1)))
      out={u:out.u-scale*f*gu/norm,v:out.v-scale*f*gv/norm}
    }
    return out
  }
  const refineContour=(a,b,depth=0)=>{
    const mid={u:(a.u+b.u)/2,v:(a.v+b.v)/2}
    const root=project(mid)
    const deviation=Math.hypot((root.u-mid.u)/du,(root.v-mid.v)/dv)
    if(depth>=4||!Number.isFinite(deviation)||deviation<.025)return [a,b]
    const left=refineContour(a,root,depth+1)
    const right=refineContour(root,b,depth+1)
    return [...left.slice(0,-1),...right]
  }
  for(let j=0;j<steps;j++)for(let i=0;i<steps;i++){
    const a=nodes[j][i],b=nodes[j][i+1],c=nodes[j+1][i+1],d=nodes[j+1][i]
    const mid={u:(a.u+c.u)/2,v:(a.v+c.v)/2,delta:stateDiscriminant([(a.u+c.u)/2,(a.v+c.v)/2],p)}
    cells.push({u:a.u,v:a.v,du:b.u-a.u,dv:d.v-a.v,kind:mid.delta<0?'elliptic':mid.delta>0?'hyperbolic':'boundary'})
    for(const tri of [[a,b,c],[a,c,d]]){
      // Clip each triangle against Δ < 0. Unlike center-classified grid rectangles,
      // the interpolated boundary also defines the filled region.
      const polygon=[]
      for(let k=0;k<3;k++){
        const x=tri[k],y=tri[(k+1)%3]
        if(x.delta<0)polygon.push({u:x.u,v:x.v})
        if((x.delta<0&&y.delta>=0)||(x.delta>=0&&y.delta<0))polygon.push(interpolate(x,y))
      }
      if(polygon.length>=3)ellipticPolygons.push(polygon)
      const hits=[]
      for(let k=0;k<3;k++){
        const x=tri[k],y=tri[(k+1)%3]
        if((x.delta<0&&y.delta>0)||(x.delta>0&&y.delta<0))hits.push(interpolate(x,y))
        else if(x.delta===0&&y.delta!==0)hits.push({u:x.u,v:x.v})
      }
      if(hits.length===2&&Math.hypot(hits[0].u-hits[1].u,hits[0].v-hits[1].v)>1e-12)segments.push(refineContour(hits[0],hits[1]))
    }
  }
  return {cells,segments,ellipticPolygons,steps}
}
