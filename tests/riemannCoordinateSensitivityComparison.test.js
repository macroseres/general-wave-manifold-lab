import test from 'node:test'
import assert from 'node:assert/strict'
import {compareHugoniotCoordinateSensitivity} from '../src/math/solution/riemannSensitivityComparison.js'
const arc=(a,b,derivative)=>({segmentStart:a,segmentEnd:b,coefficientSensitivity:{trials:[{coefficient:'a20',centralDerivative:derivative}]}})
test('coordinate comparison accounts for different segment lengths and orientations',()=>{
 const q=compareHugoniotCoordinateSensitivity(arc([0,0],[2,0],0.5),arc([0,0],[0,-4],0.25))
 assert.deepEqual(q.rows[0].derivativeA,[1,0]);assert.deepEqual(q.rows[0].derivativeB,[0,-1]);assert.deepEqual(q.rows[0].difference,[1,1])
})
test('missing derivatives remain inconclusive',()=>{
 const q=compareHugoniotCoordinateSensitivity(arc([0,0],[2,0],null),arc([0,0],[0,1],0))
 assert.equal(q.comparableCount,0);assert.equal(q.rows[0].difference,null)
})
test('unavailable segment metadata cannot be replaced with parameter derivatives',()=>{
 const q=compareHugoniotCoordinateSensitivity({coefficientSensitivity:{trials:[{coefficient:'a20',centralDerivative:1}]}},arc([0,0],[1,0],1))
 assert.equal(q.rows[0].derivativeA,null)
})
