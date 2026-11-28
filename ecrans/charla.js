// La Charla, le défi du jour de la Feria : une petite conversation en espagnol avec quelqu'un de Huesca.
//   #/jeux/charla               l'accueil : la charla du jour et les anciennes, à rejouer
//   #/jeux/charla/partie        la charla du jour (un seul essai : elle allume l'ampoule) ; déjà faite, elle se rejoue sans score
//   #/jeux/charla/partie/<id>   une ancienne, rejouée sans score
//   #/jeux/charla/fin           « 3/4 réponses justes du premier coup », ce qu'il fallait répondre
//   #/jeux/charla/relire        pour Blanca : toutes les conversations à relire, bloc par bloc (en espagnol)
// À chaque message de la personne : 3 réponses (la juste, un piège, une pour rire). Bonne réponse : elle part, la voix la lit,
// puis la conversation attend : « Dis-la » (le micro) ou « Suivant ». Erreur : la personne réagit, une ligne en français
// explique, puis « Dis la bonne réponse » ou « Continuer ». Pas de chrono, pas de points.
// Le micro : la reconnaissance vocale du téléphone (es-ES), indulgente, jamais bloquante, hors du score. Sans elle :
// on s'enregistre (enregistrement.js) et on réécoute le modèle puis sa voix. Les mots de la personne se touchent (bulle.js),
// jamais ceux des réponses : la bulle donnerait la réponse.
// Le moteur (choix du jour, réponses, ampoule) est dans charla.js ; les conversations dans charlas/.

import { esc, ICONES, barreOnglets, id } from "../ui.js?v=86";
import { LECONS } from "../position.js?v=86";
import { phraseTouchable } from "../toucher.js?v=86";
import { etatJeux, garderJeux } from "../progression.js?v=86";
import { dire, taire } from "../voix.js?v=86";
import { demarrerEnregistrement, arreterEnregistrement, reecouterEnregistrement, effacerEnregistrement, enregistrementEnCours } from "../enregistrement.js?v=86";
import { chispa } from "../mascotte.js?v=86";
import * as J from "../jeux.js?v=86";
import * as C from "../charla.js?v=86";
import { CHARLAS, TROUPE, BLOCS } from "../charlas/index.js?v=86";

const $ = (s, r = document) => r.querySelector(s);
const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const jeux = () => ({ ...J.JEUX_VIDE(), ...etatJeux() });
const flamme = (humeur, taille) => chispa(humeur, taille, J.etape(J.attrapes(jeux())).i);
const perso = c => C.persoDe(c, TROUPE);
const RANG = Object.fromEntries(LECONS.map((l, i) => [l.id, i]));
// L'explication d'un piège : du texte, avec seulement <i>…</i> pour les mots espagnols.
const expl = t => esc(t).replace(/&lt;(\/?)i&gt;/g, "<$1i>");
let jour = "";        // la date du jour (ctx.jour), pour la case « relue »
let P = null, derniere = null, minuteurs = [], suivi = null, coupe = null;
let reco = null, recoKo = false;
const plusTard = (f, ms) => minuteurs.push(setTimeout(f, ms));
function arreter() {
  minuteurs.forEach(clearTimeout); minuteurs = [];
  suivi?.disconnect(); suivi = null;
  coupe?.abort(); coupe = null;
  if (P) P.attente = null;
  arreterMicro();
  P = null;
  taire();
}

const svg = corps => `<svg viewBox="0 0 24 24" aria-hidden="true">${corps}</svg>`;
const I = {
  son: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'),
  muet: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM17 9.5l5 5M22 9.5l-5 5"/>'),
  micro: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
};
const boutonMuet = () => `<button class="f-rond" data-k="muet" aria-label="${jeux().muet ? "Remettre le son" : "Couper le son"}" aria-pressed="${jeux().muet}">${jeux().muet ? I.muet : I.son}</button>`;
// Le petit portrait de la personne : un rond de la couleur de ses habits, son visage.
const avatar = ([habit, peau], cls = "c-av") => `<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="${habit}"/><circle cx="32" cy="27" r="13" fill="${peau}"/><path d="M10 56c4-11 12-16 22-16s18 5 22 16" fill="${peau}"/><circle cx="27" cy="26" r="1.9" fill="#13294B"/><circle cx="37" cy="26" r="1.9" fill="#13294B"/><path d="M27 32q5 4 10 0" fill="none" stroke="#13294B" stroke-width="2" stroke-linecap="round"/></svg>`;

// ——— la voix et les sons : tout se tait avec le bouton muet de la Feria ———
// fin : appelé quand la voix a fini (ou tout de suite si elle se tait), pour éteindre le ▶ du message lu.
function parler(texte, { lent = false, fin } = {}) {
  if (jeux().muet || !dire(C.pourLaVoix(texte), { lent, fin })) fin?.();
}
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
const ding = () => note(880, 0, .12, .06, "triangle");

// ——— la charla du jour ———
function duJour(ctx) {
  return C.charlaDuJour(CHARLAS, { faites: ctx.pos.faites, unite: ctx.pos.derniere?.unite?.n, etat: jeux().charla }, ctx.jour);
}
// La première conversation du livre (pour dire quand le stand s'ouvre).
const premiere = () => [...CHARLAS].sort((a, b) => (RANG[a.lecon] ?? 1e6) - (RANG[b.lecon] ?? 1e6))[0] || null;
const nEchanges = c => `${c.echanges.length} échanges`;

// La carte du jour, en tête de la salle (ecrans/jeux.js) : le visage de la personne, qui t'attend, et ce que ça allume.
export function standCharla(ctx) {
  const d = duJour(ctx);
  if (!d) {
    const p = premiere();
    return `<div class="s-jour attend"><span class="s-picto-jour" aria-hidden="true"></span><div><small>Le défi du jour</small><b>La Charla</b><span>${p ? `S'ouvre avec la leçon ${esc(p.lecon)}` : "Les conversations sont en cours d'écriture"}</span></div></div>`;
  }
  const qui = perso(d.charla);
  if (d.faite) return `<a class="s-jour faite" href="#/jeux/charla">${avatar(qui.couleur, "s-av")}<div><small>Charla faite · ${d.faite.ok}/${d.faite.sur}</small><b>${esc(qui.nom)}, ¡hasta mañana!</b><span>La prochaine arrive demain</span></div><em>Revoir</em></a>`;
  return `<a class="s-jour" href="#/jeux/charla">${avatar(qui.couleur, "s-av")}<div><small>La charla de hoy</small><b>${esc(qui.nom)} t'attend</b><span>${esc(d.charla.lieu)} · ${d.plusDeNouvelle ? "une ancienne, d'autres pièges" : (jeux().jours || []).includes(ctx.jour) ? "l'ampoule est déjà allumée" : "allume l'ampoule"}</span></div><em>Hablar</em></a>`;
}

// ——— l'accueil ———
function vuePret(ctx) {
  const d = duJour(ctx);
  const anciennes = C.anciennes(CHARLAS, jeux().charla, d?.charla.id);
  let jour;
  if (!d) {
    const p = premiere();
    jour = `<div class="f-attente"><b>Pas encore de charla.</b> ${p ? `La première arrive avec la leçon ${id(p.lecon)} : ${esc(perso(p).nom)}, ${esc(p.lieu)}.` : "Les conversations sont en cours d'écriture."}</div>`;
  } else {
    const c = d.charla, q = perso(c);
    jour = `<div class="c-jour${d.faite ? " faite" : ""}">${avatar(q.couleur)}<div><small>${d.faite ? `Faite aujourd'hui · ${d.faite.ok} sur ${d.faite.sur}` : "La charla de hoy"}</small><b>${esc(q.nom)}</b><span>${esc(c.lieu)} · ${nEchanges(c)}</span></div></div>
      ${d.plusDeNouvelle ? `<p class="c-plus">Plus de nouvelle charla pour ton niveau : en voici une ancienne, avec d'autres pièges. Les prochaines arrivent avec tes leçons.</p>` : ""}`;
  }
  const liste = anciennes.length ? `<h2 class="c-h2">Les anciennes, pour rejouer</h2>
    <div class="c-anciennes">${anciennes.map(a => { const q = perso(a.charla); return `<a href="#/jeux/charla/partie/${esc(a.charla.id)}">${avatar(q.couleur)}<span>${esc(q.nom)}<small>${esc(a.charla.lieu)}</small></span><em>${a.ok}/${a.sur}</em></a>`; }).join("")}</div>` : "";
  const bas = !d ? `<a class="f-btn gros" href="#/jeux">Retour à la Feria</a>`
    : d.faite ? `<a class="f-btn gros" href="#/jeux/charla/partie">La rejouer</a><small>Sans score : la charla du jour est déjà faite. À demain !</small>`
    : `<a class="f-btn gros" href="#/jeux/charla/partie">¡Hola!</a><small>Un seul essai : elle allume l'ampoule du jour.</small>`;
  return {
    onglet: null,
    html: `<div class="feria c-pret">
        <div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1>La Charla</h1></div>
        <p class="f-regle">Une petite conversation en espagnol avec quelqu'un de Huesca. <b>Choisis ta réponse</b>, puis dis-la à voix haute. Pas de chrono : prends ton temps.</p>
        ${jour}${liste}
        <a class="c-lien" href="#/jeux/charla/relire">Les conversations à relire, pour Blanca</a>
        <div class="c-bas">${bas}</div>
      </div>`,
    apres: brancher,
  };
}

// ——— la conversation : une messagerie aux couleurs de la Feria ———
function vueChat(ctx, idRejoue) {
  const d = duJour(ctx);
  let c = null, rejoue = true;
  if (idRejoue) c = C.debloquees(CHARLAS, ctx.pos.faites).find(x => x.id === idRejoue) || null;
  else if (d) { c = d.charla; rejoue = !!d.faite; }
  if (!c) return vuePret(ctx);
  const q = perso(c);
  return {
    onglet: null,
    html: `<div class="feria c-chat">
        <div class="c-haut"><a class="f-rond" href="#/jeux/charla" data-arriere aria-label="Arrêter">${ICONES.fermer}</a>${avatar(q.couleur)}<div><b>${esc(q.nom)}</b><span>${esc(c.lieu)}</span></div>${boutonMuet()}</div>
        <div class="c-etapes">${c.echanges.map(() => "<i></i>").join("")}</div>
        <div class="c-fil" aria-live="polite"></div>
        <div class="c-reponses"></div>
      </div>`,
    apres: () => { brancher(); lancer(ctx, c, rejoue, !idRejoue && !!d?.plusDeNouvelle); },
  };
}

function lancer(ctx, c, rejoue, ancienne) {
  P = { ctx, c, rejoue, ancienne, i: 0, ok: 0, rates: [], choix: null, attente: null };
  // Quand les réponses (ou les boutons) apparaissent, le bas grandit : le fil redescend pour ne rien cacher.
  suivi = new ResizeObserver(() => { const f = $(".c-fil"); if (f) f.scrollTop = f.scrollHeight; });
  suivi.observe($(".c-reponses"));
  // On quitte l'écran (retour, autre onglet) : tout s'arrête, le micro se referme.
  coupe = new AbortController();
  addEventListener("hashchange", arreter, { signal: coupe.signal, once: true });
  ecrit(message);
}
function ajoute(html) {
  const f = $(".c-fil");
  if (!f) return;
  f.insertAdjacentHTML("beforeend", html);
  f.scrollTop = f.scrollHeight;
}
const reponses = html => { const r = $(".c-reponses"); if (r) r.innerHTML = html; };
// « … » : la personne écrit, puis son message arrive.
function ecrit(puis, ms = 900) {
  ajoute(`<div class="c-ecrit" aria-label="écrit…"><i></i><i></i><i></i></div>`);
  plusTard(() => { $(".c-ecrit")?.remove(); puis(); }, calme() ? 200 : ms);
}
// Le message de la personne : ses mots se touchent (la bulle de l'appli). Le ▶ s'allume tant que la voix le lit.
function bulleLui(texte) {
  ajoute(`<div class="c-msg lui">${phraseTouchable(P.ctx, texte)}<button class="c-ecoute" data-k="ecoute" data-t="${esc(texte)}" aria-label="Écouter">${ICONES.play}</button></div>`);
  ding();
  lire([...document.querySelectorAll(".c-msg.lui .c-ecoute")].pop());
}
function lire(b) {
  if (!b) return;
  document.querySelectorAll(".c-ecoute.parle").forEach(x => x.classList.remove("parle"));
  b.classList.add("parle");
  parler(b.dataset.t, { fin: () => b.classList.remove("parle") });
}
function message() {
  const e = P.c.echanges[P.i];
  document.querySelectorAll(".c-etapes i")[P.i]?.classList.add("ici");
  bulleLui(e.lui);
  P.choix = C.reponses(e);
  plusTard(() => reponses(`<small>Ta réponse :</small>${P.choix.map((x, k) => `<button class="c-rep" data-k="rep" data-i="${k}" lang="es">${esc(x.t)}</button>`).join("")}`), 600);
}
function repondre(k) {
  const p = P;
  if (!p?.choix) return;
  const e = p.c.echanges[p.i], x = p.choix[k], juste = x.sorte === "ok";
  p.choix = null;
  reponses("");
  ajoute(`<div class="c-msg moi${juste ? "" : " faux"}" lang="es">${esc(x.t)}</div>`);
  const barre = document.querySelectorAll(".c-etapes i")[p.i];
  barre?.classList.remove("ici"); barre?.classList.add(juste ? "ok" : "ko");
  if (juste) {
    p.ok++; parler(x.t);
    p.attente = { phrase: e.ok, puis: () => ecrit(() => { bulleLui(e.suite); plusTard(suivant, 1600); }) };
    plusTard(actions, 700);
  } else {
    p.rates.push({ ok: e.ok, choisi: x.t, expl: x.expl });
    note(220, 0, .2, .06);
    p.attente = { phrase: e.ok, bonne: true, puis: suivant };
    plusTard(() => ecrit(() => {
      bulleLui(x.reaction);
      plusTard(() => ajoute(`<p class="c-note">${expl(x.expl)}<br>Il fallait : <i lang="es">${esc(e.ok)}</i></p>`), 700);
      plusTard(actions, 1100);
    }, 700), 300);
  }
}
// Pas de chrono : la conversation attend que tu dises la phrase (ou que tu passes).
// La phrase à dire n'est pas touchable : c'est ta réponse.
function actions(ecoute = false) {
  const a = P?.attente;
  if (!a) return; // déjà passé à la suite
  reponses(`<p class="c-vise">${a.bonne ? "Dis la bonne réponse" : "À toi de la dire"} : <b lang="es">${esc(a.phrase)}</b></p>
    <div class="c-actions"><button class="c-micro${ecoute ? " ecoute" : ""}" data-k="micro">${I.micro}${ecoute ? (enregistrementEnCours() ? "Je t'enregistre… touche pour finir" : "J'écoute…") : a.dit ? "Redis-la" : "Dis-la"}</button><button class="c-passer" data-k="passer">${a.bonne ? "Continuer" : "Suivant"}</button></div>`);
}
function passer() {
  const a = P?.attente;
  if (!a) return;
  P.attente = null;
  arreterMicro();
  reponses("");
  a.puis();
}
function suivant() {
  const p = P;
  if (!p) return;
  p.i++;
  if (p.i >= p.c.echanges.length) return plusTard(finir, 600);
  ecrit(message);
}

// ——— le micro : la reconnaissance vocale (indulgente, jamais bloquante), sinon un enregistrement ———
const Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
function micro() {
  const a = P?.attente;
  if (!a) return;
  if (reco) { try { reco.stop(); } catch { /* déjà arrêtée */ } return; }  // toucher pendant l'écoute : on finit
  if (enregistrementEnCours()) return enregistrer(a);                       // toucher pendant l'enregistrement : on finit
  taire();
  if (!Reco || recoKo) return enregistrer(a);
  const r = new Reco();
  r.lang = "es-ES"; r.interimResults = false; r.maxAlternatives = 3;
  reco = r;
  let fini = false;
  // Passé à la suite entre-temps : le micro ne dit plus rien.
  const encore = () => P?.attente === a;
  r.onresult = ev => {
    fini = true;
    if (!encore()) return;
    montrerCompris(a, new Set([...ev.results[0]].flatMap(x => C.mots(x.transcript))));
  };
  r.onerror = ev => {
    if (fini) return;
    fini = true;
    if (!encore() || ev.error === "aborted") return;
    if (ev.error === "no-speech") return montrerCompris(a, null);
    // Pas de réseau, refus, pas de micro… : on passe à l'enregistrement, pour toute la suite.
    recoKo = true; reco = null; enregistrer(a);
  };
  r.onend = () => { if (reco === r) reco = null; if (encore() && !fini) montrerCompris(a, null); };
  try { r.start(); actions(true); } catch { reco = null; recoKo = true; enregistrer(a); }
}
// Les mots de la phrase, en vert s'ils ont été compris. Jamais de note, jamais de blocage.
function montrerCompris(a, entendus) {
  if (P?.attente !== a) return;
  a.dit = true;
  if (!entendus) ajoute(`<div class="c-compris rien">Je n'ai rien entendu. Rapproche le téléphone, et réessaie.</div>`);
  else {
    const x = C.compris(a.phrase, entendus);
    ajoute(`<div class="c-compris"><small>${x.n === x.sur ? "¡Perfecto! Tout est compris." : `${x.n} mot${x.n > 1 ? "s" : ""} sur ${x.sur} compris`}</small>${x.liste.map(m => `<span class="${m.oui ? "oui" : ""}" lang="es">${esc(m.w)}</span>`).join(" ")}</div>`);
    if (x.n === x.sur) note(988, 0, .15, .06, "triangle");
  }
  actions();
}
// Sans reconnaissance : toucher pour s'enregistrer, toucher pour finir, puis le modèle (lentement) et ta voix.
// Rien n'est envoyé ; l'enregistrement est effacé à la phrase suivante.
async function enregistrer(a) {
  if (enregistrementEnCours()) {
    const ok = await arreterEnregistrement(true);
    if (P?.attente !== a) return;
    a.dit = true;
    if (ok) {
      ajoute(`<div class="c-compris"><small>Écoute le modèle, puis ta voix</small><span class="oui" lang="es">${esc(a.phrase)}</span></div>`);
      parler(a.phrase, { lent: true, fin: () => { if (P?.attente === a) reecouterEnregistrement(); } });
    } else ajoute(`<div class="c-compris rien">Je n'ai rien enregistré. Touche « Dis-la » et parle, puis touche encore pour finir.</div>`);
    return actions();
  }
  const ok = await demarrerEnregistrement();
  // Passé à la suite pendant que le téléphone ouvrait le micro : on le referme aussitôt.
  if (P?.attente !== a) { effacerEnregistrement(); return; }
  if (!ok) { a.dit = true; ajoute(`<div class="c-compris rien">Le micro n'est pas disponible. Dis-la quand même à voix haute !</div>`); return actions(); }
  actions(true);
}
function arreterMicro() {
  if (reco) { const r = reco; reco = null; try { r.abort(); } catch { /* déjà arrêtée */ } }
  effacerEnregistrement();
}

// ——— la fin ———
function finir() {
  const p = P;
  if (!p) return;
  const sur = p.c.echanges.length;
  let ampoule = false;
  if (!p.rejoue) {
    const r = C.apresCharla(jeux(), { id: p.c.id, ok: p.ok, sur, ancienne: p.ancienne }, p.ctx.jour);
    garderJeux(r.jeux);
    ampoule = r.ampoule;
  }
  derniere = { c: p.c, ok: p.ok, sur, rates: p.rates, rejoue: p.rejoue, ampoule };
  arreter();
  location.replace("#/jeux/charla/fin");
}
function vueFin() {
  const g = derniere, q = perso(g.c), n = g.ok, tout = n === g.sur;
  const titre = g.rejoue ? "Charla rejouée." : tout ? "¡Charla perfecta!" : n * 2 >= g.sur ? "¡Charla conseguida!" : "La próxima, mejor.";
  const rates = g.rates.length ? `<div class="f-rates c-rates"><h2>${g.rejoue ? "Ce qui t'a échappé cette fois" : "Ce qu'il fallait répondre"}</h2><ul>${g.rates.map(r =>
    `<li><div><b lang="es">${esc(r.ok)}</b><s lang="es">${esc(r.choisi)}</s><span>${expl(r.expl)}</span></div><button data-dire="${esc(C.pourLaVoix(r.ok))}" aria-label="Écouter : ${esc(r.ok)}" aria-pressed="false">${ICONES.play}</button></li>`).join("")}</ul></div>` : "";
  return {
    onglet: null,
    html: `<div class="feria f-fin c-fin"><div class="f-corps">
        <div class="f-podium">${flamme(tout && !g.rejoue ? "joie" : "idle", tout && !g.rejoue ? 3 : 1)}<div><h1>${titre}</h1><p>avec ${esc(q.nom)}, ${esc(g.c.lieu)}</p></div></div>
        ${g.rejoue ? "" : `<div class="c-total"><b>${n}/${g.sur}</b><span>réponse${n > 1 ? "s" : ""} juste${n > 1 ? "s" : ""} du premier coup.<br>Pas de points ici : juste la conversation.</span></div>
        <div class="c-ampoule"><i></i><div><b>${g.ampoule ? "L'ampoule d'aujourd'hui s'allume." : "L'ampoule d'aujourd'hui était déjà allumée."}</b><br>Prochaine charla demain.</div></div>`}
        ${rates}
      </div><div class="f-bas"><a class="f-btn gros" href="#/jeux" data-remplace>Retour à la Feria</a><a class="f-retour" href="#/jeux/charla" data-remplace>Les autres charlas</a></div></div>`,
    apres: () => { brancher(); if (!calme()) [0, 4, 7].forEach((k, i) => note(523.25 * Math.pow(2, k / 12), i * .12, .45, .07)); },
  };
}

// ——— pour Blanca : toutes les conversations à relire, en espagnol ———
function vueRelire(ctx) {
  const relues = jeux().charla?.relues || {};
  const n = ctx.pos.derniere?.unite?.n || 1;
  const b0 = BLOCS.findIndex(b => n >= b.de && n <= b.a);
  // D'abord le bloc de Kevin et le suivant, puis les autres dans l'ordre.
  const ordre = b0 < 0 ? BLOCS : [BLOCS[b0], BLOCS[b0 + 1], ...BLOCS.filter((_, i) => i !== b0 && i !== b0 + 1)].filter(Boolean);
  const reps = (cls, lettre, liste) => liste.map(([t, r, e]) => `<p class="${cls}"><em>${lettre}</em><span lang="es">${esc(t)}<small>→ <span lang="es">${esc(r)}</span><br><span lang="fr">${expl(e)}</span></small></span></p>`).join("");
  const carte = c => {
    const q = perso(c), ok = !!relues[c.id];
    return `<article class="c-carte${ok ? " relue" : ""}">
      <header>${avatar(q.couleur)}<div><b>${esc(q.nom)}</b><small>${esc(c.lieu)} · ${esc(c.lecon)}</small></div></header>
      <ol>${c.echanges.map(e => `<li>
        <p class="c-r-lui" lang="es">${esc(e.lui)}</p>
        <p class="c-r-ok"><em>✓</em><span lang="es">${esc(e.ok)}</span></p>
        ${reps("c-r-piege", "✗", e.pieges)}${reps("c-r-rire", "☺", e.rires)}
        <p class="c-r-lui suite" lang="es">${esc(e.suite)}</p></li>`).join("")}</ol>
      <button class="c-relue" data-k="relue" data-id="${esc(c.id)}" aria-pressed="${ok}">${ok ? `${ICONES.coche}Revisada` : "Marcar como revisada"}</button>
    </article>`;
  };
  const bloc = (b, i) => {
    const nb = b.charlas.filter(c => relues[c.id]).length;
    return `<section class="c-bloc"><h2>Unidades ${b.de} a ${b.a}${i === 0 && b0 >= 0 ? " · <span>el nivel de Kevin</span>" : ""}</h2>
      <p class="c-compte">${b.charlas.length ? `${nb} de ${b.charlas.length} revisada${b.charlas.length > 1 ? "s" : ""}` : "Todavía no hay conversaciones."}</p>
      ${b.charlas.map(carte).join("")}</section>`;
  };
  return {
    onglet: "jeux",
    html: `<div class="feria f-page c-relire" lang="es">
        <div class="f-tete"><a class="f-rond" href="#/jeux/charla" aria-label="Volver">${ICONES.retour}</a><h1>Las charlas</h1></div>
        <p class="f-note"><b>Para Blanca.</b> Pequeñas conversaciones para Kevin, con las palabras de su libro. En cada mensaje elige entre tres respuestas: <b>✓</b> la buena, <b>✗</b> una trampa (casi bien) y <b>☺</b> una para reír. Si algo no suena a español de España, díselo a Kevin. Cuando hayas leído una, márcala como revisada.</p>
        ${ordre.map(bloc).join("")}
      </div>${barreOnglets("jeux")}`,
    apres: brancher,
  };
}

// ——— les touchers propres à la Charla (les mots touchés, « écouter » de la fin et les liens : app.js) ———
function brancher() {
  document.querySelector('meta[name="theme-color"]').content = "#F7B91C";
  const racine = $(".feria");
  racine?.addEventListener("click", e => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    const quoi = b.dataset.k;
    if (quoi === "rep") return repondre(Number(b.dataset.i));
    if (quoi === "ecoute") return lire(b);
    if (quoi === "micro") return micro();
    if (quoi === "passer") return passer();
    if (quoi === "muet") {
      garderJeux({ ...jeux(), muet: !jeux().muet });
      if (jeux().muet) { taire(); document.querySelectorAll(".c-ecoute.parle").forEach(x => x.classList.remove("parle")); }
      b.outerHTML = boutonMuet();
      return;
    }
    if (quoi === "relue") {
      const oui = b.getAttribute("aria-pressed") !== "true";
      garderJeux(C.relire(jeux(), b.dataset.id, oui, jour));
      b.setAttribute("aria-pressed", String(oui));
      b.innerHTML = oui ? `${ICONES.coche}Revisada` : "Marcar como revisada";
      b.closest(".c-carte").classList.toggle("relue", oui);
      const s = b.closest(".c-bloc"), tous = s.querySelectorAll(".c-carte"), nb = s.querySelectorAll(".c-carte.relue").length;
      s.querySelector(".c-compte").textContent = `${nb} de ${tous.length} revisada${tous.length > 1 ? "s" : ""}`;
    }
  });
}

export function ecranCharla(ctx, etape, idRejoue) {
  arreter();
  jour = ctx.jour;
  if (etape === "partie") return vueChat(ctx, idRejoue);
  if (etape === "fin" && derniere) return vueFin();
  if (etape === "relire") return vueRelire(ctx);
  return vuePret(ctx);
}
