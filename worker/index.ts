// worker/index.ts — LexBeacon AI backend (Cloudflare Worker: static assets + /api/*)
// UPDATED: 2026-11-08 (build 001)
// AI order: Gemini 2.5 Flash (+Google Search grounding when facts must be current)
//        -> Groq Llama 3.3 70B (free)  -> OpenRouter free model.
// Keys live only here as Worker secrets; the browser never sees them.

interface Env {
  ASSETS: Fetcher;
  GEMINI_API_KEY?: string; GROQ_API_KEY?: string; OPENROUTER_API_KEY?: string;
  GEMINI_MODEL?: string; GROQ_MODEL?: string; OPENROUTER_MODEL?: string;
  APP_ACCESS_CODE?: string;
}
type Task = 'tutor' | 'translate' | 'define' | 'verify' | 'writing' | 'n400';
interface Req { task: Task; text?: string; question?: string; role?: string; learnerLang?: string; level?: string; history?: {r:'user'|'lex';t:string}[]; }

const LANGS: Record<string,string> = { uk:'Ukrainian', ru:'Russian', pl:'Polish', es:'Spanish', pt:'Portuguese', de:'German', fr:'French', it:'Italian', ro:'Romanian', cs:'Czech', bg:'Bulgarian', sr:'Serbian', hr:'Croatian' };

const BASE = (lang:string, level:string) => `You are Lex, a warm, patient English and U.S. civics teacher for adults preparing for the U.S. naturalization test. The learner speaks ${lang}. Their English level is ${level||'unknown (assume A1-A2)'}.
Rules: short, clear sentences. Explain in ${lang} first, then give the English. Never shame mistakes. Use American English. You are a study aid, NOT a lawyer: never give legal advice; for rules, forms or eligibility say to confirm on uscis.gov or with an accredited representative/attorney. If you are not sure, say so.`;

function system(r: Req): string {
  const lang = LANGS[r.learnerLang||'uk'] || 'Ukrainian';
  const b = BASE(lang, r.level||'');
  switch (r.task) {
    case 'translate': return `${b}\nTask: translate the user's text between ${lang} and English (detect direction). Return JSON only: {"translation":"...","why":"2-4 short sentences in ${lang} explaining word choice, grammar or tone","alt":"one more natural alternative or empty"}.`;
    case 'define': return `${b}\nTask: dictionary entry for the English word or phrase. Return JSON only: {"word":"...","ipa":"/.../ American","pos":"...","meaning_en":"simple definition","meaning_l":"in ${lang}","example":"one short example","example_l":"example in ${lang}"}.`;
    case 'writing': return `${b}\nTask: check the learner's English writing. Return JSON only: {"corrected":"...","fixes":[{"was":"...","now":"...","why":"in ${lang}"}],"level":"A1|A2|B1|B2","praise":"one kind sentence in ${lang}"}. Max 4 fixes.`;
    case 'verify': return `${b}\nTask: the answer to a U.S. civics test question can change with elections or appointments. Use Google Search and prefer uscis.gov, whitehouse.gov, house.gov, senate.gov, supremecourt.gov. Return JSON only: {"answer":"current answer","asOf":"date","source":"url","note":"one line in ${lang}"}. If sources disagree, say so in note.`;
    case 'n400': return `${b}\nTask: help the learner understand the N-400 Application for Naturalization: what a question means, what information to gather, how to prepare for the interview. Do NOT choose answers for them, do NOT advise on eligibility or immigration strategy; for anything legal say: confirm with uscis.gov or an accredited representative/attorney. Cite the official source when you use search.`;
    default: return `${b}\nRole: ${r.role||'teacher'} (teacher explains step by step; tutor quizzes gently; buddy is friendly and casual; officer runs a short mock interview, one question at a time, and then gives kind feedback). Keep answers under 120 words unless asked.`;
  }
}
const wantsJson = (t:Task) => ['translate','define','writing','verify'].includes(t);
const wantsSearch = (t:Task) => t==='verify' || t==='n400';

async function gemini(env:Env, sys:string, r:Req): Promise<string> {
  if (!env.GEMINI_API_KEY) throw new Error('no gemini key');
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const contents = [...(r.history||[]).slice(-8).map(h=>({role:h.r==='lex'?'model':'user',parts:[{text:h.t}]})), {role:'user',parts:[{text:r.text||r.question||''}]}];
  const body: any = { systemInstruction:{parts:[{text:sys}]}, contents, generationConfig:{temperature:0.4,maxOutputTokens:900} };
  if (wantsSearch(r.task)) body.tools = [{ google_search:{} }];
  else if (wantsJson(r.task)) body.generationConfig.responseMimeType = 'application/json';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {method:'POST',headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},body:JSON.stringify(body)});
  if (!res.ok) throw new Error('gemini '+res.status);
  const j:any = await res.json();
  const out = (j.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join('').trim();
  if (!out) throw new Error('gemini empty');
  return out;
}
async function openaiStyle(url:string, key:string|undefined, model:string, sys:string, r:Req, extra:Record<string,string>={}): Promise<string> {
  if (!key) throw new Error('no key');
  const msgs = [{role:'system',content:sys}, ...(r.history||[]).slice(-8).map(h=>({role:h.r==='lex'?'assistant':'user',content:h.t})), {role:'user',content:r.text||r.question||''}];
  const body:any = { model, messages:msgs, temperature:0.4, max_tokens:900 };
  if (wantsJson(r.task) && !wantsSearch(r.task)) body.response_format = {type:'json_object'};
  const res = await fetch(url,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key,...extra},body:JSON.stringify(body)});
  if (!res.ok) throw new Error(model+' '+res.status);
  const j:any = await res.json();
  const out = j.choices?.[0]?.message?.content?.trim();
  if (!out) throw new Error('empty');
  return out;
}
const json = (o:unknown, status=200) => new Response(JSON.stringify(o), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.pathname === '/api/health') return json({ok:true,gemini:!!env.GEMINI_API_KEY,groq:!!env.GROQ_API_KEY,openrouter:!!env.OPENROUTER_API_KEY,gate:!!env.APP_ACCESS_CODE});
    if (url.pathname !== '/api/ai' || request.method !== 'POST') return json({error:'not_found'},404);
    if (env.APP_ACCESS_CODE && request.headers.get('x-lex-code') !== env.APP_ACCESS_CODE) return json({error:'access_code'},401);
    let r: Req;
    try { r = await request.json(); } catch { return json({error:'bad_json'},400); }
    if (!r || !r.task || !(r.text||r.question)) return json({error:'bad_request'},400);
    if ((r.text||r.question||'').length > 2000) return json({error:'too_long'},413);
    const sys = system(r);
    const chain: [string, () => Promise<string>][] = [
      ['gemini', () => gemini(env, sys, r)],
      ['groq', () => openaiStyle('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, env.GROQ_MODEL||'llama-3.3-70b-versatile', sys, r)],
      ['openrouter', () => openaiStyle('https://openrouter.ai/api/v1/chat/completions', env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL||'meta-llama/llama-3.3-70b-instruct:free', sys, r, {'x-title':'LexBeacon AI'})],
    ];
    const errs:string[] = [];
    for (const [name, run] of chain) {
      try {
        const text = await run();
        let data: unknown = text;
        if (wantsJson(r.task)) { try { data = JSON.parse(text.replace(/^```json\s*|```$/g,'').trim()); } catch { data = {raw:text}; } }
        // Fallback models have no live search: mark so the app can warn on dated answers.
        return json({ok:true,provider:name,grounded:name==='gemini'&&wantsSearch(r.task),data});
      } catch (e) { errs.push(name+':'+String((e as Error).message).slice(0,60)); }
    }
    return json({error:'all_providers_failed',detail:errs},502);
  },
};
