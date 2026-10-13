import { classifyRiemannCharacteristicLifts } from './riemannLifts.js'
import { auditCoincidenceDegeneracies } from './coincidenceDegenerateAudit.js'

/** Local algebraic audit of characteristic directions over isolated zeros of D.
 * A characteristic direction is necessary for a point in the closure of the
 * coincidence incidence set, but does not prove a regular wave-manifold lift.
 */
export function auditCoincidenceLifts(p, window, tolerance = 1e-9) {
  const degeneracies = auditCoincidenceDegeneracies(p, window, tolerance)
  const points = degeneracies.isolatedPoints.map(point => {
    const spectrum = classifyRiemannCharacteristicLifts([point.u, point.v], p, tolerance)
    const directionCount = spectrum.kind === 'scalar-degenerate' ? 'contínuo projetivo' : spectrum.directions.length
    return {
      ...point,
      liftKind: spectrum.kind,
      directionCount,
      directions: spectrum.directions.map(d => ({ chart: d.chart, z: d.z, Z: d.Z, eigenResidual: d.eigenResidual })),
      interpretation: spectrum.kind === 'scalar-degenerate'
        ? 'Todas as direções são características neste estado; a fibra não é representada por pontos isolados.'
        : spectrum.kind === 'repeated-defective'
          ? 'Há uma única direção característica projetiva; regularidade do levantamento não certificada.'
          : 'Verificar a regularidade do levantamento na variedade de ondas.'
    }
  })
  return {
    type: degeneracies.type,
    points,
    globalWarning: degeneracies.type === 'identicamente nulo'
      ? 'Δ é identicamente nulo: a coincidência exige análise de fibras em todo o domínio, não apenas de uma curva.'
      : ['reta dupla', 'duas retas concorrentes', 'duas retas paralelas'].includes(degeneracies.type)
        ? 'Componentes degeneradas de Δ=0 exigem análise de incidência ao longo das retas.'
        : null
  }
}
