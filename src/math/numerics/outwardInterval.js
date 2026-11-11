// Closed binary64 intervals. Each elementary operation rounds its result
// outward by one representable number; no ambient rounding mode is changed.
const bits=new DataView(new ArrayBuffer(8))
function adjacent(x,up){
  if(Number.isNaN(x))throw new Error('invalid interval arithmetic')
  if(x===(up?Infinity:-Infinity))return x
  if(x===0)return up?Number.MIN_VALUE:-Number.MIN_VALUE
  bits.setFloat64(0,x)
  bits.setBigUint64(0,bits.getBigUint64(0)+((x>0)===up?1n:-1n))
  return bits.getFloat64(0)
}
export const interval=(lo,hi=lo)=>{
  if(!Number.isFinite(lo)||!Number.isFinite(hi)||lo>hi)throw new Error('invalid interval')
  return [lo,hi]
}
export const midpoint=a=>a[0]/2+a[1]/2
export const magnitude=a=>Math.max(Math.abs(a[0]),Math.abs(a[1]))
export const hull=(a,b)=>[Math.min(a[0],b[0]),Math.max(a[1],b[1])]
export const contains=(outer,inner)=>outer[0]<=inner[0]&&inner[1]<=outer[1]
export const interior=(outer,inner)=>outer[0]<inner[0]&&inner[1]<outer[1]
export const add=(a,b)=>[adjacent(a[0]+b[0],false),adjacent(a[1]+b[1],true)]
export const neg=a=>[-a[1],-a[0]]
export const sub=(a,b)=>add(a,neg(b))
export function mul(a,b){
  const products=[a[0]*b[0],a[0]*b[1],a[1]*b[0],a[1]*b[1]]
  return [adjacent(Math.min(...products),false),adjacent(Math.max(...products),true)]
}
export function div(a,b){
  if(b[0]<=0&&b[1]>=0)throw new Error('interval denominator contains zero')
  return mul(a,[adjacent(1/b[1],false),adjacent(1/b[0],true)])
}
export function sqrt(a){
  if(a[0]<=0)throw new Error('strictly positive square root required')
  return [adjacent(Math.sqrt(a[0]),false),adjacent(Math.sqrt(a[1]),true)]
}
export const scale=(a,c)=>mul(a,interval(c))
export const intervalAlgebra={constant:interval,add,sub,mul,div,sqrt}
