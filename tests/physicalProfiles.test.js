import test from 'node:test'
import assert from 'node:assert/strict'
import {rarefactionPhysicalProfiles} from '../src/geometry/physical/rarefactionProfiles.js'
const solution={kind:'rarefaction',xiMin:-1,xiMax:1,states:[{s:-1,u:2,v:3},{s:1,u:4,v:7}]}
test('physical profiles are self-similar for positive times',()=>{
 const a=rarefactionPhysicalProfiles(solution,{time:1,xMin:-2,xMax:2,samples:5})
 const b=rarefactionPhysicalProfiles(solution,{time:2,xMin:-4,xMax:4,samples:5})
 assert.deepEqual(a.points.map(q=>[q.u,q.v,q.region]),b.points.map(q=>[q.u,q.v,q.region]))
 assert.equal(a.points[2].u,3)
 assert.equal(a.points[2].v,5)
})
test('physical profiles reject invalid or uncertified candidate',()=>{
 assert.equal(rarefactionPhysicalProfiles({kind:'nonmonotone'},{time:1}),null)
 assert.equal(rarefactionPhysicalProfiles(solution,{time:0}),null)
 assert.equal(rarefactionPhysicalProfiles(solution,{time:1,samples:1}),null)
})
