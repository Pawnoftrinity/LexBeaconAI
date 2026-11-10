// speech.ts — browser text-to-speech (American English voices) + speech recognition
// UPDATED: 2026-11-08 (build 001). No audio leaves the device except what the browser itself does.
import {getSettings} from './store';
export const ttsOk=()=>typeof window!=='undefined'&&'speechSynthesis' in window;
export function enVoices():SpeechSynthesisVoice[]{if(!ttsOk())return[];return speechSynthesis.getVoices().filter(v=>v.lang.replace('_','-').toLowerCase()==='en-us');}
export function speak(text:string,lang:'en-US'|'uk-UA'='en-US',slow=false){
  try{if(!ttsOk())return;const s=speechSynthesis;s.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;
    u.rate=(slow?0.7:1)*getSettings().rate/0.95*0.95;const all=s.getVoices();
    let v=lang==='en-US'&&getSettings().voiceName?all.find(x=>x.name===getSettings().voiceName):undefined;
    if(!v)v=all.find(x=>x.lang.replace('_','-').toLowerCase()===lang.toLowerCase())||all.find(x=>x.lang.toLowerCase().startsWith(lang.slice(0,2)));
    if(v)u.voice=v;s.speak(u);}catch{/* no speech */}
}
const SR:any=typeof window!=='undefined'?((window as any).SpeechRecognition||(window as any).webkitSpeechRecognition):null;
export const sttOk=()=>!!SR;
export function listen(onResult:(t:string)=>void,onEnd:(err?:string)=>void){
  if(!SR){onEnd('unsupported');return()=>{};}
  const r=new SR();r.lang='en-US';r.interimResults=false;r.maxAlternatives=1;
  r.onresult=(e:any)=>onResult(e.results[0][0].transcript);r.onerror=(e:any)=>onEnd(e.error||'error');r.onend=()=>onEnd();
  try{r.start();}catch{onEnd('error');}
  return()=>{try{r.stop();}catch{/* */}};
}
// word-by-word pronunciation score (0-100) + which words matched
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9' ]/g,'').split(/\s+/).filter(Boolean);
function lev(a:string,b:string){const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);for(let j=1;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}
export function scoreSpeech(target:string,heard:string){
  const t=norm(target),h=norm(heard);const used=new Set<number>();
  const words=t.map(w=>{let best=-1,bd=9;h.forEach((x,i)=>{if(used.has(i))return;const dd=lev(w,x);if(dd<bd){bd=dd;best=i;}});
    const ok=best>=0&&bd<=Math.floor(w.length/4);if(ok)used.add(best);return {w,ok};});
  return {score:t.length?Math.round(100*words.filter(x=>x.ok).length/t.length):0,words};
}
