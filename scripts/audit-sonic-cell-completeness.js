import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { sonicData } from '../src/math/sonic/sonic.js'
import { zFromZc } from '../src/math/charts/zChart.js'

const domain={tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:34,nY:28,nZ:50}
const cells=[[17,13,51],[17,14,51],[18,13,51],[18,14,51]]
const phi=(side,q)=>{const d=sonicData(q[0],zFromZc(q[2]),defaultCoefficients);return d.kind==='regular'?q[1]*d.detM+(side==='minus'?-2:2)*d.K:NaN}
const results=['minus','plus'].map(side=>{
  const mesh=sonicSurfaceTriangles(defaultCoefficients,{...domain,side,traceCells:cells})
  const records=mesh.cellTraceRecords
  const mismatches=records.filter(r=>r.expectedTriangles!==r.emittedTriangles)
  const triIndices=new Set(records.flatMap(r=>r.triangleIndices))
  const residuals=[]
  for(const t of triIndices){
    const ids=mesh.indices.slice(t*3,t*3+3)
    const qs=ids.map(id=>mesh.positions.slice(id*3,id*3+3))
    const centroid=[0,1,2].map(k=>(qs[0][k]+qs[1][k]+qs[2][k])/3)
    const value=phi(side,centroid)
    residuals.push({triangle:t,centroid,absoluteResidual:Math.abs(value)})
  }
  residuals.sort((a,b)=>b.absoluteResidual-a.absoluteResidual)
  const counts={};for(const r of records){const vals=r.values;const key=vals.some(v=>!Number.isFinite(v))?'invalid':`${vals.filter(v=>v>2e-11).length}pos-${vals.filter(v=>v< -2e-11).length}neg-${vals.filter(v=>Math.abs(v)<=2e-11).length}zero`;counts[key]=(counts[key]||0)+1}
  return {side,cellCount:cells.length,tetrahedronCount:records.length,expectedTriangles:records.reduce((a,r)=>a+(r.expectedTriangles||0),0),emittedTriangles:records.reduce((a,r)=>a+r.emittedTriangles,0),mismatchCount:mismatches.length,mismatches,signPatterns:counts,centroidResidual:{sampledTriangles:residuals.length,max:residuals[0]||null,topTen:residuals.slice(0,10)}}
})
console.log(JSON.stringify({mode:'sonic-cell-completeness',domain,cells,notes:['Independent expected triangle counts from tetrahedron vertex signs; does not certify completeness of nonlinear zero sets inside same-sign tetrahedra.','Centroid residuals assess geometric interpolation quality, not topological correctness.','Normal production rendering unchanged; tracing is opt-in.'],results},null,2))
