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
  YOUTUBE_API_KEY?: string;   // YouTube Data API v3 (separate key; enable the API in Google Cloud)
}
type Task = 'tutor' | 'translate' | 'define' | 'verify' | 'writing' | 'n400' | 'videoquiz';
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


// ---------- Videos (build 002) ----------
// Only approved channels are searched (quality + safety). Handles are resolved to channel ids once and cached.
const TOPICS: Record<string,{handles:string[];q:string}> = {
  english:      {handles:['@VOALearningEnglish','@bbclearningenglish','@EnglishwithLucy'], q:'English lesson for beginners'},
  pronunciation:{handles:['@RachelsEnglish','@bbclearningenglish'], q:'American English pronunciation'},
  civics:       {handles:['@USCIS'], q:'civics test naturalization'},
  history:      {handles:['@VOALearningEnglish'], q:'American history'},
  government:   {handles:['@VOALearningEnglish','@USCIS'], q:'US government branches Constitution'},
  immigration:  {handles:['@USCIS'], q:'naturalization N-400 citizenship'},
};
async function cached<T>(key:string, ttl:number, make:()=>Promise<T>): Promise<T> {
  const c = (caches as any).default as Cache, req = new Request('https://lex.cache/'+encodeURIComponent(key));
  const hit = await c.match(req); if (hit) return hit.json() as Promise<T>;
  const v = await make();
  await c.put(req, new Response(JSON.stringify(v), {headers:{'content-type':'application/json','cache-control':'max-age='+ttl}}));
  return v;
}
async function yt(env:Env, path:string, params:Record<string,string>): Promise<any> {
  const key = env.YOUTUBE_API_KEY || env.GEMINI_API_KEY;
  if (!key) throw new Error('no_key');
  const u = new URL('https://www.googleapis.com/youtube/v3/'+path); Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v)); u.searchParams.set('key',key);
  const r = await fetch(u); if (!r.ok) throw new Error('yt_'+r.status); return r.json();
}
async function videos(env:Env, topic:string) {
  const t = TOPICS[topic]; if (!t) return json({error:'bad_topic'},400);
  try {
    const list = await cached('vid:'+topic, 86400, async () => {
      const out:any[] = [];
      for (const h of t.handles) {
        const id = await cached('ch:'+h, 2592000, async () => (await yt(env,'channels',{part:'id',forHandle:h})).items?.[0]?.id || '');
        if (!id) continue;
        const j = await yt(env,'search',{part:'snippet',channelId:id,q:t.q,type:'video',videoEmbeddable:'true',safeSearch:'strict',maxResults:'6',relevanceLanguage:'en'});
        for (const it of j.items||[]) out.push({id:it.id.videoId,title:it.snippet.title,channel:it.snippet.channelTitle,thumb:it.snippet.thumbnails?.medium?.url||'',at:it.snippet.publishedAt});
      }
      if (!out.length) throw new Error('empty');
      return out;
    });
    return json({ok:true,topic,items:list});
  } catch (e) { return json({ok:false,error:String((e as Error).message)}, (e as Error).message==='no_key'?200:502); }
}
async function videoQuiz(env:Env, id:string, title:string, lang:string) {
  if (!/^[\w-]{11}$/.test(id)) return json({error:'bad_id'},400);
  const L = LANGS[lang]||'Ukrainian';
  const prompt = `You are Lex, an English and U.S. civics teacher. Make a 3-question multiple-choice check for an adult learner (English level A2-B1) about this video${title?': "'+title.slice(0,120)+'"':''}. Questions and options in simple English. Return JSON only: {"summary_l":"2 sentences in ${L}","questions":[{"q":"...","o":["...","...","...","..."],"a":0,"why_l":"short reason in ${L}"}]}. Only ask about what the video really says.`;
  if (env.GEMINI_API_KEY) {
    try {
      const model = env.GEMINI_MODEL||'gemini-2.5-flash';
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
        body:JSON.stringify({contents:[{parts:[{file_data:{file_uri:'https://www.youtube.com/watch?v='+id}},{text:prompt}]}],generationConfig:{temperature:0.3,responseMimeType:'application/json',maxOutputTokens:1200}})});
      if (res.ok) { const j:any = await res.json(); const txt = (j.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join(''); const data = JSON.parse(txt); if (data?.questions?.length) return json({ok:true,source:'video',data}); }
    } catch { /* fall through to title-only quiz */ }
  }
  // fallback: title-only quiz (clearly labelled so the app can say it is not based on the video itself)
  if (!title) return json({ok:false,error:'video_unavailable'},502);
  const req:Req = {task:'writing',text:prompt.replace('about this video','about the TOPIC of this video title (you cannot see the video)'),learnerLang:lang};
  for (const run of [()=>gemini(env,'Return JSON only.',req),()=>openaiStyle('https://api.groq.com/openai/v1/chat/completions',env.GROQ_API_KEY,env.GROQ_MODEL||'llama-3.3-70b-versatile','Return JSON only.',req)]) {
    try { const data = JSON.parse((await run()).replace(/^```json\s*|```$/g,'').trim()); if (data?.questions?.length) return json({ok:true,source:'title',data}); } catch { /* next */ }
  }
  return json({ok:false,error:'all_providers_failed'},502);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (url.pathname === '/api/health') return json({ok:true,youtube:!!env.YOUTUBE_API_KEY,gemini:!!env.GEMINI_API_KEY,groq:!!env.GROQ_API_KEY,openrouter:!!env.OPENROUTER_API_KEY,gate:!!env.APP_ACCESS_CODE});
    if (url.pathname === '/api/videos' && request.method === 'GET') {
      if (env.APP_ACCESS_CODE && request.headers.get('x-lex-code') !== env.APP_ACCESS_CODE) return json({error:'access_code'},401);
      return videos(env, url.searchParams.get('topic')||'english');
    }
    if (url.pathname !== '/api/ai' || request.method !== 'POST') return json({error:'not_found'},404);
    if (env.APP_ACCESS_CODE && request.headers.get('x-lex-code') !== env.APP_ACCESS_CODE) return json({error:'access_code'},401);
    let r: Req;
    try { r = await request.json(); } catch { return json({error:'bad_json'},400); }
    if (!r || !r.task || !(r.text||r.question)) return json({error:'bad_request'},400);
    if ((r.text||r.question||'').length > 2000) return json({error:'too_long'},413);
    if (r.task === 'videoquiz') return videoQuiz(env, r.text||'', (r.question||'').slice(0,200), r.learnerLang||'uk');
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
