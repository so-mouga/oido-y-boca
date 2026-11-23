// L'onglet « Dico » (#/dico) : le sommaire avec la recherche, une page par sorte (#/dico/verbes…),
// et la fiche d'un mot (#/dico/mot/ID/verbes : la fin dit d'où l'on vient, pour le lien du haut).
// Seulement les mots des leçons faites. Pas de révision ici : on revoit les mots mélangés, dans « Tes mots à revoir ».

import { esc, md, id, titre, ICONES, barreOnglets } from "../ui.js?v=31";
import { lecon as trouver } from "../position.js?v=31";
import { PERSONNES, formesSurlignees, conjuguer } from "../controles.js?v=31";
import { etatRevision } from "../progression.js?v=31";
import { SORTES, sorteDe, motsDuDico, chercher, verbeDe, etiquette, REGLES } from "../dico.js?v=31";

// La recherche tapée reste là quand on revient d'une fiche.
let recherche = "";

const loupe = `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg>`;
const lienMot = (m, depuis) => `#/dico/mot/${encodeURIComponent(m.id)}/${depuis}`;
const ligneMot = (m, depuis, tag = "") => `<li><a href="${lienMot(m, depuis)}">
    <span class="es" lang="es">${esc(m.es)}</span><span class="fr">${esc(m.fr)}</span>${tag ? `<span class="tag">${esc(tag)}</span>` : ""}
  </a></li>`;
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
    if (!trouves.length) return `<p class="sous">Aucun mot trouvé dans tes leçons faites.</p>`;
    return `<ul class="liste res">${trouves.map(m => ligneMot(m, "dico", sorteDe(m).tag)).join("")}</ul>`;
  }
  if (!mots.length) return `<p class="sous">Ton dico se remplit à chaque leçon faite avec le prof.</p>`;
  const groupes = parSorte(mots);
  return `<ul class="cats">${SORTES.filter(s => groupes[s.cle].length).map(s => {
    const g = groupes[s.cle];
    return `<li><a href="#/dico/${s.cle}">
        <span class="t">${esc(s.nom)}<small lang="es">${esc(g.slice(0, 3).map(m => m.es).join(", "))}${g.length > 3 ? "…" : ""}</small></span>
        <span class="n">${g.length}</span>${ICONES.chevron}
      </a></li>`;
  }).join("")}</ul>`;
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

function section(ctx, titreSection, mots, depuis, regle = "", tag = () => "") {
  return `<section class="sec">
      <h2><span>${titreSection} · ${mots.length}</span>${regle}</h2>
      <ul class="liste">${mots.map(m => ligneMot(m, depuis, tag(m))).join("")}</ul>
    </section>`;
}

function pageSorte(ctx, sorte) {
  const mots = parSorte(motsDuDico(ctx))[sorte.cle];
  let corps;
  if (sorte.cle === "verbes") {
    // Rangés par famille de conjugaison, chacune avec la leçon de sa règle.
    corps = FAMILLES.map(f => {
      const dedans = mots.filter(m => (verbeDe(m)?.famille || "autres") === f.cle);
      if (!dedans.length) return "";
      const regle = REGLES[f.cle] ? regleCourte(ctx, REGLES[f.cle].lecon) : "";
      return section(ctx, f.nom, dedans, sorte.cle, regle, m => { const vb = verbeDe(m); return vb ? etiquette(vb) : ""; });
    }).join("");
  } else {
    // Le reste, par unité, dans l'ordre du livre.
    const unites = [];
    for (const m of mots) {
      const u = trouver(m.lecon)?.unite;
      if (!u) continue;
      let g = unites.find(x => x.u === u);
      if (!g) unites.push(g = { u, mots: [] });
      g.mots.push(m);
    }
    corps = unites.map(g => section(ctx, g.u.n ? `Unité ${g.u.n} · ${titre(g.u.titre)}` : titre(g.u.titre), g.mots, sorte.cle)).join("");
  }
  return {
    onglet: "dico",
    html: `<main class="colonne dico">
        <header class="nav-haut"><a class="retour" href="#/dico">${ICONES.retour}Ton dico</a></header>
        <h1>${esc(sorte.nom)}</h1>
        ${corps || `<p class="sous">Pas encore de mots ici.</p>`}
      </main>${barreOnglets("dico")}`,
  };
}

function regleCourte(ctx, idLecon) {
  const texte = `La règle : ${id(idLecon)}`;
  return ctx.pos.faites.has(idLecon) ? `<a href="#/lecon/${idLecon}/dico">${texte}</a>` : `<span class="avenir">${texte}</span>`;
}

// ── La fiche d'un mot ──
const A_QUI = [["à moi", "me"], ["à toi", "te"], ["à lui, à elle", "le"], ["à nous", "nos"], ["à vous", "os"], ["à eux, à elles", "les"]];
const surligne = f => esc(f).replace(/\*\*(.+?)\*\*/g, `<span class="term">$1</span>`);

function blocVerbe(ctx, vb) {
  if (!vb.formes) {
    return `<div class="bloc"><h3>${vb.famille === "irr" ? "Verbe irrégulier" : "Verbe"}</h3>
        <p class="regle">L'appli ne connaît pas encore ses formes : tu les verras avec le prof.</p></div>`;
  }
  const quoi = vb.famille === "irr" ? "Verbe irrégulier" : `Verbe en -${vb.g} · ${etiquette(vb) || "régulier"}`;
  // Comme gustar : la même forme du verbe, avec le petit mot qui dit à qui (me gusta, te gusta…).
  const formes = vb.gustar ? A_QUI.map(([, pr]) => `**${pr}** ${conjuguer(vb.v, 2, vb.d)}`) : formesSurlignees(vb.v, vb.d);
  const personnes = vb.gustar ? A_QUI.map(([a]) => a) : PERSONNES;
  return `<div class="bloc"><h3>${esc(quoi)}</h3>
      <dl class="formes">${personnes.map((p, i) => `<dt>${p}</dt><dd lang="es">${surligne(formes[i])}</dd>`).join("")}</dl>
      ${vb.regles.map(r => `<p class="regle">${md(r.texte)}</p>${lienLecon(ctx, r.lecon, "La règle : ")}`).join("")}
    </div>`;
}

function etat(ctx, m) {
  const e = etatRevision(m.id, ctx.jour);
  if (!e) return "Pas encore revu dans tes mots à revoir.";
  return e.dans === 0 ? "À revoir aujourd'hui" : e.dans === 1 ? "À revoir demain" : `À revoir dans ${e.dans} jours`;
}

function fiche(ctx, idMot, depuis) {
  const m = motsDuDico(ctx).find(x => x.id === decodeURIComponent(idMot || ""));
  const sorte = SORTES.find(s => s.cle === depuis);
  const retour = `<header class="nav-haut"><a class="retour" href="${sorte ? `#/dico/${sorte.cle}` : "#/dico"}" data-arriere>${ICONES.retour}${sorte ? esc(sorte.nom) : "Ton dico"}</a></header>`;
  if (!m) return { onglet: "dico", html: `<main class="colonne dico">${retour}<h1>Mot introuvable</h1></main>${barreOnglets("dico")}` };
  const vb = verbeDe(m);
  const aDire = m.ex ? `${m.es}. ${m.ex}` : m.es;
  return {
    onglet: "dico",
    html: `<main class="colonne dico fiche-page">
        ${retour}
        <div class="fiche">
          <div class="ligne-son"><h1 lang="es">${esc(m.es)}</h1>
            <button class="ecoute grand" data-dire="${esc(aDire)}" aria-label="Écouter : ${esc(m.es)}" aria-pressed="false">${ICONES.lecture}</button></div>
          <p class="fr">${esc(m.fr)}</p>
          ${m.ex ? `<p class="ex" lang="es">${esc(m.ex)}</p>` : ""}
        </div>
        ${vb ? blocVerbe(ctx, vb) : ""}
        <div class="bloc"><h3>Ce mot vient de</h3>${lienLecon(ctx, m.lecon, "")}</div>
        <p class="etat">${etat(ctx, m)}</p>
      </main>${barreOnglets("dico")}`,
  };
}

export function ecranDico(ctx, a, b, c) {
  if (a === "mot") return fiche(ctx, b, c);
  const sorte = SORTES.find(s => s.cle === a);
  return sorte ? pageSorte(ctx, sorte) : sommaire(ctx);
}
