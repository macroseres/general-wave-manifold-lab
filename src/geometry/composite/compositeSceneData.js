import { compositeSingularities, compositeSaddleBranches } from "../../math/state/compositeEquilibria.js"
import { fiber } from "../../math/charts/zChart.js"
import { finiteRarefactionSeparatrices } from "../../math/rarefaction/finiteSeparatrices.js"
import { infinityRarefactionSeparatrices } from "../../math/rarefaction/separatrices.js"
import { infinityRarefactionSingularities } from "../../math/rarefaction/singularities.js"
import { fiberZ } from "../../math/charts/reciprocalChart.js"
import { reciprocalSonicImplicit } from "../../math/sonic/reciprocalSonic.js"
import { stateFiberPoint } from "../../math/state/fibers.js"
import { forwardSonicIntersections, forwardSonicPolynomial, prepareForwardSonicIntersections } from "../state/forwardSonicIntersections.js"
import { rarefactionSingularities } from "../../math/rarefaction/singularities.js"
import { regularMinusCompositeDirection } from "../../math/state/composite.js"
import { integrateMinusCompositeFold } from "../../math/state/compositeFoldField.js"
import { certifyCompositePoint } from "../../math/state/compositeTrace.js"
import { doubleSonicGeometry } from "../sonic/surface.js"
import { rarefactionOrbits } from "../../math/rarefaction/orbits.js"
import { NUMERICAL_POLICY } from "../../math/numerics/policy.js"
import { waveState } from "../../math/manifold/waveState.js"
import { zFromZc, zcFromZ } from "../../math/charts/zChart.js"
import { compositeLeafIntersections, decomposeCompositeBranches, certifyCompositeBranches, auditCompositeContinuation } from "../../math/state/compositeTrace.js"
import { auditCompositeBranches, compositeGeometry } from "./compositeGeometry.js"
const empty=()=>({sourcePoints:0,candidates:0,certifiedPoints:0,validPoints:0,branches:0,singletonBranches:0,topology:{endpoints:0,"rarefaction-end":0,"outside-window":0,"projective-boundary":0,"double-sonic":0,"root-disappearance":0,"unclassified":0},symmetry:null,audit:{points:0,insideWindow:0,outsideWindow:0,segments:0,crossChartSegments:0,maxDeltaTau:0,maxDeltaY:0,maxDeltaZc:0,worstSegment:null},classes:{both:0,sonicOnly:0,fibreOnly:0,neither:0},sonic:{min:null,max:null,finite:0,nonFinite:0},fibre:{min:null,max:null,finite:0,nonFinite:0},example:null})
function summary(sourcePoints,candidates,branches){
 const pts=branches.flatMap(b=>b.points),certs=pts.map(x=>x.certificate).filter(Boolean)
 const valid=certs.filter(c=>c.valid)
 const classes={both:0,sonicOnly:0,fibreOnly:0,neither:0}
 for(const c of certs){
  if(c.sonicSatisfied&&c.fibreSatisfied)classes.both++
  else if(c.sonicSatisfied)classes.sonicOnly++
  else if(c.fibreSatisfied)classes.fibreOnly++
  else classes.neither++
 }
 const finite=v=>v.filter(Number.isFinite)
 const values=key=>finite(certs.map(c=>c[key]))
 const sonicValues=values("sonicResidual"),fibreValues=values("stateResidual")
 const best=[...pts].filter(x=>x.certificate).sort((a,b)=>{
  const score=c=>Math.max(Number.isFinite(c.sonicResidual)?c.sonicResidual:Infinity,Number.isFinite(c.stateResidual)?c.stateResidual:Infinity)
  return score(a.certificate)-score(b.certificate)
 })[0]
 const range=v=>v.length?{min:Math.min(...v),max:Math.max(...v),finite:v.length,nonFinite:certs.length-v.length}:{min:null,max:null,finite:0,nonFinite:certs.length}
 return {sourcePoints,candidates,certifiedPoints:certs.length,validPoints:valid.length,branches:branches.length,singletonBranches:branches.filter(b=>b.points.length===1).length,classes,sonic:range(sonicValues),fibre:range(fibreValues),example:best?{P:best.P,Q:best.Q,certificate:best.certificate}:null}
}


function finiteQ(Q){
 if(!Q)return null
 if(Q.chart==="reciprocal"||Q.reciprocal===true){
  if(![Q.eta,Q.Upsilon,Q.Z].every(Number.isFinite)||Q.Z===0)return null
  return {tau:Q.eta*Q.Z*Q.Z,Y:Q.Upsilon*Q.Z,z:1/Q.Z}
 }
 return [Q.tau,Q.Y,Q.z].every(Number.isFinite)?{tau:Q.tau,Y:Q.Y,z:Q.z}:null
}
function endpointClass(point,which,sourceCount,window,doubleSonic=[]){
 const q=finiteQ(point?.Q)
 if(!q)return "projective-boundary"
 const eps=1e-9
 if(q.tau<window.tauMin-eps||q.tau>window.tauMax+eps||q.Y<window.YMin-eps||q.Y>window.YMax+eps)return "outside-window"
 if(point.sampleIndex===0||point.sampleIndex===sourceCount-1)return "rarefaction-end"
 if((point.Q?.chart==="reciprocal"||point.Q?.reciprocal===true)&&Math.abs(point.Q.Z)<=1e-8)return "projective-boundary"
 const zc=2/Math.PI*Math.atan(q.z)
 if(doubleSonic.some(ds=>Math.hypot(q.tau-ds.tau,zc-ds.zc)<=.035))return "double-sonic"
 return which==="start"||which==="end"?"root-disappearance":"unclassified"
}
function topologySummary(records,window,doubleSonic=[]){
 const counts={"rarefaction-end":0,"outside-window":0,"projective-boundary":0,"double-sonic":0,"root-disappearance":0,"unclassified":0}
 const unresolved={rootCountChanged:0,rootCountUnchanged:0}
 let resolvedFolds=0
 for(const record of records)for(const branch of record.branches){
  const first=branch.points[0],last=branch.points.at(-1)
  for(const [point,edge,offset] of [[first,"start",-1],[last,"end",1]]){
   if(point.fold&&endpointClass(point.foldFrom,edge,record.sourceCount,window,doubleSonic)==="root-disappearance")resolvedFolds++
   const kind=endpointClass(point,edge,record.sourceCount,window,doubleSonic)
   counts[kind]++
   if(kind!=="root-disappearance")continue
   if(point.fold)continue
   const i=point.sampleIndex
   const changed=record.rootCounts[i]!==record.rootCounts[i+offset]
   unresolved[changed?"rootCountChanged":"rootCountUnchanged"]++
  }
 }
 return {endpoints:records.reduce((n,r)=>n+2*r.branches.length,0),...counts,unresolved,resolvedFolds}
}
function symmetrySummary(minusBranches,plusBranches){
 const minus=minusBranches.flatMap(b=>b.points).map(x=>finiteQ(x.Q)).filter(Boolean)
 const plus=plusBranches.flatMap(b=>b.points).map(x=>finiteQ(x.Q)).filter(Boolean)
 const key=q=>`${q.tau.toPrecision(10)}|${Math.abs(q.Y).toPrecision(10)}|${q.z.toPrecision(10)}`
 const plusByKey=new Map(plus.map(q=>[key(q),q]))
 let matched=0
 let maxMirrorResidual=0
 for(const m of minus){
  const mirror=plusByKey.get(key(m))
  if(mirror)matched++
  if(mirror?.tau===m.tau&&mirror.Y===-m.Y&&mirror.z===m.z)continue
  let best=Infinity
  for(const q of plus){
   const d=Math.hypot(m.tau-q.tau,m.Y+q.Y,Math.atan(m.z)-Math.atan(q.z))
   if(d<best)best=d
  }
  if(Number.isFinite(best))maxMirrorResidual=Math.max(maxMirrorResidual,best)
 }
 return {minusPoints:minus.length,plusPoints:plus.length,matched,exactMirror:minus.length===plus.length&&matched===minus.length,maxMirrorResidual}
}
function finiteSaddleLift(P,candidate,p){
 const Q=finiteQ(candidate)
 return Q&&certifyCompositePoint(P,candidate,p,"minus").valid&&regularMinusCompositeDirection(P,Q,p,{checkEquilibrium:true})
}

function canonicalCompositeParameters(p){
 if(p.a11!==0||p.a02!==.5||p.a01!==0||p.b20!==0||p.b11!==1||p.a10!==p.b01)return null
 return {b1:2*p.a20-1,b2:-2*p.b02,a:p.a10,c:p.b10}
}

function canonicalCompositeEquilibria(p){
 const parameters=canonicalCompositeParameters(p)
 return parameters&&compositeSingularities(parameters)
}

export function infinityMinusCompositeEquilibria(p){
 const equilibrium=canonicalCompositeEquilibria(p)?.find(q=>!Number.isFinite(q.z))
 return equilibrium?[-1,1].map(zc=>({tau:0,Y:0,zc,
  tex:`E_{-,\\infty}^{${zc<0?"-":"+"}}`} )):[]
}

export function finiteMinusCompositeEquilibria(p,tauMin,tauMax,YMin,YMax){
 const equilibria=canonicalCompositeEquilibria(p)
 if(equilibria)return equilibria.filter(q=>Number.isFinite(q.z)).flatMap(({Y,z,state})=>{
  const f=fiber(z,0,p)
  if(f.kind!=="regular")return []
  const midpoint=[state[0]+Y*z/2,state[1]+Y/2]
  const tau=f.tangent.reduce((sum,v,i)=>sum+v*(midpoint[i]-f.base[i]),0)/f.D
  return tau>=tauMin&&tau<=tauMax&&Y>=YMin&&Y<=YMax?[{tau,Y,z}]:[]
 })
 const points=[]
 for(const {tau,z} of rarefactionSingularities(p,tauMin,tauMax)){
  const P={...waveState(tau,0,z,p),tau,z}
  for(const candidate of compositeLeafIntersections(P,p,"minus")){
   const Q=finiteQ(candidate)
   if(!Q||Q.tau<tauMin||Q.tau>tauMax||Q.Y<YMin||Q.Y>YMax)continue
   if(!finiteSaddleLift(P,candidate,p))continue
   if(points.some(q=>Math.hypot(q.tau-Q.tau,q.Y-Q.Y,q.z-Q.z)<1e-6))continue
   points.push(Q)
  }
 }
 return points
}

function matchesGeneratorSpeed(P,Q,p){
 const speed=Q.s??waveState(Q.tau,Q.Y,Q.z,p).s
 return Number.isFinite(speed)&&Number.isFinite(P.s)&&
  Math.abs(speed-P.s)<=1e-6*Math.max(1,Math.abs(speed),Math.abs(P.s))
}

// Localize a simple fold of the sonic polynomial on the sampled source chord.
function refineSonicFold(point,neighbor,p,side,pairedRoot){
 const {P:a,Q}=point,b=neighbor.P
 const source=t=>{
  const tau=a.tau+t*(b.tau-a.tau)
  const z=zFromZc(zcFromZ(a.z)+t*(zcFromZ(b.z)-zcFromZ(a.z)))
  return {...waveState(tau,0,z,p),tau,z}
 }
 const equations=(t,z)=>{
  const P=source(t)
  if(P.kind!=="regular")return [NaN,NaN]
  const coefficients=forwardSonicPolynomial(P.Um,p)
  const scale=Math.max(...coefficients.map(Math.abs))
  const value=coefficients.reduceRight((sum,c)=>sum*z+c,0)/scale
  const derivative=coefficients.slice(1).reduceRight((sum,c,i)=>sum*z+(i+1)*c,0)/scale
  return [value,derivative]
 }
 let t=.5,z=pairedRoot?(Q.z+pairedRoot.z)/2:Q.z
 const h=1e-5
 for(let i=0;i<16;i++){
  const [f,g]=equations(t,z)
  const [ft,gt]=equations(t+h,z).map((x,j)=>(x-equations(t-h,z)[j])/(2*h))
  const [fz,gz]=equations(t,z+h).map((x,j)=>(x-equations(t,z-h)[j])/(2*h))
  const det=ft*gz-fz*gt
  if(!Number.isFinite(det)||Math.abs(det)<1e-12)return null
  if(Math.hypot(f,g)<1e-10){
   if(t<0||t>1||Math.abs(zcFromZ(z)-zcFromZ(Q.z))>.08)return null
   const P=source(t),candidate=stateFiberPoint(P.Um,z,p,side)
   if(candidate.kind!=="regular"||Math.abs(candidate.Y)<1e-8)return null
   const certificate=certifyCompositePoint(P,candidate,p,side)
   if(!certificate.valid||!matchesGeneratorSpeed(P,candidate,p))return null
   const approach=[]
   if(pairedRoot)for(const fraction of [.75,.9375,.984375,.99609375,.9990234375]){
    const sample=source(t*fraction)
    const predictedZ=z+(Q.z-z)*Math.sqrt(1-fraction)
    const direction=Math.sign(Q.z-pairedRoot.z)
    const root=forwardSonicIntersections(sample.Um,p).points
     .filter(q=>direction*(q.z-z)>0)
     .sort((a,b)=>Math.abs(a.z-predictedZ)-Math.abs(b.z-predictedZ))[0]
    if(!root||Math.abs(root.z-predictedZ)>Math.abs(Q.z-z)*.25)continue
    const lift=stateFiberPoint(sample.Um,root.z,p,side)
    const proof=certifyCompositePoint(sample,lift,p,side)
    if(!proof.valid||!matchesGeneratorSpeed(sample,lift,p))continue
    const sign=side==="minus"?1:-1
    const local=integrateMinusCompositeFold({...candidate,Y:sign*candidate.Y},root.z,p)
    // Preserve the root trace when the local chart or fibre certificate fails.
    const integrated=local&&{...lift,tau:local.tau,Y:sign*local.Y,Ubar:local.Ubar}
    const localProof=integrated&&matchesGeneratorSpeed(sample,integrated,p)&&certifyCompositePoint(sample,integrated,p,side)
    approach.push({...point,P:sample,Q:localProof?.valid?integrated:lift,
     certificate:localProof?.valid?localProof:proof,foldSourceParameter:t*fraction,localFoldIntegration:!!localProof?.valid})
   }
   const fold={...point,P,Q:{...candidate,theta:Math.atan(z),tangency:true},certificate,fold:true,foldFrom:point}
   if(approach.length){
    const nearest=approach.at(-1)
    // At a simple fold the source displacement is quadratic in z-z_fold.
    // Keep a short certified RK4 segment even if a longer one misses its fibre.
    const fraction=1/32
    const sample=source(t+(nearest.foldSourceParameter-t)*fraction**2)
    const sign=side==="minus"?1:-1
    const local=integrateMinusCompositeFold({...candidate,Y:sign*candidate.Y},
     z+fraction*(nearest.Q.z-z),p)
    if(local){
     const lift={...local,Y:sign*local.Y,chart:"finite",theta:Math.atan(local.z)}
     const proof=certifyCompositePoint(sample,lift,p,side)
     if(proof.valid&&matchesGeneratorSpeed(sample,lift,p))approach.push({...point,P:sample,Q:lift,certificate:proof,localFoldIntegration:true})
    }
   }
   return {fold,approach}
  }
  t-=(gz*f-fz*g)/det
  z-=(-gt*f+ft*g)/det
  if(t<-.2||t>1.2||!Number.isFinite(z))return null
 }
 return null
}

function spacedCompositeGeometry(records,window){
 const resolution=42
 const {tauMin,tauMax,YMin,YMax}=window
 const axis=(value,min,max)=>Number.isFinite(min)&&Number.isFinite(max)&&max>min
  ? Math.floor(resolution*(value-min)/(max-min))
  : Math.floor(resolution*(Math.atan(value)/Math.PI+.5))
 const sections=[-.98,-.95,-.9,-.85,.85,.9,.95,.98]
 const selectedCrossings=sections.map(()=>[])
 const key=(x,y,z)=>[x,y,z].join(",")
 // Keep all branches of a generating orbit together, including both sides of its folds.
 // Independent supplemental branches can fill a gap even when another
 // branch of the same generator crowds a border. Keep fold branches together.
 const groups=records.flatMap(record=>{
  if(!record.supplemental)return [record]
  const foldBranches=record.branches.filter(branch=>branch.points.some(point=>point.fold))
  const independent=record.branches.filter(branch=>!foldBranches.includes(branch))
  return [{...record,branches:foldBranches},
   ...independent.map(branch=>({...record,branches:[branch]}))]
 })
 const candidates=groups.map(({branches,supplemental})=>{
  const geometry=compositeGeometry(branches,{},window).filter(g=>g.segments.some(s=>s.length>1))
  const cells=new Map()
  for(const {segments} of geometry)for(const segment of segments)for(const q of segment){
   const x=axis(q.x,tauMin,tauMax),y=axis(q.y,YMin,YMax),z=axis(q.z,-1,1)
   cells.set(key(x,y,z),[x,y,z])
  }
  const tipCells=new Set()
  for(const {segments} of geometry)for(const segment of segments){
   for(const q of [segment[0],segment.at(-1)]){
    if(Math.abs(q.z)>=.97)continue
    const x=axis(q.x,tauMin,tauMax),y=axis(q.y,YMin,YMax)
    if(Math.hypot(x/resolution-.5,y/resolution-.5)>=.24){
     tipCells.add(key(x,y,axis(q.z,-1,1)))
    }
   }
  }
  const crossings=sections.map(z=>geometry.flatMap(({segments})=>segments.flatMap(segment=>{
   const points=[]
   for(let i=1;i<segment.length;i++){
    const a=segment[i-1],b=segment[i]
    if((a.z<z)===(b.z<z))continue
    const t=(z-a.z)/(b.z-a.z)
    points.push([axis(a.x+t*(b.x-a.x),tauMin,tauMax),
     axis(a.y+t*(b.y-a.y),YMin,YMax)])
   }
   return points
  })))
  return {geometry,cells,tipCells,crossings,supplemental}
 })
 const selected=[],covered=new Set(),frontalCoverage=new Set()
 let fillOuterGaps=false
 let lowerRightExceptions=0
 while(candidates.length){
  let best=-1,bestCoverage=0,bestUsesException=false
  for(const [i,{cells,tipCells,crossings,supplemental}] of candidates.entries()){
   let fresh=0,outer=0
   const verticalCells=new Set()
   for(const [id,[x,y]] of cells){
    if(supplemental&&Math.abs(y/resolution-.5)>=.22&&!frontalCoverage.has(key(x,y,0)))verticalCells.add(key(x,y,0))
    if(covered.has(id))continue
    fresh++
    const radius=Math.hypot(x/resolution-.5,y/resolution-.5)
    if(radius>=.24)outer++

   }
   // Reward fresh coverage around the full perimeter in the frontal plane.
   const freshTips=[...tipCells].filter(id=>!covered.has(id)).length
   // Compare transverse crossings at the same distance from each border.
   let separation=0,crowdedCrossings=0,tipCrowding=0
   for(const [section,points] of crossings.entries()){
    for(const [x,y] of points){
     const crowded=selectedCrossings[section].some(([u,v])=>Math.hypot(x-u,y-v)<(supplemental?3:2))
     // Convergence at the projective boundary does not veto a new arc.
     if(Math.abs(sections[section])>=.95)continue
     if(Math.abs(sections[section])===.9){
      if(crowded)tipCrowding++
      continue
     }
     separation+=crowded?-8:8
     if(crowded)crowdedCrossings++
    }
   }
   const vertical=verticalCells.size
   const rightCoverage=[...verticalCells].filter(id=>Number(id.split(",")[0])>=resolution/2).length
   const lowerRightCoverage=[...verticalCells].filter(id=>{
    const [x,y]=id.split(",").map(Number)
    return x>=resolution/2&&y<resolution/2
   }).length
   let lowerRightGap=0
   for(const id of verticalCells){
    const [x,y]=id.split(",").map(Number)
    if(x<resolution/2||y>=resolution/2)continue
    if(![-1,0,1].some(dx=>[-1,0,1].some(dy=>frontalCoverage.has(key(x+dx,y+dy,0)))))lowerRightGap++
   }
   const score=fillOuterGaps
    ? (supplemental?vertical+2*rightCoverage+3*lowerRightGap-6*crowdedCrossings-5*tipCrowding:outer)
    : fresh+outer+4*freshTips+separation
   const usesException=fillOuterGaps&&supplemental&&crowdedCrossings>0&&
    lowerRightGap>=4&&lowerRightExceptions<3
   const eligible=fillOuterGaps
    ? usesException||
      (crowdedCrossings===0&&(supplemental
       ? vertical>=6||rightCoverage>=4||lowerRightCoverage>=3
       : outer>=Math.max(4,.12*cells.size)))
    : !supplemental&&score>=.35*cells.size
   if(eligible&&score>bestCoverage){best=i;bestCoverage=score;bestUsesException=usesException}
  }
  if(best<0){
   if(fillOuterGaps)break
   // Keep the first pass and add only arcs that leave its border spacing intact.
   fillOuterGaps=true
   continue
  }
  if(bestUsesException)lowerRightExceptions++
  const [{geometry,cells,crossings}]=candidates.splice(best,1)
  crossings.forEach((points,i)=>selectedCrossings[i].push(...points))
  selected.push(...geometry)
  for(const [x,y,z] of cells.values()){
   frontalCoverage.add(key(x,y,0))
   covered.add(key(x,y,z))
   for(const d of [-1,1]){
    covered.add(key(x+d,y,z))
    covered.add(key(x,y+d,z))
    covered.add(key(x,y,z+d))
   }
  }
 }
 return selected
}

export function buildCompositeSceneData(p,tauMin,tauMax,{showMinus=true,showPlus=true,YMin=-Infinity,YMax=Infinity,auditContinuation=false}={}){
 const acc={minus:{source:0,candidates:0,branches:[],geometry:[],records:[],continuation:[],eventPoints:[],foldPoints:[]},plus:{source:0,candidates:0,branches:[],geometry:[],records:[],continuation:[],eventPoints:[],foldPoints:[]}}
 if(!showMinus&&!showPlus)return {minus:{geometry:[],diagnostics:empty()},plus:{geometry:[],diagnostics:empty()}}
 const doubleSonic=doubleSonicGeometry(p,{tauMin,tauMax,YMin:Number.isFinite(YMin)?YMin:-6,YMax:Number.isFinite(YMax)?YMax:6})
 const {orbitStep,orbitMaxSteps}=NUMERICAL_POLICY.rarefaction
 const sonicIntersections=prepareForwardSonicIntersections(p)
 const orbitOptions={nTau:11,nZ:29,...(doubleSonic.length?{step:orbitStep/3,maxSteps:orbitMaxSteps*3}:{})}
 // The generator can leave the window while its sonic lift remains visible.
 const baseOrbits=rarefactionOrbits(p,tauMin,tauMax,{...orbitOptions,clipTau:false})
 const seeds=[]
 for(let i=1;i<orbitOptions.nTau;i+=2)for(let j=2;j<orbitOptions.nZ-1;j+=2){
  seeds.push({tau:tauMin+i*(tauMax-tauMin)/orbitOptions.nTau,zc:-.9+1.8*j/orbitOptions.nZ})
 }
 // Sample between adjacent tau rows as well as between zc columns.
 for(let i=2;i<orbitOptions.nTau-1;i+=2)for(let j=1;j<orbitOptions.nZ;j+=4){
  seeds.push({tau:tauMin+i*(tauMax-tauMin)/orbitOptions.nTau,zc:-.9+1.8*j/orbitOptions.nZ})
 }
 if(Number.isFinite(YMin)&&Number.isFinite(YMax)&&YMax>YMin){
  // Screen seeds by the position of their sonic lifts before tracing them.
  const verticalSeeds=new Map()
  const tauSpan=tauMax-tauMin,YSpan=YMax-YMin
  for(const offset of [-.4,-.2,-.1,.1,.2,.3,.4,.5])for(let j=1;j<2*orbitOptions.nZ;j++){
   const tau=(offset<0?tauMin:tauMax)+offset*tauSpan
   const zc=-.9+.9*j/orbitOptions.nZ
   const P=waveState(tau,0,zFromZc(zc),p)
   if(P.kind!=="regular")continue
   for(const q of sonicIntersections(P.Um).points){
    const height=(q.Y-YMin)/YSpan
    if(q.tau<tauMin||q.tau>tauMax||height<-.15||height>1.15||
      Math.abs(height-.5)<.25||!matchesGeneratorSpeed(P,q,p))continue
    const horizontal=(q.tau-tauMin)/tauSpan
    if(horizontal<.5)continue
    const key=[Math.floor(8*horizontal),Math.floor(12*height)].join(",")
    if(!verticalSeeds.has(key))verticalSeeds.set(key,{tau,zc})
   }
  }
  // Sample the lower-right lifts on a finer grid and prefer the seed
  // closest to the center of each target cell.
  const lowerRightSeeds=new Map()
  for(let i=-5;i<=15;i++)for(let j=1;j<4*orbitOptions.nZ;j++){
   const tau=tauMin+i*tauSpan/10,zc=-.9+.45*j/orbitOptions.nZ
   const P=waveState(tau,0,zFromZc(zc),p)
   if(P.kind!=="regular")continue
   for(const q of sonicIntersections(P.Um).points){
    const x=12*(q.tau-tauMin)/tauSpan,y=16*(q.Y-YMin)/YSpan
    if(x<6||x>=12||y<0||y>=5||!matchesGeneratorSpeed(P,q,p))continue
    const key=[Math.floor(x),Math.floor(y)].join(",")
    const distance=Math.hypot(x-Math.floor(x)-.5,y-Math.floor(y)-.5)
    if(distance<(lowerRightSeeds.get(key)?.distance??Infinity)){
     lowerRightSeeds.set(key,{tau,zc,distance})
    }
   }
  }
  seeds.push(...new Set(verticalSeeds.values()),...lowerRightSeeds.values())
 }
 const uniqueSeeds=[...new Map(seeds.map(seed=>[[seed.tau,seed.zc].map(x=>x.toPrecision(12)).join(","),seed])).values()]
 const supplementalOrbits=rarefactionOrbits(p,tauMin,tauMax,{...orbitOptions,seeds:uniqueSeeds,clipTau:false})
 for(const [index,orbit] of [...baseOrbits,...supplementalOrbits].entries()){
  const supplemental=index>=baseOrbits.length
  const stride=Math.max(1,Math.ceil(orbit.length/180))
  const source=orbit.map(({tau,zc})=>{
   const z=zFromZc(zc)
   return {...waveState(tau,0,z,p),tau,z}
  })
  const rootsBySample=showMinus&&showPlus?new Map():null
  const rootsFor=P=>{
   if(rootsBySample?.has(P))return rootsBySample.get(P)
   const roots=sonicIntersections(P.Um).points
    .filter(q=>Math.abs(q.Y)>1e-8&&matchesGeneratorSpeed(P,q,p))
   rootsBySample?.set(P,roots)
   return roots
  }
  for(const side of ["minus","plus"]){
   if(side==="minus"&&!showMinus||side==="plus"&&!showPlus)continue
   // The polynomial isolates repeated and close roots even when the sonic
   // residual has the same sign at both ends of an angular sampling interval.
   const sample=P=>({P,intersections:rootsFor(P).map(q=>{
     const Y=side==="minus"?q.Y:-q.Y
     return {...q,Y,chart:"finite",theta:Math.atan(q.z)}
    })})
   const nearDoubleSonic=entry=>entry.intersections.some(root=>{
    const q=finiteQ(root)
    return q&&doubleSonic.some(ds=>Math.hypot(q.tau-ds.tau,zcFromZ(q.z)-ds.zc)<.14)
   })
   const needsIntermediateSamples=(a,b)=>a.intersections.some(q=>
    !b.intersections.some(r=>{
     const angle=Math.abs(q.theta-r.theta)
     return Math.min(angle,Math.PI-angle)<.22&&
      Math.abs(q.Y-r.Y)<.35*(1+Math.abs(q.Y)+Math.abs(r.Y))
    }))
   const trace=[]
   let previous=null
   for(let i=0;i<source.length;i=Math.min(source.length-1,i+stride)){
    const P=source[i]
    if(P.kind==="regular"){
     const current=sample(P)
     const rootCountChanged=previous&&previous.entry.intersections.length!==current.intersections.length
     if(previous&&(rootCountChanged||nearDoubleSonic(previous.entry)||nearDoubleSonic(current)||
      needsIntermediateSamples(previous.entry,current)||needsIntermediateSamples(current,previous.entry))){
      // Use the original orbit samples to resolve the sonic roots on either
      // side of DS, where the finite sonic graph may become poorly conditioned.
      for(let j=previous.index+1;j<i;j++){
       if(source[j].kind==="regular")trace.push(sample(source[j]))
      }
     }
     trace.push(current)
     previous={entry:current,index:i}
    }
    if(i===source.length-1)break
   }
   const continuation=auditContinuation?auditCompositeContinuation(trace):null
   const branches=certifyCompositeBranches(continuation?continuation.branches:decomposeCompositeBranches(trace),p,side,{sonicTolerance:1e-6,stateTolerance:1e-6})
   for(const branch of branches){
    const first=branch.points[0],last=branch.points.at(-1)
    for(const [point,offset] of [[first,-1],[last,1]]){
     const adjacent=trace[point.sampleIndex+offset]
     if(!adjacent||adjacent.intersections.length>=trace[point.sampleIndex].intersections.length)continue
     const roots=trace[point.sampleIndex].intersections
     const pairedRoot=roots.length===2&&adjacent.intersections.length===0
      ?roots.reduce((farther,root)=>Math.abs(root.z-point.Q.z)>Math.abs(farther.z-point.Q.z)?root:farther)
      :null
     const refined=refineSonicFold(point,adjacent,p,side,pairedRoot)
     if(!refined)continue
     const {fold,approach}=refined
     if(offset<0)branch.points.unshift(fold,...approach.reverse())
     else branch.points.push(...approach,fold)
     if(side==="minus"&&pairedRoot&&endpointClass(point,offset<0?"start":"end",trace.length,
      {tauMin,tauMax,YMin,YMax},doubleSonic)==="root-disappearance"){
      acc[side].foldPoints.push({...finiteQ(fold.Q),kind:"composite-fold"})
     }
     if(side==="minus"&&continuation)acc[side].eventPoints.push({...finiteQ(fold.Q),kind:"sonic-tangency"})
    }
   }
   if(side==="minus"&&continuation)for(const branch of branches){
    for(const point of new Set([branch.points[0],branch.points.at(-1)])){
     const Q=finiteQ(point.Q)
     if(!point.certificate.valid||!Q||!doubleSonic.some(ds=>Math.hypot(Q.tau-ds.tau,zcFromZ(Q.z)-ds.zc)<=.035))continue
     const kind=point.Q.tangency?"sonic-tangency":"near-double-sonic"
     acc[side].eventPoints.push({...Q,kind})
    }
   }
   if(continuation){
    acc[side].continuation.push(continuation.diagnostics)
    if(side==="minus")for(const event of continuation.diagnostics.events){
     for(const branch of branches){
      const [before,after]=event.between
      const touches=event.branchId==null
       ? branch.points[0].sampleIndex===after||branch.points.at(-1).sampleIndex===before
       : branch.branchId===event.branchId
      if(!touches)continue
      const point=branch.points.find(q=>q.sampleIndex===after&&q.certificate.valid)
       ??branch.points.find(q=>q.sampleIndex===before&&q.certificate.valid)
      const Q=finiteQ(point?.Q)
      if(Q)acc[side].eventPoints.push({...Q,kind:event.kind})
     }
    }
   }
   acc[side].source+=trace.length;acc[side].candidates+=trace.reduce((n,x)=>n+x.intersections.length,0);acc[side].branches.push(...branches);acc[side].records.push({supplemental,sourceCount:trace.length,branches,rootCounts:trace.map(entry=>entry.intersections.length)})
  }
 }
 const window={tauMin,tauMax,YMin,YMax}

 const result=Object.fromEntries(["minus","plus"].map(side=>{
  const diagnostics=summary(acc[side].source,acc[side].candidates,acc[side].branches)
  diagnostics.audit=auditCompositeBranches(acc[side].branches,window)
  diagnostics.topology=topologySummary(acc[side].records,window,doubleSonic)
  if(auditContinuation)diagnostics.continuation={
   traces:acc[side].continuation.length,
   samples:acc[side].continuation.reduce((n,d)=>n+d.counts.length,0),
   events:acc[side].continuation.flatMap((d,traceIndex)=>d.events.map(event=>({...event,traceIndex}))),
   ambiguousMatches:acc[side].continuation.reduce((n,d)=>n+d.ambiguousMatches,0),
  }
  // A visible fold must join two independently certified branch ends.
  const foldGroups=new Map()
  for(const q of acc[side].foldPoints){
   const key=[q.tau,q.Y,q.z].map(x=>x.toFixed(7)).join(",")
   const group=foldGroups.get(key)
   if(group)group.count++
   else foldGroups.set(key,{q,count:1})
  }
  const geometry=spacedCompositeGeometry(acc[side].records,window)
  const visibleFolds=new Set(geometry.flatMap(g=>g.segments.flatMap(segment=>
   segment.filter(point=>point.source?.fold).map(point=>point.source.Q))))
  const foldPoints=[...foldGroups.values()].filter(({q,count})=>count===2&&
   [...visibleFolds].filter(f=>Math.hypot(q.tau-f.tau,q.Y-f.Y,q.z-f.z)<1e-7).length===2).map(group=>group.q)
  return [side,{geometry,eventPoints:acc[side].eventPoints,foldPoints,diagnostics}]
 }))
 const symmetry=showMinus&&showPlus?symmetrySummary(acc.minus.branches,acc.plus.branches):null
 result.minus.diagnostics.symmetry=symmetry
 result.plus.diagnostics.symmetry=symmetry
 return result
}
export function compositeSceneDiagnostics(data){return {minus:data?.minus?.diagnostics??empty(),plus:data?.plus?.diagnostics??empty()}}

// At Z=0 the usual inverse-fibre parameterization divides by zero.
// Fix the left u-coordinate first, then solve the affine sonic equation.
function minusLiftAtInfinity(P,p){
 const base=fiberZ(0,P.eta,p)
 if(base.kind!=="regular"||Math.abs(base.tangent[0])<1e-10)return null
 const etaAt=Upsilon=>P.eta+Upsilon/(2*base.tangent[0])
 const phi=Upsilon=>reciprocalSonicImplicit(etaAt(Upsilon),Upsilon,0,p,"minus")
 const slope=phi(1)-phi(0)
 if(!Number.isFinite(slope)||Math.abs(slope)<1e-9)return null
 const Upsilon=-phi(0)/slope,eta=etaAt(Upsilon)
 const state=fiberZ(0,eta,p)
 const leftV=Z=>fiberZ(Z,eta,p).Ubar?.[1]-Upsilon*Z/2
 const transverse=(leftV(1e-5)-leftV(-1e-5))/2e-5
 if(Math.abs(Upsilon)<1e-8||!Number.isFinite(transverse)||Math.abs(transverse)<1e-7)return null
 const Q={...state,eta,Upsilon,Z:0,chart:"reciprocal",theta:Math.PI/2}
 return certifyCompositePoint(P,Q,p,"minus").valid?Q:null
}

// Continue only branches anchored at a certified saddle lift. Stability at
// infinity refers to the desingularized reciprocal chart time.
export function minusCompositeSeparatrixGeometry(p,window,visibility){
 const parameters=canonicalCompositeParameters(p)
 if(parameters){
  if(!visibility.finiteStable&&!visibility.finiteUnstable&&
     !visibility.infinityStable&&!visibility.infinityUnstable)return []
  return compositeSaddleBranches(compositeSingularities(parameters),parameters,visibility)
   .flatMap(({points,stable,atInfinity})=>{
    const branchPoints=points.flatMap(({point:{Y,z},state})=>{
     if(!Number.isFinite(z))return []
     const f=fiber(z,0,p)
     if(f.kind!=="regular")return []
     const midpoint=[state[0]+Y*z/2,state[1]+Y/2]
     const tau=f.tangent.reduce((sum,v,i)=>sum+v*(midpoint[i]-f.base[i]),0)/f.D
     return [{Q:{tau,Y,z}}]
    })
    const [geometry]=compositeGeometry([{points:branchPoints}],{},window)
    return geometry.segments.some(segment=>segment.length>1)?[{...geometry,stable,atInfinity}]:[]
   })
 }
 const {tauMin,tauMax}=window
 const finite=visibility.finiteStable||visibility.finiteUnstable
  ?finiteRarefactionSeparatrices(p,tauMin,tauMax).separatrices:[]
 const infinity=visibility.infinityStable||visibility.infinityUnstable
  ?infinityRarefactionSeparatrices(p,{tauMin,tauMax}):[]
 const saddle=infinity.length?infinityRarefactionSingularities(p)[0]:null
 const result=[]
 for(const [atInfinity,curves] of [[false,finite],[true,infinity]]){
  for(const curve of curves){
   const key=(atInfinity?'infinity':'finite')+(curve.stable?'Stable':'Unstable')
   if(!visibility[key])continue
   const source=atInfinity
    ?[{eta:saddle.eta,Z:0},...curve.reciprocalPoints].map(({eta,Z})=>{
     const state=fiberZ(Z,eta,p)
     return {...state,eta,Z,Upsilon:0,chart:"reciprocal",Um:state.Ubar,Up:state.Ubar}
    })
    :curve.points.map(({tau,zc})=>{
     const z=zFromZc(zc)
     return {...waveState(tau,0,z,p),tau,z}
    })
   const stride=Math.max(1,Math.ceil(source.length/100))
   const trace=source.filter((_,i)=>i===1||i%stride===0||i===source.length-1)
    .map(P=>{
     const intersections=compositeLeafIntersections(P,p,"minus")
     const boundary=P.Z===0?minusLiftAtInfinity(P,p):null
     if(boundary)intersections.push(boundary)
     return {P,intersections}
    })
   const branches=certifyCompositeBranches(decomposeCompositeBranches(trace),p,"minus")
   for(const branch of branches){
    const first=branch.points[0]
    if(first.sampleIndex!==0||!first.certificate.valid)continue
    if(atInfinity){
     if(first.Q.chart!=="reciprocal"||first.Q.Z!==0)continue
    }else if(!finiteSaddleLift(first.P,first.Q,p))continue
    const stop=branch.points.findIndex(point=>!point.certificate.valid)
    const points=stop<0?branch.points:branch.points.slice(0,stop)
    const geometry=compositeGeometry([{...branch,points}],{},window)[0]
    if(geometry.segments.some(segment=>segment.length>1))result.push({...geometry,stable:curve.stable,atInfinity})
   }
  }
 }
 return result
}
