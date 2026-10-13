import test from 'node:test'
import assert from 'node:assert/strict'
import { sonicSurfaceTriangles } from '../src/geometry/sonic/surface.js'
import { partitionSonicMesh } from '../src/geometry/sonic/spectralPartition.js'
import { continueBtMinus, btImplicitResidual } from '../src/geometry/sonic/continueBtCurve.js'

const p={a20:-4.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
const bounds={tauMin:-5,tauMax:5,YMin:-6,YMax:6,zcMax:.999}

test('BT minus continuation satisfies both implicit equations and has no abrupt jumps',()=>{
  const mesh=sonicSurfaceTriangles(p,{...bounds,zcMin:-.999,nTau:34,nY:28,nZ:50,side:'minus'})
  const split=partitionSonicMesh(mesh,p,'minus')
  const paths=continueBtMinus(split.bt,p,bounds)
  assert.ok(paths.length>0)
  let count=0
  for(const path of paths){
    count+=path.length
    for(const q of path){
      const f=btImplicitResidual(q,p)
      assert.ok(f&&Math.max(...f.map(Math.abs))<1e-6)
    }
    for(let i=1;i<path.length-1;i++){
      const a=path[i].map((v,j)=>v-path[i-1][j]),b=path[i+1].map((v,j)=>v-path[i][j])
      const cosine=a.reduce((s,v,j)=>s+v*b[j],0)/(Math.hypot(...a)*Math.hypot(...b))
      assert.ok(cosine>0.93,`unexpected BT turn at ${i}: ${cosine}`)
    }
  }
  assert.ok(count>100)
})

test('BT continuation recovers an additional branch from distributed seeds',()=>{
  const mesh=sonicSurfaceTriangles(p,{...bounds,zcMin:-.999,nTau:34,nY:28,nZ:50,side:'minus'})
  const split=partitionSonicMesh(mesh,p,'minus')
  const paths=continueBtMinus(split.bt,p,bounds)
  assert.ok(paths.length>=2,'expected independently traced branches at the difficult fold')
  assert.ok(paths.some(path=>path.some(q=>q[1]<-1.3)), 'missing negative-Y branch')
  for(const path of paths)for(const q of path){
    const residual=btImplicitResidual(q,p)
    assert.ok(residual&&Math.max(...residual.map(Math.abs))<1e-6)
  }
})
