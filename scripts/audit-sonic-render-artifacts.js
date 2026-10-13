import {sonicSurfaceTriangles} from '../src/geometry/sonic/surface.js'

// Geometry-only investigation: no renderer or mesh generation changes.
const p={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
const grids=[{nTau:34,nY:28,nZ:50},{nTau:48,nY:40,nZ:72}]
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
const sub=(a,b)=>a.map((v,i)=>v-b[i])
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const norm=a=>Math.hypot(...a)
const point=(m,i)=>Array.from(m.positions.slice(3*i,3*i+3))
const quant=(v)=>v.map(x=>Math.round(x*1e8)).join(':')
function inspect(m){
 const edges=new Map(),faces=[],triangleKeys=new Map(),zones={left:[],center:[],right:[],nearUpper:[],nearLower:[]}
 let invalid=0,degenerate=0,skinny=0,duplicateFaces=0
 for(let t=0;t<m.indices.length/3;t++){
  const ids=Array.from(m.indices.slice(t*3,t*3+3)),v=ids.map(i=>point(m,i)),e1=sub(v[1],v[0]),e2=sub(v[2],v[0]),n=cross(e1,e2),area2=norm(n)
  const ls=[norm(e1),norm(sub(v[2],v[1])),norm(e2)],q=area2?2*Math.sqrt(3)*area2/(ls.reduce((s,x)=>s+x*x,0)):0
  const centroid=v[0].map((_,i)=>(v[0][i]+v[1][i]+v[2][i])/3)
  const face={t,ids,centroid,n:area2?n.map(x=>x/area2):[0,0,0],quality:q,area2}
  faces.push(face)
  if(!Number.isFinite(q)||!centroid.every(Number.isFinite))invalid++
  if(area2===0)degenerate++
  if(q<.01)skinny++
  const signature=v.map(quant).sort().join('|');if(triangleKeys.has(signature))duplicateFaces++;else triangleKeys.set(signature,t)
  if(centroid[0]<-3.5)zones.left.push(t)
  else if(centroid[0]>3.5)zones.right.push(t)
  else zones.center.push(t)
  if(centroid[2]>.9)zones.nearUpper.push(t)
  if(centroid[2]<-.9)zones.nearLower.push(t)
  for(const [u,w] of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){
   const key=u<w?`${u}:${w}`:`${w}:${u}`
   if(!edges.has(key))edges.set(key,[])
   edges.get(key).push({t,dir:u<w?1:-1})
  }
 }
 let boundary=0,nonmanifold=0,orientationConflicts=0,sharpNormalPairs=0,opposingNormalPairs=0
 const affected=new Set(),examples=[]
 for(const [key,inc] of edges){
  if(inc.length===1)boundary++
  if(inc.length>2)nonmanifold++
  if(inc.length!==2)continue
  const [a,b]=inc,cos=dot(faces[a.t].n,faces[b.t].n)
  const conflict=a.dir===b.dir
  if(conflict)orientationConflicts++
  if(cos<.5)sharpNormalPairs++
  if(cos<0)opposingNormalPairs++
  if(conflict||cos<0){affected.add(a.t);affected.add(b.t);if(examples.length<8)examples.push({edge:key,orientationConflict:conflict,normalDot:+cos.toFixed(5),centroid:faces[a.t].centroid.map(x=>+x.toFixed(4))})}
 }
 const region={}
 for(const [name,ids] of Object.entries(zones)){
  const sorted=ids.map(t=>faces[t].quality).sort((a,b)=>a-b)
  region[name]={triangles:ids.length,skinny:ids.filter(t=>faces[t].quality<.01).length,affected:ids.filter(t=>affected.has(t)).length,minQuality:sorted[0]??null}
 }
 return {vertices:m.vertexCount,triangles:m.triangleCount,boundary,nonmanifold,invalid,degenerate,skinny,duplicateFaces,orientationConflicts,sharpNormalPairs,opposingNormalPairs,regions:region,examples}
}
for(const grid of grids){
 const m=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,...grid,side:'minus'})
 console.log(JSON.stringify({grid,side:'minus',...inspect(m)}))
}
