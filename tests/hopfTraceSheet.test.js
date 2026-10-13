import test from 'node:test'
import assert from 'node:assert/strict'
import {hopfImplicitSurfaceMesh} from '../src/geometry/hopf/implicitSurface.js'
import {reciprocalWindowHopfMesh} from '../src/geometry/hopf/reciprocalWindowSurface.js'
import {hopfAtlasAt} from '../src/math/sonic/hopfAtlas.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
for(const side of ['minus','plus'])test(`uncut trace sheet ${side} contains the clipped Hopf region`,()=>{
 const uncut=hopfImplicitSurfaceMesh(p,{side,clipDet:false})
 const cut=hopfImplicitSurfaceMesh(p,{side,clipDet:true})
 assert.ok(uncut.indices.length>=cut.indices.length)
 let negative=0
 for(let i=0;i<uncut.positions.length;i+=3){
  const h=hopfAtlasAt(...uncut.positions.slice(i,i+3),p,side)
  assert.equal(h.kind,'regular')
  assert.ok(Math.abs(h.trace)<1e-6)
  if(h.det<0)negative++
 }
 assert.ok(negative>0,'uncut sheet must include points outside the Hopf elliptic region')
})
for(const side of ['minus','plus'])test(`reciprocal uncut trace sheet ${side} is nonempty`,()=>{
 const result=reciprocalWindowHopfMesh(p,{side,clipDet:false,nZ:12,nY:24})
 assert.equal(result.kind,'regular')
 assert.ok(result.indices.length>0)
})
