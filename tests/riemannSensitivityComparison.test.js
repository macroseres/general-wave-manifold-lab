import test from 'node:test'
import assert from 'node:assert/strict'
import {compareHugoniotSensitivity} from '../src/math/solution/riemannSensitivityComparison.js'
const arc=trials=>({coefficientSensitivity:{trials}})
test('compares central derivatives without conflating missing values with zero',()=>{
 const result=compareHugoniotSensitivity(arc([{coefficient:'a20',centralDerivative:2},{coefficient:'b11',centralDerivative:null}]),arc([{coefficient:'a20',centralDerivative:1},{coefficient:'b11',centralDerivative:0}]))
 assert.equal(result.comparableCount,1)
 assert.equal(result.largestDerivativeDifference,1)
 assert.equal(result.rows[1].difference,null)
})
test('reports unavailable diagnostics explicitly',()=>{
 assert.equal(compareHugoniotSensitivity(null,arc([])).status,'unavailable')
 assert.equal(compareHugoniotSensitivity(arc([]),arc([])).status,'unavailable')
})
test('matches coefficient names independent of trial order',()=>{
 const result=compareHugoniotSensitivity(arc([{coefficient:'a20',centralDerivative:-3}]),arc([{coefficient:'b11',centralDerivative:9},{coefficient:'a20',centralDerivative:2}]))
 assert.equal(result.rows[0].difference,-5)
})
