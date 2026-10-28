import { directShockDiagnostic } from './directShockDiagnostic.js'
import {constantContactConnection,constantContactDirections} from './contactChainCandidates.js'

/** Sampled, finite-amplitude sonic contacts on a fixed-state Hugoniot fibre.
 * forward: U_- fixed and s = lambda_i(U_+) (S+).
 * backward: U_+ fixed and s = lambda_i(U_-) (S-).
 * Interpolated crossings are candidates, not exact solutions of RH + sonic.
 */
export function finiteSonicContacts(fixed, segments, p, orientation, { tolerance = 1e-6 } = {}) {
  if (!fixed || !['forward', 'backward'].includes(orientation)) return []
  const events = []
  const hasContactModel=constantContactDirections(p).length>0
  for (const [segmentIndex, segment] of (segments ?? []).entries()) {
    let previous = null
    for (const [pointIndex, point] of (segment.points ?? []).entries()) {
      const variable = [point.u, point.v]
      const left = orientation === 'forward' ? fixed : variable
      const right = orientation === 'forward' ? variable : fixed
      const shock = directShockDiagnostic(left, right, p)
      if (shock.kind !== 'jump' || !shock.rankineHugoniot || !shock.spectrumLeft || !shock.spectrumRight) {
        previous = null
        continue
      }
      const spectrum = orientation === 'forward' ? shock.spectrumRight : shock.spectrumLeft
      const values = spectrum.map(lambda => shock.speed - lambda)
      const current = {point, pointIndex, values, speed: shock.speed, residual: shock.relativeResidual}
      for (let family = 0; family < 2; family++) {
        const scale = 1 + Math.abs(shock.speed) + Math.abs(spectrum[family])
        if (Math.abs(values[family]) <= tolerance * scale) {
          // An LD contact line is a continuum, not hundreds of isolated sonic roots.
          const name=family===0?'slow':'fast'
          if(hasContactModel&&constantContactConnection(left,right,p,name)){
            const existing=events.find(q=>q.kind==='constant-contact-continuum'&&q.segmentIndex===segmentIndex&&q.family===name)
            if(existing){existing.sampleCount++;existing.lastPoint=variable}
            else events.push({kind:'constant-contact-continuum',orientation,sonicSide:orientation==='forward'?'plus':'minus',family:name,
              segmentIndex,point:variable,lastPoint:variable,speed:shock.speed,sampleCount:1})
            continue
          }
          events.push({kind:'sample-near-zero', orientation, sonicSide:orientation==='forward'?'plus':'minus', family:family===0?'slow':'fast', segmentIndex, pointIndex, point:variable, speed:shock.speed, sonicResidual:Math.abs(values[family]), rhResidual:shock.relativeResidual})
        } else if (previous && previous.values[family] * values[family] < 0) {
          const alpha = Math.abs(previous.values[family])/(Math.abs(previous.values[family])+Math.abs(values[family]))
          events.push({kind:'bracketed-crossing', orientation, sonicSide:orientation==='forward'?'plus':'minus', family:family===0?'slow':'fast', segmentIndex, pointIndex, point:[previous.point.u+alpha*(point.u-previous.point.u),previous.point.v+alpha*(point.v-previous.point.v)], bracket:[previous.pointIndex,pointIndex], speed:previous.speed+alpha*(shock.speed-previous.speed), rhResidual:Math.max(previous.residual,shock.relativeResidual)})
        }
      }
      previous = current
    }
  }
  return events
}
