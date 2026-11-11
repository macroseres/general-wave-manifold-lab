import {continueRarefactionAtInfinity,rarefactionOrbitThrough,rarefactionOrbits,projectRarefactionOrbitToState,splitProjectedRarefactionByBranch} from '../../math/rarefaction/orbits.js'
import {infinityRarefactionSeparatrices} from '../../math/rarefaction/separatrices.js'
import {finiteRarefactionSeparatrices} from '../../math/rarefaction/finiteSeparatrices.js'
import {rarefactionSingularities,infinityRarefactionSingularities} from '../../math/rarefaction/singularities.js'
import {fiberZ} from '../../math/charts/reciprocalChart.js'
import {jacobian} from '../../math/flux/quadraticFlux.js'

// Select whole trajectories by their coverage in the phase plane. A regular
// seed grid can otherwise put several seeds on nearly the same trajectory.
function spacedPhaseOrbits(orbits,tauMin,tauMax){
  const tauSpan=Math.max(tauMax-tauMin,1e-8)
  const resolution=80
  const covered=new Set()
  const cell=(x,y)=>x+resolution*y
  const candidates=orbits.map(curve=>{
    const cells=new Set()
    for(const {tau,zc} of curve){
      if(tau<tauMin||tau>tauMax)continue
      const x=Math.min(resolution-1,Math.floor(resolution*(tau-tauMin)/tauSpan))
      const y=Math.floor(resolution*(zc+1)/2)
      cells.add(cell(x,y))
    }
    return {curve,cells}
  })
  const selected=[]
  while(candidates.length){
    let bestIndex=-1,bestCoverage=0
    for(const [index,{cells}] of candidates.entries()){
      const fresh=[...cells].filter(id=>!covered.has(id)).length
      if(fresh>bestCoverage&&fresh>=.35*cells.size){bestIndex=index;bestCoverage=fresh}
    }
    if(bestIndex<0)break
    const [{curve,cells}]=candidates.splice(bestIndex,1)
    selected.push(curve)
    for(const id of cells){
      const x=id%resolution,y=Math.floor(id/resolution)
      covered.add(id)
      if(x>0)covered.add(cell(x-1,y))
      if(x<resolution-1)covered.add(cell(x+1,y))
      covered.add(cell(x,y-1))
      covered.add(cell(x,y+1))
    }
  }
  return selected
}

function clipPhaseCurve(points,tauMin,tauMax){
  const segments=[]
  let current=[]
  const inside=q=>q.tau>=tauMin&&q.tau<=tauMax
  const flush=()=>{if(current.length>1)segments.push(current);current=[]}
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],delta=b.tau-a.tau
    if(!inside(a))flush()
    if(Math.max(a.tau,b.tau)<tauMin||Math.min(a.tau,b.tau)>tauMax)continue
    const clip=q=>{
      if(inside(q))return q
      const tau=Math.max(tauMin,Math.min(tauMax,q.tau))
      const t=(tau-a.tau)/delta
      return {tau,zc:a.zc+(b.zc-a.zc)*t,u:a.u+(b.u-a.u)*t,v:a.v+(b.v-a.v)*t}
    }
    if(!current.length)current.push(clip(a))
    current.push(clip(b))
    if(!inside(b))flush()
  }
  flush()
  return segments
}

export function rarefactionPortrait(p,tauMin,tauMax,{clipTau=true}={}){
  const orbits=rarefactionOrbits(p,tauMin,tauMax,{clipTau:false,nTau:29,nZ:31})
  const curves=spacedPhaseOrbits(orbits,tauMin,tauMax).flatMap((orbit,index)=>{
    const points=clipTau?orbit:[
      ...continueRarefactionAtInfinity(orbit[0],orbit[1],p).reverse(),
      ...orbit,
      ...continueRarefactionAtInfinity(orbit.at(-1),orbit.at(-2),p),
    ]
    return splitProjectedRarefactionByBranch(projectRarefactionOrbitToState(points,p),p,{orbitId:'R'+index})
      .flatMap(({orbitId,branch,points})=>{
        const segments=clipTau?clipPhaseCurve(points,tauMin,tauMax):[points]
        return segments.map(points=>({orbitId,branch,points}))
      })
  })
  if(!clipTau){
    const [saddle]=infinityRarefactionSingularities(p)
    const separatrices=saddle?.type==='sela'?infinityRarefactionSeparatrices(p):[]
    for(const branch of separatrices){
      const end=branch.reciprocalPoints.at(-1)
      if(!branch.reciprocalPoints.every(q=>q.Z===0))continue
      const endState=fiberZ(0,end.eta,p).Ubar
      const J=jacobian(endState,p)
      if(J[0][0]>=J[1][1])continue
      const points=[saddle.eta,end.eta].map(eta=>{
        const [u,v]=fiberZ(0,eta,p).Ubar
        return {u,v}
      })
      curves.push({orbitId:'infinity-slow',branch:'slow',points})
      // Join the finite-chart arm on the same side of the projected saddle.
      const direction=Math.sign(points[1].u-points[0].u)
      const arm=separatrices.find(candidate=>{
        if(!candidate.visibleInFiniteChart)return false
        const first=candidate.reciprocalPoints[0]
        return Math.sign(fiberZ(first.Z,first.eta,p).Ubar[0]-points[0].u)===direction
      })
      if(!arm||arm.points.length<2)continue
      const seed=arm.points.at(-1)
      const previous=arm.points.at(-2)
      const orbit=rarefactionOrbitThrough(seed,p,tauMin,tauMax,{clipTau:false})
      const index=orbit.indexOf(seed)
      const next=orbit[index+1]
      const outward=next&&(next.zc-seed.zc)*(seed.zc-previous.zc)>0
      const tail=index<0?[]:outward?orbit.slice(index+1):orbit.slice(0,index).reverse()
      const projected=projectRarefactionOrbitToState([...arm.points,...tail],p)
      const segments=splitProjectedRarefactionByBranch(projected,p,{orbitId:'infinity-slow'})
      if(segments.length)segments[0].points.unshift(points[0])
      curves.push(...segments)
    }
  }
  return curves
}

export function rarefactionStateLayers(p, tauMin, tauMax, visibility) {
  const layers = {}
  if (visibility.finitePoints) {
    layers.finitePoints = rarefactionSingularities(p, -Infinity, Infinity).flatMap((q, singularityIndex) =>
      projectRarefactionOrbitToState([q], p).map(point => ({...point, singularityIndex})),
    )
  }
  if (visibility.finiteStable || visibility.finiteUnstable) {
    const {separatrices} = finiteRarefactionSeparatrices(p, tauMin, tauMax)
    layers.finiteStable = []
    layers.finiteUnstable = []
    for (const branch of separatrices) {
      layers[branch.stable ? 'finiteStable' : 'finiteUnstable'].push(
        projectRarefactionOrbitToState(branch.points, p),
      )
    }
  }

  const projectReciprocal = ({Z, eta}) => {
    const {Ubar} = fiberZ(Z, eta, p)
    return Ubar?.every(Number.isFinite) ? {u: Ubar[0], v: Ubar[1]} : null
  }
  if (visibility.infinityPoints || visibility.infinityStable || visibility.infinityUnstable) {
    const singularities = infinityRarefactionSingularities(p)
    layers.infinityPoints = singularities.map(projectReciprocal).filter(Boolean)
    if (visibility.infinityStable || visibility.infinityUnstable) {
      layers.infinityStable = []
      layers.infinityUnstable = []
      for (const branch of infinityRarefactionSeparatrices(p)) {
        const segments = layers[branch.stable ? 'infinityStable' : 'infinityUnstable']
        let points = []
        for (const q of [singularities[0], ...branch.reciprocalPoints]) {
          const point = projectReciprocal(q)
          if (point) points.push(point)
          else {
            if (points.length > 1) segments.push(points)
            points = []
          }
        }
        if (points.length > 1) segments.push(points)
      }
    }
  }
  return layers
}
