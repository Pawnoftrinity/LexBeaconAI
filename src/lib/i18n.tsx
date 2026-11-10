// i18n.tsx — UA / Mix / EN help modes.  uk = whole UI in learner language; mix = English menus that fade
// to learner language, explanations learner-first; en = English with a UA chip. Chips add the other language beneath.
// UPDATED: 2026-11-08 (build 001)
import {useEffect,useState} from 'react';
import {en} from '@/locales/en';import {uk} from '@/locales/uk';import {extra} from '@/locales/extra';
import {useSettings} from './store';
export const L=(k:string,lang:'en'|'uk'):string=>{const e=extra[k];if(e)return lang==='en'?e[0]:e[1];return (lang==='en'?en[k]:uk[k])??en[k]??k;};
export function useTick(){const s=useSettings();const [t,setT]=useState(0);
  useEffect(()=>{if(s.help!=='mix'||s.calm)return;const id=setInterval(()=>setT(x=>x+1),s.fadeSec*1000);return()=>clearInterval(id);},[s.help,s.calm,s.fadeSec]);return t;}
/** menu label: in mix mode alternates en/uk with a fade; else follows the mode */
export function useMenu(){const s=useSettings();const t=useTick();
  return (k:string)=>s.help==='uk'?L(k,'uk'):s.help==='en'?L(k,'en'):L(k,t%2?'uk':'en');}
/** explanation text: [primary,other,otherLabel] */
export function useBi(){const s=useSettings();
  return (k:string)=>s.help==='en'?{p:L(k,'en'),o:L(k,'uk'),c:'UA'}:{p:L(k,'uk'),o:L(k,'en'),c:'EN'};}
export const useT=()=>{const s=useSettings();return (k:string)=>L(k,s.help==='en'?'en':'uk');};
export const useMode=()=>useSettings().help;
