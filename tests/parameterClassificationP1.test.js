import test from 'node:test'
import assert from 'node:assert/strict'
import { discriminantPolynomial, classifyStateDetailed } from '../src/math/flux/affineClassification.js'
import { discriminant } from '../src/math/characteristic/spectrum.js'

const evaluate = (q,u,v) => q.u2*u*u+q.uv*u*v+q.v2*v*v+q.u*u+q.v*v+q.c

test('P1: discriminante expandido coincide com o espectral em dez coeficientes gerais', () => {
  const p={a20:2,a11:-3,a02:0.75,a10:4,a01:-1,b20:1.5,b11:2,b02:-2,b10:3,b01:0.5}
  const q=discriminantPolynomial(p)
  for(const [u,v] of [[0,0],[1,0],[0,1],[1,-2],[-3,4],[0.125,-0.75]]){
    const expected=discriminant([u,v],p)
    assert.ok(Math.abs(evaluate(q,u,v)-expected)<=1e-10*(1+Math.abs(expected)))
  }
})

test('P1: coincidencia identicamente nula para jacobiano escalar constante', () => {
  const p={a20:0,a11:0,a02:0,a10:3,a01:0,b20:0,b11:0,b02:0,b10:0,b01:3}
  assert.deepEqual(discriminantPolynomial(p),{u2:0,uv:0,v2:0,u:0,v:0,c:0})
})

test('P1: discriminante de elipse e de ponto isolado no preset simetrico', () => {
  const base={a20:4.5,a11:0,a02:0.5,a10:0,a01:0,b20:0,b11:1,b02:0,b10:1,b01:0}
  assert.deepEqual(discriminantPolynomial(base),{u2:64,uv:0,v2:4,u:0,v:4,c:0})
  assert.deepEqual(discriminantPolynomial({...base,b10:0}),{u2:64,uv:0,v2:4,u:0,v:0,c:0})
})

test('P1: coincidencia escalar possui duas direcoes proprias', () => {
  const p={a20:0,a11:0,a02:0,a10:2,a01:0,b20:0,b11:0,b02:0,b10:0,b01:2}
  const d=classifyStateDetailed([4,-3],p)
  assert.equal(d.regime,'coincidence-near')
  assert.equal(d.geometricMultiplicity,2)
  assert.equal(d.jacobianKind,'scalar-near')
})

test('P1: bloco de Jordan na coincidencia possui uma direcao propria', () => {
  const p={a20:0,a11:0,a02:0,a10:2,a01:1,b20:0,b11:0,b02:0,b10:0,b01:2}
  const d=classifyStateDetailed([0,0],p)
  assert.equal(d.regime,'coincidence-near')
  assert.equal(d.geometricMultiplicity,1)
})

test('P1: distingue espectro real distinto e complexo', () => {
  const base={a20:0,a11:0,a02:0,a10:0,a01:1,b20:0,b11:0,b02:0,b10:1,b01:0}
  assert.equal(classifyStateDetailed([0,0],base).regime,'strictly-hyperbolic')
  assert.equal(classifyStateDetailed([0,0],{...base,b10:-1}).regime,'elliptic')
})
