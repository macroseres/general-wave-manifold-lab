import test from 'node:test'
import assert from 'node:assert/strict'
import {clipSpectralTriangle} from '../src/geometry/hopf/spectralCurveClip.js'
const evaluate=(a,b,t)=>{
  const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t
  return {x,y,det:0.09-(x-0.5)**2-(y-0.5)**2}
}
test('implicit spectral contour detects a positive island inside negative vertices',()=>{
  const pts=[[0,0],[1,0],[0,1]].map(([x,y])=>({x,y,det:0.09-(x-.5)**2-(y-.5)**2}))
  const faces=clipSpectralTriangle(pts,evaluate,{depth:3})
  assert.ok(faces.length>0)
  for(const face of faces)for(const q of face)assert.ok(q.det>=-1e-8)
})
test('spectral contour follows nonlinear determinant root instead of linear value interpolation',()=>{
  const at=x=>({x,y:0,det:x*x-0.25})
  const faces=clipSpectralTriangle([at(0),at(1),at(0.9)],(a,b,t)=>at(a.x+(b.x-a.x)*t),{depth:0})
  assert.ok(faces.length>0)
  const roots=faces.flat().filter(q=>Math.abs(q.det)<1e-7)
  assert.ok(roots.length>0)
  for(const q of roots)assert.ok(Math.abs(q.x-0.5)<1e-6)
})
