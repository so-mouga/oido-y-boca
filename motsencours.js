// « Mes mots en cours » (chantier 19) : le moteur, sans écran. Une seule liste pour tous les mots, verbes compris,
// et une séance de 10 questions pour RETROUVER le mot soi-même (Q74 à Q78, Q19-1 à Q19-7).
//
// La liste est rangée là où étaient « Mes verbes en cours » (progression.js, etat.verbes) : les anciennes sauvegardes
// restent bonnes, et les verbes déjà en cours y sont tout seuls. Une clé est :
//   - l'infinitif d'un verbe que l'appli sait conjuguer (« casarse », « buscar ») — comme avant ;
//   - sinon l'id du mot dans le Sheet (« U1-L3|el pueblo ») ou de « Mes mots ».
// Les séries justes (« Tu le sais ? ») et la date de la dernière séance gardent la même clé.
//
// Étape 4 des décisions du 28 nov. (Q26-14 à Q26-22) : un mot entre tout seul (2 « Non » de suite à la carte 1, ou 3 « Non »
// en tout sur ses cartes) ; entrer ne change plus les cartes ; une séance = 3 questions par mot (10 au plus), sans « choisir
// le sens » ni tableau à dire. La séance ne touche pas « Tes mots à revoir » (Q77).

import { corriger } from "./corriger.js?v=85";
import { trouDe, phrasesDe } from "./cartes.js?v=85";
import { verbeDe, sorteDe, motVu, motsAMoi, normaliser } from "./dico.js?v=85";
import { trouverVerbe, phrasesDe as phrasesDuVerbe, sensDe, tempsVus } from "./verbes.js?v=85";
import { conjuguer } from "./controles.js?v=85";
import { verbesEnCours, derniereSerie, mettreEnCours, retirerDesCours, apprendreEnAvance, fichesCartes, difficile, marquerEntre, marquerSorti } from "./progression.js?v=85";

export const MOTS_PAR_SEANCE = 5;
export const QUESTIONS = 10; // au plus
export const PAR_MOT = 3;    // au plus, par mot (Q26-20)
// Le nombre de questions d'une séance : 1 mot = 3, 2 = 6, 3 = 9, 4 ou 5 = 10.
export const nbQuestions = nMots => Math.min(QUESTIONS, PAR_MOT * Math.min(nMots, MOTS_PAR_SEANCE));

// ── La liste ──
const sansParentheses = es => (es || "").replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
// Le mot est-il le verbe seul (« casarse », « comer (= déjeuner) ») ? « tener prisa » ou « tener … años » restent des mots.
const verbeSeul = m => {
  if (!m || m.moi) return null;
  const vb = verbeDe(m);
  if (!vb?.formes || vb.gustar) return null;
  return normaliser(sansParentheses(m.es)) === normaliser(vb.v) ? vb : null;
};

// La clé d'un mot qu'on met en cours.
export function cleDe(ctx, m) {
  const vb = verbeSeul(m);
  return vb && trouverVerbe(ctx, vb.v) ? vb.v : m.id;
}

// Une clé → { cle, m (la carte du Sheet ou de Mes mots, ou null), x (le verbe de verbes.js, ou null), es, fr }.
export function resoudre(ctx, cle) {
  const m = ctx.mots.find(y => y.id === cle) || motsAMoi().find(y => y.id === cle);
  if (m) {
    const vb = verbeSeul(m);
    const x = vb ? trouverVerbe(ctx, vb.v) : null;
    return { cle, m, x, es: m.es, fr: m.fr };
  }
  const x = trouverVerbe(ctx, cle);
  if (x) return { cle, m: x.carte, x, es: x.carte?.es || x.v, fr: x.carte?.fr || x.fr || "" };
  return null; // un mot supprimé de Mes mots, ou retiré du Sheet
}

// « Mes mots en cours », dans l'ordre où je les ai ajoutés.
export const motsEnCours = ctx => verbesEnCours().map(c => resoudre(ctx, c)).filter(Boolean);
export const motEnCours = (ctx, m) => verbesEnCours().includes(cleDe(ctx, m));

// Mettre un mot en cours (la fiche, la bulle, ou tout seul) : il entre dans la liste. Ses cartes ne changent pas (Q26-14) :
// plus de phrases 3 et 4 prises en tête de la révision. Seul un mot pas encore vu fait entrer sa carte 1 (Q19-7).
export function mettreMotEnCours(ctx, m, aujourdhui) {
  mettreEnCours(cleDe(ctx, m), aujourdhui);
  marquerEntre(m.id);
  if (!m.moi && !motVu(ctx, m)) apprendreEnAvance(m.id, aujourdhui);
}

// Entrer tout seul (Q26-16) : 3 « Non » en tout sur ses cartes, ou 2 « Non » de suite à la carte 1 (sauf pour un mot
// sorti de la liste : lui ne revient que par 3 nouveaux « Non »). Renvoie "3", "2" ou null.
export function raisonDEntrer(m, fiches) {
  const d = difficile(m.id);
  if ((d.non || 0) >= 3) return "3";
  if (!d.sorti && (fiches[m.id]?.nons || 0) >= 2) return "2";
  return null;
}
// Après une note : le mot entre s'il le faut. Renvoie la raison ("2" ou "3") s'il vient d'entrer, sinon null.
export function entrerSiBloque(ctx, m, aujourdhui) {
  if (!m || motEnCours(ctx, m)) return null;
  const r = raisonDEntrer(m, fichesCartes());
  if (r) mettreMotEnCours(ctx, m, aujourdhui);
  return r;
}
// Au lancement (« Aujourd'hui ») : les mots déjà à 2 « Non » de suite avant cette version entrent aussi.
export function rattraperEntrees(ctx, mots) {
  const fiches = fichesCartes();
  for (const m of mots) if ((fiches[m.id]?.nons || 0) >= 2 || (difficile(m.id).non || 0) >= 3) entrerSiBloque(ctx, m, ctx.jour);
}
// Sortir (Q26-17) : « Je le sais » (retenu = la date) ou la croix (retenu = null). Le compteur repart de 0.
export function sortirDesCours(ctx, cle, retenu = null) {
  const it = resoudre(ctx, cle);
  retirerDesCours(cle);
  marquerSorti(it?.m?.id || cle, cle, retenu);
}

// Les 5 mots d'une séance : jamais travaillés d'abord (souvent tout juste ajoutés), puis les plus anciens.
export const motsDeLaSeance = items => [...items].sort((a, b) => derniereSerie(a.cle).localeCompare(derniereSerie(b.cle))).slice(0, MOTS_PAR_SEANCE);

// ── Les réponses ──
const ARTICLE = /^(el|la|los|las)\s+/i;
const sansArticle = t => t.trim().replace(ARTICLE, "");
// « el hermano / la hermana » → les deux, chacun seul ou ensemble ; « comer (= déjeuner) » → comer ; « tener … años » → tener años.
export function reponsesDe(es) {
  const t = sansParentheses(es).replace(/…/g, " ").replace(/\s+/g, " ").trim();
  const parts = t.split("/").map(x => x.trim()).filter(Boolean);
  return [...new Set([parts.join(" / "), ...parts])];
}
const aUnArticle = es => reponsesDe(es).some(r => ARTICLE.test(r));

// ── Les questions ──
// Questions sur le mot :
//   fres    : { type, cle, fr, es: [réponses], dire, nom }         « le village » → el pueblo (la plus fréquente)
//   ecoute  : { type, cle, dire, es, nom }                          la voix dit « el pueblo », on l'écrit
//   trou    : { type, cle, avant, apres, es: [réponse], aide }      l'exemple du Sheet, le mot caché
//   phrase  : { type, cle, fr, es: [réponses], aide, n }            la phrase 3 ou 4 (n = 3, 4), à traduire
// Questions de conjugaison (un verbe, Q19-5), mêmes formes que l'entraînement des verbes :
//   conj-forme  : { type, cle, v, d, p, sens, es: [forme] }
//   conj-phrase : { type, cle, v, d, p, avant, apres, es: [forme] }
// Chaque question porte « premiere: true » si c'est celle par laquelle le mot doit commencer (le retrouver à froid).

const melanger = (t, h) => { const r = [...t]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(h() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// Les 3 questions d'un mot (Q26-18, Q26-19), dans l'ordre :
//   un mot : 1. du français (à froid) ; 2. la phrase à trou, sinon à l'oreille ; 3. à tour de rôle d'une séance à l'autre
//            (tour) : à l'oreille ou une phrase 3 ou 4 à traduire ;
//   un verbe : 1. du français ; 2 et 3. deux conjugaisons (une dans une phrase, une « trouve la forme »), sans tableau à dire.
function questionsDuMot(ctx, item, h, tour) {
  const { m, cle } = item;
  const es = reponsesDe(item.es);
  const nom = aUnArticle(item.es);
  const dire = es[0];
  const ellipse = /…/.test(item.es);
  const fres = { type: "fres", cle, fr: sansParentheses(item.fr), es, dire, nom };
  if (item.x) return [fres, ...conjugaison(ctx, item, h)].slice(0, PAR_MOT);
  const ecoute = ellipse ? null : { type: "ecoute", cle, dire, es, nom };
  const t = m && !m.moi ? trouDe(m) : null;
  const trou = t ? (() => { const [avant, apres] = t.phrase.split("___"); return { type: "trou", cle, avant, apres, es: [t.reponse], aide: sansParentheses(item.fr) }; })() : null;
  const ph = m && !m.moi ? phrasesDe(m).map((p, i) => ({ type: "phrase", cle, fr: p.fr, es: p.es, aide: p.aide || "", n: i + 3 })) : [];
  const deuxieme = trou || ecoute;
  const autres = [deuxieme === trou ? ecoute : null, ...ph].filter(Boolean);
  const troisieme = autres.length ? autres[tour % autres.length] : null;
  return [fres, deuxieme, troisieme].filter(Boolean);
}

// 2 questions de conjugaison pour un verbe, aux temps vus (comme l'entraînement des verbes, chantier 16) :
// une dans une phrase (s'il en a une à ce temps), une « trouve la forme », à 2 personnes différentes.
function conjugaison(ctx, item, h) {
  const x = item.x;
  const temps = tempsVus(ctx);
  const qs = [];
  const t1 = temps[Math.floor(h() * temps.length)];
  const phrases = melanger(phrasesDuVerbe(ctx, x, t1), h);
  if (phrases.length) {
    const p = phrases[0];
    qs.push({ type: "conj-phrase", temps: t1, cle: item.cle, v: x.v, d: x.d, p: p.p, avant: p.avant, apres: p.apres, es: [p.es] });
  }
  for (const p of melanger([0, 1, 2, 3, 4, 5], h)) {
    if (qs.length >= 2) break;
    if (qs.some(q => q.p === p)) continue;
    const t = temps[Math.floor(h() * temps.length)];
    qs.push({ type: "conj-forme", temps: t, cle: item.cle, v: x.v, d: x.d, p, sens: sensDe(x), es: [conjuguer(x.v, p, x.d, t)] });
  }
  return qs;
}

// Une séance sur ces mots (déjà choisis : 5 au plus, les plus anciens d'abord) : 3 questions par mot, 10 au plus.
// Quand il y en a moins que 3 × le nombre de mots, les premiers mots (les moins travaillés) gardent leurs 3 questions.
// tour : fait tourner la 3e question d'un jour à l'autre (par défaut, le numéro du jour).
export function tirerSeance(ctx, items, { hasard = Math.random, tour = Math.floor(Date.now() / 86400000) } = {}) {
  const h = hasard;
  if (!items.length) return [];
  const n = nbQuestions(items.length);
  const listes = items.map(it => questionsDuMot(ctx, it, h, tour).map((q, k) => ({ ...q, premiere: k === 0 })));
  const prises = [];
  for (let k = 0; k < PAR_MOT && prises.length < n; k++) {
    for (const l of listes) { if (prises.length >= n) break; if (l[k]) prises.push(l[k]); }
  }
  return ordonner(prises, h);
}

// L'ordre : mélangé, mais un mot commence toujours par sa « première » question (le retrouver à froid, sans l'avoir vu
// ni entendu dans la séance) ; « choisir le sens » et la conjugaison (qui montrent le mot) viennent après ;
// jamais le même mot deux fois de suite, tant que c'est possible.
export function ordonner(qs, h = Math.random) {
  const reste = melanger(qs, h);
  const commence = new Set();
  const aUnePremiere = new Set(qs.filter(q => q.premiere).map(q => q.cle));
  const permis = q => commence.has(q.cle) || q.premiere || !aUnePremiere.has(q.cle);
  const suite = [];
  // Le mot à qui il reste le plus de questions passe d'abord (sinon elles s'empilent à la fin).
  const combien = cle => reste.filter(q => q.cle === cle).length;
  while (reste.length) {
    const avant = suite[suite.length - 1]?.cle, sorteAvant = suite[suite.length - 1]?.type;
    // Pas le même mot deux fois de suite, ni (si possible) la même sorte de question.
    const permises = reste.map((q, i) => i).filter(i => permis(reste[i]));
    const autreMot = permises.filter(i => reste[i].cle !== avant);
    const tous = autreMot.length ? autreMot : permises;
    const varies = tous.filter(i => reste[i].type !== sorteAvant);
    const candidats = varies.length ? varies : tous;
    let i;
    if (candidats.length) {
      // Puis la sorte de question qui reste le plus (sinon trois « traduis » finissent la séance).
      const poids = i => combien(reste[i].cle) * 100 + reste.filter(q => q.type === reste[i].type).length;
      const plus = Math.max(...candidats.map(poids));
      i = candidats.find(i => poids(i) === plus);
    } else {
      i = reste.findIndex(q => permis(q) && q.type !== sorteAvant);
      if (i < 0) i = reste.findIndex(permis);
      if (i < 0) i = 0;
    }
    const [q] = reste.splice(i, 1);
    commence.add(q.cle);
    suite.push(q);
  }
  return suite;
}

// ── La correction (Q19-4) ──
// Comme partout : la casse et la ponctuation ne comptent pas, un accent oublié compte juste avec un rappel.
// En plus, pour un mot avec son article (fres, ecoute) :
//   - l'article oublié (« pueblo ») : juste, avec le rappel « avec son article » ;
//   - le mauvais article (« la barrio ») : faux, « barrio est masculin » ;
//   - un autre mot de la séance (« el pueblo » pour « le quartier ») : faux, et on le dit.
// Renvoie le résultat de corriger(), plus { ok, article, genre, confondu }.
const masculin = r => /^(el|los)\s/i.test(r);
export function corrigerMot(q, tape, items = []) {
  const r = corriger(tape, q.es);
  const ok = r.niveau === "juste" || r.niveau === "accents";
  if (ok) return { ...r, ok };
  if ((q.type === "fres" || q.type === "ecoute") && q.nom) {
    const avec = q.es.filter(e => ARTICLE.test(e) && !e.includes("/"));
    const nus = avec.map(sansArticle);
    const r2 = corriger(tape, nus);
    if (r2.niveau === "juste" || r2.niveau === "accents") {
      const i = nus.findIndex(x => ["juste", "accents"].includes(corriger(tape, [x]).niveau));
      return { ...r2, ok: true, article: avec[Math.max(0, i)] };
    }
    if (ARTICLE.test(tape.trim())) {
      const r3 = corriger(sansArticle(tape), nus);
      if (r3.niveau === "juste" || r3.niveau === "accents") {
        const i = nus.findIndex(x => normaliser(x) === normaliser(sansArticle(tape)));
        const bon = avec[Math.max(0, i)];
        return { ...r, ok: false, genre: { mot: sansArticle(bon), masculin: masculin(bon), bon } };
      }
    }
  }
  if (q.type === "fres" || q.type === "ecoute" || q.type === "trou") {
    for (const o of items) {
      if (o.cle === q.cle) continue;
      const rs = reponsesDe(o.es);
      const nus = rs.map(sansArticle);
      if ([corriger(tape, rs), corriger(sansArticle(tape), nus)].some(x => x.niveau === "juste" || x.niveau === "accents")) {
        return { ...r, ok: false, confondu: { es: o.es, fr: sansParentheses(o.fr) } };
      }
    }
  }
  return { ...r, ok: false };
}

// Le choix de « choisir le sens ».
export const sensJuste = (q, k) => q.choix[k] === q.bon;

// Pour « Tu le sais ? » : chaque mot interrogé, tout juste ou non. Une réponse trouvée avec un indice n'est pas « tout juste ».
export function bilanParMot(resultats) {
  const par = {};
  for (const { q, ok, aide } of resultats) par[q.cle] = (par[q.cle] ?? true) && ok && !aide;
  return par;
}
