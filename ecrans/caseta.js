// La Caseta de tiro, le stand de tir de la Feria : un jeu d'oreille, pour Kevin seul.
//   #/jeux/caseta          avant la partie : avec quels mots, le niveau, ce qu'il y a sur les cibles
//   #/jeux/caseta/partie   la voix dit un mot espagnol ; des cibles défilent sur 3 rails ; on tire sur la bonne (60 s)
//   #/jeux/caseta/fin      le score, le record du niveau, les mots pas compris, les mots nouveaux à garder
// Les cibles tournent en boucle sur leur rail, comme un tapis roulant de foire : elles ne se chevauchent jamais,
// et une cible qui ressort de l'autre côté prend un nouveau mot. Le mot à trouver est toujours sur une cible visible
// (ou sur celle qui entre), et jamais deux cibles ne portent le même mot ou le même sens.
// Au tir, la cible se retourne et montre sa traduction ; une cible ratée la montre aussi un instant (pero ≠ perro).
// Le moteur (paquets, niveaux, points, pièges de l'oreille) est dans jeux.js ; les paires de pièges dans themes.js.
// Rien ici ne touche à la révision des mots, sauf « Je le garde » sur un mot nouveau, comme dans le Dico.

import { esc, ICONES } from "../ui.js?v=59";
import { motsAMoi, motsAVenir } from "../dico.js?v=59";
import { apprisEnAvance, apprendreEnAvance, etatJeux, garderJeux } from "../progression.js?v=59";
import { dire, taire } from "../voix.js?v=59";
import { chispa } from "../mascotte.js?v=59";
import { PIEGES } from "../themes.js?v=59";
import * as J from "../jeux.js?v=59";
import { rosette, braises, confettis } from "./jeux.js?v=59";

const $ = (s, r = document) => r.querySelector(s);
const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const jeux = () => ({ ...J.JEUX_VIDE(), ...etatJeux() });
const couleur = () => J.etape(J.attrapes(jeux())).i;
const flamme = (humeur, taille) => chispa(humeur, taille, couleur());
const melange = t => J.melanger(t);
// Les réglages, retenus d'une fois sur l'autre.
const REGLAGES = { paquet: "tout", niveau: "normal", cibles: "fr" };
const reglages = () => ({ ...REGLAGES, ...(jeux().caseta || {}) });
const regler = r => garderJeux({ ...jeux(), caseta: { ...reglages(), ...r } });
const recordDe = niveau => jeux().records[`caseta:${niveau}`] || 0;
// Le meilleur record, tous niveaux confondus, et son niveau (pour le stand de la salle).
export const recordCaseta = () => Object.entries(J.NIVEAUX_CASETA).reduce((r, [id, n]) => recordDe(id) > r.score ? { score: recordDe(id), nom: n.nom } : r, { score: 0, nom: "" });
const MOTS_PIEGES = J.motsPieges(PIEGES);

let P = null, image = 0, minuteurs = [], coupe = null, derniere = null;
const plusTard = (f, ms) => minuteurs.push(setTimeout(f, ms));
function arreter() {
  cancelAnimationFrame(image);
  minuteurs.forEach(clearTimeout); minuteurs = [];
  coupe?.abort(); coupe = null;
  P = null;
  taire();
}

const svg = corps => `<svg viewBox="0 0 24 24" aria-hidden="true">${corps}</svg>`;
const I = {
  son: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'),
  muet: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM17 9.5l5 5M22 9.5l-5 5"/>'),
};
const boutonMuet = () => `<button class="f-rond" data-c="muet" aria-label="${jeux().muet ? "Remettre le son" : "Couper le son"}" aria-pressed="${jeux().muet}">${jeux().muet ? I.muet : I.son}</button>`;

// ——— les sons (fabriqués sur place), la vibration et la voix : tout se tait avec le bouton muet de la Feria ———
let audio = null;
const ctxAudio = () => (audio ||= new (window.AudioContext || window.webkitAudioContext)());
function note(freq, debut = 0, duree = .2, volume = .1, type = "sine") {
  if (jeux().muet) return;
  try {
    const a = ctxAudio(); if (a.state === "suspended") a.resume();
    const t = a.currentTime + .02 + debut, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + duree);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + duree + .05);
  } catch { /* le son est un bonus */ }
}
// Le coup de feu de foire : un petit « pop » de bruit filtré.
function pan(volume = .35) {
  if (jeux().muet) return;
  try {
    const a = ctxAudio(); if (a.state === "suspended") a.resume();
    const n = Math.floor(a.sampleRate * .12), b = a.createBuffer(1, n, a.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = b; f.type = "bandpass"; f.frequency.value = 1800; g.gain.value = volume;
    s.connect(f).connect(g).connect(a.destination); s.start();
  } catch { /* le son est un bonus */ }
}
const demi = n => 523.25 * Math.pow(2, n / 12);
const vibrer = m => { if (!jeux().muet) try { navigator.vibrate?.(m); } catch { /* pas de vibreur */ } };
// La voix dit le mot ; pendant qu'elle parle, « Otra vez » s'allume et les points du comptoir ondulent.
function direMot(texte) {
  if (jeux().muet || !P) return;
  const n = ++P.parole, b = $(".c-otra", P.racine), cons = $(".c-consigne", P.racine);
  b?.classList.add("on"); cons?.classList.add("parle");
  const fin = () => { if (P && P.parole === n) { b?.classList.remove("on"); cons?.classList.remove("parle"); } };
  if (!dire(texte, { vitesse: J.niveauCaseta(P.niveau).voix, fin })) fin();
}

// ——— les mots ———
function donnees(ctx) {
  const connus = J.motsConnus({ mots: ctx.mots, faites: ctx.pos.faites, dateFaite: ctx.pos.dateFaite, avance: apprisEnAvance, aMoi: motsAMoi().reverse() });
  const paquets = J.paquetsCaseta(connus, motsAVenir(ctx), MOTS_PIEGES);
  const r = reglages();
  const choisi = paquets.find(p => p.id === r.paquet && p.ouvert) || paquets.find(p => p.ouvert);
  return { paquets, choisi, niveau: J.NIVEAUX_CASETA[r.niveau] ? r.niveau : "normal", cibles: r.cibles === "es" ? "es" : "fr" };
}

// ——— avant la partie ———
const APERCU = `<svg viewBox="0 0 340 150" aria-hidden="true"><rect width="340" height="150" fill="#0E3B57"/>
  <g fill="#FFF6E0" stroke="#D8472A" stroke-width="3"><rect x="20" y="22" width="90" height="44" rx="11"/><rect x="200" y="22" width="90" height="44" rx="11"/><rect x="110" y="88" width="90" height="44" rx="11"/></g>
  <g font-family="Lexend" font-weight="600" font-size="13" fill="#13294B" text-anchor="middle"><text x="72" y="49">la ville</text><text x="252" y="49">manger</text><text x="162" y="115">le travail</text></g>
  <g fill="#D8472A"><circle cx="32" cy="44" r="7"/><circle cx="212" cy="44" r="7"/><circle cx="122" cy="110" r="7"/></g>
  <rect x="0" y="72" width="340" height="7" fill="#8A5A2B"/><rect x="0" y="138" width="340" height="7" fill="#8A5A2B"/>
  <circle cx="32" cy="44" r="13" fill="none" stroke="#F7B91C" stroke-width="3" stroke-dasharray="4 4"/></svg>`;

function vuePret(ctx, d) {
  const paquet = p => `<button class="f-paquet" data-c="paquet" data-v="${p.id}" aria-pressed="${p === d.choisi}"${p.ouvert ? "" : " disabled"}><i></i><span>${esc(p.nom)}<small>${esc(p.aide)}</small></span></button>`;
  const niveau = ([id, n]) => { const rec = recordDe(id);
    return `<button class="f-paquet" data-c="niveau" data-v="${id}" aria-pressed="${id === d.niveau}"><i></i><span>${n.nom}<small>${esc(n.quoi)}</small></span>${rec ? `<em aria-label="record ${rec}">${rec}</em>` : ""}</button>`; };
  const cibles = (v, t) => `<button data-c="cibles" data-v="${v}" aria-pressed="${d.cibles === v}">${t}</button>`;
  return {
    onglet: null,
    html: `<div class="feria f-pret c-pret">
        <div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1>La Caseta de tiro</h1></div>
        <div class="c-apercu">${APERCU}</div>
        <p class="f-regle">La voix dit un mot espagnol. <b>Tire sur la cible qui a le bon sens</b> avant qu'elle sorte. « Otra vez » pour réécouter. <b>3 de suite : ×2. 6 : ×3. 10 : ¡FUEGO! ×5.</b> Une cible dorée : des points et 3 secondes en plus.</p>
        <div><h2>Avec quels mots ?</h2><div class="f-paquets">${d.paquets.map(paquet).join("")}</div></div>
        <div><h2>Le niveau</h2><div class="f-paquets">${Object.entries(J.NIVEAUX_CASETA).map(niveau).join("")}</div></div>
        <div><h2>Sur les cibles</h2><div class="c-choix">${cibles("fr", "Le sens en français")}${cibles("es", "Le mot espagnol")}</div></div>
        <div class="c-bas">${flamme("idle", 1)}<a class="f-btn gros" href="#/jeux/caseta/partie">¡A disparar!</a></div>
      </div>`,
    apres: brancher,
  };
}

// ——— la partie ———
function vuePartie(ctx, d) {
  const n = J.niveauCaseta(d.niveau);
  return {
    onglet: null,
    html: `<div class="feria c-partie">
        <div class="f-hud"><a class="f-rond" href="#/jeux/caseta" data-arriere aria-label="Arrêter la partie">${ICONES.fermer}</a>
          <div class="f-temps" role="timer" aria-label="Temps restant"><i></i></div>${boutonMuet()}</div>
        <div class="c-points"><div class="c-score" aria-label="Score">0</div><span class="c-multi un">×1</span></div>
        <div class="c-stand"><div class="c-store"></div>
          <div class="c-mur"><div class="c-rail"></div><div class="c-rail"></div><div class="c-rail"></div></div>
          <div class="c-comptoir">${flamme("idle", 0)}<div class="c-consigne"><small>Tire sur…</small><b class="${n.ecrit === "debut" ? "" : "cache"}">· · ·</b></div>
            <button class="c-otra" data-c="otra">${I.son}Otra vez</button></div></div>
        <div class="c-decompte"><div><b>3</b><p>${jeux().muet ? "Le son est coupé : remets-le pour entendre les mots." : "Monte le son : écoute bien le mot."}</p></div></div>
      </div>`,
    apres: () => { brancher(); lancer(ctx, d); },
  };
}

// La géométrie des rails : 3 cibles par rail, régulièrement espacées, qui tournent en boucle (le rail du milieu dans l'autre sens).
const LARGEUR = 134, ECART = 34, PAR_RAIL = 3;
const texte = m => J.texteCible(m, P.sens);
// Deux mots qu'on ne veut jamais voir ensemble sur des cibles : le même mot, le même mot espagnol, ou le même texte.
const pareil = (a, b) => a === b || (a && b && (a.es === b.es || texte(a) === texte(b)));
const juste = (m, cible) => m === cible || m.es === cible.es;

function lancer(ctx, d) {
  const racine = $(".c-partie");
  const mur = $(".c-mur", racine);
  P = { ctx, racine, mur, niveau: d.niveau, sens: d.cibles, paquet: d.choisi.id, mots: d.choisi.mots, pioche: [],
    score: 0, combo: 0, serie: 0, ok: 0, ko: 0, rates: [], trouves: [], nouveauxVus: [], entendus: 0, nouveaux: 0,
    cible: null, cibles: [], ecoutes: 0, parole: 0, fin: 0, avant: 0, pause: 0, bloque: true, fuego: false, W: mur.clientWidth };
  const p = P;
  const pas = Math.max(LARGEUR + ECART, (p.W + LARGEUR) / PAR_RAIL);
  p.pas = pas; p.boucle = pas * PAR_RAIL;
  p.rails = [...racine.querySelectorAll(".c-rail")].map((el, i) => ({ el, sens: i === 1 ? -1 : 1, vitesse: 34 + i * 6, decalage: i * pas / 3 }));
  for (const r of p.rails) for (let k = 0; k < PAR_RAIL; k++) creerCible(r, k);
  placer();
  coupe = new AbortController();
  // Si on quitte l'appli (écran éteint, autre appli), le chrono attend.
  document.addEventListener("visibilitychange", () => {
    if (P !== p || !p.fin) return;
    if (document.hidden) { p.pause = Math.max(0, p.fin - performance.now()); cancelAnimationFrame(image); taire(); }
    else if (p.pause) { p.fin = performance.now() + p.pause; p.pause = 0; p.avant = performance.now(); image = requestAnimationFrame(tourner); }
  }, { signal: coupe.signal });
  addEventListener("resize", () => { if (P === p) p.W = p.mur.clientWidth; }, { signal: coupe.signal });
  const chiffre = $(".c-decompte b", racine);
  const compte = n => {
    if (P !== p || !racine.isConnected) return;
    if (n === 0) {
      $(".c-decompte", racine).remove();
      p.fin = performance.now() + J.DUREE_CASETA * 1000; p.avant = performance.now(); p.bloque = false;
      nouveauMot(); image = requestAnimationFrame(tourner);
      return;
    }
    chiffre.textContent = n; chiffre.style.animation = "none"; void chiffre.offsetWidth; chiffre.style.animation = "";
    note(440, 0, .15, .08, "triangle"); plusTard(() => compte(n - 1), calme() ? 450 : 700);
  };
  compte(3);
}

// Un mot du paquet qui n'est sur aucune autre cible (ni le même sens) et qui n'est pas le mot à trouver.
function tirerMot(sauf = null) {
  const autres = P.cibles.filter(c => c !== sauf && c.mot).map(c => c.mot);
  if (P.cible) autres.push(P.cible);
  const libre = m => !autres.some(o => pareil(o, m)) && (!m.nouveau || J.nouveauPermis(P.entendus, P.nouveaux));
  for (let i = 0; i < P.mots.length * 2; i++) {
    if (!P.pioche.length) P.pioche = melange(P.mots);
    const m = P.pioche.pop();
    if (libre(m)) return m;
  }
  return P.mots.find(libre) || P.mots.find(m => !autres.some(o => pareil(o, m))) || P.mots[0];
}
const ecrire = c => { const s = $(".c-plaque span", c.el); s.textContent = texte(c.mot); s.lang = P.sens === "es" ? "es" : "fr"; };
// L'autre côté de la cible : la traduction (le français si les cibles sont en espagnol, et l'inverse).
const traduire = c => { const s = $(".c-plaque span", c.el); s.textContent = J.autreCote(c.mot, P.sens); s.lang = P.sens === "es" ? "fr" : "es"; };
// Un mot change de cible : les autres cibles qui portaient le même (ou le même sens) en prennent un autre.
function poserMot(c, m) {
  for (const o of P.cibles) if (o !== c && pareil(o.mot, m)) { o.mot = null; o.mot = tirerMot(o); ecrire(o); }
  c.mot = m; ecrire(c);
}

function creerCible(rail, k) {
  const el = document.createElement("button");
  el.className = "c-cible";
  el.innerHTML = `<span class="c-plaque"><i class="c-rond"></i><span></span></span><i class="c-pied"></i>`;
  rail.el.append(el);
  const c = { el, rail, k, x: 0, mot: null, or: false, vivante: true };
  P.cibles.push(c);
  c.mot = tirerMot(c); ecrire(c);
  el.addEventListener("pointerdown", e => { e.preventDefault(); tirer(c, e); });
}

// La position de chaque cible sur sa boucle ; une cible qui vient de ressortir de l'autre côté prend un nouveau mot.
function placer() {
  for (const c of P.cibles) {
    const r = c.rail, pos = ((c.k * P.pas + r.decalage) % P.boucle + P.boucle) % P.boucle;
    const x = r.sens > 0 ? pos - LARGEUR : P.W - pos;
    const ressort = c.x !== 0 && Math.abs(x - c.x) > P.boucle / 2;
    c.x = x;
    c.el.style.transform = `translateX(${x}px)`;
    if (ressort) { c.or = false; c.vivante = true; c.el.className = "c-cible"; c.mot = tirerMot(c); ecrire(c); }
  }
}
// En vue : la cible entière est à l'écran. Visable : son centre est à l'écran (on peut la viser).
const enVue = c => c.vivante && c.x > 4 && c.x < P.W - LARGEUR - 4;
const visable = c => c.vivante && c.x + LARGEUR / 2 > 0 && c.x + LARGEUR / 2 < P.W;

// Le bon mot ne manque jamais à l'écran : si aucune cible visable ne le porte, la cible qui entre le plus vite le prend
// (ou une cible bien en place, qui se retourne). Le jumeau à l'oreille (perro / pero) reste lui aussi à l'écran.
function garderLeBonMot() {
  if (!P.cible || P.bloque) return;
  garder(P.cible, true);
  if (P.cible.paire) garder(P.cible.paire, false);
}
function garder(m, bon) {
  if (P.cibles.some(c => visable(c) && c.mot === m)) return;
  const W = P.W, acc = J.accelCaseta(P.niveau, P.combo);
  const attente = c => c.rail.sens > 0 ? -(c.x + LARGEUR / 2) : (c.x + LARGEUR / 2) - W; // distance avant d'être visable
  const reste = c => c.rail.sens > 0 ? W - (c.x + LARGEUR / 2) : c.x + LARGEUR / 2;   // distance avant de ne plus l'être
  const libre = c => bon || c.mot !== P.cible;
  const entrante = P.cibles.filter(c => libre(c) && c.vivante && attente(c) > 0 && attente(c) < c.rail.vitesse * acc * .8).sort((a, b) => attente(a) - attente(b))[0];
  const enPlace = P.cibles.filter(c => libre(c) && visable(c) && reste(c) > W * .45).sort((a, b) => reste(b) - reste(a))[0];
  const c = entrante || enPlace;
  if (!c) return;
  poserMot(c, m);
  c.or = bon && Math.random() < .15;
  c.el.className = `c-cible${c.or ? " or" : ""}${c === enPlace && c !== entrante ? " retourne" : ""}`;
}
// Met un mot sur une cible bien en vue (pas celle qui porte déjà le bon mot), si aucune ne l'a.
function mettreEnVue(m, sauf) {
  if (P.cibles.some(c => enVue(c) && c.mot === m)) return;
  const c = melange(P.cibles.filter(c => enVue(c) && c !== sauf && c.mot !== P.cible))[0];
  if (c) poserMot(c, m);
}

// Le mot à entendre : souvent un mot déjà sur une cible en vue, sinon un mot qu'on met sur une cible en vue.
// Un piège : le mot et son jumeau sont tous les deux sur des cibles en vue.
function nouveauMot() {
  const p = P, vues = p.cibles.filter(enVue);
  let m;
  if (J.piegeMaintenant(p.paquet, p.niveau)) {
    do m = MOTS_PIEGES[Math.floor(Math.random() * MOTS_PIEGES.length)]; while (m === p.cible);
    mettreEnVue(m);
    p.cible = m;
    mettreEnVue(m.paire, p.cibles.find(c => c.mot === m));
  } else {
    const sur = vues.filter(c => c.mot !== p.cible && (!c.mot.nouveau || J.nouveauPermis(p.entendus, p.nouveaux)));
    if (sur.length && Math.random() < .6) m = melange(sur)[0].mot;
    else {
      const c = melange(vues)[0] || p.cibles[0];
      m = tirerMot(c);
      poserMot(c, m);
    }
  }
  p.entendus++;
  if (m.nouveau) { p.nouveaux++; if (!p.nouveauxVus.includes(m)) p.nouveauxVus.push(m); }
  p.cible = m; p.ecoutes = 0;
  const debut = J.niveauCaseta(p.niveau).ecrit === "debut";
  const b = $(".c-consigne b", p.racine);
  b.textContent = debut ? m.es : "· · ·"; b.className = debut ? "" : "cache";
  b.lang = debut ? "es" : "";
  direMot(m.es);
}

function tourner(t) {
  const p = P;
  if (!p || !p.racine.isConnected) return arreter();
  const dt = Math.min(50, t - p.avant) / 1000; p.avant = t;
  const acc = J.accelCaseta(p.niveau, p.combo);
  for (const r of p.rails) r.decalage += r.vitesse * acc * dt;
  placer();
  garderLeBonMot();
  const reste = Math.max(0, p.fin - t), barre = $(".f-temps", p.racine);
  barre.firstElementChild.style.transform = `scaleX(${Math.min(1, reste / (J.DUREE_CASETA * 1000))})`;
  barre.classList.toggle("presse", reste <= 10000);
  if (reste <= 0) return finir();
  image = requestAnimationFrame(tourner);
}

// Le point d'impact, et un petit texte qui s'envole (+20, −2 s).
function impact(e, quoi) {
  const st = $(".c-stand", P.racine), r = st.getBoundingClientRect();
  const i = document.createElement("span"); i.className = "c-impact";
  i.style.left = `${e.clientX - r.left}px`; i.style.top = `${e.clientY - r.top}px`;
  st.append(i); plusTard(() => i.remove(), 500);
  if (quoi) {
    const b = document.createElement("span"); b.className = "c-envol"; b.textContent = quoi; b.setAttribute("aria-hidden", "true");
    b.style.left = `${e.clientX - r.left - 16}px`; b.style.top = `${e.clientY - r.top - 30}px`;
    st.append(b); plusTard(() => b.remove(), 750);
  }
}
function annonce(texte, classe = "") {
  const f = document.createElement("span"); f.className = `c-feu ${classe}`; f.textContent = texte; f.setAttribute("aria-hidden", "true");
  P.racine.append(f); plusTard(() => f.remove(), 1000);
}
function majCombo(saut) {
  const p = P, x = J.multi(p.combo), el = $(".c-multi", p.racine);
  el.textContent = x === 5 ? "¡FUEGO! ×5" : `×${x}`; el.classList.toggle("un", x === 1);
  if (saut) { el.classList.remove("saut"); void el.offsetWidth; el.classList.add("saut"); }
  $(".c-comptoir .m", p.racine).dataset.n = J.taille(p.combo);
  const feu = x === 5;
  if (feu && !p.fuego) { annonce("¡FUEGO!"); [0, 4, 7, 12, 16].forEach((n, i) => note(demi(n), i * .06, .3, .08, "sawtooth")); vibrer([30, 40, 30, 40, 60]); }
  p.fuego = feu; p.racine.classList.toggle("fuego", feu);
}
function humeur(h, duree) {
  const m = $(".c-comptoir .m", P.racine);
  m.dataset.h = h;
  plusTard(() => { if (m.isConnected) m.dataset.h = "idle"; }, duree);
}

function tirer(c, e) {
  const p = P;
  if (!p || p.bloque || !c.vivante || !p.cible) return;
  pan();
  if (juste(c.mot, p.cible)) {
    const avant = J.multi(p.combo);
    p.combo++; p.ok++; p.serie = Math.max(p.serie, p.combo); p.trouves.push(p.cible);
    const gain = J.pointsCaseta(p.combo, c.or);
    p.score += gain;
    c.vivante = false; c.el.classList.add("touche"); traduire(c);
    impact(e, c.or ? `+${gain} · +${J.TEMPS_OR} s` : `+${gain}`);
    if (c.or) { p.fin += J.TEMPS_OR * 1000; annonce("¡Olé!", "ole"); }
    $(".c-score", p.racine).textContent = p.score;
    note(784 * Math.pow(2, Math.min(p.combo, 12) / 12), .03, .2, .08, "triangle"); vibrer(c.or ? [20, 30, 20] : 12);
    humeur("joie", 700);
    majCombo(J.multi(p.combo) > avant);
    // La cible retournée montre sa traduction un instant, puis la voix dit le mot suivant.
    p.bloque = true;
    plusTard(() => { if (P !== p) return; c.el.classList.remove("touche"); c.vivante = true; c.mot = tirerMot(c); ecrire(c); p.bloque = false; nouveauMot(); }, 650);
  } else {
    p.ko++; p.combo = 0; p.rates.push(p.cible);
    c.el.classList.remove("rate"); void c.el.offsetWidth; c.el.classList.add("rate");
    // La cible ratée montre aussi sa traduction un instant : on voit ce qu'on a confondu (pero = mais, alors que la voix disait perro).
    traduire(c); const mot = c.mot; plusTard(() => { if (P === p && c.mot === mot) ecrire(c); }, 1100);
    const n = J.niveauCaseta(p.niveau);
    impact(e, n.penalite ? `−${n.penalite} s` : "");
    note(196, .02, .3, .08); vibrer([40, 60, 40]);
    humeur("grimace", 900);
    if (n.aide) p.cibles.filter(o => o.mot === p.cible).forEach(o => { o.el.classList.add("montre"); plusTard(() => o.el.classList.remove("montre"), 1000); });
    if (n.penalite) p.fin -= n.penalite * 1000;
    p.racine.classList.remove("secoue"); void p.racine.offsetWidth; p.racine.classList.add("secoue");
    majCombo(false);
  }
}

// « Otra vez » : la voix redit le mot. Au niveau Normal, il s'écrit au 2e.
function otraVez() {
  const p = P;
  if (!p?.cible) return;
  p.ecoutes++;
  if (p.ecoutes >= 2 && J.niveauCaseta(p.niveau).ecrit === "otra") { const b = $(".c-consigne b", p.racine); b.textContent = p.cible.es; b.className = "aide"; b.lang = "es"; }
  direMot(p.cible.es);
}

function finir() {
  const p = P;
  const r = J.apresPartie(jeux(), { jeu: "caseta", paquet: p.niveau, score: p.score, ok: p.ok, ko: p.ko, serie: p.serie, trouves: J.trouvesCaseta(p.trouves) }, p.ctx.jour);
  garderJeux(r.jeux);
  const parId = new Map(p.mots.map(m => [m.id, m]));
  derniere = { jour: p.ctx.jour, ctx: p.ctx, niveau: p.niveau, score: p.score, ok: p.ok, ko: p.ko, serie: p.serie,
    record: r.record, ancien: r.ancien, fete: true, mue: r.mue, trophees: r.trophees,
    attrapes: r.attrapes.map(id => parId.get(id)?.es).filter(Boolean),
    rates: p.rates.filter((m, i, t) => t.indexOf(m) === i).slice(0, 6),
    nouveaux: p.nouveauxVus.filter(m => m.id && !apprisEnAvance(m.id)).slice(0, 6), gardes: new Set() };
  [0, 4, 7].forEach((n, i) => note(demi(n), i * .12, .5, .09));
  arreter();
  location.replace("#/jeux/caseta/fin");
}

// ——— la fin ———
function vueFin() {
  const g = derniere, n = J.niveauCaseta(g.niveau);
  const h1 = g.record ? "Nouveau record !" : g.ancien && g.score >= g.ancien * .8 ? "Tout près du record." : g.ok ? "Belle partie !" : "On s'échauffe.";
  const sous = g.record ? (g.ancien ? `L'ancien était à ${g.ancien}.` : "Le premier d'une longue série.") : g.ancien ? `Record à battre : ${g.ancien}.` : "";
  const ecoute = m => `<button data-dire="${esc(m.es)}" aria-label="Écouter : ${esc(m.es)}" aria-pressed="false">${ICONES.play}</button>`;
  const jumeau = m => m.paire ? `<small>à ne pas confondre avec <i lang="es">${esc(m.paire.es)}</i>, ${esc(J.court(m.paire.fr))}</small>` : "";
  const rates = g.rates.length ? `<div class="f-rates"><h2>Les mots que tu n'as pas compris</h2><ul>${g.rates.map(m =>
    `<li><div><b lang="es">${esc(m.es)}</b><span>${esc(J.court(m.fr))}</span>${jumeau(m)}</div>${ecoute(m)}</li>`).join("")}</ul></div>` : "";
  return {
    onglet: null,
    html: `<div class="feria f-fin c-fin"><div class="f-corps">
        <div class="f-podium">${flamme(g.record || g.mue ? "joie" : "idle", g.record || g.mue ? 3 : 1)}<div><small class="c-niv">La Caseta · ${n.nom}</small><h1>${h1}</h1>${sous ? `<p>${sous}</p>` : ""}</div></div>
        <div class="f-total">${g.record ? `<span class="f-nouveau">Record battu</span>` : ""}
          <div class="f-gros"><b data-compte>${g.fete ? 0 : g.score}</b><span>ton record ${n.nom}<i>${Math.max(g.ancien, g.score)}</i></span></div>
          <div class="f-chiffres"><div><b>${g.ok}</b>cible${g.ok > 1 ? "s" : ""} touchée${g.ok > 1 ? "s" : ""}</div><div><b>${g.serie}</b>de suite, au mieux</div><div><b>${g.ko}</b>raté${g.ko > 1 ? "s" : ""}</div></div></div>
        ${braises(g)}
        ${g.trophees.map(t => `<div class="f-gagne">${rosette(t.couleur)}<div><b>${esc(t.nom)}</b>Nouveau trophée · ${esc(t.quoi)}</div></div>`).join("")}
        ${rates}
        ${nouveaux(g)}
      </div><div class="f-bas"><a class="f-btn gros" href="#/jeux/caseta/partie" data-remplace>Encore une !</a><a class="f-retour" href="#/jeux/caseta" data-remplace>Retour au stand</a></div></div>`,
    apres: () => { brancher(); feter(); },
  };
}

// Les mots nouveaux entendus (« la suite du livre ») : « Je le garde », comme dans le Dico (5 par jour, tous jeux confondus).
function nouveaux(g) {
  if (!g.nouveaux.length) return "";
  const reste = J.gardesRestants(jeux(), g.jour);
  const ligne = (m, i) => {
    const action = g.gardes.has(i) ? `<span class="d-vu ok">Gardé ✓</span>`
      : reste > 0 ? `<button class="d-garder" data-c="garder" data-v="${i}">Je le garde</button>` : `<span class="d-vu">demain</span>`;
    return `<li><button class="d-ecoute" data-dire="${esc(m.es)}" aria-label="Écouter : ${esc(m.es)}" aria-pressed="false">${ICONES.play}</button>
      <div><b lang="es">${esc(m.es)}</b><span>${esc(J.court(m.fr))}</span></div>${action}</li>`;
  };
  return `<div class="c-nouveaux"><h2>Les mots nouveaux de la partie</h2><ul class="d-liste">${g.nouveaux.map(ligne).join("")}</ul>
    <p class="f-note">${reste > 0 ? `Tu peux encore garder ${reste} mot${reste > 1 ? "s" : ""} aujourd'hui (${J.GARDES_PAR_JOUR} par jour, tous jeux confondus). Un mot gardé revient dès demain dans « Tes mots à revoir ».` : `Tu as gardé ${J.GARDES_PAR_JOUR} mots aujourd'hui : les autres attendront demain.`}</p></div>`;
}
function garderMot(i) {
  const g = derniere, m = g?.nouveaux[i];
  if (!m || g.gardes.has(i) || J.gardesRestants(jeux(), g.jour) <= 0) return;
  apprendreEnAvance(m.id, g.jour);
  garderJeux(J.garderSurprise(jeux(), g.jour));
  g.gardes.add(i);
  vibrer(12);
  const bloc = $(".c-nouveaux");
  if (bloc) bloc.outerHTML = nouveaux(g);
}

// Le score qui compte, puis la fête au record. Une seule fois : si l'écran se redessine, il reste calme.
function feter() {
  const g = derniere;
  if (!g?.fete) return;
  g.fete = false;
  const el = $("[data-compte]"), t0 = performance.now(), duree = calme() ? 0 : 900;
  const pas = t => {
    if (!el.isConnected) return;
    const a = duree ? Math.min(1, (t - t0) / duree) : 1;
    el.textContent = Math.round(g.score * (1 - Math.pow(1 - a, 3)));
    if (a < 1) image = requestAnimationFrame(pas);
  };
  image = requestAnimationFrame(pas);
  if (g.record) plusTard(() => { [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => note(demi(n), i * .1, .45, .09, "triangle")); vibrer([40, 60, 40, 60, 120]); confettis(); }, 900);
}

// ——— les touchers ———
function brancher() {
  document.querySelector('meta[name="theme-color"]').content = "#F7B91C";
  const racine = $(".feria");
  racine?.addEventListener("click", e => {
    const b = e.target.closest("[data-c]");
    if (!b) return;
    const quoi = b.dataset.c, v = b.dataset.v;
    if (quoi === "otra") return otraVez();
    if (quoi === "muet") {
      garderJeux({ ...jeux(), muet: !jeux().muet });
      if (jeux().muet) taire();
      b.outerHTML = boutonMuet();
      return;
    }
    if (quoi === "garder") return garderMot(Number(v));
    if (["paquet", "niveau", "cibles"].includes(quoi)) {
      regler({ [quoi]: v });
      racine.querySelectorAll(`[data-c="${quoi}"]`).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    }
  });
}

export function ecranCaseta(ctx, etape) {
  arreter();
  const d = donnees(ctx);
  if (etape === "partie" && d.choisi) return vuePartie(ctx, d);
  if (etape === "fin" && derniere) return vueFin();
  return vuePret(ctx, d);
}
