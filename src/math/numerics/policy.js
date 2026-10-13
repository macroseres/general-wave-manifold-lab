/**
 * Canonical numerical policy for the scientific core.
 *
 * Values are grouped by meaning on purpose: there is no universal epsilon.
 * Callers may override algorithmic controls through their public options, but
 * defaults live here so experiments can eventually serialize them verbatim.
 */
export const NUMERICAL_POLICY = Object.freeze({
  algebra: Object.freeze({
    regularityTolerance: 1e-10,
    cubicTolerance: 1e-12,
    rootDedupTolerance: 1e-9,
    quadraticRootDedupTolerance: 1e-8,
  }),
  charts: Object.freeze({
    finiteFiberTolerance: 1e-10,
    reciprocalFiberTolerance: 1e-10,
    reciprocalBoundaryTolerance: 1e-10,
    reciprocalZeroTolerance: 1e-10,
    zcClampMargin: 1e-7,
  }),
  spectrum: Object.freeze({
    coincidenceRelativeTolerance: 1e-10,
    coincidenceEventRelativeTolerance: 1e-13,
    coincidenceRefinementIterations: 48,
  }),
  integration: Object.freeze({
    absoluteTolerance: 1e-8,
    relativeTolerance: 1e-7,
    minStep: 1e-6,
    maxReject: 12,
    minimumStepPolicy: 'accept', // legacy behavior; 'reject' enforces tolerance strictly
    safety: 0.9,
    minFactor: 0.2,
    maxFactor: 2,
    eventValueTolerance: 1e-12,
    eventIterations: 48,
  }),
  rarefaction: Object.freeze({
    fieldRegularityTolerance: 1e-12,
    normalizedFieldFloor: 1e-11,
    orbitStep: 0.018,
    adaptiveAbsoluteTolerance: 1e-8,
    adaptiveRelativeTolerance: 1e-7,
    adaptiveMinStep: 1e-6,
    adaptiveMaxReject: 12,
    adaptiveSafety: 0.9,
    orbitMaxSteps: 1100,
    orbitZcLimit: 0.997,
    orbitSeedTauCount: 7,
    orbitSeedZCount: 9,
    orbitStagnationTolerance: 1e-7,
    singularityClassificationTolerance: 1e-7,
    eigenvectorNormFloor: 1e-12,
    jacobianRelativeStep: 1e-5,
    jacobianChartStep: 1e-5,
    finiteDirectionSlopeTolerance: 1e-10,
    finiteDomainTolerance: 1e-7,
    finiteEquilibriumResidualTolerance: 1e-6,
    infinityExistenceTolerance: 1e-12,
    infinitySearchTolerance: 1e-9,
    infinityJacobianStep: 1e-5,
    separatrixStep: 0.008,
    separatrixMaxSteps: 1800,
    separatrixSeed: 2e-4,
    separatrixZMax: 2.5,
    separatrixFieldFloor: 1e-12,
    separatrixTauMargin: 0.2,
    finiteSeparatrixStep: 0.012,
    finiteSeparatrixMaxSteps: 1300,
    finiteSeparatrixSeed: 0.012,
    finiteSeparatrixReturnTolerance: 0.006,
    finiteSeparatrixSaddleHitTolerance: 0.035,
  }),
  sonic: Object.freeze({
    determinantTolerance: 1e-10,
  }),
})

export function numericalPolicySnapshot() {
  return JSON.parse(JSON.stringify(NUMERICAL_POLICY))
}
