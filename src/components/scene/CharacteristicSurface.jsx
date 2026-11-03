import ScientificPoint3D from '../ScientificPoint3D.jsx'
import {exceptionalMarkers} from '../../math/characteristic/exceptionalMarkers.js'
import {scientificCurveStyle} from '../../config/scientificCurveRules.js'
import {useMemo} from 'react'
import * as THREE from 'three'
import {characteristicMesh} from '../../geometry/characteristic/mesh.js'
import {Line, clamp} from './shared.jsx'

// C_s and C_f are classified by the selected eigenvalue, never by screen position.
const CHARACTERISTIC_COLORS={slow:'#87cefa',fast:'#f08080'}
export function CharacteristicSurface({tauMin,tauMax,p,_point,setPoint,showSlow=true,showFast=true,showCoincidence=true,sharedLoci=[],surfaceOpacity=0.15,onInspectPoint}){
  const surfaces=useMemo(()=>{
    return characteristicMesh(p,tauMin,tauMax)
  },[p,tauMin,tauMax])
  return <>
    {surfaces.leaves.filter(item=>item.branch==='slow'?showSlow:showFast).map(item=><mesh key={item.branch} onPointerDown={e=>{e.stopPropagation();const selected={tau:clamp(e.point.x,tauMin,tauMax),Y:0,zc:clamp(e.point.z,-.999,.999)};setPoint(q=>({...q,...selected}));onInspectPoint?.(selected)}}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[item.coords,3]}/></bufferGeometry>
      <meshStandardMaterial color={CHARACTERISTIC_COLORS[item.branch]} side={THREE.DoubleSide} transparent opacity={surfaceOpacity} depthWrite={false} depthTest={true} roughness={0.55} metalness={0.0}/>
    </mesh>)}
    {showCoincidence&&sharedLoci.filter(item=>item.id==='E').flatMap(item=>item.paths.map((path,i)=><Line key={i} points={path}  color="#bc9cba" {...scientificCurveStyle('locus','3d')} depthTest={false} renderOrder={5}/>))}
  </>
}

export function ExceptionalDirectionHandles({p,tauMin,tauMax,onSelect,selectedDirection,axisScale}) {
  const {markers}=useMemo(()=>exceptionalMarkers(p),[p])
  return <group>{markers.map((marker,i)=>{const selected=selectedDirection&&(marker.infinity?selectedDirection.infinity:!selectedDirection.infinity&&Math.abs(marker.zc-selectedDirection.zc)<1e-8);const zc=marker.zc*(marker.infinity?.995:1);const center=clamp(0,tauMin,tauMax);const inverseScale=[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8));return <group key={`${marker.infinity?'inf':marker.z}-${i}`} position={[center,0,zc]}>
    <group scale={inverseScale}><group onClick={e=>{e.stopPropagation();onSelect(marker)}} onPointerOver={e=>{e.stopPropagation()}}>
      <ScientificPoint3D radius={selected?.068:.052} color={selected?"#ffffff":"#ffd166"} material="basic"/>
    </group>
    <mesh raycast={()=>null}><torusGeometry args={[selected?.104:.083,.009,6,28]}/><meshBasicMaterial color={selected?"#fbbf24":"#1f2937"} depthTest={false}/></mesh></group>
    {selected&&<Line points={[[tauMin-center,0,0],[tauMax-center,0,0]]} color="#fbbf24" lineWidth={1.5} transparent opacity={0.75} depthTest={false} renderOrder={20}/> }
  </group>})}</group>
}
