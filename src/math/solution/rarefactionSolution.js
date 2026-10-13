import { projectRarefactionOrbitToState } from '../rarefaction/orbits.js'

/** Choose one already-computed rarefaction orbit by finite-chart proximity.
 * This is a selection rule only; it never integrates a new curve.
 */
export function selectRarefactionOrbit(orbits, point) {
  if (!Array.isArray(orbits) || !orbits.length || !point) return null
  let best=null
  for (let orbitIndex=0;orbitIndex<orbits.length;orbitIndex++) for (let pointIndex=0;pointIndex<orbits[orbitIndex].length;pointIndex++) {
    const q=orbits[orbitIndex][pointIndex],d=Math.hypot(q.tau-point.tau,q.zc-point.zc)
    if (!best||d<best.distance) best={orbitIndex,pointIndex,distance:d,orbit:orbits[orbitIndex]}
  }
  return best
}

/** Build the state-space data of one rarefaction solution candidate.
 * Physical realization is admitted only on a monotone characteristic-speed branch.
 */
export function rarefactionSolutionCandidate(orbit,p,{speedTolerance=1e-9}={}) {
  const states=projectRarefactionOrbitToState(orbit,p).filter(q=>Number.isFinite(q.s))
  if(states.length<2)return {kind:'insufficient',states}
  let direction=0
  for(let i=1;i<states.length;i++){
    const ds=states[i].s-states[i-1].s
    if(Math.abs(ds)<=speedTolerance)continue
    const sign=Math.sign(ds)
    if(direction===0)direction=sign
    else if(sign!==direction)return {kind:'nonmonotone',states,reason:'characteristic-speed-reversal'}
  }
  if(direction===0)return {kind:'degenerate',states,reason:'constant-characteristic-speed'}
  const ordered=direction>0?states:[...states].reverse()
  return {kind:'rarefaction',states:ordered,xiMin:ordered[0].s,xiMax:ordered.at(-1).s}
}

/** Self-similar realization U(x,t)=U(x/t), x0=0, t>0.
 * No Riemann solver is implied: the input is one validated monotone rarefaction orbit.
 */
export function rarefactionStateAtXi(solution,xi){
  if(solution?.kind!=='rarefaction'||!Number.isFinite(xi))return null
  const a=solution.states
  if(xi<=solution.xiMin)return {...a[0],region:'left'}
  if(xi>=solution.xiMax)return {...a.at(-1),region:'right'}
  for(let i=1;i<a.length;i++)if(xi<=a[i].s){
    const q0=a[i-1],q1=a[i],d=q1.s-q0.s,t=d===0?0:(xi-q0.s)/d
    return {u:q0.u+t*(q1.u-q0.u),v:q0.v+t*(q1.v-q0.v),s:xi,xi,region:'fan',tau:q0.tau+t*(q1.tau-q0.tau),zc:q0.zc+t*(q1.zc-q0.zc)}
  }
  return null
}
