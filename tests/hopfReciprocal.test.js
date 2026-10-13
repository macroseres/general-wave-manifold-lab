import test from 'node:test'
import assert from 'node:assert/strict'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {reciprocalHopfAt,reciprocalHopfSection} from '../src/math/sonic/hopfReciprocal.js'
test('reciprocal chart is regular at projective infinity Z=0',()=>{
 for(const side of ['minus','plus'])for(const Z of [-.01,0,.01]){
  const h=reciprocalHopfAt(.5,.3,Z,defaultCoefficients,side)
  assert.equal(h.kind,'regular')
  const A=h.Ubar
  assert.ok(A.every(Number.isFinite))
  assert.ok(Number.isFinite(h.trace)&&Number.isFinite(h.det))
  assert.ok(Math.abs(h.discriminant-(h.trace*h.trace-4*h.det))<1e-9)
 }
})
test('trace-zero reciprocal section is algebraically on Hopf candidate sheet',()=>{
 for(const side of ['minus','plus'])for(const Z of [-.01,0,.01]){
  const d=reciprocalHopfSection(defaultCoefficients,{side,Z})
  if(d.kind!=='sampled')continue
  for(const [free,X] of d.segment){const h=reciprocalHopfAt(free,X,Z,defaultCoefficients,side);assert.ok(Math.abs(h.trace)<1e-8)}
  if(d.positiveExample)assert.ok(d.positiveExample.det>0)
 }
})
