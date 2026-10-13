import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'

const domain={tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:34,nY:28,nZ:50}
const target=[0,0,0.9979731774678219]
const norm=q=>Math.hypot(...q)
const sub=(a,b)=>a.map((v,i)=>v-b[i])
const results=['minus','plus'].map(side=>{
  const mesh=sonicSurfaceTriangles(defaultCoefficients,{...domain,side,traceTarget:target})
  const positions=mesh.positions,indices=mesh.indices
  let closest=-1,distance=Infinity
  for(let i=0;i<positions.length/3;i++){
    const d=norm(sub(positions.slice(3*i,3*i+3),target))
    if(d<distance){distance=d;closest=i}
  }
  const incident=[]
  for(let k=0;k<indices.length;k+=3)if(indices.slice(k,k+3).includes(closest))incident.push(k/3)
  const recorded=new Set(mesh.traceRecords.map(r=>r.triangleIndex))
  const missing=incident.filter(i=>!recorded.has(i))
  const cells=[...new Set(mesh.traceRecords.map(r=>r.cell.join(',')))].sort()
  return {side,closestVertex:closest,distance,incidentTriangleCount:incident.length,tracedTriangleCount:mesh.traceRecords.length,missingIncidentTriangles:missing,sourceCells:cells,records:mesh.traceRecords}
})
console.log(JSON.stringify({mode:'sonic-tetrahedron-provenance',target,notes:['Traces tetrahedra producing triangles touching P; does not establish whether un-emitted tetrahedra should produce triangles.','No production rendering changes: traceTarget is optional and omitted in normal operation.'],results},null,2))
