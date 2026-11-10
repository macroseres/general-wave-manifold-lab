import {sonicShockAdmissibility} from './sonicShockAdmissibility.js'
import {liuSpeedAlongFibre} from './liuSpeedAlongFibre.js'
import {liuSpeedAlongBackwardFibre} from './backwardLiu.js'

const finite=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])

/** C04-T03: assess one oriented internal K shock on a supplied, ordered
 * Hugoniot arc. The caller must establish the connected arc independently.
 * No arc is invented, no candidate is selected and entropy is never certified.
 */
export function internalCompositeShockLiu(block,arc,p,{endpointTolerance=1e-6,...options}={}){
  const unresolved=(status,reason)=>({status,reason,entropyCertified:false})
  if(block?.type!=='K'||!['rarefaction-shock','shock-rarefaction'].includes(block.construction)||
    !Array.isArray(block.segments)||!['slow','fast'].includes(block.family))
    return unresolved('invalid-block','unsupported K block')
  const jump=block.segments.find(s=>s.type==='shock')
  const leftK=block.construction==='rarefaction-shock'
  const expectedSide=leftK?'minus':'plus'
  if(!jump||jump.family!==block.family||jump.sonicSide!==expectedSide||
    !finite(jump.from)||!finite(jump.to)||!finite(block.sonicJunction)||
    !finite(leftK?jump.from:jump.to)||distance(leftK?jump.from:jump.to,block.sonicJunction)>endpointTolerance*
      (1+Math.hypot(...block.sonicJunction)))
    return unresolved('invalid-block','shock orientation or sonic junction mismatch')
  const endpoint=sonicShockAdmissibility(jump.from,jump.to,p,jump.family,jump.sonicSide)
  if(!endpoint.passes)return unresolved('prerequisites-not-met',endpoint.status)
  const fixed=leftK?jump.from:jump.to,target=leftK?jump.to:jump.from
  const scale=1+Math.max(Math.hypot(...fixed),Math.hypot(...target))
  if(!Array.isArray(arc)||arc.length<3||arc.some(q=>!finite(q))||
    distance(arc[0],fixed)>endpointTolerance*scale||
    distance(arc.at(-1),target)>endpointTolerance*scale)
    return unresolved('arc-unverified','missing, unordered or unmatched Hugoniot arc')
  const check=leftK?liuSpeedAlongFibre(fixed,arc,p,options):
    liuSpeedAlongBackwardFibre(fixed,arc,p,options)
  const violation=['sampled-liu-violation','sampled-backward-liu-violation'].includes(check.status)
  const compatible=['sampled-liu-compatible','sampled-backward-liu-compatible'].includes(check.status)
  return {status:violation?'liu-violation-detected':compatible?'no-sampled-violation':'inconclusive',
    reason:check.status,direction:leftK?'forward':'backward',checked:check.checked??0,
    family:jump.family,sonicSide:jump.sonicSide,from:[...jump.from],to:[...jump.to],
    entropyCertified:false}
}
