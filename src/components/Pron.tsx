// Pron.tsx — say it and get a word-by-word score (browser speech recognition)
// UPDATED: 2026-11-08 (build 001)
import {useRef,useState} from 'react';
import {listen,scoreSpeech,sttOk} from '@/lib/speech';
import {useT} from '@/lib/i18n';import {Icon,IC} from './ui';
export function Pron({target,onScore}:{target:string;onScore?:(score:number)=>void}){
  const t=useT();const [on,setOn]=useState(false);const [heard,setHeard]=useState('');const [r,setR]=useState<ReturnType<typeof scoreSpeech>|null>(null);const [err,setErr]=useState('');const stop=useRef<()=>void>();
  if(!sttOk())return <p className="muted" style={{fontSize:13}}>{t('pronNo')}</p>;
  const go=()=>{if(on){stop.current?.();return;}setErr('');setR(null);setOn(true);
    stop.current=listen(x=>{setHeard(x);const sc=scoreSpeech(target,x);setR(sc);onScore?.(sc.score);},e=>{setOn(false);if(e&&e!=='no-speech'&&e!=='aborted')setErr(e);});};
  return <div style={{display:'grid',gap:8}}>
    <button className={'btn'+(on?' btnp':'')} onClick={go} aria-pressed={on}><Icon d={IC.mic}/>{on?'…':t('pronBtn')}</button>
    {r&&<div className="g2 rv" style={{padding:12}}><b>{t('pronScore')}: {r.score}%</b>
      <p style={{marginTop:6}} lang="en">{r.words.map((w,i)=><span key={i} style={{color:w.ok?'var(--good)':'var(--bad)',fontWeight:700,marginRight:6}}>{w.w}</span>)}</p>
      <p className="muted" style={{fontSize:13}}>{t('civHeard')} “{heard}”</p></div>}
    {err&&<p className="muted" style={{fontSize:13}}>{err}</p>}</div>;
}
