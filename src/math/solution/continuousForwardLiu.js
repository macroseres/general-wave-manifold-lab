import {jacobian} from '../flux/quadraticFlux.js'
import {sonicShockAdmissibility} from './sonicShockAdmissibility.js'

const add=(a,b,scale=1)=>Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]??0)+scale*(b[i]??0))
const multiply=(a,b)=>a.reduce((sum,c,i)=>add(sum,[...Array(i).fill(0),...b.map(d=>c*d)]),[])
const evaluate=(a,t)=>a.reduceRight((sum,c)=>sum*t+c,0)
const choose=(n,k)=>Array.from({length:k},(_,i)=>(n-i)/(i+1)).reduce((a,b)=>a*b,1)

// Bernstein coefficients bound the polynomial on the whole interval. Split
// ambiguous bounds with de Casteljau, including both endpoints in each check.
function polynomialSign(power){
  const degree=power.length-1
  const coefficients=power.map((_,k)=>power.slice(0,k+1)
    .reduce((sum,c,i)=>sum+c*choose(k,i)/choose(degree,i),0))
  const margin=128*Number.EPSILON*power.reduce((sum,c)=>sum+Math.abs(c),0)
  function check(values,depth){
    if(values.every(c=>c>margin))return 'positive'
    if(values[0]<-margin||values.at(-1)<-margin)return 'negative'
    if(depth===0||values.every(c=>Math.abs(c)<=margin))return 'unresolved'
    const left=[values[0]],right=[values.at(-1)]
    while(values.length>1){
      values=values.slice(1).map((c,i)=>(values[i]+c)/2)
      left.push(values[0])
      right.unshift(values.at(-1))
    }
    const a=check(left,depth-1),b=check(right,depth-1)
    return a==='negative'||b==='negative'?'negative':a===b?'positive':'unresolved'
  }
  return check(coefficients,24)
}

/** Continuous Liu bound on a regular projective chart of a quadratic
 * forward Hugoniot arc. Degenerate directions and mismatched arcs stay unresolved.
 */
export function continuousForwardLiu(segment,arc,p){
  const {from,to,family,sonicSide}=segment
  const unresolved={status:'inconclusive'}
  if(sonicSide!=='minus'||arc?.status!=='numerically-connected'||arc.reverse!==false||
    arc.family!==family||arc.points.length<3)return unresolved
  const endpoint=sonicShockAdmissibility(from,to,p,family,sonicSide)
  if(!endpoint.passes)return unresolved

  const jump=to.map((value,i)=>value-from[i])
  const axis=Math.abs(jump[0])>=Math.abs(jump[1])?0:1
  const other=1-axis
  const J=jacobian(from,p)
  const eigenvalue=endpoint.spectrumLeft[family==='slow'?0:1]
  const row=J.map((entries,i)=>entries.map((entry,j)=>entry-(i===j?eigenvalue:0)))
    .sort((a,b)=>Math.abs(b[other])-Math.abs(a[other]))[0]
  if(Math.abs(row[other])<1e-12)return unresolved
  const targetSlope=jump[other]/jump[axis]
  const startSlope=-row[axis]/row[other]
  const span=startSlope-targetSlope
  if(!Number.isFinite(span)||Math.abs(span)<1e-9)return unresolved
  const d=[]
  d[axis]=[1]
  d[other]=[targetSlope,span]
  const linear=J.map(row=>add(d[0].map(c=>c*row[0]),d[1].map(c=>c*row[1])))
  const squareU=multiply(d[0],d[0]),uv=multiply(d[0],d[1]),squareV=multiply(d[1],d[1])
  const quadratic=['a','b'].map(key=>add(add(squareU.map(c=>c*p[key+'20']),uv,p[key+'11']),squareV,p[key+'02']))
  const cross=([u,v])=>add(multiply(d[0],v),multiply(d[1],u),-1)
  const N=cross(linear),D=cross(quadratic)
  const orientation=Math.sign(D[0])
  if(polynomialSign(D.map(c=>c*orientation))!=='positive')return unresolved
  // N has the characteristic root t=1. Its quotient by (1-t) must
  // keep a strict sign, so the arc has no second zero-amplitude point.
  const quotient=[N[0],N[0]+N[1]]
  if(Math.abs(evaluate(N,1))>1e-10*(1+Math.max(...N.map(Math.abs)))||
    polynomialSign(quotient.map(c=>-c*orientation*Math.sign(jump[axis])))!=='positive')return unresolved
  let previous=1
  for(const point of arc.points.slice(1)){
    const r=point[axis]-from[axis]
    const t=((point[other]-from[other])/r-targetSlope)/span
    if(!Number.isFinite(t)||t<-1e-7||t>previous+1e-7||
      Math.abs(r+evaluate(N,t)/evaluate(D,t))>1e-6*(1+Math.abs(r)))return unresolved
    previous=t
  }
  if(Math.abs(previous)>1e-7)return unresolved

  // RH gives r=-N/D and sigma=(Jd)_axis + r Q_axis.
  const numerator=add(multiply(linear[axis],D),multiply(N,quadratic[axis]),-1)
  const speed=numerator[0]/D[0]
  const tolerance=1e-7*(1+Math.abs(speed))
  if(Math.abs(speed-endpoint.speed)>tolerance)return unresolved
  const difference=add(numerator,D,tolerance-speed).map(c=>c*orientation)
  const sign=polynomialSign(difference)
  return {status:sign==='positive'?'continuous-liu-compatible':sign==='negative'?
    'continuous-liu-violation':'inconclusive',speed,tolerance}
}
