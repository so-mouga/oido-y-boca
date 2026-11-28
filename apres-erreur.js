// Les habitudes de Kevin (décisions du 28 nov., étape 2 ; maquette .impeccable/mocks/apres-erreur/) :
// - « Je ne sais pas » n'apparaît qu'après 5 secondes : chercher, dire quelque chose, même faux (sa place reste gardée) ;
// - après une erreur, la voix dit la bonne réponse, « Dis-le deux fois » s'affiche (pas de bouton « Je l'ai dit »),
//   puis la suite arrive toute seule. Le compte démarre quand la voix a fini et dure 2 × la durée de la voix + 2 s.
//   Sans voix, la durée de la voix est estimée à 0,5 s par mot. Toucher l'écran (ou une touche, ou la molette) arrête
//   le compte : on lit, puis « Suivant » comme avant. Avec le mouvement réduit, un texte « Suite dans 8 s » à la place de la barre.
// Les écrans (pratique, Mes mots en cours, verbes) donnent le texte à dire, la zone du compte et l'action « Suivant ».

import { dire } from "./voix.js?v=85";

export const SAIS_PAS_APRES = 5000;
export const PAR_MOT = 500;
const mots = textes => [].concat(textes).join(" ").trim().split(/\s+/).filter(Boolean).length;
export const dureeEstimee = textes => mots(textes) * PAR_MOT;
export const dureeCompte = dureeVoix => 2 * dureeVoix + 2000;
const reduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ——— « Je ne sais pas » après 5 s ———
// Le bouton est écrit avec la classe « sais-pas attend » (caché, sa place gardée). armerSaisPas(question) est appelé
// après chaque dessin de la question : le délai part de la première fois qu'on voit cette question (un écran redessiné
// pendant la question ne le relance pas).
export const boutonSaisPas = attr => `<button class="secondaire sais-pas attend" type="button" ${attr}>Je ne sais pas</button>`;
let question = null, depuis = 0, minuteur = null;
export function armerSaisPas(q) {
  if (q !== question) { question = q; depuis = Date.now(); }
  clearTimeout(minuteur);
  const montrer = doux => document.querySelectorAll(".sais-pas.attend").forEach(b => {
    b.classList.remove("attend");
    if (doux && !reduit()) b.classList.add("arrive");
  });
  const reste = SAIS_PAS_APRES - (Date.now() - depuis);
  if (reste <= 0) return montrer(false);
  minuteur = setTimeout(() => { if (question === q) montrer(true); }, reste);
}

// ——— après une erreur ———
// « Dis-le deux fois » : le (un mot), la (une phrase), les (des formes).
export function pronom(textes) {
  if ([].concat(textes).length > 1) return "les";
  const t = String(textes).trim();
  return /[.?!]$/.test(t) || mots(t) >= 4 ? "la" : "le";
}
export const blocDeuxFois = textes => `<div class="deux-fois"><span class="x2" aria-hidden="true">× 2</span><span>Dis-${pronom(textes)} deux fois, à voix haute.</span></div>`;
export const zoneCompte = () => `<div class="suite-auto" data-compte aria-live="off"></div>`;

// Une parenthèse (« (vivir) », « (de) ») est une aide : elle ne s'écrit pas, la voix ne la dit pas.
export const aDire = textes => {
  const l = [].concat(textes).map(x => String(x).replace(/\s*\([^)]*\)/g, "").trim()).filter(Boolean);
  return Array.isArray(textes) ? l : l[0] || "";
};

let enCours = null;
export function arreterCompte() {
  if (!enCours) return;
  enCours.fin();
}

// textes : ce que la voix dit ; bouton : le bouton de son à allumer pendant ce temps ; zone : [data-compte] ;
// suivre : passe à la question suivante (le même chemin que « Suivant »).
export function apresErreur({ textes, bouton, zone, suivre }) {
  textes = aDire(textes);
  arreterCompte();
  if (!zone) return;
  const c = { arrete: false, raf: 0, iv: 0, garde: 0 };
  const evenements = ["pointerdown", "keydown", "wheel"];
  const toucher = () => {
    if (c.arrete) return;
    c.fin();
    if (zone.isConnected) zone.innerHTML = `<p class="txt">Prends ton temps.</p>`;
  };
  c.fin = () => {
    c.arrete = true;
    cancelAnimationFrame(c.raf); clearInterval(c.iv); clearTimeout(c.garde);
    evenements.forEach(e => document.removeEventListener(e, toucher, true));
    bouton?.classList.remove("on"); bouton?.setAttribute("aria-pressed", "false");
    if (enCours === c) enCours = null;
  };
  enCours = c;
  evenements.forEach(e => document.addEventListener(e, toucher, true));
  zone.innerHTML = `<p class="txt">La voix ${pronom(textes)} dit…</p>`;

  const demarrer = dureeVoix => {
    if (c.arrete || c.compte) return;
    if (!zone.isConnected) return c.fin();
    c.compte = true;
    clearTimeout(c.garde);
    bouton?.classList.remove("on"); bouton?.setAttribute("aria-pressed", "false");
    const total = dureeCompte(dureeVoix), fin = performance.now() + total;
    const finir = () => { c.fin(); suivre(); };
    if (reduit()) {
      zone.innerHTML = `<p class="txt"></p>`;
      const txt = zone.firstElementChild;
      const maj = () => {
        if (!zone.isConnected) return c.fin();
        const r = Math.ceil((fin - performance.now()) / 1000);
        if (r <= 0) return finir();
        txt.textContent = `Suite dans ${r} s · touche l'écran pour rester`;
      };
      c.iv = setInterval(maj, 250); maj();
    } else {
      zone.innerHTML = `<div class="piste-auto"><i></i></div><p class="txt">La suite arrive · touche l'écran pour rester</p>`;
      const trait = zone.querySelector("i");
      const pas = () => {
        if (!zone.isConnected) return c.fin();
        const r = (fin - performance.now()) / total;
        if (r <= 0) return finir();
        trait.style.transform = `scaleX(${r})`;
        c.raf = requestAnimationFrame(pas);
      };
      c.raf = requestAnimationFrame(pas);
    }
  };

  const estimee = dureeEstimee(textes);
  const debut = performance.now();
  bouton?.classList.add("on"); bouton?.setAttribute("aria-pressed", "true");
  const parle = dire(textes, { fin: () => demarrer(performance.now() - debut) });
  if (!parle) return demarrer(estimee);
  // Certaines voix Android n'annoncent jamais la fin : au pire, on démarre avec la durée estimée.
  c.garde = setTimeout(() => demarrer(estimee), estimee * 3 + 4000);
}
