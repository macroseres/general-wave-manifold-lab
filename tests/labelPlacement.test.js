import test from 'node:test'
import assert from 'node:assert/strict'
import {chooseStateLabelPosition} from '../src/math/state/labelPlacement.js'
test('rótulo permanece dentro da janela',()=>{
 const p=chooseStateLabelPosition({x:790,y:590},[],0,{width:800,height:600})
 assert.ok(p.x<=800&&p.y<=600)
})
test('rótulo não altera coordenadas de entrada',()=>{
 const q={x:300,y:250}, others=[{x:315,y:238}]
 const before=JSON.stringify(q)
 const p=chooseStateLabelPosition(q,others,0,{width:800,height:600})
 assert.equal(JSON.stringify(q),before)
 assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y))
})
