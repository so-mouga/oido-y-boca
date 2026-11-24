// Vérifie le moteur de « toucher un mot » (toucher.js) avec le vrai vocabulaire du Sheet :
// 1. une forme retrouve le bon mot (vecinos → vecino, viven → vivir, me levanté → levantarse, fui → ir et ser…) ;
// 2. les groupes : le plus long gagne (« tengo prisa », « me levanté », « he comido »), les prénoms et les parenthèses ne se touchent pas ;
// 3. le bilan : combien de mots des exercices, du bonus et des lectures ne trouvent rien (« Pas dans ton livre »), avec la liste.
// Lancer depuis appli/ : node outils/test-toucher.mjs [chemin/vers/vocabulaire.csv]
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-toucher-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js"))) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const T = await import(path.join(tmp, "toucher.js?v=50"));
const { EXERCICES } = await import(path.join(tmp, "exercices.js?v=50"));
const { BONUS } = await import(path.join(tmp, "bonus.js?v=50"));
const { TEXTES } = await import(path.join(tmp, "lectures.js?v=50"));

const csv = process.argv[2]
  ? fs.readFileSync(process.argv[2], "utf8")
  : await (await fetch("https://docs.google.com/spreadsheets/d/1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ/gviz/tq?tqx=out:csv&sheet=Vocabulaire")).text();
const ctx = { mots: versMots(lireCsv(csv)), pos: { faites: new Set() } };

let erreurs = 0;
const faux = (...t) => { erreurs++; console.log("✗", ...t); };
const sensDe = (cle, extras) => T.sens(ctx, cle, extras);

// 1. Une forme → son mot.
const CARTES = { vecinos: "vecino", vecina: "vecino", barata: "barato", piso: "piso", hermanas: "hermano", "años": "año", padres: "padre" };
for (const [forme, attendu] of Object.entries(CARTES)) {
  const s = sensDe(forme);
  if (!s.carte || !T.normaliser(s.carte.m.es).includes(T.normaliser(attendu))) faux(`« ${forme} » devrait trouver la carte « ${attendu} » (trouvé : ${s.carte?.m.es || "rien"})`);
}
const VERBES = {
  viven: ["vivir", 5, "present"], tengo: ["tener", 0, "present"], hice: ["hacer", 0, "ps"], "me levanté": ["levantarse", 0, "ps"],
  "levanté": ["levantarse", 0, "ps"], "he comido": ["comer", 0, "pc"], comido: ["comer", -2, "pc"], buscan: ["buscar", 5, "present"],
  "se llama": ["llamarse", 2, "present"], vivir: ["vivir", -1, undefined], jugaba: ["jugar", 0, "imp"],
  trabajando: ["trabajar", -3, undefined], verme: ["ver", -1, undefined], haz: ["hacer", -4, undefined], gusta: ["gustar", 2, "present"],
};
for (const [forme, [v, p, t]] of Object.entries(VERBES)) {
  const s = sensDe(forme);
  const e = s.verbes.find(x => x.x.v === v);
  if (!e) faux(`« ${forme} » devrait trouver le verbe ${v} (trouvé : ${s.verbes.map(x => x.x.v).join(", ") || "rien"})`);
  else if (e.p !== p || (t && e.t !== t)) faux(`« ${forme} » : ${v}, attendu personne ${p} temps ${t}, trouvé ${e.p} ${e.t}`);
}
const fui = sensDe("fui").verbes.map(x => x.x.v).sort().join(",");
if (fui !== "ir,ser") faux(`« fui » devrait donner ir et ser (trouvé : ${fui})`);
if (!sensDe("me").petit) faux("« me » devrait être un petit mot");
if (sensDe("casa").verbes.length) faux("« casa » est une carte, pas « se casa » (casarse)");
if (!sensDe("frío").carte) faux("« frío » seul devrait montrer l'expression qui le contient (hace frío)");
if (sensDe("fútbol", T.lireExtras("el fútbol = le foot")).extra !== "le foot") faux("« fútbol » devrait prendre le sens donné par le bonus");

// 2. Les groupes.
const groupes = (phrase, extras) => T.decouper(phrase, ctx, T.lireExtras(extras)).filter(m => m.cle).map(m => m.t);
const attendre = (phrase, attendu, extras) => {
  const g = groupes(phrase, extras);
  for (const a of attendu) if (!g.includes(a)) faux(`« ${phrase} » : « ${a} » devrait se toucher d'un seul geste (morceaux : ${g.join(" | ")})`);
};
attendre("El sábado me levanté tarde.", ["me levanté"]);
attendre("Hoy he comido en casa.", ["he comido"]);
attendre("Perdona, tengo prisa.", ["tengo prisa"]);
attendre("Kevin trabaja desde casa.", ["trabaja desde casa"]);
const g = groupes("Nosotros ___ francés en casa. (hablar)");
if (g.includes("hablar")) faux("le texte entre parenthèses ne doit pas se toucher");
if (groupes("Blanca y Léo viven en Huesca.").some(t => /blanca|léo|huesca/i.test(t))) faux("les prénoms et les villes ne doivent pas se toucher");

// 3. Le bilan : les mots qui ne trouvent rien.
const phrases = [];
for (const e of Object.values(EXERCICES)) {
  for (const q of e.ecrire || []) { if (q.fr.includes("___")) phrases.push([q.fr, ""]); phrases.push([q.es[0], ""]); }
  for (const q of e.dire || []) phrases.push([q.es, ""]);
}
for (const b of Object.values(BONUS)) for (const q of b.phrases || []) {
  const extras = [q.sens && q.v && `${q.v} = ${q.sens}`, q.mot].filter(Boolean).join(" · ");
  if (q.fr.includes("___")) phrases.push([q.fr, extras]);
  if (q.es) phrases.push([q.es[0], extras]);
}
for (const t of TEXTES) for (const p of t.texte) phrases.push([p, ""]);
let total = 0;
const rien = new Map();
for (const [ph, extras] of phrases) {
  const ex = T.lireExtras(extras);
  for (const m of T.decouper(ph.replace(/\s*\(ou[^)]*\)/g, ""), ctx, ex)) {
    if (!m.cle) continue;
    total++;
    const s = T.sens(ctx, m.cle, ex);
    if (!s.verbes.length && !s.carte && !s.petit && s.extra == null) rien.set(m.cle, (rien.get(m.cle) || 0) + 1);
  }
}
const nbRien = [...rien.values()].reduce((a, b) => a + b, 0);
console.log(`\nBilan : ${total} morceaux à toucher, ${total - nbRien} trouvés (${Math.round(100 * (total - nbRien) / total)} %), ${rien.size} mots différents « pas dans ton livre » :`);
console.log([...rien.entries()].sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w}${n > 1 ? ` ×${n}` : ""}`).join(", "));

console.log(erreurs ? `\n${erreurs} problème(s).` : "\nLe moteur retrouve bien les mots.");
process.exit(erreurs ? 1 : 0);
