import {discriminantPolynomial} from '../flux/affineClassification.js'
import {classifyConic} from '../flux/conicClassification.js'

/** Algebraic samples for conic components missed by sign-change contours.
 * Samples are restricted to the displayed rectangle; they do not certify
 * that a projective characteristic direction lifts to a regular point of W.
 */
export function sampleDegenerateConic(p, window, {steps=32,tolerance=1e-9}={}) {
  const q=discriminantPolynomial(p), classification=classifyConic(q,tolerance)
  const {uMin,uMax,vMin,vMax}=window
  const points=[], lines=[]
  const type=classification.type
  const add=(u,v)=>{if(Number.isFinite(u)&&Number.isFinite(v)&&u>=uMin&&u<=uMax&&v>=vMin&&v<=vMax)points.push([u,v])}
  if(type==='identicamente nulo'){
    for(let j=0;j<=steps;j++)for(let i=0;i<=steps;i++)add(uMin+(uMax-uMin)*i/steps,vMin+(vMax-vMin)*j/steps)
    return {type,points,components:['plano inteiro'],complete:false}
  }
  if(!['reta dupla','duas retas paralelas','reta'].includes(type))return {type,points,components:[],complete:false}
  const {u2,uv,v2,u,v,c}=q
  if(type==='reta'){
    lines.push({normal:[u,v],offset:c})
  }else{
    // Rank-one quadratic Q=lambda*n*n^T, with n unit length.
    const Q=[[u2,uv/2],[uv/2,v2]]
    const col=Math.hypot(Q[0][0],Q[1][0])>=Math.hypot(Q[0][1],Q[1][1])?[Q[0][0],Q[1][0]]:[Q[0][1],Q[1][1]]
    const norm=Math.hypot(...col)
    if(norm===0)return {type,points,components:[],complete:false}
    const n=col.map(x=>x/norm)
    const lambda=n[0]*(Q[0][0]*n[0]+Q[0][1]*n[1])+n[1]*(Q[1][0]*n[0]+Q[1][1]*n[1])
    const beta=u*n[0]+v*n[1]
    const vertex=-beta/(2*lambda), discriminant=beta*beta-4*lambda*c
    const distance=Math.sqrt(Math.max(0,discriminant))/(2*Math.abs(lambda))
    const roots=type==='reta dupla'?[vertex]:[vertex-distance,vertex+distance]
    for(const offset of roots)lines.push({normal:n,offset:-offset})
  }
  for(const {normal:[a,b],offset} of lines){
    if(Math.abs(a)>=Math.abs(b)){
      for(let j=0;j<=steps;j++){const v=vMin+(vMax-vMin)*j/steps;add((-offset-b*v)/a,v)}
    }else{
      for(let i=0;i<=steps;i++){const u=uMin+(uMax-uMin)*i/steps;add(u,(-offset-a*u)/b)}
    }
  }
  return {type,points,components:lines.map(({normal,offset})=>({normal,offset})),complete:false}
}
