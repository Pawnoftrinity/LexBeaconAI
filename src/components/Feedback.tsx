// Feedback.tsx — "report a problem / wrong translation" notes, stored on this device (pilot). Export = copy to clipboard.
// UPDATED: 2026-11-10 (build 002)
import {useState} from 'react';
import {setProgress,useProgress,today} from '@/lib/store';
import {useT} from '@/lib/i18n';
export function Feedback({screen}:{screen:string}){
  const t=useT();const p=useProgress();const [open,setOpen]=useState(false);const [txt,setTxt]=useState('');const [ok,setOk]=useState(false);
  const save=()=>{if(!txt.trim())return;setProgress(x=>({...x,notes:[...x.notes,{at:today(),screen,text:txt.trim().slice(0,500)}].slice(-100)}));setTxt('');setOk(true);setOpen(false);setTimeout(()=>setOk(false),2500);};
  const copy=async()=>{try{await navigator.clipboard.writeText(p.notes.map(n=>`${n.at} [${n.screen}] ${n.text}`).join('\n'));}catch{/* clipboard blocked */}};
  return <div style={{display:'grid',gap:8}}>
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn" onClick={()=>setOpen(!open)} aria-expanded={open}>{t('fbBtn')}</button>{p.notes.length>0&&<button className="btn" onClick={copy}>{t('fbExport')} ({p.notes.length})</button>}</div>
    {open&&<div className="g2 rv" style={{padding:12,display:'grid',gap:8}}><textarea className="ta" style={{minHeight:80}} value={txt} onChange={e=>setTxt(e.target.value)} placeholder={t('fbPlace')} maxLength={500}/><div><button className="btn btnp" onClick={save} disabled={!txt.trim()}>{t('fbSave')}</button></div></div>}
    {ok&&<p className="muted rv">{t('fbThanks')}</p>}</div>;
}
