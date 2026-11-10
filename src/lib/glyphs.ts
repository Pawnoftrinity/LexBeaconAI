// glyphs.ts — living-background object art (5 Ukrainian + 7 US), seeded layout
// UPDATED: 2026-11-08 (build 001)
import {alpha} from './theme';
export function glyphPath(kind:string):string{
  if(kind==='sun'){
    let d='M12 9.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2z';
    for(let k=0;k<12;k++){const a=k*Math.PI/6,co=Math.cos(a),si=Math.sin(a);
      const p=(r:number,o:number)=>[12+r*co-o*si,12+r*si+o*co];
      const f=(q:number[])=>q[0].toFixed(2)+' '+q[1].toFixed(2);
      const A=p(4.6,0),B=p(9.2,1.9),C=p(10.8,0),E=p(9.2,-1.9);
      d+='M'+f(A)+'Q'+f(B)+' '+f(C)+'Q'+f(E)+' '+f(A);}
    return d;}
  const map:Record<string,string>={
    wheat:'M12 22V8M12 8c-1.6-1.2-1.6-3.4 0-5 1.6 1.6 1.6 3.8 0 5zM12 13c-3 0-4.6-1.8-5-4.4 3 0 4.8 1.4 5 4.4zM12 13c3 0 4.6-1.8 5-4.4-3 0-4.8 1.4-5 4.4zM12 18c-3 0-4.6-1.8-5-4.4 3 0 4.8 1.4 5 4.4zM12 18c3 0 4.6-1.8 5-4.4-3 0-4.8 1.4-5 4.4z',
    tryzub:'M12 2.5v17.5M12 2.5l-1.7 3h3.4zM5 4v7.5a7 7 0 0 0 7 6.5 7 7 0 0 0 7-6.5V4M5 4L3.4 7h3.2zM19 4l-1.6 3h3.2zM8.5 22h7M9.5 9.5h5',
    kalyna:'M12 22c0-5 .2-9-3-12M12 22c0-4 1-8 4.5-10M12 22v-8M9.8 8.2a1.9 1.9 0 1 0-3.8 0 1.9 1.9 0 0 0 3.8 0zM13.9 6.4a1.9 1.9 0 1 0-3.8 0 1.9 1.9 0 0 0 3.8 0zM18.4 9.6a1.9 1.9 0 1 0-3.8 0 1.9 1.9 0 0 0 3.8 0zM12 14.2a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8z',
    emb:'M12 2l5 5-5 5-5-5zM12 12l5 5-5 5-5-5zM2 12l3-3 3 3-3 3zM16 12l3-3 3 3-3 3zM12 5.2v1.6M12 15.2v1.6M4.6 12h.8M18.6 12h.8',
    star:'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z',
    torch:'M12 2c2 2.5 2 4.5 0 6.5-2-2-2-4 0-6.5zM8 9h8l-1.5 3h-5zM11 12h2v10h-2z',
    bell:'M12 3a1.5 1.5 0 0 1 1.5 1.5V6c3.2.8 5 3.4 5 6.5V16l2 2.5H3.5l2-2.5v-3.5C5.5 9.4 7.3 6.8 10.5 6V4.5A1.5 1.5 0 0 1 12 3zM10.5 20.5a1.5 1.5 0 0 0 3 0M12 8l-1 4 1.5 2-1 3',
    dome:'M12 2.5v2.5M8 12a4 4 0 0 1 8 0M7 12h10v3H7zM4 15h16v2H4zM3 21h18M6 17v4M10 17v4M14 17v4M18 17v4',
    eagle:'M12 6.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM12 9.4V16l-2 3.5h4zM12 11C9 7.6 5 6.8 2 8.4c2 1.4 3 3.4 3 5.6 2-2 4.5-3 7-3M12 11c3-3.4 7-4.2 10-2.6-2 1.4-3 3.4-3 5.6-2-2-4.5-3-7-3',
    bridge:'M2 17h20M3 21h18M7 5v16M17 5v16M5.6 8h2.8M15.6 8h2.8M7 5Q12 17 17 5M7 5L2 17M17 5l5 12M10 11v6M12 12.4V17M14 11v6',
    rush:'M2 21h20V15l-2-2V9l-3-2h-3l-2-3-2 3H7L4 9v4l-2 2zM6.4 11.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM9.9 9.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM13.4 9.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM16.6 11.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z'};
  return map[kind]||map.star;
}
export interface Glyph{d:string;style:React.CSSProperties}
export function makeGlyphs(dark:boolean,mode:'uk'|'mix'|'en',calm:boolean,seed:number):Glyph[]{
  let x=(seed*9301+49297)%4294967296;
  const r=()=>{x=(x*1664525+1013904223)%4294967296;return x/4294967296;};
  const ukK=['sun','wheat','tryzub','kalyna','emb'],usK=['star','torch','bell','dome','eagle','bridge','rush'];
  const nUk=mode==='uk'?4:mode==='en'?1:3,nUs=mode==='en'?4:mode==='uk'?1:3;
  const choose=(arr:string[],n:number)=>arr.map((_,i)=>i).sort(()=>r()-0.5).slice(0,n);
  const showUk=choose(ukK,nUk),showUs=choose(usK,nUs);
  const ukCol=dark?['#FFD43B','#6AA7FF']:['#0B57B7','#C99700'];
  const usCol=dark?['#FF8A96','#A9A8F0']:['#B22234','#3C3B6E'];
  const out:Glyph[]=[];
  const build=(kinds:string[],shown:number[],isUk:boolean)=>kinds.forEach((kind,i)=>{
    const pos=shown.indexOf(i),vis=pos>=0,major=isUk?mode!=='en':mode!=='uk';
    const left=isUk?2+r()*42:54+r()*40;
    const top=vis?5+((pos+r()*0.8)/shown.length)*88:10+r()*80;
    const size=70+r()*60;
    const r0=Math.round((r()-0.5)*40),r1=r0+Math.round((r()-0.5)*18);
    const col=(isUk?ukCol:usCol)[r()<0.6?0:1];
    const op=vis?(major?0.45:0.22):0;
    const dur=(10+r()*8).toFixed(1),del=(-r()*10).toFixed(1);
    out.push({d:glyphPath(kind),style:{left:left.toFixed(1)+'%',top:top.toFixed(1)+'%',width:size,height:size,color:col,opacity:op,
      ['--r0' as any]:r0+'deg',['--r1' as any]:r1+'deg',
      animation:calm?'none':`lbfloat ${dur}s ease-in-out ${del}s infinite alternate`,
      transition:'left 2.4s cubic-bezier(.22,.8,.2,1),top 2.4s cubic-bezier(.22,.8,.2,1),opacity 2s',
      filter:`drop-shadow(0 0 10px ${alpha(col,0.45)})`}});});
  build(ukK,showUk,true);build(usK,showUs,false);return out;
}
