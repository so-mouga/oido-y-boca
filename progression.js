// Ce que l'appli garde sur le téléphone : la mémoire des mots (révision espacée),
// les cases cochées du jour, le niveau d'écoute, et pour chaque contrôle blanc le dernier résultat
// de la partie écrite et le texte de ma présentation, « Mes mots » (ceux que j'ajoute moi-même), et mes verbes en cours.
// Le Sheet n'est jamais modifié.

const CLE = "oyb.v2";
export const INTERVALLES = [0, 1, 3, 7, 14, 30, 60]; // jours avant de revoir une carte, selon sa boîte

const VIDE = () => ({ mots: {}, jours: {}, ecoute: 0, controles: {}, presentations: {}, mesMots: [], avance: {}, verbes: { cours: {}, justes: {} }, lectures: {}, jeux: {}, erreurs: {}, difficiles: {} });
let etat = lire();

function lire() {
  try { return migrer({ ...VIDE(), ...JSON.parse(localStorage.getItem(CLE) || "{}") }); }
  catch { return VIDE(); }
}

// Décisions du 28 nov. (étape 3) : la carte 2 (la phrase à trou) sort des cartes. Une seule fois, à la lecture
// (au lancement, ou en restaurant une ancienne sauvegarde) : chaque fiche « id#2 » devient une carte 5 « id#o »
// en boîte 0, qui part du jour de la migration ; la fiche « #2 » est retirée. Une carte 5 qui existe déjà est gardée telle quelle (Q26-10).
// (Des fonctions déclarées, pas des « const » : lire() les appelle au chargement du module, avant ces lignes.)
function isoDuJour(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function migrerCartes2(mots, aujourdhui) {
  const cles = Object.keys(mots || {}).filter(k => k.endsWith("#2"));
  if (!cles.length) return mots;
  aujourdhui ||= isoDuJour();
  const neuf = { ...mots };
  for (const k of cles) {
    const o = `${k.slice(0, -2)}#o`;
    if (!neuf[o]) neuf[o] = { boite: 0, vu: null, dep: aujourdhui };
    delete neuf[k];
  }
  return neuf;
}
function migrer(e) {
  const mots = migrerCartes2(e.mots);
  if (mots === e.mots) return e;
  const neuf = { ...e, mots };
  try { localStorage.setItem(CLE, JSON.stringify(neuf)); } catch { /* stockage indisponible */ }
  return neuf;
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

// note : 1 = Non, 2 = Avec peine, 3 = Oui. idMot est la clé de la carte : l'id du mot pour la carte 1, « id#n » pour les autres (cartes.js).
// Étape 3 (décisions du 28 nov.) : la carte 1 réussie au rendez-vous des 3 jours (boîte 2 → 3) débloque la carte 5 « à l'oreille »
// (« id#o »), qui arrive le lendemain (une seule carte par mot et par jour) ; toutes les cartes partent de la boîte 0.
// « nons » compte les « Non » de suite à la carte 1 (à 2, la fin du paquet propose les phrases du mot).
export function noterMot(idMot, note, aujourdhui) {
  const f = etat.mots[idMot] || { boite: 0, vu: null };
  const avant = f.boite;
  f.boite = note === 3 ? Math.min(f.boite + 1, INTERVALLES.length - 1) : note === 1 ? 0 : f.boite;
  f.vu = aujourdhui;
  if (!idMot.includes("#")) {
    f.nons = note === 1 ? (f.nons || 0) + 1 : note === 3 ? 0 : f.nons || 0;
    if (avant === 2 && f.boite === 3 && !etat.mots[`${idMot}#o`]) etat.mots[`${idMot}#o`] = { boite: 0, vu: null, dep: aujourdhui };
  }
  etat.mots[idMot] = f;
  sauver();
}

// Les fiches de toutes les cartes ({ clé: { boite, vu, dep?, nons?, refus? } }), pour cartes.js.
export const fichesCartes = () => etat.mots;

// Le « + » d'une carte 3 ou 4 (ou « Ajouter ses phrases ») : la carte entre dans « Tes mots à revoir » dès aujourd'hui.
export function prendreCarte(cle, aujourdhui) {
  if (etat.mots[cle]) return;
  etat.mots = { ...etat.mots, [cle]: { boite: 0, vu: null, dep: aujourdhui } };
  sauver();
}
// « Pas maintenant » à « Tu bloques sur… » : on ne le redemande plus pour ce mot.
export function refuserPhrases(idMot) {
  etat.mots = { ...etat.mots, [idMot]: { boite: 0, vu: null, ...etat.mots[idMot], refus: true } };
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

// Chantier 24 (Q24-22) : la valeur d'une case au dernier jour avant « aujourdhui » où elle a été notée (0 compris), ou null.
export function valeurAvant(aujourdhui, cle) {
  const j = Object.keys(etat.jours).filter(x => x < aujourdhui && etat.jours[x]?.[cle] != null).sort().pop();
  return j ? etat.jours[j][cle] : null;
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
// Le mode Écouter (chantier 25) garde son score à part, dans le même objet : { le, score, sur, ecoute: { le, score, sur } }.
// Une vieille sauvegarde (sans « ecoute ») reste bonne : le texte est lu, pas encore écouté.
export function resultatLecture(idTexte, mode = "lu") {
  const r = (etat.lectures || {})[idTexte];
  if (!r) return null;
  if (mode === "ecoute") return r.ecoute || null;
  return "score" in r ? { le: r.le, score: r.score, sur: r.sur } : null;
}
export function noterLecture(idTexte, aujourdhui, score, sur, mode = "lu") {
  const avant = (etat.lectures || {})[idTexte] || {};
  const neuf = mode === "ecoute" ? { ...avant, ecoute: { le: aujourdhui, score, sur } } : { ...avant, le: aujourdhui, score, sur };
  etat.lectures = { ...(etat.lectures || {}), [idTexte]: neuf };
  sauver();
}

// Les jeux (la Feria) : les records, les compteurs, les jours joués, le son coupé, le paquet choisi.
// La forme de cet objet est décrite dans jeux.js (JEUX_VIDE), qui calcule aussi le nouvel état à la fin d'une partie.
// Les jeux ne changent jamais « mots » : la révision reste à part.
export const etatJeux = () => etat.jeux || {};
export function garderJeux(jeux) {
  etat.jeux = jeux;
  sauver();
}

// Les mots difficiles (étape 4 des décisions du 28 nov.) : { clé: { non, sorti, astuce, astuceLe, retenu } }.
//   non : les « Non » en tout sur les cartes du mot (clé = l'id du mot), à 3 il entre dans « Mes mots en cours » ;
//   sorti : le mot est sorti de la liste (retiré ou « Je le sais ») : seuls 3 nouveaux « Non » le font revenir ;
//   astuce, astuceLe : mon astuce (« Écrire la mienne »), clé = la clé de la liste (l'infinitif d'un verbe, sinon l'id) ;
//   retenu : la date de « Je le sais » (« retenu le » de l'onglet « Astuces ») ;
//   origine, prof, deCote, arriveLe, deCoteLe : l'onglet « Astuces » (étape 6, astuces.js), clé = l'id du mot.
const difficiles = () => etat.difficiles || (etat.difficiles = {});
export const difficile = cle => difficiles()[cle] || {};
function changerDifficile(cle, champs) {
  etat.difficiles = { ...difficiles(), [cle]: { ...difficile(cle), ...champs } };
  sauver();
}
export function compterNon(idMot) { changerDifficile(idMot, { non: (difficile(idMot).non || 0) + 1 }); }
// Étape 6 (onglet « Astuces ») : l'origine (« appli », « Kevin », « prof ») est notée à la première entrée (Q26-32) ;
// un mot qui revient perd sa date « retenu le » (Q26-33).
export function marquerEntre(idMot, cle = idMot, origine = "Kevin") {
  changerDifficile(idMot, { sorti: false, ...(!difficile(idMot).origine && { origine }) });
  if (difficile(cle).retenu) changerDifficile(cle, { retenu: "" });
}
export const noterDifficile = (cle, champs) => changerDifficile(cle, champs);
export const tousDifficiles = () => difficiles();
export const dateEnCours = v => verbes().cours[v] || "";
// La sortie (Q26-16, Q26-17) : le compteur repart de 0 ; « Je le sais » note la date (retenu), la croix non.
export function marquerSorti(idMot, cle, retenu) {
  changerDifficile(idMot, { non: 0, sorti: true });
  if (retenu) changerDifficile(cle, { retenu });
}
export function garderAstuce(cle, texte, aujourdhui) {
  changerDifficile(cle, { astuce: texte.trim(), astuceLe: aujourdhui });
}

// « Mes erreurs » (chantier 11) : pour chaque carte du carnet du prof, sa fiche { boite, vu, vue } (le calcul est dans carnet.js).
// La clé vient de la bonne forme. Les fiches partent dans les deux sauvegardes.
export const fichesErreurs = () => etat.erreurs || {};
export function noterErreur(cle, fiche) {
  etat.erreurs = { ...fichesErreurs(), [cle]: fiche };
  sauver();
}
export function remplacerErreurs(fiches) {
  etat.erreurs = fiches;
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
    ...(objet(d.jeux) && { jeux: d.jeux }),
    ...(objet(d.erreurs) && { erreurs: d.erreurs }),
    ...(objet(d.difficiles) && { difficiles: d.difficiles }),
    // « derniere » (la date de la dernière séance de chaque mot) était perdue à la restauration (Q26-22).
    ...(objet(d.verbes) && { verbes: { cours: objet(d.verbes.cours) ? d.verbes.cours : {}, justes: objet(d.verbes.justes) ? d.verbes.justes : {},
      ...(objet(d.verbes.derniere) && { derniere: d.verbes.derniere }) } }) } };
}

// Remplace toute la progression par celle d'une sauvegarde (en aperçu : seulement à l'écran).
export function restaurer(sauvegarde) {
  etat = { ...sauvegarde.etat, mots: migrerCartes2(sauvegarde.etat.mots) };
  sauver();
}
