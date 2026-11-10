// One-time helper used on 2026-11-08 to move the approved prototype text and data into TypeScript files.
import fs from "fs";
const src = fs.readFileSync(process.argv[2], "utf8");
const js = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1].replace("class Component extends DCLogic", "class Component extends (class{ constructor(){} })");
const C = new Function(js + "; return Component;")();
const c = new C({});
const S = c.strings(), D = c.data(), L = c.lex();
const en = {}, uk = {};
for (const k of Object.keys(S)) { en[k] = S[k][0]; uk[k] = S[k][1]; }
fs.writeFileSync("scripts/_en.json", JSON.stringify(en, null, 2));
fs.writeFileSync("scripts/_uk.json", JSON.stringify(uk, null, 2));
fs.writeFileSync("scripts/_data.json", JSON.stringify(D, null, 2));
const lex = {}; for (const k of Object.keys(L)) if (L[k][0]) lex[k] = L[k];
fs.writeFileSync("scripts/_lex.json", JSON.stringify(lex, null, 2));
console.log(Object.keys(en).length, Object.keys(D), Object.keys(lex).length);
