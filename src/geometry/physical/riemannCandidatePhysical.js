import {evaluateSelfSimilarCandidate} from '../../math/solution/riemannSelfSimilarCandidate.js'

/** Physical rendering data for a sampled Riemann-chain candidate (not entropy-certified). */
export function candidateWaveSpeeds(candidate){
  if(candidate?.status!=='sampled-candidate')return null
  if(candidate.kind==='contact-chain'||candidate.kind==='composite-chain'){
    if(!Array.isArray(candidate.segments)||candidate.segments.length<2)return null
    const shocks=[],contacts=[],fans=[]
    for(const segment of candidate.segments){
      if(segment.type==='rarefaction'){
        if(!Array.isArray(segment.speeds)||segment.speeds.length<2||!segment.speeds.every(Number.isFinite))return null
        fans.push([segment.speeds[0],segment.speeds.at(-1)])
      }else{
        if(!['contact','shock'].includes(segment.type)||!Number.isFinite(segment.speed))return null
        if(segment.type==='contact')contacts.push(segment.speed)
        else shocks.push(segment.speed)
      }
    }
    return {shocks,contacts,fans}
  }
  if(candidate.kind==='two-shock')return {shocks:[...candidate.speeds],fans:[]}
  if(candidate.kind==='two-rarefaction'){
    if(!Array.isArray(candidate.fans)||candidate.fans.length!==2||candidate.fans.some(f=>
      !Array.isArray(f.speeds)||f.speeds.length<2||!f.speeds.every(Number.isFinite)))return null
    return {shocks:[],fans:candidate.fans.map(f=>[f.speeds[0],f.speeds.at(-1)])}
  }
  const lambda=candidate.fanSpeeds
  if(!Array.isArray(lambda)||lambda.length<2||!lambda.every(Number.isFinite)||!Number.isFinite(candidate.shockSpeed))return null
  return {shocks:[candidate.shockSpeed],fans:[[lambda[0],lambda.at(-1)]]}
}

export function candidatePhysicalGeometry(candidate,{tMax=1,rayCount=13}={}){
  const waves=candidateWaveSpeeds(candidate)
  if(!waves||!(tMax>0)||!Number.isFinite(tMax))return null
  const speeds=[...waves.shocks,...(waves.contacts??[]),...waves.fans.flat(),0]
  const maxAbs=Math.max(0.25,...speeds.map(Math.abs))
  const xMin=Math.min(...speeds)*tMax-0.16*maxAbs*tMax
  const xMax=Math.max(...speeds)*tMax+0.16*maxAbs*tMax
  const fans=waves.fans.map(([a,b])=>({left:a,right:b,rays:Array.from({length:rayCount},(_,i)=>a+(b-a)*i/(rayCount-1))}))
  return {tMax,xMin,xMax,shocks:waves.shocks,contacts:waves.contacts??[],fans}
}

/** Exact one-sided traces at each candidate shock, independent of sampling resolution. */
export function candidateShockTraces(candidate){
  const waves=candidateWaveSpeeds(candidate)
  if(!waves)return []
  if(candidate.kind==='contact-chain'||candidate.kind==='composite-chain')return candidate.segments.filter(q=>q.type==='shock').map(q=>({speed:q.speed,left:[...q.from],right:[...q.to]}))
  if(candidate.kind==='two-shock'){
    if(!Array.isArray(candidate.states)||candidate.states.length!==3)return []
    return waves.shocks.map((speed,i)=>({speed,left:[...candidate.states[i]],right:[...candidate.states[i+1]]}))
  }
  if(candidate.kind==='rarefaction-shock')return [{speed:candidate.shockSpeed,left:[...candidate.middle],right:[...candidate.right]}]
  if(candidate.kind==='shock-rarefaction')return [{speed:candidate.shockSpeed,left:[...candidate.left],right:[...candidate.middle]}]
  return []
}

export function candidatePhysicalProfiles(candidate,{time=0.5,tMax=time,count=240}={}){
  if(!(time>0)||!Number.isFinite(time))return null
  const geometry=candidatePhysicalGeometry(candidate,{tMax})
  if(!geometry)return null
  const points=Array.from({length:count+1},(_,i)=>{
    const x=geometry.xMin+(geometry.xMax-geometry.xMin)*i/count
    const U=evaluateSelfSimilarCandidate(candidate,x/time)
    return U?{x,u:U[0],v:U[1]}:null
  })
  if(points.some(q=>!q))return null
  const shockTraces=candidateShockTraces(candidate).map(trace=>({...trace,x:trace.speed*time}))
  const contactTraces=['contact-chain','composite-chain'].includes(candidate.kind)?candidate.segments.filter(q=>q.type==='contact')
    .map(q=>({speed:q.speed,x:q.speed*time,left:[...q.from],right:[...q.to]})):[]
  return {...geometry,time,points,shockTraces,contactTraces,jumpTraces:[...shockTraces,...contactTraces].sort((a,b)=>a.x-b.x)}
}
