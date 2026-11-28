// Chantier 24 : la correction des cartes qu'on écrit dans « Tes cartes à revoir » (APPLI.md, point 8 duodecies).
//   - la carte 1, « Dis-le à voix haute, puis écris-le » : ce que j'écris note (article compris) ;
//   - la carte 5, « à l'oreille » : la voix dit l'exemple du mot, je l'écris en entier.
// Rien ici ne touche l'écran ni la mémoire : ecrans/pratique.js note, outils/test-oreille.mjs vérifie.
// note : 3 = Oui, 2 = Avec peine, 1 = Non (comme les autres cartes). Avec un indice, Avec peine au mieux.

import { corriger, mots } from "./corriger.js?v=88";

// Les petits mots qu'on n'entend presque pas (« Petit mot oublié : a »).
export const PETITS = new Set(("a al de del en el la lo los las le les un una unos unas y e o u me te se nos os mi tu su mis tus sus "
  + "con por para que es no ya muy sin").split(" "));
const ARTICLES = /^(el|la|los|las|un|una|unos|unas)\s+/i;

// Carte 1 : les réponses acceptées pour un mot du tableau (Q24-17). « el cuñado / la cuñada » : une des deux suffit ;
// « sobre (= environ) » : la parenthèse ne s'écrit pas ; « tener … años » : le « … » s'écrit ou non (corriger l'ignore).
export function reponsesMot(es) {
  const sans = (es || "").replace(/\([^)]*\)/g, " ").replace(/\s{2,}/g, " ").trim();
  const formes = sans.split(/\s+\/\s+|\s*\/\s*/).map(x => x.trim()).filter(Boolean);
  return formes.length ? formes : [es || ""];
}

// Carte 1. Renvoie { niveau, note, attendu, ...corriger } ; niveau : "juste", "accents" (rappel), "article"
// (« Presque : l'article », Q24-15), "faux". Un mauvais article compte faux.
export function jugerMot(tape, es, { indice = false } = {}) {
  const reponses = reponsesMot(es);
  const r = corriger(tape, reponses);
  const plafond = n => indice ? Math.min(n, 2) : n;
  if (r.niveau === "juste" || r.niveau === "accents") return { ...r, note: plafond(3), reponses };
  // L'article oublié : ce que j'ai tapé est juste une fois l'article retiré de la bonne réponse.
  if (!ARTICLES.test(tape.trim())) {
    for (const rep of reponses) {
      if (!ARTICLES.test(rep)) continue;
      const nu = corriger(tape, [rep.replace(ARTICLES, "")]);
      if (nu.niveau === "juste" || nu.niveau === "accents") return { niveau: "article", attendu: rep, note: 2, reponses, accents: nu.niveau === "accents" };
    }
  }
  return { ...r, niveau: "faux", note: 1, reponses };
}

// Carte 5. phrase : l'exemple du mot ; motCarte : le mot caché de la phrase à trou (le mot tel qu'il est dans la phrase, « reunión »).
// Accents et ñ ne comptent pas (réglage du prof). Notation (Kevin, 27 nov.) : juste = Oui ; 1 petit mot raté ou une seule
// autre erreur = Avec peine ; 2 erreurs ou plus, ou le mot de la carte raté = Non.
// Renvoie { niveau, note, attendu, tape, reponse, petits (les petits mots oubliés), accents (les mots écrits sans leur accent),
// motRate, erreurs } ; niveau : "juste", "accents", "petit" (un petit mot), "presque" (une autre erreur), "mot" (le mot de la carte), "faux".
export function jugerOreille(tape, phrase, motCarte = "", { indice = false } = {}) {
  const r = corriger(tape, [phrase], { enye: false });
  const plafond = n => indice ? Math.min(n, 2) : n;
  const accents = motsSansAccent(tape, phrase);
  if (r.niveau === "juste" || r.niveau === "accents") return { ...r, niveau: r.niveau, note: plafond(3), accents, petits: [], erreurs: 0, motRate: false };
  const nus = morceaux => morceaux.filter(m => !m.juste).flatMap(m => mots(m.brut, true, true));
  const manquent = nus(r.reponse), enTrop = nus(r.tape);
  const erreurs = Math.max(manquent.length, enTrop.length);
  const duMot = new Set(mots(motCarte, true, true));
  const motRate = manquent.some(w => duMot.has(w));
  // Un petit mot oublié : il manque dans ce que j'ai écrit (je n'ai rien mis à sa place).
  const petits = manquent.filter(w => PETITS.has(w) && !duMot.has(w));
  const oubli = manquent.length > enTrop.length;
  const niveau = motRate ? "mot" : erreurs >= 2 ? "faux" : petits.length && oubli ? "petit" : "presque";
  const note = motRate || erreurs >= 2 ? 1 : plafond(2);
  return { ...r, niveau, note, accents, petits: oubli ? petits : [], erreurs, motRate };
}

// Les mots de la phrase justes à l'oreille mais écrits sans leur accent ou leur ñ (« Et l'accent : reunión »).
function motsSansAccent(tape, phrase) {
  const tapes = new Set(mots(tape, false));
  const nus = new Set(mots(tape, true, true));
  return [...new Set(mots(phrase, false).filter(w => w !== mots(w, true, true)[0] && !tapes.has(w) && nus.has(mots(w, true, true)[0])))];
}

// L'indice de la carte 5 (Q24-16), une étape par appui : le nombre de mots, le mot de la carte en français, les premières lettres.
export const nbMots = phrase => mots(phrase, true).length;
