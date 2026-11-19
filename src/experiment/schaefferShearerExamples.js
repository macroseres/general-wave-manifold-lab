import {oldWavePreset} from '../math/flux/quadraticFlux.js'

// Startup presets from wave-manifold-app's schaefferShearerConfig.js.
// z is compactified by this app, so the old finite z window is not copied.
export const schaefferShearerExamples = [
  ['ia','I-A',-1.5,.5],
  ['ib','I-B',-2,1],
  ['ic','I-C',-3,.5],
  ['iia','II-A',-.5,1],
  ['iib','II-B',-2.5,3],
  ['iic','II-C',-4.5,2],
  ['iiia','III-A',4,4],
  ['iiib','III-B',2,4],
  ['iiic','III-C',.5,1],
  ['iv','IV',8,.2],
].map(([id,label,B1,B2])=>({
  id,label,B1,B2,
  coefficients:oldWavePreset({B1,B2,a:0,c:1}),
  domain:{tauMin:-1.5,tauMax:1.5,YMin:-3.5,YMax:3.5},
  axisScale:{tau:2.5,Y:id==='iv'?.8:.6,zc:id==='iv'?4:2.5},
}))
