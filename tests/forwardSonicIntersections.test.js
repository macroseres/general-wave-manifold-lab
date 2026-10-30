import test from 'node:test'
import assert from 'node:assert/strict'
import {boundedPolynomialRoots,forwardSonicIntersections} from '../src/geometry/state/forwardSonicIntersections.js'
import {defaultCoefficients as p} from '../src/math/flux/quadraticFlux.js'
import {sonicImplicit} from '../src/math/sonic/sonic.js'
import {waveState,rhResidual} from '../src/math/manifold/waveState.js'
import {seededRarefactionCurves} from '../src/geometry/state/seededRarefactionCurves.js'

test('root isolation includes zero, two, four and even-multiplicity tangencies',()=>{
  assert.deepEqual(boundedPolynomialRoots([1,0,1]),[])
  for(const [polynomial,expected] of [[[-.25,0,1],[-.5,.5]],[[.0576,0,-.73,0,1],[-.8,-.3,.3,.8]],[[.0625,0,-.5,0,1],[-.5,.5]]]){
    const roots=boundedPolynomialRoots(polynomial)
    assert.equal(roots.length,expected.length)
    roots.forEach((x,i)=>assert.ok(Math.abs(x-expected[i])<1e-8))
  }
})
test('all isolated forward S-minus roots preserve UL and satisfy sonic and RH equations',()=>{
  for(const U of [[.5,-1],[.4895,-.3109],[-.4,.7]]){
    const report=forwardSonicIntersections(U,p)
    if(U[0]<0)assert.equal(report.points.length,0)
    else assert.ok(report.points.length)
    for(const q of report.points){
      const w=waveState(q.tau,q.Y,q.z,p)
      assert.ok(Math.abs(sonicImplicit(q.tau,q.Y,q.z,p,'minus'))<1e-7)
      assert.ok(Math.hypot(...w.Um.map((v,i)=>v-U[i]))<1e-7)
      assert.ok(rhResidual(w,p)<1e-7)
    }
  }
})
test('known terminal composite junction belongs to the enumerated intersections without duplication',()=>{
  const U=[.5,-1],junction=seededRarefactionCurves({left:U},p,-1,1).find(q=>q.kind==='nonlocal').junction
  const points=forwardSonicIntersections(U,p).points
  assert.equal(points.filter(q=>Math.hypot(q.tau-junction.tau,q.Y-junction.Y,q.zc-junction.zc)<1e-6).length,1)
  assert.equal(forwardSonicIntersections(null,p).status,'missing-state')
})


test('forward S-plus enumeration uses the plus sonic equation and preserves the same fixed UL',()=>{
  const U=[.4895,-.3109],report=forwardSonicIntersections(U,p,'plus')
  assert.equal(report.sonicSide,'plus')
  assert.ok(report.points.length)
  for(const q of report.points){
    const w=waveState(q.tau,q.Y,q.z,p)
    assert.ok(Math.abs(sonicImplicit(q.tau,q.Y,q.z,p,'plus'))<1e-7)
    assert.ok(Math.hypot(...w.Um.map((v,i)=>v-U[i]))<1e-7)
    assert.ok(rhResidual(w,p)<1e-7)
    assert.ok(q.id.includes('plus'))
  }
  assert.equal(forwardSonicIntersections(null,p,'plus').sonicSide,'plus')
})
