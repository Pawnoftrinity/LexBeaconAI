// Videos.tsx — trusted-channel videos (English, pronunciation, civics, history, government, immigration),
// embedded player (youtube-nocookie), paste-a-link, and a short Lex quiz after watching.
// UPDATED: 2026-11-10 (build 002). YouTube plays in YouTube's own player (terms: not covered or altered).
import {useEffect,useState} from 'react';
import {getSettings,useProgress,setProgress,addMinutes,today} from '@/lib/store';
import {useT} from '@/lib/i18n';import {ask} from '@/lib/ai';
import {Card,Eyebrow,Icon,IC} from '@/components/ui';
interface V{id:string;title:string;channel:string;thumb:string}
const TOPICS:[string,string][]=[['english','vidTopicEnglish'],['pronunciation','vidTopicPron'],['civics','vidTopicCivics'],['history','vidTopicHistory'],['government','vidTopicGov'],['immigration','vidTopicImm']];
const CHANNELS:[string,string][]=[['USCIS','https://www.youtube.com/@USCIS'],['VOA Learning English','https://www.youtube.com/@VOALearningEnglish'],['BBC Learning English','https://www.youtube.com/@bbclearningenglish'],['Rachel’s English','https://www.youtube.com/@RachelsEnglish'],['English with Lucy','https://www.youtube.com/@EnglishwithLucy']];
export const ytId=(u:string)=>{const m=u.trim().match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m?m[1]:/^[\w-]{11}$/.test(u.trim())?u.trim():'';};
interface Quiz{summary_l:string;questions:{q:string;o:string[];a:number;why_l:string}[]}
export function Videos(){
  const t=useT();const p=useProgress();const [topic,setTopic]=useState('civics');const [items,setItems]=useState<V[]|null>(null);const [state,setState]=useState<'load'|'ok'|'nokey'|'fail'>('load');
  const [cur,setCur]=useState<V|null>(null);const [link,setLink]=useState('');const [quiz,setQuiz]=useState<Quiz|null>(null);const [src,setSrc]=useState('');const [busy,setBusy]=useState(false);const [ans,setAns]=useState<number[]>([]);
  useEffect(()=>{let live=true;setState('load');setItems(null);
    (async()=>{try{const s=getSettings();const r=await fetch('/api/videos?topic='+topic,{headers:s.code?{'x-lex-code':s.code}:{}});const j=await r.json().catch(()=>({}));
      if(!live)return;if(j.ok){setItems(j.items);setState('ok');}else setState(j.error==='no_key'||j.error?.startsWith('yt_40')?'nokey':'fail');}catch{if(live)setState('fail');}})();
    return()=>{live=false;};},[topic]);
  const open=(v:V)=>{setCur(v);setQuiz(null);setAns([]);setSrc('');setProgress(x=>({...x,videos:{...x.videos,watched:x.videos.watched.includes(v.id)?x.videos.watched:[...x.videos.watched,v.id]}}));addMinutes(2);window.scrollTo({top:0,behavior:'smooth'});};
  const pasted=()=>{const id=ytId(link);if(id)open({id,title:'',channel:'',thumb:''});};
  const mkQuiz=async()=>{if(!cur)return;setBusy(true);const r:any=await ask('videoquiz',cur.id,{question:cur.title});setBusy(false);
    if(r.ok&&r.data?.questions){setQuiz(r.data);setSrc(r.source);setAns([]);}else setSrc('fail');};
  const pick=(qi:number,k:number)=>{if(ans[qi]!=null)return;const a=[...ans];a[qi]=k;setAns(a);
    if(quiz&&a.filter(x=>x!=null).length===quiz.questions.length){const right=quiz.questions.filter((q,i)=>a[i]===q.a).length;addMinutes(3);
      setProgress(x=>({...x,videos:{...x.videos,quiz:[...x.videos.quiz,{id:cur!.id,right,total:quiz.questions.length,at:today()}].slice(-50)}}));}};
  const done=quiz&&ans.filter(x=>x!=null).length===quiz.questions.length;
  return <div className="screen" style={{display:'grid',gap:16,maxWidth:980,margin:'0 auto'}}>
    <Card><Eyebrow>{t('vidEyebrow')}</Eyebrow><h2 className="hf" style={{margin:'10px 0'}}>{t('vidTitle')}</h2>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{TOPICS.map(([k,l])=><button key={k} className={'chip'+(topic===k?' on':'')} aria-pressed={topic===k} onClick={()=>setTopic(k)}>{t(l)}</button>)}</div>
      {topic==='immigration'&&<p className="muted" style={{marginTop:10,fontSize:14}}>{t('vidLegal')}</p>}</Card>
    {cur&&<Card style={{display:'grid',gap:12}}>
      <div className="player"><iframe title={cur.title||'YouTube'} src={`https://www.youtube-nocookie.com/embed/${cur.id}?rel=0&playsinline=1&cc_load_policy=1&cc_lang_pref=uk&hl=uk`} allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/></div>
      {cur.title&&<b>{cur.title}</b>}<p className="muted" style={{fontSize:13}}>{t('vidCc')}</p>
      {!quiz&&<div><button className="btn btnp" disabled={busy} onClick={mkQuiz}>{busy?t('vidQuizBusy'):t('vidQuiz')}</button>{src==='fail'&&<p className="muted" style={{marginTop:8}}>{t('offlineAi')}</p>}</div>}
      {quiz&&<div className="g2 rv" style={{padding:14,display:'grid',gap:12}}>
        {src==='title'&&<p className="muted" style={{fontSize:13}}>{t('vidQuizTitleOnly')}</p>}
        <p lang="uk">{quiz.summary_l}</p>
        {quiz.questions.map((q,qi)=><div key={qi} style={{display:'grid',gap:6}}><b lang="en">{qi+1}. {q.q}</b>
          {q.o.map((o,k)=><button key={k} lang="en" disabled={ans[qi]!=null} className={'opt'+(ans[qi]!=null?(k===q.a?' right':ans[qi]===k?' wrong':''):'')} onClick={()=>pick(qi,k)}>{o}</button>)}
          {ans[qi]!=null&&<p className="muted rv" lang="uk" style={{fontSize:14}}>{q.why_l}</p>}</div>)}
        {done&&<p className="rv"><b>{t('vidScore')}: {quiz.questions.filter((q,i)=>ans[i]===q.a).length}/{quiz.questions.length}</b></p>}</div>}
      <p className="muted" style={{fontSize:12}}>{t('vidLegal')}</p></Card>}
    <Card style={{display:'grid',gap:12}}>
      {state==='load'&&<p className="muted">{t('vidLoading')}</p>}
      {state==='nokey'&&<p className="muted">{t('vidNoKey')}</p>}{state==='fail'&&<p className="muted">{t('vidFail')}</p>}
      {state==='ok'&&items&&<div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))'}}>{items.map(v=><button key={v.id} className="vid" onClick={()=>open(v)}>
        <img src={v.thumb} alt="" loading="lazy"/><span style={{padding:'0 12px 12px',display:'grid',gap:2}}><b style={{fontSize:14,lineHeight:1.3}}>{v.title}</b><span className="muted" style={{fontSize:12}}>{v.channel}{p.videos.watched.includes(v.id)?' · '+t('vidWatched'):''}</span></span></button>)}</div>}
    </Card>
    <Card style={{display:'grid',gap:10}}><b>{t('vidPaste')}</b>
      <form onSubmit={e=>{e.preventDefault();pasted();}} style={{display:'flex',gap:8}}><input className="field" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://youtu.be/..." inputMode="url" aria-label={t('vidPaste')}/><button className="btn btnp" disabled={!ytId(link)}>{t('vidWatch')}</button></form>
      <b>{t('vidChannels')}</b><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{CHANNELS.map(([n,u])=><a key={n} className="chip" href={u} target="_blank" rel="noreferrer"><Icon d={IC.arrow} size={14}/>&nbsp;{n}</a>)}</div></Card>
  </div>;
}
