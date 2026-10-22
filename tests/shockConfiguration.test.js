import test from 'node:test'
import assert from 'node:assert/strict'
import {traditionalShockSignatures} from '../scripts/traditional-shock-signatures.mjs'
import {directShockDiagnostic} from '../src/math/solution/directShockDiagnostic.js'
import {classifyShockConfiguration} from '../src/math/state/shockConfiguration.js'
import {laxClass2x2} from '../src/math/state/hugoniotSpectralRegions.js'

test('production classifier distinguishes all nine quadratic RH configurations',()=>{
  for(const q of traditionalShockSignatures()){
    const result=directShockDiagnostic(q.left,q.right,q.coefficients)
    assert.equal(result.rankineHugoniot,true)
    assert.equal(result.configuration.kind,'spectral-interior')
    assert.equal(result.configuration.name,q.name)
    assert.equal(result.configuration.incoming,q.incoming)
  }
})

test('sonic boundaries on either side cannot receive an interior or strict Lax label',()=>{
  for(const [left,right,s] of [[[0,2],[-1,1],0],[[-1,1],[0,2],0],[[-1,1],[0,2],1]]){
    const q=classifyShockConfiguration(left,right,s)
    assert.equal(q.kind,'sonic-boundary')
    assert.ok(q.boundaries.length>0)
    assert.equal(laxClass2x2({kind:'regular',s,minus:{eigenvalues:left},plus:{eigenvalues:right}}).kind,'undefined')
  }
})

test('coincident eigenvalues, missing spectra and near-sonic gaps stay outside strict classes',()=>{
  assert.equal(classifyShockConfiguration([1,1],[-1,2],0).kind,'non-strict-hyperbolicity')
  assert.equal(classifyShockConfiguration(null,[-1,1],0).kind,'invalid-spectra')
  assert.equal(classifyShockConfiguration([1e-12,2],[-1,1],0).kind,'sonic-boundary')
  assert.equal(classifyShockConfiguration([1,1+1e-12],[-1,2],0).kind,'non-strict-hyperbolicity')
  assert.equal(laxClass2x2({kind:'regular',s:0,minus:{eigenvalues:[1,1]},plus:{eigenvalues:[-1,1]}}).kind,'undefined')
})

test('reversing endpoints changes incidence but never asserts admissibility',()=>{
  const a=classifyShockConfiguration([1,2],[-1,1],0)
  const b=classifyShockConfiguration([-1,1],[1,2],0)
  assert.equal(a.name,'one-shock');assert.equal(b.name,'one-expansive')
  assert.equal('entropyCertified' in a,false)
})
