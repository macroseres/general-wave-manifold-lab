import test from 'node:test'
import assert from 'node:assert/strict'
import {clearHopfCache,hopfCacheKey,requestHopfMesh} from '../src/geometry/hopf/hopfCache.js'

test('Hopf cache reuses pending and completed requests per side',async()=>{
  clearHopfCache()
  let created=0
  const createWorker=()=>{
    created++
    const worker={onmessage:null,onerror:null,terminate(){},postMessage(data){queueMicrotask(()=>worker.onmessage({data:{key:data.key,meshes:{minus:{positions:[],indices:[]}}}}))}}
    return worker
  }
  const opts={p:{},tauMin:-1,tauMax:1,YMin:-1,YMax:1,traceOnly:false}
  const [a,b]=await Promise.all([requestHopfMesh('same','minus',opts,createWorker),requestHopfMesh('same','minus',opts,createWorker)])
  assert.equal(created,1)
  assert.equal(a.fromCache,false)
  assert.equal(b.fromCache,true)
  const c=await requestHopfMesh('same','minus',opts,createWorker)
  assert.equal(c.fromCache,true)
  await requestHopfMesh('same','plus',opts,createWorker)
  assert.equal(created,2)
  await requestHopfMesh('changed','minus',opts,createWorker)
  assert.equal(created,3)
  assert.notEqual(hopfCacheKey('same','minus'),hopfCacheKey('same','plus'))
  clearHopfCache()
})
