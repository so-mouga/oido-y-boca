// Oído y Boca : enchaînement des écrans.
// Bloc 3 : l'accueil, la série mixte de cartes Oreille et Bouche (avec l'enregistrement de ta voix
// et « À toi : répète-le » après un mot raté), et l'écran des mots de la semaine.

import { chargerTableau, etatDuJour } from "./donnees.js?v=4";
import { preparerVoix, voixChoisie, dire, taire, prononcable } from "./voix.js?v=4";
import { ETAPES, trouverSemaine, semainesAvantBoda } from "./chemin.js?v=4";
import { ouvrirCarnet, noter, serieMixte } from "./progression.js?v=4";
import {
  enregistrementActive, choisirEnregistrement, enregistrementPossible, demarrerEnregistrement,
  arreterEnregistrement, reecouterEnregistrement, effacerEnregistrement,
} from "./enregistrement.js?v=4";

const app = document.getElementById("app");
const JOURS = { Lun: "Lundi", Mar: "Mardi", Mer: "Mercredi", Jeu: "Jeudi", Ven: "Vendredi", Sam: "Samedi", Dim: "Dimanche" };
const ICONES = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  barres: '<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>',
  fleche: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  rejouer: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  lent: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h12a4 4 0 0 0 4-4V9"/><path d="M6 18a6 6 0 1 1 10.5-4"/><path d="M20 9l-2-2"/></svg>',
  voix: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
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
    { n: 2, titre: "Avec peine", critere: "trouvé en cherchant" },
    { n: 3, titre: "Oui", critere: "dit sans hésiter" },
  ],
};
const DUREE_BOUCHE = 5; // secondes pour le dire à voix haute
const DUREE_REPETE = 3; // secondes pour répéter un mot raté
const RAB_MICRO = 500;  // on garde le micro ouvert 0,5 s après la réponse, pour ne pas couper un mot
const CERCLE = 351.9;   // périmètre du cercle du compte à rebours (rayon 56)

let etat = { donnees: null, jour: null, ecran: "accueil", serie: [], rang: 0, revele: false, ecoutee: false };
let lecture = 0;        // numéro de la lecture en cours : une lecture interrompue ne doit pas éteindre la suivante
let compte = null;      // minuteur du compte à rebours Bouche
let enregistre = false; // un enregistrement est en cours sur la carte Bouche

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
    ${enregistrementPossible() ? `<div class="set">
      <div><b>Enregistrer ma voix</b><small>En Bouche, pour te réécouter à côté du modèle. Rien n'est gardé.</small></div>
      <button class="toggle" data-action="basculer-micro" aria-pressed="${enregistrementActive()}" aria-label="Enregistrer ma voix"></button>
    </div>` : ""}
    <div class="spacer"></div>
    <button class="primary" data-action="commencer">Commencer ${ICONES.fleche}</button>
    <button class="link center-self" data-ecran="mots">Écouter les mots de la semaine</button>
    <div class="foot">${esc(lu)}</div>`;
}

// ---------- éléments communs aux cartes ----------
function enTeteCarte(mode, sousTitre) {
  const total = etat.serie.length;
  const pct = Math.round(etat.rang / total * 100);
  return barre(`<button class="link" data-action="quitter">Quitter</button>`) + `
    <div class="progress" aria-label="Carte ${etat.rang + 1} sur ${total}"><div class="tr"><i style="width:${pct}%"></i></div><span>${etat.rang + 1} / ${total}</span></div>
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

// ---------- carte Oreille ----------
function carteOreille() {
  const { mot } = carteEnCours();
  const suite = etat.revele ? `
      <div class="answer">
        <div class="es">${phraseTouchable(mot.ex || mot.es, mot.es)}</div>
        <div class="fr"><b>${esc(mot.es)}</b> : ${esc(mot.fr)}</div>
        <div class="note">Touche un mot pour l'entendre seul.</div>
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
    return enTeteCarte("Bouche", "dis-le à voix haute") + `
      <div class="prompt">${esc(mot.fr)}</div>
      <div class="ring" aria-hidden="true">
        <svg width="132" height="132" viewBox="0 0 132 132">
          <circle cx="66" cy="66" r="56" fill="none" stroke="#F9DA8C" stroke-width="10"/>
          <circle id="arc" cx="66" cy="66" r="56" fill="none" stroke="#F2B630" stroke-width="10" stroke-linecap="round" stroke-dasharray="${CERCLE}" stroke-dashoffset="0"/>
        </svg>
        <div class="num" id="count">${DUREE_BOUCHE}</div>
      </div>
      <p class="say-aloud">Parle à voix haute,<br>même si ce n'est pas parfait.</p>
      <p class="note center" id="micro-etat" hidden>Enregistrement de ta voix…</p>
      <div class="spacer"></div>
      <button class="primary" data-action="reveler">Je l'ai dit</button>`;
  }
  return enTeteCarte("Bouche", "dis-le à voix haute") + `
    <div class="prompt">${esc(mot.fr)}</div>
    <div class="answer center">
      <div class="es">${phraseTouchable(mot.es, mot.es)}</div>
      ${mot.ex ? `<div class="fr">${phraseTouchable(mot.ex, mot.es)}</div>` : ""}
      <div class="note">Touche un mot pour l'entendre seul.</div>
    </div>
    ${boutonsEcoute()}
    <button class="secondary moi" id="moi" data-action="moi" hidden>${ICONES.voix}Me réécouter</button>
    <div class="spacer"></div>
    ${notes("b", "Tu l'avais dit ?")}`;
}

// ---------- « À toi : répète-le », après un mot raté en Bouche ----------
function ecranRepete() {
  const { mot } = carteEnCours();
  return enTeteCarte("Bouche", "deuxième chance") + `
    <div class="prompt">${esc(mot.fr)}</div>
    <div class="answer center"><div class="es"><span class="hl">${esc(mot.es)}</span></div></div>
    <div class="ring" aria-hidden="true">
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r="56" fill="none" stroke="#F9DA8C" stroke-width="10"/>
        <circle id="arc" cx="66" cy="66" r="56" fill="none" stroke="#F2B630" stroke-width="10" stroke-linecap="round" stroke-dasharray="${CERCLE}" stroke-dashoffset="0"/>
      </svg>
      <div class="num" id="count">${DUREE_REPETE}</div>
    </div>
    <p class="say-aloud"><b>À toi : répète-le</b> à voix haute,<br>juste après l'avoir entendu.</p>
    <div class="spacer"></div>
    <button class="primary" data-action="suivante">Carte suivante</button>`;
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
  const carte = etat.ecran === "carte" ? carteEnCours() : null;
  const ecrans = {
    accueil, mots: ecranMots, fin: finDeSerie, repete: ecranRepete,
    carte: () => (carte.sens === "b" ? carteBouche() : carteOreille()),
  };
  app.innerHTML = (ecrans[etat.ecran] || accueil)();
  app.dataset.ecran = etat.ecran;
  window.scrollTo(0, 0);
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

// ---------- déroulé de la série ----------
// Compte à rebours sur le cercle soleil ; appelle auBout() à zéro.
function lancerCompte(duree, auBout) {
  const debut = Date.now();
  compte = setInterval(() => {
    const reste = Math.max(0, duree - (Date.now() - debut) / 1000);
    const num = document.getElementById("count");
    const arc = document.getElementById("arc");
    if (num) num.textContent = Math.ceil(reste);
    if (arc) arc.setAttribute("stroke-dashoffset", (CERCLE * (1 - reste / duree)).toFixed(1));
    if (reste <= 0) { arreterCompte(); auBout(); }
  }, 100);
}

function reveler() {
  arreterCompte();
  etat.revele = true;
  afficher();
  if (carteEnCours().sens !== "b") return;
  // Bouche : on laisse le micro ouvert un instant (pour ne pas couper un mot), puis on fait parler le modèle.
  const avecMicro = enregistre;
  enregistre = false;
  setTimeout(async () => {
    if (avecMicro && await arreterEnregistrement()) {
      const bouton = document.getElementById("moi");
      if (bouton) bouton.hidden = false;
    }
    if (etat.ecran === "carte" && etat.revele) ecouter();
  }, avecMicro ? RAB_MICRO : 0);
}

async function ouvrirCarte() {
  effacerEnregistrement();
  enregistre = false;
  etat.ecran = "carte";
  etat.revele = false;
  etat.ecoutee = false;
  afficher();
  if (carteEnCours().sens !== "b") { ecouter(); return; }
  // Bouche : le compte commence tout de suite ; l'enregistrement le rejoint dès que le micro est prêt
  // (la première fois, Chrome demande l'autorisation, et le compte ne doit pas rester bloqué).
  const rang = etat.rang;
  lancerCompte(DUREE_BOUCHE, reveler);
  const ok = await demarrerEnregistrement();
  if (etat.ecran !== "carte" || etat.rang !== rang || etat.revele) { if (ok) arreterEnregistrement(); return; }
  enregistre = ok;
  const etatMicro = document.getElementById("micro-etat");
  if (etatMicro) etatMicro.hidden = !ok;
}

// Après un mot raté en Bouche : l'appli le redit, puis 3 secondes pour le répéter à voix haute.
function ouvrirRepete() {
  effacerEnregistrement();
  etat.ecran = "repete";
  afficher();
  const { mot } = carteEnCours();
  const numero = ++lecture;
  let parti = false;
  const partir = () => { if (parti || numero !== lecture || etat.ecran !== "repete") return; parti = true; lancerCompte(DUREE_REPETE, carteSuivante); };
  if (!dire(mot.es, { fin: partir })) partir();
  setTimeout(partir, 4000); // filet de sécurité si la fin de la voix n'est pas annoncée
}

function carteSuivante() {
  etat.rang += 1;
  if (etat.rang < etat.serie.length) ouvrirCarte();
  else { effacerEnregistrement(); etat.ecran = "fin"; afficher(); }
}

app.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
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
  if (action === "quitter") { effacerEnregistrement(); enregistre = false; etat.ecran = "accueil"; afficher(); return; }
  if (action === "suivante") { lecture++; arreterCompte(); carteSuivante(); return; }
  if (action === "basculer-micro") {
    const oui = b.getAttribute("aria-pressed") !== "true";
    choisirEnregistrement(oui);
    b.setAttribute("aria-pressed", String(oui));
    return;
  }
  if (action === "moi") {
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
    noter(sens, mot, note);
    if (sens === "b" && note < 3) ouvrirRepete();
    else carteSuivante();
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
