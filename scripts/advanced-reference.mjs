import {readFileSync,writeFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'
import {oldWavePreset,flux,jacobian} from '../src/math/flux/quadraticFlux.js'
import {infinityRarefactionLinearData} from '../src/math/rarefaction/singularities.js'
import {infinityRarefactionSeparatrices} from '../src/math/rarefaction/separatrices.js'
import {classifyFluxConic} from '../src/math/flux/conicClassification.js'
import {transformQuadraticFlux} from '../src/math/flux/affineClassification.js'

export const advanced=JSON.parse(readFileSync(new URL('../docs/examples/advanced-reference.json',import.meta.url),'utf8'))
export const triangular=JSON.parse(readFileSync(new URL('../docs/examples/'+advanced.triangularFluxFixture,import.meta.url),'utf8')).coefficients

export function compositePoint(alpha){
  const h=advanced.composite.halfJump,left=[alpha,alpha+h],right=[alpha,alpha-h],s=alpha
  const FL=flux(left,triangular),FR=flux(right,triangular)
  const residual=FR.map((x,i)=>x-FL[i]-s*(right[i]-left[i]))
  const determinant=U=>{const J=jacobian(U,triangular);return (J[0][0]-s)*(J[1][1]-s)-J[0][1]*J[1][0]}
  return {alpha,left,right,s,residual,sonicLeft:determinant(left),sonicRight:determinant(right)}
}

export function buildAdvancedReference(){
  const p=oldWavePreset(advanced.classification),sp=oldWavePreset(advanced.separatrix)
  const {alphaMin,alphaMax}=advanced.composite
  const composite=Array.from({length:41},(_,i)=>compositePoint(alphaMin+(alphaMax-alphaMin)*i/40))
  const ellipse=Array.from({length:81},(_,i)=>{const t=2*Math.PI*i/80;return {u:Math.cos(t)/8,v:(Math.sin(t)-1)/2}})
  const separatrices=infinityRarefactionSeparatrices(sp,advanced.separatrix).map(q=>({id:q.id,stable:q.stable,
    timeDirection:q.timeDirection,reciprocalPoints:q.reciprocalPoints,finiteCount:q.points.length}))
  return {composite,separatrix:{linear:infinityRarefactionLinearData(sp),curves:separatrices},
    classification:{ellipse,type:classifyFluxConic(p).type,cases:[{B1:8,c:1},{B1:8,c:0},{B1:0,c:1},{B1:0,c:0}]
      .map(q=>({...q,type:classifyFluxConic(oldWavePreset({...q,B2:0})).type}))},
    affine:transformQuadraticFlux(triangular,advanced.affine.A,advanced.affine.translation)}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report=buildAdvancedReference()
  if(process.argv[2]==='--json')writeFileSync(new URL('../docs/examples/advanced-reference-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n')
  console.log(JSON.stringify({compositeMaxResidual:Math.max(...report.composite.flatMap(q=>q.residual.map(Math.abs))),
    eigenvalues:report.separatrix.linear.eigenvalues,branches:report.separatrix.curves.length,cases:report.classification.cases},null,2))
}
