const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)

/** Select the classical wave-curve prefixes for display, without changing the
 * branches supplied to the existing candidate/contact/composite constructors.
 * Backward fast arcs are stored from U_R outwards (decreasing lambda); their
 * physical orientation towards U_R has increasing lambda.
 */
export function stateRarefactionGeometry(states,branches,{tolerance=1e-7}={}){
  const curves=[]
  for(const branch of branches){
    const {side,family}=branch
    if(!(side==='left'&&family==='slow'||side==='right'&&family==='fast'))continue
    const fixed=states?.[side],anchor=branch.points?.[0]
    if(!valid(fixed)||!valid(anchor)||Math.hypot(anchor[0]-fixed[0],anchor[1]-fixed[1])>1e-8*(1+Math.hypot(...fixed)))continue
    const points=[],speeds=[],direction=side==='left'?1:-1
    let reason=branch.status==='complete-local-trace'?branch.stop??'sample-limit':branch.status
    for(let i=0;i<branch.points.length;i++){
      const U=branch.points[i],lambda=branch.speeds?.[i]
      if(!valid(U)||!Number.isFinite(lambda)){reason='invalid-sample';break}
      if(i&&direction*(lambda-speeds.at(-1))<=tolerance*(1+Math.max(Math.abs(lambda),Math.abs(speeds.at(-1))))){
        reason='strict-speed-order-unverified';break
      }
      points.push(U);speeds.push(lambda)
    }
    if(points.length<2)continue
    curves.push({...branch,points,speeds,speedStart:speeds[0],speedEnd:speeds.at(-1),
      events:(branch.events??[]).filter(e=>e.index<points.length),
      termination:{reason,lastVerified:points.at(-1)},entropyCertified:false})
  }
  return curves
}
