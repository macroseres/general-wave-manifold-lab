import test from 'node:test'
import assert from 'node:assert/strict'
import {traditionalShockSignatures} from '../scripts/traditional-shock-signatures.mjs'
import {flux,jacobian} from '../src/math/flux/quadraticFlux.js'
import {hugoniotSpectralDiagnostic} from '../src/math/state/hugoniotSpectrum.js'

const positions=['below-spectrum','between','above-spectrum']
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`)

test('nine traditional endpoint signatures have distinct quadratic RH fixtures',()=>{
  const examples=traditionalShockSignatures()
  assert.equal(examples.length,9)
  assert.equal(new Set(examples.map(q=>`${q.nLeft},${q.nRight}`)).size,9)
  for(const q of examples){
    const a=flux(q.left,q.coefficients),b=flux(q.right,q.coefficients)
    for(let i=0;i<2;i++)close(b[i]-a[i],q.speed*(q.right[i]-q.left[i]))
    for(const [state,expected] of [[q.left,q.leftSpectrum],[q.right,q.rightSpectrum]]){
      const J=jacobian(state,q.coefficients)
      close(J[0][0]+J[1][1],expected[0]+expected[1])
      close(J[0][0]*J[1][1]-J[0][1]*J[1][0],expected[0]*expected[1])
    }
  }
})

test('nine RH fixtures agree with endpoint diagnostics and incidence orientation',()=>{
  for(const q of traditionalShockSignatures()){
    const d=hugoniotSpectralDiagnostic({kind:'regular',Um:q.left,Up:q.right,s:q.speed},q.coefficients)
    assert.equal(d.minus.position,positions[q.nLeft])
    assert.equal(d.plus.position,positions[q.nRight])
    const incoming=q.leftSpectrum.filter(v=>v>q.speed).length+q.rightSpectrum.filter(v=>v<q.speed).length
    assert.equal(incoming,q.incoming)
    assert.equal(incoming===3,['one-shock','two-shock'].includes(q.name))
  }
})
