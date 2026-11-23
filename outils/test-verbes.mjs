// Vérifie le moteur de « S'entraîner aux verbes » (verbes.js) sur le vrai vocabulaire du Sheet :
// chaque réponse attendue est bien la forme calculée, chaque phrase trouée redonne la phrase d'origine,
// « à l'envers » n'a qu'un seul bon choix, et une série a toujours 10 questions.
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
const V = await import(path.join(tmp, "verbes.js?v=40"));
const { conjuguer, PERSONNES } = await import(path.join(tmp, "controles.js?v=40"));
const P = await import(path.join(tmp, "progression.js?v=40"));
const { LECONS } = await import(path.join(tmp, "position.js?v=40"));

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
for (const x of verbes) {
  for (const ph of V.phrasesDe(ctxTout, x)) {
    nbPhrases++;
    const calc = conjuguer(x.v, ph.p, x.d);
    if (ph.es !== calc) faux(x.v, "réponse", ph.es, "≠ calculée", calc);
    if (ph.source === "exemple") {
      const original = x.cartes.map(m => m.ex).find(ex => ex === ph.avant + ph.trouve + ph.apres);
      if (!original) faux(x.v, "phrase mal reconstituée :", ph.avant + "___" + ph.apres);
      if (ph.trouve.toLowerCase() !== ph.es) faux(x.v, "forme trouvée", ph.trouve, "≠", ph.es);
    }
    console.log(`  ${x.v.padEnd(12)} ${PERSONNES[ph.p].padEnd(13)} ${(ph.avant + "___" + ph.apres).padEnd(60)} → ${ph.es}  [${ph.source}]`);
  }
}
console.log(`${nbPhrases} phrases.`);

// 2. Les séries : 10 questions, 1 tableau, chaque réponse = la forme calculée, « à l'envers » avec un seul bon choix.
function verifierSerie(ctx, pool, opts, nom) {
  for (let k = 0; k < 200; k++) {
    const s = V.tirerSerie(ctx, pool, opts);
    if (s.length !== 10) faux(nom, "série de", s.length);
    if (s.filter(q => q.type === "tableau").length !== 1) faux(nom, "pas 1 tableau");
    if (opts.tableauEnPremier && s[0].type !== "tableau") faux(nom, "tableau pas en premier");
    for (const q of s) {
      const x = pool.find(y => y.v === q.v);
      if (!x) { faux(nom, "verbe hors de la liste", q.v); continue; }
      if (q.type === "forme" || q.type === "phrase") {
        if (q.es[0] !== conjuguer(q.v, q.p, x.d)) faux(nom, q.type, q.v, q.p, q.es[0]);
      } else if (q.type === "envers") {
        const bons = q.choix.filter(c => conjuguer(c.v, c.p, pool.find(y => y.v === c.v).d) === q.forme);
        if (bons.length !== 1) faux(nom, "envers", q.forme, "bons choix :", bons.length);
        if (q.choix.length < 2) faux(nom, "envers", q.forme, "trop peu de choix");
      } else if (q.type === "tableau") {
        if (q.formes.join() !== PERSONNES.map((_, p) => conjuguer(q.v, p, x.d)).join()) faux(nom, "tableau", q.v);
      }
    }
  }
  console.log(`✓ ${nom} : 200 séries vérifiées.`);
}
verifierSerie(ctxTout, verbes, {}, "tous les verbes");
verifierSerie(ctxDebut, verbes.filter(x => x.v === "hablar"), {}, "un seul verbe (hablar)");
for (const x of verbes) verifierSerie(ctxTout, [x], { tableauEnPremier: true }, `depuis la fiche de ${x.v}`);

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
