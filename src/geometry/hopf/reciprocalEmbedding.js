import { reciprocalHopfAt } from '../../math/sonic/hopfReciprocal.js'

/** A continuous atlas-independent diagnostic embedding in (ubar_u,ubar_v,X,Z).
 * It is NOT a 3D embedding into the finite-chart (tau,Y,zc) scene.
 */
export function embedReciprocalHopfPoint(free,X,Z,p,side){
  const h=reciprocalHopfAt(free,X,Z,p,side)
  if(h.kind!=='regular')return {kind:h.kind}
  return {kind:'regular',coordinates:[h.Ubar[0],h.Ubar[1],X,Z],trace:h.trace,det:h.det,side}
}

/** Map a reciprocal surface mesh into R4 without discarding Z=0 or changing chart.
 * Keep source triangle connectivity. Never connect separate projective branches.
 */
export function embedReciprocalHopfMesh(mesh,p){
  if(mesh?.kind!=='regular'||mesh.chart!=='reciprocal'||!['minus','plus'].includes(mesh.side)||!Array.isArray(mesh.positions)||mesh.positions.length%3!==0||!Array.isArray(mesh.indices))return {kind:'invalid-input'}
  const positions4=[]
  for(let i=0;i<mesh.positions.length;i+=3){
    const point=embedReciprocalHopfPoint(mesh.positions[i],mesh.positions[i+1],mesh.positions[i+2],p,mesh.side)
    if(point.kind!=='regular')return {kind:'invalid-vertex',vertex:i/3,reason:point.kind}
    positions4.push(...point.coordinates)
  }
  return {kind:'regular',chart:'reciprocal',coordinates:['ubar_u','ubar_v','X','Z'],positions4,indices:[...mesh.indices],side:mesh.side}
}
