import {sonicSurfaceTriangles} from '../src/geometry/sonic/surface.js'
import {sonicData} from '../src/math/sonic/sonic.js'
import {zFromZc} from '../src/math/charts/zChart.js'
const p={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
const grids=[{nTau:34,nY:28,nZ:50},{nTau:48,nY:40,nZ:72}]
const point=(m,i)=>m.positions.slice(i*3,i*3+3)
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]))
const cross=(u,v)=>Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
function audit(m,side){const edges=new Map(),worst=[];let skinny=0,nonfinite=0;for(let k=0;k<m.indices.length;k+=3){const ids=m.indices.slice(k,k+3),pts=ids.map(i=>point(m,i)),lens=[dist(pts[0],pts[1]),dist(pts[1],pts[2]),dist(pts[2],pts[0])],a=cross(pts[1].map((v,i)=>v-pts[0][i]),pts[2].map((v,i)=>v-pts[0][i]));const quality=2*Math.sqrt(3)*a/lens.reduce((s,v)=>s+v*v,0);if(quality<.01)skinny++;if(!Number.isFinite(quality))nonfinite++;const centroid=pts[0].map((_,i)=>(pts[0][i]+pts[1][i]+pts[2][i])/3);const d=sonicData(centroid[0],zFromZc(centroid[2]),p);const phi=d.kind==='regular'?centroid[1]*d.detM+(side==='minus'?-2:2)*d.K:NaN;const candidate={quality,areaCross:a,maxEdge:Math.max(...lens),centroid,phi};if(worst.length<8||quality<worst.at(-1).quality){worst.push(candidate);worst.sort((a,b)=>a.quality-b.quality);worst.length=Math.min(worst.length,8)}for(const [u,v] of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){const key=u<v?`${u}:${v}`:`${v}:${u}`;edges.set(key,(edges.get(key)||0)+1)}}let boundary=0,nonmanifold=0;for(const n of edges.values()){if(n===1)boundary++;if(n>2)nonmanifold++}return {triangles:m.triangleCount,vertices:m.vertexCount,boundary,nonmanifold,skinnyUnderPoint01:skinny,nonfinite,worst}}
for(const grid of grids)for(const side of ['minus','plus']){const m=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,...grid,side});console.log(JSON.stringify({grid,side,...audit(m,side)}))}
