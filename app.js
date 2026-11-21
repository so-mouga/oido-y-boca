// Oído y Boca : enchaînement des écrans.
// Bloc 2 : l'accueil, la série de cartes Oreille, et l'écran des mots de la semaine.

import { chargerTableau, etatDuJour } from "./donnees.js";
import { preparerVoix, voixChoisie, dire, taire, prononcable } from "./voix.js";
import { ETAPES, trouverSemaine, semainesAvantBoda } from "./chemin.js";
import { ouvrirCarnet, noter, serieSimple } from "./progression.js";

const app = document.getElementById("app");
const JOURS = { Lun: "Lundi", Mar: "Mardi", Mer: "Mercredi", Jeu: "Jeudi", Ven: "Vendredi", Sam: "Samedi", Dim: "Dimanche" };
const ICONES = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  fleche: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  rejouer: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  lent: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18h12a4 4 0 0 0 4-4V9"/><path d="M6 18a6 6 0 1 1 10.5-4"/><path d="M20 9l-2-2"/></svg>',
  anneaux: '<svg class="rings" viewBox="0 0 30 20" aria-hidden="true"><circle cx="11" cy="10" r="7" fill="none" stroke="#13294B" stroke-width="2"/><circle cx="19" cy="10" r="7" fill="none" stroke="#F2B630" stroke-width="2.4"/></svg>',
};
const NOTES_OREILLE = [
  { n: 1, titre: "Non", critere: "rien compris, ou faux" },
  { n: 2, titre: "À moitié", critere: "une partie, ou après réécoute" },
  { n: 3, titre: "Oui", critere: "tout, du premier coup" },
];

let etat = { donnees: null, jour: null, ecran: "accueil", serie: [], rang: 0, revele: false };

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const heure = iso => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dateCourte = iso => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const jourSeance = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });
const jourSemaine = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long" });

// Surligne le mot dans sa phrase (« más despacio » dans « Más despacio, por favor »).
// Si le mot n'apparaît pas tel quel (verbe conjugué…), la phrase reste sans surlignage.
function surligner(phrase, mot) {
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
  const prochaine = serieSimple("o", jour.mots).length;
  return barre() + `
    <div><h1 class="title">${esc(titre)}</h1><div class="meta">${esc(dates)}</div></div>
    ${ligneDuChemin(jour.semaine)}
    ${jour.essai ? `<div class="trial"><b>Mode essai.</b> Le prof n'a encore noté aucune séance : l'appli prend les mots de la semaine 1. Ta progression d'essai sera effacée toute seule après ta première séance.</div>` : derniereSeance(jour)}
    ${voixChoisie() ? "" : `<div class="alert">Pas de voix espagnole trouvée sur ce téléphone. Installe « Espagnol (Espagne) » dans les réglages de synthèse vocale, puis recharge.</div>`}
    <div class="today"><div><b>${prochaine}</b>cartes Oreille</div><div><b>${jour.mots.length}</b>mots débloqués</div></div>
    <div class="spacer"></div>
    <button class="primary" data-action="commencer">Commencer ${ICONES.fleche}</button>
    <button class="link center-self" data-ecran="mots">Écouter les mots de la semaine</button>
    <div class="foot">${esc(lu)}</div>`;
}

// ---------- carte Oreille ----------
function carteOreille() {
  const mot = etat.serie[etat.rang];
  const total = etat.serie.length;
  const pct = Math.round(etat.rang / total * 100);
  const reponse = etat.revele ? `
      <div class="answer">
        <div class="es">${mot.ex ? surligner(mot.ex, mot.es) : `<span class="hl">${esc(mot.es)}</span>`}</div>
        <div class="fr"><b>${esc(mot.es)}</b> : ${esc(mot.fr)}</div>
      </div>
      <div class="ask">Tu avais compris ?</div>
      <div class="grades">${NOTES_OREILLE.map(x =>
        `<button class="grade g${x.n}" data-note="${x.n}">${x.titre}<small>${x.critere}</small></button>`).join("")}</div>`
    : `
      <p class="say-aloud">Dis à voix haute, <b>en français</b>,<br>ce que tu as compris.</p>
      <button class="primary" data-action="reveler">Afficher la réponse</button>`;
  return barre(`<button class="link" data-action="quitter">Quitter</button>`) + `
    <div class="progress" aria-label="Carte ${etat.rang + 1} sur ${total}"><div class="tr"><i style="width:${pct}%"></i></div><span>${etat.rang + 1} / ${total}</span></div>
    <div class="mode"><b>Oreille</b> · écoute sans lire</div>
    <button class="play" id="play" data-action="ecouter" aria-label="Écouter la phrase">${ICONES.play}</button>
    <div class="twin">
      <button class="secondary" data-action="ecouter">${ICONES.rejouer}Réécouter</button>
      <button class="secondary" data-action="lentement">${ICONES.lent}Lentement</button>
    </div>
    ${mot.ex ? "" : `<div class="note center">Pas encore de phrase pour ce mot : tu entends le mot seul.</div>`}
    <div class="spacer"></div>
    ${reponse}`;
}

function finDeSerie() {
  return barre() + `
    <div><h1 class="title">Série terminée</h1><div class="meta">${etat.serie.length} cartes Oreille. L'écran de fin complet arrive au bloc 4.</div></div>
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

// ---------- affichage et actions ----------
function afficher() {
  taire();
  const ecrans = { accueil, mots: ecranMots, carte: carteOreille, fin: finDeSerie };
  app.innerHTML = (ecrans[etat.ecran] || accueil)();
  app.dataset.ecran = etat.ecran;
  window.scrollTo(0, 0);
}

function ecouter(lent = false) {
  const mot = etat.serie[etat.rang];
  const disque = document.getElementById("play");
  disque?.classList.add("speaking");
  const fin = () => disque?.classList.remove("speaking");
  if (lent) dire(mot.ex || mot.es, { lent: true, fin });
  else dire(mot.ex || mot.es, { fin });
}

function ouvrirCarte() {
  etat.ecran = "carte";
  etat.revele = false;
  afficher();
  ecouter();
}

app.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.ecran) { etat.ecran = b.dataset.ecran; afficher(); return; }

  const action = b.dataset.action;
  if (action === "commencer") {
    etat.serie = serieSimple("o", etat.jour.mots);
    etat.rang = 0;
    if (etat.serie.length) ouvrirCarte();
    return;
  }
  if (action === "ecouter") { ecouter(); return; }
  if (action === "lentement") { ecouter(true); return; }
  if (action === "reveler") { etat.revele = true; afficher(); return; }
  if (action === "quitter") { etat.ecran = "accueil"; afficher(); return; }

  if (b.dataset.note) {
    noter("o", etat.serie[etat.rang], Number(b.dataset.note));
    etat.rang += 1;
    if (etat.rang < etat.serie.length) ouvrirCarte();
    else { etat.ecran = "fin"; afficher(); }
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
