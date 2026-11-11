import test from 'node:test'
import assert from 'node:assert/strict'
import { axisLabel, axisTicks, fittedWindow, shockStopLabel, validWindow } from '../src/geometry/state/stateSpaceView.js'

const close = (actual, expected, tolerance = 1e-12) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)

test('axis ticks use round steps covering the requested range', () => {
  assert.deepEqual(axisTicks(0, 10), [0, 2, 4, 6, 8, 10])
})

test('axis ticks are empty for degenerate or non-finite ranges', () => {
  assert.deepEqual(axisTicks(1, 1), [])
  assert.deepEqual(axisTicks(2, 1), [])
  assert.deepEqual(axisTicks(Number.NaN, 2), [])
})

test('axis labels print zero exactly and limit precision', () => {
  assert.equal(axisLabel(0), '0')
  assert.equal(axisLabel(1e-12), '0')
  assert.equal(axisLabel(0.123456789), '0.12346')
})

test('a viewport window is valid only when finite and strictly ordered', () => {
  assert.ok(validWindow({ uMin: 0, uMax: 1, vMin: 0, vMax: 1 }))
  assert.ok(!validWindow({ uMin: 1, uMax: 0, vMin: 0, vMax: 1 }))
  assert.ok(!validWindow({ uMin: 0, uMax: Number.POSITIVE_INFINITY, vMin: 0, vMax: 1 }))
  assert.ok(!validWindow(null))
})

test('shock stop reasons have readable labels and unknown reasons are reported', () => {
  assert.equal(shockStopLabel('max-steps'), 'Limite numérico de passos')
  assert.equal(shockStopLabel('unexpected'), 'Continuação interrompida: unexpected')
})

test('fitted window pads the curve geometry with extra horizontal space', () => {
  const geometry = { curves: [{ points: [{ u: 0, v: 0 }, { u: 1, v: 2 }] }], uMin: -9, uMax: 9, vMin: -9, vMax: 9 }
  const window = fittedWindow(geometry)
  // The largest span is 2. Each side adds 12%, plus another 8% horizontally.
  close(window.uMin, 0.5 - 1.4)
  close(window.uMax, 0.5 + 1.4)
  close(window.vMin, 1 - 1.24)
  close(window.vMax, 1 + 1.24)
})

test('fitted window always includes the selected state and required states', () => {
  const geometry = { curves: [{ points: [{ u: 0, v: 0 }, { u: 1, v: 2 }] }], uMin: -9, uMax: 9, vMin: -9, vMax: 9 }
  const withFixed = fittedWindow(geometry, [5, 5])
  assert.ok(withFixed.uMin < 0 && withFixed.uMax > 5 && withFixed.vMin < 0 && withFixed.vMax > 5)
  const withRequired = fittedWindow(geometry, null, [[-3, 4]])
  assert.ok(withRequired.uMin < -3 && withRequired.vMax > 4)
})

test('fitted window falls back to the supplied bounds when there is no geometry', () => {
  const geometry = { curves: [], projection: null, anchorPoints: [], uMin: -2, uMax: 3, vMin: -4, vMax: 5 }
  assert.deepEqual(fittedWindow(geometry), { uMin: -2, uMax: 3, vMin: -4, vMax: 5 })
})
