import test from 'node:test'
import assert from 'node:assert/strict'
import {refineSonicMeshExperimental} from '../src/geometry/sonic/experimentalRefinement.js'
test('conforming shared edge midpoint is reused and boundary remains unchanged',()=>{
  const m={positions:[0,0,0,1,0,0,0,1,0,1,1,0],indices:[0,1,2,1,3,2]}
  const r=refineSonicMeshExperimental(m,{qualityThreshold:1.1})
  const counts=new Map()
  for(let k=0;k<r.indices.length;k+=3)for(const [a,b] of [[r.indices[k],r.indices[k+1]],[r.indices[k+1],r.indices[k+2]],[r.indices[k+2],r.indices[k]]]){
    const key=[a,b].sort((x,y)=>x-y).join(':');counts.set(key,(counts.get(key)||0)+1)
  }
  assert.equal([...counts.values()].filter(x=>1===x).length,8)
  assert.equal([...counts.values()].filter(x=>x>2).length,0)
  assert.equal(r.triangleCount,8)
  assert.deepEqual(m.indices,[0,1,2,1,3,2])
})
