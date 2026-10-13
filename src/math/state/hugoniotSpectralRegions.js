/**
 * Spectral partition of fixed-state Hugoniot fibres.
 *
 * The partition is diagnostic only.  It records where the Rankine–Hugoniot
 * speed changes its position relative to the endpoint spectra.  Boundaries
 * are characteristic/sonic events; no Lax/Liu admissibility is imposed.
 */
import { stateFiberPoint } from './fibers.js'
import { regularFibreBranches } from './fibreAnalysis.js'
import { waveState } from '../manifold/waveState.js'
import { hugoniotSpectralDiagnostic } from './hugoniotSpectrum.js'
import { NUMERICAL_POLICY } from '../numerics/policy.js'

const finite=Number.isFinite

export function spectralSignature(d){
  if(!d||d.kind!=='regular')return 'invalid'
  return `${d.minus.position}|${d.plus.position}`
}

export function fixedStateSpectralPoint(U,z,p,side='minus',eps=NUMERICAL_POLICY.algebra.regularityTolerance){
  const q=stateFiberPoint(U,z,p,side,eps)
  if(q.kind!=='regular')return {...q,z,signature:'singular'}
  const w=waveState(q.tau,q.Y,z,p)
  if(w.kind!=='regular')return {...q,z,signature:'invalid-wave-state'}
  const spectral=hugoniotSpectralDiagnostic(w,p)
  return {...q,z,s:w.s,spectral,signature:spectralSignature(spectral)}
}

function branchId(z,roots,infinitySingular,eps){
  if(roots.length===0)return 0
  const count=Math.max(1,roots.length+(infinitySingular?1:0))
  if(infinitySingular){let k=0;while(k<roots.length&&z>roots[k]+eps)k++;return Math.min(k,count-1)}
  if(z<roots[0]-eps||z>roots.at(-1)+eps)return 0
  for(let k=1;k<roots.length;k++)if(z>roots[k-1]+eps&&z<roots[k]-eps)return k
  return null
}

function eventGap(a,b){
  const candidates=[]
  for(const side of ['minus','plus'])for(let i=0;i<2;i++){
    const ga=a.spectral?.[side]?.gaps?.[i],gb=b.spectral?.[side]?.gaps?.[i]
    if(finite(ga)&&finite(gb)&&ga*gb<=0)candidates.push({side,eigenIndex:i})
  }
  return candidates
}

function refineEvent(U,p,side,a,b,target,eps){
  let lo=a.z,hi=b.z,qa=a,qb=b
  for(let k=0;k<60;k++){
    const mid=(lo+hi)/2,qm=fixedStateSpectralPoint(U,mid,p,side,eps)
    if(qm.kind!=='regular')break
    const gl=qa.spectral[target.side].gaps[target.eigenIndex]
    const gm=qm.spectral[target.side].gaps[target.eigenIndex]
    if(Math.abs(gm)<=1e-11*Math.max(1,Math.abs(qm.s)))return qm
    if(gl*gm<=0){hi=mid;qb=qm}else{lo=mid;qa=qm}
    if(Math.abs(hi-lo)<=1e-10*Math.max(1,Math.abs(mid)))break
  }
  return Math.abs(qa.spectral[target.side].gaps[target.eigenIndex])<=Math.abs(qb.spectral[target.side].gaps[target.eigenIndex])?qa:qb
}

/**
 * Sample RP^1 by the angle theta (z=tan theta), which gives dense coverage
 * near projective infinity without tying the analysis to the 3-D view box.
 */
export function partitionHugoniotSpectralRegions(U,p,side='minus',{samples=721,thetaMargin=1e-4,eps=NUMERICAL_POLICY.algebra.regularityTolerance}={}){
  const topology=regularFibreBranches(U,p,eps)
  const roots=topology.singularDirections.finite.map(q=>q.z).filter(finite).sort((a,b)=>a-b)
  const byBranch=topology.branches.map(b=>({...b,regions:[],events:[]}))
  const pts=[]
  for(let i=0;i<samples;i++){
    const theta=-Math.PI/2+thetaMargin+(Math.PI-2*thetaMargin)*i/(samples-1)
    const z=Math.tan(theta),id=branchId(z,roots,topology.infinitySingular,eps)
    if(id===null)continue
    const q=fixedStateSpectralPoint(U,z,p,side,eps)
    if(q.kind==='regular')pts.push({...q,branchId:id,theta})
  }
  for(const branch of byBranch){
    const seq=pts.filter(q=>q.branchId===branch.id).sort((a,b)=>a.theta-b.theta)
    let region=null
    for(let i=0;i<seq.length;i++){
      const q=seq[i]
      if(!region||region.signature!==q.signature){
        if(region)branch.regions.push(region)
        region={signature:q.signature,countSignature:spectralCountSignature(q.spectral),laxClass:laxClass2x2(q.spectral),thetaStart:q.theta,thetaEnd:q.theta,zStart:q.z,zEnd:q.z,sampleCount:1}
      }else{region.thetaEnd=q.theta;region.zEnd=q.z;region.sampleCount++}
      if(i){
        const prev=seq[i-1]
        if(prev.signature!==q.signature){
          for(const target of eventGap(prev,q)){
            const e=refineEvent(U,p,side,prev,q,target,eps)
            branch.events.push({z:e.z,tau:e.tau,Y:e.Y,side:target.side,eigenIndex:target.eigenIndex,signatureBefore:prev.signature,signatureAfter:q.signature})
          }
        }
      }
    }
    if(region)branch.regions.push(region)
  }
  return {kind:'spectral-region-partition',side,branches:byBranch,totalRegions:byBranch.reduce((n,b)=>n+b.regions.length,0),totalEvents:byBranch.reduce((n,b)=>n+b.events.length,0),criterion:'diagnostic-only'}
}

/** Number of real characteristic speeds strictly below s at each endpoint.
 * This is a spectral signature only; it does not impose shock admissibility.
 */
export function spectralCount(position){
  if(position==='below-spectrum')return 0
  if(position==='between')return 1
  if(position==='above-spectrum')return 2
  if(position==='on-slow-characteristic')return 0
  if(position==='on-fast-characteristic')return 1
  return null
}

export function spectralCountSignature(d){
  if(!d||d.kind!=='regular')return {minus:null,plus:null,label:'indefinida'}
  const minus=spectralCount(d.minus.position),plus=spectralCount(d.plus.position)
  return {minus,plus,label:minus===null||plus===null?'indefinida':`(${minus},${plus})`}
}

/** Strict Lax classification for a strictly hyperbolic 2x2 system.
 * For a k-shock, lambda_k(U+) < s < lambda_k(U-) together with the
 * neighbouring-family inequalities is equivalent to
 *   (n_-, n_+) = (k-1, k),
 * where n_± counts characteristic speeds strictly below s.
 * Characteristic boundaries and non-real/non-hyperbolic spectra are left
 * undefined; Liu admissibility is deliberately not tested here.
 */
export function laxClass2x2(d){
  const c=spectralCountSignature(d)
  if(c.minus===null||c.plus===null)return {kind:'undefined',family:null,label:'indefinida'}
  if(c.minus===0&&c.plus===1)return {kind:'lax',family:1,label:'Lax 1'}
  if(c.minus===1&&c.plus===2)return {kind:'lax',family:2,label:'Lax 2'}
  return {kind:'non-lax',family:null,label:'não-Lax'}
}
