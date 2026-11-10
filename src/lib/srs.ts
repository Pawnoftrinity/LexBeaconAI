// srs.ts — Leitner spaced repetition. Boxes 1-5; intervals in days.
// Keys: "w:<word>" for vocabulary, "q:2025-<n>" for civics questions.
// UPDATED: 2026-11-08 (build 001)
import {setProgress,today,type Progress} from './store';
const INT=[0,1,3,7,14,30];
const addDays=(n:number)=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
export function grade(key:string,right:boolean){
  setProgress(p=>{const c=p.srs[key]||{box:1,due:today(),seen:0,miss:0};
    const box=right?Math.min(5,c.box+1):1;
    return {...p,srs:{...p.srs,[key]:{box,due:addDays(INT[box]),seen:c.seen+1,miss:c.miss+(right?0:1)}}};});
}
export const dueKeys=(p:Progress,prefix='')=>Object.entries(p.srs).filter(([k,c])=>k.startsWith(prefix)&&c.due<=today()).sort((a,b)=>a[1].box-b[1].box).map(([k])=>k);
export const weakKeys=(p:Progress,prefix='')=>Object.entries(p.srs).filter(([k,c])=>k.startsWith(prefix)&&(c.box<=2&&c.miss>0)).map(([k])=>k);
