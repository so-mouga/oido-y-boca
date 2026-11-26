// « Mes mots en cours » (chantier 19) : la séance de 10 questions (#/mots/cours, #/mots/un/CLE/ID-DU-MOT/DEPUIS),
// et les boutons « M'entraîner sur ce mot » / « Je le sais » du Dico. Le moteur est dans motsencours.js.
// Le but : retrouver le mot soi-même (du français à l'espagnol, à l'oreille, dans ses phrases), plus un peu de conjugaison
// pour un verbe. Sans chrono. La séance ne touche pas « Tes mots à revoir » (Q77).

import { esc, md, ICONES } from "../ui.js?v=70";
import { PERSONNES, formesSurlignees, TEMPS } from "../controles.js?v=70";
import { tempsVu } from "../verbes.js?v=70";
import { motsEnCours, motsDeLaSeance, resoudre, tirerSeance, corrigerMot, bilanParMot, sensJuste, mettreMotEnCours } from "../motsencours.js?v=70";
import { retirerDesCours, verbesEnCours, seriesJustes, noterSerieVerbes } from "../progression.js?v=70";
import { motsAMoi } from "../dico.js?v=70";
import { lancerLecture, arreterLecture } from "../lecture.js?v=70";
import { vibrer, son } from "../retours.js?v=70";

let s = null; // la séance en cours

function nouvelleSeance(ctx, cle, mode, un, retour) {
  const items = mode === "un" ? [resoudre(ctx, un)].filter(Boolean) : motsDeLaSeance(motsEnCours(ctx));
  s = {
    cle, mode, un, retour, items,
    titre: mode === "un" ? items[0]?.es || un : "Mes mots en cours",
    questions: tirerSeance(ctx, items),
    i: 0, phase: "question", saisie: "", resultat: null, choisi: null, montres: new Set(), resultats: [], fini: false,
  };
}

// ——— l'affichage ———
const barre = () => `<header class="barre-ex">
    <a class="quitter" href="${s.retour}">${ICONES.fermer}Quitter</a>
    <span class="piste" role="progressbar" aria-valuemin="0" aria-valuemax="${s.questions.length}" aria-valuenow="${s.i}"><i style="width:${((s.depuis ?? s.i) / s.questions.length) * 100}%"></i></span>
    <span class="compte">${s.i + 1} / ${s.questions.length}</span>
  </header>`;
const sorte = t => `<p class="sorte"><i aria-hidden="true"></i>${t}</p>`;
const ecouter = (texte, cls = "") => `<button class="ecoute ${cls}" data-dire="${esc(texte)}" aria-label="Écouter : ${esc(texte)}" aria-pressed="false">${ICONES.lecture}</button>`;
const surligne = f => esc(f).replace(/\*\*(.+?)\*\*/g, `<span class="term">$1</span>`);
const montrerTemps = q => q.temps && q.temps !== "present";
const nomTemps = t => TEMPS[t].nom;
const majuscule = (q, f) => q.avant.trim() ? f : f[0].toUpperCase() + f.slice(1);
const trouee = (q, forme) => `${esc(q.avant)}${forme ? `<mark class="bon">${esc(majuscule(q, forme))}</mark>` : `<span class="trou" aria-label="trou"></span>`}${esc(q.apres)}`;
const sixFormes = (q, ouvert) => {
  const f = formesSurlignees(q.v, q.d, q.temps);
  return `<details class="six-formes"${ouvert ? " open" : ""}><summary>Les 6 formes de ${esc(q.v)}${montrerTemps(q) ? ` · ${esc(nomTemps(q.temps))}` : ""}</summary><dl>${PERSONNES.map((per, i) =>
    `<dt>${per}</dt><dd lang="es"${i === q.p ? ' class="ici"' : ""}>${surligne(f[i])}</dd>`).join("")}</dl></details>`;
};

// La tête de chaque sorte de question (avant et après la réponse).
function tete(ctx, q) {
  const fini = s.phase !== "question";
  switch (q.type) {
    case "fres":
      return `${sorte("Mes mots · retrouve le mot")}<p class="consigne">Écris-le en espagnol.</p><p class="enonce mc-fr">${esc(q.fr)}</p>`;
    case "ecoute":
      return `${sorte("Mes mots · écoute et écris")}<p class="consigne">Écoute, puis écris ce que tu entends.</p>
        <div class="mc-ecoute">${ecouter(q.dire, "grand")}</div>`;
    case "trou":
      return `${sorte("Mes mots · le mot qui manque")}<p class="consigne">Écris le mot qui manque.</p>
        <p class="enonce" lang="es">${trouee(q, fini ? q.es[0] : null)}</p><p class="sens">(${esc(q.aide)})</p>`;
    case "phrase":
      return `${sorte("Mes mots · traduis la phrase")}<p class="consigne">Écris toute la phrase en espagnol.</p>
        <p class="enonce">${esc(q.fr)}</p>${q.aide ? `<p class="sens">${esc(q.aide)}</p>` : ""}`;
    case "conj-forme":
      return `${sorte("Verbes · trouve la forme")}<p class="q-verbe" lang="es">${esc(q.v)}</p><p class="q-personne" lang="es">${esc(PERSONNES[q.p])}</p>
        ${montrerTemps(q) ? `<p class="q-temps">${esc(nomTemps(q.temps))}</p>` : ""}${q.sens ? `<p class="q-sens" lang="es">${esc(q.sens)}</p>` : ""}`;
    case "conj-phrase":
      return `${sorte("Verbes · dans une phrase")}<p class="enonce q-phrase" lang="es">${trouee(q, fini ? q.es[0] : null)}</p>
        <p class="q-sens"><span lang="es">(${esc(q.v)}</span>${montrerTemps(q) ? `, ${esc(nomTemps(q.temps))}` : ""})</p>`;
  }
  return "";
}

// Ce que l'appli dit en plus de « Juste » / « Pas encore » (Q19-4).
function rappels(r) {
  const l = [];
  if (r.article) l.push(`Avec son article : <b lang="es">${esc(r.article)}</b>. Le dire avec l'article, c'est retenir son genre.`);
  if (r.genre) l.push(`Le bon mot, mais pas le bon article : <b lang="es">${esc(r.genre.mot)}</b> est ${r.genre.masculin ? "masculin" : "féminin"}.`);
  if (r.confondu) l.push(`Tu as mis <b lang="es">${esc(r.confondu.es)}</b> (${esc(r.confondu.fr)}).`);
  if (r.niveau === "accents") l.push("Regarde les accents : à l'oral, ils disent où appuyer.");
  if (r.astuce) l.push(esc(r.astuce));
  return l.map(x => `<p>${x}</p>`).join("");
}

function vueEcrire(ctx, q) {
  const conj = q.type.startsWith("conj");
  if (s.phase === "question") {
    return `<div class="defile">${barre()}${tete(ctx, q)}</div>
      <form class="saisie" data-mc-form>
        <input id="reponse" lang="es" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          enterkeyhint="done" placeholder="${q.type === "phrase" ? "La phrase en espagnol" : conj ? "La forme en espagnol" : "En espagnol"}" value="${esc(s.saisie)}" aria-label="Ta réponse en espagnol">
        <button class="primaire" type="submit">Vérifier</button>
        <div class="aides"><button class="secondaire" type="button" data-mc="sais-pas">Je ne sais pas</button></div>
      </form>`;
  }
  const r = s.resultat;
  const titre = r.niveau === "passe" ? "La réponse" : r.ok ? (r.niveau === "accents" ? "Juste, aux accents près" : "Juste") : "Pas encore";
  const bonne = q.type === "conj-phrase" || q.type === "trou" ? `${q.avant}${majuscule(q, q.es[0])}${q.apres}`
    : q.type === "conj-forme" ? q.es[0] : q.es[0];
  const montre = q.type === "conj-forme" ? `${esc(PERSONNES[q.p])} → <b>${esc(q.es[0])}</b>` : q.type === "conj-phrase" || q.type === "trou" ? trouee(q, q.es[0]) : esc(q.es[0]);
  return `${barre()}${tete(ctx, q)}
    ${s.saisie ? `<p class="tape">${r.ok ? esc(s.saisie) : `<mark class="faux">${esc(s.saisie)}</mark>`}</p>` : ""}
    <div class="verdict ${r.ok ? "ok" : r.niveau === "passe" ? "ko passe" : "ko"}" role="status">
      <b>${titre}</b>
      <div class="bonne">${ecouter(bonne)}<p lang="es">${montre}</p></div>
      ${rappels(r)}
      ${conj ? sixFormes(q, !r.ok) : ""}
    </div>
    <div class="espace"></div>
    <button class="primaire" data-mc="suivant">Suivant</button>`;
}

function vueSens(q) {
  const fini = s.phase !== "question";
  const ok = fini && sensJuste(q, s.choisi);
  return `${barre()}${sorte("Mes mots · choisis le sens")}
    <div class="mc-sens"><p class="q-verbe" lang="es">${esc(q.es)}</p>${ecouter(q.es)}</div>
    <p class="q-sens">Ça veut dire…</p>
    <div class="espace"></div>
    <div class="choix-envers${fini ? " repondu" : ""}">${q.choix.map((c, k) => fini
      ? `<button disabled class="${c === q.bon ? "bon" : k === s.choisi ? "faux" : ""}">${esc(c)}</button>`
      : `<button data-mc="choix" data-k="${k}">${esc(c)}</button>`).join("")}</div>
    ${fini ? `<div class="verdict ${ok ? "ok" : "ko"}" role="status"><b>${ok ? "Juste" : "Pas encore"}</b>
        <div class="bonne">${ecouter(q.es)}<p><b lang="es">${esc(q.es)}</b> = ${esc(q.bon)}</p></div></div>
      <button class="primaire" data-mc="suivant">Suivant</button>` : ""}`;
}

const ligneMontree = (f, i) => `<button class="f vu" data-dire="${esc(f)}" aria-label="Écouter : ${esc(f)}" aria-pressed="false" data-k="${i}"><span lang="es">${esc(f)}</span>${ICONES.lecture}</button>`;
const ligneCachee = i => `<button class="f cache" data-mc="montrer" data-k="${i}">dis-le, puis touche</button>`;
function vueTableau(ctx, q) {
  return `${barre()}${sorte("Verbes · dis le tableau")}
    <div class="tete-tableau"><p class="q-verbe" lang="es">${esc(q.v)}</p>${q.sens ? `<p class="q-sens" lang="es">${esc(q.sens.replace(/^[^=]*= /, "= "))}</p>` : ""}</div>
    ${montrerTemps(q) ? `<p class="q-temps">${esc(nomTemps(q.temps))}</p>` : ""}
    ${tempsVu(ctx, q.temps) ? "" : `<p class="pas-vu">Pas encore vu.</p>`}
    <p class="consigne-dire">Dis chaque forme à voix haute, puis touche pour vérifier. Pas noté.</p>
    ${s.montres.size < 6 ? `<button class="lien tout-montrer" data-mc="tout-montrer">Tout montrer</button>` : ""}
    <div class="tab-dire">${PERSONNES.map((per, i) => `<div class="ligne"><span class="p">${per}</span>${s.montres.has(i) ? ligneMontree(q.formes[i], i) : ligneCachee(i)}</div>`).join("")}</div>
    ${q.exemple ? `<p class="exemple-verbe" lang="es">${md(q.exemple)}</p>` : ""}
    <div class="espace"></div>
    <button class="primaire" data-mc="suivant">Suivant</button>`;
}

// ——— la fin ———
function vueFin() {
  const notees = s.resultats;
  const justes = notees.filter(r => r.ok).length;
  const tableau = s.questions.find(q => q.type === "tableau");
  const parMot = bilanParMot(notees);
  const nom = cle => s.items.find(i => i.cle === cle)?.es || cle;
  // « À retenir » : une ligne par mot raté (son sens, et le mot avec lequel je l'ai confondu), une par forme de verbe ratée.
  const lignes = new Map();
  for (const { q, ok, r } of notees) {
    if (ok) continue;
    if (q.type.startsWith("conj")) {
      const k = `${q.v}|${q.temps}|${q.p}`;
      lignes.set(k, `<i lang="es">${esc(q.v)}</i>${montrerTemps(q) ? `, ${esc(nomTemps(q.temps))}` : ""} : ${PERSONNES[q.p]} → <b lang="es">${esc(q.es[0])}</b>`);
    } else {
      const it = s.items.find(i => i.cle === q.cle);
      const avant = lignes.get(q.cle);
      const conf = r?.confondu ? ` · ne pas le confondre avec <b lang="es">${esc(r.confondu.es)}</b>` : "";
      if (!avant || conf) lignes.set(q.cle, `<b lang="es">${esc(it.es)}</b> = ${esc(it.fr)}${conf}`);
    }
  }
  const retenir = [...lignes.values()].map(l => `<li>${l}</li>`).join("");
  // « Tu le sais ? » : un mot en cours, tout juste sur 2 séances de suite (celle-ci comprise).
  const encours = new Set(verbesEnCours());
  const sais = Object.entries(parMot).filter(([c, ok]) => ok && encours.has(c) && seriesJustes(c) >= 2).map(([c]) =>
    `<div class="tu-le-sais" role="status"><p><b lang="es">${esc(nom(c))}</b> : tout juste ${seriesJustes(c)} séances de suite. Tu le sais ?</p>
      <button class="oui" data-mc="sais" data-cle="${esc(c)}" data-nom="${esc(nom(c))}">Oui, je le sais</button>
      <small>Il sort de tes mots en cours. Ses cartes continuent dans « Tes mots à revoir ».</small></div>`).join("");
  return `<div class="fin">
      <h1>Séance terminée</h1>
      <p class="sous">${esc(s.titre)} · ${s.questions.length} questions</p>
      <ul class="bilan">
        <li><b>Justes</b><span>${justes} sur ${notees.length}</span></li>
        ${tableau ? `<li><b>Tableau à dire</b><span><span lang="es">${esc(tableau.v)}</span>${montrerTemps(tableau) ? `, ${esc(nomTemps(tableau.temps))}` : ""}</span></li>` : ""}
        ${s.items.length > 1 ? Object.entries(parMot).map(([c, ok]) => `<li><span lang="es">${esc(nom(c))}</span><span>${ok ? "tout juste" : "à retravailler"}</span></li>`).join("") : ""}
      </ul>
      ${retenir ? `<section aria-labelledby="t-retenir"><h2 id="t-retenir">À retenir</h2><ul class="a-retenir">${retenir}</ul></section>` : ""}
      ${sais}
      <p class="sous">Rien ne change dans « Tes mots à revoir » : cette séance, c'est en plus.</p>
    </div>
    <div class="espace"></div>
    <button class="secondaire" data-mc="encore">Encore 10</button>
    <a class="primaire" href="${s.retour}" data-remplace>${s.mode === "un" ? "Retour à la fiche" : "Retour au Dico"}</a>`;
}

// #/mots/cours, #/mots/un/CLE/ID/DEPUIS
export function ecranMots(ctx, mode, a, b, c) {
  const un = mode === "un" ? decodeURIComponent(a || "") : null;
  const retour = mode === "un" && b ? `#/dico/mot/${b}/${c || "dico"}` : "#/dico";
  const cle = `${mode}:${un || ""}`;
  // Une séance quittée en cours reprend à la même question ; une séance finie recommence.
  if (!s || s.cle !== cle || s.fini) nouvelleSeance(ctx, cle, mode, un, retour);
  if (!s.questions.length) {
    s = null;
    return { onglet: null, html: `<main class="colonne vide"><h1>Rien à travailler</h1><p class="sous">Pas encore de mot en cours : ajoute-en un depuis sa fiche du Dico, ou en le touchant dans une phrase.</p><a class="lien" href="${retour}">Revenir</a></main>` };
  }
  if (s.i >= s.questions.length) {
    if (!s.fini) {
      s.fini = true;
      son("fin");
      noterSerieVerbes(bilanParMot(s.resultats), ctx.jour);
    }
    return { onglet: null, html: `<main class="colonne exo">${vueFin()}</main>` };
  }
  const q = s.questions[s.i];
  const ecrire = !["sens", "tableau"].includes(q.type);
  const vue = q.type === "sens" ? vueSens(q) : q.type === "tableau" ? vueTableau(ctx, q) : vueEcrire(ctx, q);
  return {
    onglet: null,
    html: `<main class="colonne exo verbes-exo mots-exo${ecrire && s.phase === "question" ? " ecrire-q" : ""}">${vue}</main>`,
    apres: () => {
      if (s.depuis != null) {
        const trait = document.querySelector(".piste i");
        s.depuis = null;
        requestAnimationFrame(() => requestAnimationFrame(() => { if (trait) trait.style.width = `${(s.i / s.questions.length) * 100}%`; }));
      }
      if (ecrire && s.phase === "question") {
        const i = s.i;
        // « Écoute et écris » : la voix dit le mot tout de suite.
        if (q.type === "ecoute") { const b = document.querySelector(".mc-ecoute .ecoute"); if (b) lancerLecture(b); }
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

function noter(q, ok, r = null) {
  s.resultats.push({ q, ok, r });
  s.phase = "reponse";
  vibrer(ok ? 12 : [8, 60, 8]); son(ok ? "juste" : "rate");
}

// Le formulaire « Vérifier ». Renvoie true si l'écran doit être redessiné.
export function verifierMot() {
  if (!s) return false;
  const q = s.questions[s.i];
  s.saisie = document.getElementById("reponse")?.value.trim() || "";
  if (!s.saisie) return false;
  s.resultat = corrigerMot(q, s.saisie, s.items);
  noter(q, s.resultat.ok, s.resultat);
  return true;
}

// Les boutons d'ici. Renvoie "suivant" (nouvel écran, qui glisse), true (redessiner), false (rien), ou null si ce n'est pas un bouton d'ici.
export function actionMots(ctx, e) {
  // « M'entraîner sur ce mot » (fiche du Dico) : le mot passe en cours, ses phrases 3 et 4 entrent dans la révision.
  const ajouter = e.target.closest("[data-mc-ajouter]");
  if (ajouter) {
    const id = ajouter.dataset.mcAjouter;
    const m = ctx.mots.find(x => x.id === id) || motsAMoi().find(x => x.id === id);
    if (m) mettreMotEnCours(ctx, m, ctx.jour);
    vibrer(12);
    return true;
  }
  // La croix d'une puce, ou « Je le sais » sur une fiche.
  const retirer = e.target.closest("[data-mc-retirer]");
  if (retirer) { retirerDesCours(retirer.dataset.mcRetirer); vibrer(); return true; }

  const b = e.target.closest("[data-mc]");
  if (!b || !s) return null;
  const q = s.questions[s.i];
  switch (b.dataset.mc) {
    case "sais-pas":
      s.saisie = ""; s.resultat = { niveau: "passe", ok: false };
      s.resultats.push({ q, ok: false }); s.phase = "reponse";
      return true;
    case "choix":
      s.choisi = Number(b.dataset.k);
      noter(q, sensJuste(q, s.choisi));
      return true;
    case "montrer": {
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
      const { cle, mode, un, retour } = s;
      nouvelleSeance(ctx, cle, mode, un, retour);
      return "suivant";
    }
    case "sais": {
      // Sans redessiner (l'écran de fin ne doit pas relancer une séance).
      retirerDesCours(b.dataset.cle);
      b.closest(".tu-le-sais").outerHTML = `<p class="tu-le-sais sorti" role="status"><b lang="es">${esc(b.dataset.nom)}</b> sort de tes mots en cours. Bravo.</p>`;
      vibrer();
      return false;
    }
  }
  return false;
}
