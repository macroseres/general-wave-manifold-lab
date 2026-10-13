import {flux} from '../flux/quadraticFlux.js'
/** Locate a finite sampled Hugoniot subarc, retaining its construction provenance.
 * Endpoints are geometrically interpolated unless flux coefficients permit
 * a segment-constrained numerical Rankine–Hugoniot refinement.
 */
const xy=q=>Array.isArray(q)?q:[q?.u,q?.v]
const valid=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])

function nearestOnSegment(a,b,target){
  const dx=b[0]-a[0],dy=b[1]-a[1],length2=dx*dx+dy*dy
  const t=length2>0?Math.max(0,Math.min(1,((target[0]-a[0])*dx+(target[1]-a[1])*dy)/length2)):0
  const point=[a[0]+t*dx,a[1]+t*dy]
  return {point,t,error:dist(point,target)}
}

/** A segment-constrained RH root: only a correction on the identified segment.
 * The determinant vanishes exactly for a nonzero jump satisfying RH with some speed.
 * A small jump is rejected to avoid the trivial fixed-state root.
 */
export function refineHugoniotSegmentEndpoint(a,b,fixed,middle,p,{tolerance=0.025,relativeTolerance=1e-8,analyzeSensitivity=true,perturbation=1e-5}={}){
  if(![a,b,fixed,middle].every(valid)||!p||!Number.isFinite(tolerance)||tolerance<=0)return null
  const direction=[b[0]-a[0],b[1]-a[1]]
  const fFixed=flux(fixed,p)
  const at=t=>{
    const q=[a[0]+t*direction[0],a[1]+t*direction[1]]
    const jump=[q[0]-fixed[0],q[1]-fixed[1]]
    const fq=flux(q,p)
    const df=[fq[0]-fFixed[0],fq[1]-fFixed[1]]
    const determinant=jump[0]*df[1]-jump[1]*df[0]
    const magnitude=Math.hypot(...jump)
    const speed=magnitude>1e-12?(jump[0]*df[0]+jump[1]*df[1])/(magnitude*magnitude):NaN
    const residual=magnitude>1e-12?Math.hypot(df[0]-speed*jump[0],df[1]-speed*jump[1]):Infinity
    const relativeResidual=residual/(1+Math.hypot(...df)+Math.abs(speed)*magnitude)
    return {point:q,t,determinant,relativeResidual,speed,distance:dist(q,middle)}
  }
  // For quadratic fluxes, det(q(t)-fixed, F(q(t))-F(fixed)) is cubic.
  // Recover its coefficients from four evaluations, then isolate all real roots
  // using stationary points. This also detects even-multiplicity (tangent) roots.
  const y0=at(0).determinant,y1=at(1).determinant
  const ym=at(-1).determinant,y2=at(2).determinant
  if(![y0,y1,ym,y2].every(Number.isFinite))return null
  const c0=y0
  const c2=(y1+ym-2*y0)/2
  const odd=(y1-ym)/2
  const c3=(y2-y0-2*odd-4*c2)/6
  const c1=odd-c3
  const coeff=[c0,c1,c2,c3]
  const scale=Math.max(...coeff.map(Math.abs))
  const poly=t=>((c3*t+c2)*t+c1)*t+c0
  const roots=[]
  if(scale===0){
    // A whole segment may lie on the Hugoniot locus; use its nearest point.
    roots.push(at(nearestOnSegment(a,b,middle).t))
  }else{
    const eps=1e-12*scale
    const critical=[]
    const A=3*c3,B=2*c2,C=c1
    if(Math.abs(A)>eps){
      const discriminant=B*B-4*A*C
      if(discriminant>=0){
        const sqrt=Math.sqrt(discriminant)
        // Avoid catastrophic cancellation for widely separated stationary roots.
        const q=-0.5*(B+Math.sign(B||1)*sqrt)
        if(q!==0)critical.push(q/A,C/q)
        else critical.push(-B/(2*A))
      }
    }else if(Math.abs(B)>eps)critical.push(-C/B)
    const boundaries=[0,...critical.filter(t=>t>0&&t<1).sort((x,y)=>x-y),1]
    for(const t of boundaries)if(Math.abs(poly(t))<=eps)roots.push(at(t))
    for(let i=0;i<boundaries.length-1;i++){
      let lo=boundaries[i],hi=boundaries[i+1]
      let flo=poly(lo),fhi=poly(hi)
      if(flo*fhi>=0)continue
      for(let k=0;k<65;k++){
        const mid=(lo+hi)/2,fmid=poly(mid)
        if(Math.sign(fmid)===Math.sign(flo)){lo=mid;flo=fmid}
        else{hi=mid;fhi=fmid}
      }
      roots.push(at((lo+hi)/2))
    }
  }
  const accepted=roots.filter(r=>r.distance<=tolerance&&r.relativeResidual<=relativeTolerance&&Number.isFinite(r.speed))
  accepted.sort((x,y)=>x.distance-y.distance)
  const selected=accepted[0]
  if(!selected)return null
  // Diagnostic only: a small derivative indicates an ill-conditioned RH root.
  // It must not be interpreted as a geometric bifurcation or entropy criterion.
  const derivative=(3*c3*selected.t+2*c2)*selected.t+c1
  const normalizedSlope=scale>0?Math.abs(derivative)/scale:0
  const separation=roots.filter(r=>r!==selected).reduce((d,r)=>Math.min(d,Math.abs(r.t-selected.t)),Infinity)
  // Local finite-difference experiment in coefficient space. Each perturbed
  // solve stays on the original segment and near the same selected root.
  // A lost root is reported, never silently replaced by a distant one.
  let coefficientSensitivity=null
  if(analyzeSensitivity){
    const names=['a20','a11','a02','a10','a01','b20','b11','b02','b10','b01']
    const trials=[]
    for(const name of names){
      if(!Number.isFinite(p[name]))continue
      const h=perturbation*Math.max(1,Math.abs(p[name]))
      const offsets=[]
      for(const sign of [-1,1]){
        const changed={...p,[name]:p[name]+sign*h}
        const root=refineHugoniotSegmentEndpoint(a,b,fixed,selected.point,changed,{
          tolerance:Math.min(tolerance,Math.max(1e-4,dist(a,b)*0.1)),
          relativeTolerance,analyzeSensitivity:false})
        offsets.push(root?root.t-selected.t:null)
      }
      trials.push({coefficient:name,step:h,minus:offsets[0],plus:offsets[1],
        centralDerivative:offsets.every(Number.isFinite)?(offsets[1]-offsets[0])/(2*h):null,
        // Fixed-segment coordinate response; not the derivative of a globally reconstructed U_M.
        coordinateDerivative:offsets.every(Number.isFinite)?direction.map(d=>d*(offsets[1]-offsets[0])/(2*h)):null})
    }
    const resolved=trials.flatMap(t=>[t.minus,t.plus]).filter(Number.isFinite)
    coefficientSensitivity={trials,
      missingPerturbedRoots:trials.reduce((n,t)=>n+Number(t.minus===null)+Number(t.plus===null),0),
      maximumParameterShift:resolved.length?Math.max(...resolved.map(Math.abs)):null,
      status:trials.some(t=>t.minus===null||t.plus===null)?'unresolved-perturbation':'locally-tracked'}
  }
  return {...selected,coefficientSensitivity,normalizedDeterminantSlope:normalizedSlope,
    nearestRootParameterDistance:Number.isFinite(separation)?separation:null,
    rootCondition:scale===0?'segment-contained':normalizedSlope<1e-5?'near-tangential':'transverse-numerical'}
}

export function sampledHugoniotArc(curves,fixed,middle,{tolerance=0.025,curveId=null,segmentIndex=null,fluxCoefficients=null}={}){
  if(!valid(fixed)||!valid(middle)||!Number.isFinite(tolerance)||tolerance<=0)return null
  if(segmentIndex!==null&&(!Number.isFinite(segmentIndex)||segmentIndex<0))return null
  let best=null
  for(const curve of curves??[]){
    if(curveId!==null&&curve.id!==curveId)continue
    const points=(curve.points??[]).map(xy)
    if(points.length<2||!points.every(valid))continue
    let start=0
    for(let i=1;i<points.length;i++)if(dist(points[i],fixed)<dist(points[start],fixed))start=i
    const startError=dist(points[start],fixed)
    const indices=segmentIndex!==null?[Math.floor(segmentIndex)]:Array.from({length:points.length-1},(_,i)=>i)
    for(const j of indices){
      if(j>=points.length-1)continue
      const geometric=nearestOnSegment(points[j],points[j+1],middle)
      const rh=fluxCoefficients?refineHugoniotSegmentEndpoint(points[j],points[j+1],fixed,middle,fluxCoefficients,{tolerance}):null
      const endpoint=fluxCoefficients?(rh?{point:rh.point,t:rh.t,error:rh.distance}:null):geometric
      if(!endpoint)continue
      const error=Math.max(startError,endpoint.error)
      if(error>tolerance||Math.abs(j+endpoint.t-start)<1e-12)continue
      const position=j+endpoint.t
      const arc=position>start
        ?[...points.slice(start,j+1),endpoint.point]
        :[...points.slice(j+1,start+1).reverse(),endpoint.point]
      const cleaned=arc.filter((point,i)=>i===0||dist(point,arc[i-1])>1e-12)
      if(cleaned.length<2)continue
      if(!best||error<best.endpointError){
        best={points:cleaned,endpointError:error,curveId:curve.id??null,
          orientation:position>start?'forward':'reversed',sampled:true,
          provenanceMatched:curveId!==null,segmentIndex:segmentIndex??null,
          endpointInterpolated:endpoint.t>0&&endpoint.t<1,
          junctionResidual:endpoint.error,interpolationParameter:endpoint.t,
          refinement:fluxCoefficients?'rankine-hugoniot-segment':'geometric-interpolation',
          rankineHugoniotRelativeResidual:rh?.relativeResidual??null,
          shockSpeed:rh?.speed??null,
          rootCondition:rh?.rootCondition??null,
          normalizedDeterminantSlope:rh?.normalizedDeterminantSlope??null,
          nearestRootParameterDistance:rh?.nearestRootParameterDistance??null,
          coefficientSensitivity:rh?.coefficientSensitivity??null,
          segmentStart:[...points[j]],segmentEnd:[...points[j+1]]}
      }
    }
  }
  return best
}

/** Reconnect sampled pieces only when their endpoints actually coincide.
 * No straight chord is introduced across a missing part of the locus.
 * This is a geometric fallback, not a proof of shock admissibility.
 */
export function stitchedHugoniotArc(curves,fixed,middle,{tolerance=0.025,fluxCoefficients=null}={}){
  if(!valid(fixed)||!valid(middle))return null
  const joinTolerance=Math.min(tolerance*0.3,0.012)
  const segments=(curves??[]).map(c=>({id:c.id,points:(c.points??[]).map(xy)}))
    .filter(c=>c.points.length>=2&&c.points.every(valid))
  // Join only unique endpoint continuations; at a crossing, leave the branch
  // unresolved rather than choosing a geometrically unsupported continuation.
  const used=new Set(),assembled=[]
  for(let seed=0;seed<segments.length;seed++){
    if(used.has(seed))continue
    used.add(seed)
    let points=[...segments[seed].points]
    let changed=true
    while(changed){
      changed=false
      for(const atStart of [false,true]){
        const endpoint=atStart?points[0]:points[points.length-1]
        const matches=[]
        for(let j=0;j<segments.length;j++){
          if(used.has(j))continue
          const candidate=segments[j].points
          for(const reverse of [false,true]){
            const tip=reverse?candidate[candidate.length-1]:candidate[0]
            if(dist(endpoint,tip)<=joinTolerance)matches.push({j,reverse,distance:dist(endpoint,tip)})
          }
        }
        if(matches.length!==1)continue
        const {j,reverse}=matches[0]
        const next=reverse?[...segments[j].points].reverse():segments[j].points
        points=atStart?[...next.slice(1).reverse(),...points]:[...points,...next.slice(1)]
        used.add(j)
        changed=true
      }
    }
    assembled.push({id:`stitched-${seed}`,points:points.map(q=>({u:q[0],v:q[1]}))})
  }
  const arc=sampledHugoniotArc(assembled,fixed,middle,{tolerance,fluxCoefficients})
  return arc?{...arc,stitched:true,provenanceMatched:false}:null
}

export function selectedCandidateHugoniotArc(profile,projection,riemannHugoniot,{tolerance=0.025,fluxCoefficients=null}={}){
  if(!profile||!['plus','minus'].includes(projection))return null
  const states=profile.kind==='two-shock'?profile.states:[profile.left,profile.middle,profile.right]
  if(!states?.every(valid))return null
  const [left,middle,right]=states
  const waves=profile.provenance?.waves??[]
  if(projection==='plus'&&(profile.kind==='two-shock'||profile.kind==='shock-rarefaction')){
    const shock=waves.find(w=>w.type==='shock'&&w.origin==='forward-hugoniot')
    return sampledHugoniotArc(riemannHugoniot?.left,left,middle,{tolerance,curveId:shock?.segment??null,segmentIndex:shock?.segmentIndex??null,fluxCoefficients})
      ??stitchedHugoniotArc(riemannHugoniot?.left,left,middle,{tolerance,fluxCoefficients})
  }
  if(projection==='minus'&&(profile.kind==='two-shock'||profile.kind==='rarefaction-shock')){
    const shock=waves.find(w=>w.type==='shock'&&w.origin==='backward-hugoniot')
    return sampledHugoniotArc(riemannHugoniot?.right,right,middle,{tolerance,curveId:shock?.segment??null,segmentIndex:shock?.segmentIndex??null,fluxCoefficients})
      ??stitchedHugoniotArc(riemannHugoniot?.right,right,middle,{tolerance,fluxCoefficients})
  }
  return null
}
