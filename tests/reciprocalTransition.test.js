import test from 'node:test'
import assert from 'node:assert/strict'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {toReciprocal,fromReciprocal} from '../src/math/charts/reciprocalTransition.js'
import {reciprocalHopfAt} from '../src/math/sonic/hopfReciprocal.js'
import {hopfAt} from '../src/math/sonic/hopf.js'
import {zcFromZ} from '../src/math/charts/zChart.js'
const p=defaultCoefficients
const near=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`)
test('projective overlap preserves both states, shock speed, and amplitudes',()=>{
 for(const z of [-15,-3,-.5,.5,3,15])for(const tau of [-.2,0,.4])for(const Y of [-1,0,.7]){
  const a=toReciprocal(tau,Y,z,p);assert.equal(a.kind,'regular')
  near(a.X,z*Y);near(a.Z,1/z)
  const b=fromReciprocal(a.free,a.X,a.Z,p);assert.equal(b.kind,'regular')
  near(b.tau,tau);near(b.Y,Y);near(b.z,z);near(b.projectionResidual,0)
  for(const k of ['Ubar','Um','Up'])for(let i=0;i<2;i++)near(a[k][i],b[k][i])
  near(a.s,b.s)
 }
})
test('Hopf invariants agree across projective overlap',()=>{
 for(const z of [-12,-2,2,12])for(const side of ['minus','plus']){
  const a=toReciprocal(.1,.4,z,p);assert.equal(a.kind,'regular')
  const h=reciprocalHopfAt(a.free,a.X,a.Z,p,side)
  const k=hopfAt(.1,.4,zcFromZ(z),p,side)
  assert.equal(k.kind,'regular');near(h.trace,k.trace);near(h.det,k.det)
 }
})
test('reciprocal chart covers Z=0 without inventing finite-z coordinates',()=>{
 assert.equal(fromReciprocal(0,1,0,p).kind,'outside-overlap')
 assert.equal(toReciprocal(0,1,0,p).kind,'outside-overlap')
 assert.equal(reciprocalHopfAt(0,1,0,p,'minus').kind,'regular')
})
