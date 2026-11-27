// La bulle de « toucher un mot » (chantier 10), la même partout : exercices, bonus, contrôle (après la réponse),
// « À dire », cartes de la révision, fiches du Dico, lectures. Le moteur (retrouver le mot) est dans toucher.js.
// Toucher un mot : il passe en jaune, sa phrase se colore, la bulle s'ouvre sous la phrase (au-dessus s'il n'y a pas
// de place), avec ce que le mot veut dire, « Écouter la phrase », « La phrase en français » si l'auteur l'a écrite,
// et un bouton pour le garder :
// - une carte déjà apprise ou un de mes mots → « Je l'avais oublié · à revoir demain » (comme un « Non » dans la révision) ;
// - une carte plus loin dans le livre → « L'apprendre maintenant » (comme dans le Dico) ;
// - et en plus, en premier (chantier 19, Q19-3) : « M'entraîner sur ce mot » (« Mes mots en cours », verbes compris) ;
// - rien de trouvé → « Ajouter à Mes mots » (l'espagnol déjà écrit, le français à écrire soi-même).
// Toucher un mot ne change rien à la révision : seul le bouton agit. On reste sur l'écran.

import { esc, ICONES, id } from "../ui.js?v=74";
import { sens, statut, personneEtTemps, lireExtras } from "../toucher.js?v=74";
import { noterMot, apprendreEnAvance, apprisEnAvance, mettreEnCours, verbeEnCours, ajouterMonMot } from "../progression.js?v=74";
import { motEnCours, mettreMotEnCours } from "../motsencours.js?v=74";
import { motVu, memeMot, motsAMoi } from "../dico.js?v=74";
import { vibrer } from "../retours.js?v=74";

let ouvert = null;            // { mot, ph, bulle }
const revusIci = new Set();   // les cartes mises « à revoir demain » depuis l'ouverture de l'appli

export function fermerBulle() {
  if (!ouvert) return;
  ouvert.bulle.remove();
  ouvert.mot.classList.remove("touche");
  ouvert.ph.classList.remove("lit");
  ouvert = null;
}

// La bulle sous la phrase (pas sous le mot : elle ne cache jamais la fin de la phrase), dans la largeur de l'appli.
// S'il manque de la place en dessous, au-dessus.
function placer() {
  if (!ouvert) return;
  const { ph, bulle } = ouvert;
  if (!ph.isConnected) return fermerBulle();
  const app = document.getElementById("app").getBoundingClientRect();
  const r = ph.getBoundingClientRect();
  const vv = window.visualViewport;
  const basVisible = (vv ? vv.offsetTop + vv.height : innerHeight);
  bulle.style.left = `${app.left + 12 + scrollX}px`;
  bulle.style.width = `${app.width - 24}px`;
  const h = bulle.offsetHeight;
  const dessous = r.bottom + 8;
  const top = dessous + h > basVisible && r.top - 8 - h > 0 ? r.top - 8 - h : dessous;
  bulle.style.top = `${top + scrollY}px`;
}

function ligneCarte(ctx, m, avecSens) {
  const st = statut(ctx, m);
  const ou = st.cas === "moi" ? "dans Mes mots" : st.cas === "appris" ? `${id(st.lecon)} · déjà appris` : `arrive en ${id(st.lecon)}`;
  return `<p class="bm-ou"><span lang="es">${esc(m.es)}</span>${avecSens ? ` = ${esc(m.fr)}` : ""} · ${ou}</p>`;
}

function contenu(ctx, mot, ph) {
  const t = mot.textContent;
  const extras = lireExtras(ph.dataset.txExtras);
  const s = sens(ctx, mot.dataset.tx, extras);
  const g = mot.dataset.g || s.extra;
  const carte = s.carte;
  const carteSeule = carte && !carte.partiel && !carte.verbe;
  const principal = g || (carteSeule ? carte.m.fr : null) || (!s.verbes.length && !carte ? s.petit : null);
  const lignes = [];
  for (const v of s.verbes.slice(0, 2)) {
    lignes.push(`<p class="bm-ou"><b lang="es">${esc(v.x.v)}</b>${v.x.fr ? ` (${esc(v.x.fr)})` : ""} · ${esc(personneEtTemps(v))}${s.pronom ? ` + <span lang="es">${esc(s.pronom)}</span>` : ""}</p>`);
  }
  if (carte && !(s.verbes.length && s.verbes[0].x.carte === carte.m)) lignes.push(ligneCarte(ctx, carte.m, !carteSeule || !!g));
  const rien = !carte && !s.verbes.length && !s.petit && !s.extra;
  if (rien) lignes.push(`<p class="bm-ou">Pas dans ton livre.</p>`);

  const fr = ph.dataset.txFr;
  const ecoute = `<button class="bm-lien" data-dire="${esc(ph.dataset.txVoix)}" aria-pressed="false"><span class="ecoute">${ICONES.lecture}</span>Écouter la phrase</button>`;
  const voirFr = fr ? `<button class="bm-lien bm-fr" data-tx-voirfr>La phrase en français</button>` : "";
  return `<button class="bm-fermer" data-tx-fermer aria-label="Fermer">×</button>
    <p class="bm-tete"><b lang="es">${esc(t)}</b>${principal ? ` → ${esc(principal)}` : ""}</p>
    ${lignes.join("")}
    <div class="bm-ligne">${ecoute}${voirFr}</div>
    ${fr ? `<p class="bm-trad" hidden>${esc(fr)}</p>` : ""}
    <div class="bm-action">${bouton(ctx, s, t, rien ? (g || "") : null)}</div>`;
}

const fait = texte => `<p class="bm-fait" role="status">${texte}</p>`;
// Les boutons pour garder le mot. prefill : null quand le mot est connu, sinon le français à proposer (« Ajouter à Mes mots »).
// D'abord « M'entraîner sur ce mot » (Mes mots en cours, Q19-3), puis, dessous, ce qu'il y avait avant :
// « Je l'avais oublié · à revoir demain » ou « L'apprendre maintenant ».
function bouton(ctx, s, t, prefill) {
  const v = s.verbes.find(x => !x.x.gustar);
  // Un verbe des exercices sans carte (« buscar ») : seulement « M'entraîner sur ce mot ».
  if (v && !v.x.carte && !s.carte) {
    return verbeEnCours(v.x.v)
      ? fait(`<b lang="es">${esc(v.x.v)}</b> est dans tes mots en cours.`)
      : `<button class="bm-garder" data-tx-verbe="${esc(v.x.v)}">M'entraîner sur ce mot</button>`;
  }
  const m = (s.carte && !s.carte.verbe ? s.carte.m : null) || v?.x.carte || s.carte?.m;
  if (m) {
    const cours = motEnCours(ctx, m)
      ? fait(`<b lang="es">${esc(m.es)}</b> est dans tes mots en cours.`)
      : `<button class="bm-garder" data-tx-cours="${esc(m.id)}">M'entraîner sur ce mot</button>`;
    const st = statut(ctx, m);
    let second;
    // Appris en avance (et sa leçon pas encore faite) : rien de plus à faire, il est déjà dans la révision.
    if (!m.moi && !ctx.pos.faites.has(m.lecon) && apprisEnAvance(m.id) && !revusIci.has(m.id)) second = fait("Appris en avance : il est dans « Tes cartes à revoir ».");
    else if (st.cas === "loin") second = `<button class="bm-garder bm-second" data-tx-apprendre="${esc(m.id)}">L'apprendre maintenant</button>`;
    else second = revusIci.has(m.id)
      ? fait("Revient demain dans « Tes cartes à revoir ».")
      : `<button class="bm-garder bm-second" data-tx-revoir="${esc(m.id)}">${st.cas === "moi" ? "À revoir demain" : "Je l'avais oublié · à revoir demain"}</button>`;
    return cours + second;
  }
  if (prefill === null) return "";
  return `<button class="bm-garder" data-tx-ajouter="${esc(prefill)}">Ajouter à Mes mots</button>`;
}

function ouvrir(ctx, mot) {
  fermerBulle();
  const ph = mot.closest(".tx-ph");
  const bulle = document.createElement("div");
  bulle.className = "bulle-mot";
  bulle.setAttribute("role", "dialog");
  bulle.setAttribute("aria-label", `Le mot ${mot.textContent}`);
  bulle.innerHTML = contenu(ctx, mot, ph);
  mot.classList.add("touche");
  ph.classList.add("lit");
  document.getElementById("app").append(bulle);
  ouvert = { mot, ph, bulle };
  placer();
  vibrer(8);
}
const redessiner = ctx => { if (ouvert) { ouvert.bulle.innerHTML = contenu(ctx, ouvert.mot, ouvert.ph); placer(); } };

// Les gestes. Renvoie true si le clic est pour la bulle (les autres boutons de l'écran ne le voient pas).
// « Écouter la phrase » (data-dire) est laissé au bouton de son habituel.
export function actionToucher(ctx, e) {
  const mot = e.target.closest(".tx-mot");
  if (mot) {
    if (ouvert?.mot === mot) fermerBulle(); else ouvrir(ctx, mot);
    return true;
  }
  if (!ouvert) return false;
  if (!e.target.closest(".bulle-mot")) { fermerBulle(); return false; }
  if (e.target.closest("[data-dire]")) return false;
  const b = e.target.closest("button");
  if (!b) return true;
  const d = b.dataset;
  if ("txFermer" in d) fermerBulle();
  else if ("txVoirfr" in d) { b.hidden = true; ouvert.bulle.querySelector(".bm-trad").hidden = false; placer(); }
  else if (d.txRevoir) { noterMot(d.txRevoir, 1, ctx.jour); revusIci.add(d.txRevoir); vibrer(); redessiner(ctx); }
  else if (d.txApprendre) { apprendreEnAvance(d.txApprendre, ctx.jour); vibrer(); redessiner(ctx); }
  else if (d.txCours) {
    // « M'entraîner sur ce mot » : comme sur la fiche du Dico (ses phrases 3 et 4 entrent dans la révision ; pas vu → sa carte aussi).
    const m = ctx.mots.find(x => x.id === d.txCours) || motsAMoi().find(x => x.id === d.txCours);
    if (m) mettreMotEnCours(ctx, m, ctx.jour);
    vibrer(); redessiner(ctx);
  } else if (d.txVerbe) {
    // Un verbe des exercices sans carte (« buscar ») : il passe dans « Mes mots en cours ».
    mettreEnCours(d.txVerbe, ctx.jour);
    vibrer(); redessiner(ctx);
  } else if ("txAjouter" in d) {
    const es = ouvert.mot.textContent;
    b.closest(".bm-action").innerHTML = `<form class="bm-form" data-tx-form>
        <label>En espagnol<input name="es" lang="es" value="${esc(es)}" autocomplete="off" autocapitalize="off" spellcheck="false" required></label>
        <label>En français<input name="fr" value="${esc(d.txAjouter)}" placeholder="ce que ça veut dire" autocomplete="off" required></label>
        <button class="bm-garder" type="submit">Enregistrer</button>
      </form>`;
    placer();
    ouvert.bulle.querySelector('input[name="fr"]').focus({ preventScroll: true });
  }
  return true;
}

// « Enregistrer » : le mot va dans Mes mots, avec la phrase comme exemple. Un mot déjà là n'est pas ajouté deux fois.
export function envoiToucher(ctx, form) {
  if (!ouvert) return;
  const es = form.es.value.trim(), fr = form.fr.value.trim();
  if (!es || !fr) return;
  const zone = form.closest(".bm-action");
  if (motsAMoi().some(m => memeMot(m.es, es))) { zone.innerHTML = fait(`<span lang="es">${esc(es)}</span> est déjà dans Mes mots.`); placer(); return; }
  ajouterMonMot(es, fr, ouvert.ph.dataset.txVoix, ctx.jour, "toucher");
  vibrer();
  zone.innerHTML = fait("Dans « Mes mots » : à revoir dès demain.");
  placer();
}

// Au clavier : Entrée ou Espace sur un mot l'ouvre. Échap ferme. La bulle suit l'écran quand il change de taille.
export function suivreBulle() {
  addEventListener("keydown", e => {
    if (e.key === "Escape") fermerBulle();
    if (e.target.matches?.(".tx-mot") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.target.click(); }
  });
  window.visualViewport?.addEventListener("resize", placer);
  addEventListener("resize", placer);
  // Une zone qui défile (la question au-dessus du clavier) : la bulle suit sa phrase.
  addEventListener("scroll", placer, true);
}
