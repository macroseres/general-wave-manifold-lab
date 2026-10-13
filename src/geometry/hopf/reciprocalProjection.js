import { embedReciprocalHopfMesh, embedReciprocalHopfPoint } from './reciprocalEmbedding.js'

/** Diagnostic linear projection of the intrinsic R4 immersion to R3.
 * Coordinates in the output are (ubar_u,ubar_v,X) or (ubar_u,ubar_v,Z).
 * Neither is the finite-chart display (tau,Y,zc); the missing coordinate
 * is retained as metadata, and the projection is not injective in general.
 */
export function projectReciprocalHopfPoint(free,X,Z,p,side,{view='state-amplitude'}={}){
  if(!['state-amplitude','state-direction'].includes(view))return {kind:'invalid-view'}
  const e=embedReciprocalHopfPoint(free,X,Z,p,side)
  if(e.kind!=='regular')return e
  const [u,v,amplitude,direction]=e.coordinates
  return {kind:'regular',view,position:view==='state-amplitude'?[u,v,amplitude]:[u,v,direction],omitted:view==='state-amplitude'?direction:amplitude,coordinates4:e.coordinates,trace:e.trace,det:e.det}
}

/** Preserve triangles only as a diagnostic projection; faces may overlap in R3. */
export function projectReciprocalHopfMesh(mesh,p,{view='state-amplitude'}={}){
  if(!['state-amplitude','state-direction'].includes(view))return {kind:'invalid-view'}
  const e=embedReciprocalHopfMesh(mesh,p)
  if(e.kind!=='regular')return e
  const positions=[],omitted=[]
  for(let i=0;i<e.positions4.length;i+=4){
    const [u,v,X,Z]=e.positions4.slice(i,i+4)
    positions.push(u,v,view==='state-amplitude'?X:Z)
    omitted.push(view==='state-amplitude'?Z:X)
  }
  return {kind:'regular',view,chart:'reciprocal',positions,omitted,positions4:e.positions4,indices:e.indices,side:e.side,warning:'Diagnostic projection only; not a globally injective atlas visualization'}
}
