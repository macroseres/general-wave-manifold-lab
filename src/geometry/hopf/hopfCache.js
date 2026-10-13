// Module-level cache survives React component unmounts and visibility changes.
// Entries are per side, so Hopf- and Hopf+ are independently reusable.
const entries=new Map()
const LIMIT=8
const now=()=>performance.now()

export function hopfCacheKey(geometryKey,side){
  return JSON.stringify([geometryKey,side])
}

export function requestHopfMesh(geometryKey,side,options,createWorker=()=>new Worker(new URL('./hopf.worker.js',import.meta.url),{type:'module'})){
  if(side!=='minus'&&side!=='plus')return Promise.reject(new Error('Invalid Hopf side'))
  const key=hopfCacheKey(geometryKey,side)
  const existing=entries.get(key)
  if(existing){
    entries.delete(key);entries.set(key,existing)
    const start=now()
    const cacheStatus=existing.status
    return existing.promise.then(result=>({...result,fromCache:true,lookupMs:now()-start,cacheStatus}))
  }
  const started=now()
  const cacheEntry={promise:null,status:'pending'}
  const promise=new Promise((resolve,reject)=>{
    let worker
    try{worker=createWorker()}catch(error){reject(error);return}
    worker.onmessage=({data})=>{
      if(data.key!==key)return
      worker.terminate()
      if(data.error){entries.delete(key);reject(new Error(data.error))}
      else resolve({meshes:data.meshes,profile:data.profile,workerRoundtripMs:now()-started})
    }
    worker.onerror=error=>{
      worker.terminate();entries.delete(key)
      reject(new Error(error?.message||'Hopf worker failed'))
    }
    worker.postMessage({...options,key,showMinus:side==='minus',showPlus:side==='plus'})
  })
  cacheEntry.promise=promise.then(result=>{cacheEntry.status='ready';return result})
  entries.set(key,cacheEntry)
  // Keep a bounded cache of completed and pending requests. Eviction does not
  // cancel a running worker, because another view may still await its result.
  while(entries.size>LIMIT)entries.delete(entries.keys().next().value)
  return cacheEntry.promise.then(result=>({...result,fromCache:false,lookupMs:now()-started,cacheStatus:'miss'}))
}

export function clearHopfCache(){entries.clear()}
