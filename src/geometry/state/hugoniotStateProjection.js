/**
 * Projection of already classified fixed-state Hugoniot geometry to state space.
 *
 * No spectral/Lax classification is recomputed here.  For the forward fibre
 * pi_-^{-1}(U*) the fixed endpoint is U_-=U* and the displayed state is U_+.
 * For the backward fibre pi_+^{-1}(U*) the fixed endpoint is U_+=U* and the
 * displayed state is U_-.
 */
import { waveState } from '../../math/manifold/waveState.js'

const finite=Number.isFinite

export function projectHugoniotPointToState(q,p,side){
  if(!q||![q.tau,q.Y,q.z].every(finite))return null
  const w=waveState(q.tau,q.Y,q.z,p)
  if(w.kind!=='regular')return null
  const U=side==='minus'?w.Up:w.Um
  return U?.every(finite)?{u:U[0],v:U[1],tau:q.tau,Y:q.Y,z:q.z,zc:q.zc}:null
}

export function projectHugoniotLaxGeometryToState(laxGeometry,p){
  const projectSide=(segments,side)=>(segments||[]).flatMap((segment,index)=>{
    const points=segment.points.map(q=>projectHugoniotPointToState(q,p,side)).filter(Boolean)
    return points.length>1?[{...segment,points,side,id:`H:${side}:${index}`}]:[]
  })
  return {forward:projectSide(laxGeometry?.minus,'minus'),backward:projectSide(laxGeometry?.plus,'plus')}
}
