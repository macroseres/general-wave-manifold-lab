/**
 * Fase 15.1 — contrato de apresentação, sem inferir propriedades matemáticas.
 * As cores atuais permanecem em waveColors.js até a revisão semântica.
 */
export const SCIENTIFIC_ENTITY_KINDS = Object.freeze(['point', 'curve', 'surface'])
export const SCIENTIFIC_FAMILIES = Object.freeze(['slow', 'fast', 'none'])
export const SCIENTIFIC_SIDES = Object.freeze(['minus', 'plus', 'none'])
export const SCIENTIFIC_ORIENTATIONS = Object.freeze(['forward', 'backward', 'none'])

export const scientificMarkerGeometry = Object.freeze({
  circle: Object.freeze({ svg: 'circle', three: 'sphere' }),
  square: Object.freeze({ svg: 'rect', three: 'box' }),
  triangle: Object.freeze({ svg: 'polygon', three: 'cone-3' }),
  diamond: Object.freeze({ svg: 'polygon', three: 'octahedron' }),
})

/** A identidade da projeção não é inferida das coordenadas desenhadas. */
export function createScientificVisualIdentity({
  id, kind, sourceId = null, segmentId = null,
  family = 'none', orientation = 'none', sonicSide = 'none',
  projectionSide = 'none',
}) {
  if (typeof id !== 'string' || !id.trim()) throw new Error('id não vazio obrigatório')
  if (!SCIENTIFIC_ENTITY_KINDS.includes(kind)) throw new Error('kind inválido')
  if (!SCIENTIFIC_FAMILIES.includes(family)) throw new Error('family inválida')
  if (!SCIENTIFIC_ORIENTATIONS.includes(orientation)) throw new Error('orientation inválida')
  if (!SCIENTIFIC_SIDES.includes(sonicSide)) throw new Error('sonicSide inválido')
  if (!SCIENTIFIC_SIDES.includes(projectionSide)) throw new Error('projectionSide inválido')
  return Object.freeze({ id, kind, sourceId, segmentId, family, orientation, sonicSide, projectionSide })
}
