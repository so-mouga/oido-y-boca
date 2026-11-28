// Vérifie le moteur de « Mes mots en cours » (motsencours.js, chantier 19) sur le vrai vocabulaire du Sheet :
// les anciens verbes en cours restent là, une séance a 3 questions par mot (10 au plus) bien rangées, la correction de l'article
// et de la confusion pueblo / barrio, chaque mot du Sheet peut faire une séance seul, et (étape 4) l'entrée toute seule,
// la sortie, le compteur de « Non », mon astuce et la sauvegarde.
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

// 4. Les séances (étape 4, Q26-18 à Q26-20) : 3 questions par mot au plus, 10 au plus, pas de « choisir le sens »
// ni de tableau ; un verbe = le mot + 2 conjugaisons ; chaque mot commence à froid.
const NOTEES = new Set(["fres", "ecoute", "trou", "phrase", "conj-forme", "conj-phrase"]);
function verifierSeance(c, items, nom) {
  for (let k = 0; k < 300; k++) {
    const s = M.tirerSeance(c, items, { tour: k });
    ok(s.length <= M.nbQuestions(items.length) && s.length >= Math.min(M.nbQuestions(items.length), items.length), nom, "nombre de questions", s.length);
    ok(s.every(q => NOTEES.has(q.type)), nom, "type inattendu (sens ou tableau ?)", s.map(q => q.type).join(" "));
    ok(s.every(q => q.es?.length && q.es.every(Boolean)), nom, "question sans réponse");
    const cles = new Set(items.map(i => i.cle));
    ok(s.every(q => cles.has(q.cle)), nom, "question hors des mots de la séance");
    for (const i of items) {
      const du = s.filter(q => q.cle === i.cle);
      ok(du.length >= 1 && du.length <= M.PAR_MOT, nom, "questions de", i.cle, du.length);
      ok(new Set(du.map(q => q.type)).size === du.length || i.x, nom, "deux fois la même sorte pour", i.cle, du.map(q => q.type).join(" "));
      if (i.x) ok(du[0]?.type === "fres" && du.slice(1).every(q => q.type.startsWith("conj")), nom, "un verbe : le mot puis 2 conjugaisons", du.map(q => q.type).join(" "));
      else ok(du[0]?.type === "fres", nom, "un mot commence par « du français »", i.cle, du[0]?.type);
    }
    if (items.length === 3) ok(s.length === 9, nom, "3 mots = 9 questions", s.length);
    if (items.length >= 3) {
      const suites = s.filter((q, i) => i && s[i - 1].cle === q.cle).length;
      ok(suites <= 1, nom, "trop de questions du même mot à la suite", suites, s.map(q => q.cle.split("|").pop()).join(" "));
    }
  }
}
const trois = M.motsEnCours(ctx).filter(i => i.cle !== "buscar");
verifierSeance(ctx, trois, "pueblo + barrio + casarse");
verifierSeance(ctxU1, trois, "pueblo + barrio + casarse, à U1-L3");
verifierSeance(ctx, [M.resoudre(ctx, pueblo.id)], "el pueblo seul");
verifierSeance(ctx, [M.resoudre(ctx, "casarse")], "casarse seul");
ok(M.tirerSeance(ctx, [M.resoudre(ctx, pueblo.id)]).length === 3, "un mot seul = 3 questions");
ok([1, 2, 3, 4, 5, 8].map(M.nbQuestions).join() === "3,6,9,10,10,10", "1 mot 3, 2 mots 6, 3 mots 9, 4 ou 5 mots 10");
// La 3e question tourne d'un jour à l'autre : à l'oreille, ou une phrase à traduire.
const troisiemes = new Set([0, 1, 2, 3].map(tour => M.tirerSeance(ctx, [M.resoudre(ctx, pueblo.id)], { tour }).find(q => !q.premiere && q.type !== "trou")?.type));
ok(!pueblo.phrases.length || troisiemes.size >= 2, "la 3e question change d'un jour à l'autre", [...troisiemes]);
// 4 mots : 10 questions ; les premiers (les moins travaillés) gardent leurs 3 questions.
const quatre = [...trois, M.resoudre(ctx, trouver("la ciudad").id)];
const s4 = M.tirerSeance(ctx, quatre, { tour: 0 });
ok(s4.length === 10, "4 mots = 10 questions", s4.length);
ok(s4.filter(q => q.cle === quatre[0].cle).length === 3, "le 1er mot garde ses 3 questions");

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

// 7. Chaque mot du Sheet peut faire une séance seul (3 questions au plus, chacune avec sa réponse).
let seuls = 0;
for (const m of mots) {
  const it = M.resoudre(ctx, M.cleDe(ctx, m)) || M.resoudre(ctx, m.id);
  if (!it) { ok(false, "pas résolu", m.es); continue; }
  const s = M.tirerSeance(ctx, [it]);
  ok(s.length >= 1 && s.length <= 3, m.es, "seul :", s.length);
  ok(s.every(q => q.es?.every(Boolean)), m.es, "réponse vide");
  seuls++;
}
console.log(`${seuls} mots peuvent faire une séance seuls.`);

// 8. « Tu le sais ? » : le bilan par mot.
const b = M.bilanParMot([{ q: { cle: "a" }, ok: true }, { q: { cle: "a" }, ok: false }, { q: { cle: "b" }, ok: true }, { q: { cle: "c" }, ok: true, aide: true }]);
ok(b.a === false && b.b === true && b.c === false, "bilan par mot (avec un indice, pas « tout juste »)");

// 9. L'entrée toute seule et la sortie (étape 4, Q26-14 à Q26-17).
const cuñado = trouver("el cuñado / la cuñada"), suegros = trouver("los suegros");
const J = "2026-11-28", ctxJ = { ...ctx, jour: J };
ok(!M.entrerSiBloque(ctxJ, cuñado, J), "pas de raison d'entrer au départ");
V.noterMot(cuñado.id, 1, J); V.noterMot(cuñado.id, 1, J);
ok(M.entrerSiBloque(ctxJ, cuñado, J) === "2", "2 « Non » de suite à la carte 1 : il entre");
ok(M.motEnCours(ctx, cuñado), "el cuñado est en cours");
ok(!Object.keys(V.fichesCartes()).some(k => k.startsWith(cuñado.id + "#")), "entrer ne prend pas les cartes 3 et 4 (Q26-14)");
// Sortie par « Je le sais » : retenu le, compteur à 0 ; les 2 « Non » de suite ne le font plus revenir.
V.compterNon(cuñado.id);
M.sortirDesCours(ctxJ, M.cleDe(ctx, cuñado), J);
ok(!M.motEnCours(ctx, cuñado), "sorti");
ok(V.difficile(M.cleDe(ctx, cuñado)).retenu === J, "« Je le sais » note « retenu le »");
ok((V.difficile(cuñado.id).non || 0) === 0, "le compteur repart de 0 à la sortie");
ok(!M.entrerSiBloque(ctxJ, cuñado, J), "sorti : les 2 « Non » de suite ne le font pas revenir");
V.compterNon(cuñado.id); V.compterNon(cuñado.id);
ok(!M.entrerSiBloque(ctxJ, cuñado, J), "2 nouveaux « Non » : pas encore");
V.compterNon(cuñado.id);
ok(M.entrerSiBloque(ctxJ, cuñado, J) === "3", "3 nouveaux « Non » : il revient");
// La croix : retiré, sans date.
M.sortirDesCours(ctxJ, M.cleDe(ctx, suegros), null);
V.mettreEnCours(M.cleDe(ctx, suegros), J); M.sortirDesCours(ctxJ, M.cleDe(ctx, suegros), null);
ok(!V.difficile(M.cleDe(ctx, suegros)).retenu, "la croix ne note pas « retenu le »");
// Le rattrapage : un mot déjà à 2 « Non » de suite (noté avant cette version) entre au lancement.
const primos = trouver("los primos");
V.noterMot(primos.id, 1, J); V.noterMot(primos.id, 1, J);
M.rattraperEntrees(ctxJ, [primos]);
ok(M.motEnCours(ctx, primos), "rattrapage : los primos entre");
// Mon astuce : gardée, et dans la sauvegarde (avec la date de la dernière séance, Q26-22).
V.garderAstuce(M.cleDe(ctx, primos), "  Primos : les cousins, comme « prime » de la famille.  ", J);
ok(V.difficile(M.cleDe(ctx, primos)).astuce === "Primos : les cousins, comme « prime » de la famille.", "astuce gardée (sans espaces autour)");
V.noterSerieVerbes({ [M.cleDe(ctx, primos)]: true }, J);
const relue = V.lireSauvegarde(V.donneesSauvegarde(J)).etat;
ok(relue.difficiles?.[M.cleDe(ctx, primos)]?.astuce, "l'astuce part dans la sauvegarde et revient");
ok(relue.verbes.derniere?.[M.cleDe(ctx, primos)] === J, "la date de la dernière séance revient à la restauration (Q26-22)");

console.log(erreurs ? `\n${erreurs} erreur(s) sur ${verifs} vérifications.` : `\nTout est bon (${verifs} vérifications).`);
process.exit(erreurs ? 1 : 0);
