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
  zFromZc,
  zcFromZ,
} from './charts/zChart.js'

export {
  ZChartCoefficients,
  fiberZ,
} from './charts/reciprocalChart.js'

export {
  eigenResidual,
  rhResidual,
  waveState,
} from './manifold/waveState.js'

export { characteristicSpectrum, discriminant } from './characteristic/spectrum.js'

export { coincidencePoints, coincidenceTauRoots } from './characteristic/coincidence.js'

export {
  det2,
  directionalJacobian,
  sonicData,
  sonicDeterminant,
  sonicFullImplicit,
  sonicImplicit,
  sonicResidual,
} from './sonic/sonic.js'

export {
  rarefactionDirectionResidual,
  rarefactionField,
  rarefactionFieldZ,
} from './rarefaction/field.js'

export {
  infinityRarefactionLinearData,
  infinityRarefactionSingularities,
  rarefactionJacobian,
  rarefactionSingularities,
} from './rarefaction/singularities.js'

export { infinityRarefactionSeparatrices, reciprocalPointToFiniteDisplay } from './rarefaction/separatrices.js'

export { projectRarefactionOrbitToState, rarefactionOrbits, splitProjectedRarefactionByBranch } from './rarefaction/orbits.js'

export { finiteRarefactionSeparatrices } from './rarefaction/finiteSeparatrices.js'

export {
  stateFiberPoint,
  stateFiberPointReciprocal,
  characteristicLiftPolynomial,
  characteristicLifts,
} from './state/fibers.js'
export { hugoniotSpectralDiagnostic } from './state/hugoniotSpectrum.js'
export { fixedStateSpectralPoint, spectralSignature, spectralCount, spectralCountSignature, laxClass2x2, partitionHugoniotSpectralRegions } from './state/hugoniotSpectralRegions.js'
export {classifyShockConfiguration,classifySpectralDiagnostic} from './state/shockConfiguration.js'
export {reciprocalSonicImplicit} from './sonic/reciprocalSonic.js'

export { genericState, riemannData, localEndpointStates, genericInverseImages, riemannInverseImages } from './state/stateRoles.js'
export { saturationSeeds, forwardSaturationSeeds, backwardSaturationSeeds } from './state/saturation.js'
export { COMPOSITE_CONSTRUCTIONS, compositeConstruction, compositeSonicResidual, isOnCompositeSonicSheet } from './state/composite.js'
export { compositeLeafIntersections, traceCompositeField } from './state/compositeTrace.js'
