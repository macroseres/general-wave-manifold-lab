import {classifyFluxConic} from './conicClassification.js'

// Each pixel represents the real zero-locus type of D(u,v), not a dynamical bifurcation class.
export const conicCategory = type => {
  if(type === 'elipse' || type === 'ponto isolado') return 'compacto'
  if(type === 'elipse imaginária' || type === 'retas paralelas imaginárias' || type === 'constante não nula') return 'vazio'
  if(type === 'hipérbole' || type === 'duas retas concorrentes') return 'hiperbólico'
  if(type === 'parábola') return 'parabólico'
  if(type === 'duas retas paralelas' || type === 'reta dupla' || type === 'reta') return 'retas'
  return 'degenerado'
}
export function sampleParameterDiagram(p, horizontal, vertical, xMin, xMax, yMin, yMax, resolution=41) {
  if(horizontal === vertical) throw new Error('Selecione parâmetros distintos')
  if(!Number.isInteger(resolution) || resolution<2 || resolution>151) throw new Error('Resolução inválida')
  const cells=[]
  for(let j=0;j<resolution;j++){
    const y=yMax-(j+.5)*(yMax-yMin)/resolution
    for(let i=0;i<resolution;i++){
      const x=xMin+(i+.5)*(xMax-xMin)/resolution
      const type=classifyFluxConic({...p,[horizontal]:x,[vertical]:y}).type
      cells.push({i,j,x,y,type,category:conicCategory(type)})
    }
  }
  return cells
}
