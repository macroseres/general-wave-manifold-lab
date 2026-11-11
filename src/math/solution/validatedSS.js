import * as I from '../numerics/outwardInterval.js'

const {interval:c,add,sub,mul,div,scale}=I
const sum=values=>values.reduce(add,c(0))
const difference=(a,b)=>a.map((x,i)=>sub(x,b[i]))
const cross=(a,b)=>sub(mul(a[0],b[1]),mul(a[1],b[0]))
const excludesZero=a=>a[0]>0||a[1]<0
const evaluate=(coefficients,z)=>coefficients.reduceRight((acc,x)=>add(x,mul(z,acc)),c(0))

function fluxRow(u,v,a,b,d,e,f){
  return sum([scale(mul(u,u),a),scale(mul(u,v),b),scale(mul(v,v),d),scale(u,e),scale(v,f)])
}
const flux=([u,v],p)=>[
  fluxRow(u,v,p.a20,p.a11,p.a02,p.a10,p.a01),
  fluxRow(u,v,p.b20,p.b11,p.b02,p.b10,p.b01),
]
const jacobian=([u,v],p)=>[
  [sum([scale(u,2*p.a20),scale(v,p.a11),c(p.a10)]),sum([scale(u,p.a11),scale(v,2*p.a02),c(p.a01)])],
  [sum([scale(u,2*p.b20),scale(v,p.b11),c(p.b10)]),sum([scale(u,p.b11),scale(v,2*p.b02),c(p.b01)])],
]

function encloseMiddle(left,seed,right,p){
  const fl=flux(left,p),fr=flux(right,p)
  // Reversing the second jump keeps its determinant equation unchanged.
  const equations=middle=>{
    const fm=flux(middle,p),J=jacobian(middle,p)
    const jumps=[difference(middle,left),difference(middle,right)]
    const fluxJumps=[difference(fm,fl),difference(fm,fr)]
    return {residual:jumps.map((d,i)=>cross(d,fluxJumps[i])),
      derivative:jumps.map((d,i)=>[0,1].map(j=>add(
        cross(j===0?[c(1),c(0)]:[c(0),c(1)],fluxJumps[i]),cross(d,[J[0][j],J[1][j]]))))}
  }
  const center=seed.map(x=>c(x)),initial=center.map(x=>add(x,c(-1e-5,1e-5)))
  const atCenter=equations(center)
  const [[a,b],[d,e]]=atCenter.derivative.map(row=>row.map(I.midpoint))
  const det=a*e-b*d
  const C=[[e/det,-b/det],[-d/det,a/det]].map(row=>row.map(x=>c(x)))
  if(!excludesZero(cross(C[0],C[1])))return null
  let box=initial
  for(let iteration=0;iteration<4;iteration++){
    const {derivative}=equations(box.map((x,i)=>I.hull(x,center[i])))
    const remainder=C.map((row,i)=>[0,1].map(j=>sub(c(i===j?1:0),
      sum(row.map((x,k)=>mul(x,derivative[k][j]))))))
    const image=center.map((x,i)=>add(sub(x,sum(C[i].map((y,j)=>mul(y,atCenter.residual[j])))),
      sum(remainder[i].map((y,j)=>mul(y,sub(box[j],center[j]))))))
    if(!image.every((x,i)=>I.interior(box[i],x)))return iteration===0?null:box
    box=image
  }
  return box
}

function spectrum([[a,b],[d,e]]){
  const difference=sub(a,e)
  const gap=I.sqrt(add(mul(difference,difference),scale(mul(b,d),4)))
  const trace=add(a,e)
  return [scale(sub(trace,gap),.5),scale(add(trace,gap),.5)]
}

function checkShock(left,right,family,p){
  const jump=difference(right,left)
  const end=div(jump[0],jump[1])
  const speed=div(sub(flux(right,p)[1],flux(left,p)[1]),jump[1])
  const J=jacobian(left,p),L=spectrum(J),R=spectrum(jacobian(right,p))
  const other=1-family
  const transverse=family===0?[sub(L[other],speed),sub(R[other],speed)]:
    [sub(speed,L[other]),sub(speed,R[other])]
  if([sub(L[family],speed),sub(speed,R[family]),...transverse].some(x=>x[0]<=0))return null

  const [[a,b],[d,e]]=J
  const start=div(sub(L[family],e),d)
  const otherRoot=div(sub(L[other],e),d)
  const range=I.hull(start,end)
  const direction=sub(start,end)
  if(!excludesZero(direction)||!(otherRoot[1]<range[0]||otherRoot[0]>range[1]))return null
  const denominator=[c(-p.a02),sub(c(p.b02),c(p.a11)),sub(c(p.b11),c(p.a20)),c(p.b20)]
  // Bound the denominator throughout the chart, including its endpoints.
  let denominatorSign
  for(let i=0;i<32;i++){
    const slice=add(c(range[0]),mul(sub(c(range[1]),c(range[0])),c(i/32,(i+1)/32)))
    const value=evaluate(denominator,slice)
    if(!excludesZero(value)||denominatorSign&&Math.sign(value[0])!==denominatorSign)return null
    denominatorSign=Math.sign(value[0])
  }
  // RH makes the numerator of sigma(z)-speed vanish exactly at z=end.
  const A=sub(a,speed),E=sub(e,speed)
  const cubic=sub(scale(A,p.b20),scale(d,p.a20))
  const quadratic=sub(add(scale(A,p.b11),scale(b,p.b20)),add(scale(d,p.a11),scale(E,p.a20)))
  const linear=sub(add(scale(A,p.b02),scale(b,p.b11)),add(scale(d,p.a02),scale(E,p.a11)))
  const q1=add(quadratic,mul(end,cubic)),q0=add(linear,mul(end,q1))
  const q=[q0,q1,cubic]
  const atStart=evaluate(q,start),atEnd=evaluate(q,end)
  // The three Bernstein coefficients enclose the quadratic on [start,end].
  const inner=add(atStart,scale(mul(sub(end,start),add(q1,scale(mul(cubic,start),2))),.5))
  const sign=Math.sign(direction[0])*denominatorSign
  if([atStart,inner,atEnd].some(value=>scale(value,sign)[0]<=0))return null
  return speed
}

/** Validate the exact two-shock chain near a sampled SS candidate, treating
 * the stored binary64 flux and initial states as exact input data. */
export function validatedSS(candidate,p){
  if(candidate?.kind!=='two-shock'||candidate.status!=='sampled-candidate'||candidate.states?.length!==3)return null
  try{
    const [left,,right]=candidate.states.map(state=>state.map(x=>c(x)))
    const middleState=encloseMiddle(left,candidate.states[1],right,p)
    if(!middleState)return null
    const slow=checkShock(left,middleState,0,p),fast=checkShock(middleState,right,1,p)
    if(!slow||!fast)return null
    const gap=sub(fast,slow)
    if(gap[0]<=0)return null
    return {status:'validated',pattern:'SS',middleState,speeds:[slow,fast],minimumWaveGap:gap[0]}
  }catch{
    return null
  }
}
