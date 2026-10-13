import test from 'node:test'
import assert from 'node:assert/strict'
import { inspectSonicPoint } from '../src/math/sonic/pointInspection.js'
import { defaultCoefficients } from '../src/math/quadraticFlux.js'

test('sonic inspection classifies the eigenvalue branch using signed spectral gap',()=>{
  const p=defaultCoefficients
  for(const side of ['minus','plus']){
    const q=inspectSonicPoint({tau:0,Y:0,zc:0,side},p)
    if(q.kind!=='regular')continue
    assert.ok(Math.abs(q.gap-(q.s-q.other))<1e-9)
    assert.equal(q.branch,q.gap< -1e-8?'slow':q.gap>1e-8?'fast':'coincidence')
  }
})
