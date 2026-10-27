import {intersectWavePolylines} from './mixedWaveChains.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {refineRarefactionMiddleJoint,sampledArcLength} from './rarefactionJointCorrector.js'

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
export function searchRarefactionPairs(states,branches,p,options={}){
  const result=[]
  const report={status:'not-evaluated',stopReason:null,complete:false,
    limitedTo:'supplied-sampled-branches',seedSearchExhausted:false,candidateLimitReached:false,
    candidateCount:0,branches:[],pairs:[],diagnostics:[]}
  const finish=(stopReason,status)=>{
    report.stopReason=stopReason
    report.candidateCount=result.length
    report.status=status??(result.length?'candidates-found':
      report.diagnostics.some(d=>d.classification==='numerical-failure')||
        report.branches.some(b=>b.relevant&&b.stop==='integration-tolerance')?'numerical-failure':
      report.diagnostics.some(d=>['inconclusive','invalid-input'].includes(d.classification))?'inconclusive':'no-candidates-found')
    for(const q of result)q.search.report=report
    return {candidates:result,report}
  }
  const {left,right}=states??{}
  if(!valid(left)||!valid(right))return finish('invalid-states','invalid-input')
  const opts={stateTolerance:1e-7,speedTolerance:1e-9,tangentTolerance:.15,maxCandidates:24,...options}
  const corrector=opts.corrector
  const invalidCorrector=corrector!==undefined&&(!corrector||typeof corrector!=='object'||Array.isArray(corrector)||
    ['integrationStep','residualTolerance','parameterTolerance','conditioningTolerance'].some(key=>
      corrector[key]!==undefined&&(!Number.isFinite(corrector[key])||corrector[key]<=0))||
    corrector.maxIterations!==undefined&&(!Number.isInteger(corrector.maxIterations)||corrector.maxIterations<1))
  if(!Number.isInteger(opts.maxCandidates)||opts.maxCandidates<1||
    ![opts.stateTolerance,opts.speedTolerance,opts.tangentTolerance].every(v=>Number.isFinite(v)&&v>=0)||
    !Array.isArray(branches)||invalidCorrector)return finish('invalid-options-or-branches','invalid-input')
  report.tolerances={...opts,corrector:{integrationStep:.01,residualTolerance:1e-10,
    parameterTolerance:1e-12,conditioningTolerance:1e-8,maxIterations:24,...corrector}}
  const eligible=(branch,side,family,anchor)=>branch?.side===side&&branch.family===family&&
    Array.isArray(branch.points)&&branch.points.length>1&&valid(coords(branch.points[0]))&&distance(coords(branch.points[0]),anchor)<=opts.stateTolerance
  report.branches=branches.map((b,index)=>{
    const accepted=eligible(b,'left','slow',left)||eligible(b,'right','fast',right)
    const rejectionReason=accepted?null:!['left','right'].includes(b?.side)?'unsupported-side':
      b.family!==(b.side==='left'?'slow':'fast')?'not-rr-family':
      !Array.isArray(b.points)||b.points.length<2?'insufficient-points':!valid(coords(b.points[0]))?'invalid-anchor':'anchor-mismatch'
    return {index,side:b?.side??null,family:b?.family??null,sign:b?.sign??null,
      stop:b?.stop??null,status:b?.status??null,pointCount:b?.points?.length??0,
      parameterExtent:Array.isArray(b?.points)?sampledArcLength(b,b.points.length-1):null,
      relevant:b?.side==='left'&&b.family==='slow'||b?.side==='right'&&b.family==='fast',
      eligible:accepted,rejectionReason}
  })
  const forward=report.branches.filter(b=>b.eligible&&b.side==='left')
  const backward=report.branches.filter(b=>b.eligible&&b.side==='right')
  if(!forward.length||!backward.length)return finish('missing-eligible-branches',
    report.branches.some(b=>b.relevant&&b.stop==='integration-tolerance')?'numerical-failure':'incompatible-branches')
  report.pairs=forward.flatMap(a=>backward.map(b=>({leftBranch:a.index,rightBranch:b.index,
    status:'not-explored',seedsFound:null,seedsVisited:0,unexaminedSeeds:null})))
  for(const [pairIndex,pair] of report.pairs.entries()){
    const a=branches[pair.leftBranch],b=branches[pair.rightBranch]
    const hits=intersectWavePolylines(a.points,b.points)
    pair.seedsFound=hits.length
    pair.status='examined'
    pair.unexaminedSeeds=[]
    for(const hit of hits){
      pair.seedsVisited++
      const record=(stage,status,classification,details={})=>report.diagnostics.push({pairIndex,
        seed:{aIndex:hit.aIndex,bIndex:hit.bIndex},stage,status,classification,...details})
      if(!sampledRarefactionPrefix(a,hit.aIndex,hit.point,p,false,opts)||
        !sampledRarefactionPrefix(b,hit.bIndex,hit.point,p,true,opts)){
        record('sampled-fans','sampled-fan-rejected','numerically-incompatible');continue
      }
      const refinement=refineRarefactionMiddleJoint(a,b,p,hit,opts.corrector)
      if(refinement.status!=='refined-candidate'){
        const classification=refinement.status==='integration-failed'?'numerical-failure':
          refinement.status.startsWith('invalid-')?'invalid-input':'inconclusive'
        record('corrector',refinement.status,classification,{refinement});continue
      }
      const middle=refinement.middle
      const fans=refinement.curves.map((curve,i)=>{
        const branch={...(i===0?a:b),points:curve.states.map(q=>[...q])}
        branch.points[branch.points.length-1]=[...middle]
        const fan=sampledRarefactionPrefix(branch,branch.points.length-1,middle,p,i===1,opts)
        if(fan)fan.source.index=i===0?hit.aIndex:hit.bIndex
        return fan
      })
      const [first,second]=fans
      if(!first||!second){record('corrected-fans','corrected-fan-rejected','numerically-incompatible');continue}
      const gap=second.speeds[0]-first.speeds.at(-1)
      if(!(gap>opts.speedTolerance*(1+Math.max(Math.abs(second.speeds[0]),Math.abs(first.speeds.at(-1)))))){
        record('ordering','unordered-fans','numerically-incompatible',{speedGap:gap});continue
      }
      if(result.some(q=>distance(q.middle,middle)<=opts.stateTolerance&&
        q.fans[0].source.sign===a.sign&&q.fans[1].source.sign===b.sign)){
        record('deduplication','duplicate-candidate','duplicate');continue
      }
      result.push({status:'sampled-candidate',kind:'two-rarefaction',pattern:'RR',
        left:[...left],middle:[...middle],right:[...right],fans:[first,second],
        refinement:{...refinement,curves:undefined},
        fanStates:[...first.states,...second.states.slice(1)],
        fanSpeeds:[...first.speeds,...second.speeds.slice(1)],
        evidence:{status:'sampled-fans-ordered',geometry:'corrected-characteristic-intersection',lax:'not-applicable',
          fan:'sampled-speed-and-tangent-compatible',liu:'not-applicable',entropyCertified:false},
        provenance:{kind:'two-rarefaction',intersection:'corrected-characteristic-intersection',
          waves:[first,second].map((fan,i)=>({type:'rarefaction',family:fan.family,
            from:i===0?'U_L':'U_M',to:i===0?'U_M':'U_R',origin:'sampled-characteristic-branch',
            branchSign:fan.source.sign,branchIndex:fan.source.index,
            speedStart:fan.speeds[0],speedEnd:fan.speeds.at(-1)})),entropyCertified:false},
        search:{complete:false,limitedTo:'supplied-sampled-branches',tolerances:{...opts}},entropyCertified:false})
      record('candidate','accepted','numerically-compatible',{candidateIndex:result.length-1})
      if(result.length>=opts.maxCandidates){
        report.candidateLimitReached=true
        if(pair.seedsVisited<pair.seedsFound){
          pair.status='partially-examined'
          pair.unexaminedSeeds=hits.slice(pair.seedsVisited).map(q=>({aIndex:q.aIndex,bIndex:q.bIndex}))
        }
        report.seedSearchExhausted=report.pairs.every(q=>q.status==='examined')
        return finish('candidate-limit')
      }
    }
  }
  report.seedSearchExhausted=true
  return finish('supplied-branches-exhausted')
}

/** Existing array API; use searchRarefactionPairs for reports even without candidates. */
export function rarefactionPairCandidates(states,branches,p,options={}){
  return searchRarefactionPairs(states,branches??[],p,options).candidates
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
