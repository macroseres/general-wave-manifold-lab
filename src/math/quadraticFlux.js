// Compatibility facade for the mathematical kernel.
// New code should import from the domain modules directly.

export {
  defaultCoefficients,
  flux,
  jacobian,
  oldWavePreset,
} from './flux/quadraticFlux.js'

export {
  chartCoordinates,
  fiber,
  zChartCoefficients,
  zFromZHat,
  zHatFromZ,
} from './charts/zChart.js'

export {
  ZChartCoefficients,
  fiberZ,
} from './charts/reciprocalChart.js'

export {
  discriminant,
  eigenResidual,
  rhResidual,
  waveState,
} from './manifold/waveState.js'

export { coincidencePoints, coincidenceTauRoots } from './manifold/coincidence.js'

export {
  det2,
  directionalJacobian,
  sonicData,
  sonicImplicit,
  sonicResidual,
} from './sonic/sonic.js'

export {
  rarefactionDirectionResidual,
  rarefactionField,
  rarefactionFieldZ,
} from './rarefaction/field.js'

export {
  infinityRarefactionSingularities,
  rarefactionJacobian,
  rarefactionSingularities,
} from './rarefaction/singularities.js'

export { infinityRarefactionSeparatrices } from './rarefaction/separatrices.js'

