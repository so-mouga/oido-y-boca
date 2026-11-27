// Les lectures (#/lectures) : des textes par niveau, pour la compréhension écrite.
// L'entrée est une carte en haut du Livre (carteLectures). La liste montre ton niveau en premier ;
// les autres niveaux s'ouvrent aussi (#/lectures/n2), avec « plus difficile · à partir de U3 ».
// Un texte (#/lectures/<id>) : toucher un mot montre sa traduction (écrite dans lectures.js) et colore sa phrase ;
// « Écouter la phrase » la fait lire par la voix du téléphone (data-dire, comme partout). Pas de « tout lire ».
// Dessous, 3 questions à choix ; à la 3e réponse, le score est enregistré et le texte compte comme lu.
// Tout se passe sur la page (écouteurs posés dans « apres ») : l'écran n'est pas redessiné pendant la lecture.

import { esc, ICONES, barreOnglets, dateCourte } from "../ui.js?v=77";
import { uniteCourante } from "../position.js?v=77";
import { NIVEAUX, TEXTES, SORTES, texte as trouver, niveauDe, nbMots, phrases, morceaux } from "../lectures.js?v=77";
import { resultatLecture, noterLecture } from "../progression.js?v=77";
import { vibrer } from "../retours.js?v=77";
import { phraseTouchable } from "../toucher.js?v=77";

// L'unité où j'en suis (Noël compte comme la fin de l'unité 8), et donc mon niveau.
const uniteDuMoment = pos => uniteCourante(pos).n ?? 8;
const niveauDuMoment = pos => Math.min(niveauDe(uniteDuMoment(pos)), NIVEAUX.at(-1).n);
const unitesDe = nv => `unités ${nv.unites[0]} et ${nv.unites[1]}`;
const ICONE_LIVRE = `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/></svg>`;

const lus = nv => nv.textes.filter(t => resultatLecture(t.id)).length;

// La carte en haut du Livre.
export function carteLectures(ctx) {
  const nv = NIVEAUX.find(n => n.n === niveauDuMoment(ctx.pos));
  const detail = `Niveau ${nv.n} · ${lus(nv)} texte${lus(nv) > 1 ? "s" : ""} lu${lus(nv) > 1 ? "s" : ""} sur ${nv.textes.length}`;
  return `<a class="lx-entree" href="#/lectures"><span class="lx-ic">${ICONE_LIVRE}</span>
      <span class="lx-txt"><b>Lectures</b><span>${detail}</span></span>${ICONES.chevron}</a>`;
}

function ligneTexte(t, unite) {
  const r = resultatLecture(t.id);
  const plusTard = t.unite > unite ? ` · à partir de U${t.unite}` : "";
  const fin = r ? `<span class="lx-score">${r.score} / ${r.sur}</span>` : ICONES.chevron;
  return `<li><a class="lx-texte${r ? " lu" : ""}" href="#/lectures/${t.id}">
      <span class="pt" aria-hidden="true"></span>
      <span class="lx-txt"><b>${esc(t.titre)}</b><span>${SORTES[t.sorte]} · ${nbMots(t)} mots${plusTard}</span></span>${fin}</a></li>`;
}

function ecranListe(ctx, ouvert) {
  const unite = uniteDuMoment(ctx.pos);
  const mien = niveauDuMoment(ctx.pos);
  const nvMien = NIVEAUX.find(n => n.n === mien);
  const autres = NIVEAUX.filter(n => n.n !== mien);
  const etiquette = nv => nv.n > mien ? `plus difficile · à partir de U${nv.unites[0]}` : "déjà vu dans le livre";
  return {
    onglet: "livre",
    html: `<main class="colonne lectures">
        <header class="nav-haut"><a class="retour" href="#/livre/-">${ICONES.retour}Le livre</a></header>
        <div><h1>Lectures</h1><p class="sous">Des textes avec seulement ce que tu as vu. Touche un mot pour le comprendre.</p></div>
        <section class="lx-ton" aria-label="Ton niveau">
          <span class="k">Ton niveau</span><h2>Niveau ${nvMien.n} · ${unitesDe(nvMien)}</h2>
          <ul class="lx-textes">${nvMien.textes.map(t => ligneTexte(t, unite)).join("")}</ul>
        </section>
        ${autres.length ? `<section aria-label="Les autres niveaux"><h2>Les autres niveaux</h2><ul class="lx-niveaux">
          ${autres.map(nv => `<li class="${nv.n === ouvert ? "ouvert" : ""}">
            <a class="lx-niveau" href="#/lectures/${nv.n === ouvert ? "" : `n${nv.n}`}" aria-expanded="${nv.n === ouvert}">
              <span class="num">${nv.n}</span>
              <span class="lx-txt"><b>${unitesDe(nv).replace(/^u/, "U")}</b><span>${nv.textes.length} textes · <em>${etiquette(nv)}</em></span></span>${ICONES.chevron}</a>
            ${nv.n === ouvert ? `<ul class="lx-textes">${nv.textes.map(t => ligneTexte(t, unite)).join("")}</ul>` : ""}
          </li>`).join("")}
        </ul></section>` : `<p class="sous">Les niveaux suivants arrivent bientôt.</p>`}
      </main>${barreOnglets("livre")}`,
  };
}

// Le texte, phrase par phrase et mot par mot. Chaque mot se touche (ecrans/bulle.js, la même bulle que les exercices) :
// sa traduction est celle écrite pour le texte ; le moteur (toucher.js) dit seulement s'il est appris, plus loin, ou absent du livre.
// Pas de « La phrase en français » ici : comprendre la phrase avec les mots, c'est l'exercice (Q10-11).
function corps(ctx, t) {
  const phrase = ph => phraseTouchable(ctx, ph, { gloses: morceaux(ph, t).map(m => ({ ...m, g: m.g ?? undefined })) });
  const paragraphes = t.texte.map(p => phrases(p).map(phrase).join(" "));
  if (t.sorte === "message") return `<div class="lx-msg"><span class="de">${esc(t.de)}</span>${paragraphes.map(p => `<p class="bulle">${p}</p>`).join("")}</div>`;
  if (t.sorte === "dialogue") return `<div class="lx-dialogue">${paragraphes.map(p => `<p>${p}</p>`).join("")}</div>`;
  if (t.sorte === "breve") return `<div class="lx-breve">${paragraphes.map((p, i) => `<p>${i === 0 && t.lieu ? `<b class="lieu">${esc(t.lieu)}.</b> ` : ""}${p}</p>`).join("")}</div>`;
  return `<div class="lx-histoire">${paragraphes.map(p => `<p>${p}</p>`).join("")}</div>`;
}

const melanger = liste => liste.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

function questions(t) {
  return `<section class="lx-questions" aria-label="Questions"><h2>¿Lo has entendido?</h2>
    ${t.questions.map((q, i) => `<div class="lx-q" data-q="${i}">
        <p class="es">${i + 1}. ${esc(q.es)}</p>
        <button class="lx-voirfr" data-voirfr>En français</button><p class="fr" hidden>${esc(q.fr)}</p>
        <div class="lx-choix">${melanger(q.choix.map((c, k) => ({ c, k }))).map(({ c, k }) =>
          `<button data-choix="${k}">${esc(c)}</button>`).join("")}</div>
      </div>`).join("")}
    <div class="lx-fin" hidden></div>
  </section>`;
}

// Le texte d'après : le suivant du niveau, sinon le premier du niveau suivant.
const suivant = t => TEXTES[TEXTES.findIndex(x => x.id === t.id) + 1] || null;

function ecranTexte(ctx, t) {
  const avant = resultatLecture(t.id);
  const deja = avant ? ` · lu le ${dateCourte(avant.le)}, ${avant.score} / ${avant.sur}` : "";
  return {
    onglet: "livre",
    apres: () => brancher(ctx, t),
    html: `<main class="colonne lectures lx-page">
        <header class="nav-haut"><a class="retour" href="#/lectures">${ICONES.retour}Lectures</a></header>
        <div><p class="lx-sorte">Niveau ${t.niveau} · ${SORTES[t.sorte].toLowerCase()}${deja}</p><h1>${esc(t.titre)}</h1>
          <p class="sous">Lis d'abord tout le texte, sans t'arrêter. Puis touche les mots qui te bloquent.</p></div>
        <div class="lx-lire">${corps(ctx, t)}</div>
        ${questions(t)}
      </main>${barreOnglets("livre")}`,
  };
}

// Les gestes sur la page d'un texte : les questions (les mots se touchent avec ecrans/bulle.js).
function brancher(ctx, t) {
  const page = document.querySelector(".lx-page");
  const zoneQ = page.querySelector(".lx-questions");
  const reponses = {};
  zoneQ.addEventListener("click", e => {
    const fr = e.target.closest("[data-voirfr]");
    if (fr) { fr.hidden = true; fr.nextElementSibling.hidden = false; return; }
    const choix = e.target.closest("[data-choix]");
    if (!choix) return;
    const bloc = choix.closest(".lx-q"), i = Number(bloc.dataset.q);
    if (i in reponses) return;
    const q = t.questions[i], k = Number(choix.dataset.choix);
    reponses[i] = k === q.bonne;
    choix.classList.add(reponses[i] ? "juste" : "faux");
    bloc.querySelector(`[data-choix="${q.bonne}"]`).classList.add("juste");
    bloc.querySelectorAll("[data-choix]").forEach(b => { b.disabled = true; });
    vibrer();
    if (Object.keys(reponses).length === t.questions.length) finir(ctx, t, Object.values(reponses).filter(Boolean).length, zoneQ);
  });
}

function finir(ctx, t, score, zone) {
  const sur = t.questions.length;
  noterLecture(t.id, ctx.jour, score, sur);
  const mot = score === sur ? "¡Muy bien!" : score >= sur - 1 ? "¡Bien!" : "Relis le texte tranquillement, puis réessaie.";
  const apres = suivant(t);
  const fin = zone.querySelector(".lx-fin");
  fin.innerHTML = `<div class="lx-res${score >= sur - 1 ? "" : " bof"}"><b>${score} sur ${sur} · ${mot}</b><span>Texte lu.</span></div>
    ${apres ? `<a class="primaire" href="#/lectures/${apres.id}" data-remplace>Texte suivant · ${esc(apres.titre)}</a>` : ""}
    <a class="secondaire" href="#/lectures" data-remplace>Retour aux lectures</a>`;
  fin.hidden = false;
  fin.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export function ecranLectures(ctx, cible) {
  const id = decodeURIComponent(cible || "");
  const t = id && trouver(id);
  if (t) return ecranTexte(ctx, t);
  const n = /^n(\d+)$/.exec(id);
  return ecranListe(ctx, n ? Number(n[1]) : null);
}
