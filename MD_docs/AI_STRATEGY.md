# AI strategy (build 001)
Order: **Gemini 2.5 Flash** (+ Google Search grounding for dated facts and N-400) -> **Groq Llama 3.3 70B** (free fallback) -> **OpenRouter free Llama 3.3 70B** (second fallback).
Why Groq as the free fallback: free tier, very fast, strong multilingual quality for a free model, OpenAI-compatible, and already used in BMET SEEKER.
Fallbacks have NO live search: the app labels dated answers accordingly and points to uscis.gov.
Tasks (one endpoint `/api/ai`): tutor, translate (+why), define, writing, verify (grounded), n400.
Guardrails (system prompt): study aid, no legal advice, no choosing N-400 answers, confirm on uscis.gov, explain learner-language-first.
Next pass (after build 001): add curated English / USA / Ukrainian / N-400 knowledge (retrieval over vetted docs), Ukrainian-quality test set, answer caching.
Keys only as Worker secrets. Optional `APP_ACCESS_CODE` header `x-lex-code` protects free quotas.
