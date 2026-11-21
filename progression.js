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

// Bloc 2 : une série simple. Les mots les moins travaillés d'abord, puis l'ordre du programme.
// (Les vraies dates de retour et les plafonds arrivent au bloc 4.)
export function serieSimple(sens, mots, taille = 10) {
  return mots
    .map((m, rang) => ({ m, rang, fois: fiche(sens, m).notes.length }))
    .sort((a, b) => a.fois - b.fois || a.rang - b.rang)
    .slice(0, taille)
    .map(x => x.m);
}
