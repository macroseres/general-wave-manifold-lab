import {sonicSurfaceTriangles} from '../src/geometry/sonic/surface.js'
import {refineSonicMeshExperimental,triangleQuality} from '../src/geometry/sonic/experimentalRefinement.js'
import {sonicData} from '../src/math/sonic/sonic.js'
import {zFromZc} from '../src/math/charts/zChart.js'
const p={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
const point=(m,i)=>m.positions.slice(i*3,i*3+3)
function audit(m,side){
  const edges=new Map();let skinny=0,nonfinite=0,maxResidual=0,checked=0
  for(let k=0;k<m.indices.length;k+=3){
    const ids=m.indices.slice(k,k+3),pts=ids.map(i=>point(m,i)),q=triangleQuality(...pts)
    if(q<.01)skinny++
    if(!Number.isFinite(q))nonfinite++
    const centroid=pts[0].map((_,i)=>(pts[0][i]+pts[1][i]+pts[2][i])/3)
    const d=sonicData(centroid[0],zFromZc(centroid[2]),p)
    if(d.kind==='regular'){
      const residual=Math.abs(centroid[1]*d.detM+(side==='minus'?-2:2)*d.K)
      if(Number.isFinite(residual)){maxResidual=Math.max(maxResidual,residual);checked++}
    }
    for(const [a,b] of [[ids[0],ids[1]],[ids[1],ids[2]],[ids[2],ids[0]]]){
      const key=a<b?`${a}:${b}`:`${b}:${a}`;edges.set(key,(edges.get(key)||0)+1)
    }
  }
  return {triangles:m.triangleCount,skinny,nonfinite,maxAbsoluteCentroidResidual:maxResidual,centroidsChecked:checked,boundary:[...edges.values()].filter(x=>x===1).length,nonmanifold:[...edges.values()].filter(x=>x>2).length}
}
for(const grid of [{nTau:34,nY:28,nZ:50},{nTau:48,nY:40,nZ:72}])for(const side of ['minus','plus']){
  const m=sonicSurfaceTriangles(p,{tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,...grid,side})
  const r=refineSonicMeshExperimental(m)
  console.log(JSON.stringify({grid,side,original:audit(m,side),experimental:audit(r,side),refinement:r.experimentalRefinement}))
}
