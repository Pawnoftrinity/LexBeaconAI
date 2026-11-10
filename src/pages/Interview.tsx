// Interview.tsx — mock officer: reading, writing (dictation), civics question; tips; AI officer chat optional
// UPDATED: 2026-11-08 (build 001)
import {useState} from 'react';
import {content as D} from '@/data/content';
import {civics2025} from '@/data/civics2025';
import {ask} from '@/lib/ai';import {speak} from '@/lib/speech';
import {useT} from '@/lib/i18n';import {addMinutes} from '@/lib/store';
import {Card,Eyebrow,Icon,IC,Words} from '@/components/ui';import {Pron} from '@/components/Pron';
export function Interview(){
  const t=useT();const [part,setPart]=useState<'reading'|'writing'|'civics'>('reading');const [w,setW]=useState('');const [fb,setFb]=useState<any>(null);const [busy,setBusy]=useState(false);
  const [cq,setCq]=useState(()=>civics2025.filter(c=>!c.dyn)[Math.floor(Math.random()*100)]);
  const it=D.iv[part];const say=part==='civics'?cq.q:it.say;
  const check=async()=>{setBusy(true);const r=await ask('writing',w);setBusy(false);addMinutes(2);setFb(r.ok?r.data:{praise:t('offlineAi'),corrected:it.say,fixes:[]});};
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card><Eyebrow>{t('ivEyebrow')}</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('ivTitle')}</h2>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{(['reading','writing','civics'] as const).map(k=><button key={k} className={'chip'+(part===k?' on':'')} onClick={()=>{setPart(k);setFb(null);setW('');}}>{D.iv[k].task[1]}</button>)}</div></Card>
    <Card style={{display:'grid',gap:12}}>
      <button className="btn" onClick={()=>speak(say)}><Icon d={IC.spk}/>{t('hearOfficer')}</button>
      {part!=='writing'&&<h3 className="hf" lang="en" style={{fontSize:24}}><Words text={part==='civics'?cq.q:it.p.replace(/^Read this sentence out loud: /,'').replace(/"/g,'')}/></h3>}
      <p className="muted" lang="uk">{part==='civics'?'':it.uk}</p>
      {part==='reading'&&<Pron target={it.say}/>}
      {part==='civics'&&<><Pron target={cq.a[0].replace(/\([^)]*\)/g,'')}/><details><summary style={{cursor:'pointer'}}>{t('theAnswer')}</summary><ul lang="en">{cq.a.map((a,i)=><li key={i}>{a}</li>)}</ul></details>
        <button className="btn" onClick={()=>setCq(civics2025.filter(c=>!c.dyn)[Math.floor(Math.random()*100)])}>{t('practiceAgain')}</button></>}
      {part==='writing'&&<><textarea className="ta" value={w} onChange={e=>setW(e.target.value)} lang="en" aria-label={it.task[0]} maxLength={300}/><button className="btn btnp" disabled={busy||!w.trim()} onClick={check}>{busy?t('thinking'):t('chCheck')}</button>
        {fb&&<div className="g2 rv" style={{padding:14,display:'grid',gap:6}}><p>{fb.praise}</p><p lang="en"><b>{fb.corrected}</b></p>{(fb.fixes||[]).map((f:any,i:number)=><p key={i}><b lang="en">{f.was} → {f.now}</b> <span className="muted">{f.why}</span></p>)}</div>}</>}
    </Card>
    <Card><Eyebrow>{t('ivTipsT')}</Eyebrow><ul style={{display:'grid',gap:8,paddingLeft:18}}>{D.ivTips.map((x:string[],i:number)=><li key={i}><span lang="uk">{x[1]}</span><br/><span className="muted" lang="en">{x[0]}</span></li>)}</ul></Card>
  </div>;
}
