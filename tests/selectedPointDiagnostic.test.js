import test from 'node:test'
import assert from 'node:assert/strict'
import {selectedPointDiagnostic} from '../src/math/charts/selectedPointDiagnostic.js'
import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'

test('diagnóstico finito não força transição recíproca',()=>{
  const d=selectedPointDiagnostic({tau:0,Y:0,zc:0},defaultCoefficients)
  assert.equal(d.nearInfinity,false)
  assert.equal(d.reciprocal,null)
})
test('extremo projetivo finito identifica carta recíproca e amplitude',()=>{
  const d=selectedPointDiagnostic({tau:0,Y:0,zc:-.999},defaultCoefficients)
  assert.equal(d.nearInfinity,true)
  assert.ok(Number.isFinite(d.Z))
  assert.ok(Math.abs(d.X)<1e-12)
  assert.ok(d.reciprocal)
})
test('ponto fora da carta não recebe coordenadas artificiais',()=>{
  assert.equal(selectedPointDiagnostic({tau:0,Y:0,zc:1},defaultCoefficients).kind,'outside-chart')
})
