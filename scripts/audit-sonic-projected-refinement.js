import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { refineProjectedSonicMesh, implicitEstimate } from '../src/geometry/sonic/projectedRefinement.js'
import { triangleQuality } from '../src/geometry/sonic/experimentalRefinement.js'
const p={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
const point=(m,i)=>Array.from(m.positions.slice(3*i,3*i+3))
const norm=v=>Math.hypot(...v)
const diff=(a,b)=>a.map((v,i)=>v-b[i])
function stats(m,side){
  const edges=new Map(),errors=[],vertexErrors=[]
  let skinny=0,nonfinite=0,degenerate=0
  for(let i=0;i<m.vertexCount;i++){
    const e=implicitEstimate(point(m,i),p,side)
    if(e)vertexErrors.push(e.estimate)
  }
  for(let k=0;k<m.indices.length;k+=3){
    const ids=Array.from(m.indices.slice(k,k+3)),pts=ids.map(i=>point(m,i))
    const q=triangleQuality(...pts)
    if(!Number.isFinite(q))nonfinite++
    if(q<.01)skinny++
    if(q===0)degenerate++
    const scale=Math.max(norm(diff(pts[0],pts[1])),norm(diff(pts[1],pts[2])),norm(diff(pts[2],pts[0])))
    const samples=[pts[0].map((v,i)=>(v+pts[1][i]+pts[2][i])/3),...[[0,1],[1,2],[2,0]].map(([a,b])=>pts[a].map((v,i)=>(v+pts[b][i])/2))]
    for(const sample of samples){const e=implicitEstimate(sample,p,side);if(e)errors.push(e.estimate/scale)}
    for(const [a,b] of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){const key=a<b?`${a}:${b}`:`${b}:${a}`;edges.set(key,(edges.get(key)||0)+1)}
  }
  const summary=v=>{v.sort((a,b)=>a-b);return {p95:v[Math.floor(.95*(v.length-1))],p99:v[Math.floor(.99*(v.length-1))],max:v.at(-1)}}
  return {vertices:m.vertexCount,triangles:m.triangleCount,skinny,degenerate,nonfinite,boundary:[...edges.values()].filter(n=>n===1).length,nonmanifold:[...edges.values()].filter(n=>n>2).length,interiorRelativeError:summary(errors),vertexEstimatedDistance:summary(vertexErrors)}
}
for(const grid of [{nTau:34,nY:28,nZ:50},{nTau:48,nY:40,nZ:72}])for(const side of ['minus','plus']){
  const m=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,...grid,side})
  const r=refineProjectedSonicMesh(m,p,side)
  console.log(JSON.stringify({grid,side,original:stats(m,side),experimental:stats(r,side),refinement:r.experimentalRefinement}))
}
