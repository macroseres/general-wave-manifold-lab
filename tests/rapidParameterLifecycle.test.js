import test from 'node:test'
import assert from 'node:assert/strict'
import {isCurrentSonicResponse,disposeSonicWorker} from '../src/rendering/sonicWorkerLifecycle.js'
import {disposeGeometry,disposeAxesHelper} from '../src/rendering/graphicsLifecycle.js'

test('rapid parameter changes accept only latest request and parameter key',()=>{
  let currentId=0
  let currentKey=''
  const replies=[]
  for(let i=0;i<500;i++){
    currentId++
    currentKey=JSON.stringify({a20:1.9+i/1000,tauMin:-2,tauMax:2})
    replies.push({id:currentId,key:currentKey})
  }
  const accepted=replies.filter(response=>isCurrentSonicResponse(response,currentId,currentKey))
  assert.deepEqual(accepted,[replies.at(-1)])
  assert.equal(isCurrentSonicResponse({...replies.at(-1),key:'outdated'},currentId,currentKey),false)
})

test('repeated replacement releases each owned graphic and terminates each worker',()=>{
  const N=500
  let geometries=0,materials=0,terminations=0
  for(let i=0;i<N;i++){
    disposeGeometry({dispose(){geometries++}})
    disposeAxesHelper({geometry:{dispose(){geometries++}},material:[{dispose(){materials++}},{dispose(){materials++}}]})
    const worker={onmessage(){},onerror(){},onmessageerror(){},terminate(){
      assert.equal(this.onmessage,null)
      assert.equal(this.onerror,null)
      assert.equal(this.onmessageerror,null)
      terminations++
    }}
    disposeSonicWorker(worker)
  }
  assert.equal(geometries,N*2)
  assert.equal(materials,N*2)
  assert.equal(terminations,N)
})
