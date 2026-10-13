import { sampleDiscriminantRegions } from './discriminantRegions.js'
import { classifyRiemannCharacteristicLifts } from './riemannLifts.js'
import { sampleDegenerateConic } from './degenerateConicSamples.js'
import { compareCharacteristicCharts } from '../manifold/chartConsistency.js'

/** Sample the reduced projective incidence q(U,[r])=det(r,DF(U)r)=0
 * along the visible D=0 contour. This does not certify a lift in W.
 * The sampling cannot discover isolated zeros or sign-preserving double lines.
 */
export function auditCoincidenceIncidence(p, window, {steps=64, tolerance=1e-8}={}) {
  const segments=sampleDiscriminantRegions(p,window,{steps}).segments
  const algebraic=sampleDegenerateConic(p,window,{tolerance})
  const counts={regular:0,degenerate:0,uncertain:0,scalar:0,missing:0}
  const examples=[]
  const manifold={regular:0,singular:0,uncertain:0,scalar:0}
  const manifoldExamples=[]
  const chartChecks={consistent:0,singleChart:0,disagreement:0,offLevel:0}
  const states=segments.map(([a,b])=>[(a.u+b.u)/2,(a.v+b.v)/2])
  // An identically zero discriminant has no sign-change contour.  It may
  // nevertheless contain scalar Jacobians, whose characteristic fibre is RP1.
  // Record that geometry separately without fabricating contour lifts/counts.
  if (states.length===0 && algebraic.type==='identicamente nulo' && algebraic.points.length) {
    const U=algebraic.points[Math.floor(algebraic.points.length/2)]
    const lift=classifyRiemannCharacteristicLifts(U,p,tolerance)
    if(lift.kind==='scalar-degenerate') manifold.scalar++
  }
  // Algebraic samples are independent evidence, not contour segments.
  for(const U of states){
    const lift=classifyRiemannCharacteristicLifts(U,p,tolerance)
    let status='uncertain'
    if(lift.kind==='scalar-degenerate')status='scalar'
    else if(lift.directions.length===0)status='missing'
    else if(lift.directions.some(d=>d.incidenceRegularity==='degenerate'))status='degenerate'
    else if(lift.directions.every(d=>d.incidenceRegularity==='regular'))status='regular'
    counts[status]++
    // On the coincidence boundary amplitude=0, test the rank of the
    // desingularized Rankine–Hugoniot map G=(DF(U)-sI)r in a projective chart.
    // This is a local level-set test, not a global lift-exhaustiveness test.
    if(lift.kind==='scalar-degenerate'){
      manifold.scalar++
      // A scalar Jacobian has an entire RP1 fibre, so testing a single
      // arbitrary direction would misrepresent the geometry.
    }else if(!lift.directions.length){
      manifold.uncertain++
    }else{
      const tests=lift.directions.map(d=>compareCharacteristicCharts(U,d.direction,d.speed,p,tolerance))
      for(const test of tests){
        if(test.status==='consistent')chartChecks.consistent++
        else if(test.status==='single-chart')chartChecks.singleChart++
        else if(test.status==='rank-disagreement')chartChecks.disagreement++
        else chartChecks.offLevel++
      }
      const kind=tests.every(t=>t.regular)?'regular':tests.some(t=>t.status==='rank-disagreement'||t.status==='off-level'||t.status==='invalid')?'uncertain':tests.some(t=>t.ranks.some(r=>r<2))?'singular':'uncertain'
      manifold[kind]++
      if(kind!=='regular'&&manifoldExamples.length<6)manifoldExamples.push({u:U[0],v:U[1],kind,ranks:tests.map(t=>t.ranks),charts:tests.map(t=>t.status)})
    }
    if(status!=='regular'&&examples.length<6)examples.push({u:U[0],v:U[1],status,kind:lift.kind})
  }
  return {segments:segments.length,algebraicSamples:algebraic.points.length,algebraicType:algebraic.type,counts,examples,manifold,manifoldExamples,chartChecks,
    status:states.length===0?'no-contour':counts.degenerate||counts.scalar||counts.missing||counts.uncertain?'mixed':'sample-regular',
    limitation:'Posto 2 certifica regularidade do nível desingularizado local. Posto menor que 2, mesmo nas duas cartas, indica falha do critério de posto, não singularidade geométrica comprovada. Divergências entre cartas sugerem condicionamento numérico; pontos escalares requerem análise da fibra projetiva.'}
}
