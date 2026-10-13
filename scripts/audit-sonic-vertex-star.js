import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { sonicData } from '../src/math/sonic/sonic.js'
import { zFromZc } from '../src/math/charts/zChart.js'

// Offline mesh-based inspection. No changes to the generator or production Worker.
const domain = { tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:34,nY:28,nZ:50 }
const target = [0,0,.997973177]
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]))
const at=(positions,id)=>Array.from(positions.slice(3*id,3*id+3))
const rounded=q=>q.map(v=>Number(v.toPrecision(10)))
const edgeKey=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`
const phi=(p,q,side)=>{const d=sonicData(q[0],zFromZc(q[2]),p);return d.kind==='regular'?q[1]*d.detM+(side==='minus'?-2:2)*d.K:NaN}
function analyze(p,side){
  const mesh=sonicSurfaceTriangles(p,{...domain,side,diagnostics:false})
  const positions=mesh.positions,indices=mesh.indices
  let vertex=0,best=Infinity
  for(let i=0;i<positions.length/3;i++){const d=dist(at(positions,i),target);if(d<best){best=d;vertex=i}}
  const incident=[],edges=new Map()
  for(let k=0;k<indices.length;k+=3){
    const ids=Array.from(indices.slice(k,k+3))
    if(ids.includes(vertex))incident.push({triangle:k/3,ids})
    for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],key=edgeKey(a,b);const e=edges.get(key);if(e)e.count++;else edges.set(key,{a,b,count:1})}
  }
  const neighbors=new Set(),boundaryAtVertex=[]
  for(const e of edges.values())if(e.a===vertex||e.b===vertex){neighbors.add(e.a===vertex?e.b:e.a);if(e.count===1)boundaryAtVertex.push(e)}
  const link=new Map()
  for(const {ids} of incident){const other=ids.filter(i=>i!==vertex);for(const id of other)if(!link.has(id))link.set(id,new Set());link.get(other[0]).add(other[1]);link.get(other[1]).add(other[0])}
  const visited=new Set();let linkComponents=0
  for(const id of link.keys())if(!visited.has(id)){linkComponents++;const stack=[id];visited.add(id);while(stack.length){for(const next of link.get(stack.pop()))if(!visited.has(next)){visited.add(next);stack.push(next)}}}
  const point=at(positions,vertex)
  return {side,vertices:mesh.vertexCount,triangles:mesh.triangleCount,closestVertex:rounded(point),distanceToTarget:best,absoluteResidual:Math.abs(phi(p,point,side)),incidentTriangles:incident.length,incidentEdges:neighbors.size,boundaryEdgesAtVertex:boundaryAtVertex.map(e=>({otherEndpoint:rounded(at(positions,e.a===vertex?e.b:e.a)),length:dist(at(positions,e.a),at(positions,e.b))})),linkComponents,linkDegrees:[...link.values()].map(s=>s.size).reduce((acc,n)=>(acc[n]=(acc[n]||0)+1,acc),{}),incidentTriangleSamples:incident.slice(0,8).map(({triangle,ids})=>({triangle,vertices:ids.map(id=>rounded(at(positions,id)))}))}
}
const results=['minus','plus'].map(side=>analyze(defaultCoefficients,side))
console.log(JSON.stringify({mode:'sonic-vertex-star-audit',target,notes:['Inspects final triangle-mesh vertex star, not originating tetrahedra.','Boundary vertex link should be a single path; closed link suggests an interior vertex.','No production geometry or Worker code changed.'],results},null,2))
