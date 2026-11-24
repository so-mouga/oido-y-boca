// Petits outils partagés par les écrans : échappement, mise en forme, icônes dessinées.

import { chispa } from "./mascotte.js?v=59";
import { etatJeux } from "./progression.js?v=59";
import { attrapes, etape } from "./jeux.js?v=59";

export const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Le livre écrit en Markdown léger : **gras** et *italique*.
export const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>");

// Un identifiant de leçon ne se coupe jamais en fin de ligne (« U1-L3 »).
export const id = s => `<span class="id">${esc(s)}</span>`;

// Les titres du livre commencent parfois par une minuscule (« me présenter… ») : majuscule à l'affichage.
export const titre = s => esc(s.charAt(0).toUpperCase() + s.slice(1));

export const dateLongue = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
export const dateCourte = iso => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const svg = (corps, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${corps}</svg>`;
export const ICONES = {
  coche: svg('<path d="M5 12.5l4.2 4.2L19 7"/>'),
  chevron: svg('<path d="M9 5l7 7-7 7"/>'),
  retour: svg('<path d="M15 5l-7 7 7 7"/>'),
  fermer: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  play: svg('<path d="M8 5.5v13l10.5-6.5z"/>', "i plein"),
  micro: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  lune: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  // Le bouton de son : la flèche de lecture, remplacée par des barres qui bougent pendant que ça joue.
  get lecture() {
    return `<span class="lecture" aria-hidden="true">${this.play}<span class="barres"><i></i><i></i><i></i></span></span>`;
  },
  sortie: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
};

export function barreOnglets(actif) {
  // « Jeux » : la porte de la Feria, avec Chispa à la place du petit trait.
  const onglet = (cle, href, nom, avant = "") =>
    `<a href="${href}" class="onglet${avant ? ` ${cle}` : ""}${actif === cle ? " on" : ""}"${actif === cle ? ' aria-current="page"' : ""}>${avant}${nom}</a>`;
  return `<nav class="onglets" aria-label="Navigation">${onglet("jour", "#/", "Aujourd'hui")}${onglet("livre", "#/livre", "Livre")}${onglet("dico", "#/dico", "Dico")}${onglet("soir", "#/soir", "Ce soir")}${onglet("jeux", "#/jeux", "Jeux", chispa("idle", 3, etape(attrapes(etatJeux())).i))}</nav>`;
}
