import {continueBtMinus} from './continueBtCurve.js'
import {smoothBtSegments} from './smoothBtCurve.js'

export function btMinusPaths(segments,p,window,mode){
  if(mode==='continuation'){
    const traced=continueBtMinus(segments,p,{...window,zcMax:.999},{step:.035,maxSteps:1000})
    if(traced.length)return traced
  }
  return smoothBtSegments(segments,p,'minus',3,320)
}

export const reflectBtPaths=paths=>paths.map(path=>path.map(([tau,Y,zc])=>[tau,-Y,zc]))
