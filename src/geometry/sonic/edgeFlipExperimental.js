/** Experimental intrinsic connectivity optimization; never used by production. */
import { triangleQuality } from './experimentalRefinement.js'
import { implicitEstimate } from './projectedRefinement.js'
const sub=(a,b)=>a.map((v,i)=>v-b[i])
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0)
const norm=a=>Math.hypot(...a)
const key=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`
const centroid=(a,b,c)=>a.map((v,i)=>(v+b[i]+c[i])/3)
function triangleMetrics(a,b,c,params,side){
  const normal=cross(sub(b,a),sub(c,a)),area=norm(normal)
  const scale=Math.max(norm(sub(a,b)),norm(sub(b,c)),norm(sub(c,a)))
  const est=implicitEstimate(centroid(a,b,c),params,side)
  return {normal,area,quality:triangleQuality(a,b,c),error:est?est.estimate/scale:Infinity}
}
/** Only swaps internal edges with two incident triangles and a strict, verified improvement. */
export function flipSonicEdgesExperimental(mesh,params,side,{passes=2,minQualityGain=1e-5,maxErrorRatio=1.05,maxNormalAngleDegrees=35}={}){
  const positions=Array.from(mesh.positions),indices=Array.from(mesh.indices)
  const point=i=>positions.slice(3*i,3*i+3)
  let flips=0,rejectedGeometry=0,rejectedQuality=0,rejectedTopology=0
  for(let pass=0;pass<passes;pass++){
    const adjacency=new Map(),faces=new Set()
    for(let t=0;t<indices.length;t+=3){
      const tri=indices.slice(t,t+3)
      faces.add([...tri].sort((a,b)=>a-b).join(':'))
      for(let e=0;e<3;e++){
        const a=tri[e],b=tri[(e+1)%3],opposite=tri[(e+2)%3],k=key(a,b)
        if(!adjacency.has(k))adjacency.set(k,[])
        adjacency.get(k).push({t,a,b,opposite})
      }
    }
    let changed=0
    const touched=new Set()
    for(const [,adj] of adjacency){
      if(adj.length!==2)continue
      const [f,g]=adj
      if(touched.has(f.t)||touched.has(g.t))continue
      // Require opposite orientation of the common edge.
      if(f.a!==g.b||f.b!==g.a){rejectedTopology++;continue}
      const a=f.a,b=f.b,c=f.opposite,d=g.opposite
      if(new Set([a,b,c,d]).size!==4||adjacency.has(key(c,d))){rejectedTopology++;continue}
      const before1=triangleMetrics(point(a),point(b),point(c),params,side)
      const before2=triangleMetrics(point(b),point(a),point(d),params,side)
      // Consistent orientation: (c,d,b) and (d,c,a).
      const after1=triangleMetrics(point(c),point(d),point(b),params,side)
      const after2=triangleMetrics(point(d),point(c),point(a),params,side)
      const beforeQuality=Math.min(before1.quality,before2.quality)
      const afterQuality=Math.min(after1.quality,after2.quality)
      if(afterQuality<=beforeQuality+minQualityGain){rejectedQuality++;continue}
      const normals=[before1,before2,after1,after2]
      if(normals.some(x=>x.area<1e-13||!Number.isFinite(x.error))){rejectedGeometry++;continue}
      const cosLimit=Math.cos(maxNormalAngleDegrees*Math.PI/180)
      if(dot(before1.normal,before2.normal)/(before1.area*before2.area)<cosLimit ||
        [after1,after2].some(x=>dot(before1.normal,x.normal)/(before1.area*x.area)<cosLimit || dot(before2.normal,x.normal)/(before2.area*x.area)<cosLimit)){
        rejectedGeometry++;continue
      }
      const beforeError=Math.max(before1.error,before2.error)
      const afterError=Math.max(after1.error,after2.error)
      if(afterError>Math.max(1e-8,beforeError*maxErrorRatio)){rejectedGeometry++;continue}
      const newFace1=[c,d,b],newFace2=[d,c,a]
      if([newFace1,newFace2].some(face=>faces.has([...face].sort((x,y)=>x-y).join(':')))){rejectedTopology++;continue}
      indices.splice(f.t,3,...newFace1);indices.splice(g.t,3,...newFace2)
      touched.add(f.t);touched.add(g.t);changed++;flips++
    }
    if(!changed)break
  }
  return {...mesh,positions,indices,triangleCount:indices.length/3,vertexCount:positions.length/3,experimentalEdgeFlips:{flips,rejectedGeometry,rejectedQuality,rejectedTopology,method:'conservative-edge-flip-no-vertex-insertion'}}
}
