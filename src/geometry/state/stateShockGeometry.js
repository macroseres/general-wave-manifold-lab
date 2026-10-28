import {classifyLaxShock} from '../../math/solution/twoShockFamilyEvidence.js'

/** Display only contiguous RH samples satisfying the family's strict endpoint
 * Lax test, in physical orientation. This is not an entropy certificate.
 */
export function stateShockGeometry(states,branches,p){
  const curves=[]
  for(const side of ['left','right'])for(const branch of branches.curves[side]){
    let points=[]
    const flush=()=>{
      if(points.length>1)curves.push({id:`${branch.id}-${curves.length}`,side,family:branch.family,points})
      points=[]
    }
    for(let i=1;i<branch.points.length;i++){
      const q=branch.points[i],U=[q.u,q.v],fixed=states[side]
      const check=side==='left'?classifyLaxShock(fixed,U,p):classifyLaxShock(U,fixed,p)
      if(check.families.includes(branch.family)){
        if(i===1)points.push({u:fixed[0],v:fixed[1]})
        points.push({...q,speed:check.shock.speed,residual:check.shock.relativeResidual})
      }else flush()
    }
    flush()
  }
  return curves
}
