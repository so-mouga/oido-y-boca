// Le soir : « Ce soir » pour moi (en français), puis « Para Blanca » (en espagnol, fond bleu nuit)
// et son guide. La fiche est celle de la dernière leçon faite (onglet « Soir » du tableau).

import { esc, id, ICONES, barreOnglets } from "../ui.js?v=16";
import { cases } from "../progression.js?v=16";
import { GUIDE_HTML } from "../guide.js?v=16";

function fiche(ctx) {
  const l = ctx.pos.derniere;
  if (!l) return null;
  return { lecon: l, soir: ctx.soir[l.id] || null, mots: ctx.motsParLecon[l.id] || [] };
}

const puces = mots => `<ul class="puces" lang="es">${mots.map(m => `<li>${esc(m.es)}</li>`).join("")}</ul>`;

export function ecranSoir(ctx) {
  const f = fiche(ctx);
  if (!f) {
    return { onglet: "soir", html: `<main class="colonne vide"><h1>Ce soir</h1>
        <p class="sous">La fiche du soir arrive après ta première leçon avec le prof.</p></main>${barreOnglets("soir")}` };
  }
  const { lecon: l, soir, mots } = f;
  const aUtiliser = (soir?.kevin || l.soir).split(/\s*;\s*/).filter(Boolean);
  const fait = !!cases(ctx.jour).soir;
  return {
    onglet: "soir",
    html: `<main class="colonne soir">
        <header class="haut"><h1>Ce soir</h1><span class="sous">fiche de ${id(l.id)}</span></header>
        <section class="carte-claire" aria-labelledby="t-use">
          <h2 id="t-use">À utiliser ce soir</h2>
          <ul class="a-utiliser">${aUtiliser.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
        </section>
        <section aria-labelledby="t-place">
          <h2 id="t-place">Les mots à placer</h2>
          ${puces(mots)}
        </section>
        <p class="conseil">Si tu bloques : « ¿Cómo se dice…? », sans repasser au français. À la fin, Blanca te dit 1 chose réussie et 1 erreur : raconte-les au prof à la prochaine séance.</p>
        ${soir ? `<a class="passer" href="#/blanca">${ICONES.lune}<span><b>Passer le téléphone à Blanca</b><span>L'écran passe en espagnol, pour elle</span></span></a>` : ""}
        <button class="fait${fait ? " on" : ""}" data-cocher="soir" aria-pressed="${fait}">${fait ? `${ICONES.coche}Fait ce soir` : "C'est fait pour ce soir"}</button>
      </main>${barreOnglets("soir")}`,
  };
}

// « (Di esta frase rápido:) … » : la consigne entre parenthèses est pour Blanca, en plus discret.
const question = q => esc(q).replace(/^\((.+?)\)\s*/, '<span class="consigne">$1</span>');

export function ecranBlanca(ctx) {
  const f = fiche(ctx);
  if (!f?.soir) return ecranSoir(ctx);
  const { soir, mots } = f;
  return {
    onglet: null,
    nuit: true,
    html: `<main class="colonne blanca" lang="es">
        <header class="nav-haut"><a class="retour" href="#/soir">${ICONES.retour}Kevin</a><span class="sous">Para Blanca · 10 minutos</span></header>
        <p class="mision">${esc(soir.mision)}</p>
        <ol class="preguntas">${soir.questions.map((q, i) => `<li><span class="n" aria-hidden="true">${i + 1}</span><p>${question(q)}</p></li>`).join("")}</ol>
        <section aria-labelledby="t-pal">
          <h2 id="t-pal">Las palabras que tiene que usar</h2>
          ${puces(mots)}
        </section>
        <footer class="pie"><a class="lien" href="#/guia">Guía para Blanca</a><span class="sous">Al final: 1 acierto, 1 error</span></footer>
      </main>`,
  };
}

export function ecranGuia() {
  return {
    onglet: null,
    nuit: true,
    html: `<main class="colonne blanca guia" lang="es">
        <header class="nav-haut"><a class="retour" href="#/blanca">${ICONES.retour}Volver</a></header>
        <h1>Guía para Blanca</h1>
        <div class="texte">${GUIDE_HTML}</div>
      </main>`,
  };
}
