/** Uniform evidence summary for either orientation of a composite-wave candidate.
 * This is a numerical triage, never a global entropy/admissibility certificate.
 */
export function compositeEvidence(connection) {
  const orientation = connection?.kind === 'shock-rarefaction' && connection?.contactSide === 'left'
    ? 'forward' : connection?.kind === 'rarefaction-shock' && connection?.contactSide === 'right'
      ? 'backward' : 'unsupported'
  const geometric = ['ordered-geometric-candidate', 'weak-lax-candidate'].includes(connection?.status)
  const weakLax = connection?.status === 'weak-lax-candidate'
  const liu = connection?.liuStatus ?? 'not-evaluated'
  let classification = 'inconclusive'
  if (orientation === 'unsupported') classification = 'unsupported-orientation'
  else if (liu === 'violation-detected') classification = 'numerical-liu-violation'
  else if (!geometric) classification = 'geometric-prerequisites-unmet'
  else if (!weakLax) classification = 'weak-lax-unverified'
  else if (liu === 'no-violation-detected') classification = 'no-violation-in-finite-tests'
  return {
    orientation,
    geometricOrdering: geometric ? 'compatible-in-sampled-trajectory' : 'not-established',
    weakLax: weakLax ? 'satisfied-at-endpoints' : 'not-established',
    liu,
    classification,
    entropyCertified: false,
  }
}

export function classifyCompositeEvidence(connections) {
  return (connections ?? []).map(connection => ({...connection, evidence: compositeEvidence(connection)}))
}
