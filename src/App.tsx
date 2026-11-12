// App.tsx — screen routing (state-based; no router needed for the pilot) + theme application
// UPDATED: 2026-11-08 (build 001)
import {useEffect,useState} from 'react';
import {useSettings} from '@/lib/store';
import {themeVars} from '@/lib/theme';
import {Background,Dock,TopBar,type Screen} from '@/components/Shell';
import {WordCard} from '@/components/ui';import {Feedback} from '@/components/Feedback';
import {Welcome,Check} from '@/pages/Welcome';import {Home} from '@/pages/Home';import {Lex} from '@/pages/Lex';import {Translate} from '@/pages/Translate';
import {Dictionary} from '@/pages/Dictionary';import {Civics} from '@/pages/Civics';import {Interview} from '@/pages/Interview';import {N400} from '@/pages/N400';
import {Videos} from '@/pages/Videos';import {Progress} from '@/pages/Progress';import {Settings} from '@/pages/Settings';
export default function App(){
  const s=useSettings();const [screen,setScreen]=useState<Screen>(s.welcomed?'home':'welcome');
  const go=(x:Screen)=>{setScreen(x);window.scrollTo({top:0});};
  useEffect(()=>{document.documentElement.lang=s.help==='en'?'en':'uk';document.body.style.background=themeVars(s.primary,s.accent,s.dark)['--bg'];},[s.help,s.primary,s.accent,s.dark]);
  const vars=themeVars(s.primary,s.accent,s.dark) as React.CSSProperties;
  const cls='lb'+(s.calm?' calm':'')+(s.review?' review':'')+(s.help==='uk'?' isuk':'');
  const P={welcome:<Welcome go={go}/>,check:<Check go={go}/>,home:<Home go={go}/>,lex:<Lex/>,translate:<Translate/>,dict:<Dictionary/>,civics:<Civics/>,interview:<Interview/>,n400:<N400/>,videos:<Videos/>,progress:<Progress/>,settings:<Settings go={go}/>}[screen];
  return <div className={cls} style={{...vars,position:'relative',minHeight:'100vh',background:'var(--bg)',color:'var(--ink)',fontFamily:'Inter,system-ui,sans-serif',transition:'background-color .6s,color .6s'}}>
    <Background/>
    <div style={{position:'relative',zIndex:1,paddingBottom:120}}>
      <TopBar go={go} screen={screen}/>
      <main style={{padding:'20px 14px'}}>{P}{screen!=='welcome'&&screen!=='check'&&<div style={{maxWidth:980,margin:'18px auto 0'}}><Feedback screen={screen}/></div>}</main></div>
    {screen!=='welcome'&&screen!=='check'&&<Dock screen={screen} go={go}/>}
    <WordCard/>
  </div>;
}
