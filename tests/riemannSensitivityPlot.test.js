import test from 'node:test'
import assert from 'node:assert/strict'
import {sensitivityPlotRows,sensitivityPlotScale} from '../src/math/solution/riemannSensitivityPlot.js'

test('preserves positive and negative offsets independently',()=>{
  const rows=sensitivityPlotRows([{coefficient:'a20',minus:-0.02,plus:0.04}])
  assert.deepEqual(rows,[{coefficient:'a20',minus:-0.02,plus:0.04,unresolved:false}])
  assert.equal(sensitivityPlotScale(rows),0.04)
})
test('missing roots remain missing, never zero',()=>{
  const rows=sensitivityPlotRows([{coefficient:'b01',minus:null,plus:0.002}])
  assert.equal(rows[0].minus,null)
  assert.equal(rows[0].unresolved,true)
  assert.equal(sensitivityPlotScale(rows),0.002)
})
test('no tracked roots produce no numerical scale',()=>{
  const rows=sensitivityPlotRows([{coefficient:'a11',minus:null,plus:null}])
  assert.equal(sensitivityPlotScale(rows),null)
})
