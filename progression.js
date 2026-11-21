// Ta progression de révision, gardée sur le téléphone.
// Deux carnets séparés : « essai » (avant la première séance notée par le prof) et « reel ».
// Dès que le prof note une première séance, le carnet d'essai est effacé.

const CLE = mode => `oyb.progression.${mode}`;
let mode = "essai";
let carnet = {};

function lire(m) {
  try { const t = localStorage.getItem(CLE(m)); return t ? JSON.parse(t) : {}; } catch { return {}; }
}
function ecrire() {
  try { localStorage.setItem(CLE(mode), JSON.stringify(carnet)); } catch { /* stockage indisponible : la séance marche quand même */ }
}

export function ouvrirCarnet(essai) {
  mode = essai ? "essai" : "reel";
  if (!essai) { try { localStorage.removeItem(CLE("essai")); } catch { /* rien à effacer */ } }
  carnet = lire(mode);
}

// Une carte = un mot travaillé d'une façon : « o » pour Oreille, « b » pour Bouche.
export const idCarte = (sens, mot) => `${sens}:${mot.id}`;

// note : 1 = Non, 2 = À moitié / Avec peine, 3 = Oui
export function noter(sens, mot, note, quand = new Date()) {
  const id = idCarte(sens, mot);
  const fiche = carnet[id] || { notes: [] };
  fiche.notes.push({ d: quand.toISOString(), n: note });
  carnet[id] = fiche;
  ecrire();
}

export function fiche(sens, mot) { return carnet[idCarte(sens, mot)] || { notes: [] }; }

// Une série de cartes { sens, mot } en deux parties : d'abord toutes les cartes Oreille, puis toutes les Bouche.
// Un mot ne passe en Bouche qu'après au moins une écoute en Oreille (lors d'une série précédente).
// Au plus la moitié de cartes Bouche.
export function serieMixte(mots, taille = 10) {
  const entendus = mots.filter(m => fiche("o", m).notes.length > 0);
  const bouche = serieSimple("b", entendus, Math.floor(taille / 2));
  const oreille = serieSimple("o", mots, taille - bouche.length);
  return [...oreille.map(mot => ({ sens: "o", mot })), ...bouche.map(mot => ({ sens: "b", mot }))];
}

// Bloc 2 : une série simple. Les mots les moins travaillés d'abord, puis l'ordre du programme.
// (Les vraies dates de retour et les plafonds arrivent au bloc 4.)
export function serieSimple(sens, mots, taille = 10) {
  return mots
    .map((m, rang) => ({ m, rang, fois: fiche(sens, m).notes.length }))
    .sort((a, b) => a.fois - b.fois || a.rang - b.rang)
    .slice(0, taille)
    .map(x => x.m);
}
