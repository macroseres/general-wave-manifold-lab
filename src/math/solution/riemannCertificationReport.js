import {stateCharacteristicDirection} from '../rarefaction/stateIntegralCurves.js'
import {sonicShockAdmissibility} from './sonicShockAdmissibility.js'
import {validatedKR} from './validatedKR.js'

const finite=U=>Array.isArray(U)&&U.length===2&&U.every(Number.isFinite)
const distance=(a,b)=>finite(a)&&finite(b)?Math.hypot(a[0]-b[0],a[1]-b[1]):null

/** Audit the evidence actually available for the selected chain. Continuous
 * floating-point bounds and sampled ODE data are kept distinct from a validated
 * enclosure of an exact solution. Viscous profiles are a separate criterion.
 */
export function riemannCertificationReport(candidate,classification,p){
  const validation=classification?.validation??(candidate?.pattern==='KR'?validatedKR(candidate,p):null)
  const segments=candidate?.segments??[]
  const fans=segments.flatMap((segment,index)=>{
    if(segment.type!=='rarefaction')return []
    const states=segment.states??[],speeds=segment.speeds??[]
    const fields=states.map(U=>stateCharacteristicDirection(U,p,segment.family))
    const complete=states.length>=2&&states.every(finite)&&fields.every(Boolean)&&
      speeds.length===states.length&&speeds.every(Number.isFinite)
    return [{index,family:segment.family,checked:states.length,
      status:complete?'sampled':'unverified',
      minimumDiscriminant:complete?Math.min(...fields.map(q=>q.delta)):null,
      maximumSpeedError:complete?Math.max(...fields.map((q,i)=>Math.abs(q.lambda-speeds[i]))):null,
      ordered:complete&&speeds.every((s,i)=>i===0||s>=speeds[i-1]),
      startError:distance(states[0],segment.from),endError:distance(states.at(-1),segment.to)}]
  })
  const shocks=segments.flatMap((segment,index)=>{
    if(segment.type!=='shock')return []
    const sonic=['minus','plus'].includes(segment.sonicSide)
      ?sonicShockAdmissibility(segment.from,segment.to,p,segment.family,segment.sonicSide):null
    return [{index,sonicStatus:sonic?.passes?'numerically-compatible':'unverified',
      sonicSpeedError:sonic?.passes?Math.abs(sonic.speed-
        (segment.sonicSide==='minus'?sonic.spectrumLeft:sonic.spectrumRight)[segment.family==='slow'?0:1]):null,
      rhResidual:classification?.waves[index]?.conservation?.relativeResidual,
      liu:classification?.waves[index]?.admissibility?.liu?.status}]
  })
  const boundaryErrors=[distance(segments[0]?.from,candidate?.left),
    distance(segments.at(-1)?.to,candidate?.right)]
  const boundaryScale=1+Math.max(...[candidate?.left,candidate?.right].filter(finite).map(U=>Math.hypot(...U)),0)
  const boundariesMatch=boundaryErrors.every(error=>error!==null&&error<=1e-8*boundaryScale)
  const pending=[]
  if(!boundariesMatch)pending.push('Verificar a ligação aos estados iniciais U_L e U_R.')
  if(fans.length)pending.push('Validar a integração das rarefações entre as amostras, com limites de erro para a curva integral, a hiperbolicidade e o crescimento da velocidade característica.')
  if(shocks.length)pending.push('Obter limites de erro conjuntos para os estados, Rankine–Hugoniot, a ligação sônica e as interseções que unem os trechos.')
  if(shocks.some(q=>q.liu==='continuous-liu-compatible'))
    pending.push('Validar o limite de Liu incluindo o erro dos estados e do arredondamento, por limites rigorosos ou demonstração analítica. O teste contínuo atual usa ponto flutuante e tolerância.')
  if(shocks.some(q=>q.liu!=='continuous-liu-compatible'))
    pending.push('Concluir o teste de Liu de cada choque cujo arco contínuo ainda não foi verificado.')
  pending.push('Reunir essas validações para o perfil autossimilar completo, incluindo os traços iniciais e a ordem das velocidades nas junções.')
  return {status:validation?.status==='validated'?'validated':'not-certified',criterion:'Liu',
    boundariesMatch,boundaryErrors,fans,shocks,
    pending:validation?.status==='validated'?[]:pending,validation}
}
