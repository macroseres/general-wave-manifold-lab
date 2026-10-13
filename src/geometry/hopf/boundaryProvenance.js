/** Associate exposed edges with rejected candidate triangles by geometric proximity.
 * Proximity is evidence of adjacency, NOT proof that a rejection caused a hole.
 * All coordinates are normalized to the plotted domain before distances are taken.
 */
export function auditHopfBoundaryProvenance(mesh, rejectedTriangles, {
  tauMin=-1,tauMax=1,YMin=-6,YMax=6,zcMin=-.999,zcMax=.999,
  vertexTolerance=1e-7,nearDistance=.015,maxExamples=6,
}={}) {
  const origin=[tauMin,YMin,zcMin]
  const spans=[tauMax-tauMin,YMax-YMin,zcMax-zcMin].map(x=>Math.max(Math.abs(x),1e-12))
  const normalized=p=>p.map((x,i)=>(x-origin[i])/spans[i])
  const key=p=>p.map(x=>Math.round(x/vertexTolerance)).join(':')
  const vertices=[],lookup=new Map(),edges=new Map()
  const vertexId=p=>{const k=key(p);if(!lookup.has(k)){lookup.set(k,vertices.length);vertices.push(p)}return lookup.get(k)}
  for(let i=0;i+8<(mesh.positions?.length??0);i+=9){
    const ids=[0,1,2].map(j=>vertexId(mesh.positions.slice(i+3*j,i+3*j+3)))
    for(let j=0;j<3;j++){
      const a=Math.min(ids[j],ids[(j+1)%3]),b=Math.max(ids[j],ids[(j+1)%3]);const k=`${a}:${b}`
      edges.set(k,{a,b,count:(edges.get(k)?.count??0)+1})
    }
  }
  const candidates=(rejectedTriangles??[]).filter(t=>t.vertices?.length===3&&t.vertices.every(v=>v?.length===3&&v.every(Number.isFinite))).map(t=>{
    const v=t.vertices.map(normalized)
    const center=v[0].map((x,i)=>(x+v[1][i]+v[2][i])/3)
    const radius=Math.max(...v.map(q=>Math.hypot(...q.map((x,i)=>x-center[i]))))
    return {reason:t.reason,v,center,radius}
  })
  const distPointSegment=(p,a,b)=>{
    const d=b.map((x,i)=>x-a[i]),den=d.reduce((s,x)=>s+x*x,0)
    const t=den?Math.max(0,Math.min(1,d.reduce((s,x,i)=>s+x*(p[i]-a[i]),0)/den)):0
    return Math.hypot(...p.map((x,i)=>x-a[i]-t*d[i]))
  }
  const distPointTriangle=(p,v)=>{
    // Exact enough for provenance: project to triangle plane if inside,
    // otherwise use distance to the three boundary segments.
    const [a,b,c]=v,u=b.map((x,i)=>x-a[i]),w=c.map((x,i)=>x-a[i]),q=p.map((x,i)=>x-a[i])
    const uu=u.reduce((s,x)=>s+x*x,0),uw=u.reduce((s,x,i)=>s+x*w[i],0),ww=w.reduce((s,x)=>s+x*x,0)
    const uq=u.reduce((s,x,i)=>s+x*q[i],0),wq=w.reduce((s,x,i)=>s+x*q[i],0),den=uu*ww-uw*uw
    if(den>1e-24){const t=(uq*ww-wq*uw)/den,r=(wq*uu-uq*uw)/den
      if(t>=0&&r>=0&&t+r<=1)return Math.hypot(...q.map((x,i)=>x-t*u[i]-r*w[i]))
    }
    return Math.min(distPointSegment(p,a,b),distPointSegment(p,b,c),distPointSegment(p,c,a))
  }
  const counts={total:0,nearSingleReason:0,nearMultipleReasons:0,noNearbyRejectedTriangle:0}
  const byReason={},examples={single:[],multiple:[],none:[]}
  for(const edge of edges.values()){
    if(edge.count!==1)continue
    counts.total++
    const midpoint=vertices[edge.a].map((x,i)=>(x+vertices[edge.b][i])/2)
    const point=normalized(midpoint),found=new Set()
    for(const t of candidates){
      if(Math.hypot(...point.map((x,i)=>x-t.center[i]))>t.radius+nearDistance)continue
      if(distPointTriangle(point,t.v)<=nearDistance)found.add(t.reason)
    }
    const reasons=[...found].sort()
    if(reasons.length===0){counts.noNearbyRejectedTriangle++;if(examples.none.length<maxExamples)examples.none.push(midpoint)}
    else if(reasons.length===1){counts.nearSingleReason++;byReason[reasons[0]]=(byReason[reasons[0]]??0)+1;if(examples.single.length<maxExamples)examples.single.push({midpoint,reason:reasons[0]})}
    else {counts.nearMultipleReasons++;if(examples.multiple.length<maxExamples)examples.multiple.push({midpoint,reasons})}
  }
  return {counts,byReason,examples,nearDistance,validRejectedCandidates:candidates.length,method:'normalized midpoint-to-rejected-triangle proximity; association is not causation'}
}
