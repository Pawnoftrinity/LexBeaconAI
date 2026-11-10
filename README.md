# LexBeacon AI ("Lex") — build 001 (v1_D202611_B001)
BlueHexion Technologies. Teaches foreigners English and U.S. civics for the naturalization test. Ukrainian first.
Study aid, not legal advice.

## Run it
```bash
npm install
cp .dev.vars.example .dev.vars      # add keys (optional: app works offline without them)
npm run dev                         # app only, http://localhost:8080 (AI calls fail gracefully)
npm run build && npm run dev:worker # app + /api together, http://localhost:8787
```
## Deploy (Cloudflare)
```bash
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put OPENROUTER_API_KEY      # optional
npx wrangler secret put APP_ACCESS_CODE         # optional: gate for the family pilot
npm run deploy
```
Health check: `/api/health` shows which keys are set (never the keys).

## Layout
`src/` app (pages, components, lib, data, locales) · `worker/index.ts` backend · `Buildsinfo/001/` build notes · `MD_docs/` guides · `scripts/` content extraction.
Read `MD_docs/` first: AI strategy, content pipeline, known limits.
