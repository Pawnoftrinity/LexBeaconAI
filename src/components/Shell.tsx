// Shell.tsx — living flag background, top bar (feather-collapse to compact pill), dock (auto-hide + long-press)
// UPDATED: 2026-11-08 (build 001)
import {useEffect,useMemo,useRef,useState} from 'react';
import {useSettings,setSettings,type Help} from '@/lib/store';
import {makeGlyphs} from '@/lib/glyphs';
import {useT,useMenu,useMode} from '@/lib/i18n';
import {Icon,IC,Menu} from './ui';

export type Screen='welcome'|'check'|'home'|'lex'|'translate'|'dict'|'civics'|'interview'|'n400'|'videos'|'progress'|'settings';

export function Background(){
  const s=useSettings();const [seed,setSeed]=useState(s.bgSeed);
  useEffect(()=>{if(s.calm)return;const id=setInterval(()=>setSeed(x=>x+1),45000);return()=>clearInterval(id);},[s.calm]);
  useEffect(()=>setSeed(s.bgSeed),[s.bgSeed]);
  const g=useMemo(()=>makeGlyphs(s.dark,s.help,s.calm,seed),[s.dark,s.help,s.calm,seed]);
  const ukOp=s.help==='uk'?0.22:s.help==='mix'?0.16:0.08, usOp=s.help==='en'?0.22:s.help==='mix'?0.12:0.05;
  // viewport-sized sticky layer: avoids the tiling glitch seen in the prototype on long pages
  return <div aria-hidden="true" style={{position:'fixed',inset:0,zIndex:0,overflow:'hidden',pointerEvents:'none'}}>
    <div className="ukl" style={{opacity:s.dark?ukOp*0.8:ukOp}}/>
    <div className="usl" style={{opacity:s.dark?usOp*0.9:usOp*1.1,['--seam' as any]:s.help==='en'?'-28%':s.help==='mix'?'50%':'118%'}}><div className="stripes"/></div>
    <div className="blob" style={{left:'-10%',top:'-8%',background:'var(--p1)',opacity:.22}}/>
    <div className="blob" style={{right:'-12%',bottom:'-10%',background:'var(--accent)',opacity:.18,animationDelay:'-9s'}}/>
    {g.map((x,i)=><svg key={i} className="glyph" style={x.style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={x.d}/></svg>)}
  </div>;
}

function HelpSeg(){
  const s=useSettings();const t=useT();const opts:Help[]=['uk','mix','en'];const i=opts.indexOf(s.help);
  return <div className="seg" role="group" aria-label={t('segAria')} style={{minWidth:150}}>
    <span className="seghi" style={{transform:`translateX(${i*100}%)`}}/>
    {opts.map(o=><button key={o} className={'segb'+(o===s.help?' on':'')} aria-pressed={o===s.help} onClick={()=>setSettings({help:o})}
      aria-label={t(o==='uk'?'segUkAria':o==='mix'?'segMixAria':'segEnAria')}>{o==='uk'?'UA':o==='mix'?'Mix':'EN'}</button>)}
  </div>;
}

export function TopBar({go,screen}:{go:(s:Screen)=>void;screen:Screen}){
  const s=useSettings();const t=useT();const [collapsed,setCollapsed]=useState(false);const [pill,setPill]=useState(false);const [open,setOpen]=useState(false);
  const last=useRef(0);const wrap=useRef<HTMLDivElement>(null);const [h,setH]=useState(0);
  useEffect(()=>{const m=()=>{if(!collapsed&&wrap.current?.firstElementChild)setH((wrap.current.firstElementChild as HTMLElement).offsetHeight+10);};m();window.addEventListener('resize',m);return()=>window.removeEventListener('resize',m);},[collapsed,s.help]);
  useEffect(()=>{const f=()=>{const y=window.scrollY;if(y>last.current&&y>80)setCollapsed(true);else if(y<last.current-8||y<20)setCollapsed(false);last.current=y;};
    window.addEventListener('scroll',f,{passive:true});return()=>window.removeEventListener('scroll',f);},[]);
  useEffect(()=>{if(!collapsed){setPill(false);setOpen(false);return;}const id=setTimeout(()=>setPill(true),1000);return()=>clearTimeout(id);},[collapsed]);
  const logo=<button className="orb" style={{width:44,height:44}} onClick={()=>go('home')} aria-label={t('homeLbl')}><span className="orbring"/><Icon d={IC.lex}/></button>;
  const dark=<button className="ibtn" onClick={()=>setSettings({dark:!s.dark})} aria-label={s.dark?'Light':'Dark'}><Icon d={s.dark?IC.sun:IC.moon}/></button>;
  const wrapIt=(n:React.ReactNode)=><div ref={wrap} style={{height:h||undefined}}>{n}</div>;
  if(collapsed&&pill)return wrapIt(<div className="tbin" style={{position:'fixed',left:0,right:0,top:10,zIndex:30,display:'flex',justifyContent:'center',padding:'0 10px'}}>
    <div className="glass tbpill" style={{display:'flex',alignItems:'center',gap:8,padding:6,borderRadius:999}}>
      {logo}<HelpSeg/>{dark}
      <button className="ibtn" aria-expanded={open} aria-label={t('tbMore')} onClick={()=>setOpen(!open)}><Icon d={IC.arrow}/></button>
      {open&&<><button className="ibtn" onClick={()=>go('home')} aria-label={t('homeLbl')}><Icon d={IC.home}/></button><button className="ibtn" onClick={()=>go('settings')} aria-label={t('settingsLbl')}><Icon d={IC.set}/></button></>}
    </div></div>);
  return wrapIt(<header className={collapsed?'tbgone':''} style={{position:'fixed',left:0,right:0,top:10,zIndex:30,padding:'0 10px'}}>
    <div className="glass tbfull" style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'8px 14px',padding:'8px 12px',borderRadius:999}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>{logo}<div className="tagl" style={{display:'grid'}}><b className="hf">LexBeacon AI</b><span className="muted" style={{fontSize:12}}>{t('tagline')}</span></div></div>
      <div style={{display:'flex',alignItems:'center',gap:8}}><HelpSeg/>{dark}
        <button className={'ibtn'+(screen==='home'?' on':'')} onClick={()=>go('home')} aria-label={t('homeLbl')}><Icon d={IC.home}/></button>
        <button className={'ibtn'+(screen==='settings'?' on':'')} onClick={()=>go('settings')} aria-label={t('settingsLbl')}><Icon d={IC.set}/></button></div>
    </div></header>);
}

const DOCK:[Screen,string,string][]=[['home','dHome',IC.home],['lex','dLex',IC.lex],['translate','dTr',IC.tr],['dict','dDict',IC.dict],['civics','dCiv',IC.civ],['videos','dVid',IC.play],['interview','dIv',IC.iv]];
export function Dock({screen,go}:{screen:Screen;go:(s:Screen)=>void}){
  const m=useMenu();const t=useT();const [hide,setHide]=useState(false);const [qa,setQa]=useState(false);const last=useRef(0);const lp=useRef<number>();
  useEffect(()=>{const f=()=>{const y=window.scrollY;setHide(y>last.current&&y>120);last.current=y;};window.addEventListener('scroll',f,{passive:true});return()=>window.removeEventListener('scroll',f);},[]);
  const mode=useMode();void mode;
  return <><nav aria-label={t('navAria')} style={{position:'fixed',left:0,right:0,bottom:12,zIndex:40,display:'flex',justifyContent:'center',padding:'0 8px',transform:hide?'translateY(140%)':'none',transition:'transform .45s cubic-bezier(.2,.8,.2,1)',pointerEvents:'none'}}>
    <div className="glass" style={{display:'flex',gap:2,padding:6,borderRadius:999,pointerEvents:'auto'}}>
      {DOCK.map(([k,lab,ic])=><button key={k} className={'dk'+(screen===k?' on':'')} aria-label={m(lab)} aria-current={screen===k}
        onClick={()=>go(k)} onPointerDown={()=>{lp.current=window.setTimeout(()=>setQa(true),550);}} onPointerUp={()=>clearTimeout(lp.current)} onPointerLeave={()=>clearTimeout(lp.current)}>
        <Icon d={ic}/><span className="dklab">{m(lab)}</span></button>)}
    </div></nav>
    {qa&&<div className="glass pop" role="dialog" aria-label={t('qaTitle')} style={{position:'fixed',zIndex:60,left:0,right:0,marginInline:'auto',bottom:96,padding:16,width:'min(92vw,320px)'}}>
      <b className="hf">{t('qaTitle')}</b>
      <div style={{display:'grid',gap:8,marginTop:10}}>
        <button className="row" onClick={()=>{setQa(false);go('civics');}}><Icon d={IC.civ}/>{m('dCiv')}</button>
        <button className="row" onClick={()=>{setQa(false);go('videos');}}><Icon d={IC.play}/>{m('dVid')}</button>
        <button className="row" onClick={()=>{setQa(false);go('n400');}}><Icon d={IC.doc}/>{m('dN400')}</button>
        <button className="row" onClick={()=>{setQa(false);go('progress');}}><Icon d={IC.prog}/>{m('dProg')}</button>
        <button className="btn" onClick={()=>setQa(false)}>{t('close')}</button></div></div>}</>;
}
export {Menu};
