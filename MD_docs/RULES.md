# LexBeacon AI — working rules
Last updated: 2026-11-10 (build 002)

## Chat rules
1. **New chat after every 3 to 4 responses.** At response 3 or 4, Claude stops and delivers: (a) the files as a downloadable ZIP, (b) an updated `BUILD_LOG.md`, (c) a fresh `NEW_CHAT_HANDOFF.md` to paste into the new chat. Long chats lose detail.
2. Every response: **analyze, ask questions, suggest improvements**, then continue with the open suggestions.
3. Always send files as a **downloadable zip** (no node_modules, no dist).
4. Keep the first sentence short: say what Claude is about to do.

## Build rules
5. Built by hand, same stack as BMET SEEKER (Vite + React + TypeScript + Cloudflare). No new stack without DJ's approval.
6. Version format `v#_Dyyyymm_B###` (`src/version.ts`); notes in `Buildsinfo/<build>/BUILD_NOTES.md`; every source file has a header comment with an UPDATED date.
7. Secrets only as Cloudflare Worker secrets (GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, YOUTUBE_API_KEY, APP_ACCESS_CODE). Never in the repo or the browser.
8. AI order: Gemini (+Google Search for current facts) -> Groq -> OpenRouter free.
9. Typecheck + production build + a phone-size screenshot test before every delivery. Say plainly what was NOT tested (e.g. live AI calls).

## Product rules
10. Lex is a **study aid, not legal advice**. N-400 help explains and prepares; it never chooses answers or advises on eligibility. Always point to uscis.gov, an attorney or a DOJ-accredited representative.
11. Facts that change (officeholders, rules) are dated, sourced, and re-checkable ("Check latest"). Show "rules last checked".
12. Civics wording restated by Lex is flagged until verified against the official USCIS list.
13. Videos only from approved channels or a link the learner pastes. YouTube plays in YouTube's own player, unmodified.
14. UI: learner language first (UA / Mix / EN), English study content stays English with a translation chip. Chip flips label when the other language is open. American-English voices only.
15. Ukrainian text is reviewed by a native reviewer (Settings > Review mode) before wider release.
16. Pilot scope: 1 to 2 users (DJ's family). Next languages: Slavic region, Europe, South America.
