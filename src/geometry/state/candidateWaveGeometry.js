import {candidateStateGeometry} from './candidateStateGeometry.js'
import {fiber,zcFromZ,zFromZc} from '../../math/charts/zChart.js'
import {stateCharacteristicDirection} from '../../math/rarefaction/stateIntegralCurves.js'
import {stateFiberPoint} from '../../math/state/fibers.js'
import {liftHugoniotSample} from '../../math/state/hugoniotWaveLift.js'
import {finiteLinePaths} from '../../rendering/finiteLinePaths.js'
import {regularFibreInterval} from '../../math/solution/forwardLiuOnFiniteFibre.js'

function characteristicPoint(U,p,family){
  const eigen=stateCharacteristicDirection(U,p,family)
  if(!eigen||Math.abs(eigen.direction[1])<=1e-9)return null
  const z=eigen.direction[0]/eigen.direction[1],f=fiber(z,0,p)
  if(f.kind!=='regular')return null
  const tau=((U[0]-f.base[0])*f.tangent[0]+(U[1]-f.base[1])*f.tangent[1])/f.D
  return [tau,0,zcFromZ(z)]
}

function shockPoints(segment,p){
  const {arc,from,to,family}=segment
  if(!arc?.points.length){
    const start=characteristicPoint(from,p,family),end=liftHugoniotSample(from,to,p)
    if(!start||end.kind!=='regular'||!regularFibreInterval(zFromZc(start[2]),end.z,p))return []
    return Array.from({length:129},(_,i)=>{
      if(i===0)return start
      if(i===128)return [end.tau,end.Y,end.zc]
      const zc=start[2]+(end.zc-start[2])*i/128
      const q=stateFiberPoint(from,zFromZc(zc),p,'minus')
      return q.kind==='regular'?[q.tau,q.Y,zc]:null
    })
  }
  const fixed=arc.reverse?to:from
  const side=arc.reverse?'plus':'minus'
  const jump=liftHugoniotSample(from,to,p)
  if(jump.kind!=='regular')return []
  return arc.points.map((U,index)=>{
    const atFixed=arc.reverse?index===arc.points.length-1:index===0
    const atJump=arc.reverse?index===0:index===arc.points.length-1
    if(atFixed)return characteristicPoint(fixed,p,family)
    if(atJump)return [jump.tau,jump.Y,jump.zc]
    const dv=U[1]-fixed[1],du=U[0]-fixed[0]
    if(Math.abs(dv)<=1e-9*Math.hypot(du,dv))return null
    // Re-evaluate the exact fibre at the sampled direction so integration
    // error in the state-plane continuation does not displace the 3D trace.
    const z=du/dv,q=stateFiberPoint(fixed,z,p,side)
    return q.kind==='regular'?[q.tau,q.Y,zcFromZ(z)]:null
  })
}

/** Preserve each segment's lift. Adjacent waves can share a physical state
 * while lying at different points of the wave manifold.
 */
export function candidateWaveGeometry(candidate,p){
  return candidateStateGeometry(candidate,p).segments.map(segment=>{
    const points=segment.type==='shock'?shockPoints(segment,p):
      (segment.states??[]).map(U=>characteristicPoint(U,p,segment.family))
    const finite=points.flatMap((q,i)=>q&&points[i-1]&&Math.abs(q[2]-points[i-1][2])>1?[null,q]:[q])
    return {index:segment.index,type:segment.type,family:segment.family,
      paths:finiteLinePaths(finite),end:points.at(-1)}
  })
}
