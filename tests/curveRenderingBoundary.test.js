import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {curvePoints3D} from '../src/rendering/curvePoints.js'

test('curve adapter maps tau/Y/zc without mutating input',()=>{
  const points=[{tau:1,Y:2,zc:-0.5},{tau:3,Y:4,zc:0.7}]
  assert.deepEqual(curvePoints3D(points,'tauYzc',{yOffset:0.043}),[[1,2.043,-0.5],[3,4.043,0.7]])
  assert.equal(points[0].Y,2)
})
test('curve adapter maps composite xyz',()=>{
  assert.deepEqual(curvePoints3D([{x:1,y:2,z:3}],'xyz'),[[1,2,3]])
})
test('curve adapter rejects unknown coordinates',()=>{
  assert.throws(()=>curvePoints3D([],'unknown'),RangeError)
})
test('scene does not allocate BufferGeometry for curves during render',()=>{
  const scene=readFileSync(new URL('../src/components/Scene.jsx',import.meta.url),'utf8')
  assert.doesNotMatch(scene,/new THREE\.BufferGeometry\(\)\.setFromPoints/)
  assert.match(scene,/curvePoints3D/)
})
