/**
 * Shared Three.js point glyph. Shape is presentation only: no projection,
 * selection or mathematical class is inferred from this component.
 */
export default function ScientificPoint3D({
  radius, color, material='standard', depthTest=false,
  metalness=0, roughness=0.35, emissive=color, emissiveIntensity=0.25,
  widthSegments=28, heightSegments=20,
}) {
  return <mesh>
    <sphereGeometry args={[radius,widthSegments,heightSegments]}/>
    {material==='basic'
      ? <meshBasicMaterial color={color} depthTest={depthTest}/>
      : <meshStandardMaterial color={color} metalness={metalness}
          roughness={roughness} depthTest={depthTest}
          emissive={emissive} emissiveIntensity={emissiveIntensity}/>}
  </mesh>
}
