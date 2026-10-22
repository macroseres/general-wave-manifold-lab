import test from 'node:test'
import assert from 'node:assert/strict'
import {advanced,triangular,compositePoint,buildAdvancedReference} from '../scripts/advanced-reference.mjs'
import {oldWavePreset,flux,jacobian} from '../src/math/flux/quadraticFlux.js'
import {rarefactionFieldZ} from '../src/math/rarefaction/field.js'
import {reciprocalPointToFiniteDisplay} from '../src/math/rarefaction/separatrices.js'
import {discriminant} from '../src/math/characteristic/spectrum.js'
import {classifyState} from '../src/math/flux/affineClassification.js'

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`)

test('composta degenerada exata: RH, dupla sonoridade e EDO implícita',()=>{
  for(const alpha of [0,.25,.5,.75,1]){
    const q=compositePoint(alpha)
    q.residual.forEach(x=>close(x,0));close(q.sonicLeft,0);close(q.sonicRight,0)
    // The sonic rarefaction state is q.right; its derivative is (1,1).
    const J=jacobian(q.left,triangular)
    close(J[0][0]+J[0][1]-alpha,q.left[0]-q.right[0])
    close(J[1][0]+J[1][1]-alpha,q.left[1]-q.right[1])
  }
})

test('perfil viscoso exato com B=I e par de entropia parcial',()=>{
  const a=.75,alpha=.4,left=[alpha,alpha+a],FL=flux(left,triangular)
  for(const xi of [-10,-2,0,2,10]){
    const U=[alpha,alpha-a*Math.tanh(a*xi/2)],F=flux(U,triangular)
    const derivative=-a*a/2/Math.cosh(a*xi/2)**2
    close(F[0]-FL[0]-alpha*(U[0]-left[0]),0)
    close(F[1]-FL[1]-alpha*(U[1]-left[1]),derivative)
  }
  for(const [u,v] of [[0,.75],[2,0],[.4,-.35]]){
    const J=jacobian([u,v],triangular)
    close(u*J[0][0],u*u);close(u*J[0][1],0)
  }
  close((0**3-2**3)/3-1*(0**2-2**2)/2,-2/3)
})

test('separatriz recíproca: ramo estável exato e quatro metades numéricas',()=>{
  const p=oldWavePreset(advanced.separatrix),r=buildAdvancedReference().separatrix
  assert.deepEqual(r.linear.eigenvalues,[-8,7]);assert.equal(r.curves.length,4)
  for(const eta of [-.2,-.1,0,.1,.2]){
    const f=rarefactionFieldZ(eta,0,p)
    close(f.etaDot,-8*eta);close(f.ZDot,0)
    assert.equal(reciprocalPointToFiniteDisplay({eta,Z:0}),null)
  }
  for(const q of r.curves.filter(q=>q.stable))assert.equal(q.finiteCount,0)
})

test('classificação e transformação: cônica exata, degenerações e covariância',()=>{
  const report=buildAdvancedReference(),p=oldWavePreset(advanced.classification)
  assert.deepEqual(report.classification.cases.map(q=>q.type),['elipse','ponto isolado','duas retas paralelas','reta dupla'])
  for(const [u,v] of [[0,-.5],[1,0],[0,0]])close(discriminant([u,v],p),64*u*u+4*(v+.5)**2-1)
  assert.equal(classifyState([0,-.5],p),'elíptico')
  assert.equal(classifyState([1,0],p),'hiperbólico estrito')
  for(const V of [[0,0],[.2,-.3],[1,2]]){
    const U=[V[0]+V[1]+1,V[1]-1],F=flux(U,triangular),transformed=flux(V,report.affine.coefficients)
    close(transformed[0]+report.affine.constant[0],F[0]-F[1])
    close(transformed[1]+report.affine.constant[1],F[1])
    close(discriminant(V,report.affine.coefficients),discriminant(U,triangular))
  }
})
