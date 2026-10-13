import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { flipSonicEdgesExperimental } from '../src/geometry/sonic/edgeFlipExperimental.js'
import { triangleQuality } from '../src/geometry/sonic/experimentalRefinement.js'
import { implicitEstimate } from '../src/geometry/sonic/projectedRefinement.js'
const params={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
function stats(mesh,side){
  const p=i=>Array.from(mesh.positions.slice(i*3,i*3+3)),edges=new Map(),samples=[]
  let skinny=0,nonfinite=0
  for(let k=0;k<mesh.indices.length;k+=3){
    const ids=Array.from(mesh.indices.slice(k,k+3)),[a,b,c]=ids.map(p)
    const q=triangleQuality(a,b,c)
    if(q<.01)skinny++
    if(!Number.isFinite(q))nonfinite++
    const scale=Math.max(Math.hypot(...a.map((v,i)=>v-b[i])),Math.hypot(...b.map((v,i)=>v-c[i])),Math.hypot(...c.map((v,i)=>v-a[i])))
    const sample=a.map((v,i)=>(v+b[i]+c[i])/3),e=implicitEstimate(sample,params,side)
    if(e)samples.push(e.estimate/scale)
    for(const [x,y] of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){const key=x<y?`${x}:${y}`:`${y}:${x}`;edges.set(key,(edges.get(key)||0)+1)}
  }
  samples.sort((a,b)=>a-b)
  return {vertices:mesh.vertexCount,triangles:mesh.triangleCount,skinny,nonfinite,boundary:[...edges.values()].filter(n=>n===1).length,nonmanifold:[...edges.values()].filter(n=>n>2).length,centroidRelativeError:{p95:samples[Math.floor(.95*(samples.length-1))],p99:samples[Math.floor(.99*(samples.length-1))],max:samples.at(-1)}}
}
for(const grid of [{nTau:34,nY:28,nZ:50},{nTau:48,nY:40,nZ:72}])for(const side of ['minus','plus']){
  const original=sonicSurfaceTriangles(params,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,...grid,side})
  const experimental=flipSonicEdgesExperimental(original,params,side)
  console.log(JSON.stringify({grid,side,original:stats(original,side),experimental:stats(experimental,side),flipping:experimental.experimentalEdgeFlips}))
}
