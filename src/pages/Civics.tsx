// Civics.tsx — 2025 civics test practice (128 Q): all / starred / due / weak, dated answers, spoken answers, spaced review
// UPDATED: 2026-11-08 (build 001)
import {useMemo,useState} from 'react';
import {civics2025,type Civ} from '@/data/civics2025';import {civics2008} from '@/data/civics2008';
import {ask} from '@/lib/ai';import {speak} from '@/lib/speech';
import {useT} from '@/lib/i18n';import {useProgress,addMinutes,useSettings,setSettings} from '@/lib/store';
import {grade,dueKeys,weakKeys} from '@/lib/srs';
import {Bi,Card,Eyebrow,Icon,IC,Words} from '@/components/ui';import {Pron} from '@/components/Pron';
type Mode='all'|'star'|'due'|'weak';
const clean=(s:string)=>s.replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();
export function Civics(){
  const t=useT();const p=useProgress();const s=useSettings();const pack=s.test;const base=pack==='2025'?civics2025:civics2008;const pre='q:'+pack+'-';const [mode0,setMode]=useState<Mode>('star');const mode:Mode=pack==='2008'&&mode0==='star'?'all':mode0;const [i,setI]=useState(0);const [show,setShow]=useState(false);
  const [ukq,setUkq]=useState('');const [live,setLive]=useState<any>(null);const [busy,setBusy]=useState(false);
  const list=useMemo(():Civ[]=>{
    if(mode==='all')return base;if(mode==='star')return base.filter(c=>c.star);
    const keys=(mode==='due'?dueKeys(p,pre):weakKeys(p,pre)).map(k=>+k.slice(7));return base.filter(c=>keys.includes(c.n));},[mode,p.srs,pack]);// eslint-disable-line
  const c=list[Math.min(i,Math.max(0,list.length-1))];
  const pick=(m:Mode)=>{setMode(m);setI(0);setShow(false);setUkq('');setLive(null);};
  const next=(ok:boolean)=>{grade(pre+c.n,ok);addMinutes(1);setShow(false);setUkq('');setLive(null);setI(i+1>=list.length?0:i+1);};
  const trans=async()=>{setBusy(true);const r=await ask('translate',c.q);setBusy(false);setUkq(r.ok&&r.data?.translation?r.data.translation:t('offlineAi'));};
  const check=async()=>{setBusy(true);const r=await ask('verify',c.q);setBusy(false);setLive(r.ok?{...r.data,grounded:r.grounded}:{note:t('offlineAi')});};
  const modes:[Mode,string][]=(pack==='2025'?[['star','civStar'],['all','civAll'],['due','civDue'],['weak','civWeak']]:[['all','civAll'],['due','civDue'],['weak','civWeak']]) as [Mode,string][];
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card><Eyebrow>{t('quizEyebrow')}</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('quizTitle')}</h2>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{modes.map(([m,k])=><button key={m} className={'chip'+(mode===m?' on':'')} onClick={()=>pick(m)} aria-pressed={mode===m}>{t(k)}</button>)}</div>
      <div style={{display:'flex',gap:8,marginTop:10,alignItems:'center',flexWrap:'wrap'}}><b>{t('civPack')}:</b>{(['2025','2008'] as const).map(v=><button key={v} className={'chip'+(pack===v?' on':'')} aria-pressed={pack===v} onClick={()=>{setSettings({test:v});setI(0);setShow(false);}}>{v==='2025'?t('t25'):t('t08')}</button>)}</div>
      <Bi k={pack==='2025'?'civTestInfo':'civ08'} style={{marginTop:12,fontSize:14}}/></Card>
    {!c?<Card><p>{t('reviewNone')}</p></Card>:
    <Card style={{display:'grid',gap:12}}>
      <div style={{display:'flex',justifyContent:'space-between'}}><span className="tag muted">#{c.n} · {c.sub}{c.star?' ★':''}</span><span className="muted">{Math.min(i,list.length-1)+1}/{list.length}</span></div>
      <h3 className="hf" lang="en" style={{fontSize:'clamp(20px,3vw,26px)'}}><Words text={c.q}/></h3>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn" onClick={()=>speak(c.q)}><Icon d={IC.spk}/>{t('listenQ')}</button><button className="btn" disabled={busy} onClick={trans}>UA</button></div>
      {ukq&&<p lang="uk" className="muted rv">{ukq}</p>}
      <b>{t('speakPractice')}</b><Pron target={clean(c.a[0])}/>
      {!show?<button className="btn btnp" onClick={()=>setShow(true)}>{t('civShow')}</button>:<div className="g2 rv" style={{padding:16,display:'grid',gap:8}}>
        <b>{t('theAnswer')}</b>
        <ul style={{margin:0,paddingLeft:20,display:'grid',gap:4}} lang="en">{c.a.map((a,k)=><li key={k}><Words text={a}/></li>)}</ul>
        <button className="btn" onClick={()=>speak(clean(c.a[0]))}><Icon d={IC.spk}/>{t('listen')}</button>
        {c.note&&<p className="muted" style={{fontSize:13}}>{c.note}</p>}
        {c.dyn&&<div className="g2" style={{padding:12,borderColor:'var(--primaryText)'}}><b>{t('civDyn')}</b>
          <p className="muted" style={{fontSize:13}}>{t('civVerified')}: 2026-11-05 · uscis.gov/citizenship/testupdates</p>
          {c.n===23||c.n===29||c.n===61||c.n===62?<p>{t('civVary')}</p>:null}
          <button className="btn" disabled={busy} onClick={check}>{busy?t('civChecking'):t('civCheck')}</button>
          {live&&<div className="rv" style={{marginTop:8}}>{live.answer&&<p><b lang="en">{live.answer}</b></p>}{live.asOf&&<p className="muted" style={{fontSize:13}}>{live.asOf}{live.source?` · ${live.source}`:''}</p>}{live.note&&<p>{live.note}</p>}{live.grounded===false&&<p className="muted" style={{fontSize:13}}>{t('civVary')}</p>}</div>}</div>}
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn btnp" onClick={()=>next(true)}>{t('civRight')}</button><button className="btn" onClick={()=>next(false)}>{t('civWrong')}</button></div></div>}
    </Card>}
    <p className="muted" style={{fontSize:13}}><Bi k={pack==='2025'?'civWording':'civWording08'} tag="span"/></p>
  </div>;
}
