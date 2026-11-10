// N400.tsx — N-400 helper: explains questions, what to gather. Does NOT choose answers or give legal advice.
// UPDATED: 2026-11-08 (build 001). Content to be strengthened after build 001 (AI knowledge pass).
import {useState} from 'react';
import {ask} from '@/lib/ai';import {useT} from '@/lib/i18n';
import {Bi,Card,Eyebrow,Words} from '@/components/ui';
const STARTERS:[string,string][]=[['What documents should I gather before filling the N-400?','Які документи зібрати перед заповненням N-400?'],['What does "continuous residence" mean on the N-400?','Що означає «безперервне проживання» в N-400?'],['How do I list my trips outside the U.S.?','Як вказати поїздки за межі США?'],['What happens at the naturalization interview?','Що відбувається на співбесіді з натуралізації?']];
export function N400(){
  const t=useT();const [q,setQ]=useState('');const [a,setA]=useState('');const [busy,setBusy]=useState(false);const [g,setG]=useState<boolean|undefined>();
  const go=async(x=q)=>{if(!x.trim())return;setBusy(true);setA('');const r=await ask<string>('n400',x.trim());setBusy(false);setG(r.grounded);setA(r.ok&&typeof r.data==='string'?r.data:t('offlineAi'));};
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card><Eyebrow>N-400</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('dN400')}</h2><Bi k="n400Intro"/>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}>{STARTERS.map((s,i)=><button key={i} className="chip" onClick={()=>{setQ(s[0]);go(s[0]);}}>{t('tutEyebrow')&&s[1]}</button>)}</div></Card>
    <Card style={{display:'grid',gap:12}}>
      <form onSubmit={e=>{e.preventDefault();go();}} style={{display:'flex',gap:8}}><input className="field" value={q} onChange={e=>setQ(e.target.value)} placeholder={t('tutPlaceholder')} maxLength={1500}/><button className="btn btnp" disabled={busy||!q.trim()}>{t('send')}</button></form>
      {busy&&<p className="muted">{t('thinking')}</p>}
      {a&&<div className="g2 rv" style={{padding:14,whiteSpace:'pre-wrap'}}><p><Words text={a}/></p>{g===false&&<p className="muted" style={{fontSize:13,marginTop:8}}>{t('civVary')}</p>}</div>}
      <p className="muted" style={{fontSize:13}}>{t('footer').split('.').slice(0,2).join('.')}. <a href="https://www.uscis.gov/n-400" target="_blank" rel="noreferrer" style={{color:'var(--primaryText)'}}>uscis.gov/n-400</a></p></Card></div>;
}
