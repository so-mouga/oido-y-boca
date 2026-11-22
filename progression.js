// Ce que l'appli garde sur le téléphone : la mémoire des mots (révision espacée),
// les cases cochées du jour, le niveau d'écoute, et pour chaque contrôle blanc le dernier résultat
// de la partie écrite et le texte de ma présentation. Le Sheet n'est jamais modifié.

const CLE = "oyb.v2";
const INTERVALLES = [0, 1, 3, 7, 14, 30, 60]; // jours avant de revoir un mot, selon sa boîte
const PLAFOND_REVISION = 2;                   // leçons à réviser par jour, au plus

const VIDE = () => ({ mots: {}, jours: {}, ecoute: 0, controles: {}, presentations: {} });
let etat = lire();

function lire() {
  try { return { ...VIDE(), ...JSON.parse(localStorage.getItem(CLE) || "{}") }; }
  catch { return VIDE(); }
}
function ecrire() {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* stockage indisponible : l'appli marche quand même */ }
}

// Mode aperçu : rien n'est enregistré, pour ne pas mélanger un essai et la vraie progression.
let apercu = false;
export function modeApercu(oui) {
  apercu = oui;
  if (oui) etat = VIDE();
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
// Une case cochée un autre jour de la même semaine (du lundi au dimanche) que « aujourdhui » ?
export function cocheCetteSemaine(aujourdhui, cle) {
  const d = new Date(aujourdhui + "T12:00:00");
  const lundi = new Date(d); lundi.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const j = new Date(lundi); j.setDate(lundi.getDate() + i);
    const iso = `${j.getFullYear()}-${String(j.getMonth() + 1).padStart(2, "0")}-${String(j.getDate()).padStart(2, "0")}`;
    if (iso !== aujourdhui && etat.jours[iso]?.[cle]) return true;
  }
  return false;
}

export function cocher(aujourdhui, cle, valeur = true) {
  etat.jours[aujourdhui] = { ...cases(aujourdhui), [cle]: valeur };
  sauver();
}

export function niveauEcoute() { return etat.ecoute; }
export function monterEcoute(max) { etat.ecoute = Math.min(etat.ecoute + 1, max); sauver(); }

// Contrôle blanc : le dernier résultat de la partie écrite ({ le, score }), et le texte de ma présentation.
// Seulement sur le téléphone : c'est le prof qui note le vrai contrôle.
export function resultatControle(idUnite) { return etat.controles[idUnite] || null; }
export function noterControle(idUnite, aujourdhui, score) {
  etat.controles = { ...etat.controles, [idUnite]: { le: aujourdhui, score } };
  sauver();
}
export function textePresentation(idUnite) { return etat.presentations[idUnite] || ""; }
export function garderPresentation(idUnite, texte) {
  etat.presentations = { ...etat.presentations, [idUnite]: texte };
  sauver();
}

// Sauvegarde dans un fichier, à la demande. Le fichier porte sa date pour qu'on la montre avant de restaurer.
const CLE_SAUVEGARDE = "oyb.sauvegarde"; // la date de la dernière sauvegarde, pour le rappeler à l'écran
export function exporter(aujourdhui) {
  if (!apercu) try { localStorage.setItem(CLE_SAUVEGARDE, aujourdhui); } catch { /* sans importance */ }
  return JSON.stringify({ appli: "oido-y-boca", le: aujourdhui, ...etat }, null, 1);
}
export function derniereSauvegarde() {
  try { return localStorage.getItem(CLE_SAUVEGARDE) || ""; } catch { return ""; }
}

// Lit un fichier de sauvegarde. Renvoie { le, etat } ou lève une erreur si ce n'en est pas un.
export function lireSauvegarde(texte) {
  let d;
  try { d = JSON.parse(texte); } catch { throw new Error("ce fichier n'est pas une sauvegarde de l'appli"); }
  const objet = v => v && typeof v === "object" && !Array.isArray(v);
  if (!objet(d) || !objet(d.mots) || !objet(d.jours) || typeof d.ecoute !== "number") {
    throw new Error("ce fichier n'est pas une sauvegarde de l'appli");
  }
  return { le: d.le || "", etat: { ...VIDE(), mots: d.mots, jours: d.jours, ecoute: d.ecoute,
    ...(objet(d.controles) && { controles: d.controles }), ...(objet(d.presentations) && { presentations: d.presentations }) } };
}

// Remplace toute la progression par celle d'une sauvegarde (en aperçu : seulement à l'écran).
export function restaurer(sauvegarde) {
  etat = { ...sauvegarde.etat };
  sauver();
}
