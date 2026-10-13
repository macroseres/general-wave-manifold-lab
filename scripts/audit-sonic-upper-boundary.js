import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { sonicData } from '../src/math/sonic/sonic.js'
import { zFromZc } from '../src/math/charts/zChart.js'

// Offline, read-only investigation of the compactified upper boundary.
const domain={tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999}
const near=(a,b,eps=1e-8)=>Math.abs(a-b)<=eps
const onBoundary=([t,y,z])=>near(t,-5)||near(t,5)||near(y,-6)||near(y,6)||near(z,-.999)||near(z,.999)
const point=(p,i)=>p.slice(3*i,3*i+3)
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]))
const boundaryDistance=([t,y,z])=>Math.min(Math.abs(t+5),Math.abs(t-5),Math.abs(y+6),Math.abs(y-6),Math.abs(z+.999),Math.abs(z-.999))
const phi=(q,side)=>{const d=sonicData(q[0],zFromZc(q[2]),defaultCoefficients);return d.kind==='regular'?q[1]*d.detM+(side==='minus'?-2:2)*d.K:NaN}
const round=x=>Number(x.toPrecision(9))
const coords=q=>q.map(round)
const analyze=(mesh,side)=>{
  const edges=new Map()
  for(let i=0;i<mesh.indices.length;i+=3){
    const tri=mesh.indices.slice(i,i+3)
    for(let j=0;j<3;j++){
      const a=tri[j],b=tri[(j+1)%3],key=a<b?`${a}:${b}`:`${b}:${a}`
      const e=edges.get(key);if(e)e.count++;else edges.set(key,{a,b,count:1})
    }
  }
  const boundary=[...edges.values()].filter(e=>e.count===1)
  const mixed=boundary.filter(e=>onBoundary(point(mesh.positions,e.a))!==onBoundary(point(mesh.positions,e.b)))
  return {boundaryEdges:boundary.length,mixedBoundaryEdges:mixed.length,mixedSamples:mixed.map(e=>{
    const a=point(mesh.positions,e.a),b=point(mesh.positions,e.b)
    return {endpoints:[coords(a),coords(b)],length:round(distance(a,b)),boundaryDistances:[round(boundaryDistance(a)),round(boundaryDistance(b))],absoluteResiduals:[round(Math.abs(phi(a,side))),round(Math.abs(phi(b,side)))]}
  }),upperBoundaryEdges:boundary.filter(e=>[e.a,e.b].some(i=>point(mesh.positions,i)[2]>.95)).length}
}
const resolutionCases=[{nTau:34,nY:28,nZ:50},{nTau:34,nY:28,nZ:100}]
const results=[]
for(const resolution of resolutionCases){
  for(const side of ['minus','plus']){
    const mesh=sonicSurfaceTriangles(defaultCoefficients,{...domain,...resolution,side,diagnostics:false})
    const topology=analyze(mesh,side)
    results.push({side,resolution,triangles:mesh.triangleCount,vertices:mesh.vertexCount,...topology})
  }
}
console.log(JSON.stringify({mode:'sonic-upper-boundary-local-investigation',notes:['The nZ=100 case refines the z direction globally; it is an offline sensitivity test, not a production setting.','A mixed boundary edge alone does not prove a hole.','Residuals near zc=0.999 may be ill-conditioned; inspect geometric distances separately.','No production geometry or Worker code is modified.'],results},null,2))
