import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const scene=readFileSync(new URL('../src/components/Scene.jsx',import.meta.url),'utf8')
const adapter=readFileSync(new URL('../src/rendering/sonicBufferGeometry.js',import.meta.url),'utf8')
const source=readFileSync(new URL('../src/geometry/sonic/surface.js',import.meta.url),'utf8')

test('sonic mesh Three.js adapter is isolated from the scientific surface generator',()=>{
  assert.match(scene,/from ['"]\.\.\/rendering\/sonicBufferGeometry\.js['"]/) 
  assert.doesNotMatch(scene,/function makeSonicBufferGeometry\(/)
  assert.match(adapter,/export function makeSonicBufferGeometry\(/)
  assert.match(adapter,/orientTrianglesConsistently\(data\.indices\)/)
  assert.match(adapter,/computeVertexNormals\(\)/)
  assert.doesNotMatch(source,/\b(?:from|import)\s*\(?\s*['"]three['"]|THREE\./)
})

test('sonic mesh adapter preserves indexed orientation and scene applies dagger without remeshing',()=>{
  assert.match(adapter,/i%3===1\?-x:x/)
  assert.match(adapter,/g\.setIndex\(new THREE\.Uint32BufferAttribute\(indices,1\)\)/)
  assert.match(scene,/<group scale=\{\[1,-1,1\]\}>/)
  assert.match(scene,/geometry=\{minusSlow\}[^>]*renderOrder=\{2\}/)
  assert.match(scene,/geometry=\{minusFast\}[^>]*renderOrder=\{2\}/)
  assert.doesNotMatch(scene,/makeSonicBufferGeometry\(splitPlus\./)
})
