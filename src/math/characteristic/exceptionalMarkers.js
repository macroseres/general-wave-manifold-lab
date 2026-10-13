import { exceptionalDirections } from './exceptionalDirections.js'

/** Screen-independent projective positions. Infinity is one direction,
 * represented by two boundary handles in the compactified chart. */
export function exceptionalMarkers(p) {
  const result = exceptionalDirections(p)
  if (result.allDirectionsDegenerate) return {allDirectionsDegenerate:true, markers:[]}
  const markers = result.directions.flatMap(({z}) => Number.isFinite(z)
    ? [{z, zc:2*Math.atan(z)/Math.PI, infinity:false}]
    : [{z:Infinity,zc:-1,infinity:true},{z:Infinity,zc:1,infinity:true}])
  return {allDirectionsDegenerate:false,markers}
}
