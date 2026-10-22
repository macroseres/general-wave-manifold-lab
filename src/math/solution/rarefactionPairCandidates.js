import {intersectWavePolylines} from './mixedWaveChains.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'

const valid=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const coords=q=>Array.isArray(q)?q:[q?.u,q?.v]
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])

export function sampledRarefactionPrefix(branch,index,middle,p,reverse,options){
  const raw=branch.points.slice(0,Math.floor(index)+1).map(coords)
  if(!raw.every(valid))return null
  if(!raw.length||distance(raw.at(-1),middle)>options.stateTolerance)raw.push(middle)
  const states=[]
  for(const q of reverse?raw.reverse():raw)
    if(!states.length||distance(states.at(-1),q)>options.stateTolerance)states.push([...q])
  if(states.length<2)return null
  const fields=states.map(U=>stateCharacteristicDirection(U,p,branch.family))
  if(fields.some(q=>!q))return null
  const speeds=fields.map(q=>q.lambda)
  for(let i=1;i<states.length;i++){
    const a=states[i-1],b=states[i],length=distance(a,b),chord=[(b[0]-a[0])/length,(b[1]-a[1])/length]
    const eps=options.speedTolerance*(1+Math.max(Math.abs(speeds[i]),Math.abs(speeds[i-1])))
    if(!(speeds[i]-speeds[i-1]>eps))return null
    // Reject intersections on a supplied polyline unrelated to its characteristic field.
    for(const field of [fields[i-1],fields[i]])
      if(Math.abs(chord[0]*field.direction[1]-chord[1]*field.direction[0])>options.tangentTolerance)return null
  }
  return {family:branch.family,states,speeds,source:{side:branch.side,sign:branch.sign,index,stop:branch.stop??null}}
}

/** Intersections of supplied slow forward / fast backward sampled integral curves.
 * This limited search is a numerical candidate construction, not an exact solver.
 */
export function rarefactionPairCandidates(states,branches,p,options={}){
  const {left,right}=states??{}
  if(!valid(left)||!valid(right))return []
  const opts={stateTolerance:1e-7,speedTolerance:1e-9,tangentTolerance:.15,maxCandidates:24,...options}
  if(!Number.isInteger(opts.maxCandidates)||opts.maxCandidates<1||
    ![opts.stateTolerance,opts.speedTolerance,opts.tangentTolerance].every(v=>Number.isFinite(v)&&v>=0))return []
  const eligible=(branch,side,family,anchor)=>branch?.side===side&&branch.family===family&&
    branch.points?.length>1&&valid(coords(branch.points[0]))&&distance(coords(branch.points[0]),anchor)<=opts.stateTolerance
  const forward=(branches??[]).filter(b=>eligible(b,'left','slow',left))
  const backward=(branches??[]).filter(b=>eligible(b,'right','fast',right))
  const result=[]
  for(const a of forward)for(const b of backward){
    for(const hit of intersectWavePolylines(a.points,b.points)){
      const first=sampledRarefactionPrefix(a,hit.aIndex,hit.point,p,false,opts)
      const second=sampledRarefactionPrefix(b,hit.bIndex,hit.point,p,true,opts)
      if(!first||!second)continue
      const gap=second.speeds[0]-first.speeds.at(-1)
      if(!(gap>opts.speedTolerance*(1+Math.max(Math.abs(second.speeds[0]),Math.abs(first.speeds.at(-1))))))continue
      if(result.some(q=>distance(q.middle,hit.point)<=opts.stateTolerance&&
        q.fans[0].source.sign===a.sign&&q.fans[1].source.sign===b.sign))continue
      result.push({status:'sampled-candidate',kind:'two-rarefaction',pattern:'RR',
        left:[...left],middle:[...hit.point],right:[...right],fans:[first,second],
        fanStates:[...first.states,...second.states.slice(1)],
        fanSpeeds:[...first.speeds,...second.speeds.slice(1)],
        evidence:{status:'sampled-fans-ordered',geometry:'sampled-intersection',lax:'not-applicable',
          fan:'sampled-speed-and-tangent-compatible',liu:'not-applicable',entropyCertified:false},
        provenance:{kind:'two-rarefaction',intersection:'sampled-characteristic-intersection',
          waves:[first,second].map((fan,i)=>({type:'rarefaction',family:fan.family,
            from:i===0?'U_L':'U_M',to:i===0?'U_M':'U_R',origin:'sampled-characteristic-branch',
            branchSign:fan.source.sign,branchIndex:fan.source.index,
            speedStart:fan.speeds[0],speedEnd:fan.speeds.at(-1)})),entropyCertified:false},
        search:{complete:false,limitedTo:'supplied-sampled-branches',tolerances:{...opts}},entropyCertified:false})
      if(result.length>=opts.maxCandidates)return result
    }
  }
  return result
}

export function evaluateRarefactionPair(candidate,xi){
  if(candidate?.status!=='sampled-candidate'||candidate.kind!=='two-rarefaction'||!Number.isFinite(xi))return null
  for(const fan of candidate.fans){
    if(xi<fan.speeds[0])return [...fan.states[0]]
    for(let i=1;i<fan.speeds.length;i++)if(xi<=fan.speeds[i]){
      const t=(xi-fan.speeds[i-1])/(fan.speeds[i]-fan.speeds[i-1])
      return fan.states[i-1].map((v,j)=>v+t*(fan.states[i][j]-v))
    }
  }
  return [...candidate.right]
}
