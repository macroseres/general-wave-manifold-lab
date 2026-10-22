import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'

export function dispersiveReference({nu=1,delta=2,A=2}={}) {
  const k=1/Math.sqrt(2*delta),c=2*nu/(3*Math.sqrt(2*delta)),B=c-A
  if(!(nu>0&&delta>0&&A>2*c))throw new Error('Require nu>0, delta>0 and A>2c')
  const speed=A*A+A*B+B*B
  const profile=z=>{
    const t=Math.tanh(k*(A-B)*z/2),w=c/2-(A-B)*t/2
    const derivative=-k*(A-B)**2*(1-t*t)/4
    const second=k*k*(A-B)**3*t*(1-t*t)/4
    return {w,derivative,second}
  }
  return {nu,delta,A,B,k,c,speed,profile}
}

export function verifyTraditionalReference() {
  let checked=0
  const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*(1+Math.abs(a)+Math.abs(b)))
  for(const options of [{},{nu:.4,delta:.5,A:3},{nu:2,delta:3,A:4}]){
    const r=dispersiveReference(options),{A,B,nu,delta,speed}=r
    close(B**3-A**3,speed*(B-A))
    assert.ok(3*A*A>speed&&3*B*B>speed)
    const production=3*(B**4-A**4)/4-speed*(B*B-A*A)/2
    close(production,(A+B)*(B-A)**3/4)
    assert.ok(production<0)
    for(let i=-30;i<=30;i++){
      const {w,derivative,second}=r.profile(i/10)
      close(delta*second+nu*derivative,w**3-A**3-speed*(w-A))
      checked++
    }
    close(r.profile(-100).w,A);close(r.profile(100).w,B)
  }
  return {profiles:3,profilePoints:checked,qualification:'identity checks; no global solver or exhaustive heteroclinic classification'}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(verifyTraditionalReference(),null,2))
