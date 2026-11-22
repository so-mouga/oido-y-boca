// Ce que l'appli garde sur le téléphone : la mémoire des mots (révision espacée),
// les cases cochées du jour et le niveau d'écoute. Le Sheet n'est jamais modifié.

const CLE = "oyb.v2";
const INTERVALLES = [0, 1, 3, 7, 14, 30, 60]; // jours avant de revoir un mot, selon sa boîte
const PLAFOND_REVISION = 2;                   // leçons à réviser par jour, au plus

let etat = lire();

function lire() {
  try { return { mots: {}, jours: {}, ecoute: 0, ...JSON.parse(localStorage.getItem(CLE) || "{}") }; }
  catch { return { mots: {}, jours: {}, ecoute: 0 }; }
}
function ecrire() {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* stockage indisponible : l'appli marche quand même */ }
}

// Mode aperçu : rien n'est enregistré, pour ne pas mélanger un essai et la vraie progression.
let apercu = false;
export function modeApercu(oui) {
  apercu = oui;
  if (oui) etat = { mots: {}, jours: {}, ecoute: 0 };
}
const sauver = () => { if (!apercu) ecrire(); };

const jours = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);

// note : 1 = Non, 2 = Avec peine, 3 = Oui
export function noterMot(idMot, note, aujourdhui) {
  const f = etat.mots[idMot] || { boite: 0, vu: null };
  f.boite = note === 3 ? Math.min(f.boite + 1, INTERVALLES.length - 1) : note === 1 ? 0 : f.boite;
  f.vu = aujourdhui;
  etat.mots[idMot] = f;
  sauver();
}

// Un mot est « à revoir » s'il n'a jamais été travaillé ici, ou si son intervalle est passé.
export function aRevoir(idMot, aujourdhui) {
  const f = etat.mots[idMot];
  if (!f || !f.vu) return true;
  return jours(f.vu, aujourdhui) >= INTERVALLES[f.boite];
}

// Les leçons à réviser aujourd'hui : parmi les leçons faites (sauf la dernière, fraîche du matin),
// celles qui ont le plus de mots à revoir. Au plus 2.
export function leconsARevoir(idsFaites, derniereId, motsParLecon, aujourdhui) {
  return idsFaites
    .filter(id => id !== derniereId)
    .map(id => ({ id, du: (motsParLecon[id] || []).filter(m => aRevoir(m.id, aujourdhui)).length }))
    .filter(x => x.du > 0)
    .sort((a, b) => b.du - a.du)
    .slice(0, PLAFOND_REVISION)
    .map(x => x.id);
}

// Les cases du jour (révision, écoute, soir). La case « prof » vient de « Suivi », pas d'ici.
export function cases(aujourdhui) { return etat.jours[aujourdhui] || {}; }
export function cocher(aujourdhui, cle, valeur = true) {
  etat.jours[aujourdhui] = { ...cases(aujourdhui), [cle]: valeur };
  sauver();
}

export function niveauEcoute() { return etat.ecoute; }
export function monterEcoute(max) { etat.ecoute = Math.min(etat.ecoute + 1, max); sauver(); }

// Sauvegarde dans un fichier, à la demande.
export function exporter() { return JSON.stringify(etat, null, 1); }
