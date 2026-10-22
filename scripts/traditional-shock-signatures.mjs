import {pathToFileURL} from 'node:url'

const spectra=[[1,2],[-1,1],[-2,-1]]
const entries=[
  ['one-shock',0,1],['one-expansive',1,0],
  ['two-shock',1,2],['two-expansive',2,1],
  ['compressive',0,2],['expansive',2,0],['crossing',1,1],
  ['right-transport',0,0],['left-transport',2,2],
]

/** Exact RH fixtures, not a classifier or an admissibility decision. */
export function traditionalShockSignatures(){
  return entries.map(([name,nLeft,nRight])=>{
    const leftSpectrum=spectra[nLeft],rightSpectrum=spectra[nRight]
    const TL=leftSpectrum[0]+leftSpectrum[1],TR=rightSpectrum[0]+rightSpectrum[1]
    const DL=leftSpectrum[0]*leftSpectrum[1],DR=rightSpectrum[0]*rightSpectrum[1]
    const a01=DL+TL+1
    return {name,nLeft,nRight,incoming:2-nLeft+nRight,
      left:[0,0],right:[1,0],speed:0,leftSpectrum:[...leftSpectrum],rightSpectrum:[...rightSpectrum],
      coefficients:{a20:1,a11:TR-1-DR-a01,a02:0,a10:-1,a01,
        b20:1,b11:TR-TL-2,b02:0,b10:-1,b01:TL+1},
      qualification:'conservative endpoint configuration; no entropy or profile selection asserted'}
  })
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(traditionalShockSignatures(),null,2))
