// Vérifie le moteur de « S'entraîner aux verbes » (verbes.js) sur le vrai vocabulaire du Sheet :
// chaque réponse attendue est bien la forme calculée, chaque phrase trouée redonne la phrase d'origine,
// « à l'envers » n'a qu'un seul bon choix, et une série a toujours 10 questions.
// Avec les temps (chantier 16) : chaque phrase au bon temps, les séries prennent seulement les temps demandés,
// pas d'« à l'envers » sans présent, le tableau au temps de la fiche.
// Lancer depuis appli/ : node outils/test-verbes.mjs chemin/vers/vocabulaire.csv
// (le CSV de l'onglet « Vocabulaire », téléchargé depuis le Sheet).
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
// Les modules de l'appli sont des modules ES en .js : on les copie dans un dossier marqué « type: module ».
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-verbes-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js"))) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const V = await import(path.join(tmp, "verbes.js?v=52"));
const { conjuguer, PERSONNES, ORDRE_TEMPS, TEMPS } = await import(path.join(tmp, "controles.js?v=52"));
const P = await import(path.join(tmp, "progression.js?v=52"));
const { LECONS } = await import(path.join(tmp, "position.js?v=52"));

const csv = process.argv[2];
if (!csv) { console.error("Donne le CSV du vocabulaire."); process.exit(1); }
const mots = versMots(lireCsv(fs.readFileSync(csv, "utf8")));
let erreurs = 0;
const faux = (...t) => { erreurs++; console.log("✗", ...t); };

// Toutes les leçons faites : on voit toutes les phrases possibles.
const toutes = new Set(LECONS.map(l => l.id));
const ctxTout = { mots, pos: { faites: toutes } };
const ctxDebut = { mots, pos: { faites: new Set(["U1-L1"]) } };

const verbes = V.tousLesVerbes(ctxTout);
console.log(`${verbes.length} verbes travaillables (formes connues, pas comme gustar).`);
console.log("Sans sens affiché (même mot ou pas de carte seule) :", verbes.filter(x => !V.sensDe(x)).map(x => x.v).join(", "));

// 1. Les phrases : la phrase reconstituée = l'originale, et la réponse = la forme calculée.
let nbPhrases = 0;
const parTemps = {};
for (const t of ORDRE_TEMPS) for (const x of verbes) {
  for (const ph of V.phrasesDe(ctxTout, x, t)) {
    nbPhrases++; parTemps[t] = (parTemps[t] || 0) + 1;
    const calc = conjuguer(x.v, ph.p, x.d, t);
    if (t !== "present" && ph.source === "exemple") faux(x.v, t, "exemple du Sheet hors du présent");
    if (ph.es !== calc) faux(x.v, "réponse", ph.es, "≠ calculée", calc);
    if (ph.source === "exemple") {
      const original = x.cartes.map(m => m.ex).find(ex => ex === ph.avant + ph.trouve + ph.apres);
      if (!original) faux(x.v, "phrase mal reconstituée :", ph.avant + "___" + ph.apres);
      if (ph.trouve.toLowerCase() !== ph.es) faux(x.v, "forme trouvée", ph.trouve, "≠", ph.es);
    }
    console.log(`  ${t.padEnd(7)} ${x.v.padEnd(12)} ${PERSONNES[ph.p].padEnd(13)} ${(ph.avant + "___" + ph.apres).padEnd(60)} → ${ph.es}  [${ph.source}]`);
  }
}
console.log(`${nbPhrases} phrases :`, Object.entries(parTemps).map(([t, n]) => `${TEMPS[t].nom} ${n}`).join(", "), ".");
// Chaque verbe a ses 6 formes à chaque temps (rien qui plante, rien de vide).
for (const t of ORDRE_TEMPS) for (const x of verbes) for (let p = 0; p < 6; p++) {
  let f; try { f = conjuguer(x.v, p, x.d, t); } catch (e) { faux(x.v, t, p, "plante :", e.message); continue; }
  if (!f) faux(x.v, t, p, "forme vide");
}
// Les temps vus : le présent seul au début, tous à la fin du livre.
if (V.tempsVus(ctxDebut).join() !== "present") faux("temps vus au début :", V.tempsVus(ctxDebut));
if (V.tempsVus(ctxTout).join() !== ORDRE_TEMPS.join()) faux("temps vus à la fin :", V.tempsVus(ctxTout));

// 2. Les séries : 10 questions, 1 tableau, chaque réponse = la forme calculée, « à l'envers » avec un seul bon choix.
function verifierSerie(ctx, pool, opts, nom, k0 = 200) {
  const temps = opts.temps || ["present"];
  const vus = new Set();
  for (let k = 0; k < k0; k++) {
    const s = V.tirerSerie(ctx, pool, opts);
    if (s.length !== 10) faux(nom, "série de", s.length);
    if (s.filter(q => q.type === "tableau").length !== 1) faux(nom, "pas 1 tableau");
    if (opts.tableauEnPremier && s[0].type !== "tableau") faux(nom, "tableau pas en premier");
    if (opts.tableauEnPremier && s[0].temps !== temps[0]) faux(nom, "tableau pas au temps de la fiche", s[0].temps);
    if (!temps.includes("present") && s.some(q => q.type === "envers")) faux(nom, "« à l'envers » sans présent");
    for (const q of s) {
      vus.add(q.temps);
      if (!temps.includes(q.temps)) faux(nom, "temps pas demandé", q.temps);
      if (q.type === "envers" && q.temps !== "present") faux(nom, "« à l'envers » hors du présent");
      const x = pool.find(y => y.v === q.v);
      if (!x) { faux(nom, "verbe hors de la liste", q.v); continue; }
      if (q.type === "forme" || q.type === "phrase") {
        if (q.es[0] !== conjuguer(q.v, q.p, x.d, q.temps)) faux(nom, q.type, q.v, q.p, q.temps, q.es[0]);
      } else if (q.type === "envers") {
        const bons = q.choix.filter(c => conjuguer(c.v, c.p, pool.find(y => y.v === c.v).d) === q.forme);
        if (bons.length !== 1) faux(nom, "envers", q.forme, "bons choix :", bons.length);
        if (q.choix.length < 2) faux(nom, "envers", q.forme, "trop peu de choix");
      } else if (q.type === "tableau") {
        if (q.formes.join() !== PERSONNES.map((_, p) => conjuguer(q.v, p, x.d, q.temps)).join()) faux(nom, "tableau", q.v, q.temps);
      }
    }
  }
  if (temps.some(t => !vus.has(t))) faux(nom, "temps jamais tirés :", temps.filter(t => !vus.has(t)));
  console.log(`✓ ${nom} : ${k0} séries vérifiées.`);
}
verifierSerie(ctxTout, verbes, {}, "tous les verbes");
verifierSerie(ctxDebut, verbes.filter(x => x.v === "hablar"), {}, "un seul verbe (hablar)");
for (const x of verbes) verifierSerie(ctxTout, [x], { tableauEnPremier: true }, `depuis la fiche de ${x.v}`);
// Avec les temps : la série mélangée sur les temps vus, et depuis la fiche, chaque onglet (même pas vu).
verifierSerie(ctxTout, verbes, { temps: V.tempsVus(ctxTout) }, "tous les verbes, tous les temps vus");
verifierSerie(ctxTout, verbes.filter(x => ["hacer", "vivir", "trabajar"].includes(x.v)), { temps: ["present", "pc"] }, "3 verbes, présent et passé composé (U10)");
for (const t of ORDRE_TEMPS) for (const x of verbes) verifierSerie(ctxDebut, [x], { tableauEnPremier: true, temps: [t] }, `fiche de ${x.v} · ${t}`, 20);
// Les parts égales (Q16-1) : sur 2 temps, chaque temps fait environ la moitié des questions notées.
{
  const n = { present: 0, pc: 0 };
  const pool = verbes.filter(x => ["hacer", "vivir", "trabajar"].includes(x.v));
  for (let k = 0; k < 500; k++) for (const q of V.tirerSerie(ctxTout, pool, { temps: ["present", "pc"] })) if (q.type !== "tableau") n[q.temps]++;
  const part = n.pc / (n.pc + n.present);
  if (part < .4 || part > .55) faux("parts égales", n); else console.log(`✓ Parts égales : présent ${n.present}, passé composé ${n.pc}.`);
}

// 3. Au début (U1-L1 faite) : tous mes verbes, suggestions.
console.log("Début · mes verbes :", V.mesVerbes(ctxDebut).map(x => x.v).join(", "));
console.log("Début · à apprendre ensuite :", V.suggestions(ctxDebut).map(x => `${x.v} (${x.carte.lecon})`).join(", "));

// 4. La sauvegarde rend les verbes en cours et les séries justes.
P.mettreEnCours("hacer", "2026-11-24"); P.mettreEnCours("ser", "2026-11-24");
P.noterSerieVerbes({ hacer: true, ser: false }); P.noterSerieVerbes({ hacer: true });
const fichier = P.exporter("2026-11-24");
P.retirerDesCours("hacer"); P.retirerDesCours("ser");
P.restaurer(P.lireSauvegarde(fichier));
if (P.verbesEnCours().join() !== "hacer,ser" || P.seriesJustes("hacer") !== 2 || P.seriesJustes("ser") !== 0) faux("sauvegarde", P.verbesEnCours(), P.seriesJustes("hacer"));
else console.log("✓ La sauvegarde rend les verbes en cours (hacer, ser) et les séries justes (hacer : 2).");
// Une vieille sauvegarde, sans verbes : elle se restaure quand même, avec une liste vide.
const vieille = JSON.parse(fichier); delete vieille.verbes;
P.restaurer(P.lireSauvegarde(JSON.stringify(vieille)));
if (P.verbesEnCours().length !== 0) faux("vieille sauvegarde"); else console.log("✓ Une sauvegarde d'avant (sans verbes) se restaure.");

console.log(erreurs ? `\n${erreurs} erreur(s).` : "\nTout est juste.");
process.exit(erreurs ? 1 : 0);
