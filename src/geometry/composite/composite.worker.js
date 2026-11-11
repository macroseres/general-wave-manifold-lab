import {buildCompositeSceneData} from './compositeSceneData.js'

self.onmessage=({data:{p,tauMin,tauMax,options}})=>{
  self.postMessage(buildCompositeSceneData(p,tauMin,tauMax,options))
}
