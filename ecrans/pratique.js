// Pratiquer une leçon (#/pratique/U1-L3, ou #/pratique/U1-L3/jour depuis Aujourd'hui) : une série d'exercices
// à écrire, à dire et de cartes. « Tes mots à revoir » (#/revision) : seulement des cartes, par paquets de 20.
// Seules les cartes mettent à jour la mémoire des mots. « Quitter » ramène là d'où tu viens.
// Après une erreur dans une leçon : pourquoi c'est la bonne réponse, et un lien vers la leçon (pas en révision).
// Le bonus (#/bonus/U1-L1/jour ou …/lecon) : « Encore 6 pour t'entraîner », proposé à la fin d'une leçon
// qui a une réserve dans bonus.js. Facultatif : rien n'est coché, aucune carte, la révision n'est pas touchée.
// Sert aussi à la partie écrite d'un contrôle blanc (#/controle/U1/ecrit) : sans indice,
// avec l'explication de la règle après chaque réponse, et un bilan par thème à la fin.

import { esc, md, id, ICONES } from "../ui.js?v=87";
import { lecon as trouver } from "../position.js?v=87";
import { EXERCICES } from "../exercices.js?v=87";
import { corriger } from "../corriger.js?v=87";
import { noterMot, cocher, cases, noterControle, monMot, apprisEnAvance, fichesErreurs, noterErreur, fichesCartes, prendreCarte, compterNon } from "../progression.js?v=87";
import { cartesARevoir, cleCarte, nbCartes, departDe, phrasesDe, apresNote, compteSerie, ORE, INTERVALLES } from "../cartes.js?v=87";
import { jugerMot, jugerOreille, reponsesMot } from "../oreille.js?v=87";
import { dire } from "../voix.js?v=87";
import { boutonSaisPas, armerSaisPas, apresErreur, arreterCompte, blocDeuxFois, zoneCompte } from "../apres-erreur.js?v=87";
import { reconnaissancePossible, ecouter as ecouterMicro, ecouteEnCours, arreterEcoute, compris } from "../micro.js?v=87";
// Le micro « On me comprend ? » répond plus tard : l'écran se redessine par cet événement (écouté dans app.js).
const redessiner = () => window.dispatchEvent(new Event("oyb-redessiner"));
import { carnetActuel, cartesDuJour, juger, jugerCases, decouper, nouvelleFiche, quandRevient, SUJETS, phraseATraduire, jugerTraduction } from "../carnet.js?v=87";
import { RESERVE } from "../erreurs-phrases.js?v=87";
import { CONTROLES, tirerEcrit, phraseJuste, explicationConjugaison, conjuguer, sixFormes, PERSONNES, formesSurlignees, regleVerbe, reglesVerbe, TEMPS } from "../controles.js?v=87";
import { BONUS } from "../bonus.js?v=87";
import { verbeDe, motsAMoi, origineMonMot, reglesDuMot, lignesConcernees } from "../dico.js?v=87";
import { lancerLecture, arreterLecture } from "../lecture.js?v=87";
import { entrerSiBloque } from "../motsencours.js?v=87";
import { phraseTouchable, marquesDe } from "../toucher.js?v=87";
import { vibrer, son } from "../retours.js?v=87";
import {
  enregistrementPossible, demarrerEnregistrement, arreterEnregistrement,
  effacerEnregistrement, aUnEnregistrement,
} from "../enregistrement.js?v=87";

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

// « Tes mots à revoir » : les cartes dues de tous les mots, toutes leçons confondues, sauf ceux de la leçon faite aujourd'hui
// (ils sont dans la leçon du jour). Avec mes mots et les mots du livre appris en avance, à partir du lendemain.
// Un mot appris en avance compte depuis ce jour-là, même une fois sa leçon faite : il garde sa révision.
// Chantier 15 : chaque mot a jusqu'à 4 cartes (cartes.js), une seule par jour. Étape 3 (28 nov.) : plus de plafond par jour,
// des paquets de 20 tant qu'il reste des cartes dues (jamais de carte revue en avance).
export const PAQUET = 20;
export function motsDus(ctx) {
  const { pos, motsParLecon, jour } = ctx;
  const mots = [...pos.faites].flatMap(l => motsParLecon[l] || []);
  // Les mots de la leçon du jour attendent demain, sauf les cartes que je viens de prendre avec « + » (tout de suite).
  const duJour = new Set([...pos.faites].filter(l => pos.dateFaite[l] === jour).flatMap(l => (motsParLecon[l] || []).map(m => m.id)));
  const enAvance = ctx.mots.filter(m => !pos.faites.has(m.lecon) && apprisEnAvance(m.id) && apprisEnAvance(m.id) < jour);
  const aMoi = motsAMoi().filter(m => m.le < jour);
  return cartesARevoir([...mots, ...enAvance, ...aMoi], fichesCartes(), jour, departDe(ctx)).filter(c => c.neuve || !duJour.has(c.mot.id));
}

// Une carte de la révision → une question. Carte 1 : « Dis-le à voix haute, puis écris-le » (chantier 24, ecrite).
// Cartes 3, 4 : à écrire. Carte 5 : « à l'oreille », la voix dit l'exemple et je l'écris (chantier 24).
// (Les cartes d'une leçon, elles, restent des cartes qu'on retourne : serieLecon.)
function itemDeCarte(c) {
  const m = c.mot;
  if (c.n === 1) return { type: "carte", mot: m, n: 1, ecrite: true };
  if (c.n === ORE) return { type: "oreille", mot: m, n: ORE, cle: cleCarte(m.id, ORE), lecon: m.lecon, phrase: m.ex, motCarte: c.trou.reponse };
  const commun = { type: "ecrire", lecon: m.lecon, mot: m, n: c.n, cle: cleCarte(m.id, c.n) };
  return { ...commun, consigne: "Traduis", fr: c.phrase.fr, es: c.phrase.es, sens: c.phrase.aide };
}

function serieRevision(ctx) {
  return { titre: "Tes cartes à revoir", revision: true, faites: ctx.pos.faites, items: motsDus(ctx).slice(0, PAQUET).map(itemDeCarte) };
}

// « Mes erreurs » (#/erreurs, chantier 11) : les cartes du jour tirées du carnet du prof, 5 au plus (carnet.js).
// Une erreur : une phrase en français à traduire, qui change à chaque passage (point 8 quindecies) ; sans phrase prête,
// l'ancienne carte « Corrige : … » (tu écris la bonne forme, accents obligatoires). Une phrase personnalisée : à redire de mémoire.
// Chaque réponse met à jour la fiche de la carte tout de suite : quitter au milieu garde ce qui est fait.
function serieErreurs(ctx) {
  const items = cartesDuJour(carnetActuel(), fichesErreurs(), ctx.jour).map(carte => {
    // Plusieurs fautes sur une ligne : une case par faute (Q11-11).
    if (carte.type === "erreur") {
      const traduire = phraseATraduire(carte, { reserve: RESERVE, exercices: EXERCICES, faites: ctx.pos.faites, tour: fichesErreurs()[carte.cle]?.tour || 0 });
      if (traduire) return { type: "erreur", carte, es: [traduire.es], traduire };
      return { type: "erreur", carte, es: [carte.bonne], cases: decouper(carte) };
    }
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
  s = { cle, ...base, resultats: [], i: 0, phase: "question", resultat: null, saisie: "", astuce: "", indice: 0, notes: { ecrire: [], dire: [], carte: [], repasse: [], aide: { ecrire: 0, dire: 0, carte: 0 } } };
}

// ——— l'affichage ———

// En révision (Q79), les cartes ratées reviennent à la fin du paquet : le compteur reste « 8 / 20 » pendant les vraies cartes,
// puis la reprise a le sien, « On la revoit · 1 / 3 », et la barre repart de zéro.
const avancee = i => {
  if (!s.revision) return i / s.items.length;
  const c = compteSerie(s.items, i);
  return c.repasse ? (c.n - 1) / c.sur : i / c.premiers;
};
const barre = () => {
  const c = s.revision ? compteSerie(s.items, s.i) : { n: s.i + 1, sur: s.items.length };
  const depuis = s.depuis != null && (!s.revision || compteSerie(s.items, s.depuis).repasse === c.repasse) ? s.depuis : s.i;
  return `<header class="barre-ex">
    <a class="quitter" href="${s.retour}">${ICONES.fermer}Quitter</a>
    <span class="piste" role="progressbar" aria-valuemin="0" aria-valuemax="${c.sur}" aria-valuenow="${c.n - 1}"><i style="width:${avancee(depuis) * 100}%"></i></span>
    <span class="compte">${c.repasse ? "On la revoit · " : ""}${c.n} / ${c.sur}</span>
  </header>`;
};

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
// 1. les lignes de règle de la leçon qui concernent la phrase (regles.js) ; 2. la première lettre de chaque mot (« V··· e· H····· »).
// Pour une carte (la carte retournée et les cartes à écrire de la révision), jamais de règle (Q18-5) : la première lettre.

const reponseDe = it => it.type === "ecrire" || it.type === "erreur" ? it.es[0] : it.type === "dire" ? it.es : it.type === "oreille" ? it.phrase : it.mot.es;
const initiales = texte => texte.replace(/\p{L}+/gu, mot => mot[0] + "·".repeat(mot.length - 1));
const tousRates = texte => texte.trim().split(/\s+/).map(brut => ({ brut, juste: false }));

// Les lignes de règle de la leçon qui concernent la phrase (Q18-13) : pour l'indice, tous ses mots comptent.
const lignesDeLaPhrase = it => it.type === "carte" || it.cle || !it.lecon ? [] : lignesConcernees(it.lecon, tousRates(reponseDe(it)));

function etapesIndice(it) {
  // Mes erreurs : un seul indice, la « Règle en une ligne » du carnet.
  if (it.type === "erreur") return it.carte.regle ? [`<p class="regle">${esc(it.carte.regle)}</p>`] : [];
  // La carte 5 (Q24-16) : le nombre de mots, le mot de la carte en français, les premières lettres.
  if (it.type === "oreille") {
    const mots = it.phrase.replace(/[¿?¡!.,;:«»"()…]/g, " ").split(/\s+/).filter(Boolean);
    return [
      `<p class="regle"><b>${mots.length} mots</b></p><div class="blocs" aria-hidden="true">${mots.map(w => `<span style="width:${8 + w.length * 7}px"></span>`).join("")}</div>`,
      `<p class="regle">Le mot de la carte : <b>${esc(it.mot.fr)}</b></p>`,
      `<p class="initiales" lang="es">${esc(initiales(it.phrase))}</p>`,
    ];
  }
  const etapes = [];
  const lignes = lignesDeLaPhrase(it);
  if (lignes.length) etapes.push(lignes.map(x => `<p class="regle">${md(x.texte)}</p>`).join(""));
  etapes.push(`<p class="initiales" lang="es">${esc(initiales(reponseDe(it)))}</p>`);
  return etapes;
}

const zoneIndice = it => `<div class="zone-indice" role="status">${s.indice ? `<div class="indice">${etapesIndice(it).slice(0, s.indice).join("")}</div>` : ""}</div>`;
function boutonIndice(it) {
  if (it.controle) return "";
  if (etapesIndice(it).length - s.indice <= 0) return "";
  return `<button class="secondaire" type="button" data-p="indice" data-garde-focus>${s.indice ? "Un autre indice" : "Un indice"}</button>`;
}

// Après une erreur (étape 2, Q26-1 à Q26-8) : ce que la voix dit, ou null quand c'est juste (« Juste, avec un indice » compris).
// Tout ce qui n'est pas juste compte, « Presque » aussi. Le tableau : seulement les formes ratées. Une phrase à trou : la phrase entière.
// Pas pendant un contrôle blanc : on y lit l'explication de chaque réponse.
function texteErreur(it) {
  const r = s.resultat;
  if (!r || it.controle) return null;
  const juste = r.niveau === "juste" || r.niveau === "accents";
  if (it.type === "tableau") { const f = r.lignes.filter(l => !l.ok).map(l => l.attendu); return f.length ? f : null; }
  if (it.type === "erreur") return r.ok ? null : it.traduire ? it.traduire.es : it.carte.bonne;
  if (it.ecrite) return juste ? null : it.mot.es;
  if (it.type === "oreille") return juste ? null : it.phrase;
  if (it.type === "ecrire") return juste ? null : it.fr.includes("___") ? it.fr.replace("___", it.es[0]) : r.attendu;
  return null;
}
// En bas de l'écran de réponse : « Dis-le deux fois » (sauf la carte 1, qui l'a dans son bloc) et la zone du compte.
function suiteErreur(it) {
  const t = texteErreur(it);
  return t ? `${it.ecrite ? "" : blocDeuxFois(t)}${zoneCompte()}` : "";
}

// Pendant la question, le champ et les boutons restent collés en bas (juste au-dessus du clavier quand il est ouvert) ;
// le haut (barre, phrase, indice) défile s'il manque de place.
function vueEcrire(it, enTete) {
  const consigne = it.bonus
    ? `${sorte(`Entraînement · ${esc(it.nom)}`)}<p class="consigne">${esc(it.consigne)}</p>`
    : it.cle ? sorte(`${it.repasse ? "On la revoit" : "Tes cartes à revoir"} · carte ${it.n} sur ${nbCartes(it.mot)}${it.n > 2 ? ` · ${esc(it.mot.fr)}` : ""}`)
      + `<p class="consigne">Écris toute la phrase en espagnol.</p>`
    : sorte(`À écrire · ${it.consigne.toLowerCase()}`);
  // Toucher un mot (chantier 10) : une phrase espagnole à compléter se touche pendant la question (pas pendant un contrôle) ;
  // après la réponse, la phrase complète se touche, la réponse surlignée. Un « Traduis » montre du français : rien à toucher
  // avant la réponse ; après, c'est la bonne réponse qui se touche. La traduction de l'auteur (trad) ne donne jamais la forme.
  const trou = it.fr.includes("___");
  const sens = it.sens ? `<p class="sens" lang="es">${esc(it.sens)}</p>` : it.aideFr ? `<p class="sens">(${esc(it.aideFr)})</p>` : "";
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
        <div class="aides">${boutonIndice(it)}${boutonSaisPas('data-p="sais-pas"')}</div>
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
      ${it.controle || it.bonus || !ok ? explication(it, r) : ""}
      ${it.cle ? lignesDuMot(it.mot) : ""}
      ${it.v && !it.controle ? lesSixFormes(it.v, it.d, it.p, it.t) : ""}
      ${!it.controle && !s.revision && !ok ? `<a class="lien revoir" href="#/lecon/${it.lecon}/exercice">Revoir la leçon</a>` : ""}
    </div>
    <div class="espace"></div>
    ${suiteErreur(it)}<button class="primaire" data-p="suivant">Suivant</button>`;
}

// Pourquoi c'est la bonne réponse : l'explication écrite pour la phrase s'il y en a une,
// sinon la conjugaison calculée (verbe v, personne p), la phrase d'exemple du mot (contrôle),
// ou, dans les leçons, seulement les lignes de règle des mots ratés (Q18-2 ; tous les mots après « Je ne sais pas »).
// Une carte à écrire de la révision montre la ligne de son mot à part (lignesDuMot), pas celles-ci.
function explication(it, r) {
  if (it.expl) return `<p class="explication">${md(it.expl)}</p>`;
  if (it.v) return `<p class="explication">${md(explicationConjugaison(it.v, it.p, it.d, it.t))}</p>`;
  if (it.exemple) return `<p class="explication">Exemple : <span lang="es">${esc(it.exemple)}</span></p>`;
  if (it.controle || it.cle || !it.lecon) return "";
  const mots = r?.niveau !== "passe" && r?.reponse ? r.reponse : tousRates(reponseDe(it));
  return lignesConcernees(it.lecon, mots).map(x => `<p class="explication">${md(x.texte)}</p>`).join("");
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
        <div class="aides">${boutonSaisPas('data-p="sais-pas"')}</div>
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
    ${suiteErreur(it)}<button class="primaire" data-p="suivant">Suivant</button>`;
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
    return `<div class="defile">${enTete}${consigne}${sensVoulu(c)}<p class="corrige">Corrige chaque faute :</p>
        ${c.note ? `<p class="faute-note">${esc(c.note)}</p>` : ""}
        <form class="${classe}" data-p-form>${titres}${lignes}</form>
        <p class="faute-vue">Notée ${c.vue} fois en séance</p>${zoneIndice(it)}</div>
      <div class="saisie">
        <button class="primaire" type="button" data-p="verifier">Vérifier</button>
        <div class="aides">${boutonIndice(it)}${boutonSaisPas('data-p="sais-pas"')}</div>
      </div>`;
  }
  const r = s.resultat;
  const titre = r.ok ? (s.indice ? "Juste, avec l'indice" : r.peine ? "Juste, aux accents près" : "Juste") : r.passe ? "La réponse" : `Pas encore : ${r.justes} sur ${it.cases.length}`;
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
    ${suiteErreur(it)}<button class="primaire" data-p="suivant">Suivant</button>`;
}

// Le sens voulu (Q107, colonne « Sens (français) » du carnet) : au-dessus de la faute, pour qu'une seule correction soit juste.
// Sans sens (vieux carnet, colonne vide), rien ne s'affiche.
const sensVoulu = c => c.sens ? `<p class="sens-voulu">${esc(c.sens)}</p>` : "";

// Mes erreurs, « Traduis » (point 8 quindecies) : une phrase en français ; l'appli ne vérifie que le morceau piège,
// surligné ensuite dans ta réponse et dans la phrase modèle. Le reste, tu le compares toi-même.
function surlignerMorceau(texte, position, longueur, cls) {
  if (position < 0) return esc(texte);
  let k = 0, debut = -1, fin = -1;
  const brut = texte.trim().split(/\s+/);
  brut.forEach((m, i) => {
    const n = (m.match(/\p{L}+/gu) || []).length;
    if (n && k >= position && k < position + longueur) { if (debut < 0) debut = i; fin = i; }
    k += n;
  });
  if (debut < 0) return esc(texte);
  // Un seul bloc jaune pour tout le morceau (« está en »).
  return [...brut.slice(0, debut).map(esc), `<mark class="${cls}">${esc(brut.slice(debut, fin + 1).join(" "))}</mark>`,
    ...brut.slice(fin + 1).map(esc)].join(" ");
}
function vueTraduire(it, enTete) {
  const t = it.traduire, c = it.carte;
  const consigne = sorte("Mes erreurs · à traduire");
  if (s.phase === "question") {
    return `<div class="defile">${enTete}${consigne}<p class="corrige">Traduis en espagnol :</p>
        <p class="enonce">${esc(t.fr)}</p>${zoneIndice(it)}</div>
      <form class="saisie" data-p-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="Ta réponse en espagnol" value="${esc(s.saisie)}" aria-label="Ta réponse en espagnol">
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides">${boutonIndice(it)}${boutonSaisPas('data-p="sais-pas"')}</div>
      </form>`;
  }
  const r = s.resultat;
  const n = (t.piege.match(/\p{L}+/gu) || []).length;
  const modele = surlignerMorceau(t.es, jugerTraduction(t.es, t).position, n, "bon");
  const titre = r.ok ? `${s.indice ? "Juste, avec l'indice" : r.peine ? "Juste, aux accents près" : "Juste"} : « ${esc(t.piege)} »` : r.passe ? "La réponse" : `Pas encore : il fallait « ${esc(t.piege)} »`;
  return `${enTete}${consigne}<p class="enonce petite">${esc(t.fr)}</p>
    ${s.saisie ? `<p class="tape" lang="es">${surlignerMorceau(s.saisie, r.position, n, "bon")}</p>` : ""}
    <div class="verdict ${r.ok ? "ok" : r.passe ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(t.es)}<p lang="es">${modele}</p></div>
      ${r.rappel ? `<p>${esc(r.rappel)}</p>` : ""}
      ${r.ok ? `<p class="compare">Compare le reste avec la phrase modèle : l'appli ne vérifie que le piège.</p>` : ""}
      ${c.regle ? `<p class="explication">${esc(c.regle)}</p>` : ""}
      <p class="revient">Elle revient ${quandRevient(s.fiche)}, avec une autre phrase.</p>
    </div>
    <div class="espace"></div>
    ${suiteErreur(it)}<button class="primaire" data-p="suivant">Suivant</button>`;
}

// Mes erreurs : la faute telle que le prof l'a notée (en rose), sa note entre parenthèses en petit, et combien de fois.
function vueErreur(it, enTete) {
  if (it.traduire) return vueTraduire(it, enTete);
  if (it.cases) return vueErreurCases(it, enTete);
  const c = it.carte;
  const faute = (taille = "") => `${sensVoulu(c)}<p class="corrige">Corrige :</p>
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
        <div class="aides">${boutonIndice(it)}${boutonSaisPas('data-p="sais-pas"')}</div>
      </form>`;
  }
  const r = s.resultat;
  const unSeulMot = c.bonne.trim().split(/\s+/).length === 1;
  const titre = r.ok ? (s.indice ? "Juste, avec l'indice" : r.peine ? "Juste, aux accents près" : "Juste") : r.niveau === "passe" ? "La réponse" : r.niveau === "presque" && !unSeulMot ? "Presque : un mot" : "Pas encore";
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
    ${suiteErreur(it)}<button class="primaire" data-p="suivant">Suivant</button>`;
}

function vueDire(it) {
  const tete = it.phrase
    ? `${sorte("Mes erreurs · à dire à voix haute")}<p class="enonce">${esc(it.fr)}</p>${it.sujet ? `<p class="sous">${esc(it.sujet)}</p>` : ""}`
    : `${sorte("À dire · à voix haute")}<p class="enonce">${esc(it.fr)}</p>`;
  // « On me comprend ? » (chantier 24) : avec la reconnaissance du téléphone, on touche le micro et on parle ;
  // la réponse arrive avec les mots compris en vert. Sans elle, l'enregistrement d'avant (rester appuyé).
  if (s.phase === "question") {
    const micro = reconnaissancePossible()
      ? `<button class="micro${s.ecoute ? " on" : ""}" data-p="ecouter-dire" aria-label="${s.ecoute ? "Je t'écoute, touche pour finir" : "Touche pour parler"}">${ICONES.micro}<span class="chrono">${s.ecoute ? "Je t'écoute… touche pour finir" : "Touche le micro et dis la phrase"}</span></button>`
      : enregistrementPossible()
      ? `${s.astuce ? `<p class="astuce" role="status">${esc(s.astuce)}</p>` : ""}
        <button class="micro" data-micro aria-label="Reste appuyé pour t'enregistrer">${ICONES.micro}<span class="chrono">Appuie et reste appuyé pour parler</span></button>`
      : `<p class="sous">Dis-le à voix haute, puis regarde la réponse.</p>`;
    return `${tete}${zoneIndice(it)}<div class="espace"></div>${micro}<div class="espace"></div>
      <div class="aides">${boutonIndice(it)}<button class="secondaire" data-p="voir">Voir la réponse</button></div>`;
  }
  // Ce que le téléphone a compris : un indice, jamais une note (Google corrige parfois la grammaire).
  const x = s.entendu && compris(it.es, s.entendu.alternatives);
  const phrase = x
    ? `<p class="es compris" lang="es">${x.liste.map(m => `<span class="${m.oui ? "oui" : "non"}">${esc(m.w)}</span>`).join(" ")}</p>
      <p class="compris-n" role="status">${!s.entendu.texte ? "Je n'ai rien entendu. Rapproche le téléphone et redis-la." : x.n === x.sur ? "¡Perfecto! Tout est compris." : `${x.n} mot${x.n > 1 ? "s" : ""} sur ${x.sur} compris`}</p>
      ${s.entendu.texte ? `<p class="entendu">J'ai entendu : « <span lang="es">${esc(s.entendu.texte)}</span> »</p>` : ""}
      <p class="entendu">Le vert est un indice : le téléphone corrige parfois la grammaire. C'est toi qui notes.</p>`
    : `<p class="es" lang="es">${phraseTouchable(ctxVue, it.es)}</p>`;
  const redire = reconnaissancePossible()
    ? `<button class="reessai${s.ecoute ? " on" : ""}" data-p="ecouter-dire"><span class="chrono">${s.ecoute ? "Je t'écoute… touche pour finir" : x ? "Touche ici pour la redire" : "Touche ici pour la dire"}</span></button>`
    : "";
  return `${tete}
    <div class="carte-reponse">
      <p class="sous">La réponse</p>
      ${phrase}
      <div class="deux">
        <button data-dire="${esc(it.es)}" aria-pressed="false">${ICONES.lecture}Le modèle</button>
        ${aUnEnregistrement() ? `<button data-voix aria-pressed="false">${ICONES.lecture}Ma voix</button>` : ""}
      </div>
      ${redire || (enregistrementPossible() ? `<button class="reessai" data-micro><span class="chrono">${aUnEnregistrement() ? "Reste appuyé ici pour te réenregistrer" : "Reste appuyé ici pour t'enregistrer"}</span></button>` : "")}
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

// La règle sur la carte (chantier 18) : au dos, sous l'exemple, toujours, seulement si une règle d'une leçon faite
// concerne le mot (Q18-4, Q18-5, Q18-8). Un verbe : la ligne du Dico ; un irrégulier, même avant sa leçon.
function lignesDuMot(m) {
  return reglesDuMot(m, ctxVue?.pos?.faites || new Set()).map(r =>
    `<div class="regle-carte"><span class="etiq">${esc(r.etiquette)}</span><span>${md(r.texte)}</span></div>`).join("");
}

// En révision, la leçon d'où vient le mot. « Revoir la leçon » s'ouvre par-dessus la série, qui reprend au retour.
function origineDe(m) {
  const l = s.revision && trouver(m.lecon);
  // Un de mes mots : quand je l'ai ajouté, et « Modifier » (après la correction du prof).
  return s.revision && m.moi
    ? `<div class="origine"><span>Mes mots · ${esc(origineMonMot(m))}</span><a class="lien" href="#/mes-mots/modifier/${encodeURIComponent(m.id)}">Modifier</a></div>`
    : l && !s.faites.has(l.id) && apprisEnAvance(m.id)
      // Appris en avance : la leçon ne s'ouvre pas encore, la fiche du Dico si.
      ? `<div class="origine"><span>${id(l.id)} · appris en avance</span><a class="lien" href="#/dico/mot/${encodeURIComponent(m.id)}/dico">Voir la fiche</a></div>`
    : l ? `<div class="origine"><span>${id(l.id)} · ${esc(l.titre)}</span><a class="lien" href="#/lecon/${l.id}/revision">Revoir la leçon</a></div>` : "";
}

function vueCarte(it) {
  // Un de mes mots a pu être corrigé pendant la série (« Modifier ») : on reprend sa dernière version.
  if (it.mot.moi) it.mot = { ...it.mot, ...monMot(it.mot.id) };
  const m = it.mot;
  const tete = sorte(s.revision ? `${it.repasse ? "On la revoit" : "Tes cartes à revoir"} · carte 1${nbCartes(m) > 1 ? ` sur ${nbCartes(m)}` : ""}` : "Carte · du français à l'espagnol");
  const origine = origineDe(m);
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
      ${lignesDuMot(m)}
      ${formesCarte(m)}
      ${origine}
    </div>
    <div class="espace"></div>
    ${notes("Tu l'avais trouvé avant de retourner la carte ?", false)}`;
}

// ——— chantier 24 : les cartes qu'on écrit en révision ———

// Quand la carte revient, dit sous la note (« Noté Oui · elle revient dans 7 jours »).
function quandTexte(cle, note, repasse) {
  if (repasse) return note === 1 ? "elle revient demain" : "comptée au 1er passage, elle revient demain";
  if (note === 1) return "on la revoit à la fin, puis demain";
  const f = fichesCartes()[cle];
  const j = INTERVALLES[f?.boite ?? 0];
  return j <= 1 ? "elle revient demain" : `elle revient dans ${j} jours`;
}
const NOTES = { 1: "Non", 2: "Avec peine", 3: "Oui" };
const ligneNote = (it, cle) => `<p class="suite-note">${it.repasse ? "On la revoit" : `Noté <b>${NOTES[s.resultat.note]}</b>`} · ${quandTexte(cle, s.resultat.note, it.repasse)}</p>`;

// « Écoute, puis répète-le » : la voix le dit toute seule (apres), le micro est facultatif (Q24-13).
// Carte 1 ratée (étape 2, Q26-5) : « Dis-le deux fois » remplace « Écoute, puis répète-le » ; le micro reste, facultatif.
function blocRepete(texte, rate = false) {
  return `<div class="repete">
      <div class="h">${ecouter(texte, "grand")}${rate ? `<span class="x2" aria-hidden="true">× 2</span><span>Dis-le deux fois, à voix haute.</span>` : `<span>Écoute, puis répète-le.</span>`}</div>
      ${aUnEnregistrement() ? `<div class="deux"><button data-voix aria-pressed="false">${ICONES.lecture}Ma voix</button></div>` : ""}
      ${enregistrementPossible() ? `<button class="reessai" data-micro><span class="chrono">${aUnEnregistrement() ? "Reste appuyé ici pour te réenregistrer" : "Reste appuyé ici pour t'enregistrer (facultatif)"}</span></button>` : ""}
    </div>`;
}

// La carte 1 en révision : « Dis-le à voix haute, puis écris-le ». Ce que j'écris note (oreille.js, jugerMot).
function vueMotEcrit(it, enTete) {
  if (it.mot.moi) it.mot = { ...it.mot, ...monMot(it.mot.id) };
  const m = it.mot;
  const tete = sorte(`${it.repasse ? "On la revoit" : "Tes cartes à revoir"} · carte 1${nbCartes(m) > 1 ? ` sur ${nbCartes(m)}` : ""}`);
  if (s.phase === "question") {
    return `<div class="defile">${enTete}${tete}
        <div class="carte"><p class="fr-seul">${esc(m.fr)}</p><p class="sous">Dis-le à voix haute, puis écris-le.</p></div>${zoneIndice(it)}</div>
      <form class="saisie" data-p-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="Ta réponse en espagnol" value="${esc(s.saisie)}" aria-label="Ta réponse en espagnol">
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides">${boutonIndice(it)}${boutonSaisPas('data-p="sais-pas"')}</div>
      </form>`;
  }
  const r = s.resultat;
  const ok = r.niveau === "juste" || r.niveau === "accents";
  const titre = { juste: s.indice ? "Juste, avec un indice" : "Juste", accents: s.indice ? "Juste, avec un indice" : "Juste, aux accents près", article: "Presque : l'article", faux: "Pas encore", passe: "La réponse" }[r.niveau];
  const classe = ok ? "ok" : r.niveau === "article" ? "mi" : r.niveau === "passe" ? "ko passe" : "ko";
  const surligne = morceaux => morceaux.map(x => x.juste ? esc(x.brut) : `<mark class="faux">${esc(x.brut)}</mark>`).join(" ");
  const tape = !s.saisie || ok ? "" : `<p class="tape">${r.tape ? surligne(r.tape) : esc(s.saisie)}</p>`;
  const bonne = r.niveau === "article" ? esc(r.attendu).replace(/^(\S+)/, `<mark class="bon">$1</mark>`) : esc(m.es);
  return `${enTete}${tete}${tape}
    <div class="verdict ${classe}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(m.es)}<p lang="es">${bonne}</p></div>
      ${r.niveau === "accents" || r.accents ? `<p>Regarde les accents : à l'oral, ils disent où appuyer.</p>` : ""}
      ${r.niveau === "article" ? `<p>Un nom s'apprend avec son article : <i lang="es">${esc(r.attendu)}</i>.</p>` : ""}
      ${r.astuce ? `<p>${esc(r.astuce)}</p>` : ""}
    </div>
    ${m.ex ? `<p class="exemple" lang="es">${phraseTouchable(ctxVue, m.ex)}</p>` : ""}
    ${lignesDuMot(m)}${formesCarte(m)}
    ${blocRepete(m.es, !ok)}
    ${origineDe(m)}
    <div class="espace"></div>
    ${ligneNote(it, m.id)}
    ${suiteErreur(it)}<button class="primaire" data-p="suivant">Suivant</button>`;
}

// La carte 5 « à l'oreille » : la phrase est dite à l'ouverture (apres), puis 2 réécoutes au plus (normales ou lentes).
const REECOUTES = 2;
const resteEcoutes = () => {
  const n = REECOUTES - (s.ecoutes || 0);
  return `${Array.from({ length: REECOUTES }, (_, k) => `<i class="${k < n ? "" : "vide"}"></i>`).join("")}<span>${n ? `${n} réécoute${n > 1 ? "s" : ""}` : "Plus de réécoute : écris ce que tu as retenu"}</span>`;
};
const PICTO_LENT = `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16h15a3 3 0 0 0 3-3v-1M5 16c0-4 3-7 7-7s6 3 6 7"/><circle cx="20" cy="10" r="1.6"/></svg>`;
function vueOreille(it, enTete) {
  const tete = sorte(`${it.repasse ? "On la revoit" : "Tes cartes à revoir"} · carte 5 · à l'oreille`);
  if (s.phase === "question") {
    const fini = (s.ecoutes || 0) >= REECOUTES ? " disabled" : "";
    return `<div class="defile">${enTete}${tete}
        <p class="sous">Écoute la phrase, puis écris-la en entier.</p>
        <div class="oreilles">
          <button type="button" data-p="reecoute" aria-label="Réécouter la phrase"${fini}>${ICONES.lecture}<span>Réécouter</span></button>
          <button type="button" class="lent" data-p="reecoute" data-lent aria-label="Réécouter la phrase lentement"${fini}>${PICTO_LENT}<span>Lente</span></button>
        </div>
        <p class="reste-ecoutes" role="status">${resteEcoutes()}</p>${zoneIndice(it)}</div>
      <form class="saisie" data-p-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="Écris ce que tu entends" value="${esc(s.saisie)}" aria-label="Ce que tu entends, en espagnol">
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides">${boutonIndice(it)}${boutonSaisPas('data-p="sais-pas"')}</div>
      </form>`;
  }
  const r = s.resultat;
  const ok = r.niveau === "juste" || r.niveau === "accents";
  const titre = { juste: s.indice ? "Juste, avec un indice" : "Juste", accents: s.indice ? "Juste, avec un indice" : "Juste",
    petit: "Presque : un petit mot", presque: "Presque : un mot", mot: "Pas encore : le mot de la carte", faux: "Pas encore", passe: "La phrase" }[r.niveau];
  const classe = ok ? "ok" : r.note === 2 ? "mi" : r.niveau === "passe" ? "ko passe" : "ko";
  const surligne = morceaux => morceaux.map(x => x.juste ? esc(x.brut) : `<mark class="faux">${esc(x.brut)}</mark>`).join(" ");
  const tape = s.saisie ? `<p class="ligne-o">Tu as écrit</p><p class="tape">${r.tape ? surligne(r.tape) : esc(s.saisie)}</p>` : "";
  const rappels = [
    r.petits?.length ? `${r.petits.length > 1 ? "Petits mots oubliés" : "Petit mot oublié"} : <b lang="es">${r.petits.map(esc).join(", ")}</b>` : "",
    r.accents?.length ? `Et l'accent : <b lang="es">${r.accents.map(esc).join(", ")}</b>` : "",
  ].filter(Boolean).join(" · ");
  return `${enTete}${tete}${tape}
    <div class="verdict ${classe}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(it.phrase)}<p lang="es">${phraseTouchable(ctxVue, it.phrase, { marques: r.reponse ? marquesDe(it.phrase, r.reponse, "bon") : [] })}</p></div>
    </div>
    ${rappels ? `<p class="rappel-o">${rappels}</p>` : ""}
    <p class="sous">Le mot de la carte : <span lang="es">${esc(it.mot.es)}</span> · ${esc(it.mot.fr)}</p>
    <div class="reec">
      <button type="button" data-dire="${esc(it.phrase)}" aria-pressed="false">${ICONES.lecture}Réécouter</button>
      <button type="button" data-dire="${esc(it.phrase)}" data-lent aria-pressed="false">${PICTO_LENT}Lente</button>
    </div>
    <div class="espace"></div>
    ${ligneNote(it, it.cle)}
    ${suiteErreur(it)}<button class="primaire" data-p="suivant">Suivant</button>`;
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

// La fin d'un paquet de « Tes mots à revoir » : un autre paquet si tu veux, tant qu'il reste des cartes dues (étape 3 : plus de plafond) ;
// sinon elles attendent demain. Étape 4 (Q26-15) : une ligne par mot entré tout seul dans « Mes mots en cours ».
function vueFinPaquet(ctx) {
  const n = s.notes.carte, r = s.notes.repasse || [];
  const dus = motsDus(ctx).length;
  const cartes = k => k ? `${k} carte${k > 1 ? "s" : ""}` : "aucune";
  return `<div class="fin">
      <h1>Paquet terminé</h1>
      <p class="sous">Tes cartes à revoir</p>
      <ul class="bilan">
        <li><b>Trouvées</b><span>${n.filter(x => x === 3).length} sur ${n.length}</span></li>
        <li><b>À revoir bientôt</b><span>${cartes(n.filter(x => x < 3).length)}</span></li>
        ${r.length ? `<li><b>Revues à la fin</b><span>${r.filter(x => x === 3).length} retrouvée${r.filter(x => x === 3).length > 1 ? "s" : ""} sur ${r.length}</span></li>` : ""}
      </ul>
      ${r.length ? `<p class="sous">Même retrouvées, elles reviennent demain : un mot qui vient d'échapper a besoin d'un jour de plus.</p>` : ""}
      ${(s.entres || []).map(({ mot, r }) => `<p class="entre-cours"><b lang="es">${esc(mot.es)}</b> entre dans Mes mots en cours : ${r === "2" ? "2 « Non » de suite" : "3 « Non » sur ses cartes"}.</p>`).join("")}
      ${dus ? `<div class="reste">
          <b>Il te reste ${cartes(dus)} à revoir</b>
          <p>Encore un paquet si tu as envie. Sinon, elles t'attendent demain.</p>
          <button class="primaire" data-p="continuer">Continuer · ${cartes(Math.min(dus, PAQUET))}</button>
        </div>` : `<p class="sous">C'est tout : le reste est à jour.</p>`}
    </div>
    <div class="espace"></div>
    ${versAujourdhui(dus ? "secondaire" : "primaire")}`;
}

// La fin de « Mes erreurs » : chaque carte, et quand elle revient. Les fiches sont déjà notées.
function vueFinErreurs() {
  const r = s.resultats;
  const erreurs = r.filter(x => x.it.type === "erreur");
  const phrase = r.find(x => x.it.phrase);
  const resume = [erreurs.length && `${erreurs.filter(x => x.ok).length} corrigée${erreurs.filter(x => x.ok).length > 1 ? "s" : ""} sur ${erreurs.length}`,
    phrase && "ta phrase redite"].filter(Boolean).join(", et ");
  const etiquette = x => x.it.phrase ? (x.ok ? ["ok", "Dite"] : ["ko", "À revoir"])
    : x.peine ? ["mi", "Accent"] : x.aide ? ["mi", "Indice"] : x.ok ? ["ok", "Juste"] : ["ko", "Demain"];
  const lignes = r.map(x => {
    const [cls, mot] = etiquette(x);
    const texte = x.it.phrase ? x.it.es : x.it.traduire ? x.it.traduire.es : x.it.carte.bonne;
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
      ${n.carte.some(x => x < 3) ? `<p class="sous">Les mots ratés reviendront dès demain dans « Tes cartes à revoir ».</p>` : ""}
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
    : ecranSerie(ctx, `revision:${ctx.jour}`, () => serieRevision(ctx), retour, "Rien à revoir aujourd'hui : tout est à jour.");
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
      // « Tes cartes à revoir » : le nombre de cartes revues aujourd'hui, sans les 2e passages (Q79). La leçon du jour : les réussites du premier coup.
      if (s.revision) cocher(ctx.jour, "revision", (Number(cases(ctx.jour).revision) || 0) + compteSerie(s.items, 0).premiers);
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
  const question = (it.type === "ecrire" || it.type === "erreur" || it.type === "tableau" || it.type === "oreille" || it.ecrite) && s.phase === "question";
  const vue = it.type === "ecrire" ? vueEcrire(it, enTete) : it.type === "erreur" ? vueErreur(it, enTete) : it.type === "tableau" ? vueTableau(it, enTete)
    : it.type === "oreille" ? vueOreille(it, enTete) : it.ecrite ? vueMotEcrit(it, enTete)
    : enTete + (it.type === "dire" ? vueDire(it) : vueCarte(it));
  return {
    onglet: null,
    apres: () => {
      // La barre avance sous tes yeux : elle part de la question précédente et glisse jusqu'à celle-ci.
      if (s.depuis != null) {
        const trait = document.querySelector(".piste i");
        s.depuis = null;
        requestAnimationFrame(() => requestAnimationFrame(() => { if (trait) trait.style.width = `${avancee(s.i) * 100}%`; }));
      }
      // Le clavier monte une fois la nouvelle question arrivée, pas pendant qu'elle glisse.
      // La carte 5 : la voix dit la phrase dès l'ouverture (ce n'est pas une des 2 réécoutes).
      if (it.type === "oreille" && s.phase === "question" && !s.dit) { s.dit = true; dire(it.phrase); }
      if ((it.type === "ecrire" || it.type === "oreille" || it.ecrite || (it.type === "erreur" && !it.cases)) && s.phase === "question") {
        const i = s.i;
        setTimeout(() => { if (s?.i === i && s.phase === "question") document.getElementById("reponse")?.focus({ preventScroll: true }); }, 400);
      }
      // La carte retournée dit le mot toute seule, et son bouton s'allume pendant ce temps.
      // La carte 1 écrite (chantier 24) : la voix le dit après la correction, pour que je le répète.
      if (it.type === "carte" && s.phase === "reponse" && !s.dit && !texteErreur(it)) {
        s.dit = true;
        const b = document.querySelector(".carte .ecoute, .repete .ecoute");
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
      // Étape 2 (28 nov.) : « Je ne sais pas » après 5 s ; après une erreur, la voix, puis la suite toute seule.
      if (s.phase === "question") armerSaisPas(it);
      else if (!s.compte) {
        const textes = texteErreur(it);
        if (textes) {
          s.compte = true;
          apresErreur({
            textes, zone: document.querySelector("[data-compte]"),
            bouton: document.querySelector(".repete .ecoute") || document.querySelector(".verdict .bonne .ecoute"),
            suivre: () => document.querySelector('[data-p="suivant"]')?.click(),
          });
        }
      }
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
  s.resultats.push({ it, ok: resultat !== "rate", aide: resultat === "aide", peine: !!s.resultat?.peine, fiche, ...extra });
}

// Les cartes 3, 4, 5 de « Tes mots à revoir » (chantier 15) : juste du premier coup = Oui ; avec un indice ou à un mot près = Avec peine ;
// faux ou « Je ne sais pas » = Non. Même mémoire que les cartes à dire.
// Un 2e passage (Q79) ne note rien : il compte seulement dans « Revues à la fin ».
function noterCarteEcrite(ctx, it, n) {
  if (!apresNote(s.items, s.i, n)) { s.notes.repasse.push(n); return; }
  noterMot(it.cle, n, ctx.jour);
  s.notes.carte.push(n);
  apresNoteMot(ctx, it.mot, n);
}

// Étape 4 (Q26-16) : un « Non » compté (pas le 2e passage, pas « Avec peine ») s'ajoute au compteur du mot ;
// à 3 « Non » en tout, ou 2 « Non » de suite à la carte 1, le mot entre tout seul dans « Mes mots en cours ».
// La fin du paquet le dit (une ligne par mot, Q26-15).
function apresNoteMot(ctx, mot, n) {
  if (!mot || n !== 1) return;
  compterNon(mot.id);
  const r = entrerSiBloque(ctx, mot, ctx.jour);
  if (r) (s.entres ||= []).push({ mot, r });
}

// La carte 1 écrite (chantier 24) : même mémoire que la carte retournée d'avant (« Tu bloques sur… » compris).
function noterCarte1(ctx, it, n) {
  if (s.indice) s.notes.aide.carte++;
  if (!apresNote(s.items, s.i, n)) { s.notes.repasse.push(n); return; }
  if (!it.mot.moi || monMot(it.mot.id)) noterMot(it.mot.id, n, ctx.jour);
  s.notes.carte.push(n);
  apresNoteMot(ctx, it.mot, n);
}

function suivant() {
  arreterCompte();
  s.compte = false;
  effacerEnregistrement();
  arreterLecture();
  s.depuis = s.i;
  arreterEcoute();
  s.i++; s.phase = "question"; s.resultat = null; s.saisie = ""; s.formes = null; s.astuce = ""; s.indice = 0; s.dit = false; s.ecoutes = 0;
  s.entendu = null; s.ecoute = false;
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
        noterCarteErreur(ctx, it, ok ? (s.indice || s.resultat.peine ? "aide" : "juste") : "rate", { astuce: s.resultat.astuce });
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
      if (it.ecrite || it.type === "oreille") {
        s.resultat = it.ecrite ? jugerMot(s.saisie, it.mot.es, { indice: !!s.indice }) : jugerOreille(s.saisie, it.phrase, it.motCarte, { indice: !!s.indice });
        if (it.ecrite) noterCarte1(ctx, it, s.resultat.note);
        else { if (s.indice) s.notes.aide.carte++; noterCarteEcrite(ctx, it, s.resultat.note); }
        arreterLecture();
        s.phase = "reponse";
        vibrer(s.resultat.note === 3 ? 12 : [8, 60, 8]); son(s.resultat.note === 3 ? "juste" : "rate");
        return true;
      }
      if (it.type === "erreur" && it.traduire) {
        s.resultat = jugerTraduction(s.saisie, it.traduire);
        const ok = s.resultat.ok;
        noterCarteErreur(ctx, it, ok ? (s.indice || s.resultat.peine ? "aide" : "juste") : "rate");
        s.phase = "reponse";
        vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
        return true;
      }
      if (it.type === "erreur") {
        s.resultat = juger(s.saisie, it.carte);
        const ok = s.resultat.ok;
        noterCarteErreur(ctx, it, ok ? (s.indice || s.resultat.peine ? "aide" : "juste") : "rate", { astuce: s.resultat.astuce });
        s.phase = "reponse";
        vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
        return true;
      }
      s.resultat = corriger(s.saisie, it.es);
      const ok = s.resultat.niveau === "juste" || s.resultat.niveau === "accents";
      if (it.cle) noterCarteEcrite(ctx, it, ok ? (s.indice ? 2 : 3) : s.resultat.niveau === "presque" ? 2 : 1);
      s.notes.ecrire.push(ok);
      s.resultats.push({ it, ok, saisie: s.saisie });
      if (s.indice) s.notes.aide.ecrire++;
      s.phase = "reponse";
      vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
      return true;
    }
    case "sais-pas":
      if (it.ecrite || it.type === "oreille") {
        s.saisie = "";
        s.resultat = { niveau: "passe", note: 1, attendu: it.ecrite ? reponsesMot(it.mot.es)[0] : it.phrase };
        if (it.ecrite) noterCarte1(ctx, it, 1); else noterCarteEcrite(ctx, it, 1);
        arreterLecture();
        s.phase = "reponse";
        return true;
      }
      if (it.type === "erreur" && it.cases) {
        s.resultat = { ...jugerCases([], it.cases), passe: true };
        noterCarteErreur(ctx, it, "rate");
        s.phase = "reponse";
        return true;
      }
      if (it.type === "erreur" && it.traduire) {
        s.saisie = ""; s.resultat = { ok: false, passe: true, position: -1, rappel: "" };
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
      if (it.cle) noterCarteEcrite(ctx, it, 1);
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
      // En révision, une carte ratée revient à la fin du paquet ; son 2e passage ne note rien (Q79).
      if (it.type === "carte" && s.revision && !apresNote(s.items, s.i, n)) s.notes.repasse.push(n);
      else if (it.type === "carte") { if (!it.mot.moi || monMot(it.mot.id)) noterMot(it.mot.id, n, ctx.jour); s.notes.carte.push(n); apresNoteMot(ctx, it.mot, n); }
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
    case "ecouter-dire": { // « On me comprend ? » : toucher le micro pour parler, toucher encore pour finir
      if (ecouteEnCours()) { ecouterMicro({}); return false; }
      arreterLecture();
      const i = s.i;
      s.ecoute = true; s.astuce = "";
      ecouterMicro({
        fin: r => { if (s?.i !== i) return; s.ecoute = false; s.entendu = r; s.phase = "reponse"; vibrer(8); redessiner(); },
        echec: () => {
          if (s?.i !== i) return;
          s.ecoute = false;
          s.astuce = "Le téléphone ne peut pas t'écouter (pas de réseau ?) : enregistre-toi, puis compare avec le modèle.";
          redessiner();
        },
      });
      return true;
    }
    case "reecoute": { // la carte 5 : 2 réécoutes au plus, normales ou lentes ; l'écran n'est pas redessiné (ta saisie reste)
      if (it.type !== "oreille" || (s.ecoutes || 0) >= REECOUTES) return false;
      s.ecoutes = (s.ecoutes || 0) + 1;
      el.classList.add("parle");
      dire(it.phrase, { lent: "lent" in el.dataset, fin: () => el.classList.remove("parle") });
      const reste = document.querySelector(".reste-ecoutes");
      if (reste) reste.innerHTML = resteEcoutes();
      if (s.ecoutes >= REECOUTES) document.querySelectorAll('[data-p="reecoute"]').forEach(b => { b.disabled = true; });
      document.getElementById("reponse")?.focus({ preventScroll: true });
      return false;
    }
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
