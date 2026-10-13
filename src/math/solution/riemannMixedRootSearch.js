/** Locate RH incidence zeros on a sampled characteristic segment.
 * A cubic stationary-point probe complements sign-change bisection.
 * The probe is accepted only after a strict residual check: a near miss is not a root.
 */
export function segmentIncidenceRoots(a,b,incidence,{rootTolerance=1e-9}={}){
  const point=t=>[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]
  const value=t=>incidence(point(t))
  const values=[value(0),value(0.5),value(1)]
  const third=value(1/3)
  if(values.some(v=>!Number.isFinite(v))||!Number.isFinite(third))return []
  const scale=1+Math.max(...values.map(Math.abs))
  const tol=rootTolerance*scale
  const roots=[]
  const add=(t,method)=>{
    if(!(t>=0&&t<=1))return
    const residual=Math.abs(value(t))
    if(residual<=tol&&!roots.some(r=>Math.abs(r.t-t)<1e-7))roots.push({t,point:point(t),residual,method})
  }
  for(const t of [0,0.5,1])add(t,'sampled-zero')
  for(let k=0;k<2;k++){
    let lo=k/2,hi=(k+1)/2,fl=values[k],fr=values[k+1]
    if(fl*fr>=0)continue
    for(let j=0;j<52;j++){
      const mid=(lo+hi)/2,fm=value(mid)
      if(!Number.isFinite(fm))break
      if(fl*fm<=0){hi=mid;fr=fm}else{lo=mid;fl=fm}
    }
    add((lo+hi)/2,'sign-change')
  }
  // The RH determinant of a quadratic flux restricted to a straight segment
  // has degree at most three. Recover its coefficients from four samples.
  const [f0,fmid,f1]=values
  const d1=f1-f0,d2=fmid-f0,d3=third-f0
  // q(t)=c3*t^3+c2*t^2+c1*t+f0
  const c3=3*d1-24*d2+27*d3
  const c2=-2.5*d1+32*d2-40.5*d3
  const c1=0.5*d1-8*d2+13.5*d3
  const critical=[]
  if(Math.abs(c3)<1e-12*scale){
    if(Math.abs(c2)>1e-14*scale)critical.push(-c1/(2*c2))
  }else{
    const discriminant=4*c2*c2-12*c3*c1
    if(discriminant>=0){
      const sqrt=Math.sqrt(discriminant)
      critical.push((-2*c2-sqrt)/(6*c3),(-2*c2+sqrt)/(6*c3))
    }
  }
  for(const t of critical)if(t>0&&t<1)add(t,'stationary-probe')
  return roots.sort((x,y)=>x.t-y.t)
}
