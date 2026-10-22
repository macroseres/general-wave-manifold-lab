import test from 'node:test'
import assert from 'node:assert/strict'
import {buildWavePatternsReference,patterns,coefficients} from '../scripts/wave-patterns-reference.mjs'
import {jacobian,flux} from '../src/math/flux/quadraticFlux.js'
import {rarefactionFieldZ} from '../src/math/rarefaction/field.js'

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,`${a} != ${b}`)

test('exemplo de rarefação: órbita, equação de similaridade, cartas e perfil',()=>{
  const {rarefaction:r}=buildWavePatternsReference()
  assert.equal(r.fan.kind,'rarefaction')
  close(r.fan.xiMin,0);close(r.fan.xiMax,1)
  for(const q of r.curve){
    close(q.v,q.u-3/4);close(q.speed,q.u)
    close(q.tauDot,-3/4);close(q.zDot,0);close(q.mapDet,3/4)
    const J=jacobian([q.u,q.v],coefficients)
    // V'(xi)=(1,1), so (DF(V)-xi I)V'=0 is checked directly.
    close(J[0][0]+J[0][1]-q.u,0)
    close(J[1][0]+J[1][1]-q.u,0)
    const reciprocal=rarefactionFieldZ(q.tau,1,coefficients)
    close(reciprocal.etaDot,3/4);close(reciprocal.ZDot,0)
  }
  for(const q of r.profile){
    const u=Math.max(0,Math.min(1,q.xi))
    close(q.state.u,u);close(q.state.v,u-3/4)
  }
})

test('exemplo de dois choques: estados, conservação, famílias e limitação da carta',()=>{
  const {twoShock:c}=buildWavePatternsReference(),p=coefficients
  c.chain.speeds.forEach((s,i)=>close(s,patterns.twoShock.expectedSpeeds[i]))
  assert.equal(c.evidence.status,'ordered-lax-endpoint-candidate')
  assert.equal(c.chain.entropyCertified,false)
  for(const [left,right,s] of [[c.left,c.middle,.5],[c.middle,c.right,1]]){
    const a=flux(left,p),b=flux(right,p)
    for(let i=0;i<2;i++)close(b[i]-a[i]-s*(right[i]-left[i]),0)
  }
  assert.equal(c.firstLift.kind,'degenerate-fiber')
  assert.equal(c.secondLift.kind,'regular')
  assert.deepEqual(c.profile.map(q=>q.state),[c.left,c.middle,c.middle,c.right,c.right])
  // At the first shock, the raw RH differential still has two independent columns.
  const J=jacobian([2,.5],p),s=.5
  close((J[0][0]-s)*(-1)-0*J[1][0],-1.5)
})
