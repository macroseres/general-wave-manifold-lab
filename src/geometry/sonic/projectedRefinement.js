/** Experimental conforming edge subdivision with safeguarded implicit projection.
 * Not used by the production surface extractor. Shared edge midpoints are
 * projected once, so adjacent triangles use the same vertex.
 */
import { sonicImplicit } from '../../math/sonic/sonic.js'
import { zFromZc } from '../../math/charts/zChart.js'
import { triangleQuality } from './experimentalRefinement.js'

const key=(a,b)=>a<b?`${a}:${b}`:`${b}:${a}`
const norm=v=>Math.hypot(...v)
const dist=(a,b)=>norm(a.map((v,i)=>v-b[i]))
const midpoint=(a,b)=>a.map((v,i)=>(v+b[i])/2)
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0)

export function implicitEstimate(q,params,side){
  const phi=sonicImplicit(q[0],q[1],zFromZc(q[2]),params,side)
  if(!Number.isFinite(phi))return null
  const gradient=[]
  for(let axis=0;axis<3;axis++){
    const h=Math.min(1e-5*Math.max(1,Math.abs(q[axis])),axis===2?Math.max(1e-8,(1-Math.abs(q[2]))/4):Infinity)
    const a=[...q],b=[...q];a[axis]-=h;b[axis]+=h
    if(axis===2&&(Math.abs(a[2])>=1||Math.abs(b[2])>=1))return null
    const fa=sonicImplicit(a[0],a[1],zFromZc(a[2]),params,side)
    const fb=sonicImplicit(b[0],b[1],zFromZc(b[2]),params,side)
    if(!Number.isFinite(fa)||!Number.isFinite(fb))return null
    gradient.push((fb-fa)/(2*h))
  }
  const g=norm(gradient)
  if(!Number.isFinite(g)||g<1e-20)return null
  return {phi,gradient,estimate:Math.abs(phi)/g}
}

/** Damped normal correction, with maximum displacement and chart-domain guards. */
export function projectToSonic(q,params,side,{maxMove=.05,maxIterations=12,zcLimit=.999}={}){
  const start=[...q];let current=[...q]
  const initial=implicitEstimate(start,params,side)
  if(!initial)return {point:start,accepted:false,reason:'invalid-start'}
  if(initial.estimate<1e-11)return {point:start,accepted:true,reason:'already-close'}
  for(let iteration=0;iteration<maxIterations;iteration++){
    const e=implicitEstimate(current,params,side)
    if(!e)break
    if(e.estimate<1e-10)return {point:current,accepted:true,reason:'converged'}
    const g2=dot(e.gradient,e.gradient)
    const step=e.gradient.map(v=>-e.phi*v/g2)
    let accepted=false
    for(let t=1;t>=1/128;t/=2){
      const candidate=current.map((v,i)=>v+t*step[i])
      if(Math.abs(candidate[2])>=zcLimit||dist(candidate,start)>maxMove)continue
      const next=implicitEstimate(candidate,params,side)
      if(next&&Math.abs(next.phi)<Math.abs(e.phi)*(.999)){current=candidate;accepted=true;break}
    }
    if(!accepted)break
  }
  return {point:start,accepted:false,reason:'projection-failed'}
}

export function refineProjectedSonicMesh(mesh,params,side,{relativeErrorThreshold=.01,qualityThreshold=.01,maxSelected=Infinity,maxMoveFraction=.2,zcLimit=.999}={}){
  const positions=Array.from(mesh.positions),original=Array.from(mesh.indices),marked=new Set(),indices=[]
  const point=id=>positions.slice(id*3,id*3+3)
  let selected=0,highError=0,poorQuality=0
  for(let k=0;k<original.length;k+=3){
    const [a,b,c]=original.slice(k,k+3),pa=point(a),pb=point(b),pc=point(c)
    const scale=Math.max(dist(pa,pb),dist(pb,pc),dist(pc,pa))
    const centroid=pa.map((v,i)=>(v+pb[i]+pc[i])/3)
    const estimate=implicitEstimate(centroid,params,side)
    const error=estimate?estimate.estimate/scale:0
    const quality=triangleQuality(pa,pb,pc)
    if(error<=relativeErrorThreshold&&quality>=qualityThreshold)continue
    if(selected>=maxSelected)continue
    selected++
    if(error>relativeErrorThreshold)highError++
    if(quality<qualityThreshold)poorQuality++
    marked.add(key(a,b));marked.add(key(b,c));marked.add(key(c,a))
  }
  const mids=new Map();let projected=0,rejected=0
  function split(a,b){
    const idKey=key(a,b)
    if(!marked.has(idKey))return null
    if(mids.has(idKey))return mids.get(idKey)
    const pa=point(a),pb=point(b),mid=midpoint(pa,pb),maxMove=maxMoveFraction*dist(pa,pb)
    const result=projectToSonic(mid,params,side,{maxMove,zcLimit})
    // A failed projection does not silently create an off-surface vertex.
    // Reject the whole edge split by omitting this edge from the shared set.
    if(!result.accepted){marked.delete(idKey);rejected++;return null}
    const id=positions.length/3;positions.push(...result.point);mids.set(idKey,id)
    if(result.reason!=='already-close')projected++
    return id
  }
  // Resolve all edges before emitting triangles, including failures.
  for(const edge of [...marked]){const [a,b]=edge.split(':').map(Number);split(a,b)}
  const emit=(a,b,c)=>{
    indices.push(a,b,c)
  }
  for(let k=0;k<original.length;k+=3){
    const [a,b,c]=original.slice(k,k+3)
    const ab=mids.get(key(a,b))??null,bc=mids.get(key(b,c))??null,ca=mids.get(key(c,a))??null
    const count=Number(ab!==null)+Number(bc!==null)+Number(ca!==null)
    if(count===0)emit(a,b,c)
    else if(count===3){emit(a,ab,ca);emit(ab,b,bc);emit(ca,bc,c);emit(ab,bc,ca)}
    else if(count===1){if(ab!==null){emit(a,ab,c);emit(ab,b,c)}else if(bc!==null){emit(b,bc,a);emit(bc,c,a)}else{emit(c,ca,b);emit(ca,a,b)}}
    else if(ab!==null&&bc!==null){emit(b,bc,ab);emit(a,ab,c);emit(ab,bc,c)}
    else if(bc!==null&&ca!==null){emit(c,ca,bc);emit(b,bc,a);emit(bc,ca,a)}
    else{emit(a,ab,ca);emit(ab,b,c);emit(ab,c,ca)}
  }
  return {...mesh,positions,indices,vertexCount:positions.length/3,triangleCount:indices.length/3,experimentalRefinement:{selectedTriangles:selected,highError,poorQuality,splitEdges:mids.size,projected,rejected,method:'conforming-projected-midpoint'}}
}
