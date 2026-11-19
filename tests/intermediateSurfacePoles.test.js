import test from 'node:test'
import assert from 'node:assert/strict'
import {intermediateSurface} from '../src/geometry/state/intermediateSurface.js'
import {zFromZc} from '../src/math/charts/zChart.js'

test('the intermediate surface never connects across two poles inside the same cell',()=>{
  const p={a20:.5,a11:0,a02:-5500,a10:0,a01:0,b20:0,b11:1,b02:-105,b10:1,b01:0}
  const [positions]=intermediateSurface([[{tau:.1,Y:0,zc:0},{tau:.11,Y:0,zc:0}]],p)
  assert.ok(positions.length>0)
  for(let i=0;i<positions.length;i+=9){
    const directions=[positions[i+2],positions[i+5],positions[i+8]].map(zFromZc)
    for(const pole of [100,110])
      assert.ok(!(Math.min(...directions)<pole&&Math.max(...directions)>pole))
  }
})
