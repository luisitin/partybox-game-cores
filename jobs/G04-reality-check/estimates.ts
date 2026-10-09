import type {Kind} from './samples.ts';
/** Keep the usual sqrt result; use logs where its product is subnormal. */
export function numberMidpoint(min:number,max:number):number{
 if(!Number.isFinite(min)||!Number.isFinite(max)||min<0||max<min)return 0;
 if(min===max)return min;
 const product=min*max;
 const value=min===0?max/10:product>=2**-1022&&Number.isFinite(product)?Math.sqrt(product):Math.exp((Math.log(min)+Math.log(max))/2);
 return Math.max(min,Math.min(max,value));
}
export function centuryWithinBounds(value:number,min:number,max:number):number{
 const bounded=Math.max(min,Math.min(max,Math.round(value)));
 return bounded===0?(max>=1?1:-1):bounded;
}
/** A legal initial controller value for every validated estimate range. */
export function initialEstimate(kind:Kind,min:number,max:number):number{
 if(kind==='century')return centuryWithinBounds(1,min,max);
 if(kind==='decade')return Math.floor((min+max)/20)*10;
 const center=numberMidpoint(min,max);
 return Math.max(min,Math.min(max,Number.isInteger(min)&&Number.isInteger(max)?Math.round(center):center));
}
