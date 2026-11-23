// Pratiquer une leçon (#/pratique/U1-L3, ou #/pratique/U1-L3/jour depuis Aujourd'hui) : une série d'exercices
// à écrire, à dire et de cartes. « Tes mots à revoir » (#/revision) : seulement des cartes, par paquets de 20.
// Seules les cartes mettent à jour la mémoire des mots. « Quitter » ramène là d'où tu viens.
// Après une erreur dans une leçon : pourquoi c'est la bonne réponse, et un lien vers la leçon (pas en révision).
// Sert aussi à la partie écrite d'un contrôle blanc (#/controle/U1/ecrit) : sans indice,
// avec l'explication de la règle après chaque réponse, et un bilan par thème à la fin.

import { esc, md, id, ICONES } from "../ui.js?v=28";
import { lecon as trouver } from "../position.js?v=28";
import { EXERCICES } from "../exercices.js?v=28";
import { corriger } from "../corriger.js?v=28";
import { noterMot, motsARevoir, cocher, cases, noterControle } from "../progression.js?v=28";
import { CONTROLES, tirerEcrit, phraseJuste, explicationConjugaison } from "../controles.js?v=28";
import { lancerLecture, arreterLecture } from "../lecture.js?v=28";
import { vibrer, son } from "../retours.js?v=28";
import {
  enregistrementPossible, demarrerEnregistrement, arreterEnregistrement,
  effacerEnregistrement, aUnEnregistrement,
} from "../enregistrement.js?v=28";

const mouvementReduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const pause = ms => new Promise(r => setTimeout(r, ms));

let s = null; // la série en cours

const cartes = mots => mots.map(m => ({ type: "carte", mot: m }));

function serieLecon(ctx, idLecon) {
  const l = trouver(idLecon);
  const ex = EXERCICES[idLecon] || { ecrire: [], dire: [] };
  return {
    titre: l ? `${l.id} · ${l.titre}` : idLecon, lecon: idLecon, revision: false,
    sansExercices: !EXERCICES[idLecon],
    items: [
      ...ex.ecrire.map(e => ({ type: "ecrire", lecon: idLecon, ...e })),
      ...ex.dire.map(e => ({ type: "dire", lecon: idLecon, ...e })),
      ...cartes(ctx.motsParLecon[idLecon] || []),
    ],
  };
}

// « Tes mots à revoir » : tous les mots dus, toutes leçons confondues, sauf ceux de la leçon faite aujourd'hui
// (ils sont dans la leçon du jour). Les plus en retard d'abord.
export const PAQUET = 20;
export function motsDus(ctx) {
  const { pos, motsParLecon, jour } = ctx;
  const mots = [...pos.faites].filter(l => pos.dateFaite[l] !== jour).flatMap(l => motsParLecon[l] || []);
  return motsARevoir(mots, jour, l => pos.dateFaite[l]);
}

function serieRevision(ctx) {
  return { titre: "Tes mots à revoir", revision: true, items: cartes(motsDus(ctx).slice(0, PAQUET)) };
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
      ${!it.controle && !s.revision && !ok ? `<a class="lien revoir" href="#/lecon/${it.lecon}/exercice">Revoir la leçon</a>` : ""}
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
  const tete = sorte(s.revision ? "Tes mots à revoir · carte" : "Carte · du français à l'espagnol");
  // En révision, la leçon d'où vient le mot. « Revoir la leçon » s'ouvre par-dessus la série, qui reprend au retour.
  const l = s.revision && trouver(m.lecon);
  const origine = l ? `<div class="origine"><span>${id(l.id)} · ${esc(l.titre)}</span><a class="lien" href="#/lecon/${l.id}/revision">Revoir la leçon</a></div>` : "";
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
      ${origine}
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

// Les boutons de fin remplacent la série dans l'historique (data-remplace) : le retour d'Android ne la relance pas.
const versAujourdhui = cls => `<a class="${cls}" href="#/" data-remplace>Revenir à aujourd'hui</a>`;

// La fin d'un paquet de « Tes mots à revoir » : pas de plafond, un autre paquet si tu veux.
function vueFinPaquet(ctx) {
  const n = s.notes.carte;
  const reste = motsDus(ctx).length;
  const mots = k => k ? `${k} mot${k > 1 ? "s" : ""}` : "aucun";
  return `<div class="fin">
      <h1>Paquet terminé</h1>
      <p class="sous">Tes mots à revoir</p>
      <ul class="bilan">
        <li><b>Trouvés</b><span>${n.filter(x => x === 3).length} sur ${n.length}</span></li>
        <li><b>À revoir bientôt</b><span>${mots(n.filter(x => x < 3).length)}</span></li>
      </ul>
      ${reste ? `<div class="reste">
          <b>Il te reste ${mots(reste)} à revoir</b>
          <p>Encore un paquet si tu as envie. Sinon, ils t'attendent demain.</p>
          <button class="primaire" data-p="continuer">Continuer · ${mots(Math.min(reste, PAQUET))}</button>
        </div>` : `<p class="sous">C'est tout : tes autres mots sont frais.</p>`}
    </div>
    <div class="espace"></div>
    ${versAujourdhui(reste ? "secondaire" : "primaire")}`;
}

function vueFin(ctx) {
  if (s.controle) return vueFinControle();
  if (s.revision) return vueFinPaquet(ctx);
  const n = s.notes;
  const justes = n.ecrire.filter(Boolean).length;
  const aide = k => n.aide[k] ? `, ${n.aide[k]} avec indice` : "";
  const ligne = (label, t, texte) => t.length ? `<li><b>${label}</b><span>${texte}</span></li>` : "";
  const oui = t => t.filter(x => x === 3).length;
  const depuisLecon = s.retour !== "#/";
  return `<div class="fin">
      <h1>Terminé</h1>
      <p class="sous">${esc(s.titre)}</p>
      <ul class="bilan">
        ${ligne("À écrire", n.ecrire, `${justes} sur ${n.ecrire.length} justes${aide("ecrire")}`)}
        ${ligne("À dire", n.dire, `${oui(n.dire)} sur ${n.dire.length} du premier coup${aide("dire")}`)}
        ${ligne("Cartes", n.carte, `${oui(n.carte)} sur ${n.carte.length} trouvées${aide("carte")}`)}
      </ul>
      ${n.carte.some(x => x < 3) ? `<p class="sous">Les mots ratés reviendront dès demain dans « Tes mots à revoir ».</p>` : ""}
    </div>
    <div class="espace"></div>
    ${depuisLecon ? `<a class="primaire" href="${s.retour}" data-remplace>Revenir à la leçon</a>${versAujourdhui("secondaire")}` : versAujourdhui("primaire")}`;
}

export function ecranPratique(ctx, idLecon, depuis) {
  const lecon = idLecon ? decodeURIComponent(idLecon) : null;
  const retour = !lecon || depuis === "jour" ? "#/" : `#/lecon/${lecon}`;
  return lecon
    ? ecranSerie(ctx, `lecon:${lecon}`, () => serieLecon(ctx, lecon), retour, "Cette leçon n'a pas encore de mots dans le tableau.")
    : ecranSerie(ctx, `revision:${ctx.jour}`, () => serieRevision(ctx), retour, "Rien à revoir aujourd'hui : tes mots sont frais.");
}

export function ecranEcritControle(ctx, idUnite) {
  return ecranSerie(ctx, `controle:${idUnite}`, () => serieControle(ctx, idUnite));
}

// retour : là d'où tu viens (pour « Quitter » et la fin). Une série reprise garde sa place mais prend le nouveau retour.
function ecranSerie(ctx, cle, construire, retour, vide = "") {
  if (!s || s.cle !== cle || s.fini) nouvelleSerie(ctx, cle, construire);
  if (retour) s.retour = retour;

  if (!s.items.length) {
    const titre = s.revision ? "Rien à revoir" : "Rien à pratiquer";
    s = null;
    return { onglet: null, html: `<main class="colonne vide"><h1>${titre}</h1>
        <p class="sous">${vide}</p>
        <a class="lien" href="${retour}">Revenir</a></main>` };
  }

  if (s.i >= s.items.length) {
    if (!s.fini) {
      s.fini = true;
      son("fin");
      // « Tes mots à revoir » : le nombre de mots revus aujourd'hui. La leçon du jour : les réussites du premier coup.
      if (s.revision) cocher(ctx.jour, "revision", (Number(cases(ctx.jour).revision) || 0) + s.items.length);
      if (s.lecon) {
        const n = s.notes;
        const ok = n.ecrire.filter(Boolean).length + [...n.dire, ...n.carte].filter(x => x === 3).length;
        cocher(ctx.jour, `exos:${s.lecon}`, { ok, sur: s.items.length });
      }
      if (s.controle) noterControle(s.controle, ctx.jour, Math.round((s.resultats.filter(x => x.ok).length / s.resultats.length) * 100));
    }
    return { onglet: null, html: `<main class="colonne exo">${vueFin(ctx)}</main>` };
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
    case "continuer": // un autre paquet de « Tes mots à revoir »
      nouvelleSerie(ctx, s.cle, () => serieRevision(ctx));
      s.retour = "#/";
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
