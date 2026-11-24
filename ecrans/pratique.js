// Pratiquer une leçon (#/pratique/U1-L3, ou #/pratique/U1-L3/jour depuis Aujourd'hui) : une série d'exercices
// à écrire, à dire et de cartes. « Tes mots à revoir » (#/revision) : seulement des cartes, par paquets de 20.
// Seules les cartes mettent à jour la mémoire des mots. « Quitter » ramène là d'où tu viens.
// Après une erreur dans une leçon : pourquoi c'est la bonne réponse, et un lien vers la leçon (pas en révision).
// Le bonus (#/bonus/U1-L1/jour ou …/lecon) : « Encore 6 pour t'entraîner », proposé à la fin d'une leçon
// qui a une réserve dans bonus.js. Facultatif : rien n'est coché, aucune carte, la révision n'est pas touchée.
// Sert aussi à la partie écrite d'un contrôle blanc (#/controle/U1/ecrit) : sans indice,
// avec l'explication de la règle après chaque réponse, et un bilan par thème à la fin.

import { esc, md, id, ICONES } from "../ui.js?v=60";
import { lecon as trouver } from "../position.js?v=60";
import { EXERCICES } from "../exercices.js?v=60";
import { corriger } from "../corriger.js?v=60";
import { noterMot, motsARevoir, cocher, cases, noterControle, monMot, apprisEnAvance, fichesErreurs, noterErreur } from "../progression.js?v=60";
import { carnetActuel, cartesDuJour, juger, jugerCases, decouper, nouvelleFiche, quandRevient, SUJETS } from "../carnet.js?v=60";
import { CONTROLES, tirerEcrit, phraseJuste, explicationConjugaison, conjuguer, sixFormes, PERSONNES, formesSurlignees, regleVerbe, reglesVerbe, TEMPS } from "../controles.js?v=60";
import { BONUS } from "../bonus.js?v=60";
import { verbeDe, motsAMoi, origineMonMot } from "../dico.js?v=60";
import { lancerLecture, arreterLecture } from "../lecture.js?v=60";
import { phraseTouchable, marquesDe } from "../toucher.js?v=60";
import { vibrer, son } from "../retours.js?v=60";
import {
  enregistrementPossible, demarrerEnregistrement, arreterEnregistrement,
  effacerEnregistrement, aUnEnregistrement,
} from "../enregistrement.js?v=60";

const mouvementReduit = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const pause = ms => new Promise(r => setTimeout(r, ms));

let s = null; // la série en cours
let ctxVue = null; // pour les phrases qu'on touche (toucher.js)

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
// (ils sont dans la leçon du jour). Avec mes mots et les mots du livre appris en avance, à partir du lendemain.
// Un mot appris en avance compte depuis ce jour-là, même une fois sa leçon faite : il garde sa révision.
export const PAQUET = 20;
export function motsDus(ctx) {
  const { pos, motsParLecon, jour } = ctx;
  const mots = [...pos.faites].filter(l => pos.dateFaite[l] !== jour).flatMap(l => motsParLecon[l] || []);
  const enAvance = ctx.mots.filter(m => !pos.faites.has(m.lecon) && apprisEnAvance(m.id) && apprisEnAvance(m.id) < jour);
  const aMoi = motsAMoi().filter(m => m.le < jour);
  return motsARevoir([...mots, ...enAvance, ...aMoi], jour, m => m.moi ? m.le : apprisEnAvance(m.id) || pos.dateFaite[m.lecon]);
}

function serieRevision(ctx) {
  return { titre: "Tes mots à revoir", revision: true, faites: ctx.pos.faites, items: cartes(motsDus(ctx).slice(0, PAQUET)) };
}

// « Mes erreurs » (#/erreurs, chantier 11) : les cartes du jour tirées du carnet du prof, 5 au plus (carnet.js).
// Une erreur : « Corrige : … », tu écris la bonne forme (accents obligatoires). Une phrase personnalisée : à redire de mémoire.
// Chaque réponse met à jour la fiche de la carte tout de suite : quitter au milieu garde ce qui est fait.
function serieErreurs(ctx) {
  const items = cartesDuJour(carnetActuel(), fichesErreurs(), ctx.jour).map(carte => {
    // Plusieurs fautes sur une ligne : une case par faute (Q11-11).
    if (carte.type === "erreur") return { type: "erreur", carte, es: [carte.bonne], cases: decouper(carte) };
    const l = trouver(carte.lecon);
    return { type: "dire", phrase: carte, es: carte.es, fr: `Ta phrase de ${carte.lecon}${l ? ` · ${l.titre}` : ""}`, sujet: SUJETS[carte.lecon] || "" };
  });
  return { titre: "Mes erreurs", erreurs: true, items };
}

// La partie écrite du contrôle blanc : les questions tirées au hasard, thème après thème.
function serieControle(ctx, idUnite) {
  const c = CONTROLES[idUnite];
  const mots = Object.entries(ctx.motsParLecon).filter(([l]) => l.startsWith(`${idUnite}-`)).flatMap(([, m]) => m);
  return { titre: `Contrôle blanc · unité ${idUnite.slice(1)}`, retour: `#/controle/${idUnite}`, controle: idUnite, items: tirerEcrit(c, mots) };
}

// Le bonus : 5 phrases et 1 tableau « tout le verbe » (ou 6 phrases sans tableau), tirés au hasard.
// « Encore 6 » prend d'abord les phrases pas encore tirées depuis l'ouverture de l'appli.
const melanger = t => {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
const dejaTires = {};
function tirer(liste, n, cle) {
  const vus = dejaTires[cle] ||= new Set();
  const r = melanger(liste.filter(x => !vus.has(x))).slice(0, n);
  if (r.length < n) { vus.clear(); r.push(...melanger(liste.filter(x => !r.includes(x))).slice(0, n - r.length)); }
  r.forEach(x => vus.add(x));
  return r;
}

// t (le temps : "pc", "ps", "imp" ; absent = présent) se donne pour toute la réserve, ou phrase par phrase.
function serieBonus(idLecon) {
  const b = BONUS[idLecon];
  const commun = { bonus: true, lecon: idLecon, nom: b.nom };
  const phrases = tirer(b.phrases, b.tableaux ? 5 : 6, idLecon).map(ph => ({
    type: "ecrire", ...commun, consigne: b.consigne || "Complète", t: b.t, ...ph,
    es: ph.es || [conjuguer(ph.v, ph.p, ph.d, ph.t || b.t)],
    sens: [ph.sens && `${ph.v} = ${ph.sens}`, ph.mot].filter(Boolean).join(" · "),
    expl: ph.expl || (ph.v ? undefined : b.regle),
  }));
  const tableau = b.tableaux ? tirer(b.tableaux, 1, `${idLecon}:tableau`).map(x => {
    const t = x.t || b.t;
    return {
      type: "tableau", ...commun, consigne: `Conjugue tout le verbe${t && t !== "present" ? ` ${t === "imp" ? "à l'" : "au "}${TEMPS[t].nom}` : ""}`,
      v: x.v, d: x.d, t, sens: x.sens ? `${x.v} = ${x.sens}` : "", es: sixFormes(x.v, x.d, t),
    };
  }) : [];
  return { titre: `Entraînement · ${b.nom}`, bonus: idLecon, items: [...phrases, ...tableau] };
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

const reponseDe = it => it.type === "ecrire" || it.type === "erreur" ? it.es[0] : it.type === "dire" ? it.es : it.mot.es;
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
  // Mes erreurs : un seul indice, la « Règle en une ligne » du carnet.
  if (it.type === "erreur") return it.carte.regle ? [`<p class="regle">${esc(it.carte.regle)}</p>`] : [];
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
  const consigne = it.bonus
    ? `${sorte(`Entraînement · ${esc(it.nom)}`)}<p class="consigne">${esc(it.consigne)}</p>`
    : sorte(`À écrire · ${it.consigne.toLowerCase()}`);
  // Toucher un mot (chantier 10) : une phrase espagnole à compléter se touche pendant la question (pas pendant un contrôle) ;
  // après la réponse, la phrase complète se touche, la réponse surlignée. Un « Traduis » montre du français : rien à toucher
  // avant la réponse ; après, c'est la bonne réponse qui se touche. La traduction de l'auteur (trad) ne donne jamais la forme.
  const trou = it.fr.includes("___");
  const sens = it.sens ? `<p class="sens" lang="es">${esc(it.sens)}</p>` : "";
  let enonce = `<p class="enonce">${esc(it.fr)}</p>${sens}`;
  if (trou && s.phase === "question" && !it.controle) {
    enonce = `<p class="enonce">${phraseTouchable(ctxVue, it.fr, { fr: it.trad, extras: it.sens })}</p>${sens}`;
  } else if (trou && s.phase !== "question") {
    const reponse = it.es[0], debut = it.fr.indexOf("___");
    const complete = it.fr.replace("___", reponse);
    enonce = `<p class="enonce">${phraseTouchable(ctxVue, complete, { fr: it.trad, extras: it.sens, marques: [{ debut, fin: debut + reponse.length, cls: "bon" }] })}</p>${sens}`;
  }
  if (s.phase === "question") {
    return `<div class="defile">${enTete}${consigne}${enonce}${zoneIndice(it)}</div>
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
  const bonne = trou ? (r.reponse ? surligne(r.reponse, "bon") : esc(r.attendu))
    : phraseTouchable(ctxVue, r.attendu, { marques: marquesDe(r.attendu, r.reponse, "bon") });
  return `${enTete}${consigne}${enonce}
    ${tape}
    <div class="verdict ${ok ? "ok" : r.niveau === "passe" ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(r.attendu)}<p lang="es">${bonne}</p></div>
      ${r.niveau === "accents" ? `<p>Regarde les accents de la bonne réponse : à l'oral, ils disent où appuyer.</p>` : ""}
      ${r.astuce ? `<p>${esc(r.astuce)}</p>` : ""}
      ${it.controle || it.bonus || !ok ? explication(it) : ""}
      ${it.v && !it.controle ? lesSixFormes(it.v, it.d, it.p, it.t) : ""}
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
  if (it.v) return `<p class="explication">${md(explicationConjugaison(it.v, it.p, it.d, it.t))}</p>`;
  if (it.exemple) return `<p class="explication">Exemple : <span lang="es">${esc(it.exemple)}</span></p>`;
  if (!it.controle && regleConcerne(it)) return `<p class="explication">${md(regleDe(it))}</p>`;
  return "";
}

// « Les 6 formes » : fermé par défaut, la forme de la phrase surlignée ; terminaisons et voyelle comme dans le Dico.
// Au passé, le temps est dit dans le titre (« Les 6 formes · passé composé »).
const surligne = f => esc(f).replace(/\*\*(.+?)\*\*/g, `<span class="term">$1</span>`);
function lesSixFormes(v, d, p, t) {
  const f = formesSurlignees(v, d, t);
  return `<details class="six-formes"><summary>Les 6 formes${t && t !== "present" ? ` · ${TEMPS[t].nom}` : ""}</summary><dl>${PERSONNES.map((per, i) =>
    `<dt>${per}</dt><dd lang="es"${i === p ? ' class="ici"' : ""}>${surligne(f[i])}</dd>`).join("")}</dl></details>`;
}

// Le tableau « tout le verbe » : les 6 personnes d'un coup, vérifiées en une fois.
function vueTableau(it, enTete) {
  const tete = `${enTete}${sorte(`Entraînement · ${esc(it.nom)}`)}<p class="consigne">${esc(it.consigne)}</p>
    <p class="enonce" lang="es">${esc(it.v)}</p>${it.sens ? `<p class="sens" lang="es">${esc(it.sens)}</p>` : ""}`;
  if (s.phase === "question") {
    return `${tete}
      <form class="tableau" data-p-form>
        <div class="grille">${PERSONNES.map((per, i) => `<label for="forme${i}">${per}</label>
          <input id="forme${i}" data-forme lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            enterkeyhint="${i < 5 ? "next" : "done"}" value="${esc(s.formes?.[i] || "")}">`).join("")}</div>
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides"><button class="secondaire" type="button" data-p="sais-pas">Je ne sais pas</button></div>
      </form>`;
  }
  const r = s.resultat;
  const n = r.lignes.filter(l => l.ok).length;
  const titre = r.passe ? "La réponse" : n === 6 ? "Juste" : `Pas encore : ${n} sur 6`;
  const lignes = r.lignes.map((l, i) => `<dt>${PERSONNES[i]}</dt><dd lang="es">${l.ok
    ? `${esc(l.attendu)}${l.accents ? ` <small>(accent)</small>` : ""}`
    : `${l.saisie ? `<s>${esc(l.saisie)}</s> ` : ""}<b>${esc(l.attendu)}</b>`}</dd>`).join("");
  return `${tete}
    <div class="verdict ${n === 6 ? "ok" : r.passe ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <dl class="formes-tableau">${lignes}</dl>
      ${n < 6 ? `<p class="explication">${md(regleVerbe(it.v, it.d, it.t))}</p>` : ""}
    </div>
    <div class="espace"></div>
    <button class="primaire" data-p="suivant">Suivant</button>`;
}

// Plusieurs fautes sur une ligne (Q11-11) : la faute à gauche, ta correction à droite ; empilées si un morceau est long.
// « Entrée » passe à la case suivante. Au verso, chaque case a son ✓ ou la bonne forme.
const casesEmpilees = it => it.cases.some(x => x.faute.length > 14 || x.bonne.length > 14);
function vueErreurCases(it, enTete) {
  const c = it.carte;
  const consigne = sorte("Mes erreurs · à corriger");
  const classe = `cases-erreur${casesEmpilees(it) ? " empilees" : ""}`;
  const titres = casesEmpilees(it) ? "" : `<p class="cases-titres" aria-hidden="true"><span>La faute</span><span>Ta correction</span></p>`;
  if (s.phase === "question") {
    const lignes = it.cases.map((x, i) => `<label class="case-erreur" for="case${i}">
        <s class="f" lang="es">${esc(x.faute)}</s>
        <input id="case${i}" data-forme lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="${i < it.cases.length - 1 ? "next" : "done"}" value="${esc(s.formes?.[i] || "")}" aria-label="Correction de « ${esc(x.faute)} »">
      </label>`).join("");
    return `<div class="defile">${enTete}${consigne}<p class="corrige">Corrige chaque faute :</p>
        ${c.note ? `<p class="faute-note">${esc(c.note)}</p>` : ""}
        <form class="${classe}" data-p-form>${titres}${lignes}</form>
        <p class="faute-vue">Notée ${c.vue} fois en séance</p>${zoneIndice(it)}</div>
      <div class="saisie">
        <button class="primaire" type="button" data-p="verifier">Vérifier</button>
        <div class="aides">${boutonIndice(it)}<button class="secondaire" type="button" data-p="sais-pas">Je ne sais pas</button></div>
      </div>`;
  }
  const r = s.resultat;
  const titre = r.ok ? (s.indice ? "Juste, avec l'indice" : "Juste") : r.passe ? "La réponse" : `Pas encore : ${r.justes} sur ${it.cases.length}`;
  const lignes = r.lignes.map(l => `<div class="case-erreur">
      <s class="f" lang="es">${esc(l.faute)}</s>
      <p class="c ${l.ok ? "ok" : "ko"}" lang="es">${l.ok ? `${esc(l.saisie)} <span class="coche" aria-label="juste">✓</span>`
        : `${l.saisie ? `<del>${esc(l.saisie)}</del>` : ""}<b>${esc(l.bonne)}</b>`}</p>
    </div>`).join("");
  return `${enTete}${consigne}
    <div class="${classe}">${lignes}</div>
    <div class="verdict ${r.ok ? "ok" : r.passe ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(c.bonne)}<p lang="es">${phraseTouchable(ctxVue, c.bonne)}</p></div>
      ${r.astuce ? `<p>${esc(r.astuce)}</p>` : ""}
      ${r.rappel ? `<p>${esc(r.rappel)}</p>` : ""}
      ${c.regle ? `<p class="explication">${esc(c.regle)}</p>` : ""}
      <p class="revient">Elle revient ${quandRevient(s.fiche)}.</p>
    </div>
    <div class="espace"></div>
    <button class="primaire" data-p="suivant">Suivant</button>`;
}

// Mes erreurs : la faute telle que le prof l'a notée (en rose), sa note entre parenthèses en petit, et combien de fois.
function vueErreur(it, enTete) {
  if (it.cases) return vueErreurCases(it, enTete);
  const c = it.carte;
  const faute = (taille = "") => `<p class="corrige">Corrige :</p>
    <p class="faute${taille}" lang="es"><s>${esc(c.erreur)}</s></p>
    ${c.note ? `<p class="faute-note">${esc(c.note)}</p>` : ""}`;
  const consigne = sorte("Mes erreurs · à corriger");
  if (s.phase === "question") {
    return `<div class="defile">${enTete}${consigne}${faute()}
        <p class="faute-vue">Notée ${c.vue} fois en séance</p>${zoneIndice(it)}</div>
      <form class="saisie" data-p-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="Ta réponse en espagnol" value="${esc(s.saisie)}" aria-label="Ta réponse en espagnol">
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides">${boutonIndice(it)}<button class="secondaire" type="button" data-p="sais-pas">Je ne sais pas</button></div>
      </form>`;
  }
  const r = s.resultat;
  const unSeulMot = c.bonne.trim().split(/\s+/).length === 1;
  const titre = r.ok ? (s.indice ? "Juste, avec l'indice" : "Juste") : r.niveau === "passe" ? "La réponse" : r.niveau === "presque" && !unSeulMot ? "Presque : un mot" : "Pas encore";
  const surligne = (morceaux, cls) => morceaux.map(m => m.juste ? esc(m.brut) : `<mark class="${cls}">${esc(m.brut)}</mark>`).join(" ");
  const tape = s.saisie ? `<p class="tape" lang="es">${r.tape ? surligne(r.tape, "faux") : esc(s.saisie)}</p>` : "";
  return `${enTete}${consigne}${faute(" petite")}
    ${tape}
    <div class="verdict ${r.ok ? "ok" : r.niveau === "passe" ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(c.bonne)}<p lang="es">${phraseTouchable(ctxVue, c.bonne, { marques: marquesDe(c.bonne, r.reponse, "bon") })}</p></div>
      ${r.astuce ? `<p>${esc(r.astuce)}</p>` : ""}
      ${r.rappel ? `<p>${esc(r.rappel)}</p>` : ""}
      ${c.regle ? `<p class="explication">${esc(c.regle)}</p>` : ""}
      <p class="revient">Elle revient ${quandRevient(s.fiche)}.</p>
    </div>
    <div class="espace"></div>
    <button class="primaire" data-p="suivant">Suivant</button>`;
}

function vueDire(it) {
  const tete = it.phrase
    ? `${sorte("Mes erreurs · à dire à voix haute")}<p class="enonce">${esc(it.fr)}</p>${it.sujet ? `<p class="sous">${esc(it.sujet)}</p>` : ""}`
    : `${sorte("À dire · à voix haute")}<p class="enonce">${esc(it.fr)}</p>`;
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
      <p class="es" lang="es">${phraseTouchable(ctxVue, it.es)}</p>
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

// En révision, sur une carte de verbe retournée : « Les 6 formes », fermé, si l'appli connaît ce verbe
// (pas pour les verbes comme gustar : « yo gusto » ne sert à rien).
function formesCarte(m) {
  const vb = s.revision && verbeDe(m);
  return vb?.formes && !vb.gustar ? lesSixFormes(vb.v, vb.d, -1) : "";
}

function vueCarte(it) {
  // Un de mes mots a pu être corrigé pendant la série (« Modifier ») : on reprend sa dernière version.
  if (it.mot.moi) it.mot = { ...it.mot, ...monMot(it.mot.id) };
  const m = it.mot;
  const tete = sorte(s.revision ? "Tes mots à revoir · carte" : "Carte · du français à l'espagnol");
  // En révision, la leçon d'où vient le mot. « Revoir la leçon » s'ouvre par-dessus la série, qui reprend au retour.
  const l = s.revision && trouver(m.lecon);
  // Un de mes mots : quand je l'ai ajouté, et « Modifier » (après la correction du prof).
  const origine = s.revision && m.moi
    ? `<div class="origine"><span>Mes mots · ${esc(origineMonMot(m))}</span><a class="lien" href="#/mes-mots/modifier/${encodeURIComponent(m.id)}">Modifier</a></div>`
    : l && !s.faites.has(l.id) && apprisEnAvance(m.id)
      // Appris en avance : la leçon ne s'ouvre pas encore, la fiche du Dico si.
      ? `<div class="origine"><span>${id(l.id)} · appris en avance</span><a class="lien" href="#/dico/mot/${encodeURIComponent(m.id)}/dico">Voir la fiche</a></div>`
    : l ? `<div class="origine"><span>${id(l.id)} · ${esc(l.titre)}</span><a class="lien" href="#/lecon/${l.id}/revision">Revoir la leçon</a></div>` : "";
  if (s.phase === "question") {
    return `${tete}<div class="carte"><p class="fr-seul">${esc(m.fr)}</p><p class="sous">Dis-le en espagnol, puis retourne la carte.</p></div>
      ${zoneIndice(it)}
      <div class="espace"></div><button class="primaire" data-p="voir">Retourner la carte</button>${boutonIndice(it)}`;
  }
  return `${tete}<div class="carte${s.vientDeTourner ? " retournee" : ""}">
      <p class="fr">${esc(m.fr)}</p>
      <p class="es" lang="es">${esc(m.es)}</p>
      ${ecouter(m.ex ? `${m.es}. ${m.ex}` : m.es, "grand")}
      ${m.ex ? `<p class="exemple" lang="es">${phraseTouchable(ctxVue, m.ex)}</p>` : ""}
      ${formesCarte(m)}
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

// La fin du bonus : le score et les formes ratées. Rien n'est gardé.
// Le titre suit le score, toujours calme : 5-6 sur 6 « Bien entraîné », 3-4 « Pas mal », 0-2 « À retravailler ».
const titreBonus = (ok, sur) => ok >= sur - 1 ? "Bien entraîné" : ok >= sur / 2 ? "Pas mal" : "À retravailler";

// « À retenir » : une ligne par verbe raté avec ses formes ratées (sans doublon), puis la règle une seule fois.
function aRetenir(r) {
  const verbes = new Map(), phrases = [], regles = new Set();
  for (const { it, ok, lignes } of r) {
    if (ok) continue;
    if (it.v) {
      const cle = `${it.v}|${it.d || ""}|${it.t || ""}`;
      const v = verbes.get(cle) || verbes.set(cle, { v: it.v, formes: new Map() }).get(cle);
      const ratees = it.type === "tableau" ? lignes.map((l, p) => l.ok ? null : [p, l.attendu]).filter(Boolean) : [[it.p, it.es[0]]];
      for (const [p, f] of ratees) v.formes.set(p, f);
      regles.add(reglesVerbe(it.v, it.d, it.t)[0]);
    } else {
      const ligne = `<span lang="es">${phraseJuste(it)}</span>${it.fr.includes("___") ? "" : ` <small>(${esc(it.fr)})</small>`}`;
      if (!phrases.includes(ligne)) phrases.push(ligne);
      if (it.expl) regles.add(it.expl);
    }
  }
  const lignes = [...verbes.values()].map(({ v, formes }) => `<i lang="es">${esc(v)}</i> : ${[...formes.entries()].sort((a, b) => a[0] - b[0])
    .map(([p, f]) => `${PERSONNES[p]} → <b lang="es">${esc(f)}</b>`).join(", ")}`);
  return { lignes: [...lignes, ...phrases], regles: [...regles] };
}

function vueFinBonus() {
  const r = s.resultats;
  const { lignes: retenir, regles } = aRetenir(r);
  const nom = s.items[0].nom;
  const ok = r.filter(x => x.ok).length;
  return `<div class="fin">
      <h1>${titreBonus(ok, r.length)}</h1>
      <p class="sous">Entraînement · ${esc(nom)} · ${r.length} phrases</p>
      <ul class="bilan"><li><b>Justes</b><span>${r.filter(x => x.ok).length} sur ${r.length}</span></li></ul>
      ${retenir.length ? `<section aria-labelledby="t-retenir"><h2 id="t-retenir">À retenir</h2><ul class="a-retenir">${retenir.map(t => `<li>${t}</li>`).join("")}</ul>
        ${regles.map(t => `<p class="explication">${md(t)}</p>`).join("")}</section>` : ""}
      <p class="sous">Tu peux recommencer : ce ne seront pas tout à fait les mêmes phrases.</p>
    </div>
    <div class="espace"></div>
    <button class="primaire" data-p="encore">Encore 6</button>
    ${s.retour === "#/" ? versAujourdhui("secondaire") : `<a class="secondaire" href="${s.retour}" data-remplace>Revenir à la leçon</a>`}`;
}

// Le bloc « Encore 6 » sous le bilan d'une leçon qui a une réserve de bonus.
function blocBonus() {
  const b = BONUS[s.lecon];
  if (!b) return "";
  const ex = b.phrases[0];
  const exemple = ex.v && !ex.fr.includes("(") ? `${ex.fr} (${ex.v})` : ex.fr;
  const jour = s.retour === "#/";
  return `<div class="bonus">
      <b>Encore 6 pour t'entraîner ?</b>
      <p>${esc(b.desc)} ${jour ? "Facultatif : ta leçon est déjà faite." : "Facultatif."}</p>
      <p class="ex">Ex. : <span lang="es">${esc(exemple)}</span></p>
      <a class="secondaire" href="#/bonus/${s.lecon}/${jour ? "jour" : "lecon"}" data-remplace>Je m'entraîne · 6 phrases</a>
    </div>`;
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

// La fin de « Mes erreurs » : chaque carte, et quand elle revient. Les fiches sont déjà notées.
function vueFinErreurs() {
  const r = s.resultats;
  const erreurs = r.filter(x => x.it.type === "erreur");
  const phrase = r.find(x => x.it.phrase);
  const resume = [erreurs.length && `${erreurs.filter(x => x.ok).length} corrigée${erreurs.filter(x => x.ok).length > 1 ? "s" : ""} sur ${erreurs.length}`,
    phrase && "ta phrase redite"].filter(Boolean).join(", et ");
  const etiquette = x => x.it.phrase ? (x.ok ? ["ok", "Dite"] : ["ko", "À revoir"])
    : x.aide ? ["mi", "Indice"] : x.ok ? ["ok", "Juste"] : ["ko", "Demain"];
  const lignes = r.map(x => {
    const [cls, mot] = etiquette(x);
    const texte = x.it.phrase ? x.it.es : x.it.carte.bonne;
    const pourquoi = !x.it.phrase && !x.ok && x.astuce ? x.astuce : `revient ${quandRevient(x.fiche)}`;
    return `<li><span class="r ${cls}">${mot}</span><span class="t"><span lang="es">${esc(texte)}</span><small>${esc(pourquoi)}</small></span></li>`;
  }).join("");
  return `<div class="fin">
      <p class="sous">Mes erreurs</p>
      <h1>C'est fait pour aujourd'hui</h1>
      ${resume ? `<p class="sous">${resume.charAt(0).toUpperCase() + resume.slice(1)}.</p>` : ""}
      <ul class="bilan-erreurs">${lignes}</ul>
    </div>
    <div class="espace"></div>
    ${versAujourdhui("primaire")}`;
}

function vueFin(ctx) {
  if (s.erreurs) return vueFinErreurs();
  if (s.controle) return vueFinControle();
  if (s.revision) return vueFinPaquet(ctx);
  if (s.bonus) return vueFinBonus();
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
      ${blocBonus()}
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

export function ecranBonus(ctx, idLecon, depuis) {
  const lecon = decodeURIComponent(idLecon || "");
  const retour = depuis === "jour" ? "#/" : `#/lecon/${lecon}`;
  if (!BONUS[lecon]) return { onglet: null, html: `<main class="colonne vide"><h1>Pas d'entraînement</h1><a class="lien" href="${retour}">Revenir</a></main>` };
  return ecranSerie(ctx, `bonus:${lecon}`, () => serieBonus(lecon), retour);
}

export function ecranErreurs(ctx) {
  return ecranSerie(ctx, `erreurs:${ctx.jour}`, () => serieErreurs(ctx), "#/", "Rien à corriger aujourd'hui : tes cartes du carnet reviendront les jours suivants.");
}

export function ecranEcritControle(ctx, idUnite) {
  return ecranSerie(ctx, `controle:${idUnite}`, () => serieControle(ctx, idUnite));
}

// retour : là d'où tu viens (pour « Quitter » et la fin). Une série reprise garde sa place mais prend le nouveau retour.
function ecranSerie(ctx, cle, construire, retour, vide = "") {
  ctxVue = ctx;
  if (!s || s.cle !== cle || s.fini) nouvelleSerie(ctx, cle, construire);
  if (retour) s.retour = retour;

  if (!s.items.length) {
    const titre = s.revision ? "Rien à revoir" : s.erreurs ? "Rien à corriger" : "Rien à pratiquer";
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
  const question = (it.type === "ecrire" || it.type === "erreur" || it.type === "tableau") && s.phase === "question";
  const vue = it.type === "ecrire" ? vueEcrire(it, enTete) : it.type === "erreur" ? vueErreur(it, enTete) : it.type === "tableau" ? vueTableau(it, enTete)
    : enTete + (it.type === "dire" ? vueDire(it) : vueCarte(it));
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
      if ((it.type === "ecrire" || (it.type === "erreur" && !it.cases)) && s.phase === "question") {
        const i = s.i;
        setTimeout(() => { if (s?.i === i && s.phase === "question") document.getElementById("reponse")?.focus({ preventScroll: true }); }, 400);
      }
      // La carte retournée dit le mot toute seule, et son bouton s'allume pendant ce temps.
      if (it.type === "carte" && s.phase === "reponse" && !s.dit) {
        s.dit = true;
        const b = document.querySelector(".carte .ecoute");
        if (b) { const tout = b.dataset.dire; b.dataset.dire = it.mot.es; lancerLecture(b); b.dataset.dire = tout; }
      }
      // Le tableau : « Entrée » passe à la personne suivante ; à la dernière, elle vérifie.
      // Mes erreurs à plusieurs cases : pareil, de case en case.
      if ((it.type === "tableau" || it.cases) && s.phase === "question") {
        const champs = [...document.querySelectorAll("[data-forme]")];
        champs.forEach((c, i) => c.addEventListener("keydown", e => {
          if (e.key === "Enter" && i < champs.length - 1) { e.preventDefault(); champs[i + 1].focus(); }
        }));
        const i = s.i;
        setTimeout(() => { if (s?.i === i && s.phase === "question") champs[0]?.focus({ preventScroll: true }); }, 400);
      }
      s.vientDeTourner = false;
    },
    html: `<main class="colonne exo${question ? ` ecrire-q${it.type === "tableau" ? " tableau-q" : ""}` : ""}">${vue}</main>`,
  };
}

// ——— les actions ———

// Mes erreurs : la fiche de la carte est notée tout de suite (carnet.js calcule quand elle revient), et gardée pour la fin.
function noterCarteErreur(ctx, it, resultat, extra = {}) {
  const carte = it.carte || it.phrase;
  const fiche = nouvelleFiche(fichesErreurs()[carte.cle], resultat, ctx.jour, carte.vue);
  noterErreur(carte.cle, fiche);
  s.fiche = fiche;
  s.resultats.push({ it, ok: resultat !== "rate", aide: resultat === "aide", fiche, ...extra });
}

function suivant() {
  effacerEnregistrement();
  arreterLecture();
  s.depuis = s.i;
  s.i++; s.phase = "question"; s.resultat = null; s.saisie = ""; s.formes = null; s.astuce = ""; s.indice = 0; s.dit = false;
}

// Renvoie "suivant" quand on passe à un autre exercice (l'écran change, avec la transition),
// true quand le même écran doit être redessiné, false sinon.
export async function actionPratique(ctx, action, el) {
  if (!s) return false;
  const it = s.items[s.i];
  switch (action) {
    case "verifier": {
      if (it.type === "erreur" && it.cases) {
        const formes = [...document.querySelectorAll("[data-forme]")].map(c => c.value.trim());
        if (formes.every(f => !f)) return false;
        s.formes = formes;
        s.resultat = jugerCases(formes, it.cases);
        const ok = s.resultat.ok;
        noterCarteErreur(ctx, it, ok ? (s.indice ? "aide" : "juste") : "rate", { astuce: s.resultat.astuce });
        s.phase = "reponse";
        vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
        return true;
      }
      if (it.type === "tableau") {
        const formes = [...document.querySelectorAll("[data-forme]")].map(c => c.value.trim());
        if (formes.every(f => !f)) return false;
        s.formes = formes;
        const lignes = it.es.map((attendu, p) => {
          const r = formes[p] ? corriger(formes[p], [attendu]) : { niveau: "faux" };
          return { attendu, saisie: formes[p], ok: r.niveau === "juste" || r.niveau === "accents", accents: r.niveau === "accents" };
        });
        const ok = lignes.every(l => l.ok);
        s.resultat = { lignes };
        s.notes.ecrire.push(ok); s.resultats.push({ it, ok, lignes });
        s.phase = "reponse";
        vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
        return true;
      }
      s.saisie = document.getElementById("reponse")?.value.trim() || "";
      if (!s.saisie) return false;
      if (it.type === "erreur") {
        s.resultat = juger(s.saisie, it.carte);
        const ok = s.resultat.ok;
        noterCarteErreur(ctx, it, ok ? (s.indice ? "aide" : "juste") : "rate", { astuce: s.resultat.astuce });
        s.phase = "reponse";
        vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
        return true;
      }
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
      if (it.type === "erreur" && it.cases) {
        s.resultat = { ...jugerCases([], it.cases), passe: true };
        noterCarteErreur(ctx, it, "rate");
        s.phase = "reponse";
        return true;
      }
      if (it.type === "erreur") {
        s.saisie = ""; s.resultat = { niveau: "passe", attendu: it.es[0], ok: false };
        noterCarteErreur(ctx, it, "rate");
        s.phase = "reponse";
        return true;
      }
      if (it.type === "tableau") {
        const lignes = it.es.map(attendu => ({ attendu, saisie: "", ok: false }));
        s.resultat = { lignes, passe: true };
        s.notes.ecrire.push(false); s.resultats.push({ it, ok: false, lignes }); s.phase = "reponse";
        return true;
      }
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
      // Un de mes mots supprimé pendant la série : on ne lui recrée pas de mémoire.
      if (it.type === "carte") { if (!it.mot.moi || monMot(it.mot.id)) noterMot(it.mot.id, n, ctx.jour); s.notes.carte.push(n); }
      else {
        s.notes.dire.push(n);
        if (it.phrase) noterCarteErreur(ctx, it, n === 3 ? "juste" : n === 2 ? "aide" : "rate");
      }
      vibrer(); suivant();
      return "suivant";
    }
    case "suivant":
      suivant();
      return "suivant";
    case "encore": // « Encore 6 » : un autre tirage du bonus
      { const retour = s.retour; nouvelleSerie(ctx, s.cle, () => serieBonus(s.bonus)); s.retour = retour; }
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
