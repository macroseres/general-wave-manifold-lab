import {hopfImplicitSurfaceMesh} from './implicitSurface.js'
import {hopfAtlasAt } from '../../math/sonic/hopfAtlas.js'

/** Trace-zero sheet, clipped against the visible Y slab and det >= 0.
 * Retain out-of-range graph vertices until clipping: discarding them first
 * creates artificial holes along the viewport boundary.
 * Cells crossing the singular trace graph are intentionally not connected.
 */
export function hopfSurfaceMesh(p,{tauMin,tauMax,YMin,YMax,side,nTau=42,nZ=100,zcMin=-.999,zcMax=.999,diagnostics=false,recordRejectedTriangles=false,recordCellProvenance=false,adaptive=false,maxRefineDepth=5,method="legacy"}={}){
  if(method==="implicit"&&!diagnostics&&!recordRejectedTriangles&&!recordCellProvenance)return hopfImplicitSurfaceMesh(p,{tauMin,tauMax,YMin,YMax,side,nTau,nZ,zcMin,zcMax})
  // Parameterize the intersection of the trace-zero line with the
  // visible (tau,Y) rectangle. Unlike Y(tau,z) and tau(Y,z), this
  // construction has no chart switch or seam at vanishing coefficients.
  const stats=diagnostics?{
    slices:{total:nZ+1,invalidEvaluation:0,degenerateTrace:0,noIntersection:0,valid:0},
    refinement:{enabled:adaptive,inserted:0,depthLimit:maxRefineDepth},
    candidates:{total:2*nTau*nZ,accepted:0,rejected:0},
    reasons:{missingVertex:0,invalidProbe:0,traceResidual:0,determinantClip:0,tauClip:0,YClip:0,degenerate:0},
    examples:{},traceTolerance:null,...(recordRejectedTriangles?{rejectedTriangles:[]}:{}),
  }:null
  const reject=(reason,tri,detail)=>{
    if(!stats)return
    stats.candidates.rejected++
    stats.reasons[reason]++
    if(recordRejectedTriangles)stats.rejectedTriangles.push({reason,vertices:tri.map(v=>v?.p??null),...detail})
    if(!stats.examples[reason])stats.examples[reason]=[]
    if(stats.examples[reason].length<8)stats.examples[reason].push({center:tri.filter(Boolean).length?Array.from({length:3},(_,k)=>tri.filter(Boolean).reduce((sum,v)=>sum+v.p[k],0)/tri.filter(Boolean).length):null,...detail})
  }
  const cellRecords=recordCellProvenance?[]:null
  const faceSources=recordCellProvenance?[]:null
  const grid=[]
  const eps=1e-11
  const span=Math.max(1,Math.abs(tauMax-tauMin),Math.abs(YMax-YMin))
  const traceTolerance=0.015*span
  if(stats)stats.traceTolerance=traceTolerance
  const cosineZ=j=>zcMin+(zcMax-zcMin)*(1-Math.cos(Math.PI*j/nZ))/2
  const sampleRow=zc=>{
    const row=[]
    const h0=hopfAtlasAt(0,0,zc,p,side)
    const ht=hopfAtlasAt(1,0,zc,p,side)
    const hy=hopfAtlasAt(0,1,zc,p,side)
    if([h0,ht,hy].some(h=>h.kind!=='regular')){
      return {row:Array(nTau+1).fill(null),status:'invalidEvaluation'}
    }
    const a=ht.trace-h0.trace,b=hy.trace-h0.trace,c=h0.trace
    const norm=Math.hypot(a,b)
    if(norm<eps)return {row:Array(nTau+1).fill(null),status:'degenerateTrace'}
    const intersections=[]
    const add=(tau,Y)=>{
      if(tau<tauMin-1e-9||tau>tauMax+1e-9||Y<YMin-1e-9||Y>YMax+1e-9)return
      if(intersections.some(q=>Math.hypot(q[0]-tau,q[1]-Y)<1e-9))return
      intersections.push([tau,Y])
    }
    if(Math.abs(b)>eps){add(tauMin,(-c-a*tauMin)/b);add(tauMax,(-c-a*tauMax)/b)}
    if(Math.abs(a)>eps){add((-c-b*YMin)/a,YMin);add((-c-b*YMax)/a,YMax)}
    if(intersections.length<2)return {row:Array(nTau+1).fill(null),status:'noIntersection'}
    // Orient consistently along the line tangent (b,-a), even if the
    // line crosses a rectangle corner or changes from steep to shallow.
    intersections.sort((u,v)=>(u[0]-v[0])*b-(u[1]-v[1])*a)
    const first=intersections[0],last=intersections[intersections.length-1]
    for(let i=0;i<=nTau;i++){
      const f=i/nTau
      const tau=first[0]+f*(last[0]-first[0])
      const Y=first[1]+f*(last[1]-first[1])
      const h=hopfAtlasAt(tau,Y,zc,p,side)
      row.push(h.kind==='regular'&&Number.isFinite(h.det)?{p:[tau,Y,zc],d:h.det}:null)
    }
    return {row,status:'valid'}
  }
  const initial=Array.from({length:nZ+1},(_,j)=>({z:cosineZ(j),...sampleRow(cosineZ(j))}))
  // Refine entire z-strips before triangulating. Unlike splitting individual
  // triangles, strip refinement preserves shared edges and cannot create T-junctions.
  // Check the *actual* trace at the midpoint of each ruled edge; high curvature
  // near the compactified ends otherwise causes entire strips to disappear.
  const needsRefinement=(left,right)=>{
    if(left.status!=='valid'||right.status!=='valid')return false
    for(let i=0;i<nTau;i++){
      const a=left.row[i],b=left.row[i+1],c=right.row[i+1],d=right.row[i]
      if(!a||!b||!c||!d)continue
      // Only refine strips that might survive the determinant clipping.
      if(Math.max(a.d,b.d,c.d,d.d)<0)continue
      for(const tri of [[a,b,c],[a,c,d]]){
        for(const weights of [[.5,.5,0],[0,.5,.5],[.5,0,.5],[1/3,1/3,1/3]]){
          const q=[0,1,2].map(k=>tri.reduce((sum,v,j)=>sum+weights[j]*v.p[k],0))
          const h=hopfAtlasAt(q[0],q[1],q[2],p,side)
          if(h.kind!=='regular'||!Number.isFinite(h.trace)||Math.abs(h.trace)>traceTolerance*.8)return true
        }
      }
    }
    return false
  }
  const refine=(left,right,depth)=>{
    if(!adaptive||depth>=maxRefineDepth||!needsRefinement(left,right))return [right]
    const z=(left.z+right.z)/2,mid={z,...sampleRow(z)}
    if(stats)stats.refinement.inserted++
    return [...refine(left,mid,depth+1),...refine(mid,right,depth+1)]
  }
  const rows=[initial[0]]
  for(let j=0;j<nZ;j++)rows.push(...refine(initial[j],initial[j+1],0))
  for(const sample of rows){
    grid.push(sample.row)
    if(stats)stats.slices[sample.status]++
  }
  const actualNZ=rows.length-1
  if(stats){stats.slices.total=rows.length;stats.candidates.total=2*nTau*actualNZ}
  const positions=[],indices=[]
  // Do not connect neighboring z-slices when the resulting face departs
  // appreciably from the implicit trace-zero locus. A ruled mesh can
  // otherwise bridge distinct branches and create large planar curtains.
  const checkFace=(tri)=>{
    const probes=[
      tri[0].p.map((v,k)=>(v+tri[1].p[k])/2),
      tri[1].p.map((v,k)=>(v+tri[2].p[k])/2),
      tri[2].p.map((v,k)=>(v+tri[0].p[k])/2),
      tri[0].p.map((v,k)=>(v+tri[1].p[k]+tri[2].p[k])/3),
    ]
    for(const [tau,Y,zc] of probes){
      const h=hopfAtlasAt(tau,Y,zc,p,side)
      if(h.kind!=='regular'||!Number.isFinite(h.trace))return {reason:'invalidProbe',detail:{kind:h.kind,probe:[tau,Y,zc]}}
      if(Math.abs(h.trace)>traceTolerance)return {reason:'traceResidual',detail:{residual:Math.abs(h.trace),probe:[tau,Y,zc]}}
    }
    return null
  }
  const clip=(poly,value)=>{
    const out=[]
    for(let k=0;k<poly.length;k++){
      const a=poly[k],b=poly[(k+1)%poly.length]
      const fa=value(a),fb=value(b),ina=fa>=0,inb=fb>=0
      if(ina)out.push(a)
      if(ina!==inb){
        const t=fa/(fa-fb)
        out.push({p:a.p.map((v,n)=>v+t*(b.p[n]-v)),d:a.d+t*(b.d-a.d)})
      }
    }
    return out
  }
  const emit=(tri,cellId,half)=>{
    const record=recordCellProvenance?{cellId,half,status:null,reason:null,outputFaces:0}:null
    const finish=(status,reason)=>{if(record){record.status=status;record.reason=reason;cellRecords.push(record)}}
    const rejected=(reason,detail)=>{reject(reason,tri,detail);finish('rejected',reason)}
    if(tri.some(v=>!v)){rejected('missingVertex');return}
    const failure=checkFace(tri)
    if(failure){rejected(failure.reason,failure.detail);return}
    let poly=clip(tri,v=>v.d)
    if(poly.length<3){rejected('determinantClip');return}
    poly=clip(poly,v=>v.p[0]-tauMin)
    if(poly.length<3){rejected('tauClip');return}
    poly=clip(poly,v=>tauMax-v.p[0])
    if(poly.length<3){rejected('tauClip');return}
    poly=clip(poly,v=>v.p[1]-YMin)
    if(poly.length<3){rejected('YClip');return}
    poly=clip(poly,v=>YMax-v.p[1])
    if(poly.length<3){rejected('YClip');return}
    let emitted=0
    for(let k=1;k+1<poly.length;k++){
      const a=poly[0].p,b=poly[k].p,c=poly[k+1].p
      const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i])
      const cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]]
      if(cross.reduce((s,v)=>s+v*v,0)<1e-24)continue
      const base=positions.length/3
      positions.push(...a,...b,...c)
      indices.push(base,base+1,base+2)
      emitted++
      if(faceSources)faceSources.push({cellId,half,clipped:poly.length!==3||poly.some(v=>!tri.includes(v))})
    }
    if(stats){if(emitted)stats.candidates.accepted++;else {rejected('degenerate');return}}
    finish('accepted',null)
    if(record)record.outputFaces=emitted
  }
  for(let j=0;j<actualNZ;j++)for(let i=0;i<nTau;i++){
    const a=grid[j][i],b=grid[j][i+1],c=grid[j+1][i+1],d=grid[j+1][i]
    const cellId=j*nTau+i
    emit([a,b,c],cellId,0);emit([a,c,d],cellId,1)
  }
  const output=stats?{positions,indices,diagnostics:stats}:{positions,indices}
  if(recordCellProvenance)output.provenance={cells:cellRecords,faces:faceSources,nTau,nZ:actualNZ}
  return output
}
