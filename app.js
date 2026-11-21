// Oído y Boca : enchaînement des écrans.
// Bloc 1 : accueil avec les vraies données, et un écran de test des mots (remplacé par les cartes au bloc 2).

import { chargerTableau, etatDuJour } from "./donnees.js";
import { preparerVoix, voixChoisie, dire, taire } from "./voix.js";
import { ETAPES, trouverSemaine, semainesAvantBoda } from "./chemin.js";

const app = document.getElementById("app");
const JOURS = { Lun: "Lundi", Mar: "Mardi", Mer: "Mercredi", Jeu: "Jeudi", Ven: "Vendredi", Sam: "Samedi", Dim: "Dimanche" };
const ICONES = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  fleche: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  anneaux: '<svg class="rings" viewBox="0 0 30 20" aria-hidden="true"><circle cx="11" cy="10" r="7" fill="none" stroke="#13294B" stroke-width="2"/><circle cx="19" cy="10" r="7" fill="none" stroke="#F2B630" stroke-width="2.4"/></svg>',
};

let etat = { donnees: null, jour: null, ecran: "accueil" };

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const heure = iso => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dateCourte = iso => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const jourSeance = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });
const jourSemaine = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long" });

function derniereSeance(jour) {
  if (jour.essai || !jour.derniere) return "";
  if (jour.joursDepuis > 2) {
    return `<div class="trial">Dernière séance avec le prof : ${esc(jourSemaine(jour.derniere))}. Une petite reprise ce midi ?</div>`;
  }
  return `<div class="note">Dernière séance notée : ${esc(jourSeance(jour.derniere))}</div>`;
}

function barre(droite = "") {
  return `<div class="bar"><div class="brand"><i></i>Oído y Boca</div>${droite}</div>`;
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

function accueil() {
  const { donnees, jour } = etat;
  const trouve = trouverSemaine(jour.semaine);
  const titre = trouve ? trouve.semaine.theme : `Semaine ${jour.semaine}`;
  const dates = trouve ? `Semaine ${jour.semaine} · ${trouve.semaine.dates}` : "";
  const lu = donnees.horsLigne
    ? `Sans réseau : copie du tableau du ${dateCourte(donnees.lu)} à ${heure(donnees.lu)}`
    : `Tableau lu à ${heure(donnees.lu)} · ${donnees.mots.length} mots`;
  return barre() + `
    <div><h1 class="title">${esc(titre)}</h1><div class="meta">${esc(dates)}</div></div>
    ${ligneDuChemin(jour.semaine)}
    ${jour.essai ? `<div class="trial"><b>Mode essai.</b> Le prof n'a encore noté aucune séance : l'appli prend les mots de la semaine 1. Ça s'arrête tout seul après ta première séance.</div>` : derniereSeance(jour)}
    ${voixChoisie() ? "" : `<div class="alert">Pas de voix espagnole trouvée sur ce téléphone. Installe « Espagnol (Espagne) » dans les réglages de synthèse vocale, puis recharge.</div>`}
    <div class="today"><div><b>${jour.mots.length}</b>mots débloqués</div><div><b>10 min</b>au plus par jour</div></div>
    <div class="spacer"></div>
    <button class="primary" data-ecran="mots">Écouter les mots ${ICONES.fleche}</button>
    <p class="note center">Bloc 1 : les cartes arrivent au bloc 2.</p>
    <div class="foot">${esc(lu)}</div>`;
}

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
    <div><h1 class="title">Les mots de la semaine</h1><div class="meta">Touche un mot : tu l'entends, puis sa phrase. Sans phrase, le mot seul.</div></div>
    <div>${groupes}</div>`;
}

function afficher() {
  taire();
  if (etat.ecran === "mots") app.innerHTML = ecranMots();
  else app.innerHTML = accueil();
  window.scrollTo(0, 0);
}

app.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.ecran) { etat.ecran = b.dataset.ecran; afficher(); return; }
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
    afficher();
  } catch (err) {
    app.innerHTML = barre() + `<div class="alert">Impossible de lire le tableau, et aucune copie n'est encore gardée sur ce téléphone. Vérifie la connexion, puis recharge la page.</div>`;
    console.error(err);
  }
}

demarrer();
