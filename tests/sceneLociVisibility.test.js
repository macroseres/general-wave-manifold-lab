import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const scene = readFileSync(new URL('../src/components/Scene.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('DS and J in 3D are independently controlled by their visibility flags', () => {
  assert.match(scene, /function SonicSpecialLoci\(\{sharedLoci=\[\],showDS=true,showJ=true\}\)/)
  assert.match(scene, /item\.id==='DS'&&showDS/)
  assert.match(scene, /item\.id==='J'&&showJ/)
  assert.match(scene, /<SonicSpecialLoci sharedLoci=\{sharedLoci\} showDS=\{showDS\} showJ=\{showJ\}\/>/)
})

test('2D projection visibility uses the same flags', () => {
  assert.match(app, /item\.id==='E'\?showCoincidence:item\.id==='DS'\?showDS:showJ/)
  assert.match(app, /<StateSpaceDialog sharedLoci=\{visibleSharedLoci\}/)
})
