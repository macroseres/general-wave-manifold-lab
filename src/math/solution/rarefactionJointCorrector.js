import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'

const norm = v => Math.hypot(...v)
const sub = (a,b) => [a[0]-b[0],a[1]-b[1]]
const add = (a,v,h) => [a[0]+h*v[0],a[1]+h*v[1]]
const finite = p => Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)
const coords = p => Array.isArray(p)?p:[p?.u,p?.v]

/** Integrate an oriented characteristic from its original anchor.
 * Length is a numerical arclength parameter; never extrapolate beyond the sampled branch.
 */
export function integrateCharacteristicLength(branch,p,length,{step=0.01}={}){
  const points=branch?.points?.map(coords)
  if(!points?.length||!points.every(finite)||!Number.isFinite(length)||length<0||!(step>0))return null
  const start=points[0]
  if(length===0)return [...start]
  if(points.length<2)return null
  const first=sub(points[1],start),n=norm(first)
  if(n<=1e-14)return null
  let U=[...start],ref=first.map(x=>x/n)
  const count=Math.ceil(length/step),h=length/count
  const field=(q,r)=>stateCharacteristicDirection(q,p,branch.family,r)?.direction
  for(let k=0;k<count;k++){
    const k1=field(U,ref);if(!k1)return null
    const k2=field(add(U,k1,h/2),k1);if(!k2)return null
    const k3=field(add(U,k2,h/2),k2);if(!k3)return null
    const k4=field(add(U,k3,h),k3);if(!k4)return null
    U=[U[0]+h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,
       U[1]+h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6]
    if(!finite(U))return null
    ref=k4
  }
  return U
}

export function sampledArcLength(branch,index){
  const pts=branch?.points?.map(coords)
  if(!pts?.length||!pts.every(finite)||!Number.isFinite(index)||index<0||index>pts.length-1)return null
  const whole=Math.floor(index),fraction=index-whole
  let length=0
  for(let i=1;i<=whole;i++)length+=norm(sub(pts[i],pts[i-1]))
  if(fraction>0&&whole+1<pts.length)length+=fraction*norm(sub(pts[whole+1],pts[whole]))
  return length
}

/** Damped Newton on two independently reintegrated characteristic curves.
 * Returns a numerical candidate, not a rigorous error or entropy certificate.
 */
export function refineRarefactionIntersection(leftBranch,rightBranch,p,leftIndex,rightIndex,options={}){
  const {integrationStep=0.01,residualTolerance=1e-8,maxIterations=20,parameterTolerance=1e-10}=options
  const maxA=sampledArcLength(leftBranch,leftBranch?.points?.length-1)
  const maxB=sampledArcLength(rightBranch,rightBranch?.points?.length-1)
  let a=sampledArcLength(leftBranch,leftIndex),b=sampledArcLength(rightBranch,rightIndex)
  if(![a,b,maxA,maxB].every(Number.isFinite)||a<0||b<0||maxA<=0||maxB<=0)return {status:'invalid-input'}
  const evaluate=(x,y)=>{
    const L=integrateCharacteristicLength(leftBranch,p,x,{step:integrationStep})
    const R=integrateCharacteristicLength(rightBranch,p,y,{step:integrationStep})
    return L&&R?{L,R,residual:sub(L,R),error:norm(sub(L,R))}:null
  }
  for(let iteration=0;iteration<maxIterations;iteration++){
    const cur=evaluate(a,b)
    if(!cur)return {status:'integration-failed'}
    if(cur.error<=residualTolerance*(1+norm(cur.L)+norm(cur.R)))
      return {status:'refined-candidate',middle:cur.L,otherMiddle:cur.R,
        parameters:[a,b],residual:cur.error,iterations:iteration,entropyCertified:false}
    const left=stateCharacteristicDirection(cur.L,p,leftBranch.family)
    const right=stateCharacteristicDirection(cur.R,p,rightBranch.family)
    if(!left||!right)return {status:'non-strict-hyperbolicity'}
    const dA=left.direction,dB=right.direction
    const sampledA=sub(coords(leftBranch.points[1]),coords(leftBranch.points[0]))
    const sampledB=sub(coords(rightBranch.points[1]),coords(rightBranch.points[0]))
    const signA=dA[0]*sampledA[0]+dA[1]*sampledA[1]<0?-1:1
    const signB=dB[0]*sampledB[0]+dB[1]*sampledB[1]<0?-1:1
    const x=[signA*dA[0],signA*dA[1]],y=[-signB*dB[0],-signB*dB[1]]
    const det=x[0]*y[1]-x[1]*y[0]
    if(Math.abs(det)<1e-9)return {status:'ill-conditioned-intersection'}
    const da=(-cur.residual[0]*y[1]+cur.residual[1]*y[0])/det
    const db=(-x[0]*cur.residual[1]+x[1]*cur.residual[0])/det
    if(Math.max(Math.abs(da),Math.abs(db))<parameterTolerance)return {status:'stagnation',residual:cur.error}
    let accepted=false
    for(let k=0;k<24;k++){
      const factor=2**(-k),na=a+factor*da,nb=b+factor*db
      if(na<0||nb<0||na>maxA||nb>maxB)continue
      const next=evaluate(na,nb)
      if(next&&next.error<cur.error*(1-1e-4*factor)){a=na;b=nb;accepted=true;break}
    }
    if(!accepted)return {status:'line-search-failed',residual:cur.error}
  }
  return {status:'iteration-limit'}
}
