import {Line as DreiLine} from '@react-three/drei'
import {useFrame,useThree} from '@react-three/fiber'
import {useMemo,useRef,useState} from 'react'
import {Color,Matrix4,Vector3} from 'three'
import {finiteLinePaths} from '../../rendering/finiteLinePaths.js'

// No invalid coordinates are allowed to enter three-stdlib LineGeometry.
// Split at non-finite vertices instead of drawing a false connecting chord.
export function Line({points,segments=false,contrast,lineWidth=1,dashScale=1,...props}) {
  const outlined=contrast??(props.depthTest===false)
  const paths = finiteLinePaths(points,{segments})
  return <group>{paths.map((path,i)=><group key={i}>
    {outlined&&<DreiLine points={path} {...props} color="#0b1018" transparent depthTest={false} lineWidth={Math.max(1,lineWidth*.7)+1.2} dashScale={dashScale*2.4} raycast={()=>null} onClick={undefined} depthWrite={false} renderOrder={(props.renderOrder??0)-.1}/>}
    <DreiLine points={path} {...props} transparent={outlined||props.transparent} depthWrite={outlined?false:props.depthWrite} lineWidth={Math.max(1,lineWidth*.7)} dashScale={dashScale*2.4}/>
  </group>)}</group>
}

export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x))

const dotVertexShader=`
  uniform float diameter;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = diameter;
  }
`
const dotFragmentShader=`
  uniform vec3 ink;
  void main() {
    float radius = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.32, 0.5, radius);
    gl_FragColor = vec4(ink, alpha);
    #include <colorspace_fragment>
  }
`

function RoundDots({positions,color,renderOrder}) {
  const dpr=useThree(state=>state.viewport.dpr)
  return <points renderOrder={renderOrder} raycast={()=>null}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[new Float32Array(positions),3]}/>
    </bufferGeometry>
    <shaderMaterial vertexShader={dotVertexShader} fragmentShader={dotFragmentShader}
      uniforms={{ink:{value:new Color(color)},diameter:{value:3.5*dpr}}} transparent depthTest={false} depthWrite={false}/>
  </points>
}

export function DashDotLine({points,color,lineWidth,renderOrder,dotCount=1}) {
  const group=useRef(null)
  const lastProjection=useRef(null)
  const lastRefresh=useRef(-Infinity)
  const scratch=useMemo(()=>({
    projection:new Matrix4(),inverse:new Matrix4(),a:new Vector3(),b:new Vector3(),sample:new Vector3(),
  }),[])
  const paths=useMemo(()=>finiteLinePaths(points),[points])
  const [marks,setMarks]=useState({dashes:[],dots:[]})
  useFrame(({camera,size,clock})=>{
    if(!group.current||clock.elapsedTime-lastRefresh.current<1/30)return
    lastRefresh.current=clock.elapsedTime
    group.current.updateWorldMatrix(true,false)
    camera.updateWorldMatrix(true,false)
    const {projection,inverse,a,b,sample}=scratch
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(group.current.matrixWorld)
    const previous=lastProjection.current
    if(previous?.paths===paths&&previous.width===size.width&&previous.height===size.height&&
      previous.dotCount===dotCount&&previous.matrix.equals(projection))return
    lastProjection.current={paths,width:size.width,height:size.height,dotCount,matrix:projection.clone()}
    inverse.copy(projection).invert()
    const dashes=[],dots=[]
    const dashLength=12
    const dotSpacing=dotCount===1?6.5:8
    const period=dashLength+dotSpacing*(dotCount+1)
    for(const path of paths){
      let distance=0
      a.fromArray(path[0]).applyMatrix4(projection)
      for(let i=1;i<path.length;i++){
        b.fromArray(path[i]).applyMatrix4(projection)
        const length=Math.hypot((b.x-a.x)*size.width/2,(b.y-a.y)*size.height/2)
        if(a.z>=-1&&b.z>=-1&&a.z<=1&&b.z<=1&&length>0&&Number.isFinite(length)){
          const end=distance+length
          const at=value=>sample.copy(a).lerp(b,(value-distance)/length).applyMatrix4(inverse).toArray()
          let visibleFrom=0,visibleTo=1
          for(const axis of ['x','y']){
            const delta=b[axis]-a[axis]
            if(delta===0){
              if(Math.abs(a[axis])>1.02)visibleTo=-1
              continue
            }
            const low=(-1.02-a[axis])/delta,high=(1.02-a[axis])/delta
            visibleFrom=Math.max(visibleFrom,Math.min(low,high))
            visibleTo=Math.min(visibleTo,Math.max(low,high))
          }
          const start=distance+visibleFrom*length,stop=distance+visibleTo*length
          for(let cycle=Math.floor(start/period)*period;visibleFrom<visibleTo&&cycle<stop;cycle+=period){
            const from=Math.max(start,cycle),to=Math.min(stop,cycle+dashLength)
            if(to>from)dashes.push(at(from),at(to))
            for(let index=1;index<=dotCount;index++){
              const dot=cycle+dashLength+index*dotSpacing
              if(dot>=start&&dot<stop)dots.push(...at(dot))
            }
          }
          distance=end
        }else distance=0
        a.copy(b)
      }
    }
    setMarks({dashes,dots})
  })
  return <group ref={group}>
    {marks.dashes.length>0&&<DreiLine points={marks.dashes} segments color={color} lineWidth={Math.max(1,lineWidth*.7)} depthTest={false} depthWrite={false} transparent renderOrder={renderOrder}/>}
    {marks.dots.length>0&&<RoundDots positions={marks.dots} color={color} renderOrder={renderOrder}/>}
  </group>
}
