// « Mes mots en cours » (chantier 19) : le moteur, sans écran. Une seule liste pour tous les mots, verbes compris,
// et une séance de 10 questions pour RETROUVER le mot soi-même (Q74 à Q78, Q19-1 à Q19-7).
//
// La liste est rangée là où étaient « Mes verbes en cours » (progression.js, etat.verbes) : les anciennes sauvegardes
// restent bonnes, et les verbes déjà en cours y sont tout seuls. Une clé est :
//   - l'infinitif d'un verbe que l'appli sait conjuguer (« casarse », « buscar ») — comme avant ;
//   - sinon l'id du mot dans le Sheet (« U1-L3|el pueblo ») ou de « Mes mots ».
// Les séries justes (« Tu le sais ? ») et la date de la dernière séance gardent la même clé.
//
// La séance ne touche pas « Tes mots à revoir » (Q77).

import { corriger } from "./corriger.js?v=75";
import { trouDe, phrasesDe, cleCarte } from "./cartes.js?v=75";
import { verbeDe, sorteDe, motVu, motsAMoi, normaliser } from "./dico.js?v=75";
import { trouverVerbe, phrasesDe as phrasesDuVerbe, exempleDe, sensDe, tempsVus } from "./verbes.js?v=75";
import { conjuguer, sixFormes } from "./controles.js?v=75";
import { verbesEnCours, derniereSerie, mettreEnCours, prendreCarte, apprendreEnAvance } from "./progression.js?v=75";

export const MOTS_PAR_SEANCE = 5;
export const QUESTIONS = 10;

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

// Mettre un mot en cours (la fiche, la bulle, « Tu bloques ») : il entre dans la liste, ses phrases 3 et 4 entrent
// dans « Tes mots à revoir » comme avec « + Apprendre » (Q77), et s'il n'est pas encore vu, sa carte 1 aussi (Q19-7).
export function mettreMotEnCours(ctx, m, aujourdhui) {
  mettreEnCours(cleDe(ctx, m), aujourdhui);
  if (m.moi) return;
  phrasesDe(m).forEach((_, i) => prendreCarte(cleCarte(m.id, i + 3), aujourdhui));
  if (!motVu(ctx, m)) apprendreEnAvance(m.id, aujourdhui);
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
//   sens    : { type, cle, es, choix: [4 sens], bon }               choisir le sens parmi 4 (1 par séance)
// Questions de conjugaison (un verbe, Q19-5), mêmes formes que l'entraînement des verbes :
//   conj-forme  : { type, cle, v, d, p, sens, es: [forme] }
//   conj-phrase : { type, cle, v, d, p, avant, apres, es: [forme] }
//   tableau     : { type, cle, v, d, sens, formes, exemple }        pas noté
// Chaque question porte « premiere: true » si c'est celle par laquelle le mot doit commencer (le retrouver à froid).

const melanger = (t, h) => { const r = [...t]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(h() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

// Les questions possibles d'un mot, dans l'ordre où on les prend. Au-delà, on recommence (un seul mot = 10 questions sur lui).
function questionsDuMot(item) {
  const { m, cle } = item;
  const es = reponsesDe(item.es);
  const nom = aUnArticle(item.es);
  const dire = es[0];
  const ellipse = /…/.test(item.es);
  const fres = { type: "fres", cle, fr: sansParentheses(item.fr), es, dire, nom };
  const ecoute = ellipse ? null : { type: "ecoute", cle, dire, es, nom };
  const t = m && !m.moi ? trouDe(m) : null;
  const trou = t ? (() => { const [avant, apres] = t.phrase.split("___"); return { type: "trou", cle, avant, apres, es: [t.reponse], aide: sansParentheses(item.fr) }; })() : null;
  const ph = m && !m.moi ? phrasesDe(m).map((p, i) => ({ type: "phrase", cle, fr: p.fr, es: p.es, aide: p.aide || "", n: i + 3 })) : [];
  const ordre = [fres, ph[0], ecoute, trou, ph[1], ...ph.slice(2)].filter(Boolean);
  const encore = [fres, ecoute, trou, ...ph].filter(Boolean);
  return { ordre, encore };
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

// Les 3 mauvais sens : d'abord les autres mots de la séance (pueblo / barrio : la confusion qu'on travaille),
// puis des mots vus de la même sorte. Jamais deux fois le même sens.
function questionSens(ctx, item, items, h) {
  const bon = sansParentheses(item.fr);
  const vus = new Set([normaliser(bon)]);
  const choix = [bon];
  const prendre = fr => { const f = sansParentheses(fr); const k = normaliser(f); if (!f || vus.has(k) || choix.length >= 4) return; vus.add(k); choix.push(f); };
  for (const o of melanger(items.filter(o => o.cle !== item.cle), h)) prendre(o.fr);
  const sorte = item.m ? sorteDe(item.m) : null;
  const memeSorte = ctx.mots.filter(m => motVu(ctx, m) && m.id !== item.m?.id && (!sorte || sorteDe(m) === sorte));
  for (const m of melanger(memeSorte, h)) prendre(m.fr);
  if (choix.length < 4) for (const m of melanger(ctx.mots.filter(m => motVu(ctx, m)), h)) prendre(m.fr);
  if (choix.length < 4) return null;
  return { type: "sens", cle: item.cle, es: item.es, choix: melanger(choix, h), bon };
}

// Une séance : 10 questions sur ces mots (déjà choisis : 5 au plus). Avec un verbe : 9 notées + son tableau à dire.
export function tirerSeance(ctx, items, { n = QUESTIONS, hasard = Math.random } = {}) {
  const h = hasard;
  if (!items.length) return [];
  const verbes = items.filter(i => i.x);
  const avecTableau = verbes.length > 0;
  const notees = avecTableau ? n - 1 : n;
  // 1. La conjugaison : 2 questions par verbe, pour 2 verbes au plus.
  const conj = melanger(verbes, h).slice(0, 2).flatMap(v => conjugaison(ctx, v, h)).slice(0, Math.max(0, notees - items.length - 1));
  // 2. « Choisir le sens » : une fois, sur un mot qui n'est pas un verbe si possible.
  let sens = null;
  for (const it of [...melanger(items.filter(i => !i.x), h), ...melanger(items.filter(i => i.x), h)]) { if ((sens = questionSens(ctx, it, items, h))) break; }
  // 3. Le reste : les mots à tour de rôle, chacun dans son ordre (le mot à froid d'abord).
  const reste = notees - conj.length - (sens ? 1 : 0);
  // Un verbe qui a déjà ses questions de conjugaison (et son tableau) ne prend qu'une question « mot » (le retrouver
  // depuis le français), tant que les autres mots peuvent remplir : sinon il prendrait la moitié de la séance.
  const aConj = new Set(conj.map(q => q.cle));
  const files = melanger(items, h).map(it => ({ it, ...questionsDuMot(it), k: 0, max: aConj.has(it.cle) && items.length > 1 ? 1 : Infinity }));
  const mot = [];
  for (let tour = 0; mot.length < reste && tour < 100; tour++) {
    const libres = files.filter(f => f.k < f.max);
    for (const f of libres.length ? libres : files) {
      if (mot.length >= reste) break;
      const q = f.k < f.ordre.length ? f.ordre[f.k] : f.encore[(f.k - f.ordre.length) % f.encore.length];
      if (!q) continue;
      mot.push({ ...q, premiere: f.k === 0 });
      f.k++;
    }
  }
  const questions = ordonner([...mot, ...conj, ...(sens ? [sens] : [])], h);
  // 4. Le tableau à dire, vers la fin (place 7 à 9), après la première question sur son verbe.
  if (avecTableau) {
    const it = verbes.find(v => v.x.irr) || verbes[0];
    const x = it.x;
    const tv = tempsVus(ctx), tt = tv[Math.floor(h() * tv.length)];
    const t = { type: "tableau", temps: tt, cle: it.cle, v: x.v, d: x.d, sens: sensDe(x), formes: sixFormes(x.v, x.d, tt), exemple: exempleDe(ctx, x, tt) };
    const premier = questions.findIndex(q => q.cle === it.cle);
    const voulue = Math.max(premier + 1, Math.min(questions.length, 6 + Math.floor(h() * 3)));
    // Une place où il n'est pas collé à une autre question du même verbe, si possible.
    const libre = p => questions[p - 1]?.cle !== it.cle && questions[p]?.cle !== it.cle;
    const places = Array.from({ length: questions.length + 1 }, (_, p) => p).filter(p => p > premier);
    const place = places.filter(libre).sort((a, b) => Math.abs(a - voulue) - Math.abs(b - voulue))[0] ?? voulue;
    questions.splice(place, 0, t);
  }
  return questions;
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

// Pour « Tu le sais ? » : chaque mot interrogé, tout juste ou non (le tableau à dire ne compte pas).
export function bilanParMot(resultats) {
  const par = {};
  for (const { q, ok } of resultats) par[q.cle] = (par[q.cle] ?? true) && ok;
  return par;
}
