import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const scene=readFileSync(new URL('../src/components/Scene.jsx',import.meta.url),'utf8')
test('surface isolation offers all five independent families',()=>{
  for(const mode of ['all','characteristic','sonic-minus','sonic-plus','hopf-minus','hopf-plus'])assert.match(scene,new RegExp(`value="${mode}"`))
})
test('isolation is local state and does not remount Canvas or CameraRig',()=>{
  assert.match(scene,/useState\('all'\)/)
  assert.match(scene,/value=\{surfaceIsolation\}/)
  assert.match(scene,/<CameraRig ref=\{cameraRef\}/)
  assert.match(scene,/<Canvas\b[^>]*\bcamera=\{/)
})
test('isolation applies independently to sonic and Hopf families',()=>{
  for(const mode of ['sonic-minus','sonic-plus','hopf-minus','hopf-plus'])assert.match(scene,new RegExp(`surfaceIsolation==='${mode}'`))
  assert.match(scene,/surfaceIsolation==='characteristic'/)
})
