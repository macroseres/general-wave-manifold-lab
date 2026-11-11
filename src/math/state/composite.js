/**
 * Canonical composite-wave construction boundary.
 *
 * K_- is obtained from the forward saturation and the non-trivial minus
 * sonic sheet; K_+ is obtained from the backward saturation and the
 * non-trivial plus sonic sheet.
 *
 * This module defines the construction and membership residual only.  It
 * deliberately does not mesh a saturation or trace a composite curve.
 */
import { sonicImplicit } from '../sonic/sonic.js'
import { waveState } from '../manifold/waveState.js'
import { rarefactionField } from '../rarefaction/field.js'
import { zFromZc,zcFromZ } from '../charts/zChart.js'

/** Solve D(Phi_-, pi_-) Q' = (0, D pi_- R) on the regular sheet. */
export function regularMinusCompositeDirection(P,Q,p,{checkEquilibrium=false}={}){
  const zc=zcFromZ(P.z)
  const field=rarefactionField(P.tau,P.z,p)
  if(field.kind!=='regular')return null
  const velocity=Math.hypot(field.tauDot,field.zcDot)
  if(!Number.isFinite(velocity)||(checkEquilibrium?velocity>1e-8:velocity===0))return null
  const scale=velocity||1
  const h=1e-5
  const source=[-1,1].map(sign=>waveState(P.tau+sign*h*field.tauDot/scale,0,zFromZc(zc+sign*h*field.zcDot/scale),p))
  if(source.some(q=>q.kind!=='regular'))return null
  const columns=[Q.tau,Q.Y,zcFromZ(Q.z)].map((_,axis,base)=>{
    const values=[-1,1].map(sign=>{
      const [tau,Y,zc]=base.map((v,i)=>v+(axis===i?sign*h:0))
      const z=zFromZc(zc),state=waveState(tau,Y,z,p)
      return state.kind==='regular'?[sonicImplicit(tau,Y,z,p,'minus'),...state.Um]:[]
    })
    return values[1].map((v,i)=>(v-values[0][i])/(2*h))
  })
  const [normal,u,v]=[0,1,2].map(i=>columns.map(column=>column[i]))
  if(![...normal,...u,...v].every(Number.isFinite))return null
  const cross=([a,b,c],[d,e,f])=>[b*f-c*e,c*d-a*f,a*e-b*d]
  const uxv=cross(u,v),det=normal.reduce((sum,n,i)=>sum+n*uxv[i],0)
  if(Math.abs(det)<=1e-7*Math.hypot(...normal)*Math.hypot(...u)*Math.hypot(...v))return null
  if(checkEquilibrium)return [0,0,0]
  const [du,dv]=source[1].Um.map((value,i)=>(value-source[0].Um[i])/(2*h))
  const direction=cross(v,normal).map((value,i)=>(du*value+dv*cross(normal,u)[i])/det)
  return direction.every(Number.isFinite)&&Math.hypot(...direction)>1e-9?direction:null
}

export const COMPOSITE_CONSTRUCTIONS = Object.freeze({
  minus: Object.freeze({
    key: 'minus',
    symbol: 'K_-',
    saturation: 'forward',
    inverseProjection: 'minus',
    sonicSide: 'minus',
  }),
  plus: Object.freeze({
    key: 'plus',
    symbol: 'K_+',
    saturation: 'backward',
    inverseProjection: 'plus',
    sonicSide: 'plus',
  }),
})

export function compositeConstruction(side) {
  const q = COMPOSITE_CONSTRUCTIONS[side]
  if (!q) throw new Error(`unknown composite side: ${side}`)
  return q
}

/** Residual for the non-trivial sonic sheet used by K_side. */
export function compositeSonicResidual(P, p, side) {
  const q = compositeConstruction(side)
  if (!P || !Number.isFinite(P.tau) || !Number.isFinite(P.Y) || !Number.isFinite(P.z)) return Infinity
  const value = sonicImplicit(P.tau, P.Y, P.z, p, q.sonicSide)
  return Number.isFinite(value) ? Math.abs(value) : Infinity
}

export function isOnCompositeSonicSheet(P, p, side, tolerance = 1e-8) {
  return compositeSonicResidual(P, p, side) <= tolerance
}
