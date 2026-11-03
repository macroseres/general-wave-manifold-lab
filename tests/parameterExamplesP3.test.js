import test from 'node:test'
import assert from 'node:assert/strict'
import {coefficientKeys,discriminantPolynomial} from '../src/math/flux/affineClassification.js'
import {parameterExamples,diagnoseParameterExample,filterParameterExamples} from '../src/math/flux/parameterExamples.js'

test('P3: catálogo finito com dez coeficientes e identificadores únicos',()=>{
 assert.equal(new Set(parameterExamples.map(x=>x.id)).size,parameterExamples.length)
 for(const example of parameterExamples){
  assert.deepEqual(Object.keys(example.coefficients).sort(),[...coefficientKeys].sort())
  assert.ok(Object.values(example.coefficients).every(Number.isFinite))
  const result=diagnoseParameterExample(example)
  assert.equal(result.verified,true,example.id+': '+result.conic.type+' / '+result.signs.evidence)
 }
})
test('P3: polinômios testemunhas explícitos são reproduzíveis',()=>{
 const byId=Object.fromEntries(parameterExamples.map(x=>[x.id,x]))
 assert.deepEqual(discriminantPolynomial(byId.ellipse.coefficients),{u2:4,uv:0,v2:1,u:-4,v:0,c:0})
 assert.deepEqual(discriminantPolynomial(byId.hyperbola.coefficients),{u2:-4,uv:0,v2:1,u:4,v:0,c:0})
 assert.deepEqual(discriminantPolynomial(byId.parabola.coefficients),{u2:0,uv:0,v2:1,u:4,v:0,c:0})
 assert.deepEqual(discriminantPolynomial(byId['whole-plane'].coefficients),{u2:0,uv:0,v2:0,u:0,v:0,c:0})
})
test('P3: filtro desconhecido não inventa exemplos',()=>{
 assert.deepEqual(filterParameterExamples('inexistente'),[])
 assert.equal(filterParameterExamples('all').length,parameterExamples.length)
 assert.deepEqual(filterParameterExamples('ellipse').map(x=>x.id),['ellipse'])
})
