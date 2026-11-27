// Vérifie le moteur de « Mes mots en cours » (motsencours.js, chantier 19) sur le vrai vocabulaire du Sheet :
// les anciens verbes en cours restent là, une séance a 10 questions bien rangées, la correction de l'article
// et de la confusion pueblo / barrio, et chaque mot du Sheet peut faire une séance seul.
// Lancer depuis appli/ : node outils/test-motsencours.mjs chemin/vers/vocabulaire.csv
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-motscours-"));
// Sans les « ?v=N » des imports : un seul exemplaire de progression.js, quel que soit le numéro de version.
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js")))
  fs.writeFileSync(path.join(tmp, f), fs.readFileSync(path.join(racine, f), "utf8").replace(/\?v=\d+/g, ""));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const V = await import(path.join(tmp, "progression.js"));
const M = await import(path.join(tmp, "motsencours.js"));
const { LECONS } = await import(path.join(tmp, "position.js"));

const csv = process.argv[2];
if (!csv) { console.error("Donne le CSV du vocabulaire."); process.exit(1); }
const mots = versMots(lireCsv(fs.readFileSync(csv, "utf8")));
let erreurs = 0, verifs = 0;
const ok = (cond, ...t) => { verifs++; if (!cond) { erreurs++; console.log("✗", ...t); } };

const toutes = new Set(LECONS.map(l => l.id));
const ctx = { mots, pos: { faites: toutes } };
const ctxU1 = { mots, pos: { faites: new Set(["U1-L1", "U1-L2", "U1-L3"]) } };
const trouver = es => mots.find(m => m.es === es);
const pueblo = trouver("el pueblo"), barrio = trouver("el barrio"), casarse = trouver("casarse");
ok(pueblo && barrio && casarse, "mots de départ introuvables");

// 1. Les clés : un verbe seul garde son infinitif (comme « Mes verbes en cours »), un nom son id.
ok(M.cleDe(ctx, casarse) === "casarse", "clé de casarse", M.cleDe(ctx, casarse));
ok(M.cleDe(ctx, pueblo) === pueblo.id, "clé de el pueblo");
const tenerPrisa = trouver("tener prisa");
if (tenerPrisa) ok(M.cleDe(ctx, tenerPrisa) === tenerPrisa.id, "tener prisa doit rester un mot");

// 2. Une vieille sauvegarde : verbes en cours = { casarse, buscar } (buscar n'a pas de carte) → les deux sont là.
const vieille = JSON.stringify({ mots: {}, jours: {}, ecoute: 0, verbes: { cours: { casarse: "2026-11-20", buscar: "2026-11-21" }, justes: { casarse: 1 } } });
V.restaurer(V.lireSauvegarde(vieille));
ok(V.seriesJustes("casarse") === 1, "séries justes gardées");
let liste = M.motsEnCours(ctx);
ok(liste.some(i => i.cle === "casarse" && i.x && i.m === casarse), "casarse migré", liste.map(i => i.cle));
ok(liste.some(i => i.cle === "buscar" && i.x && !i.m), "buscar (verbe des exercices, sans carte) migré", liste.map(i => i.cle));

// 3. Ajouter el pueblo et el barrio.
V.mettreEnCours(M.cleDe(ctx, pueblo), "2026-11-25");
V.mettreEnCours(M.cleDe(ctx, barrio), "2026-11-25");
liste = M.motsEnCours(ctx);
ok(liste.length === 4, "4 mots en cours", liste.map(i => i.cle));
ok(M.motEnCours(ctx, pueblo) && M.motEnCours(ctx, casarse), "motEnCours");

// 4. Les séances : forme, ordre, pas de doublon bête.
const NOTEES = new Set(["fres", "ecoute", "trou", "phrase", "sens", "conj-forme", "conj-phrase"]);
function verifierSeance(c, items, nom) {
  for (let k = 0; k < 300; k++) {
    const s = M.tirerSeance(c, items);
    ok(s.length === 10, nom, "pas 10 questions", s.length);
    const tableaux = s.filter(q => q.type === "tableau");
    ok(tableaux.length === (items.some(i => i.x) ? 1 : 0), nom, "tableaux", tableaux.length);
    ok(s.filter(q => q.type === "sens").length <= 1, nom, "plus d'un « choisir le sens »");
    ok(s.every(q => q.type === "tableau" || NOTEES.has(q.type)), nom, "type inconnu");
    ok(s.every(q => q.type === "tableau" || q.type === "sens" || (q.es?.length && q.es.every(Boolean))), nom, "question sans réponse");
    const cles = new Set(items.map(i => i.cle));
    ok(s.every(q => cles.has(q.cle)), nom, "question hors des mots de la séance");
    // Chaque mot commence par sa question « à froid » (fres), s'il en a une.
    const vus = new Set();
    for (const q of s) {
      if (!vus.has(q.cle)) {
        const aFres = s.some(x => x.cle === q.cle && x.premiere);
        ok(!aFres || q.premiere, nom, "le mot", q.cle, "commence par", q.type);
        vus.add(q.cle);
      }
    }
    // Jamais le même mot deux fois de suite (dès qu'il y a 2 mots… sauf quand c'est impossible : on le compte).
    if (items.length >= 3) {
      const suites = s.filter((q, i) => i && s[i - 1].cle === q.cle).length;
      ok(suites <= 2, nom, "trop de questions du même mot à la suite", suites, s.map(q => q.cle.split("|").pop()).join(" "));
    }
    // Avec un seul mot : pas deux fois la même sorte de question de suite (« écoute » puis « écoute »).
    if (items.length === 1) {
      const memes = s.filter((q, i) => i && s[i - 1].type === q.type).length;
      ok(memes === 0, nom, "même sorte de question deux fois de suite", s.map(q => q.type).join(" "));
    }
    // Avec un verbe : au moins une question de conjugaison, au plus 4.
    const conj = s.filter(q => q.type.startsWith("conj")).length;
    if (items.some(i => i.x)) ok(conj >= 1 && conj <= 4, nom, "conjugaison", conj);
    // Tout le monde a au moins une question.
    for (const i of items) ok(s.some(q => q.cle === i.cle), nom, "mot sans question", i.cle);
  }
}
const trois = M.motsEnCours(ctx).filter(i => i.cle !== "buscar");
verifierSeance(ctx, trois, "pueblo + barrio + casarse");
verifierSeance(ctxU1, trois, "pueblo + barrio + casarse, à U1-L3");
verifierSeance(ctx, [M.resoudre(ctx, pueblo.id)], "el pueblo seul");
verifierSeance(ctx, [M.resoudre(ctx, "casarse")], "casarse seul");

// Un exemple, pour voir.
const ex = M.tirerSeance(ctxU1, trois);
console.log("Une séance (pueblo, barrio, casarse) :");
for (const q of ex) console.log("  ", q.type.padEnd(11), (q.fr || q.dire || (q.avant != null ? q.avant + "___" + q.apres : "") || q.es?.[0] || q.v || "").toString().slice(0, 60), "→", (q.es?.[0] || q.bon || q.formes?.join(", ") || ""));

// 5. Les 5 mots d'une séance.
const beaucoup = mots.filter(m => /^(el|la) /.test(m.es)).slice(0, 8);
for (const m of beaucoup) V.mettreEnCours(M.cleDe(ctx, m), "2026-11-25");
ok(M.motsDeLaSeance(M.motsEnCours(ctx)).length === 5, "une séance prend 5 mots au plus");

// 6. La correction (Q19-4).
const qPueblo = { type: "fres", cle: pueblo.id, es: M.reponsesDe("el pueblo"), nom: true };
const qBarrio = { type: "fres", cle: barrio.id, es: M.reponsesDe("el barrio"), nom: true };
const items = [M.resoudre(ctx, pueblo.id), M.resoudre(ctx, barrio.id)];
let r = M.corrigerMot(qPueblo, "el pueblo", items); ok(r.ok && !r.article, "el pueblo juste");
r = M.corrigerMot(qPueblo, "El Pueblo.", items); ok(r.ok, "casse et ponctuation");
r = M.corrigerMot(qPueblo, "pueblo", items); ok(r.ok && r.article === "el pueblo", "article oublié = juste + rappel", r);
r = M.corrigerMot(qBarrio, "la barrio", items); ok(!r.ok && r.genre?.masculin && r.genre.mot === "barrio", "mauvais article = faux", r);
r = M.corrigerMot(qBarrio, "el pueblo", items); ok(!r.ok && r.confondu?.es === "el pueblo", "confusion pueblo / barrio", r);
r = M.corrigerMot(qBarrio, "pueblo", items); ok(!r.ok && r.confondu, "confusion sans article");
r = M.corrigerMot(qBarrio, "el baro", items); ok(!r.ok && !r.confondu && !r.genre, "vraie faute");
const qHermano = { type: "fres", cle: "x", es: M.reponsesDe("el hermano / la hermana"), nom: true };
ok(M.corrigerMot(qHermano, "el hermano").ok && M.corrigerMot(qHermano, "la hermana").ok && M.corrigerMot(qHermano, "hermana").ok, "el hermano / la hermana");
ok(M.reponsesDe("comer (= déjeuner)")[0] === "comer", "parenthèses", M.reponsesDe("comer (= déjeuner)"));
const qCasarse = { type: "fres", cle: "casarse", es: M.reponsesDe("casarse"), nom: false };
ok(M.corrigerMot(qCasarse, "casarse").ok && !M.corrigerMot(qCasarse, "casar").ok, "casarse");

// 7. Chaque mot du Sheet peut faire une séance seul (10 questions, chacune avec sa réponse).
let seuls = 0;
for (const m of mots) {
  const it = M.resoudre(ctx, M.cleDe(ctx, m)) || M.resoudre(ctx, m.id);
  if (!it) { ok(false, "pas résolu", m.es); continue; }
  const s = M.tirerSeance(ctx, [it]);
  ok(s.length === 10, m.es, "seul :", s.length);
  ok(s.every(q => q.type === "tableau" || q.type === "sens" || q.es?.every(Boolean)), m.es, "réponse vide");
  seuls++;
}
console.log(`${seuls} mots peuvent faire une séance seuls.`);

// 8. « Tu le sais ? » : le bilan par mot.
const b = M.bilanParMot([{ q: { cle: "a" }, ok: true }, { q: { cle: "a" }, ok: false }, { q: { cle: "b" }, ok: true }]);
ok(b.a === false && b.b === true, "bilan par mot");

console.log(erreurs ? `\n${erreurs} erreur(s) sur ${verifs} vérifications.` : `\nTout est bon (${verifs} vérifications).`);
process.exit(erreurs ? 1 : 0);
