// S'entraîner aux verbes : le moteur, sans écran (les écrans sont dans ecrans/verbes.js).
// Il dit quels verbes on peut travailler, tire les questions d'une série et retrouve des phrases déjà écrites.
// Pensé pour servir aussi plus tard à la « Course de conjugaison » des jeux (mêmes questions, chronométrées).
// Seulement le présent pour l'instant : chaque question porte « temps: "present" », pour pouvoir ajouter les autres temps.

import { conjuguer, sixFormes, PERSONNES, irregulierConnu } from "./controles.js?v=60";
import { verbeDe, motVu, rangLecon, normaliser } from "./dico.js?v=60";
import { verbesEnCours } from "./progression.js?v=60";
import { EXERCICES } from "./exercices.js?v=60";
import { BONUS } from "./bonus.js?v=60";

// ── Les verbes ──
// Un verbe qu'on peut travailler : l'appli connaît ses 6 formes, et il ne se construit pas comme gustar.
// Plusieurs cartes du Sheet peuvent donner le même verbe (« tener », « tener … años », « tener prisa ») :
// on garde un seul verbe, avec toutes ses cartes. Le sens vient de la carte du verbe seul (« tener » = avoir).
//   { v, inf, d, irr, fr, cartes: [mots du Sheet], carte: la carte du verbe seul (ou la 1re), rang: sa leçon dans le livre }
export function tousLesVerbes(ctx) {
  const parVerbe = new Map();
  for (const m of ctx.mots) {
    const vb = verbeDe(m);
    if (!vb?.formes || vb.gustar) continue;
    let x = parVerbe.get(vb.v);
    if (!x) parVerbe.set(vb.v, x = { v: vb.v, inf: vb.inf, d: vb.d, irr: vb.famille === "irr", fr: "", cartes: [], carte: m, rang: 1e6 });
    x.cartes.push(m);
    // La carte du verbe seul : « tener », « comer (= déjeuner) » (pas « tener prisa »). Sa leçon donne la place du verbe dans le livre.
    const seul = normaliser(m.es.replace(/\([^)]*\)/g, " ")) === normaliser(vb.v);
    if (seul && !x.fr) { x.fr = m.fr; x.carte = m; x.rang = rangLecon(m.lecon); }
    else if (!x.fr) x.rang = Math.min(x.rang, rangLecon(m.lecon));
  }
  return [...parVerbe.values()];
}
// Les verbes des exercices et du bonus qui ne sont pas dans le Sheet (« buscar », « estudiar ») : l'exercice donne
// le verbe, sa voyelle qui change (d) et son sens (« buscar = chercher »). Ils peuvent aller dans « Mes verbes en cours »
// depuis un exercice (« M'entraîner sur ce verbe »), mais ne sont jamais proposés dans « À apprendre ensuite ».
// Seulement ceux que le moteur sait conjuguer (réguliers, ou irréguliers connus).
let extras = null;
function verbesDesExercices() {
  if (extras) return extras;
  const parVerbe = new Map();
  const voir = (q, sens) => {
    if (!q.v || q.v.includes(" ")) return;
    const inf = q.v.replace(/se$/, "");
    if (!/[aeií]r$/.test(inf)) return;
    const x = parVerbe.get(q.v) || parVerbe.set(q.v, { v: q.v, inf, d: q.d, irr: irregulierConnu(inf), fr: "", cartes: [], carte: null, rang: 1e6, exercice: true }).get(q.v);
    if (sens && !x.fr) x.fr = sens;
    if (q.d && !x.d) x.d = q.d;
  };
  for (const b of Object.values(BONUS)) { for (const q of b.phrases || []) voir(q, q.sens); for (const q of b.tableaux || []) voir(q, q.sens); }
  for (const e of Object.values(EXERCICES)) for (const q of e.ecrire || []) voir(q);
  extras = [...parVerbe.values()].filter(x => {
    try { conjuguer(x.v, 0, x.d); return true; } catch { return false; }
  });
  return extras;
}
// Les verbes du Sheet, puis ceux des exercices qui n'y sont pas.
export function verbesConnus(ctx) {
  const sheet = tousLesVerbes(ctx);
  const deja = new Set(sheet.map(x => x.v));
  return [...sheet, ...verbesDesExercices().filter(x => !deja.has(x.v))];
}
export const trouverVerbe = (ctx, v) => verbesConnus(ctx).find(x => x.v === v) || null;

// Vu : une de ses cartes est vue (leçon faite, ou apprise en avance).
const vuDe = (ctx, x) => x.cartes.some(m => motVu(ctx, m));

// « Tous mes verbes » : les verbes vus et ceux en cours.
export const mesVerbes = ctx => { const cours = new Set(verbesEnCours()); return verbesConnus(ctx).filter(x => cours.has(x.v) || vuDe(ctx, x)); };
// « Mes verbes en cours », dans l'ordre où je les ai ajoutés.
export const verbesCours = ctx => { const tous = verbesConnus(ctx); return verbesEnCours().map(v => tous.find(x => x.v === v)).filter(Boolean); };
// « À apprendre ensuite » : les prochains verbes du livre, pas encore vus ni en cours.
export function suggestions(ctx, n = 3) {
  const cours = new Set(verbesEnCours());
  return tousLesVerbes(ctx).filter(x => !cours.has(x.v) && !vuDe(ctx, x)).sort((a, b) => a.rang - b.rang || b.irr - a.irr).slice(0, n);
}

// Le sens à afficher (« hacer = faire »), sauf s'il est le même mot (« venir = venir »).
export const sensDe = x => x.fr && normaliser(x.fr) !== normaliser(x.inf) && normaliser(x.fr) !== normaliser(x.v) ? `${x.v} = ${x.fr}` : "";

// ── Les phrases déjà écrites ──
// 1. Les phrases à compléter des exercices et du bonus des leçons faites, qui portent déjà le verbe et la personne (v, p).
// 2. L'exemple d'une carte du verbe dans le Sheet, quand il contient une forme du présent de ce verbe (« Hago la compra… »).
// On n'écrit rien de nouveau. Une phrase : { avant, apres, p, es, source } ; la phrase entière = avant + es + apres.
const ARTICLES = new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "mi", "tu", "su", "mis", "tus", "sus", "este", "esta", "ese", "esa"]);
// Des formes qui sont aussi des mots courants : on ne s'en sert pas pour trouer une phrase.
const PIEGES = new Set(["como", "para", "bajo", "sobre", "entre", "cocina", "cena", "compra", "trabajo", "desayuno", "baile", "paseo", "llamo"]);

const IMPERATIF = new Set(["U8-L1"]);
function phrasesExercices(ctx, x) {
  const sources = [
    ...Object.entries(EXERCICES).flatMap(([l, e]) => (e.ecrire || []).map(q => ({ l, q }))),
    ...Object.entries(BONUS).flatMap(([l, b]) => (b.phrases || []).map(q => ({ l, q }))),
  ];
  // Pas l'impératif (U8-L1, « ¡___, Léo! ») : il a la forme de él, mais ce n'est pas le présent.
  // Pas les phrases au passé (champ t, unités 9 et plus) : l'entraînement ne fait que le présent pour l'instant.
  return sources.filter(({ l, q }) => ctx.pos.faites.has(l) && !IMPERATIF.has(l) && q.v === x.v && Number.isInteger(q.p) && !q.t
      && q.fr.includes("___") && !/¡\s*___/.test(q.fr))
    .map(({ l, q }) => {
      const texte = q.fr.replace(/\s*\([^)]*\)\s*$/, "");
      const [avant, apres] = texte.split("___");
      return { avant, apres, p: q.p, es: conjuguer(x.v, q.p, x.d), source: l };
    });
}

// Cherche une forme du présent dans l'exemple d'une carte : mot entier, accents compris (« está » n'est pas « esta »).
export function trouerExemple(ex, v, d) {
  if (!ex) return null;
  for (let p = 0; p < 6; p++) {
    const f = conjuguer(v, p, d);
    const premier = f.split(" ").pop();
    if (PIEGES.has(premier)) continue;
    const re = new RegExp(`(^|[^\\p{L}])(${f.replace(/ /g, "\\s+")})(?![\\p{L}])`, "iu");
    const t = ex.match(re);
    if (!t) continue;
    const debut = t.index + t[1].length;
    const avant = ex.slice(0, debut);
    const motAvant = (avant.match(/(\p{L}+)\s*$/u) || [])[1]?.toLowerCase();
    if (motAvant && ARTICLES.has(motAvant)) continue;
    // « Se cortan las patatas » : le se qui dit « on », pas un verbe en -se. Trop déroutant : on laisse.
    if (motAvant === "se" && !v.endsWith("se")) continue;
    return { avant, apres: ex.slice(debut + t[2].length), p, es: f, trouve: t[2] };
  }
  return null;
}

export function phrasesDe(ctx, x) {
  const exemples = x.cartes.map(m => trouerExemple(m.ex, x.v, x.d)).filter(Boolean).map(t => ({ ...t, source: "exemple" }));
  const toutes = [...exemples, ...phrasesExercices(ctx, x)];
  // Pas deux fois la même phrase.
  const vues = new Set();
  return toutes.filter(ph => { const k = normaliser(ph.avant + ph.es + ph.apres); if (vues.has(k)) return false; vues.add(k); return true; });
}

// La phrase d'exemple sous le tableau à dire : une phrase entière, la forme en gras.
export function exempleDe(ctx, x) {
  const ph = phrasesDe(ctx, x)[0];
  if (!ph) return "";
  const forme = ph.trouve || ph.es;
  const avant = ph.avant, debut = !avant.trim();
  return `${avant}**${debut ? forme[0].toUpperCase() + forme.slice(1) : forme}**${ph.apres}`;
}

// ── Le tirage d'une série ──
const melanger = t => {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
const auHasard = t => t[Math.floor(Math.random() * t.length)];

// Une question :
//   forme   : { type: "forme", v, p, es: [la forme] }            « venir · tú » → vienes
//   phrase  : { type: "phrase", v, p, avant, apres, es: [..] }    « Los viernes ___ a cenar. (salir) »
//   envers  : { type: "envers", v, p, forme, choix: [{ v, p }] }  « hago » → hacer · yo, parmi 4
//   tableau : { type: "tableau", v, formes, exemple }             le tableau à dire, pas noté
// options : { n: 10 questions en tout, tableauEnPremier: le tableau d'abord (un seul verbe, depuis sa fiche), tableau: true/false }
export function tirerSerie(ctx, verbes, { n = 10, tableauEnPremier = false, tableau = true } = {}) {
  if (!verbes.length) return [];
  const notees = tableau ? n - 1 : n;
  const nbPhrases = 2, nbEnvers = 1;
  // Les paires (verbe, personne), mélangées, les verbes à tour de rôle : chaque verbe revient autant que possible.
  const paires = [];
  const parVerbe = melanger(verbes).map(x => ({ x, p: melanger([0, 1, 2, 3, 4, 5]) }));
  for (let tour = 0; paires.length < notees; tour++) {
    for (const { x, p } of parVerbe) if (paires.length < notees) paires.push({ x, p: p[tour % 6] });
  }
  // Quelques paires deviennent des phrases (si le verbe en a), une devient « à l'envers », le reste « trouve la forme ».
  const restes = melanger(paires.map((_, i) => i));
  const types = new Array(notees).fill("forme");
  let phrases = 0;
  const phrasesDispo = new Map(verbes.map(x => [x.v, melanger(phrasesDe(ctx, x))]));
  const questions = paires.map(({ x, p }) => ({ type: "forme", temps: "present", v: x.v, d: x.d, p, sens: sensDe(x), es: [conjuguer(x.v, p, x.d)] }));
  for (const i of restes) {
    if (phrases >= nbPhrases) break;
    const ph = phrasesDispo.get(questions[i].v)?.shift();
    if (!ph) continue;
    questions[i] = { ...questions[i], type: "phrase", p: ph.p, avant: ph.avant, apres: ph.apres, es: [ph.es] };
    types[i] = "phrase"; phrases++;
  }
  const libres = restes.filter(i => types[i] === "forme").slice(0, nbEnvers);
  for (const i of libres) questions[i] = questionEnvers(verbes, questions[i]);
  // Le tableau à dire : en premier (depuis une fiche), sinon vers la fin, sur un verbe de la série (un irrégulier si possible).
  if (tableau) {
    const x = tableauEnPremier ? verbes[0] : auHasard(verbes.filter(y => y.irr).length ? verbes.filter(y => y.irr) : verbes);
    const t = { type: "tableau", temps: "present", v: x.v, d: x.d, sens: sensDe(x), formes: sixFormes(x.v, x.d), exemple: exempleDe(ctx, x) };
    const place = tableauEnPremier ? 0 : Math.min(questions.length, 6 + Math.floor(Math.random() * 3));
    questions.splice(place, 0, t);
  }
  return questions;
}

// « À l'envers » : la forme, et 4 choix « verbe · personne ». Les mauvais choix : le même verbe à d'autres personnes,
// et un autre verbe de la série à la même personne (s'il y en a un). Jamais un choix qui donnerait la même forme.
export function questionEnvers(verbes, q) {
  const forme = conjuguer(q.v, q.p, q.d);
  const bon = { v: q.v, p: q.p };
  const d = new Map(verbes.map(x => [x.v, x.d]));
  const autres = melanger(verbes.filter(x => x.v !== q.v)).slice(0, 1).map(x => ({ v: x.v, p: q.p }));
  const memeVerbe = melanger([0, 1, 2, 3, 4, 5].filter(p => p !== q.p)).map(p => ({ v: q.v, p }));
  const choix = [bon];
  for (const c of [...autres, ...memeVerbe]) {
    if (choix.length >= 4) break;
    if (conjuguer(c.v, c.p, d.get(c.v)) === forme) continue;
    choix.push(c);
  }
  return { type: "envers", temps: "present", v: q.v, d: q.d, p: q.p, forme, choix: melanger(choix) };
}

export const libelle = c => `${c.v} · ${PERSONNES[c.p]}`;
export { PERSONNES, irregulierConnu };
