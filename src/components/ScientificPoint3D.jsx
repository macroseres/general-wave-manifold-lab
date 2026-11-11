import {useRef,useState} from 'react'
import {useFrame} from '@react-three/fiber'
import {useCursor} from '@react-three/drei'
import {Vector3} from 'three'

export function ScreenPoint({radius,ringColor,pixelRadius=4.5,interactive=false,showCursor=true,children}){
  const marker=useRef(null)
  const viewPosition=useRef(new Vector3())
  const [hovered,setHovered]=useState(false)
  useCursor(hovered&&showCursor)
  useFrame(({camera,size})=>{
    if(!marker.current||!size.height)return
    marker.current.getWorldPosition(viewPosition.current).applyMatrix4(camera.matrixWorldInverse)
    const depth=camera.isPerspectiveCamera?Math.max(camera.near,-viewPosition.current.z):1
    const pixels=hovered?pixelRadius*1.25:pixelRadius
    marker.current.scale.setScalar(2*pixels*depth/(size.height*camera.projectionMatrix.elements[5]*radius))
  })
  return <group ref={marker}
    onPointerOver={interactive?()=>setHovered(true):undefined}
    onPointerOut={interactive?()=>setHovered(false):undefined}>
    {children}
    {ringColor&&<mesh rotation={[Math.PI/2,0,0]} renderOrder={67} raycast={()=>null}>
      <torusGeometry args={[radius*1.35,radius*.085,8,32]}/>
      <meshBasicMaterial color={ringColor} transparent opacity={hovered?1:.85}
        toneMapped={false} depthTest={false} depthWrite={false}/>
    </mesh>}
  </group>
}

/**
 * Shared Three.js point glyph. Shape is presentation only: no projection,
 * selection or mathematical class is inferred from this component.
 */
export default function ScientificPoint3D({
  radius, color, material='standard', depthTest=false,
  metalness=0, roughness=0.35, emissive=color, emissiveIntensity=0.25,
  widthSegments=28, heightSegments=20, onSelect,
}) {
  // Draw fully opaque glyphs in the same pass as the scene overlays.
  const overlay = !depthTest
  return <ScreenPoint radius={radius} ringColor={color} interactive={Boolean(onSelect)}><mesh renderOrder={overlay?62:0} onClick={onSelect&&((event)=>{
    event.stopPropagation()
    onSelect()
  })}>
    <sphereGeometry args={[radius,widthSegments,heightSegments]}/>
    {material==='basic'
      ? <meshBasicMaterial color={color} depthTest={depthTest} depthWrite={!overlay} transparent={overlay}/>
      : <meshStandardMaterial color={color} metalness={metalness}
          roughness={roughness} depthTest={depthTest} depthWrite={!overlay} transparent={overlay}
          emissive={emissive} emissiveIntensity={emissiveIntensity}/>}
  </mesh></ScreenPoint>
}
