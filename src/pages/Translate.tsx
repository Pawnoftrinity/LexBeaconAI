// Translate.tsx — UA<->EN with "why" explanation. AI first, offline examples as fallback.
// UPDATED: 2026-11-08 (build 001)
import {useState} from 'react';
import {content as D} from '@/data/content';
import {ask} from '@/lib/ai';import {speak} from '@/lib/speech';
import {useT} from '@/lib/i18n';import {addMinutes} from '@/lib/store';
import {Card,Eyebrow,Icon,IC,Words} from '@/components/ui';
interface Out{translation:string;why:string;alt?:string;dir:'uk-en'|'en-uk'}
export function Translate(){
  const t=useT();const [txt,setTxt]=useState('');const [out,setOut]=useState<Out|null>(null);const [busy,setBusy]=useState(false);const [note,setNote]=useState('');
  const run=async()=>{if(!txt.trim())return;setBusy(true);setNote('');const r=await ask('translate',txt.trim());setBusy(false);addMinutes(1);
    if(r.ok&&r.data?.translation){const dir=/[а-щьюяєіїґ]/i.test(txt)?'uk-en':'en-uk';setOut({...r.data,dir});}
    else{setNote(t('offlineAi'));setOut(null);}};
  const ex=(e:any)=>{setTxt(e.src);setOut({translation:e.tgt,why:e.notes.map((n:string[])=>n[1]).join(' '),dir:e.dir});setNote('');};
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card style={{display:'grid',gap:12}}><Eyebrow>{t('trEyebrow')}</Eyebrow><h2 className="hf">{t('trTitle')}</h2>
      <textarea className="ta" value={txt} onChange={e=>setTxt(e.target.value)} placeholder={t('trPlace')} maxLength={1500}/>
      <div><button className="btn btnp" disabled={busy||!txt.trim()} onClick={run}>{busy?t('thinking'):t('trBtn')}</button></div>
      {note&&<p className="muted">{note}</p>}
      {out&&<div className="g2 rv" style={{padding:16,display:'grid',gap:10}}>
        <p className="hf" style={{fontSize:22,fontWeight:700}} lang={out.dir==='uk-en'?'en':'uk'}>{out.dir==='uk-en'?<Words text={out.translation}/>:out.translation}</p>
        {out.dir==='uk-en'&&<div style={{display:'flex',gap:8}}><button className="btn" onClick={()=>speak(out.translation)}><Icon d={IC.spk}/>{t('listen')}</button><button className="btn" onClick={()=>speak(out.translation,'en-US',true)}>{t('listenSlow')}</button></div>}
        <b>{t('trWhy')}</b><p>{out.why}</p>{out.alt&&<p className="muted" lang="en">{out.alt}</p>}</div>}
    </Card>
    <Card><Eyebrow>{t('examples')||'Examples'}</Eyebrow><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>{D.examples.map((e:any,i:number)=><button key={i} className="chip" onClick={()=>ex(e)}>{e.chipUk}</button>)}</div></Card></div>;
}
