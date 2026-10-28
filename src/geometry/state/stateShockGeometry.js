import {classifyLaxShock} from '../../math/solution/twoShockFamilyEvidence.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)

/** Keep only the verified prefix attached to the characteristic seed.
 * The first failed endpoint check terminates this arc permanently: later
 * compatible samples do not establish a continuation across the rejected gap.
 * The endpoint is the last verified sample, not a refined sonic boundary.
 */
export function stateShockGeometry(states,branches,p){
  const curves=[]
  for(const side of ['left','right'])for(const branch of branches.curves[side]){
    const fixed=states?.[side],anchor=branch.points?.[0]
    if(!valid(fixed)||!anchor||Math.hypot(anchor.u-fixed[0],anchor.v-fixed[1])>1e-8*(1+Math.hypot(...fixed)))continue
    const points=[{u:fixed[0],v:fixed[1]}]
    let termination={reason:branch.stop??'sample-limit',firstRejected:null}
    for(let i=1;i<branch.points.length;i++){
      const q=branch.points[i],U=[q.u,q.v]
      const check=side==='left'?classifyLaxShock(fixed,U,p):classifyLaxShock(U,fixed,p)
      if(!check.families.includes(branch.family)){
        termination={reason:check.status==='non-strict-hyperbolicity'?'hyperbolicity-unverified':
          check.status==='rankine-hugoniot-unverified'?'rh-unverified':'lax-endpoint-boundary',
          firstRejected:U,checkStatus:check.status}
        break
      }
      points.push({...q,speed:check.shock.speed,residual:check.shock.relativeResidual})
    }
    if(points.length>1)curves.push({id:branch.id,side,family:branch.family,points,
      termination:{...termination,lastVerified:[points.at(-1).u,points.at(-1).v]},entropyCertified:false})
  }
  return curves
}
