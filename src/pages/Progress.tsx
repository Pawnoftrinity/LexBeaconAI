// Progress.tsx — week view, minutes, streak, spaced-review counts
// UPDATED: 2026-11-08 (build 001)
import {useProgress,useSettings,streak} from '@/lib/store';
import {useT} from '@/lib/i18n';import {Card,Eyebrow} from '@/components/ui';import {dueKeys} from '@/lib/srs';
const key=(d:Date)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
export function Progress(){
  const t=useT();const p=useProgress();const s=useSettings();
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d;});
  const total=days.reduce((a,d)=>a+(p.minutesByDay[key(d)]||0),0);
  const boxes=[1,2,3,4,5].map(b=>Object.values(p.srs).filter(c=>c.box===b).length);
  const q=Object.keys(p.srs).filter(k=>k.startsWith('q:')).length,w=Object.keys(p.srs).filter(k=>k.startsWith('w:')).length;
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card><Eyebrow>{t('pgEyebrow')}</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('pgTitle')}</h2>
      <div style={{display:'flex',gap:8,justifyContent:'space-between',margin:'14px 0'}}>{days.map((d,i)=>{const k=key(d),m=p.minutesByDay[k]||0,r=p.restDays.includes(k);
        return <div key={k} style={{display:'grid',justifyItems:'center',gap:4}}><div className={'dot '+(m>0?'done':r?'rest':i===6?'today':'miss')} aria-label={k}>{m>0?'✓':r?'R':''}</div><span className="muted" style={{fontSize:12}}>{d.toLocaleDateString(undefined,{weekday:'short'})}</span></div>;})}</div>
      <p><b>{streak(p)}</b> {t('stkDays')} · <b>{total}</b> {t('pgMinutes')} · {t('stkGoalT')}: {s.goalMin} {t('stkMin')}</p></Card>
    <Card><Eyebrow>{t('pgMile')}</Eyebrow>
      <p style={{marginTop:10}}>{t('reviewT')}: <b>{dueKeys(p).length}</b> · {t('civAll')}: <b>{q}</b>/128 · {t('mwTitle')}: <b>{w}</b></p>
      <div style={{display:'flex',gap:6,alignItems:'flex-end',height:90,marginTop:12}} aria-label="Leitner boxes">{boxes.map((n,i)=><div key={i} style={{flex:1,display:'grid',justifyItems:'center',gap:4}}><div style={{width:'100%',height:Math.max(6,n*8),maxHeight:70,borderRadius:10,backgroundImage:'linear-gradient(135deg,var(--p1),var(--p2))'}}/><span className="muted" style={{fontSize:12}}>{i+1}</span></div>)}</div></Card></div>;
}
