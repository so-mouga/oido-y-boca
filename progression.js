// Ce que l'appli garde sur le téléphone : la mémoire des mots (révision espacée),
// les cases cochées du jour, le niveau d'écoute, et pour chaque contrôle blanc le dernier résultat
// de la partie écrite et le texte de ma présentation, « Mes mots » (ceux que j'ajoute moi-même), et mes verbes en cours.
// Le Sheet n'est jamais modifié.

const CLE = "oyb.v2";
const INTERVALLES = [0, 1, 3, 7, 14, 30, 60]; // jours avant de revoir un mot, selon sa boîte

const VIDE = () => ({ mots: {}, jours: {}, ecoute: 0, controles: {}, presentations: {}, mesMots: [], avance: {}, verbes: { cours: {}, justes: {} }, lectures: {} });
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

// Les mots à revoir aujourd'hui, du plus en retard au moins en retard : ceux dont l'intervalle est passé.
// Un mot jamais travaillé ici compte depuis le jour de sa leçon, ou de son ajout pour mes mots (depart(m)). Un mot déjà vu aujourd'hui,
// même raté, attend demain : sinon « il te reste N mots » ne finirait jamais.
export function motsARevoir(mots, aujourdhui, depart) {
  return mots.map(m => {
    const f = etat.mots[m.id];
    if (f?.vu === aujourdhui) return null;
    const retard = jours(f?.vu || depart(m) || aujourdhui, aujourdhui) - INTERVALLES[f?.boite ?? 0];
    return retard >= 0 ? { m, retard } : null;
  }).filter(Boolean).sort((a, b) => b.retard - a.retard).map(x => x.m);
}

// Pour la fiche du Dico : dans combien de jours le mot revient dans « Tes mots à revoir » (0 = aujourd'hui),
// avec les mêmes règles que motsARevoir. null si le mot n'a jamais été revu.
export function etatRevision(idMot, aujourdhui) {
  const f = etat.mots[idMot];
  if (!f?.vu) return null;
  const dans = INTERVALLES[f.boite] - jours(f.vu, aujourdhui);
  return { dans: f.vu === aujourdhui ? Math.max(dans, 1) : Math.max(dans, 0) };
}

// Les cases du jour : écoute, soir, « revision » (le nombre de mots revus), « exos:ID » ({ ok, sur }). La case « prof » vient de « Suivi », pas d'ici.
export function cases(aujourdhui) { return etat.jours[aujourdhui] || {}; }
export function cocher(aujourdhui, cle, valeur = true) {
  etat.jours[aujourdhui] = { ...cases(aujourdhui), [cle]: valeur };
  sauver();
}

// La dernière fois qu'une case a été cochée avant « aujourdhui » (date ISO), ou "" si jamais.
export function dernierJourCoche(aujourdhui, cle) {
  return Object.keys(etat.jours).filter(j => j < aujourdhui && etat.jours[j]?.[cle]).sort().pop() || "";
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

// « Mes mots » : les mots que j'ajoute moi-même (entendus à l'écoute, ou donnés par le prof).
// { id, es, fr, ex (phrase d'exemple, facultative), le (date d'ajout), via: "ecoute" | "dico" }. L'id ne change jamais : corriger un mot garde sa révision.
// Ils entrent dans « Tes mots à revoir » comme les mots du livre, à partir du lendemain.
export const mesMots = () => etat.mesMots;
export const monMot = idMot => etat.mesMots.find(m => m.id === idMot) || null;
export function ajouterMonMot(es, fr, ex, aujourdhui, via) {
  const m = { id: `moi-${Date.now()}`, es, fr, ...(ex && { ex }), le: aujourdhui, via };
  etat.mesMots = [...etat.mesMots, m];
  sauver();
  return m;
}
export function modifierMonMot(idMot, es, fr, ex) {
  etat.mesMots = etat.mesMots.map(m => m.id === idMot ? { ...m, es, fr, ex } : m);
  sauver();
}
export function supprimerMonMot(idMot) {
  etat.mesMots = etat.mesMots.filter(m => m.id !== idMot);
  const { [idMot]: _, ...reste } = etat.mots;
  etat.mots = reste;
  sauver();
}

// Les mots du livre appris en avance (« L'apprendre maintenant ») : { id du mot: date }. C'est la carte du livre
// elle-même qui entre dans « Tes mots à revoir », dès le lendemain ; quand sa leçon arrive, elle garde sa révision.
export const apprisEnAvance = idMot => etat.avance[idMot] || "";
export function apprendreEnAvance(idMot, aujourdhui) {
  if (etat.avance[idMot]) return;
  etat.avance = { ...etat.avance, [idMot]: aujourdhui };
  sauver();
}

// « Mes verbes en cours » : les verbes que je travaille en ce moment ({ verbe: date d'ajout }), choisis par moi
// (« Je l'apprends » sur la fiche, « + » dans « À apprendre ensuite », « M'entraîner sur ce verbe » en touchant un verbe).
// Sans limite (Q10-16) : une série en prend 5, ceux travaillés il y a le plus longtemps d'abord (« derniere » : { verbe: date }). « justes » : pour chaque verbe, le nombre de séries
// de suite où toutes ses questions étaient justes ; à 2, la fin de série propose « Tu le sais ? ». Le verbe est l'infinitif, avec -se.
const verbes = () => etat.verbes || (etat.verbes = { cours: {}, justes: {} });
export const verbesEnCours = () => Object.keys(verbes().cours);
export const verbeEnCours = v => !!verbes().cours[v];
export function mettreEnCours(v, aujourdhui) {
  if (verbeEnCours(v)) return;
  etat.verbes = { ...verbes(), cours: { ...verbes().cours, [v]: aujourdhui } };
  sauver();
}
export function retirerDesCours(v) {
  const { [v]: _, ...cours } = verbes().cours;
  const { [v]: __, ...justes } = verbes().justes;
  etat.verbes = { ...verbes(), cours, justes };
  sauver();
}
export const seriesJustes = v => verbes().justes[v] || 0;
export const derniereSerie = v => (verbes().derniere || {})[v] || "";
// À la fin d'une série : pour chaque verbe interrogé, true = tout juste (on ajoute 1), false = une erreur (on repart de 0).
export function noterSerieVerbes(resultats, aujourdhui) {
  const justes = { ...verbes().justes }, derniere = { ...verbes().derniere };
  for (const [v, ok] of Object.entries(resultats)) { justes[v] = ok ? (justes[v] || 0) + 1 : 0; if (aujourdhui) derniere[v] = aujourdhui; }
  etat.verbes = { ...verbes(), justes, derniere };
  sauver();
}

// Les lectures : pour chaque texte lu, le dernier résultat aux questions ({ id du texte: { le, score, sur } }).
// Un texte est « lu » dès qu'il a un résultat. Serviront plus tard aux jeux (« Remets l'histoire dans l'ordre », « Vrai ou faux »).
export const resultatLecture = idTexte => (etat.lectures || {})[idTexte] || null;
export function noterLecture(idTexte, aujourdhui, score, sur) {
  etat.lectures = { ...(etat.lectures || {}), [idTexte]: { le: aujourdhui, score, sur } };
  sauver();
}

// Sauvegarde dans un fichier, à la demande. Le fichier porte sa date pour qu'on la montre avant de restaurer.
const CLE_SAUVEGARDE = "oyb.sauvegarde"; // la date de la dernière sauvegarde, pour le rappeler à l'écran
export function exporter(aujourdhui) {
  noterSauvegarde(aujourdhui);
  return donneesSauvegarde(aujourdhui);
}
// Les deux moitiés d'« exporter », pour la sauvegarde Google qui ne note la date qu'une fois l'envoi réussi.
export function donneesSauvegarde(aujourdhui) {
  return JSON.stringify({ appli: "oido-y-boca", le: aujourdhui, ...etat }, null, 1);
}
export function noterSauvegarde(aujourdhui) {
  if (!apercu) try { localStorage.setItem(CLE_SAUVEGARDE, aujourdhui); } catch { /* sans importance */ }
}
export const enApercu = () => apercu;
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
    ...(objet(d.controles) && { controles: d.controles }), ...(objet(d.presentations) && { presentations: d.presentations }),
    ...(Array.isArray(d.mesMots) && { mesMots: d.mesMots.filter(m => m && m.id && m.es) }),
    ...(objet(d.avance) && { avance: d.avance }),
    ...(objet(d.lectures) && { lectures: d.lectures }),
    ...(objet(d.verbes) && { verbes: { cours: objet(d.verbes.cours) ? d.verbes.cours : {}, justes: objet(d.verbes.justes) ? d.verbes.justes : {} } }) } };
}

// Remplace toute la progression par celle d'une sauvegarde (en aperçu : seulement à l'écran).
export function restaurer(sauvegarde) {
  etat = { ...sauvegarde.etat };
  sauver();
}
