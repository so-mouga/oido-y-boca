// L'onglet « Dico » (#/dico) : le sommaire avec la recherche, une page par sorte (#/dico/verbes…),
// et la fiche d'un mot (#/dico/mot/ID/verbes : la fin dit d'où l'on vient, pour le lien du haut).
// Les mots vus (leçons faites, appris en avance, mes mots) ; ceux des leçons à venir seulement dans la recherche,
// sous « Plus loin dans le livre », et en bas de chaque page, dans « Pas encore vus ». Pas de révision ici : on revoit les mots mélangés, dans « Tes mots à revoir ».

import { esc, md, id, titre, ICONES, barreOnglets } from "../ui.js?v=54";
import { lecon as trouver } from "../position.js?v=54";
import { PERSONNES, formesSurlignees, conjuguer, TEMPS, ORDRE_TEMPS, reglesDetaillees } from "../controles.js?v=54";
import { etatRevision, apprisEnAvance } from "../progression.js?v=54";
import { SORTES, sorteDe, motsDuDico, motsAVenir, motVu, chercher, verbeDe, etiquette, REGLES, origineMonMot, rangLecon } from "../dico.js?v=54";
import { verbesCours, mesVerbes, suggestions } from "../verbes.js?v=54";
import { verbeEnCours } from "../progression.js?v=54";
import { tropEnCours } from "./verbes.js?v=54";
import { phraseTouchable } from "../toucher.js?v=54";

// La recherche tapée reste là quand on revient d'une fiche.
let recherche = "";

const loupe = `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>`;
const lienMot = (m, depuis) => `#/dico/mot/${encodeURIComponent(m.id)}/${depuis}`;
const ligneMot = (m, depuis, tag = "") => `<li><a href="${lienMot(m, depuis)}">
    <span class="es" lang="es">${esc(m.es)}</span><span class="fr">${esc(m.fr)}</span>${tag ? `<span class="tag">${esc(tag)}</span>` : ""}
  </a></li>`;
// Un mot pas encore vu : l'espagnol et le français sur une ligne, « arrive en U3-L2 » dessous (pas de bulle).
const ligneAVenir = (m, depuis) => `<li class="a-venir"><a href="${lienMot(m, depuis)}">
    <span class="l1"><span class="es" lang="es">${esc(m.es)}</span><span class="fr">${esc(m.fr)}</span></span>
    <small>arrive en ${id(m.lecon)}</small>
  </a></li>`;
// Les 8 premiers, puis « Voir les N autres » qui déplie le reste.
const MONTRES = 8;
function listeAVenir(mots, depuis) {
  const lignes = mots.map(m => ligneAVenir(m, depuis));
  return `<ul class="liste">${lignes.slice(0, MONTRES).join("")}</ul>${mots.length > MONTRES
    ? `<details class="autres"><summary>Voir les ${mots.length - MONTRES} autres</summary><ul class="liste">${lignes.slice(MONTRES).join("")}</ul></details>` : ""}`;
}
const parSorte = mots => Object.fromEntries(SORTES.map(s => [s.cle, mots.filter(m => sorteDe(m) === s)]));

// Une leçon : un lien si elle est faite, sinon son nom estompé (elle ne s'ouvre pas encore).
function lienLecon(ctx, idLecon, avant) {
  const l = trouver(idLecon);
  if (!l) return "";
  const nom = `${avant}${id(l.id)} · ${esc(l.titre)}`;
  return ctx.pos.faites.has(l.id)
    ? `<a class="lk" href="#/lecon/${l.id}/dico">${nom}</a>`
    : `<span class="lk avenir">${nom} <small>· pas encore vue</small></span>`;
}

// ── Le sommaire ──
function zoneSommaire(ctx) {
  const mots = motsDuDico(ctx);
  if (recherche.trim()) {
    const trouves = chercher(mots, recherche);
    // Puis les mots des leçons à venir, de la plus proche à la plus lointaine.
    const plusLoin = chercher(motsAVenir(ctx), recherche, m => rangLecon(m.lecon));
    if (!trouves.length && !plusLoin.length) return `<p class="sous">Aucun mot trouvé, ni dans tes leçons, ni plus loin dans le livre.</p>`;
    return `${trouves.length ? `<ul class="liste res">${trouves.map(m => ligneMot(m, "dico", sorteDe(m).tag)).join("")}</ul>`
        : `<p class="sous">Rien dans tes leçons faites.</p>`}
      ${plusLoin.length ? `<section class="plus-loin"><h2>Plus loin dans le livre</h2>${listeAVenir(plusLoin, "dico")}</section>` : ""}`;
  }
  const groupes = parSorte(mots);
  const aVenir = parSorte(motsAVenir(ctx));
  // « Mes mots » est toujours là, même vide : c'est par là qu'on ajoute un mot (entendu, ou donné par le prof).
  // Une sorte sans mot vu reste là si le livre en a plus loin (sa page montre « Pas encore vus ») ; le nombre ne compte que les vus.
  const lignes = SORTES.filter(s => groupes[s.cle].length || aVenir[s.cle].length || s.cle === "mes-mots").map(s => {
    const g = groupes[s.cle];
    const apercu = g.length ? `<small lang="es">${esc(g.slice(0, 3).map(m => m.es).join(", "))}${g.length > 3 ? "…" : ""}</small>`
      : s.cle === "mes-mots" ? `<small>Ajoute un mot entendu ou donné par le prof</small>` : `<small>Aucun vu pour l'instant</small>`;
    return `<li><a href="#/dico/${s.cle}">
        <span class="t">${esc(s.nom)}${apercu}</span>
        ${g.length ? `<span class="n">${g.length}</span>` : ""}${ICONES.chevron}
      </a></li>`;
  }).join("");
  const vide = mots.some(m => !m.moi) ? "" : `<p class="sous">Ton dico se remplit à chaque leçon faite avec le prof.</p>`;
  return `${vide}<ul class="cats">${lignes}</ul>`;
}

// Appelé à chaque lettre tapée : on ne redessine que la zone sous le champ, le clavier reste ouvert.
export function majRecherche(ctx, texte) {
  recherche = texte;
  const zone = document.querySelector("[data-dico-zone]");
  if (zone) zone.innerHTML = zoneSommaire(ctx);
}

function sommaire(ctx) {
  const n = motsDuDico(ctx).length;
  return {
    onglet: "dico",
    html: `<main class="colonne dico">
        <header class="tete"><h1>Ton dico</h1>
          <p class="sous">Les mots et expressions de tes leçons${n ? ` · ${n} mot${n > 1 ? "s" : ""}` : ""}.</p></header>
        <label class="cherche">${loupe}<input type="search" data-cherche placeholder="Chercher un mot" value="${esc(recherche)}"
          lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"
          aria-label="Chercher un mot, en espagnol ou en français"></label>
        <div data-dico-zone>${zoneSommaire(ctx)}</div>
      </main>${barreOnglets("dico")}`,
  };
}

// ── La page d'une sorte ──
const FAMILLES = [
  { cle: "ar", nom: "En -ar" }, { cle: "ir", nom: "En -ir" }, { cle: "er", nom: "En -er" }, { cle: "irr", nom: "Irréguliers" },
  { cle: "autres", nom: "Autres verbes" }, // ajoutés au Sheet après la vérification, ou « llueve »
];

// Une section : un en-tête collé en haut pendant le défilement, puis ses mots.
// replie : true = fermée (on l'ouvre d'un toucher), false = ouverte et repliable, null = toujours ouverte.
function section(ctx, titreSection, mots, depuis, regle = "", tag = () => "", replie = null) {
  const tete = `<span>${titreSection} · ${mots.length}</span>${regle}`;
  const liste = `<ul class="liste">${mots.map(m => ligneMot(m, depuis, tag(m))).join("")}</ul>`;
  if (replie === null) return `<section class="sec"><h2>${tete}</h2>${liste}</section>`;
  return `<details class="sec"${replie ? "" : " open"}><summary><h2>${tete}${ICONES.chevron}</h2></summary>${liste}</details>`;
}

// La recherche dans une page : elle reste quand on revient d'une fiche (une par page).
const recherchePage = {};
const NOMS_RECHERCHE = { verbes: "les verbes", noms: "les noms", adjectifs: "les adjectifs", expressions: "les expressions", "petits-mots": "les petits mots", "mes-mots": "tes mots" };
// L'article tapé ne compte pas : « el piso » et « piso » trouvent la même chose.
const sansArticle = q => q.trim().replace(/^(el|la|los|las|un|una|unos|unas)\s+/i, "");
const tagVerbe = m => { const vb = verbeDe(m); return vb ? etiquette(vb) : ""; };

// Le corps d'une page, sans ou avec recherche.
function corpsPage(ctx, sorte) {
  const texte = sansArticle(recherchePage[sorte.cle] || "");
  const tous = parSorte(motsDuDico(ctx))[sorte.cle];
  const mots = texte ? chercher(tous, texte) : tous;
  const aVenirTous = sorte.cle === "mes-mots" ? [] : parSorte(motsAVenir(ctx))[sorte.cle];
  let corps;
  if (sorte.cle === "mes-mots") {
    // Du plus récent au plus ancien.
    corps = mots.length ? `<ul class="liste">${mots.map(m => ligneMot(m, sorte.cle)).join("")}</ul>` : "";
  } else if (sorte.cle === "verbes") {
    // Rangés par famille de conjugaison, chacune avec la leçon de sa règle.
    corps = FAMILLES.map(f => {
      const dedans = mots.filter(m => (verbeDe(m)?.famille || "autres") === f.cle);
      if (!dedans.length) return "";
      const regle = REGLES[f.cle] ? regleCourte(ctx, REGLES[f.cle].lecon) : "";
      return section(ctx, f.nom, dedans, sorte.cle, regle, tagVerbe);
    }).join("");
  } else {
    // Par unité, la plus récente d'abord. Les 2 dernières ouvertes, les autres fermées (sauf pendant une recherche).
    const unites = [];
    for (const m of mots) {
      const u = trouver(m.lecon)?.unite;
      if (!u) continue;
      let g = unites.find(x => x.u === u);
      if (!g) unites.push(g = { u, mots: [], rang: rangLecon(m.lecon) });
      g.mots.push(m);
    }
    unites.sort((a, b) => b.rang - a.rang);
    corps = unites.map((g, i) => section(ctx, g.u.n ? `Unité ${g.u.n} · ${titre(g.u.titre)}` : titre(g.u.titre), g.mots, sorte.cle, "", () => "",
      texte ? null : i >= 2)).join("");
  }
  if (texte) {
    // Pendant une recherche : à la suite, les mots pas encore vus qui correspondent, les plus proches d'abord.
    const plusLoin = chercher(aVenirTous, texte, m => rangLecon(m.lecon));
    if (!corps && !plusLoin.length) return `<p class="sous">Aucun mot trouvé.</p>`;
    return `${corps || `<p class="sous">Rien dans tes leçons faites.</p>`}
      ${plusLoin.length ? `<section class="plus-loin"><h2>Plus loin dans le livre</h2>${listeAVenir(plusLoin, sorte.cle)}</section>` : ""}`;
  }
  if (sorte.cle === "mes-mots" && !corps) {
    corps = `<p class="sous">Pas encore de mots à toi. Après l'écoute du jour, tu peux garder 2 ou 3 mots entendus ; ceux que le prof te donne s'ajoutent ici.</p>`;
  }
  // En bas, fermé : les mots de cette sorte qui arrivent plus tard, de la leçon la plus proche à la plus lointaine.
  if (aVenirTous.length) {
    corps = `${corps || `<p class="sous">Pas encore de mots vus ici.</p>`}
      <details class="pas-vus"><summary><span>Pas encore vus · ${aVenirTous.length}</span>${ICONES.chevron}</summary>${listeAVenir(aVenirTous, sorte.cle)}</details>`;
  }
  return corps || `<p class="sous">Pas encore de mots ici.</p>`;
}

// Appelé à chaque lettre tapée dans la recherche d'une page : seule la liste est redessinée, le clavier reste ouvert.
export function majRecherchePage(ctx, cle, texte) {
  recherchePage[cle] = texte;
  const sorte = SORTES.find(s => s.cle === cle);
  const zone = document.querySelector("[data-page-zone]");
  if (sorte && zone) zone.innerHTML = corpsPage(ctx, sorte);
}

function pageSorte(ctx, sorte) {
  const vide = sorte.cle === "mes-mots" && !parSorte(motsDuDico(ctx))[sorte.cle].length;
  return {
    onglet: "dico",
    html: `<main class="colonne dico">
        <header class="nav-haut"><a class="retour" href="#/dico">${ICONES.retour}Ton dico</a></header>
        <h1>${esc(sorte.nom)}</h1>
        ${sorte.cle === "mes-mots" ? `<a class="primaire ajouter" href="#/mes-mots/ajouter">Ajouter un mot</a>` : ""}
        ${sorte.cle === "verbes" ? carteEntrainement(ctx) : ""}
        ${vide ? "" : `<label class="cherche">${loupe}<input type="search" data-cherche-page="${sorte.cle}" placeholder="Chercher dans ${NOMS_RECHERCHE[sorte.cle]}"
          value="${esc(recherchePage[sorte.cle] || "")}" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="search" aria-label="Chercher dans ${NOMS_RECHERCHE[sorte.cle]}, en espagnol ou en français"></label>`}
        <div class="page-zone" data-page-zone>${corpsPage(ctx, sorte)}</div>
      </main>${barreOnglets("dico")}`,
  };
}

// ── S'entraîner aux verbes : la carte du haut de la page Verbes ──
// Mes verbes en cours (choisis par moi) et le bouton de la série ; « À apprendre ensuite » : les 3 prochains verbes du livre,
// avec « + » ; puis « Tous mes verbes » (vus ou en cours). Les séries sont dans ecrans/verbes.js.
function carteEntrainement(ctx) {
  const cours = verbesCours(ctx);
  const tous = mesVerbes(ctx);
  const ensuite = suggestions(ctx);
  // Chaque verbe en cours : son lien vers sa fiche (s'il a une carte dans le Sheet), et une croix pour le retirer
  // (sans dire « je le sais », Q10-16). Un verbe des exercices sans carte (« buscar ») n'a pas de fiche.
  const puce = x => `<span class="puce-verbe">${x.carte ? `<a href="${lienMot(x.carte, "verbes")}" lang="es">${esc(x.v)}</a>` : `<span lang="es">${esc(x.v)}</span>`}<button class="retirer-verbe" data-v-retirer="${esc(x.v)}" aria-label="Retirer ${esc(x.v)} de mes verbes en cours">×</button></span>`;
  return `<section class="entrainement" aria-labelledby="t-cours">
      <div class="encours">
        <h2 id="t-cours">Mes verbes en cours${cours.length ? ` · ${cours.length}` : ""}</h2>
        ${cours.length ? `<div class="puces">${cours.map(puce).join("")}</div>
          <a class="primaire soleil" href="#/verbes/cours">S'entraîner · 10 questions</a>`
          : `<p>Aucun pour l'instant. Ajoute 1 ou 2 verbes : touche « + » ci-dessous, ou « Je l'apprends » sur la fiche d'un verbe.</p>`}
        ${tropEnCours()}
      </div>
      ${ensuite.length ? `<div class="ensuite"><h3>À apprendre ensuite</h3><ul>${ensuite.map(x => `<li>
          <a href="${lienMot(x.carte, "verbes")}"><span class="es" lang="es">${esc(x.v)}</span><span class="fr">${esc(x.fr || `dans « ${x.carte.es} »`)}<small>arrive en ${id(x.carte.lecon)}</small></span></a>
          <button class="ajout-verbe" data-v-apprendre="${esc(x.v)}" data-mot="${esc(x.carte.id)}" aria-label="Mettre ${esc(x.v)} dans mes verbes en cours">+</button>
        </li>`).join("")}</ul></div>` : ""}
      ${tous.length ? `<a class="tous" href="#/verbes/tous">Tous mes verbes · ${tous.length}</a>` : ""}
    </section>`;
}

function regleCourte(ctx, idLecon) {
  const texte = `La règle : ${id(idLecon)}`;
  return ctx.pos.faites.has(idLecon) ? `<a href="#/lecon/${idLecon}/dico">${texte}</a>` : `<span class="avenir">${texte}</span>`;
}

// ── La fiche d'un mot ──
const A_QUI = [["à moi", "me"], ["à toi", "te"], ["à lui, à elle", "le"], ["à nous", "nos"], ["à vous", "os"], ["à eux, à elles", "les"]];
const surligne = f => esc(f).replace(/\*\*(.+?)\*\*/g, `<span class="term">$1</span>`);

// Tous les temps, sur WordReference (Q86) : l'appli connaît le présent et les 3 passés.
const lienWR = vb => `<a class="lk wr" href="https://www.wordreference.com/conj/esverbs.aspx?v=${encodeURIComponent(vb.inf)}" target="_blank" rel="noopener">Toutes les conjugaisons (WordReference)${ICONES.sortie}</a>`;

// Le bas de la fiche d'un verbe qu'on peut travailler (formes connues, pas comme gustar).
// « Je l'apprends » : le verbe passe en cours, et si sa carte n'est pas vue, elle entre dans « Tes mots à revoir »
// (il remplace « L'apprendre maintenant » sur les fiches de verbe). En cours : « M'entraîner » et « Je le sais ».
function actionsVerbe(ctx, m, vb, vu, depuis) {
  const serie = `#/verbes/un/${encodeURIComponent(vb.v)}/${encodeURIComponent(m.id)}/${depuis || "verbes"}`;
  if (verbeEnCours(vb.v)) {
    return `<div class="espace"></div><p class="en-cours"><b lang="es">${esc(vb.v)}</b> est dans tes verbes en cours.</p>
      <a class="primaire soleil" href="${serie}">M'entraîner sur ce verbe</a>
      <button class="secondaire" data-v-retirer="${esc(vb.v)}">Je le sais</button>`;
  }
  return `<div class="espace"></div>
    <button class="primaire soleil" data-v-apprendre="${esc(vb.v)}" data-mot="${esc(m.id)}">Je l'apprends</button>
    <p class="petit">${vu ? "Il passe dans tes verbes en cours." : "Il passe dans tes verbes en cours, et son sens arrive dans tes mots à revoir dès demain."}</p>
    ${tropEnCours()}
    <a class="secondaire" href="${serie}">M'entraîner sur ce verbe</a>`;
}

function blocVerbe(ctx, vb) {
  if (!vb.formes) {
    return `<div class="bloc"><h3>${vb.famille === "irr" ? "Verbe irrégulier" : "Verbe"}</h3>
        <p class="regle">L'appli ne connaît pas encore ses formes : tu les verras avec le prof.</p>${lienWR(vb)}</div>`;
  }
  const quoi = vb.famille === "irr" ? "Verbe irrégulier" : `Verbe en -${vb.g} · ${etiquette(vb) || "régulier"}`;
  const vu = t => t === "present" || ctx.pos.faites.has(TEMPS[t].lecon);
  const onglets = ORDRE_TEMPS.map(t => `<button type="button" role="tab" data-temps="${t}" aria-selected="${t === "present"}">${
    esc(TEMPS[t].nom.replace(/^./, c => c.toUpperCase()))}${vu(t) ? "" : `<small>pas vu · ${TEMPS[t].lecon.split("-")[0]}</small>`}</button>`).join("");
  return `<div class="bloc"><h3>${esc(quoi)}</h3>
      <div class="temps" role="tablist" aria-label="Les temps">${onglets}</div>
      ${ORDRE_TEMPS.map(t => panneauTemps(ctx, vb, t, vu(t))).join("")}
      ${lienWR(vb)}
    </div>`;
}

// Les onglets par temps (Q85, revu par Kevin le 23 nov.) : tous s'ouvrent, même les temps pas encore vus,
// qui disent « pas vu · U12 » sur l'onglet et, dedans, « Pas encore vu : … arrive en U12-L1 ». La fiche s'ouvre sur le présent.
const QUAND = {
  pc: "pour aujourd'hui, ce matin, cette semaine : un temps pas encore fini",
  ps: "pour hier, samedi dernier, l'an dernier : un moment fini",
  imp: "pour décrire et pour les habitudes : ce que je faisais, comment c'était",
};
function panneauTemps(ctx, vb, t, vu) {
  // Comme gustar : la même forme du verbe, avec le petit mot qui dit à qui (me gusta, te gusta… ; me ha gustado…).
  const formes = vb.gustar ? A_QUI.map(([, pr]) => `**${pr}** ${conjuguer(vb.v, 2, vb.d, t)}`) : formesSurlignees(vb.v, vb.d, t);
  const personnes = vb.gustar ? A_QUI.map(([a]) => a) : PERSONNES;
  const regles = t === "present" || vb.gustar ? (t === "present" ? vb.regles : [REGLES.gustar]) : reglesDetaillees(vb.v, vb.d, t);
  const T = TEMPS[t], l = trouver(T.lecon);
  const tete = t === "present" ? "" : `${vu ? "" : `<p class="pas-vu">Pas encore vu : ${t === "imp" ? "l'" : "le "}${esc(T.nom)} arrive en ${id(T.lecon)}${l ? ` · ${esc(l.titre)}` : ""}. Tu peux regarder, le prof l'expliquera.</p>`}
      <p class="nom-temps">${esc(QUAND[t].replace(/^./, c => c.toUpperCase()))} · <i lang="es">${esc(T.livre)}</i></p>`;
  return `<div role="tabpanel" data-panneau="${t}"${t === "present" ? "" : " hidden"}>${tete}
      <dl class="formes">${personnes.map((p, i) => `<dt>${p}</dt><dd lang="es">${surligne(formes[i])}</dd>`).join("")}</dl>
      ${regles.map(r => `<p class="regle">${md(r.texte)}</p>${r.lecon ? lienLecon(ctx, r.lecon, "La règle : ") : ""}`).join("")}
    </div>`;
}

function etat(ctx, m) {
  const e = etatRevision(m.id, ctx.jour);
  const depuis = m.moi ? m.le : apprisEnAvance(m.id);
  if (!e && depuis) return depuis >= ctx.jour ? "À revoir demain" : "À revoir aujourd'hui";
  if (!e) return "Pas encore revu dans tes mots à revoir.";
  return e.dans === 0 ? "À revoir aujourd'hui" : e.dans === 1 ? "À revoir demain" : `À revoir dans ${e.dans} jours`;
}

function fiche(ctx, idMot, depuis) {
  const cherche = decodeURIComponent(idMot || "");
  const m = motsDuDico(ctx).find(x => x.id === cherche) || ctx.mots.find(x => x.id === cherche);
  const sorte = SORTES.find(s => s.cle === depuis);
  const retour = `<header class="nav-haut"><a class="retour" href="${sorte ? `#/dico/${sorte.cle}` : "#/dico"}" data-arriere>${ICONES.retour}${sorte ? esc(sorte.nom) : "Ton dico"}</a></header>`;
  if (!m) return { onglet: "dico", html: `<main class="colonne dico">${retour}<h1>Mot introuvable</h1><p class="sous">Il a peut-être été supprimé.</p></main>${barreOnglets("dico")}` };
  const vb = verbeDe(m);
  const vu = m.moi || motVu(ctx, m);
  const l = !m.moi && trouver(m.lecon);
  const enAvance = !m.moi && !ctx.pos.faites.has(m.lecon) && apprisEnAvance(m.id);
  const aDire = m.ex ? `${m.es}. ${m.ex}` : m.es;
  return {
    onglet: "dico",
    html: `<main class="colonne dico fiche-page">
        ${retour}
        <div class="fiche">
          <div class="ligne-son"><h1 lang="es">${esc(m.es)}</h1>
            <button class="ecoute grand" data-dire="${esc(aDire)}" aria-label="Écouter : ${esc(m.es)}" aria-pressed="false">${ICONES.lecture}</button></div>
          <p class="fr">${esc(m.fr)}</p>
          ${m.ex ? `<p class="ex" lang="es">${phraseTouchable(ctx, m.ex)}</p>` : ""}
        </div>
        ${enAvance ? `<span class="avance">${id(m.lecon)} · appris en avance</span>` : ""}
        ${vb ? blocVerbe(ctx, vb) : ""}
        ${m.moi ? `<div class="bloc"><h3>Mes mots</h3><p class="regle">${esc(`${origineMonMot(m).replace(/^./, c => c.toUpperCase())}${m.via === "ecoute" ? ", à l'écoute du jour" : ""}`.replace(/\.?$/, "."))}</p></div>`
          : !vu ? `<div class="bloc"><h3>Pas encore vu</h3><p class="regle">Arrive en ${id(m.lecon)}${l ? ` · ${esc(l.titre)}` : ""}.</p></div>`
          : enAvance ? "" : `<div class="bloc"><h3>Ce mot vient de</h3>${lienLecon(ctx, m.lecon, "")}</div>`}
        ${vb?.formes && !vb.gustar && !m.moi ? `${vu ? `<p class="etat">${etat(ctx, m)}</p>` : ""}${actionsVerbe(ctx, m, vb, vu, depuis)}`
          : vu ? `<p class="etat">${etat(ctx, m)}</p>` : `<div class="espace"></div>
          <button class="primaire soleil" data-apprendre="${esc(m.id)}">L'apprendre maintenant</button>
          <p class="petit">Il arrive dans tes mots à revoir dès demain. Quelques mots d'avance, c'est bien ; le reste viendra avec le prof.</p>`}
        ${m.moi ? `<div class="espace"></div><div class="duo">
            <a class="secondaire cadre" href="#/mes-mots/modifier/${encodeURIComponent(m.id)}">Modifier</a>
            <button class="secondaire supprimer" data-mm-suppr="${esc(m.id)}" data-retour>Supprimer</button></div>` : ""}
      </main>${barreOnglets("dico")}`,
  };
}

export function ecranDico(ctx, a, b, c) {
  if (a === "mot") return fiche(ctx, b, c);
  const sorte = SORTES.find(s => s.cle === a);
  return sorte ? pageSorte(ctx, sorte) : sommaire(ctx);
}
