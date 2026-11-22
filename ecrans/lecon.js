// La page d'une leçon faite : la phrase clé, la grammaire, les 5 mots avec le son, puis « Pratiquer ».
// Une leçon pas encore faite avec le prof ne s'ouvre pas.

import { esc, md, id, dateLongue, ICONES, barreOnglets } from "../ui.js?v=17";
import { lecon as trouver } from "../position.js?v=17";
import { EXERCICES } from "../exercices.js?v=17";

const bouton = (texte, cls = "") =>
  `<button class="ecoute ${cls}" data-dire="${esc(texte)}" aria-label="Écouter : ${esc(texte)}" aria-pressed="false">${ICONES.lecture}</button>`;

export function ecranLecon(ctx, idLecon) {
  const l = trouver(decodeURIComponent(idLecon || ""));
  const { pos, motsParLecon } = ctx;
  if (!l) return { onglet: "livre", html: `<main class="colonne vide"><h1>Leçon introuvable</h1><a class="lien" href="#/livre">Revenir au livre</a></main>${barreOnglets("livre")}` };

  const u = l.unite;
  const rang = u.lecons.findIndex(x => x.id === l.id) + 1;
  const retour = `<header class="nav-haut"><a class="retour" href="#/livre/${u.id}">${ICONES.retour}Le livre</a><span class="sous">Unité ${u.n ?? "Noël"} · leçon ${rang} sur ${u.lecons.length}</span></header>`;

  if (!pos.faites.has(l.id)) {
    return {
      onglet: "livre",
      html: `<main class="colonne lecon-page">${retour}
          <h1>${esc(l.titre)}</h1>
          <p class="sous">Cette leçon s'ouvre après ta séance avec le prof : il l'écrit dans ton suivi, et elle apparaît ici.</p>
        </main>${barreOnglets("livre")}`,
    };
  }

  const date = pos.dateFaite[l.id];
  const mots = motsParLecon[l.id] || [];
  const ex = EXERCICES[l.id];
  return {
    onglet: "livre",
    html: `<main class="colonne lecon-page">
        ${retour}
        <div>
          <h1>${esc(l.titre)}</h1>
          <p class="sous">${id(l.id)}${date ? ` · faite le ${esc(dateLongue(date))}` : ""}</p>
        </div>
        <div class="cle avec-son">${bouton(l.phrase, "grand")}<p><span>La phrase clé</span>${md(l.phrase)}</p></div>
        <section aria-labelledby="t-gram">
          <h2 id="t-gram">La grammaire</h2>
          <p class="gram">${md(l.grammaire.charAt(0).toUpperCase() + l.grammaire.slice(1))}</p>
        </section>
        <section aria-labelledby="t-mots">
          <h2 id="t-mots">Les ${mots.length} mots</h2>
          <ul class="mots">${mots.map(m => `<li class="mot">
              ${bouton(m.ex ? `${m.es}. ${m.ex}` : m.es)}
              <div class="txt"><b lang="es">${esc(m.es)}</b><span class="fr">${esc(m.fr)}</span>${m.ex ? `<span class="ex" lang="es">${esc(m.ex)}</span>` : ""}</div>
            </li>`).join("")}</ul>
        </section>
        <section aria-labelledby="t-prat">
          <h2 id="t-prat">Pratiquer${ex ? ` · environ ${Math.round((ex.ecrire.length + ex.dire.length) * 0.6 + mots.length * 0.25)} min` : ""}</h2>
          ${ex ? `<div class="compteurs"><span><b>${ex.ecrire.length}</b>à écrire</span><span><b>${ex.dire.length}</b>à dire</span><span><b>${mots.length}</b>cartes</span></div>`
            : `<p class="sous">Pour l'instant, les cartes des ${mots.length} mots : les exercices de cette unité arrivent bientôt.</p>`}
        </section>
        <a class="primaire" href="#/pratique/${l.id}">Commencer</a>
        ${l.soir ? `<p class="note-soir">Ce soir avec Blanca : ${esc(l.soir)}</p>` : ""}
      </main>${barreOnglets("livre")}`,
  };
}
