// Vérifie la réserve de « Mes erreurs » (erreurs-phrases.js, point 8 quindecies) avec le vrai vocabulaire du Sheet :
// - chaque phrase a fr, es, piege et apres (une vraie leçon) ; la clé de la carte commence par « e: » ;
// - le morceau piège se trouve tel quel dans la phrase modèle (accents compris), sans chiffre (une seule bonne écriture) ;
// - chaque mot de la phrase modèle est vu à la leçon « apres » (carte du Sheet, forme conjuguée d'un verbe vu,
//   petit mot de grammaire), sauf les prénoms et les noms de lieux.
// Avec --carnet <fichier> (le texte du carnet lu avec l'outil Google Drive, ou seulement son tableau des erreurs),
// liste aussi les cartes du carnet, leur clé, leur morceau piège et le nombre de phrases déjà en réserve :
// c'est le point de départ de « remplis mes erreurs » (outils/remplir-erreurs.md).
// Lancer depuis appli/ : node outils/test-erreurs-phrases.mjs [--carnet carnet.md] [vocabulaire.csv]
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-erreurs-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js"))) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const args = process.argv.slice(2);
const iCarnet = args.indexOf("--carnet");
const fichierCarnet = iCarnet >= 0 ? args.splice(iCarnet, 2)[1] : null;

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const { conjuguer, TEMPS } = await import(path.join(tmp, "controles.js"));
const { verbeDe } = await import(path.join(tmp, "dico.js"));
const { LECONS } = await import(path.join(tmp, "position.js"));
const { NOMS } = await import(path.join(tmp, "lectures.js"));
const C = await import(path.join(tmp, "carnet.js"));
const { RESERVE } = await import(path.join(tmp, "erreurs-phrases.js"));

const csv = args[0]
  ? fs.readFileSync(args[0], "utf8")
  : await (await fetch("https://docs.google.com/spreadsheets/d/1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ/gviz/tq?tqx=out:csv&sheet=Vocabulaire")).text();
const mots = versMots(lireCsv(csv));

const min = s => s.toLocaleLowerCase("es");
const motsDe = s => (min(s).match(/\p{L}+/gu) || []);
const ordre = new Map(LECONS.map((l, i) => [l.id, i]));
const uniteDe = lecon => { const m = lecon.match(/^U(\d+)/); return m ? Number(m[1]) : 8.5; };

// Les petits mots de grammaire, repris tels quels de test-lectures.mjs (une seule liste à tenir à jour).
const source = fs.readFileSync(path.join(ici, "test-lectures.mjs"), "utf8");
const OUTILS = eval(`(${source.match(/const OUTILS = (\{[\s\S]*?\n\});/)[1]})`);
const PROPRES = new Set([...NOMS, "huesca", "parís", "madrid", "francia", "españa", "galicia", "valencia", "carpentras", "aviñón", "toulon"]);

// Les mots vus à la fin de la leçon l : cartes du Sheet des leçons jusqu'à l (et leur pluriel), formes des verbes vus
// aux temps déjà vus, petits mots de grammaire de l'unité.
function vusA(l) {
  const n = ordre.get(l), u = uniteDe(l), vus = new Set();
  const temps = Object.entries(TEMPS).filter(([, t]) => (ordre.get(t.lecon) ?? Infinity) <= n).map(([k]) => k);
  for (const m of mots.filter(m => (ordre.get(m.lecon) ?? Infinity) <= n)) {
    const es = m.es.replace(/\([^)]*\)/g, " ").replace(/=.*/, " ");
    for (const w of motsDe(es)) { vus.add(w); if (m.categorie !== "verbe") vus.add(/[aeiouáéó]$/.test(w) ? w + "s" : w + "es"); }
    const vb = verbeDe({ ...m, categorie: "verbe" });
    if (!vb || !/^\p{L}*[aeií]r(se)?$/u.test(min(es.trim().split(/[\s…]+/)[0] || ""))) continue;
    for (const t of temps) for (let p = 0; p < 6; p++) {
      try { for (const w of motsDe(conjuguer(vb.v, p, vb.d, t))) vus.add(w); } catch { /* verbe inconnu du moteur */ }
    }
  }
  for (const [k, v] of Object.entries(OUTILS)) if (Number(k) <= u) for (const w of v.split(/\s+/).filter(Boolean)) vus.add(w);
  return vus;
}

let erreurs = 0, phrases = 0;
const signaler = (cle, msg) => { erreurs++; console.log(`✗ ${cle} : ${msg}`); };
const cache = {};
for (const [cle, liste] of Object.entries(RESERVE)) {
  if (!cle.startsWith("e:") || cle !== `e:${C.normaliser(cle.slice(2))}`) signaler(cle, "la clé doit être « e: » + la bonne forme normalisée (normaliser de carnet.js)");
  for (const p of liste) {
    phrases++;
    const nom = `${cle} · « ${p.fr} »`;
    if (!p.fr || !p.es || !p.piege || !p.apres) { signaler(nom, "il manque fr, es, piege ou apres"); continue; }
    if (!ordre.has(p.apres)) { signaler(nom, `leçon « ${p.apres} » inconnue`); continue; }
    if (C.chercherMorceau(p.es, p.piege, true) < 0) signaler(nom, `le piège « ${p.piege} » n'est pas tel quel dans « ${p.es} »`);
    if (/\d/.test(p.piege)) signaler(nom, `le piège « ${p.piege} » contient un chiffre : il peut s'écrire de deux façons`);
    const vus = cache[p.apres] ||= vusA(p.apres);
    const inconnus = motsDe(p.es).filter(w => !vus.has(w) && !PROPRES.has(w));
    if (inconnus.length) signaler(nom, `pas vus à ${p.apres} : ${[...new Set(inconnus)].join(", ")}`);
  }
  const dupliquees = liste.map(p => p.fr).filter((f, i, t) => t.indexOf(f) !== i);
  if (dupliquees.length) signaler(cle, `phrases en double : ${dupliquees.join(" ; ")}`);
}

// Le carnet : le tableau « Erreur | Bonne forme | Règle | Vue » en markdown (copie de read_file_content).
if (fichierCarnet) {
  const lignes = fs.readFileSync(fichierCarnet, "utf8").split("\n").filter(l => l.trim().startsWith("|"))
    .map(l => l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim()));
  const carnet = C.lireCarnet({ tableau: lignes, bilans: [] });
  console.log(`\nLe carnet : ${carnet.erreurs.length} cartes`);
  for (const c of carnet.erreurs) {
    const piege = C.morceauPiege(c.erreur, c.bonne);
    const n = (RESERVE[c.cle] || []).length;
    console.log(`${n >= 4 ? "  " : "→ "}${JSON.stringify(c.cle)} · ${c.erreur} → ${c.bonne} · piège : ${piege ? `« ${piege.texte} »${piege.ortho ? " (orthographe)" : ""}` : "aucun (reste « Corrige »)"} · ${n} phrase(s)`);
  }
  const orphelines = Object.keys(RESERVE).filter(k => !carnet.erreurs.some(c => c.cle === k));
  if (orphelines.length) console.log(`\nDans la réserve mais plus dans le carnet (à retirer) : ${orphelines.join(", ")}`);
}

console.log(erreurs ? `\n${erreurs} problème(s) dans la réserve (${phrases} phrases).` : `\n✓ Réserve : ${phrases} phrases, tout est bon.`);
process.exit(erreurs ? 1 : 0);
