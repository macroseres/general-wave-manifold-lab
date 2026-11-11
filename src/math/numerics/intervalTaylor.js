import * as I from './outwardInterval.js'

/** Truncated ordinary Taylor series, with interval coefficients. */
export function taylorAlgebra(order){
  const constant=x=>[I.interval(x),...Array.from({length:order},()=>I.interval(0))]
  const add=(a,b)=>a.map((c,i)=>I.add(c,b[i]))
  const sub=(a,b)=>a.map((c,i)=>I.sub(c,b[i]))
  const mul=(a,b)=>a.map((_,k)=>{
    let sum=I.interval(0)
    for(let i=0;i<=k;i++)sum=I.add(sum,I.mul(a[i],b[k-i]))
    return sum
  })
  const div=(a,b)=>{
    const result=[]
    for(let k=0;k<=order;k++){
      let residual=a[k]
      for(let j=1;j<=k;j++)residual=I.sub(residual,I.mul(b[j],result[k-j]))
      result.push(I.div(residual,b[0]))
    }
    return result
  }
  const sqrt=a=>{
    const result=[I.sqrt(a[0])]
    for(let k=1;k<=order;k++){
      let residual=a[k]
      for(let j=1;j<k;j++)residual=I.sub(residual,I.mul(result[j],result[k-j]))
      result.push(I.div(residual,I.scale(result[0],2)))
    }
    return result
  }
  return {constant,add,sub,mul,div,sqrt}
}

/** Validated scalar flow. Picard inclusion gives an a priori tube, then
 * Taylor's theorem bounds the remainder using derivatives on that whole tube.
 */
export function validatedScalarFlow(field,initialTime,initialValue,center,{step=.001,order=6}={}){
  if(![initialTime,initialValue,center,step].every(Number.isFinite)||step<=0||
    !Number.isInteger(order)||order<2||order>10)throw new Error('invalid validated flow options')
  const algebra=taylorAlgebra(order),zero=()=>algebra.constant(0)
  const coefficients=(time,value)=>{
    const t=zero(),y=zero()
    t[0]=time;t[1]=I.interval(1);y[0]=value
    for(let k=0;k<order;k++)y[k+1]=I.div(field(algebra,t,y)[k],I.interval(k+1))
    return y
  }
  const advance=(time,value,h)=>{
    const timeRange=I.add(time,I.hull(I.interval(0),h))
    const extent=I.magnitude(h)
    const initialSlope=field(I.intervalAlgebra,timeRange,value)
    let tube=I.add(value,I.interval(-extent*(1+I.magnitude(initialSlope)),extent*(1+I.magnitude(initialSlope))))
    let accepted=false
    for(let attempt=0;attempt<12;attempt++){
      const image=I.add(value,I.mul(I.hull(I.interval(0),h),field(I.intervalAlgebra,timeRange,tube)))
      if(I.interior(tube,image)){accepted=true;break}
      tube=I.add(I.hull(tube,image),I.interval(-extent*.1-1e-14,extent*.1+1e-14))
    }
    if(!accepted)throw new Error('Picard tube not validated')
    const local=coefficients(time,value),remainder=coefficients(timeRange,tube)[order]
    let result=remainder
    for(let k=order-1;k>=0;k--)result=I.add(local[k],I.mul(h,result))
    return {value:result,time:timeRange,tube}
  }
  let time=initialTime,value=I.interval(initialValue),stepSize=step
  const tubes=[]
  while(time!==center){
    const next=Math.abs(center-time)<=stepSize?center:time+Math.sign(center-time)*stepSize
    const h=I.sub(I.interval(next),I.interval(time))
    let result
    try{
      result=advance(I.interval(time),value,h)
      if(result.value[1]-result.value[0]>1.1*(value[1]-value[0])+1e-12)
        throw new Error('Taylor enclosure requires a smaller step')
    }
    catch(error){
      if(stepSize<1e-7)throw new Error(`flow at ${time}, value ${value}: ${error.message}`)
      stepSize/=2
      continue
    }
    tubes.push(result)
    result.startTime=time
    result.startValue=value
    value=result.value;time=next
    stepSize=Math.min(step,stepSize*1.25)
    if(tubes.length>2000)throw new Error('validated flow budget exceeded')
  }
  return {center,value,tubes,
    at:target=>advance(I.interval(center),value,I.sub(target,I.interval(center))),
    sampleAt:target=>{
      const source=tubes.find(tube=>I.contains(tube.time,I.interval(target)))
      return source?advance(I.interval(source.startTime),source.startValue,
        I.sub(I.interval(target),I.interval(source.startTime))).value:
        advance(I.interval(center),value,I.sub(I.interval(target),I.interval(center))).value
    }}
}
