import {waveColors} from '../../config/waveColors.js'
import {requestHopfMesh} from '../../geometry/hopf/hopfCache.js'
import {useEffect, useMemo, useRef, useState} from 'react'
import * as THREE from 'three'
import {makeSonicBufferGeometry} from '../../rendering/sonicBufferGeometry.js'
import {disposeGeometry} from '../../rendering/graphicsLifecycle.js'

export function HopfSurfaces({p,tauMin,tauMax,YMin,YMax,showMinus,showPlus,surfaceOpacity,traceOnly=false}){
  // Geometry depends on the flux and sampling domain, never on visibility.
  // Keep this component mounted even when both Hopf surfaces are hidden.
  const geometryKey=JSON.stringify([p,tauMin,tauMax,YMin,YMax,traceOnly])
  const [result,setResult]=useState({key:null,minus:null,plus:null})
  const [,setStatus]=useState('calculando')
  const previousKeyRef=useRef(null)
  useEffect(()=>{
    let active=true
    const started=performance.now()
    setStatus('calculando')
    if(previousKeyRef.current!==null&&previousKeyRef.current!==geometryKey){
      let changes=[]
      try{const before=JSON.parse(previousKeyRef.current),after=JSON.parse(geometryKey);const labels=['fluxo','tauMin','tauMax','YMin','YMax','traceOnly'];changes=labels.filter((label,i)=>JSON.stringify(before[i])!==JSON.stringify(after[i]))}catch{changes=['chave alterada']}
      console.info(`[geometria] Hopf: configuração alterada (${changes.join(', ')||'não identificada'})`)
    }
    previousKeyRef.current=geometryKey
    // Dagger symmetry: plus at Y is minus at -Y. A symmetric window
    // shares one worker/mesh; asymmetric windows use the reflected domain.
    const symmetric=Math.abs(YMin+YMax)<1e-12
    const reflectedKey=symmetric?geometryKey:JSON.stringify([p,tauMin,tauMax,-YMax,-YMin,traceOnly])
    const minusRequest=requestHopfMesh(geometryKey,'minus',{p,tauMin,tauMax,YMin,YMax,traceOnly})
    const plusRequest=symmetric?minusRequest:requestHopfMesh(reflectedKey,'minus',{p,tauMin,tauMax,YMin:-YMax,YMax:-YMin,traceOnly})
    Promise.all([minusRequest,plusRequest]).then(entries=>{
      if(!active)return
      setResult({key:geometryKey,minus:entries[0],plus:entries[1]})
      setStatus('pronto')
      const elapsed=performance.now()-started
      console.info(`[geometria] Hopf †: ${elapsed.toFixed(0)} ms; ${symmetric?'1 malha compartilhada':'2 janelas refletidas'}`)
      for(let i=0;i<(symmetric?1:2);i++){
        const e=entries[i],profile=e.profile?.minus
        const fmt=n=>Number.isFinite(n)?n.toFixed(0):'—'
        console.info(`[geometria] Hopf${i===0?'⁻':'⁺†'}: cache=${e.cacheStatus}; worker=${fmt(e.workerRoundtripMs)} ms; finita=${fmt(profile?.finiteMs)} ms; recíproca=${fmt(profile?.reciprocalMs)} ms`)
      }
    }).catch(error=>{
      if(!active)return
      console.error('Hopf worker:',error)
      setStatus('erro')
    })
    return ()=>{active=false}
    // p is represented by value in geometryKey; visibility is intentionally absent.
  },[geometryKey,p,tauMin,tauMax,YMin,YMax,traceOnly])
  const meshes=useMemo(()=>{
    if(result.key!==geometryKey||!result.minus||!result.plus)return null
    const output={}
    for(const [name,mesh] of Object.entries(result.minus.meshes)){
      if(mesh&&(name==='minus'||name==='minusRec'))output[name]=makeSonicBufferGeometry(mesh)
    }
    if(result.plus!==result.minus){
      for(const [name,mesh] of Object.entries(result.plus.meshes)){
        if(mesh&&(name==='minus'||name==='minusRec'))output[`dagger_${name}`]=makeSonicBufferGeometry(mesh)
      }
    }
    return output
  },[result,geometryKey])
  useEffect(()=>()=>{if(meshes)Object.values(meshes).forEach(disposeGeometry)},[meshes])
  return <group>
    <group visible={showMinus}>
      {meshes?.minus&&<mesh geometry={meshes.minus} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfMinus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
      {meshes?.minusRec&&<mesh geometry={meshes.minusRec} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfMinus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
    </group>
    <group visible={showPlus} scale={[1,-1,1]}>
      {meshes?.minus&&<mesh geometry={meshes.dagger_minus||meshes.minus} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfPlus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
      {meshes?.minusRec&&<mesh geometry={meshes.dagger_minusRec||meshes.minusRec} frustumCulled={false}><meshStandardMaterial color={waveColors.hopfPlus} side={THREE.DoubleSide} transparent opacity={surfaceOpacity*0.8} depthWrite={false} roughness={0.55} metalness={0.0}/></mesh>}
    </group>

  </group>
}
