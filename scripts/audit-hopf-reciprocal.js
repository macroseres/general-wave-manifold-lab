import {defaultCoefficients} from '../src/math/flux/quadraticFlux.js'
import {reciprocalHopfSection} from '../src/math/sonic/hopfReciprocal.js'
console.log('Hopf reciprocal chart — r=(1,Z), Z=0 is projective infinity of z')
console.log('Bounds: free coordinate and X in [-6,6]; these are NOT tau and Y.')
for(const side of ['minus','plus'])for(const Z of [-.1,-.01,-.001,0,.001,.01,.1]){
 const d=reciprocalHopfSection(defaultCoefficients,{side,Z})
 console.log(side,Z,d.kind,d.kind==='sampled'?`det [${d.minDet.toPrecision(4)},${d.maxDet.toPrecision(4)}], positive ${d.positiveSamples}/${d.totalSamples}`:'')
}
