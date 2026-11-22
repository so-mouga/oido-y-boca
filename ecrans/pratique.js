// Pratiquer une leçon (#/pratique/U1-L3) ou réviser (#/revision) : une série d'exercices
// à écrire, à dire et de cartes. Seules les cartes mettent à jour la mémoire des mots.

import { esc, ICONES } from "../ui.js?v=15";
import { lecon as trouver } from "../position.js?v=15";
import { EXERCICES } from "../exercices.js?v=15";
import { corriger } from "../corriger.js?v=15";
import { noterMot, leconsARevoir, cocher } from "../progression.js?v=15";
import { dire, taire } from "../voix.js?v=15";
import { vibrer, son } from "../retours.js?v=15";
import {
  enregistrementPossible, demarrerEnregistrement, arreterEnregistrement,
  reecouterEnregistrement, effacerEnregistrement, aUnEnregistrement,
} from "../enregistrement.js?v=15";

const mouvementReduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const pause = ms => new Promise(r => setTimeout(r, ms));

let s = null; // la série en cours

const hasard = t => t[Math.floor(Math.random() * t.length)];
const cartes = mots => mots.map(m => ({ type: "carte", mot: m }));

function serieLecon(ctx, idLecon) {
  const l = trouver(idLecon);
  const ex = EXERCICES[idLecon] || { ecrire: [], dire: [] };
  return {
    titre: l ? `${l.id} · ${l.titre}` : idLecon, retour: `#/lecon/${idLecon}`, revision: false,
    sansExercices: !EXERCICES[idLecon],
    items: [
      ...ex.ecrire.map(e => ({ type: "ecrire", ...e })),
      ...ex.dire.map(e => ({ type: "dire", ...e })),
      ...cartes(ctx.motsParLecon[idLecon] || []),
    ],
  };
}

// La révision : pour chaque leçon à revoir, une phrase à écrire, une à dire, et les cartes des mots à revoir.
function serieRevision(ctx) {
  const { pos, motsParLecon, jour } = ctx;
  const ids = pos.derniere ? leconsARevoir([...pos.faites], pos.derniere.id, motsParLecon, jour) : [];
  const items = ids.flatMap(i => {
    const ex = EXERCICES[i];
    return [
      ...(ex ? [{ type: "ecrire", ...hasard(ex.ecrire) }, { type: "dire", ...hasard(ex.dire) }] : []),
      ...cartes(motsParLecon[i] || []),
    ];
  });
  return { titre: `Révision · ${ids.join(" · ")}`, retour: "#/", revision: true, items };
}

function nouvelleSerie(ctx, cle, idLecon) {
  effacerEnregistrement();
  const base = idLecon ? serieLecon(ctx, idLecon) : serieRevision(ctx);
  s = { cle, ...base, i: 0, phase: "question", resultat: null, saisie: "", astuce: "", notes: { ecrire: [], dire: [], carte: [] } };
}

// ——— l'affichage ———

const barre = () => `<header class="barre-ex">
    <a class="quitter" href="${s.retour}">${ICONES.fermer}Quitter</a>
    <span class="piste" role="progressbar" aria-valuemin="0" aria-valuemax="${s.items.length}" aria-valuenow="${s.i}"><i style="width:${(s.i / s.items.length) * 100}%"></i></span>
    <span class="compte">${s.i + 1} / ${s.items.length}</span>
  </header>`;

const sorte = (texte) => `<p class="sorte"><i aria-hidden="true"></i>${texte}</p>`;
const ecouter = (texte, cls = "") => `<button class="ecoute ${cls}" data-dire="${esc(texte)}" aria-label="Écouter la réponse">${ICONES.play}</button>`;
const notes = (question, avecCriteres) => `<p class="question-note">${question}</p>
  <div class="notes">
    <button data-p="note" data-n="1">Non${avecCriteres ? "<small>pas trouvé</small>" : ""}</button>
    <button data-p="note" data-n="2">Avec peine${avecCriteres ? "<small>en cherchant</small>" : ""}</button>
    <button data-p="note" data-n="3">Oui${avecCriteres ? "<small>du premier coup</small>" : ""}</button>
  </div>`;

function vueEcrire(it) {
  const consigne = sorte(`À écrire · ${it.consigne.toLowerCase()}`);
  if (s.phase === "question") {
    return `${consigne}<p class="enonce">${esc(it.fr)}</p>
      <form class="saisie" data-p-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="Ta réponse en espagnol" value="${esc(s.saisie)}" aria-label="Ta réponse en espagnol">
        <div class="espace"></div>
        <button class="primaire" type="submit">Vérifier</button>
        <button class="secondaire" type="button" data-p="sais-pas">Je ne sais pas</button>
      </form>`;
  }
  const r = s.resultat;
  const ok = r.niveau === "juste" || r.niveau === "accents";
  const titre = { juste: "Juste", accents: "Juste, aux accents près", presque: "Presque : un mot", faux: "Pas encore", passe: "La réponse" }[r.niveau];
  const surligne = (morceaux, cls) => morceaux.map(m => m.juste ? esc(m.brut) : `<mark class="${cls}">${esc(m.brut)}</mark>`).join(" ");
  const tape = s.saisie && r.tape ? `<p class="tape">${surligne(r.tape, "faux")}</p>` : s.saisie ? `<p class="tape">${esc(s.saisie)}</p>` : "";
  const bonne = r.reponse ? surligne(r.reponse, "bon") : esc(r.attendu);
  return `${consigne}<p class="enonce">${esc(it.fr)}</p>
    ${tape}
    <div class="verdict ${ok ? "ok" : r.niveau === "passe" ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(r.attendu)}<p lang="es">${bonne}</p></div>
      ${r.niveau === "accents" ? `<p>Regarde les accents de la bonne réponse : à l'oral, ils disent où appuyer.</p>` : ""}
      ${r.astuce ? `<p>${esc(r.astuce)}</p>` : ""}
    </div>
    <div class="espace"></div>
    <button class="primaire" data-p="suivant">Suivant</button>`;
}

function vueDire(it) {
  const tete = `${sorte("À dire · à voix haute")}<p class="enonce">${esc(it.fr)}</p>`;
  if (s.phase === "question") {
    const micro = enregistrementPossible()
      ? `${s.astuce ? `<p class="astuce" role="status">${esc(s.astuce)}</p>` : ""}
        <button class="micro" data-micro aria-label="Reste appuyé pour t'enregistrer">${ICONES.micro}<span class="chrono">Appuie et reste appuyé pour parler</span></button>`
      : `<p class="sous">Dis-le à voix haute, puis regarde la réponse.</p>`;
    return `${tete}<div class="espace"></div>${micro}<div class="espace"></div><button class="secondaire" data-p="voir">Voir la réponse</button>`;
  }
  return `${tete}
    <div class="carte-reponse">
      <p class="sous">La réponse</p>
      <p class="es" lang="es">${esc(it.es)}</p>
      <div class="deux">
        <button data-dire="${esc(it.es)}">${ICONES.play}Le modèle</button>
        ${aUnEnregistrement() ? `<button data-p="ma-voix">${ICONES.play}Ma voix</button>` : ""}
      </div>
      ${enregistrementPossible() ? `<button class="reessai" data-micro><span class="chrono">${aUnEnregistrement() ? "Reste appuyé ici pour te réenregistrer" : "Reste appuyé ici pour t'enregistrer"}</span></button>` : ""}
      ${s.astuce ? `<p class="astuce" role="status">${esc(s.astuce)}</p>` : ""}
    </div>
    <div class="espace"></div>
    ${notes("Tu l'as trouvé ?", true)}`;
}

function vueCarte(it) {
  const m = it.mot;
  const tete = sorte("Carte · du français à l'espagnol");
  if (s.phase === "question") {
    return `${tete}<div class="carte"><p class="fr-seul">${esc(m.fr)}</p><p class="sous">Dis-le en espagnol, puis retourne la carte.</p></div>
      <div class="espace"></div><button class="primaire" data-p="voir">Retourner la carte</button>`;
  }
  return `${tete}<div class="carte${s.vientDeTourner ? " retournee" : ""}">
      <p class="fr">${esc(m.fr)}</p>
      <p class="es" lang="es">${esc(m.es)}</p>
      ${ecouter(m.ex ? `${m.es}. ${m.ex}` : m.es, "grand")}
      ${m.ex ? `<p class="exemple" lang="es">${esc(m.ex)}</p>` : ""}
    </div>
    <div class="espace"></div>
    ${notes("Tu l'avais trouvé avant de retourner la carte ?", false)}`;
}

function vueFin() {
  const n = s.notes;
  const justes = n.ecrire.filter(Boolean).length;
  const ligne = (label, t, texte) => t.length ? `<li><b>${label}</b><span>${texte}</span></li>` : "";
  const oui = t => t.filter(x => x === 3).length;
  return `<div class="fin">
      <h1>Terminé</h1>
      <p class="sous">${esc(s.titre)}</p>
      <ul class="bilan">
        ${ligne("À écrire", n.ecrire, `${justes} sur ${n.ecrire.length} justes`)}
        ${ligne("À dire", n.dire, `${oui(n.dire)} sur ${n.dire.length} du premier coup`)}
        ${ligne("Cartes", n.carte, `${oui(n.carte)} sur ${n.carte.length} trouvées`)}
      </ul>
      ${n.carte.some(x => x < 3) ? `<p class="sous">Les mots ratés reviendront plus vite dans tes révisions.</p>` : ""}
    </div>
    <div class="espace"></div>
    <a class="primaire" href="#/">Revenir à aujourd'hui</a>
    ${s.revision ? "" : `<a class="secondaire" href="${s.retour}">Revenir à la leçon</a>`}`;
}

export function ecranPratique(ctx, idLecon) {
  const cle = idLecon ? `lecon:${idLecon}` : `revision:${ctx.jour}`;
  if (!s || s.cle !== cle || s.fini) nouvelleSerie(ctx, cle, idLecon ? decodeURIComponent(idLecon) : null);

  if (!s.items.length) {
    s = null;
    return { onglet: null, html: `<main class="colonne vide"><h1>Rien à pratiquer</h1>
        <p class="sous">${idLecon ? "Cette leçon n'a pas encore de mots dans le tableau." : "Rien à réviser aujourd'hui : tout est frais."}</p>
        <a class="lien" href="${idLecon ? `#/lecon/${idLecon}` : "#/"}">Revenir</a></main>` };
  }

  if (s.i >= s.items.length) {
    if (!s.fini) {
      s.fini = true;
      son("fin");
      if (s.revision) cocher(ctx.jour, "revision", true);
    }
    return { onglet: null, html: `<main class="colonne exo">${vueFin()}</main>` };
  }

  const it = s.items[s.i];
  const vue = it.type === "ecrire" ? vueEcrire(it) : it.type === "dire" ? vueDire(it) : vueCarte(it);
  return {
    onglet: null,
    apres: () => {
      if (it.type === "ecrire" && s.phase === "question") document.getElementById("reponse")?.focus();
      if (it.type === "carte" && s.phase === "reponse" && !s.dit) { s.dit = true; dire(it.mot.es); }
      s.vientDeTourner = false;
    },
    html: `<main class="colonne exo">${barre()}${s.sansExercices && s.i === 0 ? `<p class="bandeau">Les exercices de cette unité ne sont pas encore écrits : pour l'instant, les cartes.</p>` : ""}${vue}</main>`,
  };
}

// ——— les actions ———

function suivant() {
  effacerEnregistrement();
  taire();
  s.i++; s.phase = "question"; s.resultat = null; s.saisie = ""; s.astuce = ""; s.dit = false;
}

// Renvoie "suivant" quand on passe à un autre exercice (l'écran change, avec la transition),
// true quand le même écran doit être redessiné, false sinon.
export async function actionPratique(ctx, action, el) {
  if (!s) return false;
  const it = s.items[s.i];
  switch (action) {
    case "verifier": {
      s.saisie = document.getElementById("reponse")?.value.trim() || "";
      if (!s.saisie) return false;
      s.resultat = corriger(s.saisie, it.es);
      s.notes.ecrire.push(s.resultat.niveau === "juste" || s.resultat.niveau === "accents");
      s.phase = "reponse";
      const ok = s.resultat.niveau === "juste" || s.resultat.niveau === "accents";
      vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
      return true;
    }
    case "sais-pas":
      s.saisie = ""; s.resultat = { niveau: "passe", attendu: it.es[0] };
      s.notes.ecrire.push(false); s.phase = "reponse";
      return true;
    case "voir":
      if (it.type === "carte" && !mouvementReduit()) {
        document.querySelector(".carte")?.classList.add("tourne");
        vibrer(8);
        await pause(220);
        s.vientDeTourner = true;
      }
      s.astuce = "";
      s.phase = "reponse";
      return true;
    case "ma-voix":
      reecouterEnregistrement();
      return false;
    case "note": {
      const n = Number(el.dataset.n);
      if (it.type === "carte") { noterMot(it.mot.id, n, ctx.jour); s.notes.carte.push(n); }
      else s.notes.dire.push(n);
      vibrer(); suivant();
      return "suivant";
    }
    case "suivant":
      suivant();
      return "suivant";
  }
  return false;
}

// ——— le micro : on enregistre tant que le doigt reste posé ———
// Un appui de moins d'une demi-seconde ne compte pas (et n'efface pas l'enregistrement précédent).

const MINIMUM = 500;
let appui = null; // { bouton, debut, relache, minuteur }

export async function microAppui(bouton) {
  if (!s || appui) return;
  const a = appui = { bouton, debut: Date.now(), relache: false, minuteur: null };
  const chrono = bouton.querySelector(".chrono");
  const texte = chrono?.textContent;
  bouton.classList.add("on");
  vibrer(15);
  if (chrono) chrono.textContent = "Je t'écoute…";
  const ok = await demarrerEnregistrement();
  if (appui !== a) return;
  if (!ok) {
    appui = null;
    bouton.classList.remove("on");
    if (chrono) chrono.textContent = texte;
    s.astuce = "Le micro n'est pas disponible : dis-le à voix haute, puis regarde la réponse.";
    return "redessiner";
  }
  if (a.relache) {
    // Le doigt est parti pendant que le micro s'ouvrait (souvent la première fois, à cause de l'autorisation).
    appui = null;
    await arreterEnregistrement(false);
    s.astuce = "Le micro est prêt. Reste appuyé pendant que tu parles.";
    return "redessiner";
  }
  a.debut = Date.now();
  a.minuteur = setInterval(() => {
    if (chrono) chrono.textContent = `Je t'écoute… ${((Date.now() - a.debut) / 1000).toFixed(1)} s`;
  }, 100);
}

// Renvoie true si l'écran doit être redessiné.
export async function microRelache() {
  const a = appui;
  if (!a || a.relache) return false;
  a.relache = true;
  if (!a.minuteur) return false; // le micro n'est pas encore ouvert : microAppui s'en occupe
  appui = null;
  clearInterval(a.minuteur);
  a.bouton.classList.remove("on");
  vibrer(10);
  const assezLong = Date.now() - a.debut >= MINIMUM;
  const garde = await arreterEnregistrement(assezLong);
  if (!garde) { s.astuce = "Reste appuyé pendant que tu parles."; return true; }
  s.astuce = "";
  s.phase = "reponse";
  return true;
}
