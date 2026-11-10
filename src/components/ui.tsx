// ui.tsx — shared UI: icons, bilingual text with chip, tappable English words + draggable word card
// UPDATED: 2026-11-08 (build 001)
import {useState,useRef,useEffect,useSyncExternalStore,type ReactNode} from 'react';
import {useBi,useMenu,useT} from '@/lib/i18n';
import {speak} from '@/lib/speech';
import {useProgress,setProgress} from '@/lib/store';
import {lexicon} from '@/data/lexicon';
import {ask} from '@/lib/ai';

export const Icon=({d,size=20}:{d:string;size?:number})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>;
export const IC={
 home:'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',lex:'M12 3l2.2 5.3 5.8.5-4.4 3.8 1.4 5.6L12 15l-5 3.2 1.4-5.6L4 8.8l5.8-.5z',tr:'M4 5h9M8.5 3v2M6 5c1 4 3 6.5 6 8M11 5c-1 4-3.5 6.5-7 8M13 20l4-9 4 9M14.4 17h5.2',
 dict:'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11',civ:'M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',iv:'M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6',
 set:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2.2.7a7 7 0 0 0-1.6-1L14.8 4h-4.6l-.4 2.7a7 7 0 0 0-1.6 1L6 7 4 11l2 1a7 7 0 0 0 0 2l-2 1 2 4 2.2-.7a7 7 0 0 0 1.6 1l.4 2.7h4.6l.4-2.7a7 7 0 0 0 1.6-1L18 19l2-4-2-1a7 7 0 0 0 0-2z',
 spk:'M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7',mic:'M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zM6 11a6 6 0 0 0 12 0M12 17v4',moon:'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',sun:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
 prog:'M4 20V10M10 20V4M16 20v-8M22 20H2',doc:'M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6',x:'M6 6l12 12M18 6L6 18',star:'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z',arrow:'M5 12h14M13 6l6 6-6 6',check:'M5 12l5 5 9-10'
};
const Chip=({c,onClick,on}:{c:string;onClick:()=>void;on:boolean})=><button className="uachip" onClick={onClick} aria-pressed={on} aria-label={c}>{c}</button>;
/** Bilingual explanation: primary language, chip reveals the other language beneath (no swap) */
export function Bi({k,tag:Tag='p',style,className}:{k:string;tag?:'p'|'span'|'h1'|'h2'|'h3';style?:React.CSSProperties;className?:string}){
  const b=useBi();const [o,setO]=useState(false);const x=b(k);
  return <span className="hbk" style={{display:'block'}}><span style={{display:'flex',alignItems:'flex-start',gap:10}}><Tag style={style} className={className} lang={x.c==='UA'?'en':'uk'}>{x.p}</Tag><Chip c={x.c} on={o} onClick={()=>setO(!o)}/></span>
   {o&&<Tag className="muted rv" style={{marginTop:6,...style,fontSize:'.92em',fontWeight:400}} lang={x.c==='UA'?'uk':'en'}>{x.o}</Tag>}</span>;
}
/** English study content stays English; chip shows learner-language translation */
export function En({text,uk,tag:Tag='p',style}:{text:string;uk?:string;tag?:'p'|'span'|'h3';style?:React.CSSProperties}){
  const [o,setO]=useState(false);
  return <span style={{display:'block'}}><span style={{display:'flex',alignItems:'flex-start',gap:10}}><Tag style={style} lang="en"><Words text={text}/></Tag>{uk&&<Chip c="UA" on={o} onClick={()=>setO(!o)}/>}</span>
   {o&&uk&&<Tag className="muted rv" lang="uk" style={{marginTop:6,...style,fontSize:'.92em',fontWeight:400}}>{uk}</Tag>}</span>;
}
export const Menu=({k}:{k:string})=>{const m=useMenu();return <span key={m(k)} className="mfa">{m(k)}</span>;};

// ---- tappable English words ----
let cardWord:string|null=null;const subs=new Set<()=>void>();
const subF=(f:()=>void)=>{subs.add(f);return()=>{subs.delete(f);};};
const openWord=(w:string)=>{cardWord=w;subs.forEach(f=>f());};
export function Words({text}:{text:string}){
  const parts=text.split(/([A-Za-z][A-Za-z'’-]*)/);
  return <>{parts.map((p,i)=>/^[A-Za-z]/.test(p)?<button key={i} className="tw" onClick={()=>openWord(p.toLowerCase().replace(/’/g,"'"))}>{p}</button>:<span key={i}>{p}</span>)}</>;
}
export function WordCard(){
  const w=useSyncExternalStore(subF,()=>cardWord);const t=useT();const prog=useProgress();
  const [pos,setPos]=useState({x:0,y:0});const drag=useRef<{dx:number;dy:number}|null>(null);
  const [ai,setAi]=useState<any>(null);
  useEffect(()=>{setAi(null);if(w&&!lexicon[w]){let live=true;ask('define',w).then(r=>{if(live&&r.ok)setAi(r.data);});return()=>{live=false;};}},[w]);
  if(!w)return null;
  const e=lexicon[w];const ipa=e?e[0]:ai?.ipa,uk=e?e[1]:ai?.meaning_l,def=e?e[2]:ai?.meaning_en;
  const key='w:'+w,saved=prog.saved.includes(key);
  const toggle=()=>setProgress(p=>({...p,saved:saved?p.saved.filter(x=>x!==key):[...p.saved,key]}));
  return <div className="glass rv" role="dialog" aria-label={w} style={{position:'fixed',zIndex:50,left:'50%',bottom:110,transform:`translate(calc(-50% + ${pos.x}px),${pos.y}px)`,width:'min(92vw,380px)',padding:18,borderRadius:24,touchAction:'none'}}
    onPointerDown={ev=>{if((ev.target as HTMLElement).closest('button'))return;drag.current={dx:ev.clientX-pos.x,dy:ev.clientY-pos.y};(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);}}
    onPointerMove={ev=>{if(drag.current)setPos({x:ev.clientX-drag.current.dx,y:ev.clientY-drag.current.dy});}} onPointerUp={()=>{drag.current=null;}}>
    <div style={{display:'flex',alignItems:'center',gap:10}}>
      <div style={{flex:1}}><div className="hf" style={{fontSize:24,fontWeight:800}}>{w}</div><div className="muted" style={{fontSize:14}}>{ipa||'…'}</div></div>
      <button className="ibtn" onClick={()=>speak(w)} aria-label={t('listen')}><Icon d={IC.spk}/></button>
      <button className="ibtn" onClick={()=>{cardWord=null;subs.forEach(f=>f());}} aria-label={t('twClose')}><Icon d={IC.x}/></button>
    </div>
    <p style={{marginTop:10,fontSize:15,lineHeight:1.5}}>{def||t('twUnknown')}</p>
    {uk&&<p lang="uk" style={{marginTop:6,fontWeight:600}}>{uk}</p>}
    <div style={{display:'flex',gap:8,marginTop:12}}><button className={'btn'+(saved?'':' btnp')} onClick={toggle}>{saved?t('twSaved'):t('twSave')}</button></div>
  </div>;
}
export const Card=({children,style,className=''}:{children:ReactNode;style?:React.CSSProperties;className?:string})=><section className={'glass rv '+className} style={{padding:'clamp(18px,3vw,28px)',...style}}>{children}</section>;
export const Eyebrow=({children}:{children:ReactNode})=><span className="eyebrow">{children}</span>;
