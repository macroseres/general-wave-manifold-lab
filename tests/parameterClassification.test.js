import test from 'node:test'
import assert from 'node:assert/strict'
import {parameterClassification} from '../src/math/flux/parameterClassification.js'

const family=(B,c)=>({a20:(B+1)/2,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:0,b10:c,b01:0})

test('identical spectral ellipses retain different projective cubic classes',()=>{
  const a=parameterClassification(family(2,1)),b=parameterClassification(family(-2,1))
  assert.equal(a.spectral.type,'elipse');assert.equal(b.spectral.type,'elipse')
  assert.equal(a.directions.rootType,'one-real');assert.equal(b.directions.rootType,'three-real')
  assert.equal(a.directions.discriminant,'-4');assert.equal(b.directions.discriminant,'108')
  assert.equal(a.scalar.homogenizable,false)
  assert.deepEqual([a.scalar.rank,a.scalar.augmentedRank],[2,3])
})

test('scalar stratum distinguishes point, line and incompatible systems',()=>{
  const point=parameterClassification(family(2,0)),line=parameterClassification(family(0,0))
  const empty=parameterClassification(family(0,1))
  assert.equal(point.scalar.locus.dimension,0);assert.equal(point.scalar.homogenizable,true)
  assert.equal(line.scalar.locus.dimension,1);assert.equal(line.scalar.homogenizable,true)
  assert.equal(empty.scalar.locus,null);assert.equal(empty.scalar.homogenizable,false)
})

test('directional multiple-root and zero-cubic sectors are explicit',()=>{
  assert.equal(parameterClassification(family(1,1)).directions.rootType,'triple')
  const p={a20:1,a11:0,a02:0,a10:0,a01:0,b20:0,b11:1,b02:0,b10:0,b01:0}
  assert.equal(parameterClassification(p).directions.rootType,'zero')
  assert.equal(parameterClassification({...p,a20:0,b11:0}).scalar.locus.dimension,2)
})

test('classification accepts general mixed coefficients without rewriting inputs',()=>{
  const p={a20:2,a11:-1,a02:3,a10:4,a01:-2,b20:1,b11:2,b02:-3,b10:5,b01:1}
  const copy={...p},r=parameterClassification(p)
  assert.equal(r.status,'classified');assert.deepEqual(p,copy)
  assert.equal(r.scalar.evidence,'exact-rational-for-supplied-decimals')
  assert.match(r.scope,/not global waves/)
})

test('invalid coefficients yield an explicit inconclusive result',()=>{
  for(const p of [null,{}, {...family(2,1),a20:NaN},{...family(2,1),b10:Infinity}])
    assert.equal(parameterClassification(p).status,'inconclusive')
})
