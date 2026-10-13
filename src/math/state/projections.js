/**
 * Canonical projections from the wave manifold W to state space U ≃ R².
 *
 * These functions contain no display conventions.  They expose the left,
 * right and midpoint states already determined by the wave-manifold state.
 */
export function projectLeft(state) {
  if (state?.kind !== 'regular' || !Array.isArray(state.Um)) return null
  return { u: state.Um[0], v: state.Um[1] }
}

export function projectRight(state) {
  if (state?.kind !== 'regular' || !Array.isArray(state.Up)) return null
  return { u: state.Up[0], v: state.Up[1] }
}

export function projectMean(state) {
  if (state?.kind !== 'regular' || !Array.isArray(state.Ubar)) return null
  return { u: state.Ubar[0], v: state.Ubar[1] }
}

export function stateSpaceProjection(state) {
  const minus = projectLeft(state), plus = projectRight(state), mean = projectMean(state)
  if (!minus || !plus || !mean) return null
  return { minus, plus, mean, speed: state.s }
}
