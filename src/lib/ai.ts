// ai.ts — client for /api/ai (Worker). Works without keys: returns null so UI falls back to offline content.
// UPDATED: 2026-11-08 (build 001)
import {getSettings} from './store';
export interface AiOut<T=any>{ok:boolean;provider?:string;grounded?:boolean;data?:T;error?:string}
export async function ask<T=any>(task:string,text:string,extra:Record<string,unknown>={}):Promise<AiOut<T>>{
  try{
    const s=getSettings();
    const r=await fetch('/api/ai',{method:'POST',headers:{'content-type':'application/json',...(s.code?{'x-lex-code':s.code}:{})},
      body:JSON.stringify({task,text,learnerLang:s.learner,level:s.level==null?'':['A1','A2','B1','B2'][s.level],...extra})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return{ok:false,error:j.error||('http_'+r.status)};
    return j;
  }catch{return{ok:false,error:'offline'};}
}
