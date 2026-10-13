import test from 'node:test'
import assert from 'node:assert/strict'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {hopfAt} from '../src/math/sonic/hopf.js'
import {hopfAtlasAt} from '../src/math/sonic/hopfAtlas.js'

test('projective Hopf atlas agrees with finite-z invariants on both overlap ends',()=>{
 for(const side of ['minus','plus'])for(const zc of [-.995,-.97,-.93,.93,.97,.995]){
  for(const tau of [-.4,0,.4])for(const Y of [-2,0,2]){
   const a=hopfAtlasAt(tau,Y,zc,defaultCoefficients,side)
   const b=hopfAt(tau,Y,zc,defaultCoefficients,side)
   assert.equal(a.kind,b.kind)
   if(a.kind!=='regular')continue
   for(const k of ['trace','det','discriminant']){
    assert.ok(Math.abs(a[k]-b[k])<1e-6*(1+Math.abs(b[k])),`${side} ${zc} ${k}`)
   }
  }
 }
})
test('atlas does not invent finite vertices at the projective endpoints',()=>{
 for(const zc of [-1,1])assert.equal(hopfAtlasAt(0,0,zc,defaultCoefficients,'minus').kind,'outside-chart')
})

test('reciprocal atlas remains finite near both compactified ends for bounded physical fiber', () => {
  for (const side of ['minus', 'plus']) for (const zc of [-0.999999, -0.9999, 0.9999, 0.999999]) {
    // tau=0, Y=0 corresponds to bounded states in this model.
    const h = hopfAtlasAt(0, 0, zc, defaultCoefficients, side)
    assert.equal(h.kind, 'regular', `${side} ${zc}: ${h.kind}`)
    assert.equal(h.chart, 'Z')
    assert.ok([h.trace, h.det, h.discriminant].every(Number.isFinite))
    assert.ok(h.chartResidual < 1e-7)
  }
})

test('reciprocal atlas does not silently fall back to the ill-conditioned finite chart', () => {
  const h = hopfAtlasAt(0, 0, 0.99999, defaultCoefficients, 'minus')
  assert.equal(h.chart, 'Z')
})
