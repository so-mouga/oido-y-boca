// Oído y Boca : le livre dans ta poche.
// Charge le tableau, calcule la position dans le livre, puis affiche l'écran demandé par l'adresse (#/…).

import { chargerTableau } from "./donnees.js?v=66";
import { calculerPosition, LECONS, isoDuJour } from "./position.js?v=66";
import { cocher, cases, monterEcoute, modeApercu, exporter, lireSauvegarde, restaurer, prendreCarte } from "./progression.js?v=66";
import { ECOUTES } from "./ecoute.js?v=66";
import { preparerVoix } from "./voix.js?v=66";
import { basculerLecture, arreterLecture } from "./lecture.js?v=66";
import { vibrer } from "./retours.js?v=66";
import { esc, dateCourte, barreOnglets } from "./ui.js?v=66";
import { suivreClavier, marquerDebords } from "./clavier.js?v=66";
import { actionToucher, envoiToucher, suivreBulle, fermerBulle } from "./ecrans/bulle.js?v=66";
import { ecranAujourdhui } from "./ecrans/aujourdhui.js?v=66";
import { ecranLivre } from "./ecrans/livre.js?v=66";
import { ecranLecon } from "./ecrans/lecon.js?v=66";
import { ecranSoir, ecranBlanca, ecranGuia, actionOtra } from "./ecrans/soir.js?v=66";
import { ecranPratique, ecranBonus, ecranErreurs, actionPratique, microAppui, microRelache } from "./ecrans/pratique.js?v=66";
import { ecranControle, actionControle } from "./ecrans/controle.js?v=66";
import { ecranDico, majRecherche, majRecherchePage } from "./ecrans/dico.js?v=66";
import { ecranVerbes, actionVerbes, verifierVerbe } from "./ecrans/verbes.js?v=66";
import { ecranMesMots, ecranSemaine, envoiMesMots, actionMesMots } from "./ecrans/mesmots.js?v=66";
import { ecranLectures } from "./ecrans/lectures.js?v=66";
import { ecranJeux } from "./ecrans/jeux.js?v=66";
import { envoyerGoogle, surveillerGoogle, actionGoogle, rafraichirCarnet } from "./sauvegarde-google.js?v=66";

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
  erreurs: ecranErreurs,
  bonus: ecranBonus,
  controle: ecranControle,
  dico: ecranDico,
  verbes: ecranVerbes,
  "mes-mots": ecranMesMots,
  semaine: ecranSemaine,
  lectures: ecranLectures,
  jeux: ecranJeux,
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
  fermerBulle();
  app.dataset.ecran = route || "jour";
  document.body.classList.toggle("nuit", !!rendu.nuit);
  document.querySelector('meta[name="theme-color"]').content = rendu.nuit ? "#13294B" : "#FFF4DC";
  app.innerHTML = rendu.html;
  window.scrollTo(0, 0);
  rendu.apres?.();
  marquerDebords();
}

app.addEventListener("submit", async e => {
  // « Ajouter à Mes mots » dans la bulle d'un mot touché.
  if (e.target.matches("[data-tx-form]")) {
    e.preventDefault();
    envoiToucher(ctx, e.target);
    return;
  }
  if (e.target.matches("[data-mm-form]")) {
    e.preventDefault();
    if (envoiMesMots(ctx, e.target)) afficher();
    return;
  }
  if (e.target.matches("[data-v-form]")) {
    e.preventDefault();
    if (verifierVerbe()) afficher();
    return;
  }
  if (!e.target.matches("[data-p-form]")) return;
  e.preventDefault();
  if (await actionPratique(ctx, "verifier")) afficher();
});

app.addEventListener("click", async e => {
  // Toucher un mot : la bulle et ses boutons (ecrans/bulle.js). Un clic ailleurs la ferme, puis continue son chemin.
  if (actionToucher(ctx, e)) return;
  // « Reprendre tes mots » : revenir en arrière dans l'historique, pour retrouver la série à la même carte.
  if (e.target.closest("[data-arriere]") && history.length > 1) {
    e.preventDefault();
    history.back();
    return;
  }
  // Les boutons de fin de série remplacent la série dans l'historique : le retour d'Android ne la relance pas.
  const remplace = e.target.closest("a[data-remplace]");
  if (remplace) {
    e.preventDefault();
    location.replace(remplace.getAttribute("href"));
    return;
  }
  // Les onglets par temps de la fiche d'un verbe (Dico) : on montre le bon panneau, sans redessiner l'écran.
  const onglet = e.target.closest("[data-temps]");
  if (onglet) {
    const bloc = onglet.closest(".bloc");
    bloc.querySelectorAll("[data-temps]").forEach(b => b.setAttribute("aria-selected", String(b === onglet)));
    bloc.querySelectorAll("[data-panneau]").forEach(p => { p.hidden = p.dataset.panneau !== onglet.dataset.temps; });
    return;
  }
  // Para Blanca : « Otra pregunta » tire une question d'une leçon déjà faite, sans redessiner l'écran.
  if (actionOtra(ctx, e)) { vibrer(); return; }
  // S'entraîner aux verbes : la série, et « Je l'apprends », « + », « Je le sais » dans le Dico.
  const verbe = actionVerbes(ctx, e);
  if (verbe !== null) {
    if (verbe) afficher(verbe === "suivant" ? "glisse" : false);
    return;
  }
  // Le « + » d'une carte 3 ou 4 (Livre, Dico) : elle entre dans « Tes mots à revoir » (chantier 15).
  const prendre = e.target.closest("[data-prendre]");
  if (prendre) {
    prendreCarte(prendre.dataset.prendre, ctx.jour);
    vibrer(12);
    const y = window.scrollY; // la page reste où elle était
    afficher();
    window.scrollTo(0, y);
    app.querySelector(`[data-carte="${CSS.escape(prendre.dataset.prendre)}"]`)?.focus({ preventScroll: true });
    return;
  }
  const action = e.target.closest("[data-p]");
  if (action) {
    const r = await actionPratique(ctx, action.dataset.p, action);
    if (r) afficher(r === "suivant" ? "glisse" : false);
    return;
  }
  const etape = e.target.closest("[data-c]");
  if (etape) {
    const r = await actionControle(ctx, etape.dataset.c, etape, t => afficher(t === "suivant" ? "glisse" : false));
    if (r) afficher(r === "suivant" ? "glisse" : false);
    return;
  }
  const mm = await actionMesMots(ctx, e);
  if (mm !== null) {
    if (mm) afficher();
    return;
  }
  const caseCochee = e.target.closest("[data-cocher]");
  if (caseCochee) {
    const cle = caseCochee.dataset.cocher;
    const oui = !cases(ctx.jour)[cle];
    cocher(ctx.jour, cle, oui);
    vibrer();
    // L'écoute faite : « Tu as gardé des mots ? »
    if (cle === "ecoute" && oui) location.hash = "#/mes-mots/ecoute";
    else afficher();
    return;
  }
  const son = e.target.closest("[data-dire], [data-voix]");
  if (son) {
    basculerLecture(son);
    return;
  }
  const google = e.target.closest("[data-google]");
  if (google) {
    if (await actionGoogle(ctx, google.dataset.google)) { vibrer(); afficher(); }
    return;
  }
  if (e.target.closest("[data-sauvegarder]")) {
    telecharger(`oido-y-boca-${ctx.jour}.json`, exporter(ctx.jour));
    afficher();
    return;
  }
  if (e.target.closest("[data-restaurer]")) {
    app.querySelector("[data-fichier]")?.click();
    return;
  }
  if (e.target.closest("[data-trop-facile]")) {
    monterEcoute(ECOUTES.length - 1);
    afficher();
  }
});

// La recherche du Dico : chaque lettre met à jour la liste, sans redessiner l'écran (le clavier reste ouvert).
app.addEventListener("input", e => {
  if (e.target.matches("[data-cherche]")) majRecherche(ctx, e.target.value);
  if (e.target.matches("[data-cherche-page]")) majRecherchePage(ctx, e.target.dataset.cherchePage, e.target.value);
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

// Sauvegarde : un fichier JSON téléchargé (il arrive dans « Téléchargements » sur Android).
function telecharger(nom, texte) {
  const url = URL.createObjectURL(new Blob([texte], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: nom });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Restauration : relit le fichier choisi, montre sa date et demande avant de tout remplacer.
app.addEventListener("change", async e => {
  if (!e.target.matches("[data-fichier]")) return;
  const fichier = e.target.files[0];
  e.target.value = "";
  if (!fichier) return;
  try {
    const s = lireSauvegarde(await fichier.text());
    const du = s.le ? ` du ${dateCourte(s.le)}` : "";
    if (!confirm(`Remplacer ta progression actuelle par la sauvegarde${du} ?`)) return;
    restaurer(s);
    vibrer();
    afficher();
  } catch (err) {
    alert(`Impossible de restaurer : ${err.message}.`);
  }
});

async function demarrer() {
  preparerVoix();
  suivreClavier();
  suivreBulle();
  // Demande à Chrome de ne jamais effacer la progression pour faire de la place (accordé sans question,
  // surtout quand l'appli est installée).
  navigator.storage?.persist?.().catch(() => {});
  try {
    ctx = contexte(await chargerTableau());
    afficher();
    // La sauvegarde Google : à l'ouverture, puis chaque fois qu'on quitte l'appli (si quelque chose a changé).
    surveillerGoogle(() => ctx?.jour);
    envoyerGoogle(ctx.jour).then(ok => { if (ok && app.dataset.ecran === "jour") afficher(); });
    // « Mes erreurs » : le carnet du prof arrive en arrière-plan (la copie du téléphone sert en attendant).
    rafraichirCarnet().then(ok => { if (ok && app.dataset.ecran === "jour") afficher(); });
  } catch (err) {
    console.error(err);
    app.innerHTML = `<main class="colonne vide"><h1>Le tableau ne répond pas</h1>
      <p class="sous">Vérifie le réseau, puis réessaie. (${esc(err.message)})</p>
      <button class="primaire" onclick="location.reload()">Réessayer</button></main>`;
  }
}

demarrer();
