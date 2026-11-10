// theme.ts — colour maths + theme variable derivation (ported from prototype v4.1)
// UPDATED: 2026-11-08 (build 001)
const rgb=(h:string):number[]=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));};
const hex=(a:number[])=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
export const mix=(a:string,b:string,t:number)=>{const x=rgb(a),y=rgb(b);return hex(x.map((v,i)=>v*t+y[i]*(1-t)));};
const lum=(h:string)=>{const c=rgb(h).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
export const ratio=(a:string,b:string)=>{const l1=lum(a),l2=lum(b);return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);};
export const alpha=(h:string,a:number)=>{const c=rgb(h);return `rgba(${c[0]},${c[1]},${c[2]},${a})`;};
const onBoth=(a:string,b:string)=>{const w=Math.min(ratio(a,'#ffffff'),ratio(b,'#ffffff'));const d=Math.min(ratio(a,'#111111'),ratio(b,'#111111'));return w>=d?{c:'#ffffff',r:w}:{c:'#111111',r:d};};

export const DEFAULT_PRIMARY='#7C5CE0', DEFAULT_ACCENT='#C2417A';

export function themeVars(P:string,A:string,dark:boolean):Record<string,string>{
  const bg=dark?mix(P,'#07060F',0.1):mix(P,'#FFFFFF',0.07);
  const ink=dark?mix(P,'#FFFFFF',0.08):mix(P,'#0B0A14',0.1);
  const glassBase=dark?mix(P,'#1A1626',0.12):mix(P,'#FFFFFF',0.04);
  const eff=dark?mix(glassBase,bg,0.7):mix('#FFFFFF',bg,0.75);
  let w=0.66,muted=mix(ink,eff,w);
  while(ratio(muted,eff)<4.6&&w<0.95){w+=0.05;muted=mix(ink,eff,w);}
  let p2=mix(P,A,0.4);let cta=onBoth(P,p2);
  if(cta.r<4.5){p2=P;cta=onBoth(P,P);}
  const primaryText=ratio(P,eff)>=4.5?P:(dark?mix(P,'#FFFFFF',0.5):ink);
  const accentText=ratio(A,eff)>=3?A:primaryText;
  const gtA=ratio(P,eff)>=3?P:primaryText;
  return {
    '--bg':bg,'--ink':ink,'--muted':muted,'--primary':P,'--accent':A,'--p1':P,'--p2':p2,'--onCta':cta.c,
    '--primaryText':primaryText,'--gtA':gtA,'--gtB':accentText,
    '--good':dark?'#4ADE80':'#1B7F46','--bad':dark?'#F87171':'#B42318',
    '--glass':alpha(glassBase,dark?0.55:0.6),'--glass2':dark?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.5)',
    '--edge':dark?'rgba(255,255,255,0.14)':'rgba(255,255,255,0.78)','--hi':dark?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.95)',
    '--sheen':dark?'rgba(255,255,255,0.09)':'rgba(255,255,255,0.6)','--soft':alpha(P,dark?0.2:0.12),'--glow':alpha(P,0.5),
    '--shadow':dark?'0 30px 70px -26px rgba(0,0,0,0.75),0 2px 10px rgba(0,0,0,0.3)':`0 28px 64px -28px ${alpha(mix(P,'#1B1030',0.5),0.45)},0 2px 8px rgba(40,20,80,0.05)`,
  };
}
