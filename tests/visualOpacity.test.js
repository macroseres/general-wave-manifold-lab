import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const scene=readFileSync(new URL('../src/components/Scene.jsx',import.meta.url),'utf8')
test('surface transparency has interactive range and applies to all three surface families',()=>{
  assert.match(scene,/const \[surfaceOpacity,setSurfaceOpacity\]=useState\((?:0\.38|0\.85)\)/)
  assert.match(scene,/<input type="range" min="0" max="1" step="0\.01"/)
  assert.match(scene,/aria-label="Opacidade das superfícies"/)
  assert.match(scene,/opacity=\{surfaceOpacity\*0\.8\}/)
  assert.match(scene,/transparent opacity=\{surfaceOpacity\} depthWrite=\{false\}/)
  assert.match(scene,/opacity:transparent\?surfaceOpacity:1/)
})
test('curves retain visibility and transparent surfaces do not write depth',()=>{
  assert.match(scene,/renderOrder=\{11\}/)
  assert.match(scene,/depthWrite=\{false\}/)
  assert.match(scene,/depthTest=\{false\}/)
})
