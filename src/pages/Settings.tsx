// Settings.tsx — help level, fade time, colors, voice+speed, goal, test version, review mode, access code, reset
// UPDATED: 2026-11-08 (build 001)
import {useEffect,useState} from 'react';
import {useSettings,setSettings,resetAll} from '@/lib/store';
import {useT} from '@/lib/i18n';import {Card,Eyebrow} from '@/components/ui';
import {enVoices,speak} from '@/lib/speech';import {DEFAULT_ACCENT,DEFAULT_PRIMARY} from '@/lib/theme';import {APP_VERSION} from '@/version';
export function Settings({go}:{go:(s:any)=>void}){
  const t=useT();const s=useSettings();const [voices,setVoices]=useState(enVoices());
  useEffect(()=>{if(!('speechSynthesis' in window))return;const f=()=>setVoices(enVoices());speechSynthesis.addEventListener('voiceschanged',f);return()=>speechSynthesis.removeEventListener('voiceschanged',f);},[]);
  const rates:[string,number][]=[['rateSlow',0.75],['rateNormal',0.95],['rateFast',1.15]];
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card><Eyebrow>{t('stTitle')}</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('stSub')}</h2></Card>
    <Card style={{display:'grid',gap:10}}><b>{t('stHelpT')}</b><p className="muted">{t('stHelpSub')}</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{(['uk','mix','en'] as const).map(h=><button key={h} className={'chip'+(s.help===h?' on':'')} onClick={()=>setSettings({help:h})}>{t(h==='uk'?'hFull':h==='mix'?'hMix':'hEn')}</button>)}</div>
      {s.help==='mix'&&<><b>{t('stFadeT')}</b><p className="muted">{t('stFadeSub')}</p><div style={{display:'flex',gap:8}}>{([15,30,60] as const).map(n=><button key={n} className={'chip'+(s.fadeSec===n?' on':'')} onClick={()=>setSettings({fadeSec:n})}>{n}s</button>)}</div></>}</Card>
    <Card style={{display:'grid',gap:10}}><b>{t('stColorsT')}</b>
      <div style={{display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}><label>Primary <input type="color" value={s.primary} onChange={e=>setSettings({primary:e.target.value})}/></label><label>Accent <input type="color" value={s.accent} onChange={e=>setSettings({accent:e.target.value})}/></label>
        <button className="btn" onClick={()=>setSettings({primary:DEFAULT_PRIMARY,accent:DEFAULT_ACCENT})}>{t('stReset')}</button></div>
      <b>{t('stBgT')}</b><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="btn" onClick={()=>setSettings({bgSeed:Math.floor(Math.random()*1e6)})}>{t('stShuffle')}</button><button className={'chip'+(s.calm?' on':'')} aria-pressed={s.calm} onClick={()=>setSettings({calm:!s.calm})}>Calm</button></div></Card>
    <Card style={{display:'grid',gap:10}}><b>{t('voiceT')}</b><p className="muted">{t('voiceSub')}</p>
      {voices.length?<select className="field" value={s.voiceName} onChange={e=>setSettings({voiceName:e.target.value})} aria-label={t('voiceT')}><option value="">Auto</option>{voices.map(v=><option key={v.name} value={v.name}>{v.name}</option>)}</select>:<p className="muted">{t('voiceNone')}</p>}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{rates.map(([k,r])=><button key={k} className={'chip'+(s.rate===r?' on':'')} onClick={()=>setSettings({rate:r})}>{t(k)}</button>)}<button className="btn" onClick={()=>speak('Citizens can vote.')}>{t('voiceTest')}</button></div></Card>
    <Card style={{display:'grid',gap:10}}><b>{t('stkGoalT')}</b><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{[5,10,15,20,30].map(n=><button key={n} className={'chip'+(s.goalMin===n?' on':'')} onClick={()=>setSettings({goalMin:n})}>{n} {t('stkMin')}</button>)}</div>
      <b>{t('testPick')}</b><div style={{display:'flex',gap:8}}>{(['2025','2008'] as const).map(v=><button key={v} className={'chip'+(s.test===v?' on':'')} onClick={()=>setSettings({test:v})}>{v==='2025'?t('t25'):t('t08')}</button>)}</div>
      <label><b>{t('n400Code')}</b><input className="field" type="date" value={s.n400Date} onChange={e=>{const d=e.target.value;setSettings({n400Date:d,test:d&&d<'2025-10-20'?'2008':'2025'});}}/></label></Card>
    <Card style={{display:'grid',gap:10}}><b>{t('stCheckT')}</b><p className="muted">{t('stCheckSub')}</p><div><button className="btn" onClick={()=>go('check')}>{t('stRetake')}</button></div>
      <b>{t('stReviewT')}</b><p className="muted">{t('stReviewSub')}</p><div><button className={'chip'+(s.review?' on':'')} aria-pressed={s.review} onClick={()=>setSettings({review:!s.review})}>{s.review?'ON':'OFF'}</button></div></Card>
    <Card style={{display:'grid',gap:10}}><b>{t('offT')}</b><p className="muted">{t('offProto')}</p>
      <label><b>{t('accessCode')}</b><p className="muted">{t('accessSub')}</p><input className="field" type="password" value={s.code} onChange={e=>setSettings({code:e.target.value})} autoComplete="off"/></label>
      <p className="muted" style={{fontSize:13}}>{t('version')}: {APP_VERSION}</p><div><button className="btn" onClick={()=>{if(confirm('Reset?'))resetAll();}}>{t('stReset')}</button></div></Card>
  </div>;
}
