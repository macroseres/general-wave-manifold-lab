import {traceSeededForwardHugoniot} from './seededForwardHugoniot.js'

/** Bounded RH branches for construction, independently of manifold charts.
 * Reuse the existing characteristic-seeded continuation and retain its stops.
 * Backward curves exchange fixed endpoints geometrically only, without Liu.
 */
export function stateShockBranches(states,p){
  const curves={left:[],right:[]},stops=[]
  for(const side of ['left','right']){
    const fixed=states?.[side],target=states?.[side==='left'?'right':'left']
    const family=side==='left'?'slow':'fast'
    const traced=traceSeededForwardHugoniot(fixed,target,p,{family,includeAttempts:true,
      maxSteps:240,maxRadius:2,step:.025,targetTolerance:.005})
    for(const attempt of traced.attempts??[]){
      stops.push({side,family,sign:attempt.sign,reason:attempt.reason})
      if(attempt.arc.length>2)curves[side].push({id:`state-rh-${side}-${attempt.sign}`,family,
        points:attempt.arc.map(([u,v])=>({u,v})),stop:attempt.reason})
    }
    if(!traced.attempts?.length)stops.push({side,family,reason:traced.status})
  }
  return {curves,stops,complete:false,limits:{maxSteps:240,maxRadius:2,step:.025}}
}
