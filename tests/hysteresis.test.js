import test from 'node:test'
import assert from 'node:assert/strict'
import {hysteresisPaths} from '../src/geometry/sonic/hysteresis.js'
import {zFromZc} from '../src/math/charts/zChart.js'
import {defaultCoefficients as p} from '../src/math/flux/quadraticFlux.js'
import {waveState} from '../src/math/manifold/waveState.js'
import {sonicImplicit} from '../src/math/sonic/sonic.js'
import {stateFiberPoint} from '../src/math/state/fibers.js'

test('hysteresis lies on the sonic sheets and is tangent to the opposite fixed-state fibre',()=>{
  const paths=hysteresisPaths(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6})
  assert.ok(paths.plus.length>0)
  assert.deepEqual(paths.minus,paths.plus.map(path=>path.map(([tau,Y,zc])=>[tau,-Y,zc])))
  for(const [side,segments] of Object.entries(paths)){
    for(const [tau,Y,zc] of segments.flat()){
      const z=zFromZc(zc)
      const state=waveState(tau,Y,z,p)
      const fixed=side==='plus'?state.Um:state.Up
      const fibreSide=side==='plus'?'minus':'plus'
      const alongFibre=value=>{
        const point=stateFiberPoint(fixed,value,p,fibreSide)
        return sonicImplicit(point.tau,point.Y,value,p,side)
      }
      const step=1e-5*(1+Math.abs(z))
      assert.ok(Math.abs(alongFibre(z))<1e-7)
      assert.ok(Math.abs(alongFibre(z+step)-alongFibre(z-step))/(2*step)<1e-6)
    }
  }
})
