// Dictionary.tsx — search + pronunciation + My words (saved, weak, spaced review)
// UPDATED: 2026-11-08 (build 001)
import {useState} from 'react';
import {content as D} from '@/data/content';import {lexicon} from '@/data/lexicon';
import {ask} from '@/lib/ai';import {speak} from '@/lib/speech';
import {useT} from '@/lib/i18n';import {useProgress,setProgress,addMinutes} from '@/lib/store';
import {grade,dueKeys,weakKeys} from '@/lib/srs';
import {Card,Eyebrow,Icon,IC,Words} from '@/components/ui';import {Pron} from '@/components/Pron';
interface E{word:string;ipa:string;uk:string;def:string;ex?:string;exUk?:string}
const find=(q:string):E|null=>{q=q.trim().toLowerCase();if(!q)return null;
  const w=D.words.find((x:any)=>x.word===q);if(w)return{word:w.word,ipa:w.ipa,uk:w.uk,def:w.def,ex:w.ex,exUk:w.exUk};
  const l=lexicon[q];return l?{word:q,ipa:l[0],uk:l[1],def:l[2]}:null;};
export function Dictionary(){
  const t=useT();const p=useProgress();const [tab,setTab]=useState<'d'|'m'>('d');const [q,setQ]=useState('');const [e,setE]=useState<E|null>(null);const [note,setNote]=useState('');
  const [rev,setRev]=useState<string[]|null>(null);const [flip,setFlip]=useState(false);
  const search=async(v=q)=>{setNote('');const f=find(v);if(f){setE(f);return;}setE(null);if(!v.trim())return;setNote(t('dictNone'));
    const r=await ask('define',v.trim());if(r.ok&&r.data?.word){setE({word:r.data.word,ipa:r.data.ipa,uk:r.data.meaning_l,def:r.data.meaning_en,ex:r.data.example,exUk:r.data.example_l});setNote('');}else setNote(t('offlineAi'));};
  const saved=p.saved.filter(k=>k.startsWith('w:')).map(k=>k.slice(2));
  const toggle=(w:string)=>setProgress(x=>({...x,saved:x.saved.includes('w:'+w)?x.saved.filter(k=>k!=='w:'+w):[...x.saved,'w:'+w]}));
  const weak=weakKeys(p,'w:').map(k=>k.slice(2));const due=dueKeys(p,'w:').map(k=>k.slice(2)).filter(w=>saved.includes(w));
  const start=()=>{setRev(due.length?due:saved);setFlip(false);};
  const cur=rev&&rev[0];const ce=cur?find(cur):null;
  const answer=(ok:boolean)=>{grade('w:'+cur,ok);addMinutes(1);setFlip(false);setRev(rev!.slice(1));};
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:860,margin:'0 auto'}}>
    <Card><Eyebrow>{t('dictEyebrow')}</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('dictTitle')}</h2>
      <div style={{display:'flex',gap:8}}><button className={'chip'+(tab==='d'?' on':'')} onClick={()=>setTab('d')}>{t('dTabDict')}</button><button className={'chip'+(tab==='m'?' on':'')} onClick={()=>setTab('m')}>{t('dTabMine')} ({saved.length})</button></div></Card>
    {tab==='d'&&<Card style={{display:'grid',gap:12}}>
      <form onSubmit={ev=>{ev.preventDefault();search();}} style={{display:'flex',gap:8}}><input className="field" value={q} onChange={ev=>setQ(ev.target.value)} placeholder={t('dictSearch')} aria-label={t('dictSearch')}/><button className="btn btnp">{t('trBtn')}</button></form>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{D.words.map((w:any)=><button key={w.word} className="chip" onClick={()=>{setQ(w.word);setE(find(w.word));}}>{w.word}</button>)}</div>
      {note&&<p className="muted">{note}</p>}
      {e&&<div className="g2 rv" style={{padding:16,display:'grid',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{flex:1}}><div className="hf" style={{fontSize:28,fontWeight:800}}>{e.word}</div><div className="muted">{e.ipa}</div></div>
          <button className="ibtn" onClick={()=>speak(e.word)} aria-label={t('listen')}><Icon d={IC.spk}/></button><button className="btn" onClick={()=>speak(e.word,'en-US',true)}>{t('slowly')}</button></div>
        <p lang="uk" style={{fontWeight:700}}>{e.uk}</p><p lang="en"><Words text={e.def}/></p>
        {e.ex&&<><b>{t('example')}</b><p lang="en"><Words text={e.ex}/></p><p lang="uk" className="muted">{e.exUk}</p><button className="btn" onClick={()=>speak(e.ex!)}><Icon d={IC.spk}/>{t('listenSentence')}</button></>}
        <b>{t('pronT')}</b><Pron target={e.word}/>
        <button className={'btn'+(saved.includes(e.word)?'':' btnp')} onClick={()=>toggle(e.word)}>{saved.includes(e.word)?t('twSaved'):t('twSave')}</button></div>}
    </Card>}
    {tab==='m'&&<Card style={{display:'grid',gap:12}}>
      <Eyebrow>{t('mwTitle')}</Eyebrow>
      {!saved.length&&<p className="muted">{t('mwEmpty')}</p>}
      {saved.length>0&&!rev&&<div><button className="btn btnp" onClick={start}>{t('mwReview')} ({due.length||saved.length})</button></div>}
      {rev&&(cur&&ce?<div className="g2 rv" style={{padding:18,display:'grid',gap:10,textAlign:'center'}}><div className="hf" style={{fontSize:30,fontWeight:800}}>{ce.word}</div>
        <button className="btn" onClick={()=>speak(ce.word)}><Icon d={IC.spk}/>{t('listen')}</button>
        {!flip?<button className="btn btnp" onClick={()=>setFlip(true)}>{t('civShow')}</button>:<><p lang="uk" style={{fontWeight:700}}>{ce.uk}</p><p lang="en" className="muted">{ce.def}</p>
          <div style={{display:'flex',gap:8,justifyContent:'center'}}><button className="btn btnp" onClick={()=>answer(true)}>{t('civRight')}</button><button className="btn" onClick={()=>answer(false)}>{t('civWrong')}</button></div></>}</div>
        :<p>{t('reviewNone')}</p>)}
      {rev&&!cur&&<button className="btn" onClick={()=>setRev(null)}>{t('close')}</button>}
      <div style={{display:'grid',gap:6}}>{saved.map(w=><div key={w} className="row"><b style={{flex:1}}>{w}</b><span className="muted" lang="uk">{find(w)?.uk}</span><button className="ibtn" onClick={()=>speak(w)} aria-label={t('listen')}><Icon d={IC.spk}/></button><button className="ibtn" onClick={()=>toggle(w)} aria-label={t('mwRemove')}><Icon d={IC.x}/></button></div>)}</div>
      <Eyebrow>{t('mwWeakT')}</Eyebrow>{weak.length?<div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{weak.map(w=><span key={w} className="chip">{w}</span>)}</div>:<p className="muted">{t('mwWeakEmpty')}</p>}
    </Card>}
  </div>;
}
