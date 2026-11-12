// store.ts — settings + progress in localStorage (Appwrite sync comes later)
// UPDATED: 2026-11-08 (build 001)
import {useSyncExternalStore} from 'react';
import {DEFAULT_ACCENT,DEFAULT_PRIMARY} from './theme';

export type Help='uk'|'mix'|'en';
export interface Settings{learner:'uk';help:Help;dark:boolean;primary:string;accent:string;calm:boolean;fadeSec:15|30|60;
  voiceName:string;rate:number;goalMin:number;level:number|null;welcomed:boolean;review:boolean;test:'2025'|'2008';n400Date:string;bgSeed:number;code:string;}
export interface SrsCard{box:number;due:string;seen:number;miss:number}
export interface Progress{minutesByDay:Record<string,number>;restDays:string[];saved:string[];srs:Record<string,SrsCard>;
  quiz:{right:number;total:number};lastOpen:string;videos:{watched:string[];quiz:{id:string;right:number;total:number;at:string}[]};notes:{at:string;screen:string;text:string}[]}
const S0:Settings={learner:'uk',help:'uk',dark:false,primary:DEFAULT_PRIMARY,accent:DEFAULT_ACCENT,calm:false,fadeSec:30,voiceName:'',rate:0.95,goalMin:10,level:null,welcomed:false,review:false,test:'2025',n400Date:'',bgSeed:7,code:''};
const P0:Progress={minutesByDay:{},restDays:[],saved:[],srs:{},quiz:{right:0,total:0},lastOpen:'',videos:{watched:[],quiz:[]},notes:[]};
function load<T>(k:string,d:T):T{try{const v=localStorage.getItem(k);return v?{...d,...JSON.parse(v)}:d;}catch{return d;}}
let settings=load('lex.settings.v1',S0),progress=load('lex.progress.v1',P0);
const subs=new Set<()=>void>();
const emit=()=>subs.forEach(f=>f());
const save=()=>{try{localStorage.setItem('lex.settings.v1',JSON.stringify(settings));localStorage.setItem('lex.progress.v1',JSON.stringify(progress));}catch{/* private mode */}};
const sub=(f:()=>void)=>{subs.add(f);return()=>{subs.delete(f);};};
export const useSettings=()=>useSyncExternalStore(sub,()=>settings);
export const useProgress=()=>useSyncExternalStore(sub,()=>progress);
export const getSettings=()=>settings;
export const getProgress=()=>progress;
export function setSettings(p:Partial<Settings>){settings={...settings,...p};save();emit();}
export function setProgress(f:(p:Progress)=>Progress){progress=f(progress);save();emit();}
export const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
export const addMinutes=(m:number)=>setProgress(p=>({...p,minutesByDay:{...p.minutesByDay,[today()]:(p.minutesByDay[today()]||0)+m}}));
export function resetAll(){settings=S0;progress=P0;save();emit();}

// ---- streak: a day counts if minutes>0 or it is a rest day; one rest day per ISO week ----
const dkey=(d:Date)=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
export function isoWeek(d:Date){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);const y=new Date(Date.UTC(t.getUTCFullYear(),0,1));return t.getUTCFullYear()+'-W'+Math.ceil(((+t-+y)/864e5+1)/7);}
export function restUsedThisWeek(p:Progress,d=new Date()){const w=isoWeek(d);return p.restDays.some(r=>{const [y,m,dd]=r.split('-').map(Number);return isoWeek(new Date(y,m-1,dd))===w;});}
export function streak(p:Progress){let n=0;const d=new Date();
  const ok=(k:string)=>(p.minutesByDay[k]||0)>0||p.restDays.includes(k);
  if(!ok(dkey(d)))d.setDate(d.getDate()-1); // today not finished yet: don't break the streak
  while(ok(dkey(d))){n++;d.setDate(d.getDate()-1);}return n;}
export function useRest(){setProgress(p=>restUsedThisWeek(p)?p:{...p,restDays:[...p.restDays,today()]});}
