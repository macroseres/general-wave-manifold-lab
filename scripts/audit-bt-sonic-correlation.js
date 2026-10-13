/** Diagnostic only: correlate BT polyline corners with implicit sonic mesh errors. */
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { partitionSonicMesh } from '../src/geometry/sonic/spectralPartition.js'
import { stitchBtSegments } from '../src/geometry/sonic/smoothBtCurve.js'
import { implicitEstimate } from '../src/geometry/sonic/projectedRefinement.js'
import { betheWendroffData } from '../src/math/sonic/betheWendroff.js'

const p = { a20:-4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0 }
const grid={tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:34,nY:28,nZ:50,side:'minus'}
const distance=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]))
const mid=(a,b)=>a.map((x,i)=>(x+b[i])/2)
const point=(mesh,i)=>Array.from(mesh.positions.slice(3*i,3*i+3))
const summary=values=>{const a=values.filter(Number.isFinite).sort((x,y)=>x-y);const at=t=>a[Math.min(a.length-1,Math.floor(t*(a.length-1)))];return {count:a.length,median:at(.5)??null,p95:at(.95)??null,max:a.at(-1)??null}}
const mesh=sonicSurfaceTriangles(p,grid)
const errors=[],worst=[]
for(let k=0;k<mesh.indices.length;k+=3){
  const [a,b,c]=Array.from(mesh.indices.slice(k,k+3)).map(i=>point(mesh,i))
  const length=Math.max(distance(a,b),distance(b,c),distance(c,a))
  const q=[a.map((x,i)=>(x+b[i]+c[i])/3),mid(a,b),mid(b,c),mid(c,a)]
  const vals=q.map(x=>implicitEstimate(x,p,'minus')?.estimate).filter(Number.isFinite)
  if(!vals.length)continue
  const relative=Math.max(...vals)/Math.max(length,1e-14)
  errors.push(relative)
  worst.push({triangle:k/3,relative,center:q[0]})
}
worst.sort((a,b)=>b.relative-a.relative)
const split=partitionSonicMesh(mesh,p,'minus')
const paths=stitchBtSegments(split.bt)
const corners=[]
for(let pathIndex=0;pathIndex<paths.length;pathIndex++){
 const path=paths[pathIndex]
 for(let i=1;i<path.length-1;i++){
  const a=path[i-1],b=path[i],c=path[i+1]
  if(!Array.isArray(a)||!Array.isArray(b)||!Array.isArray(c))continue
  const u=a.map((v,j)=>v-b[j]),v=c.map((w,j)=>w-b[j]);const nu=Math.hypot(...u),nv=Math.hypot(...v)
  if(nu<1e-12||nv<1e-12)continue
  const angle=Math.acos(Math.max(-1,Math.min(1,u.reduce((s,x,j)=>s+x*v[j],0)/(nu*nv))))*180/Math.PI
  const sonic=implicitEstimate(b,p,'minus')
  const bt=betheWendroffData(b[0],b[1],b[2],p,'minus')
  corners.push({path:pathIndex,index:i,turnDegrees:180-angle,point:b,sonicEstimatedDistance:sonic?.estimate??null,btGap:bt.kind==='regular'?bt.gap:null})
 }
}
corners.sort((a,b)=>b.turnDegrees-a.turnDegrees)
console.log(JSON.stringify({configuration:p,grid,mesh:{vertices:mesh.vertexCount,triangles:mesh.triangleCount},sonicInteriorRelativeError:summary(errors),worstTriangles:worst.slice(0,12),bt:{segments:split.bt.length,polylines:paths.length,cornersExamined:corners.length,largestTurns:corners.slice(0,15)}},null,2))
