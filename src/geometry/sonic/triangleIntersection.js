// Independent geometric intersection of indexed triangular surfaces in (tau,Y,zc).
const sub=(a,b)=>a.map((v,i)=>v-b[i])
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0)
const dist=(a,b)=>Math.hypot(...sub(a,b))
function triangles(mesh){
  const {positions=[],indices=[]}=mesh||{},out=[]
  for(let i=0;i<indices.length;i+=3){
    const pts=[indices[i],indices[i+1],indices[i+2]].map(j=>Array.from(positions.slice(3*j,3*j+3)))
    if(pts.some(q=>q.some(v=>!Number.isFinite(v))))continue
    const min=[0,1,2].map(k=>Math.min(...pts.map(q=>q[k])))
    const max=[0,1,2].map(k=>Math.max(...pts.map(q=>q[k])))
    out.push({pts,min,max})
  }
  return out
}
function edgeTriangle(a,b,t,eps){
  const [v0,v1,v2]=t.pts,dir=sub(b,a),e1=sub(v1,v0),e2=sub(v2,v0)
  const h=cross(dir,e2),det=dot(e1,h)
  if(Math.abs(det)<eps)return null
  const inv=1/det,s=sub(a,v0),u=inv*dot(s,h)
  if(u < -eps||u>1+eps)return null
  const q=cross(s,e1),v=inv*dot(dir,q)
  if(v < -eps||u+v>1+eps)return null
  const w=inv*dot(e2,q)
  if(w < -eps||w>1+eps)return null
  return a.map((x,k)=>x+w*dir[k])
}
function pairIntersection(a,b,eps){
  const pts=[]
  for(const [source,target] of [[a,b],[b,a]]){
    for(const [i,j] of [[0,1],[1,2],[2,0]]){
      const q=edgeTriangle(source.pts[i],source.pts[j],target,eps)
      if(q&&!pts.some(p=>dist(p,q)<eps*10))pts.push(q)
    }
  }
  if(pts.length<2)return null
  let best=[pts[0],pts[1]],length=dist(...best)
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
    const d=dist(pts[i],pts[j]);if(d>length){length=d;best=[pts[i],pts[j]]}
  }
  return length>eps*10?best:null
}
/** Actual triangle-triangle intersections; no implicit function or canonical DS/J used. */
export function intersectSonicTriangleMeshes(minusMesh,plusMesh,{epsilon=1e-9,cellSize=.5}={}){
  const aa=triangles(minusMesh),bb=triangles(plusMesh),grid=new Map()
  const cells=t=>{
    const low=t.min.map(v=>Math.floor(v/cellSize)),high=t.max.map(v=>Math.floor(v/cellSize)),keys=[]
    for(let i=low[0];i<=high[0];i++)for(let j=low[1];j<=high[1];j++)for(let k=low[2];k<=high[2];k++)keys.push(`${i},${j},${k}`)
    return keys
  }
  bb.forEach((t,i)=>{for(const key of cells(t)){if(!grid.has(key))grid.set(key,[]);grid.get(key).push(i)}})
  const segments=[],seen=new Set()
  for(const a of aa){
    const candidates=new Set(cells(a).flatMap(key=>grid.get(key)||[]))
    for(const index of candidates){
      const b=bb[index]
      if(a.min.some((v,k)=>v>b.max[k]+epsilon||b.min[k]>a.max[k]+epsilon))continue
      const segment=pairIntersection(a,b,epsilon)
      if(!segment)continue
      const key=segment.map(p=>p.map(v=>Math.round(v/1e-6)).join(',')).sort().join('|')
      if(!seen.has(key)){seen.add(key);segments.push(segment)}
    }
  }
  return {segments,segmentCount:segments.length,triangleCounts:[aa.length,bb.length]}
}
