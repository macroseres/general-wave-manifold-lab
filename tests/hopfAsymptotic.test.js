import test from 'node:test'
import assert from 'node:assert/strict'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {hopfAt} from '../src/math/sonic/hopf.js'
import {hopfSliceDiagnostic,hopfEndDiagnostics} from '../src/math/sonic/hopfAsymptotic.js'
test('diagnostic respects exact trace zero on clipped segment',()=>{
  for(const side of ['minus','plus'])for(const zc of [-.9,-.4,0,.4,.9]){
    const d=hopfSliceDiagnostic(defaultCoefficients,{side,zc})
    if(d.kind!=='sampled')continue
    for(const [tau,Y] of d.segment){
      assert.ok(tau>=-1-1e-8&&tau<=1+1e-8)
      assert.ok(Y>=-6-1e-8&&Y<=6+1e-8)
      assert.ok(Math.abs(hopfAt(tau,Y,zc,defaultCoefficients,side).trace)<1e-6)
    }
    if(d.positiveExample){const {tau,Y,det}=d.positiveExample;assert.ok(det>0);assert.ok(Math.abs(hopfAt(tau,Y,zc,defaultCoefficients,side).trace)<1e-6)}
  }
})
test('endpoint audit visits both ends and both sonic sides',()=>{
  const rows=hopfEndDiagnostics(defaultCoefficients,{margins:[.1,.01,.001]})
  assert.equal(rows.length,12)
  assert.ok(rows.every(r=>r.kind==='sampled'||r.kind==='outside-window'||r.kind==='trace-no-zero'||r.kind==='trace-identically-zero'||r.kind==='invalid-chart'||r.kind==='numerical-failure'))
})
