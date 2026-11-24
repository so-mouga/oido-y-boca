// « Mes mots » : les mots que j'ajoute moi-même, gardés sur le téléphone (jamais dans le Sheet).
// - #/mes-mots/ecoute : « Tu as gardé des mots ? », juste après « C'est fait » sur l'écoute (« entendu le… ») ;
// - #/mes-mots/ajouter : le même écran, depuis la page « Mes mots » du Dico (« ajouté le… », pour les mots du prof) ;
// - #/mes-mots/modifier/ID : corriger ou supprimer un mot (depuis une carte, une liste ou le Dico) ;
// - #/semaine : « Tes mots pour la séance » (la séance orale du jeudi), les mots depuis le dernier envoi et « Copier pour le prof ».
// Un mot ajouté va dans « Tes mots à revoir » dès le lendemain, toujours appris : si je n'en veux plus, je le supprime.

import { esc, ICONES, barreOnglets } from "../ui.js?v=46";
import { mesMots, monMot, ajouterMonMot, modifierMonMot, supprimerMonMot, cases, cocher, dernierJourCoche, apprendreEnAvance } from "../progression.js?v=46";
import { memeMot, motVu } from "../dico.js?v=46";
import { lecon as trouverLecon } from "../position.js?v=46";
import { vibrer } from "../retours.js?v=46";

const svg = corps => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${corps}</svg>`;
const CRAYON = svg('<path d="M4 20h4L19 9l-4-4L4 16z"/>');
const POUBELLE = svg('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>');
const COPIER = svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>');

const pluriel = n => `${n} mot${n > 1 ? "s" : ""}`;
// « Tu as déjà… », « … est déjà dans le livre » : affiché une fois sous les champs, qui gardent ce qui était tapé.
let message = "";
let saisie = null;

// Les mots de la semaine : ceux ajoutés depuis le dernier envoi au prof (la dernière copie, un autre jour : case « dimanche »,
// le nom d'avant, gardé pour que les anciennes sauvegardes restent bonnes),
// ou des 7 derniers jours s'il n'y en a jamais eu.
export function motsDeLaSemaine(jour) {
  let depuis = dernierJourCoche(jour, "dimanche");
  if (!depuis) {
    const d = new Date(jour + "T12:00:00"); d.setDate(d.getDate() - 7);
    depuis = d.toISOString().slice(0, 10);
  }
  return mesMots().filter(m => m.le > depuis);
}

// Une ligne de liste : le mot, ce qu'il veut dire, modifier, supprimer.
const ligne = m => `<li>
    <span class="es" lang="es">${esc(m.es)}</span><span class="fr">${esc(m.fr)}</span>
    <a class="act" href="#/mes-mots/modifier/${encodeURIComponent(m.id)}" aria-label="Modifier ${esc(m.es)}">${CRAYON}</a>
    <button class="act" data-mm-suppr="${esc(m.id)}" aria-label="Supprimer ${esc(m.es)}">${POUBELLE}</button>
  </li>`;

const champs = (m = {}) => `
    <label class="champ"><span>En espagnol</span>
      <input name="es" lang="es" required value="${esc(m.es)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next"></label>
    <label class="champ"><span>En français</span>
      <input name="fr" required value="${esc(m.fr)}" placeholder="ce que ça veut dire" autocomplete="off" enterkeyhint="done"></label>
    <details class="plus"${m.ex ? " open" : ""}><summary>+ Ajouter une phrase d'exemple</summary>
      <label class="champ"><span>Une phrase d'exemple <small>(facultatif)</small></span>
        <input name="ex" lang="es" value="${esc(m.ex)}" placeholder="Este café es muy barato." autocomplete="off" autocapitalize="sentences" spellcheck="false" enterkeyhint="done"></label>
    </details>`;

// ── Ajouter : après l'écoute, ou depuis le Dico ──
function ecranAjout(ctx, via) {
  const ecoute = via === "ecoute";
  const aujourdhui = mesMots().filter(m => m.le === ctx.jour).reverse();
  const fin = ecoute ? "#/" : "#/dico/mes-mots";
  const msg = message, tape = saisie || {};
  message = ""; saisie = null;
  return {
    onglet: null,
    apres: () => document.querySelector('.mes-mots input[name="es"]')?.focus({ preventScroll: true }),
    html: `<main class="colonne mes-mots">
        ${ecoute ? `<p class="bravo"><span class="pt ok">${ICONES.coche}</span>Écoute faite. ¡Muy bien!</p>`
          : `<header class="nav-haut"><a class="retour" href="${fin}" data-remplace>${ICONES.retour}Mes mots</a></header>`}
        <h1>${ecoute ? "Tu as gardé des mots ?" : "Ajouter un mot"}</h1>
        <p class="conseil">${ecoute ? "2 ou 3 au plus : ceux que tu as entendus plusieurs fois. Ils arrivent"
          : "Un mot entendu, ou donné par le prof. Il arrive"} dans tes mots à revoir dès demain.</p>
        <form class="formulaire" data-mm-form="${ecoute ? "ecoute" : "dico"}">
          ${champs(tape)}
          ${msg ? `<div class="mm-msg" role="status">${msg}</div>` : ""}
          <button class="primaire" type="submit">Ajouter</button>
        </form>
        ${aujourdhui.length ? `<section><h2>Déjà ajouté aujourd'hui</h2><ul class="mm-liste">${aujourdhui.map(ligne).join("")}</ul></section>` : ""}
        <div class="espace"></div>
        <a class="secondaire cadre" href="${fin}" data-remplace>${ecoute ? (aujourdhui.length ? "Pas d'autre mot · Terminer" : "Pas de mot · Terminer") : "Terminer"}</a>
      </main>`,
  };
}

// ── Modifier un mot ──
function ecranModifier(ctx, idMot) {
  const m = monMot(decodeURIComponent(idMot || ""));
  const retour = `<header class="nav-haut"><a class="retour" href="#/dico/mes-mots" data-arriere>${ICONES.retour}Revenir</a></header>`;
  if (!m) return { onglet: null, html: `<main class="colonne mes-mots">${retour}<h1>Mot introuvable</h1><p class="sous">Il a peut-être été supprimé.</p></main>` };
  return {
    onglet: null,
    html: `<main class="colonne mes-mots">
        ${retour}
        <h1>Modifier ton mot</h1>
        <p class="conseil">Le prof t'a corrigé ? Change le mot : il garde sa place dans tes mots à revoir.</p>
        <form class="formulaire" data-mm-form="modifier" data-id="${esc(m.id)}">
          ${champs(m)}
          <button class="primaire" type="submit">Enregistrer</button>
        </form>
        <div class="espace"></div>
        <button class="secondaire supprimer" data-mm-suppr="${esc(m.id)}" data-retour>Supprimer ce mot</button>
      </main>`,
  };
}

// ── Tes mots pour la séance orale du jeudi ── (la phrase d'exemple entre parenthèses, pour que le prof la corrige aussi)
export const texteProf = mots => `Mis palabras de la semana: ${mots.map(m => `${m.es} = ${m.fr}${m.ex ? ` (${m.ex})` : ""}`).join(", ")}`;

function ecranSemaine(ctx) {
  const mots = motsDeLaSemaine(ctx.jour);
  const copie = !!cases(ctx.jour).dimanche;
  return {
    onglet: "jour",
    html: `<main class="colonne mes-mots semaine">
        <header class="nav-haut"><a class="retour" href="#/" data-arriere>${ICONES.retour}Aujourd'hui</a></header>
        <div><h1>Tes mots pour la séance</h1><p class="sous">${copie && mots.length ? "Copiés aujourd'hui" : "La séance orale avec le prof, le jeudi à 12 h"}</p></div>
        <p class="conseil">Colle-les au début de la séance : le prof les corrige et les réutilise dans les jeux de rôle.
          Ensuite, modifie-les ici ou dans « Mes mots ».</p>
        ${mots.length ? `<section><h2>Tes mots depuis la dernière séance · ${mots.length}</h2><ul class="mm-liste">${mots.map(ligne).join("")}</ul></section>
          <button class="copier" data-mm-copier>${COPIER}Copier pour le prof</button>
          <p class="copie" role="status" data-mm-copie></p>`
          : `<p class="sous">Pas de mot gardé depuis ta dernière séance.</p>`}
        <div class="espace"></div>
        <a class="secondaire cadre" href="#/" data-remplace>Revenir à aujourd'hui</a>
      </main>${barreOnglets("jour")}`,
  };
}

export function ecranMesMots(ctx, a, b) {
  if (a === "modifier") return ecranModifier(ctx, b);
  return ecranAjout(ctx, a === "ecoute" ? "ecoute" : "dico");
}
export { ecranSemaine };

// ── Les actions ──
const revenir = (secours) => { if (history.length > 1) history.back(); else location.replace(secours); };

// Le formulaire envoyé : ajoute ou enregistre. Renvoie true si l'écran doit être redessiné.
export function envoiMesMots(ctx, form) {
  const es = form.es.value.trim().replace(/\s+/g, " ");
  const fr = form.fr.value.trim().replace(/\s+/g, " ");
  const ex = (form.ex?.value || "").trim().replace(/\s+/g, " ");
  if (!es || !fr) return false;
  const mode = form.dataset.mmForm;
  if (mode === "modifier") {
    modifierMonMot(form.dataset.id, es, fr, ex);
    vibrer();
    revenir("#/dico/mes-mots");
    return false;
  }
  // Déjà là ? On compare sans accents, majuscules, ni article (el, la…) : « El Piso » = « el piso ».
  const deja = mesMots().find(m => memeMot(m.es, es));
  if (deja) {
    message = `<span>Tu as déjà <b lang="es">${esc(deja.es)}</b> dans tes mots : « ${esc(deja.fr)} ».</span>`;
    saisie = { es, fr, ex };
    return true;
  }
  const livre = ctx.mots.find(m => memeMot(m.es, es));
  if (livre) {
    saisie = { es, fr, ex };
    const ou = `${esc(livre.lecon)}`;
    message = motVu(ctx, livre)
      ? `<span><b lang="es">${esc(livre.es)}</b> est déjà dans tes mots du livre (${ou}) : « ${esc(livre.fr)} ». Il est déjà dans ta révision.</span>`
      : `<span><b lang="es">${esc(livre.es)}</b> est déjà dans le livre (${ou}${trouverLecon(livre.lecon) ? ` · ${esc(trouverLecon(livre.lecon).titre)}` : ""}) : « ${esc(livre.fr)} ».</span>
        <span class="deux"><button type="button" class="oui" data-apprendre="${esc(livre.id)}">L'apprendre maintenant</button>
        <button type="button" class="non" data-mm-annuler>Annuler</button></span>`;
    return true;
  }
  ajouterMonMot(es, fr, ex, ctx.jour, mode === "ecoute" ? "ecoute" : "dico");
  vibrer();
  return true;
}

// Les boutons. Renvoie true si l'écran doit être redessiné, null si ce n'est pas un bouton d'ici.
export async function actionMesMots(ctx, e) {
  const suppr = e.target.closest("[data-mm-suppr]");
  if (suppr) {
    const m = monMot(suppr.dataset.mmSuppr);
    if (!m || !confirm(`Supprimer « ${m.es} » ? Il sort aussi de tes mots à revoir.`)) return false;
    supprimerMonMot(m.id);
    vibrer();
    if (suppr.hasAttribute("data-retour")) { revenir("#/dico/mes-mots"); return false; }
    return true;
  }
  // « L'apprendre maintenant » : la carte du livre entre dans « Tes mots à revoir » (depuis une fiche ou « Ajouter un mot »).
  const apprendre = e.target.closest("[data-apprendre]");
  if (apprendre) {
    const m = ctx.mots.find(x => x.id === apprendre.dataset.apprendre);
    if (!m) return false;
    apprendreEnAvance(m.id, ctx.jour);
    if (apprendre.closest("[data-mm-form]")) message = `<span><b lang="es">${esc(m.es)}</b> arrive dans tes mots à revoir dès demain.</span>`;
    vibrer();
    return true;
  }
  if (e.target.closest("[data-mm-annuler]")) {
    message = ""; saisie = null;
    return true;
  }
  if (e.target.closest("[data-mm-copier]")) {
    const texte = texteProf(motsDeLaSemaine(ctx.jour));
    const ok = await copier(texte);
    // La copie compte comme l'envoi au prof : jeudi prochain, les mots partiront d'ici.
    if (ok) cocher(ctx.jour, "dimanche", true);
    vibrer(8);
    // Depuis « Ta journée », on redessine : le bouton devient « Copié ✓ ». Si la copie échoue,
    // l'écran des mots affiche le texte, à copier à la main.
    if (e.target.closest(".accueil")) {
      if (ok) return true;
      location.hash = "#/semaine";
      return false;
    }
    const zone = document.querySelector("[data-mm-copie]");
    if (zone) {
      zone.innerHTML = ok ? `${ICONES.coche}Copié : « ${esc(texte)} »` : `Copie impossible : ${esc(texte)}`;
      zone.classList.add("on");
    }
    return false;
  }
  return null;
}

async function copier(texte) {
  try { await navigator.clipboard.writeText(texte); return true; } catch { /* repli ci-dessous */ }
  const t = Object.assign(document.createElement("textarea"), { value: texte });
  t.style.cssText = "position:fixed;opacity:0";
  document.body.append(t); t.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch { /* rien */ }
  t.remove();
  return ok;
}
