# Content pipeline
- `scripts/extract-prototype.mjs` pulled UI strings / lessons / lexicon out of the approved prototype into JSON; those were converted into `src/locales/{en,uk}.ts`, `src/data/{content,lexicon}.ts`.
- `src/data/civics2025.ts`: 128 questions (20 starred = most useful), 8 flagged `dynamic` (officeholders / your state). Q1-40 wording was restated, NOT copied: verify against the official USCIS 2025 list before relying on it.
- New learner languages: add `src/locales/<code>.ts` + translated lesson data; `LANGS` in worker already lists the next Slavic/European/Spanish/Portuguese languages.
- Ukrainian strings need a native reviewer: Settings > Review mode outlines every Ukrainian string.
