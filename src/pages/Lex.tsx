// Lex.tsx — chat with Lex (teacher / tutor / buddy), AI with offline fallback
// UPDATED: 2026-11-08 (build 001)
import {useState,useRef,useEffect} from 'react';
import {content as D} from '@/data/content';
import {ask} from '@/lib/ai';import {speak} from '@/lib/speech';
import {useT} from '@/lib/i18n';import {addMinutes} from '@/lib/store';
import {Card,Eyebrow,Icon,IC,Words} from '@/components/ui';
type Msg={r:'user'|'lex';t:string;note?:string};
export function Lex(){
  const t=useT();const [role,setRole]=useState('teacher');const [msgs,setMsgs]=useState<Msg[]>([]);const [txt,setTxt]=useState('');const [busy,setBusy]=useState(false);const end=useRef<HTMLDivElement>(null);
  useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[msgs,busy]);
  const mode=D.modes.find((m:any)=>m.key===role)||D.modes[0];
  const send=async()=>{const q=txt.trim();if(!q||busy)return;setTxt('');const h=[...msgs,{r:'user' as const,t:q}];setMsgs(h);setBusy(true);
    const r=await ask<string>('tutor',q,{role,history:msgs.map(m=>({r:m.r,t:m.t}))});setBusy(false);addMinutes(1);
    if(r.ok&&typeof r.data==='string')setMsgs([...h,{r:'lex',t:r.data}]);
    else setMsgs([...h,{r:'lex',t:mode.en,note:t('aiOff')}]);};
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card><Eyebrow>{t('tutEyebrow')}</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('tutTitle')}</h2>
      <div style={{display:'grid',gap:8,gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))'}}>{D.modes.map((m:any)=><button key={m.key} className={'mode'+(m.key===role?' on':'')} onClick={()=>setRole(m.key)} aria-pressed={m.key===role}><b>{m.label[1]}</b><span className="muted" style={{fontSize:13}}>{m.blurb[1]}</span></button>)}</div></Card>
    <Card style={{display:'grid',gap:12}}>
      {msgs.length===0&&<div className="g2" style={{padding:14}}><p lang="en"><Words text={mode.en}/></p><p lang="uk" className="muted" style={{marginTop:6}}>{mode.uk}</p><button className="btn" style={{marginTop:10}} onClick={()=>speak(mode.en)}><Icon d={IC.spk}/>{t('listen')}</button></div>}
      {msgs.map((m,i)=>m.r==='user'?<div key={i} style={{display:'flex',justifyContent:'flex-end'}}><div style={{maxWidth:'80%',padding:'12px 18px',borderRadius:'22px 22px 6px 22px',backgroundImage:'linear-gradient(135deg,var(--p1),var(--p2))',color:'var(--onCta)'}}>{m.t}</div></div>
        :<div key={i} className="g2" style={{padding:14,whiteSpace:'pre-wrap'}}><p><Words text={m.t}/></p>{m.note&&<p className="muted" style={{fontSize:13,marginTop:6}}>{m.note}</p>}<button className="btn" style={{marginTop:8,minHeight:38}} onClick={()=>speak(m.t)}><Icon d={IC.spk}/>{t('listen')}</button></div>)}
      {busy&&<p className="muted">{t('thinking')}</p>}<div ref={end}/>
      <form onSubmit={e=>{e.preventDefault();send();}} style={{display:'flex',gap:8}}><input className="field" value={txt} onChange={e=>setTxt(e.target.value)} placeholder={t('tutPlaceholder')} maxLength={1500}/><button className="btn btnp" disabled={busy||!txt.trim()}>{t('send')}</button></form>
      <p className="muted" style={{fontSize:13}}>{t('twHint')}</p></Card></div>;
}
