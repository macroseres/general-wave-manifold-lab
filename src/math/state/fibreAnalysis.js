/**
 * Topological/algebraic analysis of the inverse images pi_-^{-1}(U*) and
 * pi_+^{-1}(U*) over the real projective direction line RP^1.
 *
 * This module contains no rendering logic.  A fibre is parameterized by the
 * projective characteristic direction.  Singular directions are precisely
 * the zeros of P(z)z+Q(z); they separate connected regular branches.  The
 * reciprocal chart decides whether the projective direction z=infinity is
 * regular or singular.
 */
import { cubicRealRoots } from '../numerics/polynomialRoots.js'
import { NUMERICAL_POLICY } from '../numerics/policy.js'
import { characteristicSpectrum } from '../characteristic/spectrum.js'
import { characteristicLifts, stateFiberPoint, stateFiberPointReciprocal } from './fibers.js'

const finite = Number.isFinite

/** Coefficients of (P(z)z+Q(z))/2, from highest to constant degree. */
export function fibreDenominatorPolynomial(p) {
  return [p.b20, p.b11 - p.a20, p.b02 - p.a11, -p.a02]
}

/** Projective directions at which the usual fibre parameterization is singular. */
export function fibreSingularDirections(U, p, eps = NUMERICAL_POLICY.algebra.regularityTolerance) {
  const [a,b,c,d] = fibreDenominatorPolynomial(p)
  const roots = cubicRealRoots(a,b,c,d,eps).filter(finite).sort((x,y)=>x-y)
  const finiteDirections = roots.map(z => {
    const q = stateFiberPoint(U,z,p,'minus',eps)
    return {kind:'finite',z,type:q.kind,L:q.L,denominator:q.denominator}
  })
  const qInf = stateFiberPointReciprocal(U,0,p,'minus',eps)
  const infinity = qInf.kind === 'regular' ? null : {kind:'infinity',Z:0,type:qInf.kind,L:qInf.L,denominator:qInf.denominator}
  return {finite:finiteDirections,infinity}
}

function classifyLift(U,p,lift,eps){
  if(lift.kind==='infinity'){
    const q=stateFiberPointReciprocal(U,0,p,'minus',eps)
    return {...lift,chart:'Z',classification:q.kind==='regular'?'characteristic-at-infinity':q.kind,tau:null,eta:q.eta??null,gap:null}
  }
  const q=stateFiberPoint(U,lift.z,p,'minus',eps)
  if(q.kind!=='regular') return {...lift,chart:'z',classification:q.kind,tau:null,gap:null}
  const s=characteristicSpectrum(q.tau,lift.z,p)
  return {...lift,chart:'z',classification:s.branch,tau:q.tau,gap:s.gap}
}


/**
 * Connected regular branches of a fixed-state fibre over RP^1.
 *
 * The branch decomposition is purely projective: remove the singular
 * directions of the fibre parameterization and take the connected components
 * of what remains.  If Z=0 is regular, the two outer finite-z intervals are
 * the same component because they join through projective infinity.
 *
 * This is deliberately NOT a shock/admissibility classification.
 */
export function regularFibreBranches(U,p,eps=NUMERICAL_POLICY.algebra.regularityTolerance){
  const singular=fibreSingularDirections(U,p,eps)
  const roots=singular.finite.map(q=>q.z).filter(finite).sort((a,b)=>a-b)
  const infinitySingular=Boolean(singular.infinity)
  const count=Math.max(1,roots.length+(infinitySingular?1:0))
  const branches=Array.from({length:count},(_,id)=>({
    id,
    chartConnectivity:(!infinitySingular&&roots.length>0&&id===0)?'through-infinity':'finite-interval',
    characteristicLifts:[],
    namedLifts:[],
  }))

  const branchIdForFiniteZ=z=>{
    if(!finite(z)||roots.length===0)return 0
    if(infinitySingular){
      let k=0; while(k<roots.length&&z>roots[k]+eps)k++
      return Math.min(k,count-1)
    }
    if(z<roots[0]-eps||z>roots.at(-1)+eps)return 0
    for(let k=1;k<roots.length;k++)if(z>roots[k-1]+eps&&z<roots[k]-eps)return k
    return null // a singular projective direction is not in a regular branch
  }

  const lifts=characteristicLifts(U,p,eps).map(q=>classifyLift(U,p,q,eps))
  for(const lift of lifts){
    let id=null
    if(lift.kind==='infinity'||lift.classification==='characteristic-at-infinity'){
      if(!infinitySingular)id=0
    }else id=branchIdForFiniteZ(lift.z)
    if(id!==null&&branches[id])branches[id].characteristicLifts.push(lift)
  }
  for(const branch of branches){
    for(const lift of branch.characteristicLifts){
      if(lift.classification==='slow')branch.namedLifts.push('Ps')
      else if(lift.classification==='fast')branch.namedLifts.push('Pf')
      else if(lift.classification==='coincidence')branch.namedLifts.push('E')
      else if(lift.kind==='infinity'||lift.classification==='characteristic-at-infinity')branch.namedLifts.push('infinity')
    }
  }
  return {kind:'regular-branch-decomposition',count,infinitySingular,singularDirections:singular,branches}
}

/**
 * Analyse a fixed-state fibre without imposing the current visualization box.
 * `regularBranchCount` is the number of connected components of the regular
 * fibre over RP^1 after removing singular projective directions.
 *
 * pi_- and pi_+ have the same (tau,z) trace and opposite jump coordinate Y,
 * so they have the same branch topology and the same characteristic lifts.
 */
export function analyzeStateFibres(U,p,eps=NUMERICAL_POLICY.algebra.regularityTolerance){
  if(!U||!finite(Number(U[0]))||!finite(Number(U[1]))) return {kind:'invalid-state'}
  const singular=fibreSingularDirections(U,p,eps)
  const singularCount=singular.finite.length+(singular.infinity?1:0)
  const lifts=characteristicLifts(U,p,eps).map(q=>classifyLift(U,p,q,eps))
  const branchDecomposition=regularFibreBranches(U,p,eps)
  const counts={slow:0,fast:0,coincidence:0,infinity:0,undefined:0}
  for(const q of lifts){
    if(q.kind==='infinity'||q.classification==='characteristic-at-infinity') counts.infinity++
    else if(q.classification==='slow') counts.slow++
    else if(q.classification==='fast') counts.fast++
    else if(q.classification==='coincidence') counts.coincidence++
    else counts.undefined++
  }
  // Named finite characteristic intersections.  For a strictly hyperbolic
  // state these are the two canonical lifts P_s and P_f.  Coincidence and
  // projective-infinity cases remain explicit instead of being forced into a
  // slow/fast label.
  const namedIntersections={
    slow:lifts.find(q=>q.kind==='finite'&&q.classification==='slow')??null,
    fast:lifts.find(q=>q.kind==='finite'&&q.classification==='fast')??null,
    coincidence:lifts.filter(q=>q.kind==='finite'&&q.classification==='coincidence'),
    infinity:lifts.filter(q=>q.kind==='infinity'||q.classification==='characteristic-at-infinity'),
  }
  namedIntersections.Ps=namedIntersections.slow
  namedIntersections.Pf=namedIntersections.fast
  return {
    kind:'regular-analysis', fixedState:[Number(U[0]),Number(U[1])],
    singularDirections:singular,
    singularDirectionCount:singularCount,
    regularBranchCount:branchDecomposition.count,
    regularBranches:branchDecomposition.branches,
    infinityRegular:!singular.infinity,
    characteristicLifts:lifts,
    namedIntersections,
    liftCounts:counts,
    intersections:{count:lifts.length,finiteVerified:lifts.filter(q=>q.kind==='finite'&&Number.isFinite(q.tau)).length,atInfinity:lifts.filter(q=>q.kind==='infinity'||q.classification==='characteristic-at-infinity').length},
    symmetry:{sameTauZTrace:true,oppositeJump:true},
  }
}
