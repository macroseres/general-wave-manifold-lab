/** Shared curve presentation rules for SVG (2D) and drei Line (3D).
 * The meaning of color is owned by each scientific object; line patterns
 * express construction/orientation, never admissibility by themselves.
 */
export const SCIENTIFIC_CURVE_RULES = Object.freeze({
  primary: Object.freeze({ width2D: 1.8, width3D: 2.3 }),
  secondary: Object.freeze({ width2D: 1.1, width3D: 1.7 }),
  separatrix: Object.freeze({ width2D: 1.5, width3D: 2.3 }),
  auxiliary: Object.freeze({ width2D: 1.1, width3D: 1.7, dash2D: '7 5', dash3D: 0.10, gap3D: 0.065 }),
  reference: Object.freeze({ width2D: 1.0, width3D: 1.2, dash2D: '2 3', dash3D: 0.04, gap3D: 0.065 }),
  selected: Object.freeze({ width2D: 2.6, width3D: 3.0 }),
  hovered: Object.freeze({ width2D: 2.2, width3D: 2.7 }),
  // Geometric loci remain solid: color distinguishes the mathematical object.
  locus: Object.freeze({ width2D: 1.5, width3D: 2.0 }),
  specialLocus: Object.freeze({ width2D: 1.8, width3D: 2.5 }),
  // Visual distinction between integral families, without suggesting admissibility.
  integralSlow: Object.freeze({ width2D: 1.5, width3D: 2.1, dash2D: '9 4', dash3D: 0.13, gap3D: 0.055 }),
  integralFast: Object.freeze({ width2D: 1.5, width3D: 2.1, dash2D: '2 4', dash3D: 0.035, gap3D: 0.055 }),
})

export function scientificCurveStyle(kind = 'primary', dimension = '2d') {
  const rule = SCIENTIFIC_CURVE_RULES[kind]
  if (!rule) throw new Error(`Tipo de curva desconhecido: ${kind}`)
  if (dimension === '2d') return {
    strokeWidth: rule.width2D,
    ...(rule.dash2D ? { strokeDasharray: rule.dash2D } : {}),
  }
  if (dimension === '3d') return {
    lineWidth: rule.width3D,
    ...(rule.dash3D ? { dashed: true, dashSize: rule.dash3D, gapSize: rule.gap3D } : {}),
  }
  throw new Error(`Dimensão desconhecida: ${dimension}`)
}

/** Object-aware style classification shared by both plot renderers.
 * Patterns do not encode shock admissibility or numerical certainty.
 */
export function scientificLocusKind(id) {
  if (id === 'DS' || id === 'J' || id === 'BT-' || id === 'BT+') return 'specialLocus'
  return 'locus'
}
