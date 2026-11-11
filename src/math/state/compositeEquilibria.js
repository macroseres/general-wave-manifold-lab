import { jacobian, oldWavePreset } from '../flux/quadraticFlux.js'

function shiftedJacobian(state,speed,{b1,b2,a,c}){
  return jacobian(state,oldWavePreset({B1:b1,B2:b2,a,c})).map((row,i)=>
    row.map((value,j)=>value-(i===j?speed:0)))
}

function solveQuadraticRealRoots(a,b,c){
  if(Math.abs(a)<1e-12)return Math.abs(b)<1e-12?[]:[-c/b]
  const discriminant=b*b-4*a*c
  if(discriminant<0)return []
  const root=Math.sqrt(discriminant)
  const numerator=-.5*(b+(b<0?-root:root))
  return numerator===0?[0]:[numerator/a,c/numerator]
}

// First-order jets give D(pi_-) on S- without differencing near a chart pole.
const jet = x => Array.isArray(x) ? x : [x, 0, 0]
const add = (a, b) => jet(a).map((x, i) => x + jet(b)[i])
const neg = a => jet(a).map(x => -x)
const sub = (a, b) => add(a, neg(b))
const mul = (a, b) => {
  a = jet(a); b = jet(b)
  return [a[0] * b[0], a[1] * b[0] + a[0] * b[1], a[2] * b[0] + a[0] * b[2]]
}
const div = (a, b) => {
  a = jet(a); b = jet(b)
  return [a[0] / b[0], (a[1] * b[0] - a[0] * b[1]) / b[0] ** 2,
    (a[2] * b[0] - a[0] * b[2]) / b[0] ** 2]
}

function compositeChart([q, coordinate], params, chart = 't') {
  const { b1: b, b2: d, c, a = 0 } = params
  const z = [coordinate, 0, 1], variable = [q, 1, 0]
  const z2 = mul(z, z), denominator = add(1, z2)
  let t, Y, u, v, speed
  if (chart.startsWith('infinity')) {
    // Z=1/z, T=-z²t, X=zY. This chart includes the identified infinite end.
    const Q = add(add(-(b + 1), mul(d * (b + 1), z)), z2)
    const D = sub(add(b + 1, mul(3, z2)), mul(d, mul(z2, z)))
    const P = add(add(b - 1, mul(d, z)), z2)
    const tc = mul(2 * b, mul(denominator, D)), yc = mul(denominator, Q), constant = mul(2 * c, mul(z, P))
    const T = chart === 'infinityY' ? div(sub(mul(yc, variable), constant), tc) : variable
    const X = chart === 'infinityY' ? variable : div(add(mul(tc, T), constant), yc)
    t = neg(mul(T, z2)); Y = mul(X, z)
    u = sub(add(div(mul(c, add(mul(2, z), d)), mul(b, denominator)), mul(sub(sub(1, mul(d, z)), z2), T)), mul(0.5, X))
    v = sub(add(div(-c, denominator), mul(b, mul(z, T))), mul(0.5, mul(X, z)))
    speed = sub(add(a, div(mul(c, add(mul(b + 2, z), d * (b + 1))), mul(b, denominator))), mul(Q, T))
  } else {
    const Q = sub(add(1, mul(d * (b + 1), z)), mul(b + 1, z2))
    const P = add(add(1, mul(d, z)), mul(b - 1, z2))
    const B = sub(add(mul(b + 1, mul(z2, z)), mul(3, z)), d)
    const tc = mul(-2 * b, mul(denominator, B)), yc = mul(denominator, Q), constant = mul(2 * c, P)
    t = chart === 't' ? variable : div(sub(mul(yc, variable), constant), tc)
    Y = chart === 'Y' ? variable : div(add(mul(tc, variable), constant), yc)
    u = sub(add(div(mul(c, mul(z, add(2, mul(d, z)))), mul(b, denominator)), mul(sub(add(1, mul(d, z)), z2), t)), mul(0.5, mul(z, Y)))
    v = sub(sub(div(mul(-c, z2), denominator), mul(b, mul(z, t))), mul(0.5, Y))
    speed = add(add(a, div(mul(c, mul(z, add(b + 2, mul(d * (b + 1), z)))), mul(b, denominator))), mul(Q, t))
  }
  const physicalZ = chart.startsWith('infinity') ? 1 / coordinate : coordinate
  return { state: [u[0], v[0]], derivative: [[u[1], u[2]], [v[1], v[2]]], speed: speed[0],
    point: { t: t[0], Y: Y[0], z: physicalZ, coords: [t[0], Y[0], physicalZ] } }
}

function compositeField(point, params, chart = 't', row = 0) {
  const surface = compositeChart(point, params, chart)
  const m = shiftedJacobian(surface.state, surface.speed, params)[row]
  const d = surface.derivative
  // ker((DF(pi_-)-sI) Dpi_-), oriented in this local regularization.
  return [-(m[0] * d[0][1] + m[1] * d[1][1]), m[0] * d[0][0] + m[1] * d[1][0]]
}

function diagnose(origin, params, chart, id) {
  const surface = compositeChart(origin, params, chart)
  const m = shiftedJacobian(surface.state, surface.speed, params)
  const row = Math.hypot(...m[0]) >= Math.hypot(...m[1]) ? 0 : 1
  if (!surface.state.every(Number.isFinite) || Math.hypot(...m[row]) < 1e-9) return null
  const scale = Math.max(1, Math.hypot(...m[row]) * Math.hypot(...surface.derivative.flat()))
  if ([0, 1].some(r => Math.hypot(...compositeField(origin, params, chart, r)) > 1e-8 * scale)) return null
  return { ...surface.point, id, origin, chart, row, state:surface.state, Upsilon:chart === "infinity" ? 0 : undefined }
}

export function compositeSingularities(params) {
  const { b1: b, b2: d, c } = params
  if (Math.abs(b) < 1e-8 || Math.abs(c) < 1e-8 || Math.abs(b + 1) < 1e-8) return []
  // Resultant of the two pullback coefficients: (2z-d) P Q R, after
  // discarding non-real factors and chart denominators. Every candidate is
  // verified in BOTH matrix rows, in a regular surface chart.
  const candidates = new Set([d / 2,
    ...solveQuadraticRealRoots(b - 1, d, 1),
    ...solveQuadraticRealRoots(-(b + 1), d * (b + 1), 1),
    ...solveQuadraticRealRoots((b + 1) ** 2, -(b + 1) * d, b - 1)])
  const points = []
  for (const z of candidates) {
    const Q = 1 + d * (b + 1) * z - (b + 1) * z * z
    const B = (b + 1) * z ** 3 - d + 3 * z
    const chart = Math.abs(Q) >= Math.abs(2 * b * B) ? 't' : 'Y'
    if (Math.max(Math.abs(Q), Math.abs(2 * b * B)) < 1e-8) continue
    for (const row of [0, 1]) {
      const f0 = compositeField([0, z], params, chart, row)
      const f1 = compositeField([1, z], params, chart, row)
      const fm = compositeField([-1, z], params, chart, row)
      const slope = (f1[1] - fm[1]) / 2
      const values = Math.abs(slope) > 1e-10 ? [-f0[1] / slope]
        : solveQuadraticRealRoots((f1[0] + fm[0]) / 2 - f0[0], (f1[0] - fm[0]) / 2, f0[0])
      for (const q of values) {
        const point = diagnose([q, z], params, chart, `K-critical-${points.length}`)
        if (point && !points.some(p => Math.hypot(p.t - point.t, p.Y - point.Y, p.z - z) < 1e-6)) points.push(point)
      }
    }
  }
  const infinity = diagnose([0, 0], params, 'infinity', 'K-critical-infinity')
  if (infinity) points.push({ ...infinity, visualPositions: [[0, 0, -1], [0, 0, 1]] })
  return points
}


export function compositeSaddleBranches(equilibria,params,visibility){
  const branches=[]
  for(const {origin,chart,row} of equilibria){
    const atInfinity=chart==='infinity'
    const field=q=>compositeField(q,params,chart,row)
    const h=1e-5
    const columns=origin.map((_,axis)=>{
      const plus=origin.map((x,i)=>x+(i===axis?h:0))
      const minus=origin.map((x,i)=>x-(i===axis?h:0))
      const f=field(plus),g=field(minus)
      return f.map((x,i)=>(x-g[i])/(2*h))
    })
    const [[a,c],[b,d]]=columns
    const determinant=a*d-b*c
    if(!Number.isFinite(determinant)||determinant>=-1e-10)continue
    const trace=a+d
    const discriminant=Math.sqrt(trace*trace-4*determinant)
    for(const stable of [true,false]){
      if(!visibility[(atInfinity?'infinity':'finite')+(stable?'Stable':'Unstable')])continue
      const lambda=(trace+(stable?-discriminant:discriminant))/2
      const vectors=[[b,lambda-a],[lambda-d,c]]
      const direction=vectors.sort((u,v)=>Math.hypot(...v)-Math.hypot(...u))[0]
      const norm=Math.hypot(...direction)
      if(norm===0)continue
      const add=(q,v,step)=>q.map((x,i)=>x+step*v[i])

      for(const sign of [-1,1]){
        let q=add(origin,direction,sign*1e-5/norm)
        const points=[compositeChart(origin,params,chart),compositeChart(q,params,chart)]
        let activeChart=chart,orientation=stable?-1:1
        const step=.001
        const unit=q=>{
          const v=compositeField(q,params,activeChart,row),length=Math.hypot(...v)
          return length>1e-12?v.map(x=>orientation*x/length):[NaN,NaN]
        }
        for(let i=0;i<12000;i++){
          const reciprocal=activeChart==="infinity"
          if(!reciprocal||Math.abs(q[1])>1){
            const z=reciprocal?1/q[1]:q[1],{b1:b,b2:d}=params
            const YDenominator=Math.abs(2*b*((b+1)*z**3+3*z-d))
            const tDenominator=Math.abs(1+(b+1)*z*(d-z))
            const nextChart=reciprocal?(tDenominator>=YDenominator?'t':'Y') : activeChart==='Y'&&tDenominator>2*YDenominator?'t'
              :activeChart==='t'&&YDenominator>2*tDenominator?'Y':activeChart
            if(nextChart!==activeChart){
              const old=compositeChart(q,params,activeChart).point
              const probe=compositeChart(add(q,unit(q),1e-7),params,activeChart).point
              const target=[old[nextChart],z]
              const tangent=compositeField(target,params,nextChart,row)
              const dot=tangent[0]*(probe[nextChart]-target[0])+tangent[1]*(probe.z-z)
              if(Number.isFinite(dot)&&dot!==0){
                orientation=Math.sign(dot)
                activeChart=nextChart
                q=target
              }
            }
          }
          const k1=unit(q),k2=unit(add(q,k1,step/2))
          const k3=unit(add(q,k2,step/2)),k4=unit(add(q,k3,step))
          const next=q.map((x,j)=>x+step*(k1[j]+2*k2[j]+2*k3[j]+k4[j])/6)
          if(!next.every(Number.isFinite)||Math.hypot(...next.map((x,j)=>x-q[j]))<.0002)break
          const point=compositeChart(next,params,activeChart)
          if(![...point.state,point.point.Y].every(Number.isFinite))break
          points.push(point)
          q=next
        }
        branches.push({points,stable,atInfinity,chart})
      }
    }
  }
  return branches
}