import { defaultCoefficients } from '../src/math/flux/quadraticFlux.js'
import { hopfEndDiagnostics } from '../src/math/sonic/hopfAsymptotic.js'
const rows=hopfEndDiagnostics(defaultCoefficients)
console.log('Hopf endpoint audit — default flux; tau in [-1,1], Y in [-6,6]')
console.log('A positive sample certifies existence at that slice; zero samples do not prove absence.')
for(const row of rows){
  const status=row.kind==='sampled'?`${row.positiveSamples}/${row.totalSamples} det>0; det range [${row.minDet.toExponential(2)}, ${row.maxDet.toExponential(2)}]`:row.kind
  console.log(`${row.side.padEnd(5)} ${row.end>0?'+':'-'}  margin=${row.margin.toFixed(3)}  ${status}`)
}
