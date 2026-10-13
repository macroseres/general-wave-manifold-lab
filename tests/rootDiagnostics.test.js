import test from 'node:test'
import assert from 'node:assert/strict'
import { polynomialRootDiagnostics, continuationEventDiagnostics } from '../src/math/numerics/rootDiagnostics.js'

test('quadratic tangency: double root detected without sign change', () => {
  const result = polynomialRootDiagnostics([1,-4,4])
  assert.equal(result.roots.length,1)
  assert.ok(Math.abs(result.roots[0].value-2)<1e-8)
  assert.equal(result.roots[0].multiplicity,2)
  assert.equal(result.roots[0].tangential,true)
})
test('cubic triple root has multiplicity three', () => {
  const roots=polynomialRootDiagnostics([1,-6,12,-8]).roots
  assert.equal(roots.length,1)
  assert.equal(roots[0].multiplicity,3)
  assert.equal(roots[0].tangential,false)
})
test('cubic double and simple roots distinguished', () => {
  const roots=polynomialRootDiagnostics([1,0,-3,2]).roots
  assert.deepEqual(roots.map(r=>r.multiplicity),[1,2])
})
test('constant nonzero and identically zero polynomials distinguished', () => {
  assert.equal(polynomialRootDiagnostics([0,0,2]).roots.length,0)
  assert.equal(polynomialRootDiagnostics([0,0,0]).identicallyZero,true)
})
test('continuation diagnostics report possible events without assigning bifurcation types', () => {
  const result=continuationEventDiagnostics([[0],[],[1,2]])
  assert.deepEqual(result.counts,[1,0,2])
  assert.equal(result.events.length,2)
  assert.ok(result.events.every(e=>e.classification==='unresolved'))
})
test('unchanged root counts do not imply a detected event', () => {
  assert.deepEqual(continuationEventDiagnostics([[1],[2]]).events,[])
})
