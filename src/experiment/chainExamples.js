import {oldWavePreset} from '../math/flux/quadraticFlux.js'

const defaultFlux = oldWavePreset()
const compositeFlux = oldWavePreset({B2:0})
const diagonalFlux = {a20:0,a11:0,a02:0,a10:0,a01:0,b20:0,b11:0,b02:0,b10:0,b01:0}
const fastContactFlux = {...diagonalFlux,a20:.5,b01:3}
const slowContactFlux = {...diagonalFlux,a10:1,b02:.5,b01:3}

const example = (pattern,left,right,coefficients=defaultFlux)=>({
  pattern,states:{left,right},coefficients,
})

const contactExamples = [
    {
      pattern:'CK', left:[-.6129929586244884,0], right:[.5485618514812421,1.45321442089179],
      flux:{a11:-.9381385911256075,a02:1.805878539569676,a10:-1.0796508938074112,
        a01:-.959742889739573,b11:.9107281286269426,b02:-1.3174253469333053,b01:1.5186677314341068},
    },
    {
      pattern:'KC', left:[-.2974425296517031,1.3617357608822491], right:[-.9024031501270717,0],
      flux:{a11:1.6302737798541784,a02:.40768366772681475,a10:.6012948676943779,
        a01:-.7160791242495179,b11:1.339980462566018,b02:-.07627540733665228,b01:-1.37812514975667},
    },
  ]

export const chainExamples = [
  example('SS',[.38,-.39],[.15,.43]),
  example('SR',[.313332,-.420643],[.580212,.216331]),
  example('RS',[.58,.21],[.31,-.42]),
  example('RR',[0,-1.05],[1,.25],{...diagonalFlux,a20:.5,b02:.5,b10:.75}),
  example('RC',[1,0],[2,1],fastContactFlux),
  example('SC',[2,0],[1,1],fastContactFlux),
  example('CR',[0,0],[1,1],slowContactFlux),
  example('CS',[0,1],[1,0],slowContactFlux),
  example('CC',[0,0],[1,1],{...diagonalFlux,a10:1,b01:2}),
  example('RK',[-1.165,-1.05],[-1.0592763587750538,.1649896298949678],compositeFlux),
  example('SK',[-.8,-1.05],[-1.0592763587750538,.1649896298949678],compositeFlux),
  example('KR',[0,-1.05],[1,.25]),
  example('KS',[.9776785705503095,-1.1634795636533988],[.9292035398230089,.9823008849557522],compositeFlux),
  ...contactExamples.map(({pattern,left,right,flux})=>({
    pattern, states:{left,right}, coefficients:{a20:0,b20:0,b10:0,...flux},
  })),
  {
    pattern:'KK',
    states:{left:[-1.7331369230523705,-.7925718557089567],right:[1.276147940196097,1.0944267995655537]},
    coefficients:{
      a20:-1.4230026928707957,a11:1.3869211301207542,a02:1.838386139832437,
      a10:.633676478639245,a01:-.7151211192831397,b20:-.036802876740694046,
      b11:1.635865087620914,b02:-.7207559067755938,b10:.7185462461784482,b01:-.8653079271316528,
    },
  },
]
