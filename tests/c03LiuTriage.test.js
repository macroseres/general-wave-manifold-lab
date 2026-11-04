import test from 'node:test'
import assert from 'node:assert/strict'
import {classifyWaveChain} from '../src/math/solution/waveChainClassification.js'
import {assessWaveChain} from '../src/math/solution/waveChainAssessment.js'

const p={a20:.5,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:.5,b10:0,b01:5}
const ss={status:'sampled-candidate',kind:'two-shock',states:[[2,2],[0,2],[0,0]],speeds:[1,6]}

test('C03-T03: SS per-wave Liu violations remain independent',()=>{
 const candidate={...ss,evidence:{liuByWave:[{status:'no-sampled-violation'},{status:'liu-violation-detected'}]}}
 const result=classifyWaveChain(candidate,p)
 assert.deepEqual(result.waves.map(w=>w.admissibility.liu.status),['no-sampled-violation','sampled-violation-detected'])
 assert.equal(assessWaveChain(result).status,'incompatible')
 assert.equal(result.entropyCertified,false)
})

test('C03-T03: unresolved SS Liu remains inconclusive',()=>{
 const candidate={...ss,evidence:{liuByWave:[{status:'no-sampled-violation'},{status:'arc-unresolved'}]}}
 const result=classifyWaveChain(candidate,p)
 assert.equal(result.waves[1].admissibility.liu.status,'inconclusive')
 assert.equal(assessWaveChain(result).status,'inconclusive')
 assert.equal(result.entropyCertified,false)
})

test('C03-T03: sampled-compatible SS Liu is not entropy certification',()=>{
 const candidate={...ss,evidence:{liuByWave:[{status:'no-sampled-violation'},{status:'no-sampled-violation'}]}}
 const result=classifyWaveChain(candidate,p)
 assert.equal(assessWaveChain(result).status,'numerically-compatible')
 assert.equal(result.entropyCertified,false)
})
