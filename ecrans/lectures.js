// Les lectures (#/lectures) : des textes par niveau, à lire ou à écouter.
// L'entrée est une carte en haut du Livre (carteLectures). La liste montre ton niveau en premier, puis le feuilleton,
// puis les autres niveaux (#/lectures/n2), avec « plus difficile · à partir de U3 ».
// Un texte (#/lectures/<id>, ou /lire, /ecouter) a deux modes (chantier 25, maquette lectures-2.html) :
// - Lire : toucher un mot montre sa traduction (écrite dans lectures.js) et colore sa phrase ;
//   « Écouter la phrase », dans la bulle, la fait lire par la voix du téléphone. Pas de « tout lire ».
// - Écouter : le texte est caché ; un lecteur dit une phrase à la fois (Encore, Suivante, Lent, Tout d'un coup),
//   avec deux voix au plus (Q25-9) et un rond de couleur pour qui parle. Les questions sont visibles dès le début ;
//   « Voir le texte » n'arrive qu'après la dernière réponse, avec en rose la phrase de chaque question ratée.
// Un texte déjà lu s'ouvre sur Écouter. Les deux scores sont gardés à part (progression.js : « lu » et « ecoute »).
// Dessous, 3 questions (5 pour un texte long) ; à la dernière réponse, le score est enregistré.
// Tout se passe sur la page (écouteurs posés dans « apres ») : l'écran n'est pas redessiné pendant la lecture.

import { esc, ICONES, barreOnglets, dateCourte } from "../ui.js?v=88";
import { uniteCourante } from "../position.js?v=88";
import { NIVEAUX, TEXTES, SORTES, FEUILLETON, texte as trouver, niveauDe, nbMots, phrases, phrasesDe, morceaux } from "../lectures.js?v=88";
import { resultatLecture, noterLecture } from "../progression.js?v=88";
import { vibrer } from "../retours.js?v=88";
import { phraseTouchable, pourLaVoix } from "../toucher.js?v=88";
import { dire, taire } from "../voix.js?v=88";

// L'unité où j'en suis (Noël compte comme la fin de l'unité 8), et donc mon niveau.
const uniteDuMoment = pos => uniteCourante(pos).n ?? 8;
const niveauDuMoment = pos => Math.min(niveauDe(uniteDuMoment(pos)), NIVEAUX.at(-1).n);
const unitesDe = nv => `unités ${nv.unites[0]} et ${nv.unites[1]}`;
const svg = (d, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICONE_LIVRE = svg('<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/>');
const ICONE_OREILLE = svg('<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z"/>');
const ICONE_ENCORE = svg('<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>');
const ICONE_SUITE = svg('<path d="M5 12h13M13 6l6 6-6 6"/>');
const ICONE_PAUSE = svg('<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/>', "i plein");
const ICONE_OEIL = svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>');

const lus = nv => nv.textes.filter(t => resultatLecture(t.id)).length;
const ecoutes = nv => nv.textes.filter(t => resultatLecture(t.id, "ecoute")).length;

// La carte en haut du Livre.
export function carteLectures(ctx) {
  const nv = NIVEAUX.find(n => n.n === niveauDuMoment(ctx.pos));
  const l = lus(nv), e = ecoutes(nv);
  const detail = `Niveau ${nv.n} · ${l} lu${l > 1 ? "s" : ""}${e ? ` · ${e} écouté${e > 1 ? "s" : ""}` : ""} sur ${nv.textes.length}`;
  return `<a class="lx-entree" href="#/lectures"><span class="lx-ic">${ICONE_LIVRE}</span>
      <span class="lx-txt"><b>Lectures</b><span>${detail}</span></span>${ICONES.chevron}</a>`;
}

// Les deux marques d'un texte : 📖 lu et 🎧 écouté, chacune avec son score (ou « à faire »).
function marques(t) {
  const m = (r, ic, nom) => `<span class="lx-marque${r ? " ok" : ""}" title="${nom}">${ic}${r ? `${r.score}/${r.sur}` : "à faire"}</span>`;
  return `<span class="lx-deux">${m(resultatLecture(t.id), ICONE_LIVRE, "Lu")}${m(resultatLecture(t.id, "ecoute"), ICONE_OREILLE, "Écouté")}</span>`;
}
const etiquettes = t => `<span class="lx-tag${t.format === "long" ? " long" : ""}">${t.format === "long" ? "Long" : "Court"}</span>`
  + (t.feuilleton ? `<span class="lx-tag feu">Feuilleton ${t.feuilleton}</span>` : "");

function ligneTexte(t, unite) {
  const plusTard = t.unite > unite ? ` · dès U${t.unite}` : "";
  return `<li><a class="lx-texte" href="#/lectures/${t.id}">
      <span class="lx-txt"><b>${esc(t.titre)}</b><span class="lx-info">${etiquettes(t)}${SORTES[t.sorte]} · ${nbMots(t)} mots${plusTard}</span></span>${marques(t)}</a></li>`;
}

// Le feuilleton : tous les épisodes dans l'ordre, sur tous les niveaux.
function cadreFeuilleton(unite) {
  const eps = TEXTES.filter(t => t.feuilleton);
  if (!eps.length) return "";
  return `<section class="lx-feu" aria-label="Le feuilleton"><span class="lx-tag feu">Le feuilleton</span>
      <h2>${esc(FEUILLETON.titre)}</h2><p class="sous">${esc(FEUILLETON.resume)}</p>
      <ul class="lx-textes">${eps.map(t => `<li><a class="lx-texte lx-ep${t.unite > unite ? " loin" : ""}" href="#/lectures/${t.id}">
        <span class="num">${t.feuilleton}</span>
        <span class="lx-txt"><b>${esc(t.titre)}</b><span>Niveau ${t.niveau} · ${t.format === "long" ? "long" : "court"}${t.unite > unite ? ` · dès U${t.unite}` : ""}</span></span>${marques(t)}</a></li>`).join("")}</ul>
    </section>`;
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
        <div><h1>Lectures</h1><p class="sous">Lis-les, ou écoute-les sans voir le texte. Seulement ce que tu as vu dans le livre.</p></div>
        <section class="lx-ton" aria-label="Ton niveau">
          <span class="k">Ton niveau</span><h2>Niveau ${nvMien.n} · ${unitesDe(nvMien)}</h2>
          <ul class="lx-textes">${nvMien.textes.map(t => ligneTexte(t, unite)).join("")}</ul>
        </section>
        ${cadreFeuilleton(unite)}
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
// Chaque phrase porte son numéro (data-n) : en mode Écouter, celles des questions ratées passent en rose.
// Pas de « La phrase en français » ici : comprendre la phrase avec les mots, c'est l'exercice (Q10-11).
function corps(ctx, t) {
  let n = 0;
  const phrase = ph => `<span class="lx-ph" data-n="${n++}">${phraseTouchable(ctx, ph, { gloses: morceaux(ph, t).map(m => ({ ...m, g: m.g ?? undefined })) })}</span>`;
  const paragraphes = t.texte.map(p => phrases(p).map(phrase).join(" "));
  if (t.sorte === "message") return `<div class="lx-msg"><span class="de">${esc(t.de)}</span>${paragraphes.map(p => `<p class="bulle">${p}</p>`).join("")}</div>`;
  if (t.sorte === "dialogue") return `<div class="lx-dialogue">${paragraphes.map(p => `<p>${p}</p>`).join("")}</div>`;
  if (t.sorte === "breve") return `<div class="lx-breve">${paragraphes.map((p, i) => `<p>${i === 0 && t.lieu ? `<b class="lieu">${esc(t.lieu)}.</b> ` : ""}${p}</p>`).join("")}</div>`;
  return `<div class="lx-histoire">${paragraphes.map(p => `<p>${p}</p>`).join("")}</div>`;
}

// Le cadre « Mots nouveaux » d'un texte long (Q25-4) : chaque mot se touche pour l'entendre.
function motsNouveaux(t) {
  if (t.format !== "long" || !t.glossaire) return "";
  const liste = Object.entries(t.glossaire);
  return `<section class="lx-mn" aria-label="Mots nouveaux"><h2>${liste.length} mots nouveaux</h2>
      <ul>${liste.map(([es, fr]) => `<li><button class="lx-mn-mot" data-dire="${esc(es)}" lang="es"><b>${esc(es)}</b><span>${esc(fr)}</span></button></li>`).join("")}</ul>
    </section>`;
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

function ecranTexte(ctx, t, demande) {
  const lu = resultatLecture(t.id), ecoute = resultatLecture(t.id, "ecoute");
  const mode = demande === "lire" || demande === "ecouter" ? demande : lu ? "ecouter" : "lire";
  const r = mode === "lire" ? lu : ecoute;
  const deja = r ? ` · ${mode === "lire" ? "lu" : "écouté"} le ${dateCourte(r.le)}, ${r.score} / ${r.sur}` : "";
  const onglet = (m, ic, nom, res) => `<a class="${m === mode ? "on" : ""}" href="#/lectures/${t.id}/${m}" data-remplace${m === mode ? ' aria-current="page"' : ""}>${ic}${nom}${res ? ` <small>${res.score}/${res.sur}</small>` : ""}</a>`;
  const tags = (t.format === "long" ? `<span class="lx-tag long">Long</span>` : "") + (t.feuilleton ? `<span class="lx-tag feu">Feuilleton · épisode ${t.feuilleton}</span>` : "");
  return {
    onglet: "livre",
    apres: () => brancher(ctx, t, mode),
    html: `<main class="colonne lectures lx-page" data-mode="${mode}">
        <header class="nav-haut"><a class="retour" href="#/lectures">${ICONES.retour}Lectures</a></header>
        <div><p class="lx-sorte">Niveau ${t.niveau} · ${SORTES[t.sorte].toLowerCase()}${deja}</p>${tags ? `<p class="lx-tags">${tags}</p>` : ""}<h1>${esc(t.titre)}</h1></div>
        ${t.avant ? `<p class="lx-avant"><b>Avant</b>${esc(t.avant)}</p>` : ""}
        <nav class="lx-mode" aria-label="Lire ou écouter">${onglet("lire", ICONE_LIVRE, "Lire", lu)}${onglet("ecouter", ICONE_OREILLE, "Écouter", ecoute)}</nav>
        ${mode === "lire"
          ? `<p class="sous">Lis d'abord tout le texte, sans t'arrêter. Puis touche les mots qui te bloquent.</p>
             ${motsNouveaux(t)}<div class="lx-lire">${corps(ctx, t)}</div>`
          : `<p class="sous">Le texte est caché. Écoute une phrase, réécoute-la autant que tu veux, puis passe à la suivante. Les questions sont en dessous.</p>
             ${motsNouveaux(t)}<div class="lx-lecteur" aria-live="polite"></div><div class="lx-mini" hidden></div>
             <div class="lx-lire" hidden>${corps(ctx, t)}</div>`}
        ${questions(t)}
      </main>${barreOnglets("livre")}`,
  };
}

// ── Le lecteur du mode Écouter ──
// Une phrase à la fois : ▶ la dit, « Encore » la redit, « Suivante » passe à la suivante et la dit.
// « Tout d'un coup » dit le reste du texte à la suite. « Lent » : la voix à 0,6 au lieu de 0,9.
// Qui parle : un rond de couleur (jaune, bleu, vert dans l'ordre d'arrivée ; gris pour le narrateur).
// Une réplique de dialogue (un paragraphe dit par un personnage de « parle ») se dit en entier : « Hola. Me llamo Tomás. »
function lecteur(t, zone, mini) {
  const dites = [];
  for (const d of phrasesDe(t)) {
    const der = dites.at(-1);
    if (der && t.parle && d.qui && der.p === d.p) der.ph += " " + d.ph;
    else dites.push({ ...d });
  }
  const ordre = [...new Set(dites.map(d => d.qui).filter(Boolean))];
  const couleur = qui => qui ? ["a", "b", "c"][ordre.indexOf(qui) % 3] : "x";
  let i = 0, lent = false, joue = false, deja = false;
  const voixDe = d => ({ t: pourLaVoix(d.ph), femme: d.femme });

  const dessiner = () => {
    const d = dites[i];
    zone.innerHTML = `
      <div class="lx-l-haut"><b>Phrase ${i + 1} sur ${dites.length}</b><span>${deja ? "" : "touche Écouter pour commencer"}</span></div>
      <div class="lx-points" aria-hidden="true">${dites.map((_, k) => `<span class="${k < i ? "lx-f" : k === i ? "lx-i" : ""}"></span>`).join("")}</div>
      <div class="lx-cache"><span class="lx-qui ${couleur(d.qui)}" aria-hidden="true">${d.qui ? esc(d.qui[0]) : "·"}</span>
        <span class="lx-lignes${joue ? " bouge" : ""}" aria-hidden="true"><i></i><i style="width:${40 + (i * 23) % 50}%"></i></span>
        <span class="lx-nom">${d.qui ? esc(d.qui) : "Le narrateur"}</span></div>
      <div class="lx-cmds">
        <button data-l="encore" ${deja ? "" : "disabled"}>${ICONE_ENCORE}Encore</button>
        <button class="jouer" data-l="jouer">${joue ? ICONE_PAUSE : ICONES.play}${joue ? "Pause" : deja ? "Rejouer" : "Écouter"}</button>
        <button data-l="suite" ${deja && i < dites.length - 1 ? "" : "disabled"}>${ICONE_SUITE}Suivante</button>
      </div>
      <div class="lx-l-bas"><button class="lx-lent${lent ? " on" : ""}" data-l="lent" aria-pressed="${lent}"><span class="sw"></span>Lent</button>
        <button class="lx-tout" data-l="tout">Tout d'un coup</button></div>`;
    mini.innerHTML = `<button class="rond" data-l="${joue ? "jouer" : "encore"}" aria-label="${joue ? "Pause" : "Réécouter la phrase"}">${joue ? ICONE_PAUSE : ICONES.play}</button>
      <span class="lx-txt"><b>Phrase ${i + 1} sur ${dites.length}</b><span>${esc(t.titre)}</span></span>
      <button data-l="suite" ${i < dites.length - 1 ? "" : "disabled"}>Suivante</button><button data-l="tout">Tout</button>`;
  };
  const fini = () => { joue = false; dessiner(); };
  const jouer = () => { joue = true; deja = true; dessiner(); if (!dire([voixDe(dites[i])], { lent, fin: fini })) fini(); };
  const geste = e => {
    const b = e.target.closest("[data-l]");
    if (!b || b.disabled) return;
    const quoi = b.dataset.l;
    if (quoi === "jouer") { if (joue) { taire(); fini(); } else jouer(); }
    else if (quoi === "encore") jouer();
    else if (quoi === "suite") { i = Math.min(i + 1, dites.length - 1); jouer(); }
    else if (quoi === "lent") { lent = !lent; dessiner(); }
    else if (quoi === "tout") {
      joue = true; deja = true; dessiner();
      const debut = i === dites.length - 1 ? 0 : i;
      if (!dire(dites.slice(debut).map(voixDe), { lent, fin: () => { i = dites.length - 1; fini(); } })) fini();
    }
  };
  zone.addEventListener("click", geste);
  mini.addEventListener("click", geste);
  // La petite barre apparaît en haut quand le lecteur sort de l'écran (on descend vers les questions).
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { mini.hidden = e.isIntersecting; }).observe(zone);
  dessiner();
}

// Les gestes sur la page d'un texte : les questions (les mots se touchent avec ecrans/bulle.js), et le lecteur.
function brancher(ctx, t, mode) {
  const page = document.querySelector(".lx-page");
  if (mode === "ecouter") lecteur(t, page.querySelector(".lx-lecteur"), page.querySelector(".lx-mini"));
  const zoneQ = page.querySelector(".lx-questions");
  const reponses = {};
  zoneQ.addEventListener("click", e => {
    const fr = e.target.closest("[data-voirfr]");
    if (fr) { fr.hidden = true; fr.nextElementSibling.hidden = false; return; }
    if (e.target.closest("[data-voir-texte]")) { voirTexte(page, t, reponses); return; }
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
    if (Object.keys(reponses).length === t.questions.length) finir(ctx, t, mode, Object.values(reponses).filter(Boolean).length, zoneQ);
  });
}

// « Voir le texte » (mode Écouter) : le texte apparaît, avec en rose la phrase de chaque question ratée.
function voirTexte(page, t, reponses) {
  taire();
  const lire = page.querySelector(".lx-lire");
  t.questions.forEach((q, i) => { if (reponses[i] === false) lire.querySelector(`.lx-ph[data-n="${q.ph}"]`)?.classList.add("rate"); });
  page.querySelector(".lx-lecteur")?.remove();
  page.querySelector(".lx-mini")?.remove();
  page.querySelector(".lx-mn")?.remove();
  page.querySelector("[data-voir-texte]")?.remove();
  lire.hidden = false;
  lire.scrollIntoView({ behavior: "smooth", block: "start" });
}

function finir(ctx, t, mode, score, zone) {
  const sur = t.questions.length;
  const ecoute = mode === "ecouter";
  noterLecture(t.id, ctx.jour, score, sur, ecoute ? "ecoute" : "lu");
  const mot = score === sur ? "¡Muy bien!" : score >= sur - 1 ? "¡Bien!" : ecoute ? "Réécoute tranquillement, puis regarde le texte." : "Relis le texte tranquillement, puis réessaie.";
  const rates = score < sur;
  const apres = suivant(t);
  const fin = zone.querySelector(".lx-fin");
  fin.innerHTML = `<div class="lx-res${score >= sur - 1 ? "" : " bof"}"><b>${score} sur ${sur} · ${mot}</b>
      <span>${ecoute ? `Texte écouté.${rates ? " Dans le texte, la phrase de chaque question ratée est en rose." : ""}` : "Texte lu."}</span></div>
    ${ecoute ? `<button class="primaire" data-voir-texte>${ICONE_OEIL}Voir le texte</button>` : ""}
    ${apres ? `<a class="${ecoute ? "secondaire" : "primaire"}" href="#/lectures/${apres.id}" data-remplace>Texte suivant · ${esc(apres.titre)}</a>` : ""}
    <a class="secondaire" href="#/lectures" data-remplace>Retour aux lectures</a>`;
  fin.hidden = false;
  fin.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

export function ecranLectures(ctx, cible, mode) {
  const id = decodeURIComponent(cible || "");
  const t = id && trouver(id);
  if (t) return ecranTexte(ctx, t, mode);
  const n = /^n(\d+)$/.exec(id);
  return ecranListe(ctx, n ? Number(n[1]) : null);
}
