/**
 * Saturation seeds for a curve Gamma in W.
 *
 * sat_forw(Gamma) = union_{P in Gamma} pi_-^{-1}(U_-(P))
 * sat_back(Gamma) = union_{P in Gamma} pi_+^{-1}(U_+(P))
 *
 * This module deliberately returns the moving fixed states (the leaves to be
 * saturated).  Numerical meshing of the resulting 2D union belongs to a
 * later numerical/geometry layer.
 */
import { localEndpointStates } from './stateRoles.js'

export function saturationSeeds(curve, direction = 'forward') {
  if (!Array.isArray(curve)) return []
  if (direction !== 'forward' && direction !== 'backward') throw new Error(`unknown saturation direction: ${direction}`)
  const projection = direction === 'forward' ? 'minus' : 'plus'
  const key = direction === 'forward' ? 'minus' : 'plus'
  return curve.flatMap((P, index) => {
    const endpoints = localEndpointStates(P)
    if (!endpoints) return []
    return [{ index, P, projection, fixedState: endpoints[key] }]
  })
}

export const forwardSaturationSeeds = curve => saturationSeeds(curve, 'forward')
export const backwardSaturationSeeds = curve => saturationSeeds(curve, 'backward')
