import test from 'node:test'
import assert from 'node:assert/strict'
import {rarefactionPhysicalProfiles} from '../src/geometry/physical/rarefactionProfiles.js'

test('rarefaction physical window stays fixed while fan endpoints follow x = xi*t',()=>{
 const solution={kind:'rarefaction',xiMin:0,xiMax:2,states:[{u:0,v:0,s:0},{u:2,v:1,s:2}]}
 const early=rarefactionPhysicalProfiles(solution,{time:0.25,tMax:1})
 const late=rarefactionPhysicalProfiles(solution,{time:0.75,tMax:1})
 assert.equal(early.xMin,late.xMin)
 assert.equal(early.xMax,late.xMax)
 assert.deepEqual([early.fanLeft,early.fanRight],[0,0.5])
 assert.deepEqual([late.fanLeft,late.fanRight],[0,1.5])
})
