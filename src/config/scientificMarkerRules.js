/**
 * Visual convention for user-chosen Riemann states, not for wave families.
 * Distinct shapes remain legible in grayscale and across dark/light themes.
 */
export function stateMarkerShape(side) {
  if (side === 'left') return 'circle'
  if (side === 'right') return 'diamond'
  throw new Error(`Estado não reconhecido: ${String(side)}`)
}
export const STATE_MARKER_SHAPES_3D = Object.freeze({
  left: 'sphere',
  right: 'octahedron',
})

/** Shared screen-space sizes (pixels) for 2D state and intersection markers. */
export const STATE_MARKER_SIZE_2D = Object.freeze({normal: 5.3, hovered: 6.7, preview: 5.3, intersection: 3.7})

/** Semantic classification: origin and mathematical type are independent. */
export const SCIENTIFIC_POINT_TYPES = Object.freeze({
  state: {color: null, radius: 5.3, filled: true},
  intersection: {color: '#bf5af2', radius: 3.7, filled: false},
  sonicContact: {color: '#64d2ff', radius: 4.6, filled: false},
  rarefactionEvent: {color: '#ffd60a', radius: 3.7, filled: true},
  sonicConnection: {color: '#64d2ff', radius: 5.8, filled: false, dash: '3 2'},
})

/** A neutral ring is used if an intersection belongs to both families or neither. */
export function scientificPointStyle({referenceState = null, pointType, verificationStatus = 'candidate'} = {}) {
  const type = SCIENTIFIC_POINT_TYPES[pointType]
  if (!type) throw new Error(`Tipo de ponto desconhecido: ${String(pointType)}`)
  if (referenceState !== null && referenceState !== 'left' && referenceState !== 'right') {
    throw new Error(`Estado de referência desconhecido: ${String(referenceState)}`)
  }
  const shape = referenceState === null ? 'circle' : stateMarkerShape(referenceState)
  return Object.freeze({
    shape, color: type.color, radius: type.radius, filled: type.filled,
    dash: type.dash ?? (verificationStatus === 'unresolved' ? '2 2' : undefined),
    verificationStatus,
  })
}

/** Corresponding 3D primitives, preserving the same semantic shape. */
export function scientificPointShape3D(referenceState = null) {
  if (referenceState === null) return 'sphere'
  if (!Object.hasOwn(STATE_MARKER_SHAPES_3D, referenceState)) throw new Error('Estado de referência desconhecido')
  return STATE_MARKER_SHAPES_3D[referenceState]
}
