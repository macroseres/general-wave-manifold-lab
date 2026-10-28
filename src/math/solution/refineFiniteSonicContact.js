import { directShockDiagnostic } from './directShockDiagnostic.js'

/** Solve the two scalar equations RH collinearity and s-lambda_i(U_sonic)=0.
 * A converged point is a numerical root, not an entropy-admissible wave.
 */
export function refineFiniteSonicContact(fixed, seed, p, orientation, family, {
  tolerance = 1e-9, maxIterations = 32, minimumJump = 1e-5,
  requireIsolated = false, isolationTolerance = 1e-8,
} = {}) {
  if (!Array.isArray(fixed) || !Array.isArray(seed) || !fixed.every(Number.isFinite) ||
      !seed.every(Number.isFinite) || !['forward', 'backward'].includes(orientation) ||
      !['slow', 'fast'].includes(family)) return { status: 'invalid-input' }
  const index = family === 'slow' ? 0 : 1
  const evaluate = U => {
    const left = orientation === 'forward' ? fixed : U
    const right = orientation === 'forward' ? U : fixed
    const shock = directShockDiagnostic(left, right, p)
    if (shock.kind !== 'jump' || shock.magnitude < minimumJump) return null
    const spectrum = orientation === 'forward' ? shock.spectrumRight : shock.spectrumLeft
    if (!spectrum || !(spectrum[1] - spectrum[0] > 1e-10 * (1 + Math.abs(spectrum[0]) + Math.abs(spectrum[1])))) return null
    // The normalized RH residual is signed using the normal to the jump.
    const jump = shock.jump
    const cross = (jump[0] * shock.residual[1] - jump[1] * shock.residual[0]) /
      (shock.magnitude * (1 + Math.abs(shock.speed) * shock.magnitude))
    const sonic = (shock.speed - spectrum[index]) / (1 + Math.abs(shock.speed) + Math.abs(spectrum[index]))
    return { residuals: [cross, sonic], norm: Math.hypot(cross, sonic), shock }
  }
  let U = [...seed]
  let current = evaluate(U)
  if (!current) return { status: 'outside-domain', point: U }
  for (let iteration = 0; iteration <= maxIterations; iteration++) {
    if (current.norm <= tolerance && current.shock.relativeResidual <= tolerance) {
      if(requireIsolated){
        const columns=[0,1].map(axis=>{
          const h=1e-5*(1+Math.abs(U[axis])),plus=[...U],minus=[...U]
          plus[axis]+=h;minus[axis]-=h
          const a=evaluate(plus),b=evaluate(minus)
          return a&&b?a.residuals.map((v,i)=>(v-b.residuals[i])/(2*h)):null
        })
        if(!columns.every(Boolean))return {status:'isolation-unverified',point:U,residual:current.norm}
        const [[a,c],[b,d]]=columns,det=a*d-b*c
        if(Math.abs(det)<isolationTolerance*(1+Math.hypot(a,b)*Math.hypot(c,d)))
          return {status:'non-isolated-or-singular-root',point:U,residual:current.norm,rhResidual:current.shock.relativeResidual}
      }
      return { status: 'converged', point: U, iterations: iteration, residual: current.norm,
        rhResidual: current.shock.relativeResidual, sonicResidual: Math.abs(current.residuals[1]),
        speed: current.shock.speed, orientation, family }
    }
    if (iteration === maxIterations) break
    const columns = []
    for (let axis = 0; axis < 2; axis++) {
      const h = 1e-5 * (1 + Math.abs(U[axis]))
      const plus = [...U]; plus[axis] += h
      const minus = [...U]; minus[axis] -= h
      const fp = evaluate(plus), fm = evaluate(minus)
      if (!fp || !fm) return { status: 'singular-jacobian', point: U, residual: current.norm }
      columns.push(fp.residuals.map((value, k) => (value - fm.residuals[k]) / (2 * h)))
    }
    const [[a, c], [b, d]] = columns
    const det = a * d - b * c
    if (Math.abs(det) < 1e-13 * (1 + Math.hypot(a, b) * Math.hypot(c, d)))
      return { status: 'singular-jacobian', point: U, residual: current.norm }
    const [f, g] = current.residuals
    const delta = [(d * f - b * g) / det, (-c * f + a * g) / det]
    let accepted = false
    for (let scale = 1; scale >= 1 / 1024; scale /= 2) {
      const candidate = U.map((v, k) => v - scale * delta[k])
      const next = evaluate(candidate)
      if (next && next.norm < current.norm) {
        U = candidate; current = next; accepted = true; break
      }
    }
    if (!accepted) return { status: 'stalled', point: U, residual: current.norm }
  }
  return { status: 'max-iterations', point: U, residual: current.norm }
}

export function refineFiniteSonicContacts(fixed, events, p, orientation, options) {
  return (events ?? []).map(event => ({ ...event,
    refinement: event.kind==='constant-contact-continuum'?{status:'non-isolated-contact-continuum'}:
      refineFiniteSonicContact(fixed, event.point, p, orientation, event.family, {...options,requireIsolated:true}),
  }))
}
