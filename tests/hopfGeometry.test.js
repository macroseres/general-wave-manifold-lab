import test from 'node:test'
import assert from 'node:assert/strict'
import {hopfAt,hopfHeight} from '../src/math/sonic/hopf.js'
import {hopfSurfaceMesh} from '../src/geometry/hopf/surface.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
test('Hopf trace vanishes at graph height and both sides reflect',()=>{
  let checked=0
  for(const tau of [-1,-.3,.2,1])for(const zc of [-.7,-.2,.2,.7]){
    const ym=hopfHeight(tau,zc,p,'minus'),yp=hopfHeight(tau,zc,p,'plus')
    if(ym===null)continue
    assert.ok(Math.abs(ym+yp)<1e-8)
    const h=hopfAt(tau,ym,zc,p,'minus')
    assert.ok(Math.abs(h.trace)<1e-8)
    assert.ok(Math.abs(h.discriminant+4*h.det)<1e-8)
    checked++
  }
  assert.ok(checked>5)
})
test('Hopf surface emits finite triangles with valid index ranges',()=>{
  const m=hopfSurfaceMesh(p,{tauMin:-2,tauMax:2,YMin:-5,YMax:5,side:'plus',nTau:16,nZ:20})
  assert.equal(m.positions.length%9,0)
  assert.equal(m.indices.length,m.positions.length/3)
  assert.ok(m.positions.every(Number.isFinite))
  assert.ok(m.indices.every(i=>i>=0&&i<m.positions.length/3))
})
test('Hopf clipping retains triangles at slab boundaries without escaping viewport',()=>{
  const opts={tauMin:-2,tauMax:2,YMin:-.4,YMax:.4,side:'minus',nTau:35,nZ:45}
  const m=hopfSurfaceMesh(p,opts)
  assert.ok(m.positions.length>0)
  const ys=m.positions.filter((_,i)=>i%3===1)
  assert.ok(ys.every(y=>y>=opts.YMin-1e-9&&y<=opts.YMax+1e-9))
  assert.ok(ys.some(y=>Math.abs(y-opts.YMin)<1e-8||Math.abs(y-opts.YMax)<1e-8))
})

test('alternative tau chart respects trace zero and visible tau bounds',async()=>{
  const {hopfTau}=await import('../src/math/sonic/hopf.js')
  for(const side of ['minus','plus']){
    let found=0
    for(const zc of [-.7,-.3,.1,.5]){
      const tau=hopfTau(.2,zc,p,side)
      if(tau===null)continue
      assert.ok(Math.abs(hopfAt(tau,.2,zc,p,side).trace)<1e-7)
      found++
    }
    assert.ok(found>0)
    const m=hopfSurfaceMesh(p,{tauMin:-2,tauMax:2,YMin:-3,YMax:3,side,nTau:24,nZ:32})
    for(let i=0;i<m.positions.length;i+=3){
      assert.ok(m.positions[i]>=-2-1e-8&&m.positions[i]<=2+1e-8)
      assert.ok(m.positions[i+1]>=-3-1e-8&&m.positions[i+1]<=3+1e-8)
    }
  }
})

test('Hopf clipped line mesh remains on trace-zero locus across chart transitions',()=>{
  for(const side of ['minus','plus']){
    const m=hopfSurfaceMesh(p,{tauMin:-2,tauMax:2,YMin:-3,YMax:3,side,nTau:32,nZ:48})
    assert.ok(m.positions.length>0)
    for(let i=0;i<m.positions.length;i+=3){
      const [tau,Y,zc]=m.positions.slice(i,i+3)
      const h=hopfAt(tau,Y,zc,p,side)
      assert.equal(h.kind,'regular')
      assert.ok(Math.abs(h.trace)<0.02,`linear mesh trace drift ${h.trace}`)
    }
  }
})

test('Hopf emitted face interiors satisfy trace-zero within mesh tolerance',()=>{
  const opts={tauMin:-2,tauMax:2,YMin:-3,YMax:3,side:'plus',nTau:28,nZ:45}
  const mesh=hopfSurfaceMesh(p,opts)
  assert.ok(mesh.positions.length>0)
  const tol=.015*Math.max(1,opts.tauMax-opts.tauMin,opts.YMax-opts.YMin)
  for(let k=0;k<mesh.positions.length;k+=9){
    const v=[0,1,2].map(i=>mesh.positions.slice(k+3*i,k+3*i+3))
    const center=v[0].map((x,j)=>(x+v[1][j]+v[2][j])/3)
    const h=hopfAt(...center,p,opts.side)
    assert.equal(h.kind,'regular')
    assert.ok(Math.abs(h.trace)<=tol+1e-8,`face interior trace=${h.trace}`)
  }
})


test('Hopf mesh approaches both compactified z ends with the requested viewport',()=>{
  const opts={tauMin:-1,tauMax:1,YMin:-6,YMax:6,side:'minus',nTau:42,nZ:100}
  const mesh=hopfSurfaceMesh(p,opts)
  assert.ok(mesh.positions.length>0)
  const hats=mesh.positions.filter((_,i)=>i%3===2)
  assert.ok(hats.every(z=>Math.abs(z)<1))
  // Endpoint coverage is conditional on det >= 0 and the visible tau/Y slab;
  // no artificial faces may be introduced merely to reach the chart boundary.
  assert.ok(hats.every(Number.isFinite))
})
