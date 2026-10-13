import test from 'node:test'
import assert from 'node:assert/strict'
import {zoomWindow,panWindow} from '../src/math/state/viewportNavigation.js'
const w={uMin:-5,uMax:5,vMin:-3,vMax:3}
test('zoom mantém âncora fixa',()=>{
 const z=zoomWindow(w,0.5,[2,1])
 assert.deepEqual(z,{uMin:-1.5,uMax:3.5,vMin:-1,vMax:2})
})
test('pan preserva extensão',()=>{
 const q=panWindow(w,2,-1)
 assert.deepEqual(q,{uMin:-3,uMax:7,vMin:-4,vMax:2})
})
test('fatores inválidos não alteram janela',()=>assert.equal(zoomWindow(w,-1),w))
