import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'

// Offline-only audit. The production mesh generator and its fast path are unchanged.
const domain = { tauMin: -5, tauMax: 5, YMin: -6, YMax: 6, nTau: 34, nY: 28, nZ: 50 }
const zMin = -.999, zMax = .999
const eps = 1e-8
const round = x => Number(x.toFixed(9))
const point = (positions, i) => positions.slice(i * 3, i * 3 + 3)

const nearDomainBoundary = ([tau,Y,z]) => Math.abs(tau-domain.tauMin)<eps || Math.abs(tau-domain.tauMax)<eps || Math.abs(Y-domain.YMin)<eps || Math.abs(Y-domain.YMax)<eps || Math.abs(z-zMin)<eps || Math.abs(z-zMax)<eps
const summary = mesh => {
  const edges=new Map()
  const add=(a,b,triangle)=>{
    const key=a<b?`${a}:${b}`:`${b}:${a}`
    const entry=edges.get(key)
    if(entry)entry.triangles.push(triangle)
    else edges.set(key,{a,b,triangles:[triangle]})
  }
  for(let i=0;i<mesh.indices.length;i+=3){
    const [a,b,c]=mesh.indices.slice(i,i+3)
    add(a,b,i/3);add(b,c,i/3);add(c,a,i/3)
  }
  const boundaries=[],nonManifold=[]
  for(const e of edges.values()){
    if(e.triangles.length===1)boundaries.push(e)
    else if(e.triangles.length>2)nonManifold.push(e)
  }
  const adj=new Map()
  const connect=(a,b)=>{if(!adj.has(a))adj.set(a,new Set());adj.get(a).add(b)}
  for(const e of boundaries){connect(e.a,e.b);connect(e.b,e.a)}
  const seen=new Set(),components=[]
  for(const start of adj.keys()){
    if(seen.has(start))continue
    const queue=[start],vertices=[],edgeIds=new Set();seen.add(start)
    for(let i=0;i<queue.length;i++){
      const v=queue[i];vertices.push(v)
      for(const w of adj.get(v)){edgeIds.add(v<w?`${v}:${w}`:`${w}:${v}`);if(!seen.has(w)){seen.add(w);queue.push(w)}}
    }
    const coords=vertices.map(v=>point(mesh.positions,v))
    const degrees=vertices.map(v=>adj.get(v).size)
    components.push({vertices:vertices.length,edges:edgeIds.size,closed:degrees.every(d=>d===2),branchVertices:degrees.filter(d=>d>2).length,endpoints:degrees.filter(d=>d===1).length,
      entirelyOnDomainBoundary:coords.every(nearDomainBoundary),
      bounds:[0,1,2].map(axis=>[round(Math.min(...coords.map(q=>q[axis]))),round(Math.max(...coords.map(q=>q[axis])))]),
      sample:coords.slice(0,2).map(q=>q.map(round))})
  }
  components.sort((a,b)=>b.edges-a.edges)
  const boundaryTypes={bothEndpointsOnDomain:0,oneEndpointOnDomain:0,interiorEndpoints:0}
  for(const e of boundaries){const count=Number(nearDomainBoundary(point(mesh.positions,e.a)))+Number(nearDomainBoundary(point(mesh.positions,e.b)))
    if(count===2)boundaryTypes.bothEndpointsOnDomain++
    else if(count===1)boundaryTypes.oneEndpointOnDomain++
    else boundaryTypes.interiorEndpoints++
  }
  return {vertices:mesh.vertexCount,triangles:mesh.triangleCount,uniqueEdges:edges.size,incidence:{one:boundaries.length,two:[...edges.values()].filter(e=>e.triangles.length===2).length,moreThanTwo:nonManifold.length},boundaryTypes,boundaryComponents:components.length,largestBoundaryComponents:components.slice(0,12),nonManifoldSamples:nonManifold.slice(0,8).map(e=>({a:point(mesh.positions,e.a).map(round),b:point(mesh.positions,e.b).map(round),incidence:e.triangles.length}))}
}
const results=[]
for(const side of ['minus','plus']){
  const mesh=sonicSurfaceTriangles(defaultCoefficients,{...domain,side,diagnostics:false})
  const topology=summary(mesh)
  const audit=sonicSurfaceTriangles(defaultCoefficients,{...domain,side,diagnostics:true})
  const mismatchSamples=audit.sharedFaceViolations.filter(v=>v.kind==='regular-mismatch').map(v=>({face:v.vertices.map(p=>p.map(round)),reportedSegmentsA:v.segmentsA.length,reportedSegmentsB:v.segmentsB.length,nearZUpper:v.vertices.some(p=>p[2]>.95)}))
  const identical=mesh.positions.length===audit.positions.length&&mesh.indices.length===audit.indices.length&&mesh.positions.every((v,i)=>Object.is(v,audit.positions[i]))&&mesh.indices.every((v,i)=>v===audit.indices[i])
  results.push({side,identicalWithDiagnostics:identical,topology,regularMismatchFaces:mismatchSamples,zeroEdgeDegeneracies:audit.zeroEdgeSharedFaceDegeneracyCount})
}
console.log(JSON.stringify({mode:'sonic-mesh-topology-audit',domain,notes:['Boundary edges are mesh edges incident to exactly one triangle; some are legitimate domain boundaries.','Interior endpoints do not alone prove holes: intersections with the box may create mixed-boundary edges.','The audit does not alter the mesh generator or the production Worker.'],results},null,2))
