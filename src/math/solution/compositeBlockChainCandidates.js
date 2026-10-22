import {quadraticSonicPartners} from './sonicPartners.js'
import {sampledRarefactionPrefix} from './rarefactionPairCandidates.js'
import {intersectWavePolylines} from './mixedWaveChains.js'
import {constantContactDirections,constantContactConnection} from './contactChainCandidates.js'
import {classifyLaxShock} from './twoShockFamilyEvidence.js'
import {sonicShockAdmissibility} from './sonicShockAdmissibility.js'

const coords=q=>Array.isArray(q)?q:[q?.u,q?.v]
const valid=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
const defaults={stateTolerance:1e-6,speedTolerance:1e-7,tangentTolerance:.15,
  maxSourceSamples:64,maxCandidates:24,maxBranchCount:12,maxIterations:12,matchTolerance:.35}
const interval=s=>s.type==='rarefaction'?[s.speeds[0],s.speeds.at(-1)]:[s.speed,s.speed]

function sourceAt(branch,index){
  const i=Math.min(branch.points.length-2,Math.max(0,Math.floor(index))),t=index-i
  const a=coords(branch.points[i]),b=coords(branch.points[i+1])
  return a.map((v,j)=>v+t*(b[j]-v))
}

function compositeCurves(branch,p,options){
  const curves=[],stride=Math.max(1,Math.ceil((branch.points.length-1)/(options.maxSourceSamples-1)))
  let active=[]
  for(let index=0;index<branch.points.length;index=Math.min(branch.points.length-1,index+stride)){
    const U=coords(branch.points[index]),roots=quadraticSonicPartners(U,p,branch.family,branch.side),next=[],used=new Set()
    for(const curve of active){
      const previous=curve.nodes.at(-1).point
      const candidates=roots.map((q,i)=>({q,i,d:distance(previous,q.point)})).filter(q=>!used.has(q.i)).sort((a,b)=>a.d-b.d)
      const best=candidates[0]
      if(best&&best.d<=options.matchTolerance*(1+Math.hypot(...previous))){
        curve.nodes.push({index,point:best.q.point});used.add(best.i);next.push(curve)
      }
    }
    for(let i=0;i<roots.length;i++)if(!used.has(i)&&curves.length<options.maxBranchCount){
      const curve={type:'K',side:branch.side,family:branch.family,source:branch,nodes:[{index,point:roots[i].point}]}
      curves.push(curve);next.push(curve)
    }
    active=next
    if(index===branch.points.length-1)break
  }
  return curves.filter(c=>c.nodes.length>=2).map(c=>({...c,points:c.nodes.map(q=>q.point)}))
}

function pointOn(curve,x,p){
  const i=Math.min(curve.points.length-2,Math.max(0,Math.floor(x))),t=x-i
  const a=coords(curve.points[i]),b=coords(curve.points[i+1]),linear=a.map((v,j)=>v+t*(b[j]-v))
  if(curve.type!=='K')return {point:linear,index:x}
  const index=curve.nodes[i].index+t*(curve.nodes[i+1].index-curve.nodes[i].index)
  const sonic=sourceAt(curve.source,index)
  const roots=quadraticSonicPartners(sonic,p,curve.family,curve.side)
  roots.sort((a,b)=>distance(a.point,linear)-distance(b.point,linear))
  return roots.length?{point:roots[0].point,index,sonic,shock:roots[0]}:null
}

function refineIntersection(a,b,hit,p,options){
  let x=hit.aIndex,y=hit.bIndex
  const x0=Math.floor(Math.min(x,a.points.length-1-1e-10)),y0=Math.floor(Math.min(y,b.points.length-1-1e-10))
  for(let step=0;step<=options.maxIterations;step++){
    const A=pointOn(a,x,p),B=pointOn(b,y,p)
    if(!A||!B)return null
    const f=A.point.map((v,i)=>v-B.point[i])
    if(Math.hypot(...f)<=options.stateTolerance)return {A,B,middle:A.point}
    if(step===options.maxIterations)return null
    const column=(curve,t,lo)=>{
      const h=1e-4,l=Math.max(lo,t-h),r=Math.min(lo+1,t+h),L=pointOn(curve,l,p),R=pointOn(curve,r,p)
      return L&&R&&r>l?R.point.map((v,i)=>(v-L.point[i])/(r-l)):null
    }
    const da=column(a,x,x0),db=column(b,y,y0)
    if(!da||!db)return null
    const det=da[1]*db[0]-da[0]*db[1]
    if(Math.abs(det)<1e-12*(1+Math.hypot(...da)*Math.hypot(...db)))return null
    const dx=(-db[1]*f[0]+db[0]*f[1])/det,dy=(-da[1]*f[0]+da[0]*f[1])/det
    let accepted=false
    for(let damping=1;damping>=1/64;damping/=2){
      const X=x-damping*dx,Y=y-damping*dy
      if(X<x0||X>x0+1||Y<y0||Y>y0+1)continue
      const AA=pointOn(a,X,p),BB=pointOn(b,Y,p)
      if(AA&&BB&&distance(AA.point,BB.point)<Math.hypot(...f)){x=X;y=Y;accepted=true;break}
    }
    if(!accepted)return null
  }
  return null
}

function blockAt(curve,evaluation,middle,anchor,p,options){
  const left=curve.side==='left',from=left?anchor:middle,to=left?middle:anchor
  if(curve.type==='C'){
    const contact=constantContactConnection(from,to,p,curve.family,options)
    return contact?{type:'C',segments:[contact]}:null
  }
  if(curve.type==='S'){
    const q=classifyLaxShock(from,to,p)
    return q.families.includes(curve.family)?{type:'S',segments:[{type:'shock',family:curve.family,from:[...from],to:[...to],
      states:[[...from],[...to]],speed:q.shock.speed,relativeResidual:q.shock.relativeResidual}]}:null
  }
  const source=curve.type==='K'?curve.source:curve
  const junction=curve.type==='K'?evaluation.sonic:middle
  const fan=sampledRarefactionPrefix(source,evaluation.index,junction,p,!left,options)
  if(!fan)return null
  const rare={type:'rarefaction',...fan,from:[...fan.states[0]],to:[...fan.states.at(-1)]}
  if(curve.type==='R')return {type:'R',segments:[rare]}
  const shock=evaluation.shock
  if(!shock||distance(shock.point,middle)>options.stateTolerance)return null
  const jump={type:'shock',family:curve.family,from:left?[...junction]:[...middle],to:left?[...middle]:[...junction],
    speed:shock.speed,relativeResidual:shock.relativeResidual,sonicSide:shock.sonicSide,weakLax:shock.evidence}
  const check=sonicShockAdmissibility(jump.from,jump.to,p,curve.family,shock.sonicSide,
    {tolerance:options.stateTolerance,rhTolerance:options.stateTolerance})
  if(!check.passes||Math.abs(check.speed-jump.speed)>options.stateTolerance*(1+Math.abs(jump.speed)))return null
  jump.relativeResidual=check.rhResidual;jump.weakLax=check
  return {type:'K',family:curve.family,segments:left?[rare,jump]:[jump,rare],
    sonicJunction:[...junction],construction:left?'rarefaction-shock':'shock-rarefaction'}
}

/** Search the seven pairs containing K. Supported K orientations are R-S on
 * the slow left family and S-R on the fast right family. No entropy assertion.
 */
export function compositeBlockChainCandidates(states,rarefactions,hugoniot,p,options={}){
  const {left,right}=states??{},opts={...defaults,...options}
  if(!valid(left)||!valid(right)||!Number.isInteger(opts.maxSourceSamples)||opts.maxSourceSamples<2||
    !Number.isInteger(opts.maxCandidates)||opts.maxCandidates<1||
    !['stateTolerance','speedTolerance','tangentTolerance','matchTolerance'].every(k=>Number.isFinite(opts[k])&&opts[k]>0)||
    !Number.isInteger(opts.maxBranchCount)||opts.maxBranchCount<1||!Number.isInteger(opts.maxIterations)||opts.maxIterations<1)return []
  const sides={left:[],right:[]}
  for(const side of ['left','right']){
    const family=side==='left'?'slow':'fast',anchor=states[side]
    for(const branch of rarefactions??[])if(branch.side===side&&branch.family===family&&branch.points?.length>1&&
      valid(coords(branch.points[0]))&&distance(coords(branch.points[0]),anchor)<=opts.stateTolerance){
      sides[side].push({...branch,type:'R'},...compositeCurves(branch,p,opts))
    }
    sides[side].push(...(hugoniot?.[side]??[]).filter(q=>q.points?.length>1).map(q=>({...q,type:'S',side,family})))
  }
  if(![...sides.left,...sides.right].some(q=>q.type==='K'))return []
  const allPoints=[...sides.left,...sides.right].flatMap(q=>q.points.map(coords)).filter(valid)
  for(const side of ['left','right'])for(const model of constantContactDirections(p)){
    const anchor=states[side],span=1+Math.max(...allPoints.map(q=>distance(q,anchor)))
    sides[side].push({type:'C',side,family:side==='left'?'slow':'fast',
      points:[-span,span].map(t=>anchor.map((v,i)=>v+t*model.direction[i]))})
  }
  const result=[]
  for(const a of sides.left)for(const b of sides.right){
    if(a.type!=='K'&&b.type!=='K')continue
    for(const hit of intersectWavePolylines(a.points,b.points)){
      const refined=refineIntersection(a,b,hit,p,opts)
      if(!refined)continue
      const {middle}=refined,A=blockAt(a,refined.A,middle,left,p,opts),B=blockAt(b,refined.B,middle,right,p,opts)
      if(!A||!B)continue
      const gap=interval(B.segments[0])[0]-interval(A.segments.at(-1))[1]
      if(!(gap>opts.speedTolerance*(1+Math.abs(interval(A.segments.at(-1))[1]))))continue
      const pattern=A.type+B.type
      if(result.some(q=>q.pattern===pattern&&distance(q.middle,middle)<=opts.stateTolerance&&
        q.blocks.every((block,i)=>block.type!=='K'||distance(block.sonicJunction,[A,B][i].sonicJunction)<=opts.stateTolerance)))continue
      const segments=[...A.segments,...B.segments],fans=segments.filter(q=>q.type==='rarefaction')
      result.push({kind:'composite-chain',status:'sampled-candidate',pattern,left:[...left],middle:[...middle],right:[...right],
        blocks:[A,B],segments,fans,shocks:segments.filter(q=>q.type==='shock'),contacts:segments.filter(q=>q.type==='contact'),
        evidence:{status:'composite-blocks-numerically-compatible',geometry:'state-sonic-equations-and-sampled-curves',
          lax:'weak-lax-at-sonic-shocks',fan:'sampled-speed-and-tangent-compatible',liu:'not-evaluated',entropyCertified:false},
        provenance:{kind:'composite-chain',pattern,intersection:'locally-refined-block-intersection',
          waves:segments.map((q,i)=>({type:q.type,family:q.family,speed:q.speed,
            from:i===0?'U_L':`U_${i}`,to:i===segments.length-1?'U_R':`U_${i+1}`,
            speedStart:q.speeds?.[0],speedEnd:q.speeds?.at(-1),
            origin:q.type==='shock'?'state-sonic-or-hugoniot':'sampled-characteristic-branch'})),entropyCertified:false},
        search:{complete:false,options:{...opts},orientations:['slow-RS','fast-SR']},entropyCertified:false})
      if(result.length>=opts.maxCandidates)return result
    }
  }
  return result
}
