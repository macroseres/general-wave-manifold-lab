/**
 * Numerical finite-chart tracing for composite fields.
 *
 * For each P on a rarefaction curve R subset C, fix the endpoint state
 * required by the canonical saturation and solve, along that Hugoniot fibre,
 * the non-trivial sonic equation.  The returned candidates are mathematical
 * points in W; no Three.js/display coordinates are used here.
 *
 * Projective-infinity roots are intentionally left to the reciprocal-chart
 * continuation step.  This module never invents a finite point at infinity.
 */
import { stateFiberPoint, stateFiberPointReciprocal } from './fibers.js'
import { compositeConstruction } from './composite.js'
import { sonicImplicit } from '../sonic/sonic.js'
import { localEndpointStates } from './stateRoles.js'

const finite = Number.isFinite

function projectiveDistance(a,b){
  const d=Math.abs(a-b)
  return Math.min(d,Math.PI-d)
}

function candidateAtTheta(U,theta,p,side){
  const z=Math.tan(theta)
  const q=stateFiberPoint(U,z,p,side)
  if(q.kind!=='regular')return null
  const residual=sonicImplicit(q.tau,q.Y,q.z,p,side)
  if(!finite(residual))return null
  return {...q,chart:'finite',theta,residual}
}

function reciprocalSonicResidual(q,p,sonicSide){
  if(!q||q.kind!=='regular'||![q.eta,q.Upsilon,q.Z].every(finite))return NaN
  const Z=q.Z
  // Canonical composite condition is the NON-TRIVIAL sonic sheet Phi_±=0,
  // not det(DF(U_±)-sI)=Y Phi_±/4=0.  The latter would accept every Y=0
  // characteristic point as a false composite root.
  if(Math.abs(Z)>1e-10){
    const z=1/Z
    const tau=q.eta*Z*Z
    const Y=q.Upsilon*Z
    // Phi grows like Z^-2 near the reciprocal boundary; multiplying by Z^2
    // is a positive projective regularization and therefore preserves roots.
    return sonicImplicit(tau,Y,z,p,sonicSide)*Z*Z
  }
  // Evaluate the regularized boundary value by symmetric continuation.
  // This is used only at the single projective boundary sample.
  const h=1e-7
  const evalAt=Zh=>{
    const qh=stateFiberPointReciprocal(q.fixedState??q.Ubar,Zh,p,q.side??sonicSide)
    if(qh.kind!=='regular')return NaN
    return sonicImplicit(qh.eta*Zh*Zh,qh.Upsilon*Zh,1/Zh,p,sonicSide)*Zh*Zh
  }
  const fm=evalAt(-h),fp=evalAt(h)
  return finite(fm)&&finite(fp)?(fm+fp)/2:NaN
}
function reciprocalTheta(Z){
  let theta=Math.atan2(1,Z)
  if(theta>Math.PI/2)theta-=Math.PI
  return theta
}

function candidateAtZ(U,Z,p,side,sonicSide){
  const q=stateFiberPointReciprocal(U,Z,p,side)
  if(q.kind!=='regular')return null
  const residual=reciprocalSonicResidual(q,p,sonicSide)
  if(!finite(residual))return null
  const theta=reciprocalTheta(Z)
  const finiteCoordinates=Math.abs(Z)>1e-10
    ? {z:1/Z,tau:q.eta*Z*Z,Y:q.Upsilon*Z}
    : {}
  return {...q,...finiteCoordinates,fixedState:[...U],chart:'reciprocal',theta,residual}
}

function bisectRoot(U,p,side,a,b,fa,fb,tol,maxIterations){
  let left=a,right=b,fLeft=fa
  for(let k=0;k<maxIterations;k++){
    const mid=(left+right)/2
    const q=candidateAtTheta(U,mid,p,side)
    if(!q)return null
    if(Math.abs(q.residual)<=tol||Math.abs(right-left)<=1e-14)return q
    if(fLeft*q.residual<=0){right=mid}
    else {left=mid;fLeft=q.residual}
  }
  return candidateAtTheta(U,(left+right)/2,p,side)
}

function bisectReciprocalRoot(U,p,side,sonicSide,a,b,fa,tol,maxIterations){
  let left=a,right=b,fLeft=fa
  for(let k=0;k<maxIterations;k++){
    const mid=(left+right)/2
    const q=candidateAtZ(U,mid,p,side,sonicSide)
    if(!q)return null
    if(Math.abs(q.residual)<=tol||Math.abs(right-left)<=1e-14)return q
    if(fLeft*q.residual<=0)right=mid
    else {left=mid;fLeft=q.residual}
  }
  return candidateAtZ(U,(left+right)/2,p,side,sonicSide)
}

function reciprocalIntersections(U,p,side,sonicSide,options){
  const n=Math.max(32,Math.floor(options.reciprocalSamples??360))
  const span=Math.max(1e-4,options.reciprocalSpan??0.35)
  const tol=Math.max(1e-12,options.rootTolerance??1e-9)
  const maxIterations=Math.max(12,Math.floor(options.maxIterations??60))
  const roots=[]
  let prev=candidateAtZ(U,-span,p,side,sonicSide)
  for(let i=1;i<=n;i++){
    const Z=-span+2*span*i/n
    const cur=candidateAtZ(U,Z,p,side,sonicSide)
    if(cur&&Math.abs(cur.residual)<=tol)roots.push(cur)
    if(prev&&cur&&prev.residual*cur.residual<0){
      const q=bisectReciprocalRoot(U,p,side,sonicSide,prev.Z,cur.Z,prev.residual,tol,maxIterations)
      if(q)roots.push(q)
    }
    prev=cur
  }
  return roots
}

/** Projectively complete intersections of one saturation leaf with its sonic sheet. */
export function compositeLeafIntersections(P,p,compositeSide,options={}){
  const construction=compositeConstruction(compositeSide)
  const endpoints=localEndpointStates(P)
  if(!endpoints)return []
  const side=construction.inverseProjection
  const U=endpoints[side]
  const n=Math.max(32,Math.floor(options.samples??720))
  const margin=Math.max(1e-6,options.infinityMargin??1e-4)
  const tol=Math.max(1e-12,options.rootTolerance??1e-9)
  const maxIterations=Math.max(12,Math.floor(options.maxIterations??60))
  const lo=-Math.PI/2+margin, hi=Math.PI/2-margin
  const roots=[]
  let prev=candidateAtTheta(U,lo,p,side)
  for(let i=1;i<=n;i++){
    const theta=lo+(hi-lo)*i/n
    const cur=candidateAtTheta(U,theta,p,side)
    if(cur&&Math.abs(cur.residual)<=tol)roots.push(cur)
    if(prev&&cur&&prev.residual*cur.residual<0){
      const q=bisectRoot(U,p,side,prev.theta,cur.theta,prev.residual,cur.residual,tol,maxIterations)
      if(q)roots.push(q)
    }
    prev=cur
  }
  roots.push(...reciprocalIntersections(U,p,side,construction.sonicSide,options))
  roots.sort((a,b)=>a.theta-b.theta)
  const unique=[]
  for(const q of roots){
    if(!unique.some(r=>projectiveDistance(r.theta,q.theta)<1e-6)){
      unique.push({...q,compositeSide,saturation:construction.saturation,fixedState:[...U],sonicSide:construction.sonicSide})
    }
  }
  return unique
}

/**
 * Trace a continuous finite-chart branch Q(sigma) over a sampled rarefaction.
 * Continuation uses nearest projective direction to the previous accepted
 * sonic intersection. Ambiguous/missing leaves are reported, never bridged.
 */
export function traceCompositeField(rarefactionCurve,p,compositeSide,options={}){
  if(!Array.isArray(rarefactionCurve))return {kind:'invalid-curve',side:compositeSide,points:[],leaves:[]}
  const leaves=[]; const points=[]
  let previous=null
  for(let index=0;index<rarefactionCurve.length;index++){
    const P=rarefactionCurve[index]
    const candidates=compositeLeafIntersections(P,p,compositeSide,options)
    let selected=null
    if(candidates.length){
      selected=previous
        ? candidates.reduce((best,q)=>projectiveDistance(q.theta,previous.theta)<projectiveDistance(best.theta,previous.theta)?q:best,candidates[0])
        : candidates[0]
    }
    leaves.push({index,P,candidates,selected})
    if(selected){
      const point={...selected,sourceIndex:index,sourcePoint:P}
      points.push(point); previous=point
    }else previous=null
  }
  return {kind:'projective-composite-trace',side:compositeSide,points,leaves,complete:points.length===rarefactionCurve.length}
}


function isReciprocalPoint(P){return P?.chart==='reciprocal'||P?.reciprocal===true}

function finiteCompositeCoordinates(q){
  if(!q)return null
  if(isReciprocalPoint(q)){
    if(![q.eta,q.Upsilon,q.Z].every(Number.isFinite)||q.Z===0)return null
    return {tau:q.eta*q.Z*q.Z,Y:q.Upsilon*q.Z,z:1/q.Z}
  }
  return [q.tau,q.Y,q.z].every(Number.isFinite)?{tau:q.tau,Y:q.Y,z:q.z}:null
}
function localTrackingDistance(a,b){
  // Reciprocal chart is regular at projective infinity, including Z=0.
  if(isReciprocalPoint(a)&&isReciprocalPoint(b)&&Number.isFinite(a.Z)&&Number.isFinite(b.Z)){
    const dZ=Math.abs(a.Z-b.Z)
    const etaTerm=Number.isFinite(a.eta)&&Number.isFinite(b.eta)?0.35*Math.abs(a.eta-b.eta)/(1+Math.abs(a.eta)+Math.abs(b.eta)):0
    const upsTerm=Number.isFinite(a.Upsilon)&&Number.isFinite(b.Upsilon)?0.35*Math.abs(a.Upsilon-b.Upsilon)/(1+Math.abs(a.Upsilon)+Math.abs(b.Upsilon)):0
    return dZ+etaTerm+upsTerm
  }
  const za=a?.z,zb=b?.z
  if(Number.isFinite(za)&&Number.isFinite(zb)){
    const aa=Math.atan(za),ab=Math.atan(zb),rawAngle=Math.abs(aa-ab),angle=Math.min(rawAngle,Math.PI-rawAngle)
    const tauTerm=Number.isFinite(a.tau)&&Number.isFinite(b.tau)?0.35*Math.abs(a.tau-b.tau)/(1+Math.abs(a.tau)+Math.abs(b.tau)):0
    const yTerm=Number.isFinite(a.Y)&&Number.isFinite(b.Y)?0.35*Math.abs(a.Y-b.Y)/(1+Math.abs(a.Y)+Math.abs(b.Y)):0
    return angle+tauTerm+yTerm
  }
  const fa=finiteCompositeCoordinates(a),fb=finiteCompositeCoordinates(b)
  if(!fa||!fb)return Infinity
  const aa=Math.atan(fa.z),ab=Math.atan(fb.z),rawAngle=Math.abs(aa-ab),angle=Math.min(rawAngle,Math.PI-rawAngle)
  return angle
}
function predictedTrackingDistance(branch,root){
  const last=branch.points.at(-1)?.Q
  const previous=branch.points.at(-2)?.Q
  if(!previous)return localTrackingDistance(last,root)
  const a=finiteCompositeCoordinates(previous),b=finiteCompositeCoordinates(last),c=finiteCompositeCoordinates(root)
  if(!a||!b||!c)return localTrackingDistance(last,root)
  // Secant predictor in the finite display chart. It is only a tie-breaker;
  // chart-aware local distance remains the primary continuity criterion.
  const pred={tau:2*b.tau-a.tau,Y:2*b.Y-a.Y,z:Math.tan(2*Math.atan(b.z)-Math.atan(a.z))}
  return 0.65*localTrackingDistance(last,root)+0.35*localTrackingDistance(pred,root)
}

/**
 * Continue the discrete sonic intersections into branches Q_j(sigma).
 *
 * Each trace sample is expected to carry an `intersections` array.  Matching is
 * performed only between consecutive rarefaction samples and is one-to-one;
 * unmatched roots start new branches and unmatched branches terminate.  This
 * deliberately avoids drawing bridges across root disappearance/bifurcation.
 */
export function decomposeCompositeBranches(trace,{maxMatchDistance=0.9}={}){
  const branches=[]
  let active=[]
  for(let sampleIndex=0;sampleIndex<trace.length;sampleIndex++){
    const sample=trace[sampleIndex]
    const roots=sample?.intersections??sample?.roots??[]
    const candidates=[]
    for(let ai=0;ai<active.length;ai++){
      const branch=branches[active[ai]]
      for(let ri=0;ri<roots.length;ri++){
        const distance=predictedTrackingDistance(branch,roots[ri])
        if(Number.isFinite(distance)&&distance<=maxMatchDistance)
          candidates.push({ai,ri,distance})
      }
    }
    candidates.sort((a,b)=>a.distance-b.distance)
    const usedActive=new Set(),usedRoots=new Set(),nextActive=[]
    for(const c of candidates){
      if(usedActive.has(c.ai)||usedRoots.has(c.ri))continue
      const branchIndex=active[c.ai]
      branches[branchIndex].points.push({sampleIndex,P:sample.P??sample.source??null,Q:roots[c.ri]})
      usedActive.add(c.ai);usedRoots.add(c.ri);nextActive.push(branchIndex)
    }
    for(let ri=0;ri<roots.length;ri++){
      if(usedRoots.has(ri))continue
      const branchIndex=branches.length
      branches.push({
        branchId:`K-${branchIndex+1}`,
        startSample:sampleIndex,
        points:[{sampleIndex,P:sample.P??sample.source??null,Q:roots[ri]}],
      })
      nextActive.push(branchIndex)
    }
    active=nextActive
  }
  return branches.map(branch=>({
    ...branch,
    endSample:branch.points.at(-1)?.sampleIndex??branch.startSample,
  }))
}


/** Endpoint states in either projective chart, used only for certification. */
function endpointStatesAnyChart(P){
  if(!P)return null
  if(isReciprocalPoint(P)){
    if(![P.eta,P.Upsilon,P.Z].every(Number.isFinite)||!Array.isArray(P.Ubar))return null
    const [u,v]=P.Ubar, h=P.Upsilon/2
    return {minus:[u-h,v-h*P.Z],plus:[u+h,v+h*P.Z]}
  }
  // Fibre candidates are canonical wave-manifold points but intentionally do
  // not duplicate waveState's Um/Up fields. Reconstruct their endpoints
  // directly from (Ubar,Y,z) instead of treating them as malformed points.
  if(Array.isArray(P.Ubar)&&[P.Y,P.z].every(Number.isFinite)){
    const [u,v]=P.Ubar, h=P.Y/2
    return {minus:[u-h*P.z,v-h],plus:[u+h*P.z,v+h]}
  }
  return localEndpointStates(P)
}

/** Numerical certificate for a traced composite point Q associated with source P. */
export function certifyCompositePoint(P,Q,p,compositeSide,{sonicTolerance=1e-7,stateTolerance=1e-7}={}){
  const construction=compositeConstruction(compositeSide)
  const sourceEndpoints=endpointStatesAnyChart(P)
  const targetEndpoints=endpointStatesAnyChart(Q)
  if(!sourceEndpoints||!targetEndpoints)return {
    valid:false,sonicResidual:Infinity,stateResidual:Infinity,
    sonicSatisfied:false,fibreSatisfied:false,
  }

  const side=construction.inverseProjection
  const sourceState=sourceEndpoints[side]
  const targetFixed=targetEndpoints[side]
  const du=targetFixed[0]-sourceState[0]
  const dv=targetFixed[1]-sourceState[1]
  const stateResidual=Math.hypot(du,dv)

  const sonicValue=isReciprocalPoint(Q)
    ? reciprocalSonicResidual(Q,p,construction.sonicSide)
    : sonicImplicit(Q?.tau,Q?.Y,Q?.z,p,construction.sonicSide)
  const sonicAbs=Number.isFinite(sonicValue)?Math.abs(sonicValue):Infinity
  const sonicSatisfied=sonicAbs<=sonicTolerance
  const fibreSatisfied=stateResidual<=stateTolerance
  return {
    valid:sonicSatisfied&&fibreSatisfied,
    sonicResidual:sonicAbs,
    stateResidual,
    sonicSatisfied,
    fibreSatisfied,
    construction,
  }
}

/** Attach independent sonic/fibre residual certificates to every branch point. */
export function certifyCompositeBranches(branches,p,compositeSide,options={}){
  return branches.map(branch=>({
    ...branch,
    points:branch.points.map(point=>({
      ...point,
      certificate:certifyCompositePoint(point.P,point.Q,p,compositeSide,options),
    })),
  }))
}


/** Optional audit of the actual composite continuation output.
 * Calls the unchanged production matcher; diagnostics never modify branch identities.
 * Root-count changes and close competing matches are warnings, not bifurcation proofs.
 */
export function auditCompositeContinuation(trace, options = {}) {
  if (!Array.isArray(trace)) throw new TypeError('Expected an array of continuation samples')
  const maxMatchDistance = options.maxMatchDistance ?? 0.9
  const ambiguityTolerance = options.ambiguityTolerance ?? 1e-3
  if (!(maxMatchDistance > 0) || !(ambiguityTolerance >= 0) ||
      !Number.isFinite(maxMatchDistance) || !Number.isFinite(ambiguityTolerance)) {
    throw new TypeError('Expected finite, nonnegative matching thresholds')
  }
  const branches = decomposeCompositeBranches(trace, { maxMatchDistance })
  const counts = trace.map(sample => (sample?.intersections ?? sample?.roots ?? []).length)
  const events = []
  for (let i = 1; i < trace.length; i++) {
    if (counts[i] !== counts[i - 1]) events.push({
      between: [i - 1, i], kind: 'root-count-change', before: counts[i - 1],
      after: counts[i], classification: 'unresolved',
    })
  }
  for (const branch of branches) {
    for (let j = 1; j < branch.points.length; j++) {
      const previous = branch.points[j - 1]
      const current = branch.points[j]
      if (current.sampleIndex !== previous.sampleIndex + 1) continue
      const roots = trace[current.sampleIndex]?.intersections ?? trace[current.sampleIndex]?.roots ?? []
      const distances = roots.map(root => localTrackingDistance(previous.Q, root))
        .filter(Number.isFinite).sort((a, b) => a - b)
      if (distances.length > 1 && distances[1] - distances[0] <= ambiguityTolerance) {
        events.push({ between: [previous.sampleIndex, current.sampleIndex],
          kind: 'close-competing-roots', branchId: branch.branchId,
          separation: distances[1] - distances[0], classification: 'unresolved' })
      }
    }
  }
  return { branches, diagnostics: { counts, events,
    branchCount: branches.length, ambiguousMatches: events.filter(e => e.kind === 'close-competing-roots').length } }
}
