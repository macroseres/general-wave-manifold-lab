import test from 'node:test'
import assert from 'node:assert/strict'
import {curveDistance,projectedCurveHits,nextProjectedCurveHit} from '../src/math/state/projectedCurvePicking.js'
test('distância ao segmento, inclusive segmentos degenerados',()=>{
  assert.equal(curveDistance([5,3],[[0,0],[10,0]]),3)
  assert.equal(curveDistance([3,4],[[0,0],[0,0]]),5)
})
test('duas curvas coincidentes mantêm identidades distintas e são alternáveis',()=>{
  const curves=[{key:'pi-minus:A',screenPoints:[[0,0],[10,0]]},{key:'pi-plus:B',screenPoints:[[10,0],[0,0]]}]
  const hits=projectedCurveHits([5,0],curves)
  assert.equal(hits.length,2)
  const first=nextProjectedCurveHit(hits,null)
  const second=nextProjectedCurveHit(hits,first)
  assert.notEqual(first,second)
  assert.equal(nextProjectedCurveHit(hits,second),first)
})
test('não seleciona curvas afastadas',()=>{
  assert.deepEqual(projectedCurveHits([5,30],[{key:'a',screenPoints:[[0,0],[10,0]]}],11),[])
})
