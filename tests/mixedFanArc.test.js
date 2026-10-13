import test from 'node:test'
import assert from 'node:assert/strict'
import {assessMixedFanArc} from '../src/math/solution/mixedWaveChains.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:3}

test('left anchored slow fan is increasing toward intermediate state',()=>{
 const branch={side:'left',family:'slow',points:[[0,0],[.5,0],[1,0]]}
 const q=assessMixedFanArc(branch,[.75,0],p,'rarefaction-shock',1)
 assert.equal(q.status,'sampled-fan-ordered')
 assert.equal(q.passes,true)
})
test('left fan rejects interior speed reversal even with increasing endpoints',()=>{
 const branch={side:'left',family:'slow',points:[[0,0],[1,0],[.2,0],[1.2,0]]}
 const q=assessMixedFanArc(branch,[1.1,0],p,'rarefaction-shock',2)
 assert.equal(q.status,'fan-speed-reversal')
})
test('right anchored fast fan is read in reverse physical order',()=>{
 const branch={side:'right',family:'fast',points:[[0,2],[0,1.5],[0,1]]}
 const q=assessMixedFanArc(branch,[0,1.25],p,'shock-rarefaction',1)
 assert.equal(q.status,'sampled-fan-ordered')
})
test('right anchored fan rejects increasing speeds away from right state',()=>{
 const branch={side:'right',family:'fast',points:[[0,1],[0,1.5],[0,2]]}
 const q=assessMixedFanArc(branch,[0,1.75],p,'shock-rarefaction',1)
 assert.equal(q.status,'fan-speed-reversal')
})
test('unrelated middle is not accepted as part of rarefaction fan',()=>{
 const branch={side:'left',family:'slow',points:[[0,0],[1,0]]}
 const q=assessMixedFanArc(branch,[.5,2],p,'rarefaction-shock',0)
 assert.equal(q.status,'middle-off-fan')
})
