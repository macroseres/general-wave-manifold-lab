import { zFromZc } from '../../math/charts/zChart.js'
import { sonicData } from '../../math/sonic/sonic.js'
import { doubleSonicBasePoints, doubleSonicResidual } from '../../math/sonic/intersections.js'

const finite=x=>Number.isFinite(x)
const lerp=(a,b,t)=>a+t*(b-a)
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]]
const norm=a=>Math.hypot(...a)

function augmentedAxis(min,max,n,extra=[]){
  const xs=Array.from({length:Math.max(2,n)+1},(_,i)=>lerp(min,max,i/Math.max(2,n)))
  for(const x of extra)if(finite(x)&&x>min&&x<max)xs.push(x)
  xs.sort((a,b)=>a-b)
  return xs.filter((x,i)=>i===0||Math.abs(x-xs[i-1])>1e-12*Math.max(1,Math.abs(x)))
}

/**
 * Constrained implicit Marching Tetrahedra for Phi_side(tau,Y,z)=0.
 *
 * The scalar field is never solved as Y(tau,z).  Canonical double-sonic base
 * coordinates are inserted as grid planes before tetrahedralization.  Hence a
 * DS fibre is an actual grid edge shared by the implicit mesh, not an overlay,
 * patch, or post-processing seam.
 */
export function sonicSurfaceTriangles(p,{tauMin,tauMax,YMin,YMax,side,nTau=34,nY=28,nZ=50,zcMin=-.999,zcMax=.999,diagnostics=false,profile=false,traceTarget=null,traceCells=null,minCrossNorm=1e-14}={}){
  const started=typeof performance!=='undefined'&&performance.now?performance.now():Date.now()
  const clock=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now()
  const timings={baseMs:0,rootMs:0,faceRecordingMs:0,faceComparisonMs:0,meshMs:0,residualMs:0}
  const sideSign=side==='minus'?-1:1
  const ds=doubleSonicBasePoints(p,{tauMin,tauMax,zcMin,zcMax})
  const taus=augmentedAxis(tauMin,tauMax,nTau,ds.map(q=>q.tau))
  const ys=augmentedAxis(YMin,YMax,nY,[0])
  const zhats=augmentedAxis(zcMin,zcMax,nZ,ds.map(q=>q.zc))

  const baseStart=clock()
  const base=Array.from({length:zhats.length},(_,k)=>Array.from({length:taus.length},(_,i)=>{
    const d=sonicData(taus[i],zFromZc(zhats[k]),p)
    return d.kind==='regular'?{K:d.K,detM:d.detM}:null
  }))
  timings.baseMs=clock()-baseStart
  const node=(i,j,k)=>{
    const b=base[k][i],Y=ys[j]
    return {tau:taus[i],Y,zc:zhats[k],v:b?Y*b.detM+sideSign*2*b.K:NaN}
  }
  const phi=(tau,Y,zc)=>{
    const d=sonicData(tau,zFromZc(zc),p)
    return d.kind==='regular'?Y*d.detM+sideSign*2*d.K:NaN
  }
  const coord=q=>[q.tau,q.Y,q.zc]
  const zeroTolerance=2e-11
  // Canonical shared-edge intersections: every tetrahedron incident to the
  // same geometric grid edge consumes the exact same zero-set vertices.
  // This removes orientation-dependent bisection drift without changing Phi.
  const edgeRootCache=new Map(),edgeKeyQuant=1e12
  const nodeKey=q=>coord(q).map(x=>Math.round(x*edgeKeyQuant)).join('|')
  const undirectedEdgeKey=(a,b)=>[nodeKey(a),nodeKey(b)].sort().join('~')
  const rootOnEdgeRaw=(a,b)=>{
    if(!finite(a.v)||!finite(b.v))return []
    const za=Math.abs(a.v)<=zeroTolerance,zb=Math.abs(b.v)<=zeroTolerance
    if(za&&zb)return [coord(a),coord(b)]
    if(za)return [coord(a)]
    if(zb)return [coord(b)]
    if(Math.sign(a.v)===Math.sign(b.v))return []
    let lo={...a},hi={...b},flo=a.v,best=null,bestResidual=Infinity
    for(let it=0;it<56;it++){
      const m={tau:.5*(lo.tau+hi.tau),Y:.5*(lo.Y+hi.Y),zc:.5*(lo.zc+hi.zc)}
      m.v=phi(m.tau,m.Y,m.zc)
      if(!finite(m.v))break
      const r=Math.abs(m.v);if(r<bestResidual){best=coord(m);bestResidual=r}
      if(r<=2e-10)break
      if(Math.sign(m.v)===Math.sign(flo)){lo=m;flo=m.v}else hi=m
    }
    return best?[best]:[]
  }
  const rootOnEdge=(a,b)=>{
    const key=undirectedEdgeKey(a,b)
    const cached=edgeRootCache.get(key)
    if(cached)return cached.map(q=>[...q])
    // Canonical endpoint order makes the numerical solve independent of which
    // neighbouring tetrahedron requested the shared edge first.
    const ka=nodeKey(a),kb=nodeKey(b)
    const rootStart=profile?clock():0
    const roots=rootOnEdgeRaw(ka<=kb?a:b,ka<=kb?b:a)
    if(profile)timings.rootMs+=clock()-rootStart
    edgeRootCache.set(key,roots.map(q=>[...q]))
    return roots.map(q=>[...q])
  }


  const tetGradient=verts=>{
    const p0=coord(verts[0]),e1=sub(coord(verts[1]),p0),e2=sub(coord(verts[2]),p0),e3=sub(coord(verts[3]),p0)
    const c23=cross(e2,e3),c31=cross(e3,e1),c12=cross(e1,e2),det=dot(e1,c23)
    if(!finite(det)||Math.abs(det)<1e-18)return null
    const d1=verts[1].v-verts[0].v,d2=verts[2].v-verts[0].v,d3=verts[3].v-verts[0].v
    return [(d1*c23[0]+d2*c31[0]+d3*c12[0])/det,(d1*c23[1]+d2*c31[1]+d3*c12[1])/det,(d1*c23[2]+d2*c31[2]+d3*c12[2])/det]
  }

  const positions=[],indices=[],vertexMap=new Map(),quant=1e10
  const traceRecords=traceTarget?[]:null
  const cellTraceRecords=traceCells?[]:null
  const traceCellKeys=traceCells?new Set(traceCells.map(c=>c.join(','))):null
  let currentTet=null
  let currentTetRejections=null
  // Conformity audit is retained as a numerical invariant.  It observes the
  // triangles actually emitted by both tetrahedra sharing each internal face.
  const sharedFaceAudit=new Map(),auditQuant=1e9
  const pointKey=q=>q.map(x=>Math.round(x*auditQuant)).join('|')
  const faceKey=qs=>qs.map(pointKey).sort().join('::')
  const segmentKey=(a,b)=>[pointKey(a),pointKey(b)].sort().join('~')
  const pointOnFace=(q,a,b,c)=>{
    const n=cross(sub(b,a),sub(c,a)),nl=norm(n)
    return nl>1e-15&&Math.abs(dot(n,sub(q,a)))/nl<=2e-9
  }
  const recordTetFaces=(verts,triangles)=>{
    if(!diagnostics)return
    const faceStart=profile?clock():0
    for(const ids of [[0,1,2],[0,1,3],[0,2,3],[1,2,3]]){
      const fv=ids.map(i=>coord(verts[i])),segments=new Set()
      for(const tri of triangles)for(const [ia,ib] of [[0,1],[1,2],[2,0]]){
        const a=tri[ia],b=tri[ib]
        if(pointOnFace(a,...fv)&&pointOnFace(b,...fv)&&norm(sub(a,b))>1e-10)segments.add(segmentKey(a,b))
      }
      const key=faceKey(fv),entry={segments:[...segments].sort(),vertices:fv}
      if(!sharedFaceAudit.has(key))sharedFaceAudit.set(key,[])
      sharedFaceAudit.get(key).push(entry)
    }
    if(profile)timings.faceRecordingMs+=clock()-faceStart
  }
  const indexOf=q=>{
    const key=q.map(x=>Math.round(x*quant)).join('|');let id=vertexMap.get(key)
    if(id===undefined){id=positions.length/3;positions.push(...q);vertexMap.set(key,id)}
    return id
  }
  let maxResidual=0,maxEdgeRatio=0,edgeRefinementCount=0
  let zeroVertexTetCount=0,zeroEdgeTetCount=0,zeroFaceTetCount=0,zeroVolumeTetCount=0
  const emitTriangle=(aa,bb,cc,gradient,collector=null)=>{
    let a=aa,b=bb,c=cc
    let n=cross(sub(b,a),sub(c,a));if(Math.hypot(...n)<=minCrossNorm){if(currentTetRejections)currentTetRejections.push({reason:"small-cross-product",crossNorm:Math.hypot(...n),triangle:[a,b,c]});return}
    if(gradient&&dot(n,gradient)<0){const t=b;b=c;c=t;n=cross(sub(b,a),sub(c,a))}
    const ia=indexOf(a),ib=indexOf(b),ic=indexOf(c);if(ia===ib||ib===ic||ia===ic){if(currentTetRejections)currentTetRejections.push({reason:"merged-vertices",triangle:[a,b,c]});return}
    const triangleIndex=indices.length/3
    indices.push(ia,ib,ic)
    if(traceRecords&&[a,b,c].some(q=>norm(sub(q,traceTarget))<1e-7)){
      traceRecords.push({triangleIndex,vertexIds:[ia,ib,ic],cell:currentTet.cell,tetIds:currentTet.tetIds,
        tetrahedron:currentTet.verts.map(v=>({point:coord(v),phi:v.v})),triangle:[a,b,c]})
    }
    collector?.push([a,b,c])
    const lengths=[Math.hypot(...sub(a,b)),Math.hypot(...sub(b,c)),Math.hypot(...sub(c,a))].filter(x=>x>1e-14)
    if(lengths.length)maxEdgeRatio=Math.max(maxEdgeRatio,Math.max(...lengths)/Math.min(...lengths))
  }
  const emitTet=verts=>{
    const before=indices.length/3
    const selected=cellTraceRecords&&traceCellKeys.has(currentTet.cell.join(','))
    const values=selected?verts.map(q=>q.v):null
    currentTetRejections=selected?[]:null
    const emitRecord=()=>{if(selected)cellTraceRecords.push({cell:currentTet.cell,tetIds:currentTet.tetIds,vertices:verts.map(coord),values,expectedTriangles:values.some(v=>!finite(v))?null:(()=>{const zero=values.filter(v=>Math.abs(v)<=zeroTolerance).length,pos=values.filter(v=>v>zeroTolerance).length,neg=values.filter(v=>v<-zeroTolerance).length;if(zero===4)return 0;if(zero===3)return 1;if(zero===2)return pos&&neg?1:0;if(zero===1)return pos&&neg?1:0;return pos===2?2:(pos&&neg?1:0)})(),emittedTriangles:indices.length/3-before,triangleIndices:Array.from({length:indices.length/3-before},(_,i)=>before+i),rejections:currentTetRejections})}
    if(verts.some(q=>!finite(q.v))){emitRecord();return}
    const auditTriangles=diagnostics?[]:null
    const finish=()=>{if(diagnostics)recordTetFaces(verts,auditTriangles);emitRecord()}
    const gradient=tetGradient(verts)
    const zero=verts.map((q,i)=>Math.abs(q.v)<=zeroTolerance?i:-1).filter(i=>i>=0)
    if(zero.length===3){
      zeroFaceTetCount++
      emitTriangle(coord(verts[zero[0]]),coord(verts[zero[1]]),coord(verts[zero[2]]),gradient,auditTriangles)
      finish();return
    }
    if(zero.length===4){
      zeroVolumeTetCount++
      for(const q of verts)indexOf(coord(q))
      finish();return
    }
    if(zero.length===1){
      // Canonical one-zero-vertex case.  A zero grid vertex is part of the
      // level set, but it must not be silently classified as negative.  If
      // the other three vertices have mixed signs, the affine zero set is
      // exactly the triangle made by the zero vertex and the two sign-change
      // roots from the lone-sign vertex to the opposite-sign vertices.  If
      // the other three have one sign, the zero set touches the tetrahedron
      // only at the vertex and no surface face is emitted.
      zeroVertexTetCount++
      const z=zero[0],rest=[0,1,2,3].filter(i=>i!==z)
      const pos=rest.filter(i=>verts[i].v>zeroTolerance)
      const neg=rest.filter(i=>verts[i].v<-zeroTolerance)
      if(pos.length&&neg.length){
        const lone=pos.length===1?pos[0]:neg[0]
        const opposite=pos.length===1?neg:pos
        const q0=rootOnEdge(verts[lone],verts[opposite[0]])[0]||null
        const q1=rootOnEdge(verts[lone],verts[opposite[1]])[0]||null
        if(q0&&q1)emitTriangle(coord(verts[z]),q0,q1,gradient,auditTriangles)
      }else indexOf(coord(verts[z]))
      finish();return
    }
    if(zero.length===2){
      zeroEdgeTetCount++
      const rest=[0,1,2,3].filter(i=>!zero.includes(i)),c=verts[rest[0]],d=verts[rest[1]]
      if(Math.sign(c.v)!==Math.sign(d.v)){
        const roots=rootOnEdge(c,d)
        if(roots.length===1)emitTriangle(coord(verts[zero[0]]),coord(verts[zero[1]]),roots[0],gradient,auditTriangles)
      }else{
        indexOf(coord(verts[zero[0]]));indexOf(coord(verts[zero[1]]))
      }
      finish();return
    }
    // Regular tetrahedra use the exact Marching-Tetrahedra sign topology.
    // In particular, the 2+ / 2- case is ordered combinatorially rather than
    // by a geometric angle sort, so every triangular face inherits the same
    // contour segment from both incident tetrahedra.
    const positive=[],negative=[]
    for(let q=0;q<4;q++)(verts[q].v>0?positive:negative).push(q)
    const edgeRoot=(ia,ib)=>rootOnEdge(verts[ia],verts[ib])[0]||null
    if(positive.length===1||negative.length===1){
      const one=(positive.length===1?positive:negative)[0]
      const other=[0,1,2,3].filter(q=>q!==one)
      const tri=other.map(q=>edgeRoot(one,q))
      if(tri.every(Boolean))emitTriangle(tri[0],tri[1],tri[2],gradient,auditTriangles)
      finish();return
    }
    if(positive.length===2&&negative.length===2){
      const [p0,p1]=positive,[n0,n1]=negative
      const q00=edgeRoot(p0,n0),q01=edgeRoot(p0,n1),q11=edgeRoot(p1,n1),q10=edgeRoot(p1,n0)
      if([q00,q01,q11,q10].every(Boolean)){
        emitTriangle(q00,q01,q11,gradient,auditTriangles)
        emitTriangle(q00,q11,q10,gradient,auditTriangles)
      }
      finish();return
    }
    finish()
  }
  const meshStart=clock()
  const tets=[[0,1,3,7],[0,3,2,7],[0,2,6,7],[0,6,4,7],[0,4,5,7],[0,5,1,7]]
  for(let k=0;k<zhats.length-1;k++)for(let j=0;j<ys.length-1;j++)for(let i=0;i<taus.length-1;i++){
    const c=[node(i,j,k),node(i+1,j,k),node(i,j+1,k),node(i+1,j+1,k),node(i,j,k+1),node(i+1,j,k+1),node(i,j+1,k+1),node(i+1,j+1,k+1)]
    for(const ids of tets){
      if(traceRecords||cellTraceRecords)currentTet={cell:[i,j,k],tetIds:ids,verts:ids.map(id=>c[id])}
      emitTet(ids.map(id=>c[id]))
    }
  }
  timings.meshMs=clock()-meshStart
  const comparisonStart=clock()
  const sharedFaceViolations=[]
  let sharedFaceCount=0,regularSharedFaceViolationCount=0,zeroEdgeSharedFaceDegeneracyCount=0
  if(diagnostics)for(const entries of sharedFaceAudit.values()){
    if(entries.length!==2)continue
    sharedFaceCount++
    const [a,b]=entries
    if(a.segments.join('||')===b.segments.join('||'))continue
    const values=a.vertices.map(q=>phi(q[0],q[1],q[2]))
    const zeroCount=values.filter(v=>finite(v)&&Math.abs(v)<=zeroTolerance).length
    const kind=zeroCount>=2?'zero-edge-degeneracy':'regular-mismatch'
    if(kind==='zero-edge-degeneracy')zeroEdgeSharedFaceDegeneracyCount++
    else regularSharedFaceViolationCount++
    sharedFaceViolations.push({vertices:a.vertices,segmentsA:a.segments,segmentsB:b.segments,values,kind})
  }
  timings.faceComparisonMs=clock()-comparisonStart
  const residualStart=clock()
  for(let i=0;i<positions.length;i+=3){const r=Math.abs(phi(positions[i],positions[i+1],positions[i+2]));if(finite(r))maxResidual=Math.max(maxResidual,r)}
  // DS grid vertices must be retained even at a locally non-manifold zero set.
  // Adding an already existing vertex is a no-op; otherwise it records the exact
  // constrained fibre without inventing triangles or changing Phi=0.
  for(const q of ds)for(const Y of ys)indexOf([q.tau,Y,q.zc])
  timings.residualMs=clock()-residualStart
  const ended=typeof performance!=='undefined'&&performance.now?performance.now():Date.now()
  return {positions,indices,triangleCount:indices.length/3,vertexCount:positions.length/3,rejectedDegenerate:0,maxResidual,uncertifiedVertexCount:0,edgeRefinementCount,maxEdgeRatio,method:'marching-tetrahedra-implicit-sonic',elapsedMs:ended-started,baseEvaluationCount:taus.length*zhats.length,dsConstrainedFibreCount:ds.length,dsGridVertexCount:ds.length*ys.length,zeroVertexTetCount,zeroEdgeTetCount,zeroFaceTetCount,zeroVolumeTetCount,sharedFaceCount,sharedFaceViolationCount:sharedFaceViolations.length,regularSharedFaceViolationCount,zeroEdgeSharedFaceDegeneracyCount,sharedFaceViolations,canonicalEdgeRootCount:edgeRootCache.size,...(traceRecords?{traceRecords}:{}),...(cellTraceRecords?{cellTraceRecords}:{}),...(profile?{timings:{...timings,meshOtherMs:Math.max(0,timings.meshMs-timings.rootMs-timings.faceRecordingMs)}}:{})}
}

function zeroSegments(p,field,{tauMin,tauMax,nTau=120,nZ=180,zcMin=-.999,zcMax=.999}={}){
  const out=[],vals=Array.from({length:nZ+1},(_,k)=>Array.from({length:nTau+1},(_,i)=>{
    const tau=lerp(tauMin,tauMax,i/nTau),zc=lerp(zcMin,zcMax,k/nZ),d=sonicData(tau,zFromZc(zc),p)
    return {tau,zc,v:d.kind==='regular'?field(d):NaN}
  }))
  const interp=(a,b)=>{if(!finite(a.v)||!finite(b.v)||a.v*b.v>0)return null;const den=a.v-b.v,t=Math.abs(den)<1e-16?.5:a.v/den;return {tau:lerp(a.tau,b.tau,t),zc:lerp(a.zc,b.zc,t)}}
  for(let k=0;k<nZ;k++)for(let i=0;i<nTau;i++){
    const q=[vals[k][i],vals[k][i+1],vals[k+1][i+1],vals[k+1][i]],hits=[]
    for(const [a,b] of [[0,1],[1,2],[2,3],[3,0]]){const x=interp(q[a],q[b]);if(x)hits.push(x)}
    if(hits.length===2)out.push(hits);else if(hits.length===4){out.push([hits[0],hits[1]],[hits[2],hits[3]])}
  }
  return out
}
/** Inflection locus J on C: Y=0 and K=0. */
export function inflectionGeometry(p,options={}){return zeroSegments(p,d=>d.K,options)}

/** Double sonic DS: K=det(M)=0, outside C. Each isolated base point generates a Y-line. */
export function doubleSonicGeometry(p,{YMin=-6,YMax=6,zcMin=-.999,zcMax=.999,...options}={}){
  const points=[]
  for(const q of doubleSonicBasePoints(p,{...options,zcMin,zcMax})){
    const yProbe=Math.max(1,Math.min(Math.max(Math.abs(YMin),Math.abs(YMax)),3))
    const r1=doubleSonicResidual(q.tau,yProbe,q.z,p),r2=doubleSonicResidual(q.tau,-yProbe,q.z,p)
    if(!finite(r1)||!finite(r2)||Math.max(r1,r2)>=1e-9)continue
    points.push({...q,sonicResidual:Math.max(r1,r2)})
  }
  return points.map((q,i)=>({id:i,...q,points:[{tau:q.tau,Y:YMin,zc:q.zc},{tau:q.tau,Y:YMax,zc:q.zc}]}))
}
