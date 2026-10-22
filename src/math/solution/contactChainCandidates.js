import {flux,jacobian} from '../flux/quadraticFlux.js'
import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {sampledRarefactionPrefix} from './rarefactionPairCandidates.js'
import {directShockDiagnostic} from './directShockDiagnostic.js'
import {classifyLaxShock} from './twoShockFamilyEvidence.js'

const valid=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const coords=q=>Array.isArray(q)?q:[q?.u,q?.v]
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0]
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]]
const norm=q=>Math.hypot(...q)
const defaults={stateTolerance:1e-7,speedTolerance:1e-9,tangentTolerance:.15,coefficientTolerance:1e-12,maxCandidates:24}

/** Restricted contact model: constant eigenvalue AND constant eigenvector for
 * every state, checked through the affine Jacobian coefficients. Curved LD
 * families are deliberately outside this constructor's coverage.
 */
export function constantContactDirections(p,{coefficientTolerance=1e-12}={}){
  const keys=['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
  if(!p||!keys.every(k=>Number.isFinite(p[k]))||!Number.isFinite(coefficientTolerance)||coefficientTolerance<0)return []
  const rows=[[2*p.a20,p.a11],[2*p.b20,p.b11],[p.a11,2*p.a02],[p.b11,2*p.b02]]
  const eps=coefficientTolerance*(1+Math.max(...keys.map(k=>Math.abs(p[k]))))
  const row=rows.reduce((a,b)=>norm(a)>norm(b)?a:b)
  if(norm(row)<=eps){
    return ['slow','fast'].flatMap(family=>{
      const q=stateCharacteristicDirection([0,0],p,family)
      return q?[{direction:q.direction,speed:q.lambda,coefficientResidual:Math.max(...rows.map(norm)),coverage:'constant-direction'}]:[]
    })
  }
  let direction=[-row[1]/norm(row),row[0]/norm(row)]
  if((Math.abs(direction[0])>1e-12?direction[0]:direction[1])<0)direction=direction.map(v=>-v)
  direction=direction.map(v=>v===0?0:v)
  const J=jacobian([0,0],p),v=J.map(r=>r[0]*direction[0]+r[1]*direction[1])
  const speed=v[0]*direction[0]+v[1]*direction[1]
  const residual=Math.max(...rows.map(r=>Math.abs(r[0]*direction[0]+r[1]*direction[1])),norm(sub(v,direction.map(x=>speed*x))))
  return residual<=eps?[{direction,speed,coefficientResidual:residual,coverage:'constant-direction'}]:[]
}

function familyAt(U,descriptor,p,options){
  for(const family of ['slow','fast']){
    const q=stateCharacteristicDirection(U,p,family)
    if(q&&Math.abs(q.lambda-descriptor.speed)<=options.speedTolerance*(1+Math.abs(q.lambda))&&
      Math.abs(cross(q.direction,descriptor.direction))<=options.tangentTolerance)return family
  }
  return null
}

/** A contact must belong to the coefficient-level model, not merely be sonic. */
export function constantContactConnection(left,right,p,family,options={}){
  const opts={...defaults,...options}
  if(!valid(left)||!valid(right)||!['slow','fast'].includes(family))return null
  const jump=sub(right,left),length=norm(jump)
  if(length<=opts.stateTolerance)return null
  for(const model of constantContactDirections(p,opts)){
    if(Math.abs(cross(jump,model.direction))>opts.stateTolerance*(1+length)||
      familyAt(left,model,p,opts)!==family||familyAt(right,model,p,opts)!==family)continue
    const rh=directShockDiagnostic(left,right,p,{relativeTolerance:opts.stateTolerance})
    if(!rh.rankineHugoniot||Math.abs(rh.speed-model.speed)>opts.speedTolerance*(1+Math.abs(model.speed)))continue
    return {type:'contact',family,from:[...left],to:[...right],states:[[...left],[...right]],
      speed:model.speed,relativeResidual:rh.relativeResidual,model}
  }
  return null
}

function lineHits(points,anchor,direction,tolerance){
  const hits=[]
  for(let i=1;i<(points?.length??0);i++){
    const a=coords(points[i-1]),b=coords(points[i])
    if(!valid(a)||!valid(b))continue
    const d=sub(b,a),den=cross(d,direction)
    if(Math.abs(den)<=tolerance*norm(d))continue
    const raw=cross(sub(anchor,a),direction)/den
    if(raw < -tolerance||raw > 1+tolerance)continue
    const t=Math.max(0,Math.min(1,raw))
    const point=a.map((v,j)=>v+t*d[j])
    if(!hits.some(q=>norm(sub(q.point,point))<=tolerance))hits.push({point,index:i-1+t})
  }
  return hits
}

function isolatedShockMiddle(anchor,fixed,model,p,options){
  const d=sub(anchor,fixed),b=sub(flux(anchor,p),flux(fixed,p)),r=model.direction
  // F(anchor+t*r)=F(anchor)+t*s_contact*r in this contact model.
  // Thus the RH determinant restricted to the contact line is affine in t.
  const constant=cross(d,b),slope=model.speed*cross(d,r)+cross(r,b)
  const scale=1+Math.abs(model.speed)*norm(d)+norm(b)
  if(Math.abs(slope)<=options.coefficientTolerance*scale)return null
  const t=-constant/slope,middle=anchor.map((v,i)=>v+t*r[i])
  return valid(middle)?middle:null
}

const interval=s=>s.type==='rarefaction'?[s.speeds[0],s.speeds.at(-1)]:[s.speed,s.speed]

function assemble(pattern,left,middle,right,segments,options){
  const [a,b]=segments.map(interval),gap=b[0]-a[1]
  if(!(gap>options.speedTolerance*(1+Math.max(Math.abs(a[1]),Math.abs(b[0])))))return null
  const fans=segments.filter(q=>q.type==='rarefaction')
  return {status:'sampled-candidate',kind:'contact-chain',pattern,left:[...left],middle:[...middle],right:[...right],
    segments,fans,contacts:segments.filter(q=>q.type==='contact'),shocks:segments.filter(q=>q.type==='shock'),
    fanStates:fans[0]?.states??[],fanSpeeds:fans[0]?.speeds??[],
    evidence:{status:'contact-chain-numerically-compatible',geometry:'ordered-state-connections',
      lax:segments.some(q=>q.type==='shock')?'strict-lax-endpoints':'not-applicable',
      fan:fans.length?'sampled-speed-and-tangent-compatible':'not-applicable',liu:'not-evaluated',entropyCertified:false},
    provenance:{kind:'contact-chain',pattern,intersection:pattern==='CC'?'constant-contact-lines':'sampled-curve-contact-line',
      waves:segments.map((q,i)=>({type:q.type,family:q.family,from:i===0?'U_L':'U_M',to:i===0?'U_M':'U_R',
        speed:q.speed,origin:q.type==='shock'?(i===0?'forward-hugoniot':'backward-hugoniot'):
          q.type==='contact'?'constant-direction-contact':'sampled-characteristic-branch'})),entropyCertified:false},
    search:{complete:false,contactModel:'constant-direction',tolerances:{...options}},entropyCertified:false}
}

/** RC, SC, CR, CS and CC in constant-direction LD families. Finite search only. */
export function contactChainCandidates(states,rarefactions,hugoniot,p,options={}){
  const {left,right}=states??{},opts={...defaults,...options}
  if(!valid(left)||!valid(right)||!Number.isInteger(opts.maxCandidates)||opts.maxCandidates<1||
    !['stateTolerance','speedTolerance','tangentTolerance','coefficientTolerance'].every(k=>Number.isFinite(opts[k])&&opts[k]>=0))return []
  const models=constantContactDirections(p,opts),result=[]
  const add=q=>{
    if(q&&!result.some(r=>r.pattern===q.pattern&&norm(sub(r.middle,q.middle))<=opts.stateTolerance))result.push(q)
  }
  for(const first of models)for(const second of models){
    if(familyAt(left,first,p,opts)!=='slow'||familyAt(right,second,p,opts)!=='fast')continue
    const den=cross(first.direction,second.direction)
    if(Math.abs(den)<=opts.stateTolerance)continue
    const a=cross(sub(right,left),second.direction)/den
    const middle=left.map((v,i)=>v+a*first.direction[i])
    const c1=constantContactConnection(left,middle,p,'slow',opts),c2=constantContactConnection(middle,right,p,'fast',opts)
    if(c1&&c2)add(assemble('CC',left,middle,right,[c1,c2],opts))
  }
  for(const contactSide of ['right','left']){
    const contactLast=contactSide==='right',anchor=contactLast?right:left
    const contactFamily=contactLast?'fast':'slow',otherFamily=contactLast?'slow':'fast'
    const rareSide=contactLast?'left':'right',otherAnchor=contactLast?left:right
    for(const model of models){
      if(familyAt(anchor,model,p,opts)!==contactFamily)continue
      const exactMiddle=isolatedShockMiddle(anchor,otherAnchor,model,p,opts)
      if(exactMiddle){
        const contact=constantContactConnection(contactLast?exactMiddle:left,contactLast?right:exactMiddle,p,contactFamily,opts)
        const from=contactLast?left:exactMiddle,to=contactLast?exactMiddle:right
        const check=classifyLaxShock(from,to,p)
        if(contact&&check.families.includes(otherFamily)){
          const shock={type:'shock',family:otherFamily,from:[...from],to:[...to],states:[[...from],[...to]],
            speed:check.shock.speed,relativeResidual:check.shock.relativeResidual}
          const q=assemble(contactLast?'SC':'CS',left,exactMiddle,right,contactLast?[shock,contact]:[contact,shock],opts)
          if(q){q.provenance.intersection='affine-rh-on-contact-line';add(q)}
        }
      }
      const curves=[...(rarefactions??[]).filter(b=>b.side===rareSide&&b.family===otherFamily).map(b=>({...b,type:'R'})),
        ...(hugoniot?.[rareSide]??[]).map(b=>({...b,type:'S'}))]
      for(const curve of curves){
        if(curve.type==='R'&&(!valid(coords(curve.points?.[0]))||norm(sub(coords(curve.points[0]),otherAnchor))>opts.stateTolerance))continue
        for(const hit of lineHits(curve.points,anchor,model.direction,opts.stateTolerance)){
          const middle=hit.point
          const contact=constantContactConnection(contactLast?middle:left,contactLast?right:middle,p,contactFamily,opts)
          if(!contact)continue
          let other
          if(curve.type==='R'){
            const fan=sampledRarefactionPrefix(curve,hit.index,middle,p,!contactLast,opts)
            if(fan)other={type:'rarefaction',...fan,from:[...fan.states[0]],to:[...fan.states.at(-1)]}
          }else{
            const from=contactLast?left:middle,to=contactLast?middle:right
            const check=classifyLaxShock(from,to,p)
            if(check.families.includes(otherFamily))other={type:'shock',family:otherFamily,from:[...from],to:[...to],
              states:[[...from],[...to]],speed:check.shock.speed,relativeResidual:check.shock.relativeResidual}
          }
          if(other)add(assemble(contactLast?`${curve.type}C`:`C${curve.type}`,left,middle,right,
            contactLast?[other,contact]:[contact,other],opts))
          if(result.length>=opts.maxCandidates)return result.slice(0,opts.maxCandidates)
        }
      }
    }
  }
  return result.slice(0,opts.maxCandidates)
}

export function evaluateContactChain(candidate,xi){
  if(!['contact-chain','composite-chain'].includes(candidate?.kind)||candidate.status!=='sampled-candidate'||!Number.isFinite(xi))return null
  // At a sonic fan/shock junction the discontinuity takes precedence over
  // the continuous fan endpoint: use the right trace at the exact shock speed.
  for(const segment of candidate.segments)if(segment.type!=='rarefaction'&&xi===segment.speed)return [...segment.to]
  for(const segment of candidate.segments){
    if(segment.type!=='rarefaction'){
      if(xi<segment.speed)return [...segment.from]
    }else{
      if(xi<segment.speeds[0])return [...segment.from]
      for(let i=1;i<segment.speeds.length;i++)if(xi<=segment.speeds[i]){
        const t=(xi-segment.speeds[i-1])/(segment.speeds[i]-segment.speeds[i-1])
        return segment.states[i-1].map((v,j)=>v+t*(segment.states[i][j]-v))
      }
    }
  }
  return [...candidate.right]
}
