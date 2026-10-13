/**
 * Geometry adapter for strict-Lax segmentation of fixed-state Hugoniot fibres.
 *
 * Mathematical classification is owned by src/math/state/hugoniotSpectralRegions.js.
 * This module only transfers that classification to already sampled geometry.
 */
import { fixedStateSpectralPoint, laxClass2x2 } from '../../math/state/hugoniotSpectralRegions.js'

const keyOf = c => c.kind==='lax' ? `lax-${c.family}` : c.kind

export function classifyHugoniotPoint(U,p,side,q){
  if(!q||!Number.isFinite(q.z))return {kind:'undefined',family:null,label:'indefinida'}
  const s=fixedStateSpectralPoint(U,q.z,p,side)
  return s.kind==='regular' ? laxClass2x2(s.spectral) : {kind:'undefined',family:null,label:'indefinida'}
}

/** Split display polylines whenever the strict-Lax class changes.
 * The same boundary point is shared by adjacent pieces, so visualization does
 * not create a geometric gap. Forward/backward identity is kept in `side` and
 * is independent of Lax family.
 */
export function hugoniotLaxSegments(segments,U,p,side){
  const out=[]
  for(const points of segments||[]){
    let current=[],currentClass=null
    const flush=()=>{if(current.length>1)out.push({points:current,laxClass:currentClass,side});current=[]}
    for(const q of points){
      const c=classifyHugoniotPoint(U,p,side,q),k=keyOf(c)
      if(currentClass&&keyOf(currentClass)!==k){
        const boundary=current.at(-1)
        flush()
        if(boundary)current=[boundary]
      }
      currentClass=c
      current.push(q)
    }
    flush()
  }
  return out
}

export function hugoniotLaxGeometry(fibre,U,p){
  const finiteMinus=hugoniotLaxSegments(fibre?.minus,U,p,'minus')
  const finitePlus=hugoniotLaxSegments(fibre?.plus,U,p,'plus')
  const reciprocalMinus=hugoniotLaxSegments(fibre?.reciprocal?[fibre.reciprocal.minus.negative,fibre.reciprocal.minus.positive]:[],U,p,'minus')
  const reciprocalPlus=hugoniotLaxSegments(fibre?.reciprocal?[fibre.reciprocal.plus.negative,fibre.reciprocal.plus.positive]:[],U,p,'plus')
  return {minus:[...finiteMinus,...reciprocalMinus],plus:[...finitePlus,...reciprocalPlus]}
}
