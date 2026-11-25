// Le soir : « Ce soir » pour moi (en français), puis « Para Blanca » (en espagnol, fond bleu nuit)
// et son guide. La fiche est celle de la dernière leçon faite (onglet « Soir » du tableau).
// Les soirs sans nouvelle fiche (celle de la dernière leçon déjà faite un soir d'avant), c'est un soir de révision :
// 4 questions de 4 anciennes leçons et un autre défi, fixes pour la journée. « /fiche » remet la fiche normale.

import { esc, id, ICONES, barreOnglets } from "../ui.js?v=65";
import { cases, dernierJourCoche } from "../progression.js?v=65";
import { GUIDE_HTML } from "../guide.js?v=65";
import { lireReto, tirerPregunta, tirerRepaso } from "../donnees.js?v=65";

function fiche(ctx) {
  const l = ctx.pos.derniere;
  if (!l) return null;
  return { lecon: l, soir: ctx.soir[l.id] || null, mots: ctx.motsParLecon[l.id] || [] };
}

// Le soir de révision, ou null : la fiche de la dernière leçon n'a pas encore été faite (ou « /fiche » demandée).
export function soirRepaso(ctx, mode) {
  const l = ctx.pos.derniere;
  if (!l || mode === "fiche") return null;
  const faiteLe = ctx.pos.dateFaite[l.id];
  const ficheFaite = dernierJourCoche(ctx.jour, "soir");
  if (!faiteLe || !ficheFaite || ficheFaite < faiteLe) return null;
  return tirerRepaso(ctx.soir, ctx.pos.faites, l.id, ctx.jour);
}

const puces = mots => `<ul class="puces" lang="es">${mots.map(m => `<li>${esc(m.es)}</li>`).join("")}</ul>`;

export function ecranSoir(ctx, mode) {
  const f = fiche(ctx);
  if (!f) {
    return { onglet: "soir", html: `<main class="colonne vide"><h1>Ce soir</h1>
        <p class="sous">La fiche du soir arrive après ta première leçon avec le prof.</p></main>${barreOnglets("soir")}` };
  }
  const { lecon: l, soir, mots } = f;
  const fait = !!cases(ctx.jour).soir;
  const bouton = `<button class="fait${fait ? " on" : ""}" data-cocher="soir" aria-pressed="${fait}">${fait ? `${ICONES.coche}Fait ce soir` : "C'est fait pour ce soir"}</button>`;
  const conseil = `<p class="conseil">Si tu bloques : « ¿Cómo se dice…? », sans repasser au français. À la fin, Blanca te dit 1 chose réussie et 1 erreur : raconte-les au prof à la prochaine séance.</p>`;
  const passer = href => `<a class="passer" href="${href}">${ICONES.lune}<span><b>Passer le téléphone à Blanca</b><span>L'écran passe en espagnol, pour elle</span></span></a>`;
  const r = soirRepaso(ctx, mode);
  if (r) {
    return {
      onglet: "soir",
      html: `<main class="colonne soir">
        <header class="haut"><h1>Ce soir</h1><span class="sous">soir de révision</span></header>
        <section class="carte-claire" aria-labelledby="t-use">
          <h2 id="t-use">À utiliser ce soir</h2>
          <ul class="a-utiliser">${r.kevin.map(k => `<li><span>${esc(k.texte)} <span class="de">· ${id(k.lecon)}</span></span></li>`).join("")}</ul>
        </section>
        ${conseil}
        ${passer("#/blanca")}
        ${bouton}
        <a class="lien autre-fiche" href="#/soir/fiche">Refaire plutôt la fiche de ${id(l.id)}</a>
      </main>${barreOnglets("soir")}`,
    };
  }
  const aUtiliser = (soir?.kevin || l.soir).split(/\s*;\s*/).filter(Boolean);
  const repasoPossible = mode === "fiche" && soirRepaso(ctx);
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
        ${conseil}
        ${soir ? passer(mode === "fiche" ? "#/blanca/fiche" : "#/blanca") : ""}
        ${bouton}
        ${repasoPossible ? `<a class="lien autre-fiche" href="#/soir" data-remplace>Revenir au soir de révision</a>` : ""}
      </main>${barreOnglets("soir")}`,
  };
}

// « (Di esta frase rápido:) … » : la consigne entre parenthèses est pour Blanca, en plus discret.
const question = q => esc(q).replace(/^\((.+?)\)\s*/, '<span class="consigne">$1</span>');

const ETOILE = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/></svg>';
const HASARD = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>';

export function ecranBlanca(ctx, mode) {
  const f = fiche(ctx);
  const r = soirRepaso(ctx, mode);
  if (r) return ecranRepaso(ctx, r);
  if (!f?.soir) return ecranSoir(ctx, mode);
  const { lecon: l, soir, mots } = f;
  const reto = lireReto(soir.reto);
  const otra = !!tirerPregunta(ctx.soir, ctx.pos.faites, l.id);
  return {
    onglet: null,
    nuit: true,
    html: `<main class="colonne blanca" lang="es">
        <header class="nav-haut"><a class="retour" href="${mode === "fiche" ? "#/soir/fiche" : "#/soir"}">${ICONES.retour}Kevin</a><span class="sous">Para Blanca · 10-15 minutos</span></header>
        <p class="mision">${esc(soir.mision)}</p>
        <p class="sous parar">Podéis parar cuando queráis.</p>
        <ol class="preguntas">${soir.questions.map((q, i) => `<li><span class="n" aria-hidden="true">${i + 1}</span><p>${question(q)}</p></li>`).join("")}</ol>
        ${reto ? `<section class="reto" aria-labelledby="t-reto">
          <span class="etiq">${ETOILE}El reto</span>
          <h2 id="t-reto">${esc(reto.nom)}</h2>
          <p>${question(reto.consigne)}</p>
        </section>` : ""}
        ${otra ? blocOtra : ""}
        <section aria-labelledby="t-pal">
          <h2 id="t-pal">Las palabras que tiene que usar</h2>
          ${puces(mots)}
        </section>
        <footer class="pie"><a class="lien" href="${mode === "fiche" ? "#/guia/fiche" : "#/guia"}">Guía para Blanca</a><span class="sous">Al final: 1 acierto, 1 error</span></footer>
      </main>`,
  };
}

const blocOtra = `<section class="otra" aria-live="polite">
          <div class="tiree" data-otra-tiree hidden></div>
          <button class="bouton-otra" data-otra>${HASARD}<span>Otra pregunta</span></button>
          <span class="sous aide">Una pregunta al azar de una lección que ya ha hecho</span>
        </section>`;

// Le soir de révision, pour Blanca : chaque question et le défi disent de quelle leçon ils viennent. Pas de liste de mots.
function ecranRepaso(ctx, r) {
  return {
    onglet: null,
    nuit: true,
    html: `<main class="colonne blanca" lang="es">
        <header class="nav-haut"><a class="retour" href="#/soir">${ICONES.retour}Kevin</a><span class="sous">Para Blanca · repaso · 10-15 minutos</span></header>
        <p class="mision">Esta noche no hay lección nueva: repasáis lo que Kevin ya ha aprendido.</p>
        <p class="sous parar">Podéis parar cuando queráis.</p>
        <ol class="preguntas">${r.questions.map((q, i) => `<li><span class="n" aria-hidden="true">${i + 1}</span><p><span class="de">lección ${id(q.lecon)}</span>${question(q.question)}</p></li>`).join("")}</ol>
        ${r.reto ? `<section class="reto" aria-labelledby="t-reto">
          <span class="etiq">${ETOILE}El reto<span class="de">lección ${id(r.reto.lecon)}</span></span>
          <h2 id="t-reto">${esc(r.reto.reto.nom)}</h2>
          <p>${question(r.reto.reto.consigne)}</p>
        </section>` : ""}
        ${blocOtra}
        <footer class="pie"><a class="lien" href="#/guia">Guía para Blanca</a><span class="sous">Al final: 1 acierto, 1 error</span></footer>
      </main>`,
  };
}

// « Otra pregunta » : tire une question d'une leçon déjà faite et l'affiche sans redessiner l'écran.
export function actionOtra(ctx, e) {
  const bouton = e.target.closest("[data-otra]");
  if (!bouton) return false;
  const bloc = bouton.closest(".otra");
  const zone = bloc.querySelector("[data-otra-tiree]");
  const t = tirerPregunta(ctx.soir, ctx.pos.faites, ctx.pos.derniere?.id, zone.dataset.avant || null);
  if (!t) return true;
  zone.dataset.avant = t.question;
  zone.innerHTML = `<span class="de">Otra pregunta · lección ${id(t.lecon)}</span><p>${question(t.question)}</p>`;
  zone.hidden = false;
  bouton.querySelector("span").textContent = "Otra más";
  bloc.querySelector(".aide")?.remove();
  return true;
}

const GUIA_RETO = `<h2>El reto</h2>
  <p>Al final hay un pequeño juego: verdad o mentira, ni sí ni no, completar una frase… Es para reír un poco, no es un examen.</p>
  <p>Si queréis seguir, «Otra pregunta» saca una pregunta de una lección que ya he hecho. Y podéis parar cuando queráis.</p>`;

export function ecranGuia(ctx, mode) {
  return {
    onglet: null,
    nuit: true,
    html: `<main class="colonne blanca guia" lang="es">
        <header class="nav-haut"><a class="retour" href="${mode === "fiche" ? "#/blanca/fiche" : "#/blanca"}">${ICONES.retour}Volver</a></header>
        <h1>Guía para Blanca</h1>
        <div class="texte">${GUIA_RETO}${GUIDE_HTML}</div>
      </main>`,
  };
}
