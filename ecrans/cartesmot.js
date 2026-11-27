// Les 4 cartes d'un mot, sous le mot, dans la page de la leçon (Livre) et dans la fiche du Dico (chantier 15).
// 1 le mot et 2 la phrase à trou : automatiques. 3, 4… : les phrases à écrire, chacune avec son « + » (data-prendre).
// Gris : pas encore là ; jaune : dans « Tes mots à revoir » ; vert : réussie au rendez-vous des 3 jours.

import { esc } from "../ui.js?v=72";
import { cartesDuMot, etatCarte, cleCarte, departDe } from "../cartes.js?v=72";
import { fichesCartes } from "../progression.js?v=72";

const trou = t => esc(t).replace("___", `<span class="trou" aria-label="mot caché"></span>`);

export function htmlCartes(ctx, m) {
  if (m.moi) return "";
  const fiches = fichesCartes(), depart = departDe(ctx);
  const cartes = cartesDuMot(m, fiches);
  const ligne = c => {
    const e = etatCarte(c, m, ctx.jour, depart, fiches);
    const txt = c.n === 1 ? "le mot" : c.n === 2 ? `<span lang="es">${trou(c.trou.phrase)}</span>` : `« ${esc(c.phrase.fr)} »`;
    const fin = e.etat === "absente"
      ? `<button class="plus-carte" data-prendre="${esc(cleCarte(m.id, c.n))}" aria-label="Ajouter la carte ${c.n} à tes cartes à revoir">+</button>`
      : `<span class="quand">${esc(e.texte)}</span>`;
    return `<li class="cm ${e.etat}" data-carte="${esc(cleCarte(m.id, c.n))}" tabindex="-1"><span class="num" aria-label="carte ${c.n}">${c.n}</span><span class="txt">${txt}</span>${fin}</li>`;
  };
  const auto = cartes.filter(c => c.n <= 2), plus = cartes.filter(c => c.n >= 3);
  return `<div class="cartes-mot">
      <ol class="cm-liste">${auto.map(ligne).join("")}</ol>
      ${plus.length ? `<div class="cm-plus"><p>En plus, si tu veux · touche +</p><ol class="cm-liste">${plus.map(ligne).join("")}</ol></div>` : ""}
    </div>`;
}
