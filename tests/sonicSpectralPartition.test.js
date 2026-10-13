import test from 'node:test'
import assert from 'node:assert/strict'
import { partitionSonicMesh } from '../src/geometry/sonic/spectralPartition.js'
import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'

test('sonic spectral partition produces finite, indexed branch meshes',()=>{
  const mesh={positions:Float32Array.from([-0.2,0.1,-0.4, 0.2,0.1,-0.4, 0,0.1,0.4]),indices:Uint32Array.from([0,1,2])}
  const out=partitionSonicMesh(mesh,defaultCoefficients,'minus')
  for(const name of ['slow','fast']){
    assert.equal(out[name].positions.length%9,0)
    assert.equal(out[name].indices.length%3,0)
    assert.ok(out[name].positions.every(Number.isFinite))
    assert.ok(out[name].indices.every(i=>i>=0&&i<out[name].positions.length/3))
  }
})
