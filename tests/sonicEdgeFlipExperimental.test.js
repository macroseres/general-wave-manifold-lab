import test from 'node:test'
import assert from 'node:assert/strict'
import { flipSonicEdgesExperimental } from '../src/geometry/sonic/edgeFlipExperimental.js'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
const params={a20:1.9,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
const options={tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMin:-.999,zcMax:.999,nTau:12,nY:10,nZ:14,side:'minus'}
function edgeCounts(m){const edges=new Map();for(let k=0;k<m.indices.length;k+=3){const [a,b,c]=m.indices.slice(k,k+3);for(const [u,v] of [[a,b],[b,c],[c,a]]){const key=u<v?`${u}:${v}`:`${v}:${u}`;edges.set(key,(edges.get(key)||0)+1)}}return {boundary:[...edges.values()].filter(v=>v===1).length,nonmanifold:[...edges.values()].filter(v=>v>2).length}}
test('experimental flipping preserves vertices, faces, boundary and manifold edges',()=>{
 const mesh=sonicSurfaceTriangles(params,options),before=edgeCounts(mesh)
 const original=Array.from(mesh.indices)
 const out=flipSonicEdgesExperimental(mesh,params,'minus')
 assert.equal(out.vertexCount,mesh.vertexCount)
 assert.equal(out.triangleCount,mesh.triangleCount)
 assert.deepEqual(out.positions,Array.from(mesh.positions))
 assert.deepEqual(edgeCounts(out),before)
 assert.deepEqual(Array.from(mesh.indices),original)
 assert.equal(out.experimentalEdgeFlips.method,'conservative-edge-flip-no-vertex-insertion')
})
test('zero passes does not alter connectivity',()=>{
 const mesh=sonicSurfaceTriangles(params,options)
 const out=flipSonicEdgesExperimental(mesh,params,'minus',{passes:0})
 assert.deepEqual(out.indices,Array.from(mesh.indices))
 assert.equal(out.experimentalEdgeFlips.flips,0)
})
