# LexBeacon AI — build log

## Build 002 — v1_D202611_B002 — 2026-11-10
Fixed (from DJ's phone screenshots)
- Word card ran off the right edge: the entrance animation held `transform:none`, overriding the centring transform. Card now centres with auto margins and moves with the CSS `translate` property.
- Glass blur missing under the top pill and cards: an animation left `filter:blur(0)` on ancestors, which disables backdrop-filter in children. Animations now end with `filter:none`.
- EN/UA chip did not visibly change: chip now fills and flips to the main language when the other language is open (EN -> UA -> back).
- Dock: 7 items now fit 360 px wide phones.
Added
- Videos screen: topics English, pronunciation, civics, U.S. history, government, immigration/N-400; embedded YouTube player (youtube-nocookie, subtitles on, Ukrainian preferred when it exists); paste-a-link; Lex 3-question quiz after watching (Gemini reads the video; falls back to the title topic and says so); watched list and quiz scores saved.
- Worker: `GET /api/videos?topic=` (approved channels only, results cached 24 h, channel ids cached 30 days, needs YOUTUBE_API_KEY), task `videoquiz`.
- 2008 civics pack (99 of 100 questions, wording restated, VERIFY) and pack switch in Civics; Settings test version follows the N-400 date.
- Offline: service worker + web app manifest + icons (installable on phone).
- "Report a problem or wrong translation" notes on every screen (stored on device, copy-all button).
- Official help links on the N-400 screen.
Known limits / not tested
- Live Gemini, YouTube and quiz-from-video calls were NOT tested (no keys in the build environment); Worker routes tested with no keys (graceful errors).
- 2008 pack: 99 questions; numbering is Lex's own; official PDF could not be opened here.
- Civics Q1-40 (2025) and the 2008 list wording unverified against USCIS PDFs.
- Ukrainian subtitles in the player are not guaranteed by YouTube.
- Official-help links are site roots; deep links not verified.

## Build 001 — v1_D202611_B001 — 2026-11-08
First real build: welcome, adaptive English check, Home/streak, Lex chat, Translate with why, Dictionary + pronunciation scoring + spaced review, Civics 2025 (128), Interview, N-400 helper, Progress, Settings, Worker with Gemini -> Groq -> OpenRouter.
