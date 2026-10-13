import { performance } from 'node:perf_hooks'
import { defaultCoefficients, oldWavePreset } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'

const domain = {tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999}
const grids = [{nTau:24,nY:20,nZ:36},{nTau:34,nY:28,nZ:50},{nTau:48,nY:40,nZ:72}]
const presets = [{name:'default-B1-8-B2-0.2',coefficients:defaultCoefficients},{name:'alternative-B1-0-B2-0.2',coefficients:oldWavePreset({B1:0,B2:.2,a:0,c:1})}]
const thresholds = [{name:'current',value:1e-10},{name:'experimental',value:1e-14},{name:'zero-only',value:0}]
const P=[0,0,.9979731774678219]
const point=(mesh,id)=>mesh.positions.slice(3*id,3*id+3)
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])
const isDomainBoundary=p=>Math.abs(Math.abs(p[0])-5)<1e-8||Math.abs(Math.abs(p[1])-6)<1e-8||Math.abs(Math.abs(p[2])-.999)<1e-8
function inspect(mesh){
  const edges=new Map(),boundaryAdj=new Map(),triangleAdj=new Map()
  const edge=(a,b,t)=>{const key=a<b?`${a}:${b}`:`${b}:${a}`;let ts=edges.get(key);if(!ts){ts=[];edges.set(key,ts)}ts.push(t)}
  let tinyPositiveArea=0,exactZeroArea=0,nonfiniteArea=0,minPositiveCross=Infinity
  for(let i=0;i<mesh.indices.length;i+=3){const [a,b,c]=mesh.indices.slice(i,i+3),t=i/3;edge(a,b,t);edge(b,c,t);edge(c,a,t)
    const A=point(mesh,a),B=point(mesh,b),C=point(mesh,c),u=B.map((x,j)=>x-A[j]),v=C.map((x,j)=>x-A[j]);const cross=Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]);if(!Number.isFinite(cross))nonfiniteArea++;else if(cross===0)exactZeroArea++;else{minPositiveCross=Math.min(minPositiveCross,cross);if(cross<=1e-14)tinyPositiveArea++}
  }
  let incidence1=0,incidenceOver2=0,mixed=0,interior=0,domainEdges=0
  for(const [key,ts] of edges){if(ts.length===1){incidence1++;const [a,b]=key.split(':').map(Number),ba=isDomainBoundary(point(mesh,a)),bb=isDomainBoundary(point(mesh,b));if(ba&&bb)domainEdges++;else if(ba||bb)mixed++;else interior++;for(const [u,v] of [[a,b],[b,a]]){if(!boundaryAdj.has(u))boundaryAdj.set(u,new Set());boundaryAdj.get(u).add(v)}}else if(ts.length>2)incidenceOver2++;
    for(let i=1;i<ts.length;i++){if(!triangleAdj.has(ts[0]))triangleAdj.set(ts[0],new Set());if(!triangleAdj.has(ts[i]))triangleAdj.set(ts[i],new Set());triangleAdj.get(ts[0]).add(ts[i]);triangleAdj.get(ts[i]).add(ts[0])}
  }
  let boundaryLoops=0,boundaryOpenPaths=0,boundaryBranches=0;const seen=new Set();for(const [v,ns] of boundaryAdj){if(ns.size>2)boundaryBranches++;if(seen.has(v))continue;const queue=[v];seen.add(v);let endpoints=0;for(let k=0;k<queue.length;k++){const w=queue[k];if(boundaryAdj.get(w).size===1)endpoints++;for(const u of boundaryAdj.get(w))if(!seen.has(u)){seen.add(u);queue.push(u)}}if(endpoints===0)boundaryLoops++;else boundaryOpenPaths++}
  let connectedComponents=0;const visited=new Set();for(let t=0;t<mesh.triangleCount;t++){if(visited.has(t))continue;connectedComponents++;const queue=[t];visited.add(t);for(let k=0;k<queue.length;k++)for(const u of triangleAdj.get(queue[k])||[])if(!visited.has(u)){visited.add(u);queue.push(u)}}
  let nearest=-1,nearestDistance=Infinity;for(let i=0;i<mesh.vertexCount;i++){const d=distance(point(mesh,i),P);if(d<nearestDistance){nearestDistance=d;nearest=i}}
  return {triangles:mesh.triangleCount,vertices:mesh.vertexCount,incidence1,incidenceOver2,boundaryEdgesOnDomain:domainEdges,mixedBoundaryEdges:mixed,interiorBoundaryEdges:interior,boundaryLoops,boundaryOpenPaths,boundaryBranches,connectedComponents,exactZeroArea,nonfiniteArea,tinyPositiveArea,minPositiveCross:Number.isFinite(minPositiveCross)?minPositiveCross:null,nearP:nearestDistance<1e-5?{distance:nearestDistance,boundaryDegree:boundaryAdj.get(nearest)?.size||0}:null}
}
const results=[]
for(const preset of presets)for(const grid of grids)for(const side of ['minus','plus']){
  const variants=[]
  for(const threshold of thresholds){const start=performance.now();const mesh=sonicSurfaceTriangles(preset.coefficients,{...domain,...grid,side,minCrossNorm:threshold.value});const extractionMs=performance.now()-start;variants.push({threshold:threshold.name,minCrossNorm:threshold.value,extractionMs:Number(extractionMs.toFixed(1)),...inspect(mesh)})}
  const baseline=variants[0];results.push({preset:preset.name,grid,side,variants,deltaFromCurrent:variants.slice(1).map(v=>({threshold:v.threshold,addedTriangles:v.triangles-baseline.triangles,addedVertices:v.vertices-baseline.vertices,removedMixedBoundaryEdges:baseline.mixedBoundaryEdges-v.mixedBoundaryEdges,relativeExtractionTime:baseline.extractionMs>0?Number((v.extractionMs/baseline.extractionMs).toFixed(3)):null}))})
}
const failures=results.flatMap(r=>r.variants.filter(v=>v.incidenceOver2||v.boundaryBranches||v.boundaryOpenPaths||v.exactZeroArea||v.nonfiniteArea).map(v=>({preset:r.preset,grid:r.grid,side:r.side,threshold:v.threshold,incidenceOver2:v.incidenceOver2,boundaryBranches:v.boundaryBranches,boundaryOpenPaths:v.boundaryOpenPaths,exactZeroArea:v.exactZeroArea,nonfiniteArea:v.nonfiniteArea})))
console.log(JSON.stringify({mode:'sonic-area-filter-stability',notes:['Audit-only; default production threshold unchanged.','Topology checks do not prove geometric accuracy or absence of self-intersections.','Wall-clock timings are exploratory, not a controlled benchmark.','Near-P statistics are only reported when a mesh vertex is within 1e-5 of the default-case P.'],presets:presets.map(p=>p.name),grids,thresholds,results,topologicalWarnings:failures},null,2))
