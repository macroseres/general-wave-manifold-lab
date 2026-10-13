import { hopfAtlasAt } from '../../math/sonic/hopfAtlas.js'

/** Diagnostic only: never repairs or connects faces across charts. */
export function auditHopfMesh(mesh, p, side, { threshold = .92, tolerance = 1e-7 } = {}) {
  const positions = mesh.positions ?? []
  const counts = { faces: 0, invalidFaces: 0, degenerateFaces: 0, chartCrossingFaces: 0,
    transitionFaces: 0, invalidProbes: 0, nonPositiveDetProbes: 0, maxTraceResidual: 0,
    boundaryEdges: 0, nonManifoldEdges: 0, connectedComponents: 0 }
  const edges = new Map()
  const vertices = []
  const parent = []
  const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i] } return i }
  const union = (a,b) => { a=find(a);b=find(b);if(a!==b)parent[b]=a }
  const vertexKeys = new Map()
  const keyOf = v => v.map(x => Math.round(x/tolerance)).join(':')
  for (let k=0;k+8<positions.length;k+=9) {
    const tri=[0,1,2].map(i=>positions.slice(k+3*i,k+3*i+3))
    counts.faces++
    if (tri.some(v=>v.some(x=>!Number.isFinite(x)))) { counts.invalidFaces++;continue }
    const a=tri[0],b=tri[1],c=tri[2]
    const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i])
    const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
    if(Math.hypot(...cross)<1e-12)counts.degenerateFaces++
    const hats=tri.map(q=>q[2])
    if(Math.min(...hats)<-threshold&&Math.max(...hats)>threshold)counts.chartCrossingFaces++
    if(hats.some(z=>Math.abs(z)<threshold)&&hats.some(z=>Math.abs(z)>=threshold))counts.transitionFaces++
    const centroid=a.map((x,i)=>(x+b[i]+c[i])/3)
    const h=hopfAtlasAt(...centroid,p,side)
    if(h.kind!=='regular'||!Number.isFinite(h.trace)||!Number.isFinite(h.det))counts.invalidProbes++
    else {counts.maxTraceResidual=Math.max(counts.maxTraceResidual,Math.abs(h.trace));if(h.det < -1e-8)counts.nonPositiveDetProbes++}
    const ids=tri.map(q=>{
      const key=keyOf(q)
      if(!vertexKeys.has(key)){vertexKeys.set(key,parent.length);parent.push(parent.length);vertices.push(q)}
      return vertexKeys.get(key)
    })
    for(let i=0;i<3;i++){
      const x=ids[i],y=ids[(i+1)%3];union(x,y)
      const edge=x<y?`${x}:${y}`:`${y}:${x}`
      edges.set(edge,(edges.get(edge)??0)+1)
    }
  }
  counts.boundaryEdges=[...edges.values()].filter(n=>n===1).length
  counts.nonManifoldEdges=[...edges.values()].filter(n=>n>2).length
  counts.connectedComponents=new Set(parent.map((_,i)=>find(i))).size
  return counts
}

/** Classify exposed edges by measured geometric evidence, not by guessed provenance.
 * 'interior-unresolved' is deliberately NOT labelled numerical rejection: the
 * triangulation alone cannot prove why an adjacent face was omitted.
 */
export function classifyHopfBoundaries(mesh,p,side,{tauMin=-1,tauMax=1,YMin=-6,YMax=6,zcMin=-.999,zcMax=.999,tolerance=1e-7,windowTolerance=1e-5,detTolerance=1e-5,maxExamples=8}={}) {
  const positions=mesh.positions??[]
  const vertices=[],ids=new Map(),edges=new Map()
  const key=v=>v.map(x=>Math.round(x/tolerance)).join(':')
  const id=v=>{const k=key(v);if(!ids.has(k)){ids.set(k,vertices.length);vertices.push(v)}return ids.get(k)}
  for(let k=0;k+8<positions.length;k+=9){
    const tri=[0,1,2].map(i=>positions.slice(k+i*3,k+i*3+3))
    if(tri.some(v=>v.some(x=>!Number.isFinite(x))))continue
    const ix=tri.map(id)
    for(let i=0;i<3;i++){const a=Math.min(ix[i],ix[(i+1)%3]),b=Math.max(ix[i],ix[(i+1)%3]);const ek=`${a}:${b}`;const old=edges.get(ek);edges.set(ek,{a,b,count:(old?.count??0)+1})}
  }
  const categories={windowTau:0,windowY:0,projectiveCut:0,detZero:0,interiorUnresolved:0,invalidProbe:0}
  const examples={};for(const k of Object.keys(categories))examples[k]=[]
  for(const e of edges.values()) {
    if(e.count!==1)continue
    const u=vertices[e.a],v=vertices[e.b],m=u.map((x,i)=>(x+v[i])/2)
    const near=(i,b)=>Math.abs(u[i]-b)<=windowTolerance&&Math.abs(v[i]-b)<=windowTolerance
    let kind
    if(near(0,tauMin)||near(0,tauMax))kind='windowTau'
    else if(near(1,YMin)||near(1,YMax))kind='windowY'
    else if(near(2,zcMin)||near(2,zcMax))kind='projectiveCut'
    else {
      const probes=[u,m,v].map(q=>hopfAtlasAt(...q,p,side))
      if(probes.some(h=>h.kind!=='regular'||!Number.isFinite(h.det)))kind='invalidProbe'
      else if(probes.every(h=>Math.abs(h.det)<=detTolerance))kind='detZero'
      else kind='interiorUnresolved'
    }
    categories[kind]++
    if(examples[kind].length<maxExamples)examples[kind].push(m)
  }
  return {boundaryEdges:Object.values(categories).reduce((a,b)=>a+b,0),categories,examples,classification:'evidence-based; interiorUnresolved does not establish numerical rejection'}
}

