import { doubleSonicGeometry } from "../sonic/surface.js"
import { rarefactionOrbits } from "../../math/rarefaction/orbits.js"
import { waveState } from "../../math/manifold/waveState.js"
import { zFromZc } from "../../math/charts/zChart.js"
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
 for(const record of records)for(const branch of record.branches){
  const first=branch.points[0],last=branch.points.at(-1)
  counts[endpointClass(first,"start",record.sourceCount,window,doubleSonic)]++
  counts[endpointClass(last,"end",record.sourceCount,window,doubleSonic)]++
 }
 return {endpoints:records.reduce((n,r)=>n+2*r.branches.length,0),...counts}
}
function symmetrySummary(minusBranches,plusBranches){
 const minus=minusBranches.flatMap(b=>b.points).map(x=>finiteQ(x.Q)).filter(Boolean)
 const plus=plusBranches.flatMap(b=>b.points).map(x=>finiteQ(x.Q)).filter(Boolean)
 const key=q=>`${q.tau.toPrecision(10)}|${Math.abs(q.Y).toPrecision(10)}|${q.z.toPrecision(10)}`
 const plusKeys=new Set(plus.map(key))
 const matched=minus.filter(q=>plusKeys.has(key(q))).length
 let maxMirrorResidual=0
 for(const m of minus){
  let best=Infinity
  for(const q of plus){
   const d=Math.hypot(m.tau-q.tau,m.Y+q.Y,Math.atan(m.z)-Math.atan(q.z))
   if(d<best)best=d
  }
  if(Number.isFinite(best))maxMirrorResidual=Math.max(maxMirrorResidual,best)
 }
 return {minusPoints:minus.length,plusPoints:plus.length,matched,exactMirror:minus.length===plus.length&&matched===minus.length,maxMirrorResidual}
}
export function buildCompositeSceneData(p,tauMin,tauMax,{showMinus=true,showPlus=true,YMin=-Infinity,YMax=Infinity,auditContinuation=false}={}){
 const acc={minus:{source:0,candidates:0,branches:[],geometry:[],records:[],continuation:[]},plus:{source:0,candidates:0,branches:[],geometry:[],records:[],continuation:[]}}
 if(!showMinus&&!showPlus)return {minus:{geometry:[],diagnostics:empty()},plus:{geometry:[],diagnostics:empty()}}
 for(const orbit of rarefactionOrbits(p,tauMin,tauMax)){
  const stride=Math.max(1,Math.ceil(orbit.length/90))
  const source=orbit.filter((_,i)=>i%stride===0||i===orbit.length-1).map(q=>waveState(q.tau,0,zFromZc(q.zc),p)).filter(q=>q?.kind==="regular")
  for(const side of ["minus","plus"]){
   if(side==="minus"&&!showMinus||side==="plus"&&!showPlus)continue
   const trace=source.map(P=>({P,intersections:compositeLeafIntersections(P,p,side,{samples:144,reciprocalSamples:96})}))
   const continuation=auditContinuation?auditCompositeContinuation(trace):null
   const branches=certifyCompositeBranches(continuation?continuation.branches:decomposeCompositeBranches(trace),p,side,{sonicTolerance:1e-6,stateTolerance:1e-6})
   if(continuation)acc[side].continuation.push(continuation.diagnostics)
   acc[side].source+=source.length;acc[side].candidates+=trace.reduce((n,x)=>n+x.intersections.length,0);acc[side].branches.push(...branches);acc[side].records.push({sourceCount:source.length,branches})
  }
 }
 const window={tauMin,tauMax,YMin,YMax}
 const doubleSonic=doubleSonicGeometry(p,{tauMin,tauMax,YMin:Number.isFinite(YMin)?YMin:-6,YMax:Number.isFinite(YMax)?YMax:6})
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
  return [side,{geometry:compositeGeometry(acc[side].branches,{},window),diagnostics}]
 }))
 const symmetry=showMinus&&showPlus?symmetrySummary(acc.minus.branches,acc.plus.branches):null
 result.minus.diagnostics.symmetry=symmetry
 result.plus.diagnostics.symmetry=symmetry
 return result
}
export function compositeSceneDiagnostics(data){return {minus:data?.minus?.diagnostics??empty(),plus:data?.plus?.diagnostics??empty()}}
