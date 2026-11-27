// S'entraîner aux verbes (#/verbes/cours, #/verbes/tous, #/verbes/un/VERBE/ID-DU-MOT/DEPUIS/TEMPS) : une série de 10 questions,
// pour sortir la bonne forme vite, dans n'importe quel ordre. Le moteur (quels verbes, quelles questions) est dans verbes.js.
// Trois sortes de questions notées (trouve la forme, dans une phrase, à l'envers) et un tableau à dire, pas noté.
// À la fin : le score, « À retenir », et « Tu le sais ? » pour un verbe en cours tout juste sur 2 séries de suite.
// Pas de chrono ni de record ici (ce sera la « Course de conjugaison » des jeux). Rien ne touche à la révision des mots.
// Ici aussi : les boutons « Je l'apprends », « + » et « Je le sais » de la page Verbes et des fiches du Dico.

import { esc, md, ICONES } from "../ui.js?v=75";
import { corriger } from "../corriger.js?v=75";
import { PERSONNES, formesSurlignees, TEMPS } from "../controles.js?v=75";
import { verbesCours, mesVerbes, trouverVerbe, tirerSerie, libelle, sensDe, tempsVus, tempsVu } from "../verbes.js?v=75";
import { mettreEnCours, retirerDesCours, verbeEnCours, verbesEnCours, seriesJustes, noterSerieVerbes, apprendreEnAvance, derniereSerie } from "../progression.js?v=75";
import { motVu } from "../dico.js?v=75";
import { lancerLecture, arreterLecture } from "../lecture.js?v=75";
import { vibrer, son } from "../retours.js?v=75";

// Plus de limite au nombre de verbes en cours (Q10-16) : une série en prend VERBES_PAR_SERIE, d'abord ceux jamais
// travaillés en série (souvent tout juste ajoutés), puis ceux travaillés il y a le plus longtemps. Chaque verbe revient ainsi
// régulièrement, et « Tu le sais ? » (2 séries tout justes de suite) continue de faire sortir ceux que je sais.
export const VERBES_PAR_SERIE = 5;
const lesPlusAnciens = verbes => [...verbes].sort((a, b) => derniereSerie(a.v).localeCompare(derniereSerie(b.v))).slice(0, VERBES_PAR_SERIE);
let s = null; // la série en cours

const MODES = {
  cours: { titre: "Mes verbes en cours", verbes: verbesCours },
  tous: { titre: "Tous mes verbes", verbes: mesVerbes },
};

// Les temps de la série (chantier 16) : depuis une fiche, celui de l'onglet ouvert (même pas encore vu, Q57 du hub) ;
// sinon les temps vus. Le temps s'écrit dans la question dès que la série n'est pas tout au présent.
function nouvelleSerie(ctx, cle, mode, v, retour, t) {
  const tous = mode === "un" ? [trouverVerbe(ctx, v)].filter(Boolean) : MODES[mode]?.verbes(ctx) || [];
  const verbes = mode === "cours" ? lesPlusAnciens(tous) : tous;
  const temps = mode === "un" ? [TEMPS[t] ? t : "present"] : tempsVus(ctx);
  s = {
    cle, mode, retour, verbes, t: temps[0],
    montrerTemps: temps.some(x => x !== "present"),
    titre: mode === "un" ? `${verbes[0]?.v || v}${temps[0] === "present" ? "" : ` · ${TEMPS[temps[0]].nom}`}` : MODES[mode]?.titre || "Verbes",
    items: tirerSerie(ctx, verbes, { tableauEnPremier: mode === "un", temps }),
    i: 0, phase: "question", saisie: "", resultat: null, montres: new Set(), resultats: [], fini: false,
  };
}

// ——— l'affichage ———
const barre = () => `<header class="barre-ex">
    <a class="quitter" href="${s.retour}">${ICONES.fermer}Quitter</a>
    <span class="piste" role="progressbar" aria-valuemin="0" aria-valuemax="${s.items.length}" aria-valuenow="${s.i}"><i style="width:${((s.depuis ?? s.i) / s.items.length) * 100}%"></i></span>
    <span class="compte">${s.i + 1} / ${s.items.length}</span>
  </header>`;
const sorte = t => `<p class="sorte"><i aria-hidden="true"></i>${t}</p>`;
const ecouter = (texte, cls = "") => `<button class="ecoute ${cls}" data-dire="${esc(texte)}" aria-label="Écouter : ${esc(texte)}" aria-pressed="false">${ICONES.lecture}</button>`;
const surligne = f => esc(f).replace(/\*\*(.+?)\*\*/g, `<span class="term">$1</span>`);
// Le temps : « passé composé » dans une bulle, et « pas vu · U12 » dessous si sa leçon n'est pas faite (Q16-3).
const nomTemps = t => TEMPS[t].nom;
const unite = t => TEMPS[t].lecon.split("-")[0];
const bulleTemps = (ctx, q) => s.montrerTemps ? `<p class="q-temps">${esc(nomTemps(q.temps))}</p>${tempsVu(ctx, q.temps) ? "" : `<p class="q-pas-vu">pas vu · ${unite(q.temps)}</p>`}` : "";
const sixFormes = (q, ouvert = false) => {
  const f = formesSurlignees(q.v, q.d, q.temps);
  return `<details class="six-formes"${ouvert ? " open" : ""}><summary>Les 6 formes de ${esc(q.v)}${q.temps === "present" ? "" : ` · ${esc(nomTemps(q.temps))}`}</summary><dl>${PERSONNES.map((per, i) =>
    `<dt>${per}</dt><dd lang="es"${i === q.p ? ' class="ici"' : ""}>${surligne(f[i])}</dd>`).join("")}</dl></details>`;
};
// La phrase, avec le trou ou avec la forme en gras.
// En début de phrase, la forme prend la majuscule (« Soy francés… »).
const majuscule = (q, f) => q.avant.trim() ? f : f[0].toUpperCase() + f.slice(1);
const phrase = (q, forme) => `${esc(q.avant)}${forme ? `<mark class="bon">${esc(majuscule(q, forme))}</mark>` : `<span class="trou" aria-label="trou"></span>`}${esc(q.apres)}`;

function vueEcrire(ctx, q) {
  const tete = q.type === "forme"
    ? `${sorte("Verbes · trouve la forme")}
      <p class="q-verbe" lang="es">${esc(q.v)}</p>
      <p class="q-personne" lang="es">${esc(PERSONNES[q.p])}</p>
      ${bulleTemps(ctx, q)}
      ${q.sens ? `<p class="q-sens" lang="es">${esc(q.sens)}</p>` : ""}`
    : `${sorte("Verbes · dans une phrase")}
      <p class="enonce q-phrase" lang="es">${phrase(q)}</p>
      <p class="q-sens"><span lang="es">(${esc(q.v)}</span>${s.montrerTemps ? `, ${esc(nomTemps(q.temps))}` : ""})</p>
      ${s.montrerTemps && !tempsVu(ctx, q.temps) ? `<p class="q-pas-vu">pas vu · ${unite(q.temps)}</p>` : ""}`;
  if (s.phase === "question") {
    return `<div class="defile">${barre()}${tete}</div>
      <form class="saisie" data-v-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="La forme en espagnol" value="${esc(s.saisie)}" aria-label="La forme en espagnol">
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides"><button class="secondaire" type="button" data-v="sais-pas">Je ne sais pas</button></div>
      </form>`;
  }
  const r = s.resultat;
  const ok = r.niveau === "juste" || r.niveau === "accents";
  const titre = { juste: "Juste", accents: "Juste, aux accents près", passe: "La réponse" }[r.niveau] || "Pas encore";
  const bonne = q.type === "phrase" ? phrase(q, q.es[0]) : `${esc(PERSONNES[q.p])} → <b>${esc(q.es[0])}</b>`;
  const aDire = q.type === "phrase" ? `${q.avant}${majuscule(q, q.es[0])}${q.apres}` : q.es[0];
  return `${barre()}${tete}
    ${s.saisie ? `<p class="tape">${ok ? esc(s.saisie) : `<mark class="faux">${esc(s.saisie)}</mark>`}</p>` : ""}
    <div class="verdict ${ok ? "ok" : r.niveau === "passe" ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(aDire)}<p lang="es">${bonne}</p></div>
      ${r.niveau === "accents" ? `<p>Regarde les accents : à l'oral, ils disent où appuyer.</p>` : ""}
      ${sixFormes(q, !ok)}
    </div>
    <div class="espace"></div>
    <button class="primaire" data-v="suivant">Suivant</button>`;
}

function vueEnvers(q) {
  const tete = `${barre()}${sorte("Verbes · à l'envers")}
    <p class="q-verbe" lang="es">${esc(q.forme)}</p>
    <p class="q-sens">C'est quel verbe, avec qui ?</p>`;
  if (s.phase === "question") {
    return `${tete}<div class="espace"></div>
      <div class="choix-envers">${q.choix.map((c, k) => `<button data-v="choix" data-k="${k}" lang="es">${esc(libelle(c))}</button>`).join("")}</div>`;
  }
  const choisi = q.choix[s.choisi];
  const ok = choisi.v === q.v && choisi.p === q.p;
  return `${tete}
    <div class="choix-envers repondu">${q.choix.map((c, k) => {
      const bon = c.v === q.v && c.p === q.p;
      return `<button disabled class="${bon ? "bon" : k === s.choisi ? "faux" : ""}" lang="es">${esc(libelle(c))}</button>`;
    }).join("")}</div>
    <div class="verdict ${ok ? "ok" : "ko"}" role="status">
      <b>${ok ? "Juste" : "Pas encore"}</b>
      <div class="bonne">${ecouter(q.forme)}<p lang="es"><b>${esc(q.forme)}</b> = ${esc(libelle(q))}</p></div>
      ${sixFormes(q, !ok)}
    </div>
    <div class="espace"></div>
    <button class="primaire" data-v="suivant">Suivant</button>`;
}

// Le tableau à dire : on dit la forme à voix haute, on touche, elle s'affiche et se prononce. Pas de note.
const ligneMontree = (f, i) => `<button class="f vu" data-dire="${esc(f)}" aria-label="Écouter : ${esc(f)}" aria-pressed="false" data-k="${i}"><span lang="es">${esc(f)}</span>${ICONES.lecture}</button>`;
const ligneCachee = i => `<button class="f cache" data-v="montrer" data-k="${i}">dis-le, puis touche</button>`;
// Un temps pas encore vu : la ligne entière ici, sur le premier écran de la série (Q57 du hub, Q16-3).
function vueTableau(ctx, q) {
  return `${barre()}${sorte("Verbes · dis le tableau")}
    <div class="tete-tableau"><p class="q-verbe" lang="es">${esc(q.v)}</p>${q.sens ? `<p class="q-sens" lang="es">${esc(q.sens.replace(/^[^=]*= /, "= "))}</p>` : ""}</div>
    ${s.montrerTemps ? `<p class="q-temps">${esc(nomTemps(q.temps))}</p>` : ""}
    ${tempsVu(ctx, q.temps) ? "" : `<p class="pas-vu">Pas encore vu : le prof l'expliquera en ${unite(q.temps)}.</p>`}
    <p class="consigne-dire">Dis chaque forme à voix haute, puis touche pour vérifier.</p>
    ${s.montres.size < 6 ? `<button class="lien tout-montrer" data-v="tout-montrer">Tout montrer</button>` : ""}
    <div class="tab-dire">${PERSONNES.map((per, i) => `<div class="ligne"><span class="p">${per}</span>${s.montres.has(i) ? ligneMontree(q.formes[i], i) : ligneCachee(i)}</div>`).join("")}</div>
    ${q.exemple ? `<p class="exemple-verbe" lang="es">${md(q.exemple)}</p>` : ""}
    <div class="espace"></div>
    <button class="primaire" data-v="suivant">Suivant</button>`;
}

// ——— la fin ———
function vueFin() {
  const notees = s.resultats;
  const justes = notees.filter(r => r.ok).length;
  const tableau = s.items.find(q => q.type === "tableau");
  // « À retenir » : une ligne par verbe et par temps raté, ses formes ratées (sans doublon) ; le temps écrit s'il n'est pas le présent (Q16-4).
  const rates = new Map();
  for (const { q, ok } of notees) {
    if (ok) continue;
    const k = `${q.v}|${q.temps}`;
    const m = rates.get(k) || rates.set(k, new Map()).get(k);
    m.set(q.p, q.type === "envers" ? q.forme : q.es[0]);
  }
  const retenir = [...rates].map(([k, formes]) => [...k.split("|"), formes]).map(([v, t, formes]) => `<li><i lang="es">${esc(v)}</i>${t === "present" ? "" : `, ${esc(nomTemps(t))}`} : ${[...formes].sort((a, b) => a[0] - b[0])
    .map(([p, f]) => `${PERSONNES[p]} → <b lang="es">${esc(f)}</b>`).join(", ")}</li>`).join("");
  // « Tu le sais ? » : un verbe en cours, tout juste sur 2 séries de suite (celle-ci comprise).
  const proposer = [...new Set(notees.map(r => r.q.v))].filter(v => verbeEnCours(v) && seriesJustes(v) >= 2);
  const sais = proposer.map(v => `<div class="tu-le-sais" role="status"><p><b lang="es">${esc(v)}</b> : tout juste ${seriesJustes(v)} séries de suite. Tu le sais ?</p>
      <button class="oui" data-v="sais" data-verbe="${esc(v)}">Oui, je le sais</button>
      <small>Il sort de tes mots en cours et reste dans « Tous mes verbes ».</small></div>`).join("");
  const retourNom = s.mode === "un" ? "Retour à la fiche" : s.mode === "cours" ? "Retour au Dico" : "Retour aux verbes";
  return `<div class="fin">
      <h1>Série terminée</h1>
      <p class="sous">${esc(s.titre)} · ${s.items.length} questions</p>
      <ul class="bilan">
        <li><b>Justes</b><span>${justes} sur ${notees.length}</span></li>
        ${tableau ? `<li><b>Tableau à dire</b><span><span lang="es">${esc(tableau.v)}</span>${tableau.temps === "present" ? "" : `, ${esc(nomTemps(tableau.temps))}`}</span></li>` : ""}
      </ul>
      ${retenir ? `<section aria-labelledby="t-retenir"><h2 id="t-retenir">À retenir</h2><ul class="a-retenir">${retenir}</ul></section>` : ""}
      ${sais}
    </div>
    <div class="espace"></div>
    <button class="secondaire" data-v="encore">Encore 10</button>
    <a class="primaire" href="${s.retour}" data-remplace>${retourNom}</a>`;
}

// #/verbes/cours, #/verbes/tous, #/verbes/un/VERBE/ID/DEPUIS/TEMPS (le temps de l'onglet ouvert sur la fiche ; présent sinon)
export function ecranVerbes(ctx, mode, a, b, c, d) {
  const v = mode === "un" ? decodeURIComponent(a || "") : null;
  const t = mode === "un" && TEMPS[d] ? d : "present";
  const retour = mode === "un" ? `#/dico/mot/${b || ""}/${c || "verbes"}` : "#/dico/verbes";
  // Les séries mélangées changent quand un nouveau temps devient vu.
  const cle = `${mode}:${v || ""}:${mode === "un" ? t : tempsVus(ctx).join(",")}`;
  // Une série quittée en cours reprend à la même question ; une série finie recommence.
  if (!s || s.cle !== cle || s.fini) nouvelleSerie(ctx, cle, mode, v, retour, t);
  if (!s.items.length) {
    const vide = s.mode === "cours" ? "Pas encore de verbe en cours : ajoute-en un depuis la page Verbes." : "Pas encore de verbe à travailler.";
    s = null;
    return { onglet: null, html: `<main class="colonne vide"><h1>Rien à travailler</h1><p class="sous">${vide}</p><a class="lien" href="${retour}">Revenir</a></main>` };
  }
  if (s.i >= s.items.length) {
    if (!s.fini) {
      s.fini = true;
      son("fin");
      // Pour « Tu le sais ? » : chaque verbe interrogé, tout juste ou non.
      const parVerbe = {};
      for (const { q, ok } of s.resultats) parVerbe[q.v] = (parVerbe[q.v] ?? true) && ok;
      noterSerieVerbes(parVerbe, ctx.jour);
    }
    return { onglet: null, html: `<main class="colonne exo">${vueFin()}</main>` };
  }
  const q = s.items[s.i];
  const ecrire = (q.type === "forme" || q.type === "phrase");
  const vue = ecrire ? vueEcrire(ctx, q) : q.type === "envers" ? vueEnvers(q) : vueTableau(ctx, q);
  return {
    onglet: null,
    html: `<main class="colonne exo verbes-exo${ecrire && s.phase === "question" ? " ecrire-q" : ""}">${vue}</main>`,
    apres: () => {
      if (s.depuis != null) {
        const trait = document.querySelector(".piste i");
        s.depuis = null;
        requestAnimationFrame(() => requestAnimationFrame(() => { if (trait) trait.style.width = `${(s.i / s.items.length) * 100}%`; }));
      }
      if (ecrire && s.phase === "question") {
        const i = s.i;
        setTimeout(() => { if (s?.i === i && s.phase === "question") document.getElementById("reponse")?.focus({ preventScroll: true }); }, 400);
      }
    },
  };
}

function suivant() {
  arreterLecture();
  s.depuis = s.i;
  s.i++; s.phase = "question"; s.saisie = ""; s.resultat = null; s.choisi = null; s.montres = new Set();
}

function noter(q, ok) {
  s.resultats.push({ q, ok });
  s.phase = "reponse";
  vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
}

// Le formulaire « Vérifier ». Renvoie true si l'écran doit être redessiné.
export function verifierVerbe() {
  if (!s) return false;
  const q = s.items[s.i];
  s.saisie = document.getElementById("reponse")?.value.trim() || "";
  if (!s.saisie) return false;
  s.resultat = corriger(s.saisie, q.es);
  noter(q, s.resultat.niveau === "juste" || s.resultat.niveau === "accents");
  return true;
}

// Les boutons d'ici. Renvoie "suivant" (nouvel écran, qui glisse), true (redessiner), false (rien), ou null si ce n'est pas un bouton d'ici.
export function actionVerbes(ctx, e) {
  // « Je l'apprends » (fiche) et « + » (À apprendre ensuite) : le verbe passe en cours ; si sa carte n'est pas encore vue,
  // elle entre aussi dans « Tes mots à revoir » dès demain, comme « L'apprendre maintenant ».
  const apprendre = e.target.closest("[data-v-apprendre]");
  if (apprendre) {
    const m = ctx.mots.find(x => x.id === apprendre.dataset.mot);
    mettreEnCours(apprendre.dataset.vApprendre, ctx.jour);
    if (m && !motVu(ctx, m)) apprendreEnAvance(m.id, ctx.jour);
    vibrer();
    return true;
  }
  const retirer = e.target.closest("[data-v-retirer]");
  if (retirer) { retirerDesCours(retirer.dataset.vRetirer); vibrer(); return true; }

  const b = e.target.closest("[data-v]");
  if (!b || !s) return null;
  const q = s.items[s.i];
  switch (b.dataset.v) {
    case "sais-pas":
      s.saisie = ""; s.resultat = { niveau: "passe" };
      s.resultats.push({ q, ok: false }); s.phase = "reponse";
      return true;
    case "choix":
      s.choisi = Number(b.dataset.k);
      { const c = q.choix[s.choisi]; noter(q, c.v === q.v && c.p === q.p); }
      return true;
    case "montrer": {
      // La forme s'affiche à sa place et se prononce, sans redessiner l'écran.
      const i = Number(b.dataset.k);
      s.montres.add(i);
      const nouveau = document.createRange().createContextualFragment(ligneMontree(q.formes[i], i)).firstElementChild;
      b.replaceWith(nouveau);
      lancerLecture(nouveau);
      vibrer(8);
      if (s.montres.size === 6) document.querySelector(".tout-montrer")?.remove();
      return false;
    }
    case "tout-montrer":
      for (let i = 0; i < 6; i++) s.montres.add(i);
      return true;
    case "suivant":
      suivant();
      return "suivant";
    case "encore": {
      const { cle, mode, retour, t } = s;
      const v = mode === "un" ? s.verbes[0]?.v : null;
      nouvelleSerie(ctx, cle, mode, v, retour, t);
      return "suivant";
    }
    case "sais": {
      // Sans redessiner (l'écran de fin ne doit pas relancer une série).
      const v = b.dataset.verbe;
      retirerDesCours(v);
      b.closest(".tu-le-sais").outerHTML = `<p class="tu-le-sais sorti" role="status"><b lang="es">${esc(v)}</b> sort de tes mots en cours. Bravo.</p>`;
      vibrer();
      return false;
    }
  }
  return false;
}

// ——— pour le Dico ———
// La carte du haut de la page Verbes : mes verbes en cours, « À apprendre ensuite », « Tous mes verbes ».
export const tropEnCours = () => verbesEnCours().length > 10
  ? `<p class="limite">Chaque série en prend ${VERBES_PAR_SERIE} : ceux que tu n'as pas travaillés depuis longtemps passent d'abord.</p>` : "";
export { sensDe };
