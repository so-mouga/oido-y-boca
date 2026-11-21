// Oído y Boca : enchaînement des écrans.
// Bloc 3 : l'accueil, la série mixte de cartes Oreille et Bouche, et l'écran des mots de la semaine.
// En Bouche, c'est toi qui déclenches chaque étape : tenir le micro, parler, lâcher (ou « Voir la réponse »).

import { chargerTableau, etatDuJour } from "./donnees.js?v=7";
import { preparerVoix, voixChoisie, dire, taire, prononcable } from "./voix.js?v=7";
import { ETAPES, trouverSemaine, semainesAvantBoda } from "./chemin.js?v=7";
import { ouvrirCarnet, noter, serieMixte } from "./progression.js?v=7";
import {
  enregistrementPossible, demarrerEnregistrement, arreterEnregistrement,
  reecouterEnregistrement, effacerEnregistrement, aUnEnregistrement,
} from "./enregistrement.js?v=7";
import { vibrer, sonDeFin } from "./retours.js?v=7";

const app = document.getElementById("app");
const JOURS = { Lun: "Lundi", Mar: "Mardi", Mer: "Mercredi", Jeu: "Jeudi", Ven: "Vendredi", Sam: "Samedi", Dim: "Dimanche" };
const ICONES = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  barres: '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>',
  fleche: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  rejouer: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  lent: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h12a4 4 0 0 0 4-4V9"/><path d="M6 18a6 6 0 1 1 10.5-4"/><path d="M20 9l-2-2"/></svg>',
  ecouter: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>',
  micro: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  anneaux: '<svg class="rings" viewBox="0 0 30 20" aria-hidden="true"><circle cx="11" cy="10" r="7" fill="none" stroke="#13294B" stroke-width="2"/><circle cx="19" cy="10" r="7" fill="none" stroke="#F2B630" stroke-width="2.4"/></svg>',
};
const NOTES = {
  o: [
    { n: 1, titre: "Non", critere: "rien compris, ou faux" },
    { n: 2, titre: "À moitié", critere: "une partie, ou après réécoute" },
    { n: 3, titre: "Oui", critere: "tout, du premier coup" },
  ],
  b: [
    { n: 1, titre: "Non", critere: "pas trouvé" },
    { n: 2, titre: "Avec peine", critere: "trouvé, mais après le cercle" },
    { n: 3, titre: "Oui", critere: "dit avant la fin du cercle" },
  ],
};
const DUREE_BOUCHE = 5;      // secondes du cercle repère
const APPUI_MINI = 500;      // un appui plus bref sur le micro est ignoré
const PAUSE_APRES_MICRO = 1000; // le téléphone revient au son normal (écouteurs Bluetooth) avant le modèle
const CERCLE = 351.9;        // périmètre du cercle (rayon 56)

let etat = { donnees: null, jour: null, ecran: "accueil", serie: [], rang: 0, revele: false, ecoutee: false, repete: false };
let lecture = 0;   // numéro de la lecture en cours : une lecture interrompue ne doit pas éteindre la suivante
let compte = null; // minuteur du cercle Bouche
let micro = { actif: false, debut: 0, pret: false, bouton: null };

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const heure = iso => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dateCourte = iso => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const jourSeance = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });
const jourSemaine = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long" });
const carteEnCours = () => etat.serie[etat.rang];

// Affiche une phrase dont chaque mot se touche pour l'entendre seul,
// avec le mot étudié surligné (« más despacio » dans « Más despacio, por favor »).
// Si le mot n'apparaît pas tel quel (verbe conjugué…), rien n'est surligné.
function phraseTouchable(phrase, mot) {
  const coeur = prononcable(mot).split(",")[0]
    .replace(/^(el|la|los|las)\s+/i, "").replace(/[¿?¡!]/g, "").trim();
  const debut = coeur ? phrase.toLowerCase().indexOf(coeur.toLowerCase()) : -1;
  const fin = debut < 0 ? -1 : debut + coeur.length;
  let pos = 0;
  return phrase.split(/(\s+)/).map(morceau => {
    const a = pos; pos += morceau.length;
    if (!morceau.trim()) return morceau;
    const parle = morceau.replace(/[¿?¡!.,;:«»"…()]/g, "");
    const dedans = debut >= 0 && a < fin && pos > debut;
    if (!parle) return esc(morceau);
    return `<button class="tok${dedans ? " hl" : ""}" data-tok="${esc(parle)}">${esc(morceau)}</button>`;
  }).join("");
}

// La même phrase, sans boutons : juste le mot étudié surligné (carte Bouche).
function phraseSurlignee(phrase, mot) {
  const coeur = prononcable(mot).split(",")[0]
    .replace(/^(el|la|los|las)\s+/i, "").replace(/[¿?¡!]/g, "").trim();
  const i = coeur ? phrase.toLowerCase().indexOf(coeur.toLowerCase()) : -1;
  if (i < 0) return esc(phrase);
  return esc(phrase.slice(0, i)) + `<span class="hl">${esc(phrase.slice(i, i + coeur.length))}</span>` + esc(phrase.slice(i + coeur.length));
}

function barre(droite = "") {
  return `<div class="bar"><div class="brand"><i></i>Oído y Boca</div>${droite}</div>`;
}

function derniereSeance(jour) {
  if (jour.essai || !jour.derniere) return "";
  if (jour.joursDepuis > 2) {
    return `<div class="trial">Dernière séance avec le prof : ${esc(jourSemaine(jour.derniere))}. Une petite reprise ce midi ?</div>`;
  }
  return `<div class="note">Dernière séance notée : ${esc(jourSeance(jour.derniere))}</div>`;
}

function ligneDuChemin(numero) {
  const etape = ETAPES.find(e => (e.semaines || []).some(s => s.s === numero)) || ETAPES[0];
  const points = etape.semaines.map(s => {
    const classe = s.s === numero ? "now" : s.s < numero ? "done" : "";
    return `<span class="st ${classe}"></span><span class="seg"></span>`;
  }).join("");
  return `<div class="strip" aria-label="Étape ${etape.n} sur 4, semaine ${numero}">
    <div class="track">${points}<span class="st bil"></span><span class="seg fog"></span>${ICONES.anneaux}</div>
    <div class="strip-cap">Étape ${etape.n} sur 4 · boda dans ${semainesAvantBoda()} semaines</div>
  </div>`;
}

// ---------- accueil ----------
function accueil() {
  const { donnees, jour } = etat;
  const trouve = trouverSemaine(jour.semaine);
  const titre = trouve ? trouve.semaine.theme : `Semaine ${jour.semaine}`;
  const dates = trouve ? `Semaine ${jour.semaine} · ${trouve.semaine.dates}` : "";
  const lu = donnees.horsLigne
    ? `Sans réseau : copie du tableau du ${dateCourte(donnees.lu)} à ${heure(donnees.lu)}`
    : `Tableau lu à ${heure(donnees.lu)} · ${donnees.mots.length} mots`;
  const prochaine = serieMixte(jour.mots);
  const nbBouche = prochaine.filter(c => c.sens === "b").length;
  return barre() + `
    <div><h1 class="title">${esc(titre)}</h1><div class="meta">${esc(dates)}</div></div>
    ${ligneDuChemin(jour.semaine)}
    ${jour.essai ? `<div class="trial"><b>Mode essai.</b> Le prof n'a encore noté aucune séance : l'appli prend les mots de la semaine 1. Ta progression d'essai sera effacée toute seule après ta première séance.</div>` : derniereSeance(jour)}
    ${voixChoisie() ? "" : `<div class="alert">Pas de voix espagnole trouvée sur ce téléphone. Installe « Espagnol (Espagne) » dans les réglages de synthèse vocale, puis recharge.</div>`}
    <div class="today"><div><b>${prochaine.length - nbBouche}</b>cartes Oreille</div><div><b>${nbBouche}</b>cartes Bouche</div><div><b>${jour.mots.length}</b>mots débloqués</div></div>
    <div class="spacer"></div>
    <button class="primary" data-action="commencer">Commencer ${ICONES.fleche}</button>
    <button class="link center-self" data-ecran="mots">Écouter les mots de la semaine</button>
    <div class="foot">${esc(lu)}</div>`;
}

// ---------- éléments communs aux cartes ----------
// La barre de progression en deux segments : les cartes Oreille, puis les cartes Bouche.
function progression() {
  const nbO = etat.serie.filter(c => c.sens === "o").length;
  const nbB = etat.serie.length - nbO;
  const faitesO = Math.min(etat.rang, nbO);
  const faitesB = Math.max(0, etat.rang - nbO);
  const enCours = etat.ecran === "carte" ? carteEnCours()?.sens : null; // sur l'écran de passage, aucune carte n'est commencée
  const segment = (sens, nom, nb, faites) => nb ? `
    <div class="seg-prog ${enCours === sens ? "actif" : ""}" style="flex:${nb}">
      <div class="tr"><i style="width:${Math.round(faites / nb * 100)}%"></i></div>
      <span>${nom} ${Math.min(faites + (enCours === sens ? 1 : 0), nb)}/${nb}</span>
    </div>` : "";
  return `<div class="progress deux" aria-label="Carte ${etat.rang + 1} sur ${etat.serie.length}">
    ${segment("o", "Oreille", nbO, faitesO)}${segment("b", "Bouche", nbB, faitesB)}</div>`;
}

function enTeteCarte(mode, sousTitre) {
  return barre(`<button class="link" data-action="quitter">Quitter</button>`) + progression() + `
    <div class="mode"><b>${mode}</b> · ${sousTitre}</div>`;
}

function boutonsEcoute() {
  return `<div class="twin">
      <button class="secondary" data-action="ecouter">${ICONES.rejouer}Réécouter</button>
      <button class="secondary" data-action="lentement">${ICONES.lent}Lentement</button>
    </div>`;
}

function notes(sens, question) {
  return `<div class="ask">${question}</div>
    <div class="grades">${NOTES[sens].map(x =>
      `<button class="grade g${x.n}" data-note="${x.n}">${x.titre}<small>${x.critere}</small></button>`).join("")}</div>`;
}

function boutonMicro(texte) {
  if (!enregistrementPossible()) return "";
  return `<button class="mic" data-micro aria-label="${esc(texte)}">${ICONES.micro}<span class="mic-txt">${esc(texte)}</span></button>
    <p class="note center" id="micro-info" hidden></p>`;
}

// ---------- carte Oreille ----------
function carteOreille() {
  const { mot } = carteEnCours();
  const suite = etat.revele ? `
      <div class="answer">
        <div class="es">${phraseTouchable(mot.ex || mot.es, mot.es)}</div>
        <div class="fr"><b>${esc(mot.es)}</b> : ${esc(mot.fr)}</div>
        <div class="note">Touche un mot pour l'entendre seul. Puis répète la phrase à voix haute.</div>
      </div>
      ${notes("o", "Tu avais compris ?")}`
    : `
      <div class="next-step ${etat.ecoutee ? "" : "waiting"}" id="next-step">
        <p class="say-aloud">Dis à voix haute, <b>en français</b>,<br>ce que tu as compris.</p>
        <button class="primary" data-action="reveler">Afficher la réponse</button>
      </div>`;
  return enTeteCarte("Oreille", "écoute sans lire") + `
    <button class="play" id="play" data-action="ecouter" aria-label="Écouter la phrase">${ICONES.play}${ICONES.barres}</button>
    ${boutonsEcoute()}
    ${mot.ex ? "" : `<div class="note center">Pas encore de phrase pour ce mot : tu entends le mot seul.</div>`}
    <div class="spacer"></div>
    ${suite}`;
}

// ---------- carte Bouche ----------
function carteBouche() {
  const { mot } = carteEnCours();
  if (!etat.revele) {
    return enTeteCarte("Bouche", "à toi de parler") + `
      <div class="consigne">Dis-le en espagnol</div>
      <div class="prompt">${esc(mot.fr)}</div>
      <div class="ring" id="ring" aria-hidden="true">
        <svg width="132" height="132" viewBox="0 0 132 132">
          <circle cx="66" cy="66" r="56" fill="none" class="ring-fond" stroke-width="10"/>
          <circle id="arc" cx="66" cy="66" r="56" fill="none" class="ring-arc" stroke-width="10" stroke-linecap="round" stroke-dasharray="${CERCLE}" stroke-dashoffset="${CERCLE}"/>
        </svg>
        <div class="num" id="count">${DUREE_BOUCHE}</div>
      </div>
      <p class="say-aloud">Dis-le à voix haute<br>avant que le cercle soit plein.</p>
      <div class="spacer"></div>
      ${enregistrementPossible() ? `<p class="note center">Tiens le micro pendant que tu parles, lâche pour voir la réponse.</p>` : ""}
      ${boutonMicro("Tiens pour parler")}
      <button class="${enregistrementPossible() ? "secondary" : "primary"}" data-action="reveler">Voir la réponse</button>`;
  }
  // Page de réponse : le français reste à sa place, petit et gris ; l'espagnol apparaît dessous, en vedette.
  const moi = aUnEnregistrement();
  const reponse = `
    <div class="prompt petit">${esc(mot.fr)}</div>
    <div class="vedette">${phraseSurlignee(mot.es, mot.es)}</div>
    ${mot.ex ? `<div class="en-phrase"><span class="etiq">En phrase</span>${phraseSurlignee(mot.ex, mot.es)}</div>` : ""}
    <div class="spacer"></div>
    <div class="comparer">
      <button class="secondary" data-action="modele">${ICONES.rejouer}<span id="modele-txt">${etat.modeleLent ? "Modèle · lent" : "Modèle"}</span></button>
      <button class="secondary moi ${moi ? "" : "vide"}" id="moi" data-action="moi" aria-disabled="${!moi}">${ICONES.ecouter}Moi</button>
    </div>
    ${boutonMicro(moi ? "Tiens pour le redire" : "Tiens pour t'enregistrer")}`;
  if (etat.repete) {
    return enTeteCarte("Bouche", "à toi") + reponse + `
      <p class="say-aloud"><b>À toi : répète-le</b> à voix haute, juste après le modèle.</p>
      <button class="primary" data-action="suivante">Suivant ${ICONES.fleche}</button>`;
  }
  return enTeteCarte("Bouche", "à toi de parler") + reponse + notes("b", "Tu l'avais dit ?");
}

// ---------- l'écran de passage, entre la partie Oreille et la partie Bouche ----------
function ecranPassage() {
  const nbB = etat.serie.filter(c => c.sens === "b").length;
  return barre(`<button class="link" data-action="quitter">Quitter</button>`) + progression() + `
    <div class="passage">
      <div class="passage-icone">${ICONES.micro}</div>
      <h1 class="title">Bien écouté ! Maintenant, à toi de parler.</h1>
      <p class="meta">${nbB} ${nbB > 1 ? "mots que tu as déjà entendus" : "mot que tu as déjà entendu"}. Tu vois le français, tu le dis en espagnol, à voix haute.</p>
    </div>
    <div class="spacer"></div>
    <button class="primary" data-action="cest-parti">C'est parti ${ICONES.fleche}</button>
    <button class="link center-self" data-action="plus-tard">Plus tard : je ne peux pas parler maintenant</button>`;
}

function finDeSerie() {
  return barre() + `
    <div><h1 class="title">Série terminée</h1><div class="meta">${etat.serie.length} cartes. L'écran de fin complet arrive au bloc 4.</div></div>
    <div class="spacer"></div>
    <button class="primary" data-ecran="accueil">Retour à l'accueil</button>`;
}

// ---------- mots de la semaine ----------
function ecranMots() {
  const { jour } = etat;
  const semaine = jour.mots.filter(m => m.semaine === jour.semaine);
  const jours = [...new Set(semaine.map(m => m.jour))];
  const groupes = jours.map(j => {
    const liste = semaine.filter(m => m.jour === j);
    return `<div class="group"><div class="gname">${esc(JOURS[j] || j)} · ${esc(liste[0].theme)}</div>
      ${liste.map(m => `<div class="word">
        <button class="wbtn" data-dire="${esc(m.id)}">
          <span class="pl">${ICONES.play}</span>
          <span style="min-width:0"><span class="wes">${esc(m.es)}</span><span class="wfr">${esc(m.fr)}</span>${m.ex ? `<span class="wex">${esc(m.ex)}</span>` : ""}</span>
        </button>
        <button class="slow" data-lent="${esc(m.id)}" aria-label="Lentement : ${esc(m.es)}">Lentement</button>
      </div>`).join("")}</div>`;
  }).join("");
  return barre(`<button class="link" data-ecran="accueil">Retour</button>`) + `
    <div><h1 class="title">Les mots de la semaine</h1><div class="meta">Touche un mot : tu l'entends, puis sa phrase. Sans note, sans effet sur tes révisions.</div></div>
    <div>${groupes}</div>`;
}

// ---------- affichage ----------
function arreterCompte() { if (compte) { clearInterval(compte); compte = null; } }

function afficher() {
  taire();
  arreterCompte();
  const ecrans = {
    accueil, mots: ecranMots, fin: finDeSerie, passage: ecranPassage,
    carte: () => (carteEnCours().sens === "b" ? carteBouche() : carteOreille()),
  };
  app.innerHTML = (ecrans[etat.ecran] || accueil)();
  app.dataset.ecran = etat.ecran;
  window.scrollTo(0, 0);
}

// Une nouvelle carte (ou l'écran de passage) entre en glissant : on voit qu'on a changé de carte.
function glisser() {
  app.classList.remove("entree");
  void app.offsetWidth; // relance l'animation
  app.classList.add("entree");
}

// ---------- son ----------
// Fin d'une écoute complète en Oreille : le disque revient au ▶, et la prochaine étape devient nette.
function finEcoute(numero) {
  if (numero !== lecture) return; // une lecture plus récente a pris le relais
  document.getElementById("play")?.classList.remove("speaking");
  if (!etat.ecoutee) {
    etat.ecoutee = true;
    document.getElementById("next-step")?.classList.remove("waiting");
  }
}

// Oreille : la phrase (ou le mot seul). Bouche : le mot, puis la phrase.
function ecouter(lent = false) {
  const { sens, mot } = carteEnCours();
  const numero = ++lecture;
  const fin = () => finEcoute(numero);
  let textes;
  if (sens === "b") textes = lent ? mot.es : [mot.es, mot.ex];
  else textes = mot.ex || mot.es;
  document.getElementById("play")?.classList.add("speaking");
  const lancee = dire(textes, { lent, fin });
  if (!lancee) fin();
  setTimeout(fin, 12000); // filet de sécurité : certains Android n'annoncent pas toujours la fin de la voix
}

// ---------- le cercle repère (Bouche) : il se remplit, puis change de couleur, sans rien couper ----------
function lancerCercle() {
  const debut = Date.now();
  compte = setInterval(() => {
    const ecoule = Math.min(DUREE_BOUCHE, (Date.now() - debut) / 1000);
    const num = document.getElementById("count");
    const arc = document.getElementById("arc");
    if (num) num.textContent = Math.ceil(DUREE_BOUCHE - ecoule) || "";
    if (arc) arc.setAttribute("stroke-dashoffset", (CERCLE * (1 - ecoule / DUREE_BOUCHE)).toFixed(1));
    if (ecoule >= DUREE_BOUCHE) {
      arreterCompte();
      document.getElementById("ring")?.classList.add("fini");
    }
  }, 100);
}

// ---------- le micro à tenir appuyé ----------
function infoMicro(texte) {
  const info = document.getElementById("micro-info");
  if (!info) return;
  info.textContent = texte;
  info.hidden = !texte;
}

async function appuiMicro(bouton) {
  taire();
  lecture++;
  micro = { actif: true, debut: Date.now(), pret: false, bouton };
  bouton.classList.add("appui");
  infoMicro("");
  const ok = await demarrerEnregistrement();
  if (!micro.actif || micro.bouton !== bouton) { if (ok) arreterEnregistrement(false); return; }
  micro.pret = ok;
  const txt = bouton.querySelector(".mic-txt");
  if (ok) {
    bouton.classList.add("rec"); // le micro enregistre vraiment : tu peux parler
    if (txt) { txt.dataset.repos = txt.textContent; txt.textContent = "Je t'écoute… lâche quand tu as fini"; }
  } else infoMicro("Le micro n'est pas disponible. Tu peux continuer sans t'enregistrer.");
}

async function relacheMicro() {
  if (!micro.actif) return;
  const { bouton, debut, pret } = micro;
  micro = { actif: false, debut: 0, pret: false, bouton: null };
  bouton.classList.remove("appui", "rec");
  const txt = bouton.querySelector(".mic-txt");
  if (txt?.dataset.repos) txt.textContent = txt.dataset.repos;
  if (Date.now() - debut < APPUI_MINI) {
    arreterEnregistrement(false);
    infoMicro("Tiens le bouton pendant que tu parles.");
    return;
  }
  const garde = pret ? await arreterEnregistrement(true) : false;
  if (etat.ecran !== "carte") return;
  if (!etat.revele) { reveler(garde); return; }
  if (garde) {
    const moi = document.getElementById("moi");
    moi?.classList.remove("vide");
    moi?.setAttribute("aria-disabled", "false");
    const txt = bouton.querySelector(".mic-txt");
    if (txt) txt.textContent = "Tiens pour le redire";
  }
}

// ---------- déroulé de la série ----------
// Affiche la réponse Bouche ou Oreille. Après un enregistrement, on laisse le téléphone revenir au son normal.
function reveler(apresMicro = false) {
  arreterCompte();
  etat.revele = true;
  etat.modeleLent = true; // le modèle va être dit une fois : le prochain appui sur « Modèle » sera lent
  afficher();
  if (carteEnCours().sens !== "b") return;
  const rang = etat.rang;
  setTimeout(() => { if (etat.ecran === "carte" && etat.rang === rang && etat.revele) ecouter(); }, apresMicro ? PAUSE_APRES_MICRO : 0);
}

function ouvrirCarte() {
  effacerEnregistrement();
  etat.ecran = "carte";
  etat.revele = false;
  etat.ecoutee = false;
  etat.repete = false;
  afficher();
  glisser();
  if (carteEnCours().sens === "b") lancerCercle();
  else ecouter();
}

function carteSuivante() {
  effacerEnregistrement();
  const avant = carteEnCours()?.sens;
  etat.rang += 1;
  if (etat.rang >= etat.serie.length) { etat.ecran = "fin"; afficher(); glisser(); sonDeFin(); return; }
  // Passage de la partie Oreille à la partie Bouche : un écran, une seule fois par série.
  if (avant === "o" && carteEnCours().sens === "b") { etat.ecran = "passage"; afficher(); glisser(); return; }
  ouvrirCarte();
}

// ---------- gestes ----------
app.addEventListener("pointerdown", e => {
  const b = e.target.closest("[data-micro]");
  if (!b) return;
  e.preventDefault();
  try { b.setPointerCapture(e.pointerId); } catch { /* pas grave */ }
  appuiMicro(b);
});
["pointerup", "pointercancel"].forEach(type => app.addEventListener(type, () => relacheMicro()));
// L'appui long ne doit pas ouvrir de menu ni sélectionner de texte.
app.addEventListener("contextmenu", e => { if (e.target.closest("[data-micro]")) e.preventDefault(); });

app.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b || b.hasAttribute("data-micro")) return;
  if (b.dataset.ecran) { etat.ecran = b.dataset.ecran; afficher(); return; }

  const action = b.dataset.action;
  if (action === "commencer") {
    etat.serie = serieMixte(etat.jour.mots);
    etat.rang = 0;
    if (etat.serie.length) ouvrirCarte();
    return;
  }
  if (action === "ecouter") { ecouter(); return; }
  if (action === "lentement") { ecouter(true); return; }
  if (action === "reveler") { reveler(); return; }
  if (action === "suivante") { carteSuivante(); return; }
  if (action === "cest-parti") { ouvrirCarte(); return; }
  if (action === "plus-tard") { etat.ecran = "accueil"; afficher(); return; } // la partie Bouche attendra la prochaine série
  if (action === "quitter") { effacerEnregistrement(); etat.ecran = "accueil"; afficher(); return; }
  if (action === "modele") {
    // Le bouton alterne : normal, puis lent, puis normal… et l'annonce sur son libellé.
    const lent = etat.modeleLent;
    ecouter(lent);
    etat.modeleLent = !lent;
    const txt = document.getElementById("modele-txt");
    if (txt) txt.textContent = etat.modeleLent ? "Modèle · lent" : "Modèle";
    return;
  }
  if (action === "moi") {
    if (b.classList.contains("vide")) { infoMicro("Tiens le micro pour t'enregistrer d'abord."); return; }
    taire();
    lecture++;
    b.classList.add("on");
    reecouterEnregistrement(() => b.classList.remove("on"));
    return;
  }

  if (b.dataset.tok) {
    app.querySelectorAll(".tok.on").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    lecture++; // le mot seul remplace la phrase en cours
    document.getElementById("play")?.classList.remove("speaking");
    dire(b.dataset.tok, { fin: () => b.classList.remove("on") });
    return;
  }

  if (b.dataset.note) {
    const { sens, mot } = carteEnCours();
    const note = Number(b.dataset.note);
    vibrer();
    noter(sens, mot, note);
    if (sens === "b" && note < 3) {
      // Mot raté : la même carte devient « À toi : répète-le ». Pas de deuxième note.
      effacerEnregistrement();
      etat.repete = true;
      etat.modeleLent = true;
      afficher();
      ecouter();
    } else carteSuivante();
    return;
  }

  const id = b.dataset.dire || b.dataset.lent;
  if (id) {
    const mot = etat.jour.mots.find(m => m.id === id);
    if (!mot) return;
    app.querySelectorAll(".wbtn.on").forEach(x => x.classList.remove("on"));
    const ligne = b.closest(".word").querySelector(".wbtn");
    ligne.classList.add("on");
    const fini = () => ligne.classList.remove("on");
    if (b.dataset.lent) dire(mot.es, { lent: true, fin: fini });
    else dire([mot.es, mot.ex], { fin: fini });
  }
});

async function demarrer() {
  try {
    const [donnees] = await Promise.all([chargerTableau(), preparerVoix()]);
    etat.donnees = donnees;
    etat.jour = etatDuJour(donnees);
    ouvrirCarnet(etat.jour.essai);
    afficher();
  } catch (err) {
    app.innerHTML = barre() + `<div class="alert">Impossible de lire le tableau, et aucune copie n'est encore gardée sur ce téléphone. Vérifie la connexion, puis recharge la page.</div>`;
    console.error(err);
  }
}

demarrer();
