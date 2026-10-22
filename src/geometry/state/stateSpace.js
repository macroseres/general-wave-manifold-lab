/** Geometry-only adapter for the (u,v) state plane. */
export function stateSpaceGeometry(projection, {padding=.16,minSpan=.12,curves=[],extraPoints=[]}={}) {
  const curvePoints=curves.flatMap(c=>c.points??[])
  const points=[...(projection?[projection.minus,projection.plus,projection.mean]:[]),...curvePoints,...extraPoints]
  if(!points.length)return null
  if(points.some(q=>!Number.isFinite(q.u)||!Number.isFinite(q.v)))return null
  const us=points.map(q=>q.u),vs=points.map(q=>q.v)
  const uMid=(Math.min(...us)+Math.max(...us))/2,vMid=(Math.min(...vs)+Math.max(...vs))/2
  const uSpan=Math.max(minSpan,Math.max(...us)-Math.min(...us)),vSpan=Math.max(minSpan,Math.max(...vs)-Math.min(...vs))
  const span=Math.max(uSpan,vSpan),half=span*(1+2*Math.max(0,padding))/2
  return {uMin:uMid-half,uMax:uMid+half,vMin:vMid-half,vMax:vMid+half,projection,curves,anchorPoints:extraPoints}
}
export function statePointToUnit(point,geometry){return{x:(point.u-geometry.uMin)/(geometry.uMax-geometry.uMin),y:(point.v-geometry.vMin)/(geometry.vMax-geometry.vMin)}}

/** Clip a state-space polyline to an axis-aligned viewport without changing the
 * mathematical curve. Returns visible polyline pieces in state coordinates. */
export function clipStatePolyline(points,window){
  const {uMin,uMax,vMin,vMax}=window
  const code=p=>(p.u<uMin?1:0)|(p.u>uMax?2:0)|(p.v<vMin?4:0)|(p.v>vMax?8:0)
  const clipSegment=(a0,b0)=>{
    let a={...a0},b={...b0},ca=code(a),cb=code(b)
    for(let guard=0;guard<8;guard++){
      if(!(ca|cb))return [a,b]
      if(ca&cb)return null
      const c=ca||cb,du=b.u-a.u,dv=b.v-a.v
      let u,v
      if(c&8){if(Math.abs(dv)<1e-15)return null;u=a.u+du*(vMax-a.v)/dv;v=vMax}
      else if(c&4){if(Math.abs(dv)<1e-15)return null;u=a.u+du*(vMin-a.v)/dv;v=vMin}
      else if(c&2){if(Math.abs(du)<1e-15)return null;v=a.v+dv*(uMax-a.u)/du;u=uMax}
      else {if(Math.abs(du)<1e-15)return null;v=a.v+dv*(uMin-a.u)/du;u=uMin}
      const q={...((c===ca)?a:b),u,v}
      if(c===ca){a=q;ca=code(a)}else{b=q;cb=code(b)}
    }
    return null
  }
  const out=[];let current=[]
  const flush=()=>{if(current.length>1)out.push(current);current=[]}
  for(let i=1;i<points.length;i++){
    const seg=clipSegment(points[i-1],points[i])
    if(!seg){flush();continue}
    const [a,b]=seg,last=current[current.length-1]
    if(!last||Math.hypot(last.u-a.u,last.v-a.v)>1e-9){flush();current=[a,b]}else current.push(b)
  }
  flush();return out
}
