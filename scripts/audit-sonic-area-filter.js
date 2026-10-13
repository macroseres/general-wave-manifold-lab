import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { sonicData } from '../src/math/sonic/sonic.js'
import { zFromZc } from '../src/math/charts/zChart.js'

const domain = {tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:34,nY:28,nZ:50}
const cells = [[17,13,51],[17,14,51],[18,13,51],[18,14,51]]
const P = [0,0,0.9979731774678219]
const thresholds = [{label:'current',value:1e-10},{label:'experimental',value:1e-14},{label:'zero-only',value:0}]
const coord=(m,id)=>m.positions.slice(3*id,3*id+3)
const boundary=q=>Math.abs(q[0]-domain.tauMin)<1e-8||Math.abs(q[0]-domain.tauMax)<1e-8||Math.abs(q[1]-domain.YMin)<1e-8||Math.abs(q[1]-domain.YMax)<1e-8||Math.abs(q[2]-domain.zcMin)<1e-8||Math.abs(q[2]-domain.zcMax)<1e-8
const dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]))
function topology(m){
  const edges=new Map(),adj=new Map(),triangleAdj=new Map()
  const add=(a,b,t)=>{const key=a<b?`${a}:${b}`:`${b}:${a}`;const e=edges.get(key);if(e)e.push(t);else edges.set(key,[t])}
  for(let i=0;i<m.indices.length;i+=3){const [a,b,c]=m.indices.slice(i,i+3);add(a,b,i/3);add(b,c,i/3);add(c,a,i/3)}
  let incidence1=0,incidence2=0,incidenceOver2=0,mixed=0,interior=0,domainEdges=0
  for(const [key,ts] of edges){if(ts.length===1){incidence1++;const [a,b]=key.split(':').map(Number);const ba=boundary(coord(m,a)),bb=boundary(coord(m,b));if(ba&&bb)domainEdges++;else if(ba||bb)mixed++;else interior++;if(!adj.has(a))adj.set(a,new Set());if(!adj.has(b))adj.set(b,new Set());adj.get(a).add(b);adj.get(b).add(a)}else if(ts.length===2)incidence2++;else incidenceOver2++;for(let i=1;i<ts.length;i++){if(!triangleAdj.has(ts[0]))triangleAdj.set(ts[0],new Set());if(!triangleAdj.has(ts[i]))triangleAdj.set(ts[i],new Set());triangleAdj.get(ts[0]).add(ts[i]);triangleAdj.get(ts[i]).add(ts[0])}}
  let loops=0,openPaths=0,branchVertices=0;const seen=new Set()
  for(const [v,neighbors] of adj){if(neighbors.size>2)branchVertices++;if(seen.has(v))continue;const queue=[v];seen.add(v);let ends=0;for(let k=0;k<queue.length;k++){const w=queue[k];if(adj.get(w).size===1)ends++;for(const u of adj.get(w))if(!seen.has(u)){seen.add(u);queue.push(u)}}if(ends===0)loops++;else openPaths++}
  let connectedTriangleComponents=0;const visited=new Set()
  for(let t=0;t<m.triangleCount;t++){if(visited.has(t))continue;connectedTriangleComponents++;const q=[t];visited.add(t);for(let k=0;k<q.length;k++)for(const u of triangleAdj.get(q[k])||[])if(!visited.has(u)){visited.add(u);q.push(u)}}
  const near=m.positions.length/3 ? Array.from({length:m.vertexCount},(_,i)=>i).reduce((best,i)=>dist(coord(m,i),P)<dist(coord(m,best),P)?i:best,0):null
  const incident=near===null?[]:m.indices.flatMap((_,i)=>i%3===0&&m.indices.slice(i,i+3).includes(near)?[i/3]:[])
  const atP=near===null?null:{distance:dist(coord(m,near),P),incidentTriangles:incident.length,boundaryEdges:[...edges].filter(([k,ts])=>ts.length===1&&k.split(':').map(Number).includes(near)).length}
  return {uniqueEdges:edges.size,incidence1,incidence2,incidenceOver2,boundaryEdgesOnDomain:domainEdges,mixedBoundaryEdges:mixed,interiorBoundaryEdges:interior,boundaryLoops:loops,openBoundaryComponents:openPaths,boundaryBranchVertices:branchVertices,connectedTriangleComponents,atP}
}
const phi=(side,q)=>{const d=sonicData(q[0],zFromZc(q[2]),defaultCoefficients);return d.kind==='regular'?q[1]*d.detM+(side==='minus'?-2:2)*d.K:NaN}
function residuals(m,side){const samples=[];for(const r of m.cellTraceRecords){for(const t of r.triangleIndices){const ids=m.indices.slice(3*t,3*t+3);const pts=ids.map(id=>coord(m,id));const c=[0,1,2].map(k=>(pts[0][k]+pts[1][k]+pts[2][k])/3);const v=phi(side,c);const h=[1e-5,1e-5,1e-7];const g=h.map((step,i)=>{const a=[...c],b=[...c];a[i]+=step;b[i]-=step;return (phi(side,a)-phi(side,b))/(2*step)});const n=Math.hypot(...g);samples.push({triangle:t,absoluteResidual:Math.abs(v),newtonDistanceEstimate:n>0?Math.abs(v)/n:null})}}
 const finite=samples.filter(s=>Number.isFinite(s.absoluteResidual)&&Number.isFinite(s.newtonDistanceEstimate));const byResidual=[...finite].sort((a,b)=>b.absoluteResidual-a.absoluteResidual);const byDistance=[...finite].sort((a,b)=>b.newtonDistanceEstimate-a.newtonDistanceEstimate);return {sampleCount:finite.length,maxAbsoluteResidual:byResidual[0]||null,maxNewtonDistanceEstimate:byDistance[0]||null}}
const results=[]
for(const side of ['minus','plus'])for(const threshold of thresholds){const mesh=sonicSurfaceTriangles(defaultCoefficients,{...domain,side,minCrossNorm:threshold.value,traceCells:cells});const records=mesh.cellTraceRecords;results.push({side,threshold:threshold.label,minCrossNorm:threshold.value,triangles:mesh.triangleCount,vertices:mesh.vertexCount,localExpected:records.reduce((s,r)=>s+(r.expectedTriangles||0),0),localEmitted:records.reduce((s,r)=>s+r.emittedTriangles,0),localRejections:records.flatMap(r=>r.rejections).reduce((acc,r)=>(acc[r.reason]=(acc[r.reason]||0)+1,acc),{}),topology:topology(mesh),localGeometry:residuals(mesh,side)})}
console.log(JSON.stringify({mode:'sonic-area-filter-comparison',domain,cells,notes:['Offline-only optional minCrossNorm; default 1e-10 is unchanged in production.','Sign-count expectation assumes affine tetrahedral interpolation; does not prove nonlinear completeness.','Newton distance is first-order only and is not a certified distance.','zero-only retains triangles with positive cross norm, but still rejects exactly zero-area or merged-vertex triangles.'],results},null,2))
