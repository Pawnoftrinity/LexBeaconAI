// Welcome.tsx — language picker + English check or skip; Check.tsx logic lives in the same file
// UPDATED: 2026-11-08 (build 001)
import {useState} from 'react';
import {setSettings,useSettings} from '@/lib/store';
import {useT} from '@/lib/i18n';
import {content as D} from '@/data/content';
import {Bi,Card,Eyebrow} from '@/components/ui';

export function Welcome({go}:{go:(s:any)=>void}){
  const t=useT();
  const done=(to:string)=>{setSettings({welcomed:true});go(to);};
  return <div className="screen" style={{display:'grid',gap:18,maxWidth:760,margin:'0 auto'}}>
    <Card style={{textAlign:'center',padding:'clamp(24px,5vw,48px)'}}>
      <Eyebrow>{t('tagline')}</Eyebrow>
      <h1 className="hf gt" style={{fontSize:'clamp(30px,6vw,52px)',lineHeight:1.1,margin:'14px 0'}}>{t('heroA')} {t('heroB')}</h1>
      <p className="muted" style={{marginBottom:18}}>{t('wCheckT')}</p>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        <button className="btn" aria-pressed="true" disabled style={{opacity:1,borderColor:'var(--primaryText)'}}>Українська</button>
        <button className="btn" disabled title="Coming later">Polski · Español · …</button></div>
      <p className="muted" style={{margin:'18px auto',maxWidth:520}}>{t('wCheckSub')}</p>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
        <button className="btn btnp" onClick={()=>go('check')}>{t('chStart')}</button>
        <button className="btn" onClick={()=>done('home')}>{t('chSkip')}</button></div>
      <p className="muted" style={{marginTop:16,fontSize:13}}>{t('wPrivacy')}</p>
    </Card></div>;
}

type Q={part:string;text:string;o:string[];a:number;ctx?:string};
function build():Q[]{
  const v=D.vocab.map((x:any)=>({part:'vocab',text:x.w,o:x.o,a:x.a}));
  const g=D.grammar.map((x:any)=>({part:'gram',text:x.s,o:x.o,a:x.a}));
  const r=D.reading.map((x:any)=>({part:'read',text:x.q,ctx:x.s,o:x.o,a:x.a}));
  return [...v,...g,...r];
}
export function Check({go}:{go:(s:any)=>void}){
  const t=useT();const s=useSettings();const [qs]=useState(build);const [i,setI]=useState(0);const [sel,setSel]=useState<number|null>(null);
  const [res,setRes]=useState<{part:string;ok:boolean}[]>([]);const [fin,setFin]=useState<number|null>(null);const [intro,setIntro]=useState(true);
  void s;
  const finish=(r:{part:string;ok:boolean}[])=>{const pct=r.filter(x=>x.ok).length/Math.max(1,r.length);setFin(pct<.3?0:pct<.55?1:pct<.8?2:3);};
  const next=()=>{const ok=sel===qs[i].a;const r=[...res,{part:qs[i].part,ok}];setRes(r);setSel(null);
    // adaptive: 3 misses in a row inside a part skips the rest of that part; stops if hard throughout
    let n=i+1;const lastThree=r.slice(-3);
    if(lastThree.length===3&&lastThree.every(x=>!x.ok)){const p=qs[i].part;while(n<qs.length&&qs[n].part===p)n++;}
    if(r.length>=6&&r.filter(x=>x.ok).length===0)n=qs.length;
    if(n>=qs.length)finish(r);else setI(n);};
  if(intro)return <Card style={{maxWidth:720,margin:'0 auto'}}><Eyebrow>{t('chEyebrow')}</Eyebrow><p style={{margin:'14px 0'}}>{t('chIntro')}</p><button className="btn btnp" onClick={()=>setIntro(false)}>{t('chStart')}</button></Card>;
  if(fin!=null){const L=D.levels[fin];return <Card style={{maxWidth:720,margin:'0 auto',display:'grid',gap:12}}>
    <Eyebrow>{t('chResultEye')}</Eyebrow><h2 className="hf">{L.name[1]}</h2><Bi k="chSuggest"/><p>{L.plan[1]}</p><p className="muted">{L.plan[0]}</p>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button className="btn btnp" onClick={()=>{setSettings({level:fin,help:L.help,welcomed:true});go('home');}}>{t('chUse')}</button>
      <button className="btn" onClick={()=>{setSettings({level:fin,welcomed:true});go('home');}}>{t('chKeep')}</button></div></Card>;}
  const q=qs[i];
  return <Card style={{maxWidth:720,margin:'0 auto',display:'grid',gap:12}}>
    <Eyebrow>{i+1} / {qs.length}</Eyebrow>
    {q.ctx&&<p className="g2" style={{padding:14,fontSize:18}} lang="en">{q.ctx}</p>}
    <h2 className="hf" lang="en" style={{fontSize:22}}>{q.part==='vocab'?`${t('chVocabQ')} “${q.text}”`:q.text}</h2>
    <div style={{display:'grid',gap:8}}>{q.o.map((o,k)=><button key={k} className={'opt'+(sel===k?' right':'')} onClick={()=>setSel(k)} lang="en">{o}</button>)}</div>
    <div style={{display:'flex',gap:10}}><button className="btn btnp" disabled={sel==null} onClick={next}>{t('chContinue')}</button><button className="btn" onClick={()=>next()} >{t('chSkipPart')}</button></div>
  </Card>;
}
