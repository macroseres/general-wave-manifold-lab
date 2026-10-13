import {hopfSurfaceMesh} from '../src/geometry/hopf/surface.js'
const p={a20:1.5,a11:0,a02:.5,a10:0,a01:0,b20:0,b11:1,b02:-.1,b10:1,b01:0}
for(const side of ['minus','plus']){
  const mesh=hopfSurfaceMesh(p,{tauMin:-1,tauMax:1,YMin:-6,YMax:6,side,diagnostics:true})
  console.log(JSON.stringify({side,outputTriangles:mesh.indices.length/3,...mesh.diagnostics},null,2))
}
