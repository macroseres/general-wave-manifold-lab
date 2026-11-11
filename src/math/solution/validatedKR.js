import * as I from '../numerics/outwardInterval.js'
import {taylorAlgebra,validatedScalarFlow} from '../numerics/intervalTaylor.js'

// The same algebraic flux expressions run on intervals, Taylor series and
// interval first derivatives, avoiding finite differences in the root proof.
function spectrum(A,u,v,p){
  const c=A.constant
  const linear=(a,b,d)=>A.add(A.add(A.mul(c(a),u),A.mul(c(b),v)),c(d))
  const a=linear(2*p.a20,p.a11,p.a10),b=linear(p.a11,2*p.a02,p.a01)
  const c0=linear(2*p.b20,p.b11,p.b10),d=linear(p.b11,2*p.b02,p.b01)
  const delta=A.add(A.mul(A.sub(a,d),A.sub(a,d)),A.mul(c(4),A.mul(b,c0)))
  const gap=A.sqrt(delta),trace=A.add(a,d)
  return {a,b,c:c0,d,delta,slow:A.div(A.sub(trace,gap),c(2)),fast:A.div(A.add(trace,gap),c(2))}
}
const slowSlope=p=>(A,v,u)=>{
  const S=spectrum(A,u,v,p)
  return A.div(S.b,A.sub(S.slow,S.a))
}
const fastSlope=p=>(A,u,v)=>{
  const S=spectrum(A,u,v,p)
  return A.div(S.c,A.sub(S.fast,S.d))
}

const dualAlgebra={
  constant:x=>({value:I.interval(x),derivatives:[I.interval(0),I.interval(0)]}),
  add:(a,b)=>({value:I.add(a.value,b.value),derivatives:a.derivatives.map((v,i)=>I.add(v,b.derivatives[i]))}),
  sub:(a,b)=>({value:I.sub(a.value,b.value),derivatives:a.derivatives.map((v,i)=>I.sub(v,b.derivatives[i]))}),
  mul:(a,b)=>({value:I.mul(a.value,b.value),derivatives:a.derivatives.map((v,i)=>
    I.add(I.mul(v,b.value),I.mul(a.value,b.derivatives[i])))}),
  div:(a,b)=>({value:I.div(a.value,b.value),derivatives:a.derivatives.map((v,i)=>
    I.div(I.sub(I.mul(v,b.value),I.mul(a.value,b.derivatives[i])),I.mul(b.value,b.value)))}),
  sqrt:a=>{
    const value=I.sqrt(a.value)
    return {value,derivatives:a.derivatives.map(v=>I.div(v,I.scale(value,2)))}
  },
}
const dual=(value,derivatives)=>({value,derivatives})

function shockMap(A,u,v,z,p){
  const c=A.constant,S=spectrum(A,u,v,p)
  const q=key=>A.add(A.add(A.mul(c(p[key+'20']),A.mul(z,z)),A.mul(c(p[key+'11']),z)),c(p[key+'02']))
  const q1=q('a'),q2=q('b')
  const N=A.sub(A.mul(z,A.add(A.mul(S.c,z),S.d)),A.add(A.mul(S.a,z),S.b))
  const D=A.sub(A.mul(z,q2),q1)
  const r=A.div(A.sub(c(0),N),D)
  const speed=A.add(A.add(A.mul(S.c,z),S.d),A.mul(r,q2))
  return {u:A.add(u,A.mul(r,z)),v:A.add(v,r),speed,S,D,r,q1,q2}
}

function flowAudit(flow,family,p,extra){
  const A=taylorAlgebra(1),checks=[...flow.tubes,extra]
  let minimumDelta=Infinity,minimumGrowth=Infinity
  for(const {time,tube} of checks){
    const t=A.constant(0),y=A.constant(0)
    t[0]=time;t[1]=I.interval(1);y[0]=tube
    const field=family==='slow'?slowSlope(p):fastSlope(p)
    y[1]=field(I.intervalAlgebra,time,tube)
    const S=family==='slow'?spectrum(A,y,t,p):spectrum(A,t,y,p)
    minimumDelta=Math.min(minimumDelta,S.delta[0][0])
    minimumGrowth=Math.min(minimumGrowth,S[family][1][0])
  }
  if(!(minimumDelta>0&&minimumGrowth>0))throw new Error('continuous rarefaction growth not validated')
  return {minimumDelta,minimumGrowth,steps:flow.tubes.length}
}

/** Algebraic Liu proof using the exact characteristic and sonic roots.
 * P(z)=(sigma(z)-lambda_s(K))D(z) is cubic and has roots z0 and zT.
 * Its remaining linear factor is bounded on the entire projective interval.
 */
function validateLiu(u,v,z,p){
  const A=I.intervalAlgebra,S=spectrum(A,u,v,p)
  const z0=I.div(I.sub(S.slow,S.d),S.c)
  const z1=I.div(I.sub(S.fast,S.d),S.c)
  if(!(z[1]<z0[0]))throw new Error('unsupported Hugoniot chart orientation')
  const range=I.hull(z,z0),shock=shockMap(A,u,v,range,p)
  const c3=I.sub(I.mul(I.sub(S.a,S.slow),I.interval(p.b20)),I.mul(S.c,I.interval(p.a20)))
  const c2=I.sub(I.add(I.mul(I.sub(S.a,S.slow),I.interval(p.b11)),I.mul(S.b,I.interval(p.b20))),
    I.add(I.mul(S.c,I.interval(p.a11)),I.mul(I.sub(S.d,S.slow),I.interval(p.a20))))
  const quotient=I.add(I.mul(c3,range),I.add(c2,I.mul(c3,I.add(z0,z))))
  const ratio=I.div(quotient,shock.D)
  // On zT<=z<=z0 the two known root factors have nonpositive product.
  if(!(ratio[1]<0))throw new Error('Liu factor sign not validated')
  // N=c(z-z0)(z-z1). Its second root must be outside the arc.
  if(!(range[1]<z1[0]||range[0]>z1[1]))throw new Error('second characteristic root on shock arc')
  return {status:'validated',factorUpperBound:ratio[1],directionRange:range}
}

function validate(candidate,p){
  if(candidate?.pattern!=='KR'||candidate.segments?.length!==3)throw new Error('unsupported chain')
  const [slow,jump,fast]=candidate.segments
  if(slow.type!=='rarefaction'||slow.family!=='slow'||jump.type!=='shock'||
    jump.family!=='slow'||jump.sonicSide!=='minus'||fast.type!=='rarefaction'||fast.family!=='fast')
    throw new Error('unsupported wave orientation')
  const left=candidate.left,right=candidate.right
  if(![left,right,jump.from,jump.to].every(U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)))
    throw new Error('missing states')
  const same=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===2&&b.length===2&&
    a.every((value,i)=>value===b[i])
  if(!same(slow.from,left)||!same(slow.to,jump.from)||!same(jump.to,fast.from)||!same(fast.to,right)||
    candidate.middle&&!same(candidate.middle,jump.to))
    throw new Error('candidate junctions do not match')
  for(const segment of [slow,fast]){
    const axis=segment.family==='slow'?1:0
    if(!Array.isArray(segment.states)||segment.states.length<2||
      !Array.isArray(segment.speeds)||segment.speeds.length!==segment.states.length||
      !same(segment.states[0],segment.from)||!same(segment.states.at(-1),segment.to)||
      segment.states.some((U,i)=>!Array.isArray(U)||!U.every(Number.isFinite)||
        i>0&&U[axis]<=segment.states[i-1][axis]||
        !Number.isFinite(segment.speeds[i])||i>0&&segment.speeds[i]<segment.speeds[i-1]))
      throw new Error('displayed rarefaction data are incomplete or unordered')
  }
  // Anchor both continuous rarefactions to the exact stored Riemann data.
  const slowFlow=validatedScalarFlow(slowSlope(p),left[1],left[0],jump.from[1])
  const fastFlow=validatedScalarFlow(fastSlope(p),right[0],right[1],jump.to[0])
  const evaluate=parameters=>{
    const [x,z]=parameters
    const slowValue=slowFlow.at(x)
    const u=dual(slowValue.value,[slowSlope(p)(I.intervalAlgebra,x,slowValue.value),I.interval(0)])
    const v=dual(x,[I.interval(1),I.interval(0)])
    const direction=dual(z,[I.interval(0),I.interval(1)])
    const shock=shockMap(dualAlgebra,u,v,direction,p)
    const fastValue=fastFlow.at(shock.u.value)
    const slope=fastSlope(p)(I.intervalAlgebra,shock.u.value,fastValue.value)
    const vf=dual(fastValue.value,shock.u.derivatives.map(d=>I.mul(slope,d)))
    const residual=[dualAlgebra.sub(shock.speed,shock.S.slow),dualAlgebra.sub(shock.v,vf)]
    return {values:residual.map(q=>q.value),jacobian:residual.map(q=>q.derivatives),
      shock,slowValue,fastValue,u:u.value,v:x}
  }
  const center=[jump.from[1],(jump.to[0]-jump.from[0])/(jump.to[1]-jump.from[1])]
  let box=center.map(x=>I.add(I.interval(x),I.interval(-.001,.001)))
  let proven=false,contraction=null
  for(let iteration=0;iteration<8;iteration++){
    const mid=box.map(I.midpoint),base=evaluate(mid.map(x=>I.interval(x))),full=evaluate(box)
    const J=base.jacobian.map(row=>row.map(I.midpoint))
    const determinant=J[0][0]*J[1][1]-J[0][1]*J[1][0]
    if(!Number.isFinite(determinant)||Math.abs(determinant)<1e-8)throw new Error('singular shooting Jacobian')
    const C=[[J[1][1]/determinant,-J[0][1]/determinant],[-J[1][0]/determinant,J[0][0]/determinant]]
    const inverseDeterminant=I.sub(I.mul(I.interval(C[0][0]),I.interval(C[1][1])),
      I.mul(I.interval(C[0][1]),I.interval(C[1][0])))
    if(inverseDeterminant[0]<=0&&inverseDeterminant[1]>=0)
      throw new Error('shooting preconditioner not invertible')
    const sum=values=>values.reduce(I.add,I.interval(0))
    const R=C.map((row,i)=>[0,1].map(j=>I.sub(I.interval(i===j?1:0),
      sum(row.map((c,k)=>I.scale(full.jacobian[k][j],c))))))
    const bound=Math.max(...R.map(row=>sum(row.map(a=>I.interval(I.magnitude(a))))[1]))
    const K=mid.map((m,i)=>I.add(I.sub(I.interval(m),sum(C[i].map((c,j)=>I.scale(base.values[j],c)))),
      sum(R[i].map((r,j)=>I.mul(r,I.sub(box[j],I.interval(mid[j])))))))
    if(!K.every((value,i)=>I.interior(box[i],value))||!(bound<1)){
      if(proven)break
      throw new Error('shooting root not enclosed by Krawczyk')
    }
    proven=true
    contraction=bound
    const next=K.map((value,i)=>[Math.max(value[0],box[i][0]),Math.min(value[1],box[i][1])])
    if(next.every((value,i)=>value[1]-value[0]>.95*(box[i][1]-box[i][0])))break
    box=next
  }
  if(!proven)throw new Error('shooting root not validated')
  const result=evaluate(box),M=[result.shock.u.value,result.shock.v.value]
  const slowAudit=flowAudit(slowFlow,'slow',p,result.slowValue)
  const fastAudit=flowAudit(fastFlow,'fast',p,result.fastValue)
  const speed=result.shock.speed.value,SK=result.shock.S,SM=spectrum(I.intervalAlgebra,...M,p)
  if(!(result.shock.r.value[0]>0&&I.sub(SK.fast.value,speed)[0]>0&&
    I.sub(speed,SM.slow)[0]>0&&I.sub(SM.fast,speed)[0]>0))
    throw new Error('sonic shock endpoint inequalities not validated')
  const gap=I.sub(SM.fast,speed)
  const liu=validateLiu(result.u,result.v,box[1],p)
  if(!(left[1]<box[0][0]&&M[0][1]<right[0]))throw new Error('rarefaction traversal reversed')
  const sampleError=(segment,flow,axis)=>Math.max(...segment.states.map(U=>
    I.magnitude(I.sub(I.interval(U[1-axis]),flow.sampleAt(U[axis])))))
  const endpointError=(point,enclosure)=>Math.max(...point.map((value,i)=>
      I.magnitude(I.sub(I.interval(value),enclosure[i]))))
  const maximumSampleError=Math.max(sampleError(slow,slowFlow,1),sampleError(fast,fastFlow,0))
  if(maximumSampleError>1e-4)throw new Error('displayed rarefaction samples do not match validated curves')
  const sonicStateError=endpointError(jump.from,[result.u,result.v])
  const middleStateError=endpointError(jump.to,M)
  if(sonicStateError>1e-4||middleStateError>1e-4||!Number.isFinite(jump.speed)||
    I.magnitude(I.sub(I.interval(jump.speed),speed))>1e-4)
    throw new Error('displayed states or shock speed do not match the root enclosure')
  return {status:'validated',criterion:'Liu',parameters:box,
    sonicState:[result.u,result.v],middleState:M,speed,
    slow:slowAudit,fast:fastAudit,liu,minimumWaveGap:gap[0],contraction,
    maximumSampleError,
    sonicStateError,middleStateError,selfSimilarAssembly:'validated',
    method:'outward-rounded Taylor flow, Krawczyk root enclosure and algebraic Liu factor',
    exactData:'stored binary64 coefficients and Riemann states'}
}

const cache=new WeakMap()
export function validatedKR(candidate,p){
  const key=JSON.stringify([p,candidate?.left,candidate?.right,candidate?.segments])
  const previous=candidate&&cache.get(candidate)
  if(previous?.key===key)return previous.result
  let result
  try{result=validate(candidate,p)}
  catch(error){result={status:'unresolved',reason:error.message}}
  if(candidate&&typeof candidate==='object')cache.set(candidate,{key,result})
  return result
}
