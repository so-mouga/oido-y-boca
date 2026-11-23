// Le contrôle blanc d'une unité (#/controle/U1) : une page avec deux parties.
// 1. La partie écrite (#/controle/U1/ecrit) : une série de pratique.js, corrigée et expliquée.
// 2. Ma présentation (#/controle/U1/presentation) : l'écrire, la relire avec les 6 points, puis la dire
//    à voix haute (un appui pour commencer, un pour arrêter), la réécouter à côté du modèle.
// Rien n'est écrit dans le Sheet : c'est le prof qui note le vrai contrôle.

import { esc, md, dateCourte, ICONES, barreOnglets } from "../ui.js?v=28";
import { UNITES } from "../position.js?v=28";
import { CONTROLES, nbQuestions } from "../controles.js?v=28";
import { resultatControle, textePresentation, garderPresentation } from "../progression.js?v=28";
import { ecranEcritControle } from "./pratique.js?v=28";
import {
  enregistrementPossible, demarrerEnregistrement, arreterEnregistrement, effacerEnregistrement, aUnEnregistrement,
} from "../enregistrement.js?v=28";
import { arreterLecture } from "../lecture.js?v=28";
import { vibrer, son } from "../retours.js?v=28";

const SECURITE = 180; // secondes : l'enregistrement s'arrête tout seul si on oublie de l'arrêter
const TOUR = 2 * Math.PI * 82; // le périmètre de l'anneau du chrono
const CROIX = ICONES.fermer;

// L'unité est-elle prête pour son contrôle blanc ? Toutes ses leçons faites, et des phrases écrites.
export const controlePret = (u, pos) => !!CONTROLES[u.id] && u.lecons.every(l => pos.faites.has(l.id));

// La ligne « dernière fois » : la date et le pourcentage de la partie écrite.
export function dernierResultat(idUnite) {
  const r = resultatControle(idUnite);
  return r ? `le ${dateCourte(r.le)} : ${r.score} %` : "";
}

// ——— la page du contrôle ———

function page(ctx, u) {
  const c = CONTROLES[u.id];
  const der = dernierResultat(u.id);
  const retour = `<header class="nav-haut"><a class="retour" href="#/livre/${u.id}">${ICONES.retour}Le livre</a><span class="sous">Unité ${u.n}</span></header>`;
  if (!controlePret(u, ctx.pos)) {
    return { onglet: "livre", html: `<main class="colonne lecon-page">${retour}
        <h1>Contrôle de l'unité ${u.n}</h1>
        <p class="sous">Le contrôle blanc s'ouvre quand les ${u.lecons.length} leçons de l'unité sont faites avec le prof.</p>
      </main>${barreOnglets("livre")}` };
  }
  return {
    onglet: "livre",
    html: `<main class="colonne lecon-page controle-page">
        ${retour}
        <div><h1>Contrôle de l'unité ${u.n}</h1><p class="sous">Un contrôle blanc pour t'entraîner. Le vrai se fait avec le prof.</p></div>
        <div class="carte-claire"><h2>Ce que le prof va vérifier</h2>
          <ul class="verifie">${c.verifie.map(v => `<li><span>${md(v)}</span></li>`).join("")}</ul></div>
        <a class="partie-ctl" href="#/controle/${u.id}/ecrit"><span class="n">1</span>
          <span class="txt"><b>La partie écrite</b><span>${nbQuestions(c)} questions · environ 15 min</span>${der ? `<span class="der">Dernière fois, ${esc(der)}</span>` : ""}</span>${ICONES.chevron}</a>
        <a class="partie-ctl" href="#/controle/${u.id}/presentation"><span class="n">2</span>
          <span class="txt"><b>Ma présentation</b><span>L'écrire, puis la dire à voix haute</span></span>${ICONES.chevron}</a>
        <div class="espace"></div>
        <p class="note-pied">Tes résultats restent sur ton téléphone. C'est le prof qui note le vrai contrôle.</p>
      </main>${barreOnglets("livre")}`,
  };
}

// ——— ma présentation ———

let p = null; // { u, etape: "ecrire" | "relire" | "dire" | "fin", texte, relu: Set, dit: Set, enreg, duree }

function arreterPresentation() {
  if (p?.enreg) { clearInterval(p.enreg.minuteur); p.enreg = null; }
  effacerEnregistrement();
}

const ETAPES = { ecrire: 0, relire: 1, dire: 2 };
const barre = () => {
  const n = ETAPES[p.etape];
  return `<header class="barre-ex">
    <a class="quitter" href="#/controle/${p.u}">${CROIX}Quitter</a>
    <span class="piste" role="progressbar" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${n}"><i style="width:${(n / 3) * 100}%"></i></span>
    <span class="compte">${n + 1} / 3</span>
  </header>`;
};
const sorte = texte => `<p class="sorte"><i aria-hidden="true"></i>${texte}</p>`;
const listePoints = c => `<ol class="six">${c.points.map(x => `<li><span>${md(x)}</span></li>`).join("")}</ol>`;
const coches = (c, quoi) => `<ul class="coches">${c.points.map((x, i) => {
  const on = p[quoi].has(i);
  return `<li><button class="case${on ? " on" : ""}" data-c="cocher" data-quoi="${quoi}" data-i="${i}" aria-pressed="${on}" aria-label="${on ? "Décocher" : "Cocher"}">${on ? ICONES.coche : ""}</button><span>${md(x)}</span></li>`;
}).join("")}</ul>`;
const minutes = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

function vuePresentation(c) {
  if (p.etape === "ecrire") {
    return `${barre()}${sorte("Ma présentation · à l'écrit")}
      <p class="enonce">Présente-toi en espagnol, comme à quelqu'un que tu rencontres.</p>
      ${listePoints(c)}
      <textarea class="texte" id="texte" lang="es" autocomplete="off" autocapitalize="sentences" spellcheck="false"
        placeholder="Me llamo…" aria-label="Ta présentation en espagnol">${esc(p.texte)}</textarea>
      ${p.astuce ? `<p class="astuce" role="status">${esc(p.astuce)}</p>` : ""}
      <div class="espace"></div>
      <button class="primaire" data-c="fini">J'ai fini</button>`;
  }
  if (p.etape === "relire") {
    return `${barre()}${sorte("Ma présentation · relis ton texte")}
      <p class="tape" lang="es">${esc(p.texte)}</p>
      <p class="question-note gauche">Coche ce que ton texte dit :</p>
      ${coches(c, "relu")}
      <details class="modele"><summary>Voir le modèle</summary><p lang="es">${esc(c.modele)}</p></details>
      <div class="espace"></div>
      <button class="primaire" data-c="oral">Passer à l'oral</button>
      <button class="secondaire" data-c="corriger">Corriger mon texte</button>`;
  }
  if (p.etape === "dire") {
    const sec = p.enreg ? Math.floor((Date.now() - p.enreg.debut) / 1000) : 0;
    const possible = enregistrementPossible();
    return `${barre()}${sorte("Ma présentation · à voix haute, environ 1 minute")}
      ${listePoints(c)}
      <div class="espace"></div>
      <div class="anneau" aria-hidden="true">
        <svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="82" class="fond"/><circle cx="90" cy="90" r="82" class="plein" stroke-dasharray="${TOUR}" stroke-dashoffset="${TOUR * (1 - Math.min(sec / 60, 1))}"/></svg>
        <p class="t"><span class="temps">${minutes(sec)}</span><small>${p.enreg ? "Je t'écoute…" : "Texte caché"}</small></p>
      </div>
      ${p.astuce ? `<p class="astuce" role="status">${esc(p.astuce)}</p>` : ""}
      <div class="espace"></div>
      ${possible
        ? `<button class="enreg${p.enreg ? " on" : ""}" data-c="enreg"><span class="pt" aria-hidden="true"></span>${p.enreg ? "Arrêter" : "Commencer"}</button>
           <p class="note-pied centre">Un appui pour commencer, un appui pour arrêter.</p>
           ${p.sansMicro ? `<button class="secondaire" data-c="sans-micro">Continuer sans enregistrer</button>` : ""}`
        : `<p class="sous">Dis-la à voix haute, puis passe à la suite.</p><button class="primaire" data-c="sans-micro">C'est dit</button>`}`;
  }
  // fin
  return `<div class="fin">
      <p class="sous">Ma présentation${p.duree ? ` · ${minutes(p.duree)}` : ""}</p>
      <h1>C'est dit</h1>
      <div class="deux">
        ${aUnEnregistrement() ? `<button data-voix aria-pressed="false">${ICONES.lecture}Ma voix</button>` : ""}
        <button data-dire="${esc(c.modele)}" aria-pressed="false">${ICONES.lecture}Le modèle</button>
      </div>
      <p class="question-note gauche">${aUnEnregistrement() ? "En réécoutant, coche" : "Coche"} ce que tu as dit :</p>
      ${coches(c, "dit")}
    </div>
    <div class="espace"></div>
    <div class="carte-claire blanca-ce-soir"><p>Ce soir, dis-la à Blanca, sans regarder ton texte.</p></div>
    <a class="primaire" href="#/controle/${p.u}">Revenir au contrôle</a>`;
}

function ecranPresentation(ctx, u) {
  if (!controlePret(u, ctx.pos)) return page(ctx, u);
  if (!p || p.u !== u.id) p = { u: u.id, etape: "ecrire", texte: textePresentation(u.id), relu: new Set(), dit: new Set(), enreg: null, duree: 0, astuce: "" };
  const c = CONTROLES[u.id];
  return {
    onglet: null,
    apres: () => {
      // Le brouillon est gardé à chaque lettre : rien n'est perdu si on quitte en cours de route.
      document.getElementById("texte")?.addEventListener("input", e => {
        p.texte = e.target.value;
        garderPresentation(p.u, p.texte);
      });
    },
    html: `<main class="colonne exo presentation">${vuePresentation(c)}</main>`,
  };
}

export function ecranControle(ctx, idUnite, partie) {
  const u = UNITES.find(x => x.id === decodeURIComponent(idUnite || ""));
  if (!u || !CONTROLES[u.id]) {
    return { onglet: "livre", html: `<main class="colonne vide"><h1>Contrôle introuvable</h1><a class="lien" href="#/livre">Revenir au livre</a></main>${barreOnglets("livre")}` };
  }
  if (partie === "ecrit" && controlePret(u, ctx.pos)) return ecranEcritControle(ctx, u.id);
  if (partie === "presentation") return ecranPresentation(ctx, u);
  // En revenant sur la page, la présentation repart de zéro la prochaine fois (le texte, lui, est gardé).
  arreterPresentation();
  p = null;
  return page(ctx, u);
}

// ——— les actions ———
// Renvoie "suivant" pour passer à l'étape suivante (avec la transition), true pour redessiner, false sinon.

function majChrono() {
  if (!p?.enreg) return;
  const sec = Math.floor((Date.now() - p.enreg.debut) / 1000);
  const t = document.querySelector(".anneau .temps");
  const plein = document.querySelector(".anneau .plein");
  if (t) t.textContent = minutes(sec);
  if (plein) plein.setAttribute("stroke-dashoffset", TOUR * (1 - Math.min(sec / 60, 1)));
  if (sec >= SECURITE) arreter();
}

let redessiner = () => {};
async function arreter() {
  const e = p.enreg;
  if (!e) return;
  p.enreg = null;
  clearInterval(e.minuteur);
  p.duree = Math.floor((Date.now() - e.debut) / 1000);
  vibrer(10);
  const garde = await arreterEnregistrement(p.duree >= 1);
  if (!garde) { p.astuce = "Rien n'a été enregistré. Réessaie."; redessiner(false); return; }
  p.astuce = "";
  p.etape = "fin";
  son("fin");
  redessiner("suivant");
}

export async function actionControle(ctx, action, el, rafraichir) {
  if (!p) return false;
  redessiner = rafraichir;
  switch (action) {
    case "fini":
      p.texte = document.getElementById("texte")?.value.trim() || "";
      if (!p.texte) { p.astuce = "Écris au moins une phrase avant de continuer."; return true; }
      garderPresentation(p.u, p.texte);
      p.astuce = ""; p.etape = "relire"; vibrer();
      return "suivant";
    case "corriger":
      p.etape = "ecrire";
      return "suivant";
    case "oral":
      p.etape = "dire";
      return "suivant";
    case "sans-micro":
      p.etape = "fin";
      return "suivant";
    case "cocher": {
      const t = p[el.dataset.quoi], i = Number(el.dataset.i);
      if (t.has(i)) t.delete(i); else t.add(i);
      vibrer();
      return true;
    }
    case "enreg": {
      if (p.enreg) { await arreter(); return false; }
      if (p.demarrage) return false;
      p.demarrage = true;
      arreterLecture();
      const ok = await demarrerEnregistrement();
      p.demarrage = false;
      if (ok) p.sansMicro = false;
      if (!ok) { p.sansMicro = true; p.astuce = "Le micro n'est pas disponible : dis-la à voix haute quand même."; return true; }
      vibrer(15);
      p.astuce = "";
      p.enreg = { debut: Date.now(), minuteur: setInterval(majChrono, 250) };
      return true;
    }
  }
  return false;
}
