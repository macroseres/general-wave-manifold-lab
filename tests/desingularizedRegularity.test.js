import test from 'node:test'
import assert from 'node:assert/strict'
import {desingularizedRegularity} from '../src/math/manifold/desingularizedRegularity.js'
import {oldWavePreset} from '../src/math/flux/quadraticFlux.js'
const p=oldWavePreset()
const close=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<tol,`${a} vs ${b}`)
test('desingularized residual does not vanish automatically on zero jump',()=>{
  const d=desingularizedRegularity([1,2],0,.3,0,p)
  assert.equal(d.characteristicBoundary,true)
  assert.ok(Math.hypot(...d.residual)>1e-5)
  assert.equal(d.onManifold,false)
  assert.equal(d.regularLevelSet,false)
})
test('finite and reciprocal charts have identical zero sets on overlap',()=>{
  const a=desingularizedRegularity([.3,-.4],.7,2,1.1,p,'finite')
  const b=desingularizedRegularity([.3,-.4],1.4,.5,1.1,p,'reciprocal')
  a.residual.forEach((v,i)=>close(v,2*b.residual[i]))
  assert.equal(a.rank,b.rank)
})
test('reciprocal chart is defined at z=0 (infinite finite-chart slope)',()=>{
  const d=desingularizedRegularity([0,0],0,0,0,p,'reciprocal')
  assert.equal(d.residual.length,2)
  assert.ok(d.differential.flat().every(Number.isFinite))
})
test('desingularized differential agrees with centered finite differences in both charts',()=>{
  for(const chart of ['finite','reciprocal']){
    const x=[.3,-.2,.8,.4,1.1],h=1e-6
    const base=desingularizedRegularity(x.slice(0,2),x[2],x[3],x[4],p,chart)
    for(let j=0;j<5;j++){
      const evalAt=delta=>{const y=[...x];y[j]+=delta;return desingularizedRegularity(y.slice(0,2),y[2],y[3],y[4],p,chart).residual}
      const plus=evalAt(h),minus=evalAt(-h)
      for(let i=0;i<2;i++)close((plus[i]-minus[i])/(2*h),base.differential[i][j])
    }
  }
})
test('regularity and fibre dimensions are only certified on G=0',()=>{
  const d=desingularizedRegularity([1,2],.7,.4,1.1,p)
  assert.equal(d.regularLevelSet,false)
  assert.equal(d.forwardFibreDimension,null)
  assert.equal(d.backwardFibreDimension,null)
})
