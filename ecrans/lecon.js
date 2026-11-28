// La page d'une leçon faite : la phrase clé, la grammaire (une ligne par règle, regles.js), les 5 mots avec le son, puis « Pratiquer »,
// et « S'entraîner » (le bonus de grammaire) si la leçon a une réserve dans bonus.js.
// Une leçon pas encore faite avec le prof ne s'ouvre pas.
// Ouverte depuis une série, une carte de « Tes mots à revoir » (#/lecon/U1-L3/revision) ou une phrase ratée
// (#/lecon/U1-L3/exercice) : pas de « Commencer », et le lien du haut te remet sur la même question.
// Ouverte depuis le Dico (#/lecon/U1-L3/dico) : tout est là, et le lien du haut ramène au mot.

import { esc, md, id, dateLongue, ICONES, barreOnglets } from "../ui.js?v=79";
import { lecon as trouver } from "../position.js?v=79";
import { EXERCICES } from "../exercices.js?v=79";
import { BONUS } from "../bonus.js?v=79";
import { htmlCartes } from "./cartesmot.js?v=79";
import { lignesDe, texteDansLaLecon } from "../regles.js?v=79";

const bouton = (texte, cls = "") =>
  `<button class="ecoute ${cls}" data-dire="${esc(texte)}" aria-label="Écouter : ${esc(texte)}" aria-pressed="false">${ICONES.lecture}</button>`;

export function ecranLecon(ctx, idLecon, depuis) {
  const l = trouver(decodeURIComponent(idLecon || ""));
  const { pos, motsParLecon } = ctx;
  if (!l) return { onglet: "livre", html: `<main class="colonne vide"><h1>Leçon introuvable</h1><a class="lien" href="#/livre">Revenir au livre</a></main>${barreOnglets("livre")}` };

  const u = l.unite;
  const rang = u.lecons.findIndex(x => x.id === l.id) + 1;
  const serie = { revision: ["#/revision", "Reprendre tes mots"], exercice: [`#/pratique/${l.id}`, "Reprendre l'exercice"] }[depuis];
  // Ouverte depuis une fiche du Dico (#/lecon/U1-L1/dico) : le lien du haut ramène au mot, la barre reste sur Dico.
  const dico = depuis === "dico";
  const lien = serie
    ? `<a class="retour" href="${serie[0]}" data-arriere>${ICONES.retour}${serie[1]}</a>`
    : dico ? `<a class="retour" href="#/dico" data-arriere>${ICONES.retour}Revenir au mot</a>`
    : `<a class="retour" href="#/livre/${u.id}">${ICONES.retour}Le livre</a>`;
  const onglet = dico ? "dico" : "livre";
  const retour = `<header class="nav-haut">${lien}<span class="sous">Unité ${u.n ?? "Noël"} · leçon ${rang} sur ${u.lecons.length}</span></header>`;

  if (!pos.faites.has(l.id)) {
    return {
      onglet,
      html: `<main class="colonne lecon-page">${retour}
          <h1>${esc(l.titre)}</h1>
          <p class="sous">Cette leçon s'ouvre après ta séance avec le prof : il l'écrit dans ton suivi, et elle apparaît ici.</p>
        </main>${barreOnglets(onglet)}`,
    };
  }

  const date = pos.dateFaite[l.id];
  const mots = motsParLecon[l.id] || [];
  const ex = EXERCICES[l.id];
  return {
    // Ouverte depuis une série : pas de barre du bas, la seule sortie est « Reprendre… » (ou le retour d'Android).
    onglet: serie ? null : onglet,
    html: `<main class="colonne lecon-page">
        ${retour}
        <div>
          <h1>${esc(l.titre)}</h1>
          <p class="sous">${id(l.id)}${date ? ` · faite le ${esc(dateLongue(date))}` : ""}</p>
        </div>
        <div class="cle avec-son">${bouton(l.phrase, "grand")}<p><span>La phrase clé</span>${md(l.phrase)}</p></div>
        <section aria-labelledby="t-gram">
          <h2 id="t-gram">La grammaire</h2>
          <ul class="gram">${lignesDe(l.id).map(x => `<li>${md(texteDansLaLecon(x))}</li>`).join("")}</ul>
        </section>
        <section aria-labelledby="t-mots">
          <h2 id="t-mots">Les ${mots.length} mots</h2>
          ${serie ? "" : `<p class="sous">Chaque mot a ses cartes : 1 le mot et 2 la phrase à trou arrivent toutes seules ; touche « + » pour ajouter une phrase à écrire.</p>`}
          <ul class="mots">${mots.map(m => `<li class="mot">
              ${bouton(m.ex ? `${m.es}. ${m.ex}` : m.es)}
              <div class="txt"><b lang="es">${esc(m.es)}</b><span class="fr">${esc(m.fr)}</span>${m.ex ? `<span class="ex" lang="es">${esc(m.ex)}</span>` : ""}${serie ? "" : htmlCartes(ctx, m)}</div>
            </li>`).join("")}</ul>
        </section>
        <section aria-labelledby="t-prat">
          <h2 id="t-prat">Pratiquer${ex ? ` · environ ${Math.round((ex.ecrire.length + ex.dire.length) * 0.6 + mots.length * 0.25)} min` : ""}</h2>
          ${ex ? `<div class="compteurs"><span><b>${ex.ecrire.length}</b>à écrire</span><span><b>${ex.dire.length}</b>à dire</span><span><b>${mots.length}</b>cartes</span></div>`
            : `<p class="sous">Pour l'instant, les cartes des ${mots.length} mots : les exercices de cette unité arrivent bientôt.</p>`}
        </section>
        ${serie ? "" : `<a class="primaire" href="#/pratique/${l.id}">Commencer</a>`}
        ${serie || !BONUS[l.id] ? "" : `<a class="secondaire" href="#/bonus/${l.id}/lecon">S'entraîner · 6 phrases</a>`}
        ${l.soir ? `<p class="note-soir">Ce soir avec Blanca : ${esc(l.soir)}</p>` : ""}
      </main>${serie ? "" : barreOnglets(onglet)}`,
  };
}
