// Home.tsx — hero, today's plan, streak card, test info
// UPDATED: 2026-11-08 (build 001)
import {useProgress,useSettings,streak,today,useRest,restUsedThisWeek,addMinutes} from '@/lib/store';
import {useT,useMenu} from '@/lib/i18n';
import {dueKeys} from '@/lib/srs';
import {Card,Eyebrow,Icon,IC,Bi} from '@/components/ui';
export function Home({go}:{go:(s:any)=>void}){
  const t=useT();const m=useMenu();const p=useProgress();const s=useSettings();
  const n=streak(p),min=p.minutesByDay[today()]||0,due=dueKeys(p).length;
  return <div className="screen" style={{display:'grid',gap:18,maxWidth:980,margin:'0 auto'}}>
    <Card><Eyebrow>{t('hi')}</Eyebrow>
      <h1 className="hf gt" style={{fontSize:'clamp(28px,5vw,46px)',lineHeight:1.1,margin:'12px 0 16px'}}>{t('heroA')} {t('heroB')}</h1>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button className="btn btnp" onClick={()=>go('lex')}><Icon d={IC.lex}/>{t('ctaLex')}</button>
        <button className="btn" onClick={()=>go('civics')}><Icon d={IC.civ}/>{m('dCiv')}</button>
        <button className="btn" onClick={()=>go('n400')}><Icon d={IC.doc}/>{m('dN400')}</button></div></Card>
    <div style={{display:'grid',gap:18,gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}>
      <Card><Eyebrow>{t('stkT')}</Eyebrow><div className="hf" style={{fontSize:44,fontWeight:800,margin:'8px 0'}}>{n} <span className="muted" style={{fontSize:16}}>{t('stkDays')}</span></div>
        <p className="muted">{t('stkToday')}: {min}/{s.goalMin} {t('stkMin')}</p>
        <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}><button className="btn" onClick={()=>addMinutes(5)}>+5 {t('stkMin')}</button>
          <button className="btn" disabled={restUsedThisWeek(p)} onClick={useRest}>{t('stkRest')}</button></div>
        <p className="muted" style={{marginTop:10,fontSize:13}}>{t('stkRestInfo').split('.').slice(1).join('.').trim()||t('stkRestInfo')}</p></Card>
      <Card><Eyebrow>{t('planT')}</Eyebrow>
        <button className="row" style={{marginTop:12}} onClick={()=>go('civics')}><Icon d={IC.civ}/><span>{t('reviewT')}: <b>{due}</b></span></button>
        <button className="row" style={{marginTop:8}} onClick={()=>go('dict')}><Icon d={IC.dict}/><span>{t('mwTitle')}: <b>{p.saved.length}</b></span></button>
        <button className="row" style={{marginTop:8}} onClick={()=>go('progress')}><Icon d={IC.prog}/><span>{t('pgTitle')}</span></button></Card></div>
    <Card><Eyebrow>{t('testT')}</Eyebrow><Bi k="civTestInfo" style={{marginTop:10}}/><Bi k="civOld" style={{marginTop:8}}/>
      <p className="muted" style={{marginTop:10,fontSize:13}}>{t('rulesChecked')}</p></Card>
    <p className="muted" style={{fontSize:12,maxWidth:760}}>{t('footer').replace(/Prototype by|Прототип від/,'©')}</p>
  </div>;
}
