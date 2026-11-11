import test from 'node:test'
import assert from 'node:assert/strict'
import { projectedBtLoci, sharedProjectedLoci } from '../src/geometry/sharedProjectedLoci.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'

test('same wave-manifold loci supply both state-space projections',()=>{
  const loci=sharedProjectedLoci(defaultCoefficients,{tauMin:-1,tauMax:1,YMin:-6,YMax:6})
  assert.deepEqual(loci.map(item=>item.id),['E','DS','J'])
  for (const locus of loci) {
    assert.equal(locus.projected.minus.length,locus.projected.plus.length)
    for (const side of ['minus','plus']) {
      for (const path of locus.projected[side]) {
        assert.ok(path.length>=2)
        assert.ok(path.every(point=>Number.isFinite(point.u)&&Number.isFinite(point.v)))
      }
    }
  }
})


test('inflection locus J has finite 3D vertices on the characteristic plane',()=>{
  const loci=sharedProjectedLoci(defaultCoefficients,{tauMin:-5,tauMax:5,YMin:-6,YMax:6})
  const j=loci.find(item=>item.id==='J')
  assert.ok(j.paths.length>0,'expected J paths in the sampled domain')
  for(const path of j.paths)for(const point of path){
    assert.ok([point.tau,point.Y,point.zc].every(Number.isFinite))
    assert.equal(point.Y,0)
  }
})

test('BT reflection exchanges the state projections and preserves both curves',()=>{
  const [minus,plus]=projectedBtLoci(defaultCoefficients,{tauMin:-1,tauMax:1,YMin:-6,YMax:6})
  assert.equal(minus.id,'BT-')
  assert.equal(plus.id,'BT+')
  assert.ok(minus.projected.minus.some(path=>path.length>2))
  assert.ok(minus.projected.plus.some(path=>path.length>2))
  assert.deepEqual(plus.projected.minus,minus.projected.plus)
  assert.deepEqual(plus.projected.plus,minus.projected.minus)
})
