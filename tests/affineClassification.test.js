import test from 'node:test'
import assert from 'node:assert/strict'
import {transformQuadraticFlux,discriminantPolynomial,classifyState} from '../src/math/flux/affineClassification.js'
import {defaultCoefficients,jacobian} from '../src/math/flux/quadraticFlux.js'
import {discriminant} from '../src/math/characteristic/spectrum.js'
const p=defaultCoefficients
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`)
test('transformação afim preserva o jacobiano por similaridade e discriminante',()=>{
 const A=[[2,1],[-1,3]],t=[.4,-.7],V=[.25,-.6]
 const {coefficients:q}=transformQuadraticFlux(p,A,t)
 const U=[A[0][0]*V[0]+A[0][1]*V[1]+t[0],A[1][0]*V[0]+A[1][1]*V[1]+t[1]]
 close(discriminant(V,q),discriminant(U,p))
 const J=jacobian(V,q);assert.ok(J.flat().every(Number.isFinite))
})
test('transformação identidade preserva todos os coeficientes',()=>{
 const q=transformQuadraticFlux(p,[[1,0],[0,1]]).coefficients
 for(const k of Object.keys(p))close(p[k],q[k])
})
test('discriminante polinomial reproduz D(u,v)',()=>{
 const q=discriminantPolynomial(p),u=.37,v=-.23
 close(q.u2*u*u+q.uv*u*v+q.v2*v*v+q.u*u+q.v*v+q.c,discriminant([u,v],p))
})
test('rejeita matriz singular',()=>assert.throws(()=>transformQuadraticFlux(p,[[1,2],[2,4]])))
test('distingue matriz escalar degenerada',()=>assert.match(classifyState([0,0],Object.fromEntries(Object.keys(p).map(k=>[k,0]))),/escalar/))
