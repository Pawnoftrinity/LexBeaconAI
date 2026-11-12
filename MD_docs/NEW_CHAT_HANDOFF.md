# New chat handoff — paste this into a new chat (attach the latest zip)
Project: **LexBeacon AI ("Lex")**, BlueHexion Technologies. Web app (phone + desktop) teaching foreigners English and U.S. civics/history/government for the naturalization test. Ukrainian first; later Slavic region, Europe, South America. Lex also helps with the N-400 (explain, prepare; no legal advice). Pilot: DJ's family (1-2 users).
Read first: `MD_docs/RULES.md` (rule: new chat after 3 to 4 responses; always zip; analyze, ask, suggest), then `MD_docs/BUILD_LOG.md`.
State: build 002 (v1_D202611_B002), Vite + React + TS + Cloudflare Worker (assets + /api). Gemini 2.5 Flash (+Google Search) -> Groq Llama 3.3 70B -> OpenRouter free. DJ will add the Gemini key in Cloudflare (secrets: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, YOUTUBE_API_KEY, APP_ACCESS_CODE).
Design is approved and frozen: glass UI, Rose+Lavender light/dark, UA/Mix/EN help modes, living flag background, feather top bar, dock, tap-any-word card.
Open items (in order):
1. DJ deploys and tests live: Gemini chat/translate, /api/videos (needs YOUTUBE_API_KEY), video quiz.
2. Verify civics wording: 2025 Q1-40 and the 2008 list against the official USCIS PDFs (find the missing 2008 question, 99/100).
3. AI knowledge pass: vetted English, USA, Ukrainian and N-400 documents (retrieval), answer caching, Ukrainian quality test set.
4. Native Ukrainian review (Settings > Review mode); feedback notes from the family.
5. Next language (DJ to choose), login/sync (Appwrite) later, paid version later.
Questions still open for DJ: N-400 filing date (2025 vs 2008 test); second language; access code yes/no; allowed video channels list; whether quiz scores should show on Progress.
