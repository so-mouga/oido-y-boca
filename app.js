// Oído y Boca : le livre dans ta poche.
// Charge le tableau, calcule la position dans le livre, puis affiche l'écran demandé par l'adresse (#/…).

import { chargerTableau } from "./donnees.js?v=18";
import { calculerPosition, LECONS, isoDuJour } from "./position.js?v=18";
import { cocher, cases, monterEcoute, modeApercu } from "./progression.js?v=18";
import { ECOUTES } from "./ecoute.js?v=18";
import { preparerVoix } from "./voix.js?v=18";
import { basculerLecture, arreterLecture } from "./lecture.js?v=18";
import { vibrer } from "./retours.js?v=18";
import { esc, dateCourte, barreOnglets } from "./ui.js?v=18";
import { ecranAujourdhui } from "./ecrans/aujourdhui.js?v=18";
import { ecranLivre } from "./ecrans/livre.js?v=18";
import { ecranLecon } from "./ecrans/lecon.js?v=18";
import { ecranSoir, ecranBlanca, ecranGuia } from "./ecrans/soir.js?v=18";
import { ecranPratique, actionPratique, microAppui, microRelache } from "./ecrans/pratique.js?v=18";

const app = document.getElementById("app");
let ctx = null;

// Aperçu : « ?apercu=U1-L3 » fait comme si toutes les leçons jusqu'à U1-L3 étaient faites (la dernière aujourd'hui).
// Sert à voir l'appli avant que « Suivi » ait des lignes. Rien n'est enregistré dans ce mode.
function suiviApercu(jusqua, jour) {
  const fin = LECONS.findIndex(l => l.id === jusqua);
  if (fin < 0) return null;
  return LECONS.slice(0, fin + 1).filter(l => !l.id.startsWith("Noël")).map((l, i, t) => {
    const d = new Date(jour + "T12:00:00"); d.setDate(d.getDate() - (t.length - 1 - i));
    return { date: isoDuJour(d), lecon: l.id, type: "leçon", score: NaN, rang: i };
  });
}

function contexte(donnees) {
  const jour = isoDuJour();
  const apercu = new URLSearchParams(location.search).get("apercu");
  const suivi = (apercu && suiviApercu(apercu, jour)) || donnees.suivi;
  modeApercu(!!apercu);
  const motsParLecon = {};
  for (const m of donnees.mots) (motsParLecon[m.lecon] ||= []).push(m);
  return {
    ...donnees, jour, apercu: apercu && suivi !== donnees.suivi ? apercu : null,
    pos: calculerPosition(suivi, jour), motsParLecon,
    luLe: donnees.lu ? dateCourte(donnees.lu.slice(0, 10)) : "",
  };
}

const ECRANS = {
  "": ecranAujourdhui,
  livre: ecranLivre,
  lecon: ecranLecon,
  soir: ecranSoir,
  blanca: ecranBlanca,
  guia: ecranGuia,
  pratique: ecranPratique,
  revision: ctx => ecranPratique(ctx, null),
};

function bientot(nom, onglet) {
  return { onglet, html: `<main class="colonne vide"><h1>${esc(nom)}</h1><p class="sous">Cet écran arrive à la prochaine étape.</p><a class="lien" href="#/">Revenir à aujourd'hui</a></main>${barreOnglets(onglet)}` };
}

// Deux mouvements, chacun son sens :
// - changer d'endroit (Livre, leçon, Ce soir…) : « Lumière qui monte » (fondu, légère montée, flou qui devient net) ;
// - passer à la question suivante d'une série : « glisse », la question part à gauche, la suivante arrive de droite.
// Sans transition quand le même écran se redessine (une réponse qui arrive, une case cochée).
function afficher(transition = false) {
  if (!transition || !document.startViewTransition) return dessiner();
  const racine = document.documentElement;
  racine.classList.toggle("glisse", transition === "glisse");
  const t = document.startViewTransition(dessiner);
  t.ready.catch(() => {}); // un toucher très rapide peut interrompre la transition : l'écran s'affiche quand même
  t.finished.finally(() => racine.classList.remove("glisse"));
}

function dessiner() {
  const [route, ...args] = location.hash.replace(/^#\/?/, "").split("/");
  const ecran = ECRANS[route];
  const rendu = ecran ? ecran(ctx, ...args)
    : bientot("Bientôt", "jour");
  arreterLecture();
  app.dataset.ecran = route || "jour";
  document.body.classList.toggle("nuit", !!rendu.nuit);
  document.querySelector('meta[name="theme-color"]').content = rendu.nuit ? "#13294B" : "#FFF4DC";
  app.innerHTML = rendu.html;
  window.scrollTo(0, 0);
  rendu.apres?.();
}

app.addEventListener("submit", async e => {
  if (!e.target.matches("[data-p-form]")) return;
  e.preventDefault();
  if (await actionPratique(ctx, "verifier")) afficher();
});

app.addEventListener("click", async e => {
  const action = e.target.closest("[data-p]");
  if (action) {
    const r = await actionPratique(ctx, action.dataset.p, action);
    if (r) afficher(r === "suivant" ? "glisse" : false);
    return;
  }
  const caseCochee = e.target.closest("[data-cocher]");
  if (caseCochee) {
    const cle = caseCochee.dataset.cocher;
    cocher(ctx.jour, cle, !cases(ctx.jour)[cle]);
    vibrer();
    afficher();
    return;
  }
  const son = e.target.closest("[data-dire], [data-voix]");
  if (son) {
    basculerLecture(son);
    return;
  }
  if (e.target.closest("[data-trop-facile]")) {
    monterEcoute(ECOUTES.length - 1);
    afficher();
  }
});

window.addEventListener("hashchange", () => afficher(true));

// Le micro : appuyer et rester appuyé pour parler, relâcher pour arrêter.
app.addEventListener("pointerdown", async e => {
  // « Un indice » ne doit pas fermer le clavier : le champ garde le focus.
  if (e.target.closest("[data-garde-focus]")) { e.preventDefault(); return; }
  const bouton = e.target.closest("[data-micro]");
  if (!bouton) return;
  e.preventDefault();
  if (await microAppui(bouton)) afficher();
});
const relacher = async () => { if (await microRelache()) afficher(); };
window.addEventListener("pointerup", relacher);
window.addEventListener("pointercancel", relacher);
app.addEventListener("contextmenu", e => { if (e.target.closest("[data-micro]")) e.preventDefault(); });

async function demarrer() {
  preparerVoix();
  try {
    ctx = contexte(await chargerTableau());
    afficher();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<main class="colonne vide"><h1>Le tableau ne répond pas</h1>
      <p class="sous">Vérifie le réseau, puis réessaie. (${esc(err.message)})</p>
      <button class="primaire" onclick="location.reload()">Réessayer</button></main>`;
  }
}

demarrer();
