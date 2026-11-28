// Les missions du jour de la Feria (chantier 12, maquette .impeccable/mocks/missions/index.html).
//   #/jeux/mision          l'accueil : la mission du jour, sa règle, quelques exemples
//   #/jeux/mision/partie   la mission : El Repartidor (6 colis à trier, 3 étiquettes à écrire) ou La lista de Blanca (6 lignes)
//   #/jeux/mision/fin      le score, l'ampoule, « À retenir », les mots nouveaux à garder
// Faire la mission ou La Charla allume l'ampoule du jour. Un seul essai compte par jour ; rejouée, elle ne change rien.
// Pas de chrono, pas de points, pas de record. La voix dit chaque mot nouveau à son arrivée.
// Le moteur (pluriel, genre, pièges, choix du jour, correction) est dans missions.js.

import { esc, ICONES, barreOnglets } from "../ui.js?v=86";
import { LECONS } from "../position.js?v=86";
import { apprisEnAvance, apprendreEnAvance, etatJeux, garderJeux } from "../progression.js?v=86";
import { dire, taire } from "../voix.js?v=86";
import { chispa } from "../mascotte.js?v=86";
import * as J from "../jeux.js?v=86";
import { hasardDuJour } from "../charla.js?v=86";
import * as M from "../missions.js?v=86";
import { DUOS } from "../duos.js?v=86";

const $ = (s, r = document) => r.querySelector(s);
const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const jeux = () => ({ ...J.JEUX_VIDE(), ...etatJeux() });
const flamme = (humeur, taille) => chispa(humeur, taille, J.etape(J.attrapes(jeux())).i);
const RANG = Object.fromEntries(LECONS.map((l, i) => [l.id, i]));
const rang = id => RANG[id] ?? 1e6;
// Les explications du moteur : du texte avec seulement <i>…</i> et <b>…</b>.
const html = t => esc(t).replace(/&lt;(\/?)([ib])&gt;/g, "<$1$2>");
const NOMS = { repartidor: "El Repartidor", lista: "La lista de Blanca", duos: "Uno de dos" };
const DUO = Object.fromEntries(DUOS.map(d => [d.id, d]));
// La carte « La règle » d'un duo : 2 lignes et 2 exemples.
const carteRegle = (d, titre = "") => `<div class="m-regle">${titre ? `<small>${titre}</small>` : ""}<h2>${esc(d.nom)}</h2>${d.carte.map(l => `<p>${html(l)}</p>`).join("")}
  <div class="m-ex">${d.ex.map(e => `<span lang="es">${esc(e)}</span>`).join("")}</div></div>`;

let P = null, derniere = null, minuteurs = [];
const plusTard = (f, ms) => minuteurs.push(setTimeout(f, ms));
function arreter() { minuteurs.forEach(clearTimeout); minuteurs = []; P = null; taire(); }

const svg = corps => `<svg viewBox="0 0 24 24" aria-hidden="true">${corps}</svg>`;
const I = {
  son: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'),
  muet: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM17 9.5l5 5M22 9.5l-5 5"/>'),
  camion: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="9" width="16" height="12" rx="1.5"/><path d="M19 13h5l4 4v4h-9z"/><circle cx="9" cy="23" r="2.6"/><circle cx="23" cy="23" r="2.6"/></svg>',
  liste: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="4" width="18" height="24" rx="2"/><path d="M11 11h10M11 16h10M11 21h6"/></svg>',
  duo: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 29V17M16 17L7 6M16 17l9-11M7 6h5M7 6v5M25 6h-5M25 6v5"/></svg>',
};
const boutonMuet = () => `<button class="f-rond" data-m="muet" aria-label="${jeux().muet ? "Remettre le son" : "Couper le son"}" aria-pressed="${jeux().muet}">${jeux().muet ? I.muet : I.son}</button>`;

// ——— la voix et les petits sons : tout se tait avec le bouton muet de la Feria ———
const parler = t => { if (!jeux().muet) dire(t); };
let audio = null;
function note(freq, debut = 0, duree = .2, volume = .07, type = "sine") {
  if (jeux().muet) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const t = audio.currentTime + .02 + debut, o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + duree);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t + duree + .05);
  } catch { /* le son est un bonus */ }
}
const bien = () => { note(660, 0, .12, .06, "triangle"); note(880, .09, .16, .06, "triangle"); };
const pas = () => note(220, 0, .22, .06);
const vibrer = ms => { try { navigator.vibrate?.(ms); } catch { /* rien */ } };

// ——— la mission du jour (la même toute la journée) ———
// Un mot gardé aujourd'hui (« Je le garde ») reste « nouveau » jusqu'à demain : la mission ne change pas si on la rejoue.
export function missionDuJour(ctx) {
  const vu = m => ctx.pos.faites.has(m.lecon) || (apprisEnAvance(m.id) && apprisEnAvance(m.id) < ctx.jour);
  return M.missionDuJour({ mots: ctx.mots, vu, rang, faites: ctx.pos.faites, etat: jeux().missions, jour: ctx.jour, hasard: hasardDuJour(ctx.jour, "mision"), duos: DUOS });
}
const ampouleAllumee = ctx => (jeux().jours || []).includes(ctx.jour);
const nTaches = m => m.forme === "lista" ? m.lignes.length : m.forme === "duos" ? m.phrases.length : m.colis.length + m.etiquettes.length;

// La carte de la salle, juste sous La Charla.
export function standMision(ctx) {
  const m = missionDuJour(ctx);
  if (!m) return `<div class="s-jour mision attend"><span class="m-pic">${I.camion}</span><div><small>Misión del día</small><b>El Repartidor</b><span>S'ouvre quand le livre a assez de noms</span></div></div>`;
  const faite = M.faiteAujourdhui(jeux(), ctx.jour), pic = m.forme === "lista" ? I.liste : m.forme === "duos" ? I.duo : I.camion;
  if (faite) return `<a class="s-jour mision faite" href="#/jeux/mision"><span class="m-pic">${pic}</span><div><small>Misión cumplida · ${faite.ok}/${faite.sur}</small><b>${NOMS[faite.forme] || NOMS[m.forme]}</b><span>Une autre mission demain</span></div><em>Revoir</em></a>`;
  const quoi = m.forme === "lista" ? "6 lignes · un, una, dos, tres…" : m.forme === "duos" ? `${nTaches(m)} phrases · ${m.duos.map(id => DUO[id].court).slice(0, 2).join(", ")}…` : `${nTaches(m)} colis · el, la, los, las`;
  const allumee = ampouleAllumee(ctx);
  return `<a class="s-jour mision${allumee ? " bonus" : ""}" href="#/jeux/mision"><span class="m-pic">${pic}</span><div><small>Misión del día</small><b>${NOMS[m.forme]}</b><span>${quoi} · ${allumee ? "pour le plaisir" : "allume l'ampoule"}</span></div><em>Empezar</em></a>`;
}

// ——— l'accueil ———
function vuePret(ctx) {
  const m = missionDuJour(ctx);
  if (!m) return { onglet: null, html: `<div class="feria f-pret"><div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1>Misión del día</h1></div><div class="f-attente"><b>Pas encore de mission.</b> Il faut quelques noms de plus dans le livre.</div></div>`, apres: brancher };
  const faite = M.faiteAujourdhui(jeux(), ctx.jour);
  const nouveaux = m.mots.filter(n => !n.vu).length;
  if (m.forme === "duos") return vuePretDuos(ctx, m, faite);
  const regle = m.forme === "lista"
    ? `Blanca t'a laissé un pense-bête. <b>Écris chaque ligne en espagnol</b> : le nombre en lettres, puis le mot, au pluriel s'il le faut.
       <span class="m-ex"><span>3 · reunión → tres reuniones</span><span>1 · hora → una hora</span></span>`
    : `Tu es livreur à Huesca. <b>Trie les colis</b> dans le bon camion : <b>EL, LA, LOS, LAS</b>. Puis <b>écris les étiquettes au pluriel</b>.
       <span class="m-ex"><span>pisos → LOS</span><span>ciudad → LA</span><span>barrio → barrios</span></span>`;
  const bas = faite
    ? `<a class="f-btn gros" href="#/jeux/mision/partie">La rejouer</a><small>Déjà faite aujourd'hui (${faite.ok}/${faite.sur}) : rejouée, elle ne change rien. Une autre demain.</small>`
    : `<a class="f-btn gros" href="#/jeux/mision/partie">${m.forme === "lista" ? "¡A escribir!" : "¡A repartir!"}</a><small>${ampouleAllumee(ctx) ? "L'ampoule est déjà allumée : celle-ci, c'est pour le plaisir." : "Un seul essai : il allume l'ampoule du jour."}</small>`;
  return {
    onglet: null,
    html: `<div class="feria f-pret m-pret">
        <div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1><small>Misión del día</small>${NOMS[m.forme]}</h1></div>
        <p class="f-regle">${regle}</p>
        <p class="f-regle"><b>${nTaches(m)} ${m.forme === "lista" ? "lignes" : "colis"}</b>, pas de chrono.${nouveaux ? ` <b>${nouveaux} mot${nouveaux > 1 ? "s" : ""} nouveau${nouveaux > 1 ? "x" : ""}</b>, marqué${nouveaux > 1 ? "s" : ""} <span class="m-nuevo">nuevo</span> : ${nouveaux > 1 ? "ils viennent" : "il vient"} de tes prochaines leçons, avec le sens écrit. Tu pourras ${nouveaux > 1 ? "les" : "le"} garder à la fin.` : ""}</p>
        <div class="c-bas m-bas">${bas}</div>
      </div>`,
    apres: brancher,
  };
}

// L'accueil de Uno de dos : la carte « La règle » du duo nouveau (la première fois), et les règles des autres, repliées.
function vuePretDuos(ctx, m, faite) {
  const nouveau = m.nouveau ? DUO[m.nouveau] : null;
  const autres = m.duos.filter(id => id !== m.nouveau).map(id => DUO[id]);
  const bas = faite
    ? `<a class="f-btn gros" href="#/jeux/mision/partie">La rejouer</a><small>Déjà faite aujourd'hui (${faite.ok}/${faite.sur}) : rejouée, elle ne change rien. Une autre demain.</small>`
    : `<a class="f-btn gros" href="#/jeux/mision/partie">${nouveau ? "Compris, ¡vamos!" : "¡Vamos!"}</a><small>${ampouleAllumee(ctx) ? "L'ampoule est déjà allumée : celle-ci, c'est pour le plaisir." : "Un seul essai : il allume l'ampoule du jour."}</small>`;
  return {
    onglet: null,
    html: `<div class="feria f-pret m-pret">
        <div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1><small>Misión del día</small>Uno de dos</h1></div>
        <p class="f-regle">Une phrase à trou, <b>deux camions</b> : touche le bon mot. <b>${nTaches(m)} phrases</b>, pas de chrono. Le « ? » remontre la règle pendant la partie.</p>
        ${nouveau ? carteRegle(nouveau, "Nouveau duo") : ""}
        ${autres.length ? `<div class="m-autres"><h2>${nouveau ? "Et aussi" : "Les duos du jour"}</h2>${autres.map(d => `<details><summary>${esc(d.nom)}</summary>${carteRegle(d)}</details>`).join("")}</div>` : ""}
        <div class="c-bas m-bas">${bas}</div>
      </div>`,
    apres: brancher,
  };
}

// ——— la partie ———
function vuePartie(ctx) {
  const m = missionDuJour(ctx);
  if (!m) return vuePret(ctx);
  const rejoue = !!M.faiteAujourdhui(jeux(), ctx.jour);
  const n = nTaches(m);
  const corps = m.forme === "lista"
    ? `<div class="m-frigo"><div class="m-post"><h2>${esc(m.titre)}</h2><div class="m-lignes"></div><p class="m-signe">Blanca ♥</p></div><div class="m-verdict-l" aria-live="polite"></div>
        <p class="m-aide">Le nombre en lettres, puis le mot. Entrée pour valider.</p></div>
       <div class="m-valider"><button class="f-btn gros" data-m="noter">C'est noté</button></div>`
    : `<div class="m-quai" aria-live="polite"></div><div class="m-bas-jeu"></div>`;
  const aide = m.forme === "duos" ? `<button class="f-rond m-aide-btn" data-m="regle" aria-label="Revoir la règle">?</button>` : "";
  return {
    onglet: null,
    html: `<div class="feria m-partie ecrire-q ${m.forme}">
        <div class="m-hud"><a class="f-rond" href="#/jeux/mision" data-arriere aria-label="Arrêter">${ICONES.fermer}</a><b>${NOMS[m.forme]}</b><span class="m-compte">1 / ${n}</span>${aide}${boutonMuet()}</div>
        <div class="m-etapes">${Array.from({ length: n }, () => "<i></i>").join("")}</div>
        ${corps}
      </div>`,
    apres: () => { brancher(); lancer(ctx, m, rejoue); },
  };
}

function lancer(ctx, m, rejoue) {
  P = { ctx, m, rejoue, i: 0, res: [], rates: [], attend: false };
  if (m.forme === "lista") return ligne();
  if (m.forme === "duos") return poserDuo();
  poser();
}
const n = () => nTaches(P.m);
function barre(ok) {
  const t = document.querySelectorAll(".m-etapes i");
  t[P.i]?.classList.remove("ici"); t[P.i]?.classList.add(ok ? "ok" : "ko");
}
function ici() {
  document.querySelectorAll(".m-etapes i")[P.i]?.classList.add("ici");
  const c = $(".m-compte"); if (c) c.textContent = `${Math.min(P.i + 1, n())} / ${n()}`;
}
const nuevo = x => x.nouveau ? `<span class="m-nuevo">nuevo · ${esc(x.n.lecon)}</span>` : "";
const ecoute = t => `<button class="m-ecoute" data-dire="${esc(t)}" aria-label="Écouter : ${esc(t)}" aria-pressed="false">${ICONES.play}</button>`;

// El Repartidor : un colis arrive ; les 6 premiers vont dans un camion, les 3 derniers ont une étiquette à écrire.
function poser() {
  const p = P, q = $(".m-quai"), bas = $(".m-bas-jeu");
  if (!p || !q) return;
  ici();
  p.attend = false;
  if (p.i < p.m.colis.length) {
    const c = p.m.colis[p.i];
    q.innerHTML = `<p class="m-consigne">Dans quel camion ?</p>
      <div class="m-colis">${ecoute(c.texte)}<div class="m-etiq">${nuevo(c)}<b lang="es">${esc(c.texte)}</b>${c.nouveau ? `<small>${esc(J.court(c.n.fr))}${c.nombre === "p" && !c.n.plurielSeul ? " (au pluriel)" : ""}</small>` : ""}</div></div>`;
    bas.innerHTML = `<div class="m-camions">${["EL", "LA", "LOS", "LAS"].map(a => `<button class="m-camion ${a.toLowerCase()}" data-m="camion" data-a="${a}">${a}</button>`).join("")}</div>`;
    if (c.nouveau) plusTard(() => parler(c.texte), 350);
    return;
  }
  const e = p.m.etiquettes[p.i - p.m.colis.length];
  q.innerHTML = `<p class="m-consigne">Écris l'étiquette au pluriel</p>
    <div class="m-colis">${ecoute(e.de)}<div class="m-etiq">${nuevo(e)}<b lang="es">${esc(e.de)}</b>${e.nouveau ? `<small>${esc(J.court(e.n.fr))}</small>` : ""}</div></div>
    <form class="m-ecrire" data-m="form"><label for="m-pl" lang="es">${e.art}</label><input id="m-pl" lang="es" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="…"></form>`;
  bas.innerHTML = `<div class="m-valider"><button class="f-btn gros" data-m="ecrire">Coller l'étiquette</button></div>`;
  if (e.nouveau) plusTard(() => parler(e.de), 350);
  $("#m-pl")?.focus();
}
function verdict(ok, texte, ecouter) {
  const bas = $(".m-bas-jeu");
  if (!bas) return;
  const fin = P.i + 1 >= n();
  bas.insertAdjacentHTML("afterbegin", `<div class="m-verdict ${ok ? "ok" : "ko"}">${ecouter ? ecoute(ecouter) : ""}<p>${texte}</p></div>`);
  const v = $(".m-valider", bas);
  if (v) v.innerHTML = `<button class="f-btn gros" data-m="suite">${fin ? "Voir la fin" : "Suivant"}</button>`;
  else bas.insertAdjacentHTML("beforeend", `<div class="m-valider"><button class="f-btn gros" data-m="suite">${fin ? "Voir la fin" : "Suivant"}</button></div>`);
  $('[data-m="suite"]', bas)?.focus({ preventScroll: true });
}
function camion(a) {
  const p = P;
  if (!p || p.attend) return;
  p.attend = true;
  const c = p.m.colis[p.i], ok = a === c.camion;
  const forme = `${c.camion.toLowerCase()} ${c.texte}`;
  document.querySelectorAll(".m-camion").forEach(b => { b.disabled = true; if (b.dataset.a === c.camion) b.classList.add("juste"); if (b.dataset.a === a && !ok) b.classList.add("faux"); });
  const colis = $(".m-colis");
  colis?.classList.add(ok ? "part" : "non");
  p.res.push(ok); barre(ok);
  if (ok) { bien(); vibrer(10); } else { pas(); vibrer([30, 40, 30]); p.rates.push({ forme, expl: c.expl }); }
  parler(forme);
  // Le camion part (et le colis glisse dedans), puis la ligne d'explication.
  plusTard(() => {
    $(".m-camions")?.classList.add("en-attente");
    $(".m-camions")?.remove();
    verdict(ok, ok ? `<b>✓</b> ${html(c.expl)}` : `<b>Pas ${a.toLowerCase()} : <i lang="es">${esc(forme)}</i>.</b> ${html(c.expl)}`, forme);
  }, calme() ? 0 : 450);
}
function ecrire() {
  const p = P, input = $("#m-pl");
  if (!p || p.attend || !input) return;
  const e = p.m.etiquettes[p.i - p.m.colis.length];
  const r = M.corrigerEtiquette(input.value, e.rep);
  if (!r) return input.focus();
  p.attend = true;
  input.disabled = true; input.classList.add(r.juste ? "ok" : "ko");
  input.blur();
  const forme = `${e.art} ${e.rep}`;
  p.res.push(r.juste); barre(r.juste);
  if (r.juste) { bien(); vibrer(10); } else { pas(); vibrer([30, 40, 30]); p.rates.push({ forme, expl: e.expl, tape: input.value.trim() }); }
  parler(forme);
  $(".m-valider")?.remove();
  verdict(r.juste, r.juste
    ? `<b>✓ <i lang="es">${esc(forme)}</i></b>${r.accent ? " · attention à l'accent" : ""} · ${html(e.expl)}`
    : `<b>Il fallait : <i lang="es">${esc(forme)}</i>.</b> ${html(e.expl)}`, forme);
}
function suite() {
  const p = P;
  if (!p || !p.attend) return;
  p.i++;
  if (p.i >= n()) return finir();
  if (p.m.forme === "lista") return ligne();
  if (p.m.forme === "duos") return poserDuo();
  const bas = $(".m-bas-jeu"); if (bas) bas.innerHTML = "";
  poser();
}

// Uno de dos : la phrase à trou, deux camions. Après le choix, les camions restent (le bon entouré), le mot va dans le trou,
// la voix lit la phrase complète, puis une ligne d'explication et « Suivant ». Le « ? » montre la règle du duo de la phrase,
// sans rien perdre : on reprend à la même phrase.
function poserDuo() {
  const p = P, q = $(".m-quai"), bas = $(".m-bas-jeu");
  if (!p || !q) return;
  ici();
  p.attend = false;
  const x = p.m.phrases[p.i];
  q.innerHTML = `<span class="m-duo">${esc(x.nomDuo)}</span>
    <div class="m-phrase">${ecoute(M.phraseComplete(x))}<p lang="es">${esc(x.avant)}<span class="m-trou">&nbsp;</span>${esc(x.apres)}</p>
      <small>${esc(x.fr)}</small>${x.nv ? `<span class="m-nuevo">nuevo · ${esc(x.nv)}</span>` : ""}</div>`;
  bas.innerHTML = `<div class="m-camions deux">${[x.a, x.b].map((t, k) => `<button class="m-camion ${k ? "b" : "a"}" data-m="duo" data-k="${k}" lang="es">${esc(t)}</button>`).join("")}</div>`;
}
function choisirDuo(k) {
  const p = P;
  if (!p || p.attend) return;
  p.attend = true;
  const x = p.m.phrases[p.i], ok = k === x.juste, bonne = M.phraseComplete(x);
  document.querySelectorAll(".m-camion").forEach(b => { b.disabled = true; const i = Number(b.dataset.k); if (i === x.juste) b.classList.add("juste"); if (i === k && !ok) b.classList.add("faux"); });
  const trou = $(".m-trou");
  if (trou) { trou.textContent = x.juste === 0 ? x.a : x.b; trou.classList.add(ok ? "ok" : "ko"); }
  p.res.push(ok); barre(ok);
  if (ok) { bien(); vibrer(10); } else { pas(); vibrer([30, 40, 30]); p.rates.push({ forme: bonne, expl: x.regle, tape: M.phraseComplete(x, k) }); }
  parler(bonne);
  const choisi = k === 0 ? x.a : x.b;
  const bas = $(".m-bas-jeu");
  bas?.insertAdjacentHTML("beforeend", `<div class="m-verdict ${ok ? "ok" : "ko"}"><p>${ok ? "<b>✓</b> " : `<b>Pas <i lang="es">${esc(choisi)}</i>.</b> `}${html(x.regle)}</p></div>
    <div class="m-valider"><button class="f-btn gros" data-m="suite">${p.i + 1 >= n() ? "Voir la fin" : "Suivant"}</button></div>`);
  $('[data-m="suite"]', bas)?.focus({ preventScroll: true });
}
// Le « ? » : la règle du duo de la phrase en cours, par-dessus ; « Reprendre » la referme.
function montrerRegle() {
  const p = P, x = p?.m.phrases?.[p.i];
  if (!x) return;
  const vieux = $(".m-voile");
  if (vieux) return vieux.remove();
  $(".m-partie")?.insertAdjacentHTML("beforeend", `<div class="m-voile" role="dialog" aria-label="La règle">${carteRegle(DUO[x.duo])}<button class="f-btn gros" data-m="reprendre">Reprendre</button></div>`);
}

// La lista de Blanca : les lignes faites restent écrites (juste en vert, la correction à côté de l'erreur barrée).
function ligne() {
  const p = P, box = $(".m-lignes");
  if (!p || !box) return;
  ici();
  p.attend = false;
  box.innerHTML = p.m.lignes.map((l, k) => {
    const mot = `${esc(l.n.mot)}${l.nouveau ? ` <span class="m-nuevo">nuevo</span><small class="m-sens">${esc(J.court(l.n.fr))}</small>` : ""}`;
    if (k < p.i) {
      const r = p.lignesFaites[k];
      return `<div class="m-ligne ${r.juste ? "m-fait" : "m-rate"}"><span class="m-q">${r.juste ? "✓" : "✗"}</span><span class="m-n">${r.juste ? "" : `<s>${esc(r.tape)}</s><span class="m-fleche">→</span>`}<span lang="es">${esc(l.rep)}</span></span></div>`;
    }
    if (k === p.i) return `<div class="m-ligne m-ici"><span class="m-q">${l.q}</span><span class="m-n"><span lang="es">${mot}</span>
      <form data-m="form"><input id="m-li" lang="es" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${l.q === 1 ? "un… / una…" : "en lettres…"}"></form></span></div>`;
    return `<div class="m-ligne"><span class="m-q">${l.q}</span><span class="m-n" lang="es">${mot}</span></div>`;
  }).join("");
  const l = p.m.lignes[p.i];
  if (l?.nouveau) plusTard(() => parler(`${l.n.art} ${l.n.mot}`), 350);
  const b = $('[data-m="noter"]'); if (b) b.textContent = "C'est noté";
  const champ = $("#m-li");
  champ?.focus({ preventScroll: true });
  champ?.closest(".m-ligne")?.scrollIntoView({ block: "center", behavior: calme() ? "auto" : "smooth" });
}
function noter() {
  const p = P;
  if (!p) return;
  if (p.attend) return suite();
  const input = $("#m-li"), l = p.m.lignes[p.i], v = $(".m-verdict-l");
  if (!input || !l) return;
  const r = M.corrigerLigne(input.value, l);
  if (!r) return input.focus();
  if (r.redemande) { if (v) v.innerHTML = `<div class="m-verdict"><p>Écris <i>un</i> ou <i>una</i> en lettres : c'est là que le genre se voit.</p></div>`; return input.focus(); }
  p.attend = true;
  p.lignesFaites ||= [];
  p.lignesFaites[p.i] = { juste: r.juste, tape: input.value.trim() };
  p.res.push(r.juste); barre(r.juste);
  if (r.juste) { bien(); vibrer(10); } else { pas(); vibrer([30, 40, 30]); p.rates.push({ forme: l.rep, expl: l.expl, tape: input.value.trim() }); }
  parler(l.rep);
  input.blur();
  const rappel = [r.chiffre ? `en lettres : <i>${esc(l.rep.split(" ")[0])}</i>` : "", r.accent ? "attention à l'accent" : ""].filter(Boolean).join(" · ");
  if (v) v.innerHTML = `<div class="m-verdict ${r.juste ? "ok" : "ko"}">${ecoute(l.rep)}<p>${r.juste ? `<b>✓ <i lang="es">${esc(l.rep)}</i></b>${rappel ? ` · ${rappel}` : ""} · ${html(l.expl)}` : `<b>Il fallait : <i lang="es">${esc(l.rep)}</i>.</b> ${html(l.expl)}`}</p></div>`;
  // La ligne s'écrit tout de suite sur le pense-bête ; « Suivant » passe à la ligne d'après.
  const ligneEl = $(".m-ligne.m-ici");
  if (ligneEl) { ligneEl.classList.remove("m-ici"); ligneEl.classList.add(r.juste ? "m-fait" : "m-rate"); ligneEl.innerHTML = `<span class="m-q">${r.juste ? "✓" : "✗"}</span><span class="m-n">${r.juste ? "" : `<s>${esc(input.value.trim())}</s><span class="m-fleche">→</span>`}<span lang="es">${esc(l.rep)}</span></span>`; }
  v?.scrollIntoView({ block: "nearest" });
  const b = $('[data-m="noter"]'); if (b) { b.textContent = p.i + 1 >= n() ? "Voir la fin" : "Suivant"; b.focus({ preventScroll: true }); }
}

// ——— la fin ———
function finir() {
  const p = P;
  if (!p) return;
  const ok = p.res.filter(Boolean).length, sur = n();
  let ampoule = false;
  if (!p.rejoue) {
    const r = M.apresMission(jeux(), { forme: p.m.forme, ok, sur, cles: p.m.forme === "duos" ? p.m.cles : p.m.mots.map(x => x.cle), regles: p.m.duos || [] }, p.ctx.jour);
    garderJeux(r.jeux);
    ampoule = r.ampoule;
  } else if (p.m.duos) garderJeux(M.apresMission(jeux(), { forme: p.m.forme, ok, sur, regles: p.m.duos }, p.ctx.jour).jeux);
  derniere = { forme: p.m.forme, ok, sur, rates: p.rates, rejoue: p.rejoue, ampoule, jour: p.ctx.jour,
    nouveaux: p.m.mots.filter(x => !x.vu && !apprisEnAvance(x.id)), gardes: new Set() };
  arreter();
  location.replace("#/jeux/mision/fin");
}
function nouveauxFin(g) {
  if (!g.nouveaux.length) return "";
  const reste = J.gardesRestants(jeux(), g.jour);
  const ligne = (x, k) => {
    const action = g.gardes.has(k) ? `<span class="d-vu ok">Gardé ✓</span>`
      : apprisEnAvance(x.id) ? `<span class="d-vu ok">Déjà gardé</span>`
      : reste > 0 ? `<button class="d-garder" data-m="garder" data-v="${k}">Je le garde</button>` : `<span class="d-vu">demain</span>`;
    return `<li>${ecoute(`${x.art} ${x.mot}`)}<div><b lang="es">${esc(`${x.art} ${x.mot}`)}</b><span>${esc(J.court(x.fr))} · arrive en ${esc(x.lecon)}</span></div>${action}</li>`;
  };
  return `<div class="m-nouveaux"><h2>Les mots nouveaux de la mission</h2><ul class="d-liste">${g.nouveaux.map(ligne).join("")}</ul>
    <p class="f-note">${reste > 0 ? `Tu peux encore garder ${reste} mot${reste > 1 ? "s" : ""} aujourd'hui (${J.GARDES_PAR_JOUR} par jour, tous jeux confondus). Un mot gardé revient dès demain dans « Tes cartes à revoir ».` : `Tu as gardé ${J.GARDES_PAR_JOUR} mots aujourd'hui : les autres attendront demain.`}</p></div>`;
}
function garderMot(k) {
  const g = derniere, x = g?.nouveaux[k];
  if (!x || g.gardes.has(k) || J.gardesRestants(jeux(), g.jour) <= 0) return;
  apprendreEnAvance(x.id, g.jour);
  garderJeux(J.garderSurprise(jeux(), g.jour));
  g.gardes.add(k);
  vibrer(12);
  const bloc = $(".m-nouveaux");
  if (bloc) bloc.outerHTML = nouveauxFin(g);
}
function vueFin() {
  const g = derniere, tout = g.ok === g.sur;
  const titre = g.rejoue ? "Mission rejouée." : tout ? "¡Misión perfecta!" : g.ok * 2 >= g.sur ? "¡Misión cumplida!" : "La próxima, mejor.";
  const unite = g.forme === "lista" ? "ligne" : "colis";
  const rates = g.rates.length ? `<div class="f-rates m-rates"><h2>À retenir</h2><ul>${g.rates.map(r =>
    `<li><div><b lang="es">${esc(r.forme)}</b>${r.tape ? `<s lang="es">${esc(r.tape)}</s>` : ""}<span>${html(r.expl)}</span></div><button data-dire="${esc(r.forme)}" aria-label="Écouter : ${esc(r.forme)}" aria-pressed="false">${ICONES.play}</button></li>`).join("")}</ul></div>` : "";
  return {
    onglet: null,
    html: `<div class="feria f-fin m-fin"><div class="f-corps">
        <div class="f-podium">${flamme(tout && !g.rejoue ? "joie" : "idle", tout && !g.rejoue ? 3 : 1)}<div><h1>${titre}</h1><p>${NOMS[g.forme]}</p></div></div>
        <div class="c-total"><b>${g.ok}/${g.sur}</b><span>${g.forme === "lista" ? `ligne${g.ok > 1 ? "s" : ""} juste${g.ok > 1 ? "s" : ""}` : g.forme === "duos" ? `phrase${g.ok > 1 ? "s" : ""} juste${g.ok > 1 ? "s" : ""}` : `${unite} bien livré${g.ok > 1 ? "s" : ""}`} du premier coup.<br>Pas de points ici : juste ${g.forme === "duos" ? "les réflexes" : "les mots"}.</span></div>
        ${g.rejoue ? "" : `<div class="c-ampoule"><i></i><div><b>${g.ampoule ? "L'ampoule d'aujourd'hui s'allume." : "L'ampoule d'aujourd'hui était déjà allumée."}</b><br>Une autre mission demain.</div></div>`}
        ${rates}
        ${nouveauxFin(g)}
      </div><div class="f-bas"><a class="f-btn gros" href="#/jeux" data-remplace>Retour à la Feria</a><a class="f-retour" href="#/jeux/mision/partie" data-remplace>La rejouer</a></div></div>`,
    apres: () => { brancher(); if (!calme() && !g.rejoue) [0, 4, 7].forEach((k, i) => note(523.25 * Math.pow(2, k / 12), i * .12, .45, .07)); },
  };
}

// ——— les touchers (« écouter » et les liens : app.js) ———
function brancher() {
  document.querySelector('meta[name="theme-color"]').content = "#F7B91C";
  const racine = $(".feria");
  racine?.addEventListener("click", e => {
    const b = e.target.closest("[data-m]");
    if (!b || b.tagName === "FORM") return;
    const quoi = b.dataset.m;
    if (quoi === "camion") return camion(b.dataset.a);
    if (quoi === "duo") return choisirDuo(Number(b.dataset.k));
    if (quoi === "regle" || quoi === "reprendre") return montrerRegle();
    if (quoi === "ecrire") return ecrire();
    if (quoi === "suite") return suite();
    if (quoi === "noter") return noter();
    if (quoi === "garder") return garderMot(Number(b.dataset.v));
    if (quoi === "muet") {
      garderJeux({ ...jeux(), muet: !jeux().muet });
      if (jeux().muet) taire();
      b.outerHTML = boutonMuet();
    }
  });
  // « Entrée » sur le clavier : valider, puis passer à la suite.
  racine?.addEventListener("submit", e => {
    e.preventDefault();
    if (!P) return;
    if (P.m.forme === "lista") return noter();
    return P.attend ? suite() : ecrire();
  });
}

export function ecranMision(ctx, etape) {
  arreter();
  if (etape === "partie") return vuePartie(ctx);
  if (etape === "fin" && derniere) return vueFin();
  return vuePret(ctx);
}
