// Pratiquer une leçon (#/pratique/U1-L3) ou réviser (#/revision) : une série d'exercices
// à écrire, à dire et de cartes. Seules les cartes mettent à jour la mémoire des mots.
// Après une erreur dans une leçon : pourquoi c'est la bonne réponse, et un lien vers la leçon (pas en révision).
// Sert aussi à la partie écrite d'un contrôle blanc (#/controle/U1/ecrit) : sans indice,
// avec l'explication de la règle après chaque réponse, et un bilan par thème à la fin.

import { esc, md, ICONES } from "../ui.js?v=23";
import { lecon as trouver } from "../position.js?v=23";
import { EXERCICES } from "../exercices.js?v=23";
import { corriger } from "../corriger.js?v=23";
import { noterMot, leconsARevoir, cocher, noterControle } from "../progression.js?v=23";
import { CONTROLES, tirerEcrit, phraseJuste, explicationConjugaison } from "../controles.js?v=23";
import { lancerLecture, arreterLecture } from "../lecture.js?v=23";
import { vibrer, son } from "../retours.js?v=23";
import {
  enregistrementPossible, demarrerEnregistrement, arreterEnregistrement,
  effacerEnregistrement, aUnEnregistrement,
} from "../enregistrement.js?v=23";

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
      ...ex.ecrire.map(e => ({ type: "ecrire", lecon: idLecon, ...e })),
      ...ex.dire.map(e => ({ type: "dire", lecon: idLecon, ...e })),
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
      ...(ex ? [{ type: "ecrire", lecon: i, ...hasard(ex.ecrire) }, { type: "dire", lecon: i, ...hasard(ex.dire) }] : []),
      ...cartes(motsParLecon[i] || []),
    ];
  });
  return { titre: `Révision · ${ids.join(" · ")}`, retour: "#/", revision: true, items };
}

// La partie écrite du contrôle blanc : les questions tirées au hasard, thème après thème.
function serieControle(ctx, idUnite) {
  const c = CONTROLES[idUnite];
  const mots = Object.entries(ctx.motsParLecon).filter(([l]) => l.startsWith(`${idUnite}-`)).flatMap(([, m]) => m);
  return { titre: `Contrôle blanc · unité ${idUnite.slice(1)}`, retour: `#/controle/${idUnite}`, controle: idUnite, items: tirerEcrit(c, mots) };
}

function nouvelleSerie(ctx, cle, construire) {
  effacerEnregistrement();
  const base = construire();
  s = { cle, ...base, resultats: [], i: 0, phase: "question", resultat: null, saisie: "", astuce: "", indice: 0, notes: { ecrire: [], dire: [], carte: [], aide: { ecrire: 0, dire: 0, carte: 0 } } };
}

// ——— l'affichage ———

const barre = () => `<header class="barre-ex">
    <a class="quitter" href="${s.retour}">${ICONES.fermer}Quitter</a>
    <span class="piste" role="progressbar" aria-valuemin="0" aria-valuemax="${s.items.length}" aria-valuenow="${s.i}"><i style="width:${((s.depuis ?? s.i) / s.items.length) * 100}%"></i></span>
    <span class="compte">${s.i + 1} / ${s.items.length}</span>
  </header>`;

const sorte = (texte) => `<p class="sorte"><i aria-hidden="true"></i>${texte}</p>`;
const ecouter = (texte, cls = "") => `<button class="ecoute ${cls}" data-dire="${esc(texte)}" aria-label="Écouter la réponse" aria-pressed="false">${ICONES.lecture}</button>`;
// Avec un indice, « Oui du premier coup » n'aurait plus de sens : il reste « Non » et « Avec l'indice ».
const notes = (question, avecCriteres) => s.indice
  ? `<p class="question-note">${question}</p>
  <div class="notes">
    <button data-p="note" data-n="1">Non${avecCriteres ? "<small>pas trouvé</small>" : ""}</button>
    <button data-p="note" data-n="2">Avec l'indice${avecCriteres ? "<small>trouvé grâce à lui</small>" : ""}</button>
  </div>`
  : `<p class="question-note">${question}</p>
  <div class="notes">
    <button data-p="note" data-n="1">Non${avecCriteres ? "<small>pas trouvé</small>" : ""}</button>
    <button data-p="note" data-n="2">Avec peine${avecCriteres ? "<small>en cherchant</small>" : ""}</button>
    <button data-p="note" data-n="3">Oui${avecCriteres ? "<small>du premier coup</small>" : ""}</button>
  </div>`;

// ——— l'indice : deux étapes au plus ———
// 1. la règle de la leçon (la grammaire du livre) ; 2. la première lettre de chaque mot (« V··· e· H····· »).
// Pour une carte, une seule étape : la première lettre.

const reponseDe = it => it.type === "ecrire" ? it.es[0] : it.type === "dire" ? it.es : it.mot.es;
const initiales = texte => texte.replace(/\p{L}+/gu, mot => mot[0] + "·".repeat(mot.length - 1));

// La règle de la leçon (la grammaire du livre), avec une majuscule.
function regleDe(it) {
  const regle = it.type !== "carte" && trouver(it.lecon)?.grammaire;
  return regle ? regle.charAt(0).toUpperCase() + regle.slice(1) : "";
}

// Après une erreur, la règle ne s'affiche que si elle concerne la phrase : au moins un mot de la bonne réponse
// se retrouve dans ses exemples en italique (*vivo, vives…*). Sans accents ni majuscules, comme corriger.js.
// Les noms propres des exemples (*vivo en Huesca*) ne comptent pas.
const sansAccents = t => t.toLowerCase().replace(/ñ/g, "\u0001").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0001/g, "ñ");
const motsDe = t => t.match(/\p{L}+/gu) || [];
function regleConcerne(it) {
  const exemples = new Set([...regleDe(it).matchAll(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g)]
    .flatMap(m => motsDe(m[1]).filter((w, i) => i === 0 || w[0] === w[0].toLowerCase()).map(sansAccents)));
  return motsDe(reponseDe(it)).some(w => exemples.has(sansAccents(w)));
}

function etapesIndice(it) {
  const etapes = [];
  const regle = regleDe(it);
  if (regle) etapes.push(`<p class="regle">${md(regle)}</p>`);
  etapes.push(`<p class="initiales" lang="es">${esc(initiales(reponseDe(it)))}</p>`);
  return etapes;
}

const zoneIndice = it => `<div class="zone-indice" role="status">${s.indice ? `<div class="indice">${etapesIndice(it).slice(0, s.indice).join("")}</div>` : ""}</div>`;
function boutonIndice(it) {
  if (it.controle) return "";
  if (etapesIndice(it).length - s.indice <= 0) return "";
  return `<button class="secondaire" type="button" data-p="indice" data-garde-focus>${s.indice ? "Un autre indice" : "Un indice"}</button>`;
}

// Pendant la question, le champ et les boutons restent collés en bas (juste au-dessus du clavier quand il est ouvert) ;
// le haut (barre, phrase, indice) défile s'il manque de place.
function vueEcrire(it, enTete) {
  const consigne = sorte(`À écrire · ${it.consigne.toLowerCase()}`);
  if (s.phase === "question") {
    return `<div class="defile">${enTete}${consigne}<p class="enonce">${esc(it.fr)}</p>${zoneIndice(it)}</div>
      <form class="saisie" data-p-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="Ta réponse en espagnol" value="${esc(s.saisie)}" aria-label="Ta réponse en espagnol">
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides">${boutonIndice(it)}<button class="secondaire" type="button" data-p="sais-pas">Je ne sais pas</button></div>
      </form>`;
  }
  const r = s.resultat;
  const ok = r.niveau === "juste" || r.niveau === "accents";
  // « Presque : un mot » n'a pas de sens quand la réponse n'a qu'un mot (« Complète ») : c'est « Pas encore ».
  const unSeulMot = r.attendu.trim().split(/\s+/).length === 1;
  const titre = { juste: s.indice ? "Juste, avec un indice" : "Juste", accents: "Juste, aux accents près", presque: unSeulMot ? "Pas encore" : "Presque : un mot", faux: "Pas encore", passe: "La réponse" }[r.niveau];
  const surligne = (morceaux, cls) => morceaux.map(m => m.juste ? esc(m.brut) : `<mark class="${cls}">${esc(m.brut)}</mark>`).join(" ");
  const tape = s.saisie && r.tape ? `<p class="tape">${surligne(r.tape, "faux")}</p>` : s.saisie ? `<p class="tape">${esc(s.saisie)}</p>` : "";
  const bonne = r.reponse ? surligne(r.reponse, "bon") : esc(r.attendu);
  return `${enTete}${consigne}<p class="enonce">${esc(it.fr)}</p>
    ${tape}
    <div class="verdict ${ok ? "ok" : r.niveau === "passe" ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(r.attendu)}<p lang="es">${bonne}</p></div>
      ${r.niveau === "accents" ? `<p>Regarde les accents de la bonne réponse : à l'oral, ils disent où appuyer.</p>` : ""}
      ${r.astuce ? `<p>${esc(r.astuce)}</p>` : ""}
      ${it.controle || !ok ? explication(it) : ""}
      ${!it.controle && !s.revision && !ok ? `<a class="lien revoir" href="#/lecon/${it.lecon}">Revoir la leçon</a>` : ""}
    </div>
    <div class="espace"></div>
    <button class="primaire" data-p="suivant">Suivant</button>`;
}

// Pourquoi c'est la bonne réponse : l'explication écrite pour la phrase s'il y en a une,
// sinon la conjugaison calculée (verbe v, personne p), la phrase d'exemple du mot (contrôle),
// ou, dans les leçons, la règle de la leçon quand elle concerne la phrase.
function explication(it) {
  if (it.expl) return `<p class="explication">${md(it.expl)}</p>`;
  if (it.v) return `<p class="explication">${md(explicationConjugaison(it.v, it.p))}</p>`;
  if (it.exemple) return `<p class="explication">Exemple : <span lang="es">${esc(it.exemple)}</span></p>`;
  if (!it.controle && regleConcerne(it)) return `<p class="explication">${md(regleDe(it))}</p>`;
  return "";
}

function vueDire(it) {
  const tete = `${sorte("À dire · à voix haute")}<p class="enonce">${esc(it.fr)}</p>`;
  if (s.phase === "question") {
    const micro = enregistrementPossible()
      ? `${s.astuce ? `<p class="astuce" role="status">${esc(s.astuce)}</p>` : ""}
        <button class="micro" data-micro aria-label="Reste appuyé pour t'enregistrer">${ICONES.micro}<span class="chrono">Appuie et reste appuyé pour parler</span></button>`
      : `<p class="sous">Dis-le à voix haute, puis regarde la réponse.</p>`;
    return `${tete}${zoneIndice(it)}<div class="espace"></div>${micro}<div class="espace"></div>
      <div class="aides">${boutonIndice(it)}<button class="secondaire" data-p="voir">Voir la réponse</button></div>`;
  }
  return `${tete}
    <div class="carte-reponse">
      <p class="sous">La réponse</p>
      <p class="es" lang="es">${esc(it.es)}</p>
      <div class="deux">
        <button data-dire="${esc(it.es)}" aria-pressed="false">${ICONES.lecture}Le modèle</button>
        ${aUnEnregistrement() ? `<button data-voix aria-pressed="false">${ICONES.lecture}Ma voix</button>` : ""}
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
      ${zoneIndice(it)}
      <div class="espace"></div><button class="primaire" data-p="voir">Retourner la carte</button>${boutonIndice(it)}`;
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

// La fin de la partie écrite : le pourcentage, le détail par thème, et les erreurs avec leur explication.
// Rien n'est gardé des erreurs ; seul le dernier pourcentage reste sur le téléphone.
function vueFinControle() {
  const r = s.resultats;
  const score = Math.round((r.filter(x => x.ok).length / r.length) * 100);
  const themes = [...new Set(r.map(x => x.it.theme))].map(t => {
    const du = r.filter(x => x.it.theme === t);
    return `<li><b>${esc(t)}</b><span>${du.filter(x => x.ok).length} sur ${du.length}</span></li>`;
  }).join("");
  const erreurs = r.filter(x => !x.ok).map(({ it, saisie }) => `<li>
      <p lang="es">${phraseJuste(it)}</p>
      <span>${it.fr.includes("___") ? "" : `${esc(it.fr)} · `}${saisie ? `tu as écrit « <span lang="es">${esc(saisie)}</span> »` : "tu n'as pas trouvé"}</span>
      ${explication(it)}
    </li>`).join("");
  return `<div class="fin resultat">
      <p class="sous">${esc(s.titre)}</p>
      <h1>Partie écrite : ${score} %</h1>
      <p class="reste-oral">Il reste l'oral : c'est lui qui compte le plus face au prof.</p>
      <ul class="bilan">${themes}</ul>
      ${erreurs ? `<section aria-labelledby="t-erreurs"><h2 id="t-erreurs">Tes erreurs</h2><ul class="erreurs">${erreurs}</ul></section>` : `<p class="sous">Aucune erreur.</p>`}
    </div>
    <div class="espace"></div>
    <a class="primaire" href="#/controle/${s.controle}/presentation">Passer à ma présentation</a>
    <a class="secondaire" href="${s.retour}">Revenir au contrôle</a>`;
}

function vueFin() {
  if (s.controle) return vueFinControle();
  const n = s.notes;
  const justes = n.ecrire.filter(Boolean).length;
  const aide = k => n.aide[k] ? `, ${n.aide[k]} avec indice` : "";
  const ligne = (label, t, texte) => t.length ? `<li><b>${label}</b><span>${texte}</span></li>` : "";
  const oui = t => t.filter(x => x === 3).length;
  return `<div class="fin">
      <h1>Terminé</h1>
      <p class="sous">${esc(s.titre)}</p>
      <ul class="bilan">
        ${ligne("À écrire", n.ecrire, `${justes} sur ${n.ecrire.length} justes${aide("ecrire")}`)}
        ${ligne("À dire", n.dire, `${oui(n.dire)} sur ${n.dire.length} du premier coup${aide("dire")}`)}
        ${ligne("Cartes", n.carte, `${oui(n.carte)} sur ${n.carte.length} trouvées${aide("carte")}`)}
      </ul>
      ${n.carte.some(x => x < 3) ? `<p class="sous">Les mots ratés reviendront plus vite dans tes révisions.</p>` : ""}
    </div>
    <div class="espace"></div>
    <a class="primaire" href="#/">Revenir à aujourd'hui</a>
    ${s.revision ? "" : `<a class="secondaire" href="${s.retour}">Revenir à la leçon</a>`}`;
}

export function ecranPratique(ctx, idLecon) {
  const cle = idLecon ? `lecon:${idLecon}` : `revision:${ctx.jour}`;
  const id = idLecon ? decodeURIComponent(idLecon) : null;
  return ecranSerie(ctx, cle, () => id ? serieLecon(ctx, id) : serieRevision(ctx), idLecon);
}

export function ecranEcritControle(ctx, idUnite) {
  return ecranSerie(ctx, `controle:${idUnite}`, () => serieControle(ctx, idUnite));
}

function ecranSerie(ctx, cle, construire, idLecon) {
  if (!s || s.cle !== cle || s.fini) nouvelleSerie(ctx, cle, construire);

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
      if (s.controle) noterControle(s.controle, ctx.jour, Math.round((s.resultats.filter(x => x.ok).length / s.resultats.length) * 100));
    }
    return { onglet: null, html: `<main class="colonne exo">${vueFin()}</main>` };
  }

  const it = s.items[s.i];
  const enTete = `${barre()}${s.sansExercices && s.i === 0 ? `<p class="bandeau">Les exercices de cette unité ne sont pas encore écrits : pour l'instant, les cartes.</p>` : ""}`;
  const question = it.type === "ecrire" && s.phase === "question";
  const vue = it.type === "ecrire" ? vueEcrire(it, enTete) : enTete + (it.type === "dire" ? vueDire(it) : vueCarte(it));
  return {
    onglet: null,
    apres: () => {
      // La barre avance sous tes yeux : elle part de la question précédente et glisse jusqu'à celle-ci.
      if (s.depuis != null) {
        const trait = document.querySelector(".piste i");
        s.depuis = null;
        requestAnimationFrame(() => requestAnimationFrame(() => { if (trait) trait.style.width = `${(s.i / s.items.length) * 100}%`; }));
      }
      // Le clavier monte une fois la nouvelle question arrivée, pas pendant qu'elle glisse.
      if (it.type === "ecrire" && s.phase === "question") {
        const i = s.i;
        setTimeout(() => { if (s?.i === i && s.phase === "question") document.getElementById("reponse")?.focus({ preventScroll: true }); }, 400);
      }
      // La carte retournée dit le mot toute seule, et son bouton s'allume pendant ce temps.
      if (it.type === "carte" && s.phase === "reponse" && !s.dit) {
        s.dit = true;
        const b = document.querySelector(".carte .ecoute");
        if (b) { const tout = b.dataset.dire; b.dataset.dire = it.mot.es; lancerLecture(b); b.dataset.dire = tout; }
      }
      s.vientDeTourner = false;
    },
    html: `<main class="colonne exo${question ? " ecrire-q" : ""}">${vue}</main>`,
  };
}

// ——— les actions ———

function suivant() {
  effacerEnregistrement();
  arreterLecture();
  s.depuis = s.i;
  s.i++; s.phase = "question"; s.resultat = null; s.saisie = ""; s.astuce = ""; s.indice = 0; s.dit = false;
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
      const ok = s.resultat.niveau === "juste" || s.resultat.niveau === "accents";
      s.notes.ecrire.push(ok);
      s.resultats.push({ it, ok, saisie: s.saisie });
      if (s.indice) s.notes.aide.ecrire++;
      s.phase = "reponse";
      vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
      return true;
    }
    case "sais-pas":
      s.saisie = ""; s.resultat = { niveau: "passe", attendu: it.es[0] };
      s.notes.ecrire.push(false); s.resultats.push({ it, ok: false, saisie: "" }); s.phase = "reponse";
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
    case "indice": {
      // L'indice s'ajoute sans redessiner l'écran : ta saisie et le clavier restent en place.
      s.indice++;
      document.querySelector(".zone-indice")?.replaceWith(document.createRange().createContextualFragment(zoneIndice(it)));
      const defile = document.querySelector(".defile");
      if (defile) defile.scrollTop = defile.scrollHeight;
      if (boutonIndice(it)) el.textContent = "Un autre indice"; else el.remove();
      vibrer(8);
      return false;
    }
    case "note": {
      const n = Number(el.dataset.n);
      if (s.indice && it.type !== "ecrire") s.notes.aide[it.type]++;
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
