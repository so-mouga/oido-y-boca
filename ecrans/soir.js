// Le soir : « Ce soir » pour moi (en français), puis « Para Blanca » (en espagnol, fond bleu nuit)
// et son guide. La fiche est celle de la dernière leçon faite (onglet « Soir » du tableau).
// Les soirs sans nouvelle fiche (celle de la dernière leçon déjà faite un soir d'avant), c'est un soir de révision :
// 4 questions de 4 anciennes leçons et un autre défi, fixes pour la journée. « /fiche » remet la fiche normale.

import { esc, id, ICONES, barreOnglets } from "../ui.js?v=77";
import { cases, cocher, dernierJourCoche } from "../progression.js?v=77";
import { GUIDE_HTML } from "../guide.js?v=77";
import { lireReto, tirerPregunta, tirerRepaso } from "../donnees.js?v=77";

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

// La nota de Blanca, en haut de « Ce soir » une fois écrite (en espagnol, comme elle l'a écrite).
function carteNota(ctx) {
  const n = notaDuJour(ctx.jour);
  if (!notaRemplie(n)) return "";
  const ligne = (titre, texte) => (texte || "").trim() ? `<p class="q">${titre}</p><p>${esc(texte)}</p>` : "";
  return `<section class="carte-claire nota-blanca" lang="es" aria-labelledby="t-nota">
          <h2 id="t-nota">La nota de Blanca</h2>
          ${ligne("Lo que ha dicho bien", n.bien)}${ligne("Un error", n.error)}${ligne("¿Ha mejorado? ¿Dónde se bloquea?", n.mejora)}
          ${n.notas?.length ? `<p class="q">Apuntado durante la noche</p><ul class="apuntado">${n.notas.map(x => `<li>${x.t === "err" ? "✗" : "✓"} ${esc(x.txt)}</li>`).join("")}</ul>` : ""}
          ${n.comida ? `<p class="q">Comida en español: ${esc(n.comida)}</p>` : ""}
        </section>`;
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
  const conseil = `<p class="conseil">Si tu bloques : « ¿Cómo se dice…? », sans repasser au français. Blanca peut noter tes phrases réussies et tes erreurs : tu retrouves sa note ici, et le prof la lit le lendemain.</p>`;
  const nota = carteNota(ctx);
  const passer = href => `<a class="passer" href="${href}">${ICONES.lune}<span><b>Passer le téléphone à Blanca</b><span>L'écran passe en espagnol, pour elle</span></span></a>`;
  const r = soirRepaso(ctx, mode);
  if (r) {
    return {
      onglet: "soir",
      html: `<main class="colonne soir">
        <header class="haut"><h1>Ce soir</h1><span class="sous">soir de révision</span></header>
        ${nota}
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
        ${nota}
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

// Chantier 20 : les relances, toujours les mêmes, sous chaque question (un rappel, pas des boutons).
export const RELANCES = ["¿Por qué?", "¿Y antes?", "¿Cuál prefieres?", "Cuéntame más"];
const relances = titre => `<div class="relances"><span class="sous">${titre}</span><ul class="puces">${RELANCES.map(r => `<li>${esc(r)}</li>`).join("")}</ul></div>`;

// « Tu clase de hoy » (Q20-8) : le premier écran des soirs de fiche (pas des soirs de révision). Toujours la même question,
// pour que je raconte ma leçon du matin ; les mots de la leçon en aide. Des mots transparents (clase, frase) : une formule apprise à force.
export const CLASE = "Cuéntame tu clase de hoy: ¿qué palabras nuevas tienes? ¿Qué frase sabes decir?";

// La nota de Blanca, dans les cases du jour : { lecon, notas: [{ t: "bien" | "err", txt, ou }], bien, error, mejora, comida, guardada }.
export const notaDuJour = jour => cases(jour).nota || null;
const changerNota = (ctx, champs) => cocher(ctx.jour, "nota", { notas: [], ...notaDuJour(ctx.jour), ...champs });
const notaRemplie = n => !!n && (n.notas?.length || ["bien", "error", "mejora", "comida"].some(k => (n[k] || "").trim()));

// La leçon du soir pour l'onglet « Soirs » : « U1-L4 », ou « repaso: U1-L1, U1-L2… ».
export function leconDuSoir(ctx, mode) {
  const r = soirRepaso(ctx, mode);
  if (r) return `repaso: ${r.questions.map(q => q.lecon).join(", ")}`;
  return ctx.pos.derniere?.id || "";
}

// Ce qu'il y a ce soir pour Blanca, fiche ou révision : les questions, la question ouverte, le défi, et la suite des écrans.
function soiree(ctx, mode) {
  const base = mode === "fiche" ? "#/blanca/fiche" : "#/blanca";
  const retour = mode === "fiche" ? "#/soir/fiche" : "#/soir";
  const guia = mode === "fiche" ? "#/guia/fiche" : "#/guia";
  const r = soirRepaso(ctx, mode);
  let s;
  if (r) {
    s = { repaso: true, mision: "Esta noche no hay lección nueva: repasáis lo que Kevin ya ha aprendido.", mots: [], otra: true,
      questions: r.questions.map(q => ({ texte: q.question, de: q.lecon })),
      abierta: r.abierta && { texte: r.abierta.texte, ayuda: r.abierta.ayuda, de: r.abierta.lecon },
      reto: r.reto && { ...r.reto.reto, de: r.reto.lecon } };
  } else {
    const f = fiche(ctx);
    if (!f?.soir) return null;
    s = { repaso: false, mision: f.soir.mision, mots: f.mots, otra: !!tirerPregunta(ctx.soir, ctx.pos.faites, f.lecon.id), clase: true,
      questions: f.soir.questions.map(texte => ({ texte })),
      abierta: f.soir.abierta ? { texte: f.soir.abierta, ayuda: f.soir.ayuda || [] } : null,
      reto: lireReto(f.soir.reto) };
  }
  const etapes = ["inicio", s.clase && "clase", ...s.questions.map((_, i) => String(i + 1)), s.abierta && "abierta", (s.reto || s.otra) && "reto", "nota", "gracias"].filter(Boolean);
  return { ...s, etapes, base, retour, guia, mode, href: e => `${base}/${e}` };
}

const enTete = (s, droite) => `<header class="nav-haut"><a class="retour" href="${s.retour}">${ICONES.retour}Kevin</a><span class="sous">${droite}</span></header>`;
const pas = (s, etape, suivant = "Siguiente") => {
  const k = s.etapes.indexOf(etape);
  return `<nav class="pasos"><a class="prec" href="${s.href(s.etapes[k - 1])}" aria-label="Anterior">${ICONES.retour}</a><a class="suiv" href="${s.href(s.etapes[k + 1])}">${suivant} ›</a></nav>`;
};
// La barre d'avancement : une case par question (ouverte comprise) et une pour le défi.
const avance = (s, etape) => {
  const qs = s.etapes.filter(e => /^\d+$|^clase$|^abierta$|^reto$/.test(e));
  const k = qs.indexOf(etape);
  return `<div class="barre-soir" aria-hidden="true">${qs.map((_, j) => `<i${j <= k ? ' class="ok"' : ""}></i>`).join("")}</div>`;
};
const notasDe = (ctx, ou) => (notaDuJour(ctx.jour)?.notas || []).map((n, i) => ({ ...n, i })).filter(n => ou === null || n.ou === ou);
const listeNotas = notas => notas.length ? `<ul class="notas">${notas.map(n => `<li class="${n.t === "err" ? "err" : "bien"}">
    <span><small>${n.t === "err" ? "Un error" : "Bien dicho"}</small>${esc(n.txt)}</span>
    <button class="suppr" data-nota-suppr="${n.i}" aria-label="Borrar">×</button></li>`).join("")}</ul>` : "";
const boutonsApuntar = ou => `<div class="apuntar" data-ou="${ou}"><button data-apuntar="bien">＋ Bien dicho</button><button data-apuntar="err">＋ Un error</button></div>`;

export function ecranBlanca(ctx, a, b) {
  const mode = a === "fiche" ? "fiche" : null;
  const s = soiree(ctx, mode);
  if (!s) return ecranSoir(ctx, mode);
  let etape = (mode ? b : a) || "inicio";
  if (!s.etapes.includes(etape)) etape = "inicio";
  const k = s.etapes.indexOf(etape);
  const nbQ = s.questions.length + (s.abierta ? 1 : 0);
  const page = html => ({ onglet: null, nuit: true, html: `<main class="colonne blanca" lang="es">${html}</main>` });

  if (etape === "inicio") {
    return page(`${enTete(s, `Para Blanca${s.repaso ? " · repaso" : ""} · 10-15 minutos`)}
        <p class="mision">${esc(s.mision)}</p>
        <p class="sous parar">Podéis parar cuando queráis.</p>
        ${relances("Una pregunta por pantalla. Si contesta corto, sigue con:")}
        <p class="sous">Si dice una frase bien o se equivoca, apúntalo. Al final, le das tu nota. Nada es obligatorio.</p>
        ${s.mots.length ? `<section aria-labelledby="t-pal"><h2 id="t-pal">Las palabras que tiene que usar</h2>${puces(s.mots)}</section>` : ""}
        <a class="primaire soleil empezar" href="${s.href(s.etapes[1])}">Empezar</a>
        <footer class="pie"><a class="lien" href="${s.guia}">Guía para Blanca</a><span class="sous">Al final: tu nota</span></footer>`);
  }

  if (etape === "clase") {
    return page(`${enTete(s, "Tu clase de hoy")}
        ${avance(s, etape)}
        <div class="une-question">
          <span class="etiq-abierta">Para empezar · su clase de esta mañana</span>
          <p class="grande">${esc(CLASE)}</p>
        </div>
        ${relances("Si contesta corto:")}
        ${s.mots.length ? `<details class="ayuda"><summary>Si se bloquea: las palabras de la lección</summary>
          <span class="sous">Puedes soplarle:</span>${puces(s.mots)}</details>` : ""}
        ${listeNotas(notasDe(ctx, etape))}
        ${boutonsApuntar(etape)}
        ${pas(s, etape)}`);
  }

  if (/^\d+$/.test(etape) || etape === "abierta") {
    const ouverte = etape === "abierta";
    const q = ouverte ? s.abierta : s.questions[Number(etape) - 1];
    return page(`${enTete(s, `Pregunta ${ouverte ? nbQ : etape} de ${nbQ}`)}
        ${avance(s, etape)}
        <div class="une-question">
          ${ouverte ? `<span class="etiq-abierta">Pregunta abierta · para hablar más</span>` : ""}
          ${q.de ? `<span class="de">lección ${id(q.de)}</span>` : ""}
          <p class="grande">${question(q.texte)}</p>
        </div>
        ${relances("Si contesta corto:")}
        ${ouverte && q.ayuda.length ? `<details class="ayuda"><summary>Si se bloquea: palabras para ayudarle</summary>
          <span class="sous">Puedes soplarle:</span><ul class="puces">${q.ayuda.map(w => `<li>${esc(w)}</li>`).join("")}</ul></details>` : ""}
        <p class="ytu"><b>¿Y tú?</b><span>Después, Kevin te hace la pregunta a ti.</span></p>
        ${listeNotas(notasDe(ctx, etape))}
        ${boutonsApuntar(etape)}
        ${pas(s, etape)}`);
  }

  if (etape === "reto") {
    return page(`${enTete(s, "El reto")}
        ${avance(s, etape)}
        ${s.reto ? `<section class="reto" aria-labelledby="t-reto">
          <span class="etiq">${ETOILE}El reto${s.reto.de ? `<span class="de">lección ${id(s.reto.de)}</span>` : ""}</span>
          <h2 id="t-reto">${esc(s.reto.nom)}</h2>
          <p>${question(s.reto.consigne)}</p>
        </section>` : ""}
        ${s.otra ? blocOtra : ""}
        ${listeNotas(notasDe(ctx, etape))}
        ${boutonsApuntar(etape)}
        ${pas(s, etape, "Terminar")}`);
  }

  if (etape === "nota") {
    const n = notaDuJour(ctx.jour) || {};
    const toutes = notasDe(ctx, null);
    const champ = (nom, label, aide = "") => `<label class="champ-nota"><span>${label}${aide ? ` <small>${aide}</small>` : ""}</span>
          <textarea name="${nom}" rows="2">${esc(n[nom] || "")}</textarea></label>`;
    return page(`${enTete(s, "La nota de Blanca")}
        <p class="mision">Tu nota para Kevin. Nada es obligatorio.</p>
        ${toutes.length ? `<section><h2>Lo que has apuntado</h2>${listeNotas(toutes)}</section>` : `<p class="sous">No has apuntado nada esta noche.</p>`}
        <form class="nota" data-nota-form>
          ${champ("bien", "Lo que ha dicho bien")}
          ${champ("error", "Un error", "(la frase y la buena forma)")}
          ${champ("mejora", "¿Ha mejorado en algo? ¿Dónde se bloquea?")}
          <fieldset class="comida"><legend>En la comida, ¿habéis hablado español?</legend>
            ${["Sí", "Un poco", "No"].map(c => `<label><input type="radio" name="comida" value="${c}"${n.comida === c ? " checked" : ""}><span>${c}</span></label>`).join("")}
          </fieldset>
          <nav class="pasos"><a class="prec" href="${s.href(s.etapes[k - 1])}" aria-label="Anterior">${ICONES.retour}</a><button class="suiv">Guardar ›</button></nav>
        </form>`);
  }

  return page(`${enTete(s, "")}
        <p class="merci">¡Gracias, Blanca! 💛</p>
        <p>Tu nota está guardada. Kevin la ve en su pantalla y su profe la lee mañana por la mañana.</p>
        <a class="primaire soleil empezar" href="${s.retour}" data-remplace>Devolver el teléfono a Kevin</a>`);
}

// Les boutons du parcours de Blanca : « Apuntar » ouvre une case sans redessiner l'écran ; « × » efface une note.
// Renvoie null si le clic n'est pas pour nous, true si l'écran doit être redessiné, false sinon.
export function actionBlanca(ctx, e) {
  const ap = e.target.closest("[data-apuntar]");
  if (ap) {
    const bloc = ap.closest(".apuntar");
    const err = ap.dataset.apuntar === "err";
    bloc.outerHTML = `<form class="zone-apuntar" data-apuntar-form data-t="${err ? "err" : "bien"}" data-ou="${bloc.dataset.ou}">
        <label for="apunte">${err ? "Un error (lo que ha dicho → la buena forma)" : "Una frase bien dicha"}</label>
        <textarea id="apunte" name="txt" rows="2" lang="es"></textarea>
        <span class="sous">Con el teclado, o con el micro del teclado para dictar.</span>
        <div class="boutons"><button type="button" data-apuntar-annuler>Cancelar</button><button class="ok">Apuntar</button></div>
      </form>`;
    document.getElementById("apunte")?.focus();
    return false;
  }
  if (e.target.closest("[data-apuntar-annuler]")) return true;
  const suppr = e.target.closest("[data-nota-suppr]");
  if (suppr) {
    const notas = [...(notaDuJour(ctx.jour)?.notas || [])];
    notas.splice(Number(suppr.dataset.notaSuppr), 1);
    changerNota(ctx, { notas });
    return true;
  }
  return null;
}

// « Apuntar » : la note entre dans la nota du jour.
export function envoiApunte(ctx, form) {
  const txt = form.txt.value.trim();
  if (!txt) return true;
  const n = notaDuJour(ctx.jour);
  changerNota(ctx, { lecon: n?.lecon || leconDuSoir(ctx), notas: [...(n?.notas || []), { t: form.dataset.t, txt, ou: form.dataset.ou }] });
  return true;
}

// La nota se garde à chaque lettre (sans redessiner), pour ne rien perdre si on revient en arrière.
export function brouillonNota(ctx, form) {
  const f = new FormData(form);
  changerNota(ctx, { bien: f.get("bien") || "", error: f.get("error") || "", mejora: f.get("mejora") || "", comida: f.get("comida") || "" });
}

// « Guardar » : la nota est gardée, « Ce soir » est coché, et l'écran passe à « Gracias ». Renvoie l'adresse suivante.
export function guardarNota(ctx, form, mode) {
  brouillonNota(ctx, form);
  changerNota(ctx, { lecon: leconDuSoir(ctx, mode), guardada: true });
  cocher(ctx.jour, "soir", true);
  return `${mode === "fiche" ? "#/blanca/fiche" : "#/blanca"}/gracias`;
}

const blocOtra = `<section class="otra" aria-live="polite">
          <div class="tiree" data-otra-tiree hidden></div>
          <button class="bouton-otra" data-otra>${HASARD}<span>Otra pregunta</span></button>
          <span class="sous aide">Si queréis seguir: una pregunta al azar de una lección que ya ha hecho</span>
        </section>`;

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
  <p>Si queréis seguir, «Otra pregunta» saca una pregunta de una lección que ya he hecho. Y podéis parar cuando queráis.</p>
  <p>La última pregunta es abierta, para hablar más. Si me bloqueo, «Si se bloquea» te da palabras para ayudarme.</p>`;

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
