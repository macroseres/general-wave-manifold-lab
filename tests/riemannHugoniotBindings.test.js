import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const scene=readFileSync(new URL('../src/components/Scene.jsx',import.meta.url),'utf8')
const dialog=readFileSync(new URL('../src/components/StateSpaceDialog.jsx',import.meta.url),'utf8')
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8')
test('U_L binds only forward and U_R only backward in 3D',()=>{
 assert.match(scene,/U=\{riemannStates\?\.left\}[^>]*showMinus=\{showLeftRiemannFibre\}[^>]*showPlus=\{false\}/)
 assert.match(scene,/U=\{riemannStates\?\.right\}[^>]*showMinus=\{false\}[^>]*showPlus=\{showRightRiemannFibre\}/)
 assert.match(app,/axisScale,fixedState,riemannStates,showMinusStateFibre/)
})
test('state projections use variable opposite endpoint for each fixed Riemann state',()=>{
 assert.match(dialog,/side==='left'\?projected\.forward:projected\.backward/)
 assert.match(dialog,/stateProjection==='plus'\?riemannHugoniot\?\.left:riemannHugoniot\?\.right/)
})
