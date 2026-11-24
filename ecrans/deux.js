// La Feria à deux : deux jeux pour le canapé, avec Blanca ou Dorian, sur un seul téléphone qu'on se passe.
//   #/jeux/deux                  le choix du jeu
//   #/jeux/bomba                 La Bomba : avec qui, l'un contre l'autre ou ensemble, l'aide pour Kevin, le thème
//   #/jeux/bomba/partie          la mèche brûle, chacun dit un mot du thème et passe la bombe
//   #/jeux/bomba/boum            l'explosion : le perdant et son gage, ou le nombre de mots dits ensemble
//   #/jeux/frente                En la frente : qui devine, avec quels mots
//   #/jeux/frente/partie         le téléphone sur le front, 60 secondes
//   #/jeux/frente/fin            les mots de la manche, « Je le garde »
// Ici, pas seulement les mots connus : ces jeux servent aussi à apprendre (décidé avec Kevin). Les mots gardés entrent
// dans « Tes mots à revoir » (5 par jour au plus, tous jeux confondus). Le contenu des thèmes et les gages sont dans themes.js.

import { esc, ICONES, barreOnglets } from "../ui.js?v=54";
import { motsAMoi, motsAVenir, memeMot } from "../dico.js?v=54";
import { apprisEnAvance, apprendreEnAvance, ajouterMonMot, etatJeux, garderJeux } from "../progression.js?v=54";
import { taire } from "../voix.js?v=54";
import { chispa } from "../mascotte.js?v=54";
import { THEMES, GAGES } from "../themes.js?v=54";
import * as J from "../jeux.js?v=54";

const $ = (s, r = document) => r.querySelector(s);
const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const jeux = () => ({ ...J.JEUX_VIDE(), ...etatJeux() });
// Les réglages des jeux à deux, retenus d'une fois sur l'autre.
const REGLAGES = { partenaire: "Blanca", mode: "duel", aide: 2, lettre: false, devine: "Kevin", paquet: "suite", theme: "" };
const reglages = () => ({ ...REGLAGES, ...(jeux().deux || {}) });
const regler = r => garderJeux({ ...jeux(), deux: { ...reglages(), ...r } });
const couleur = () => J.etape(J.attrapes(jeux())).i;
const melange = t => { t = [...t]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };

let minuteurs = [], image = 0, coupe = null;
const plusTard = (f, ms) => minuteurs.push(setTimeout(f, ms));
function arreter() {
  cancelAnimationFrame(image);
  minuteurs.forEach(clearTimeout); minuteurs = [];
  coupe?.abort(); coupe = null;
  B = null; F = null;
}

// ——— les sons (fabriqués sur place) et la vibration ; tout se tait avec le bouton muet de la Feria ———
let audio = null;
const contexte = () => (audio ||= new (window.AudioContext || window.webkitAudioContext)());
function note(freq, debut = 0, duree = .2, volume = .1, type = "sine") {
  if (jeux().muet) return;
  try {
    const a = contexte();
    if (a.state === "suspended") a.resume();
    const t = a.currentTime + .02 + debut, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + duree);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + duree + .05);
  } catch { /* le son est un bonus */ }
}
// Le pétard de l'explosion : un bruit blanc qui s'éteint, filtré pour sonner sourd.
function petard() {
  if (jeux().muet) return;
  try {
    const a = contexte(), n = Math.floor(a.sampleRate * .9), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.5);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; f.type = "lowpass"; f.frequency.value = 900; g.gain.value = .5;
    s.connect(f).connect(g).connect(a.destination); s.start();
  } catch { /* le son est un bonus */ }
}
const vibrer = m => { if (!jeux().muet) try { navigator.vibrate?.(m); } catch { /* pas de vibreur */ } };

const svg = corps => `<svg viewBox="0 0 24 24" aria-hidden="true">${corps}</svg>`;
const I = {
  haut: svg('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  bas: svg('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  front: svg('<rect x="4" y="7" width="16" height="10" rx="2"/><path d="M8 3h8"/>'),
};
const BOMBE_ICO = `<svg class="d-ico" viewBox="0 0 64 64" aria-hidden="true"><circle cx="28" cy="38" r="22" fill="#13294B"/><circle cx="20" cy="30" r="5" fill="#3D5275"/><rect x="34" y="14" width="10" height="9" rx="2" transform="rotate(35 39 18)" fill="#3D5275"/><path d="M42 12q6-6 12 0" fill="none" stroke="#7A4A1E" stroke-width="3" stroke-linecap="round"/><circle cx="55" cy="11" r="5" fill="#F0742B"/><circle cx="55" cy="11" r="2.4" fill="#FFC94A"/></svg>`;
const FRONT_ICO = `<svg class="d-ico" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="38" r="20" fill="#F0C9A0"/><path d="M12 34q0-22 20-22t20 22q-6-10-20-10t-20 10z" fill="#5C3512"/><rect x="18" y="8" width="28" height="18" rx="4" fill="#0F8A83" transform="rotate(-6 32 17)"/><circle cx="25" cy="40" r="2.4" fill="#13294B"/><circle cx="39" cy="40" r="2.4" fill="#13294B"/><path d="M27 48q5 4 10 0" fill="none" stroke="#13294B" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const tete = (titre, retour) => `<div class="f-tete"><a class="f-rond" href="${retour}" aria-label="Retour">${ICONES.retour}</a><h1>${titre}</h1></div>`;
const choix = (attr, valeur, actuel, nom) => `<button data-d="${attr}" data-v="${esc(valeur)}" aria-pressed="${String(valeur) === String(actuel)}">${nom}</button>`;

// ——— le choix du jeu ———
function vueChoix() {
  return {
    onglet: "jeux",
    html: `<div class="feria f-page d-page">${tete("À deux", "#/jeux")}
        <p class="f-note">Sur le canapé, avec Blanca ou Dorian. Un seul téléphone, vous vous le passez.</p>
        <a class="d-jeu" href="#/jeux/bomba">${BOMBE_ICO}<span><b>La Bomba</b>Un thème, chacun dit un mot et passe la bombe. Celui qui l'a quand elle explose a un gage.</span></a>
        <a class="d-jeu" href="#/jeux/frente">${FRONT_ICO}<span><b>En la frente</b>Le téléphone sur ton front. L'autre te fait deviner le mot en espagnol, sans un mot de français.</span></a>
      </div>${barreOnglets("jeux")}`,
  };
}

// ——— La Bomba ———
const nouveauTheme = avant => { const ids = Object.keys(THEMES).filter(id => id !== avant); return ids[Math.floor(Math.random() * ids.length)]; };
function vueBombaPret() {
  let r = reglages();
  if (!THEMES[r.theme]) { regler({ theme: nouveauTheme("") }); r = reglages(); }
  const th = THEMES[r.theme], duel = r.mode === "duel";
  const aide = duel ? `<h2>Un coup de main pour Kevin : sa mèche brûle moins vite</h2>
      <div class="d-choix">${choix("aide", 1, r.aide, "Égal")}${choix("aide", 2, r.aide, "Kevin ×2")}${choix("aide", 3, r.aide, "Kevin ×3")}</div>
      <button class="d-inter" data-d="lettre" aria-pressed="${r.lettre}"><i></i><span>Une lettre imposée pour ${r.partenaire}<small>À chaque tour, un mot qui commence par une lettre donnée. À essayer si ${r.partenaire} gagne trop souvent.</small></span></button>`
    : `<p class="f-note">Vous comptez les mots dits à deux avant l'explosion, et vous essayez de battre votre record.</p>`;
  return {
    onglet: null,
    html: `<div class="feria f-page d-page">${tete("La Bomba", "#/jeux/deux")}
        <p class="f-regle">Chacun son tour : <b>dis un mot espagnol du thème</b>, touche l'écran, la bombe passe à l'autre. Pas de mot, ou un mot déjà dit ? Tu gardes la bombe. Elle explose quand elle veut…</p>
        <h2>Avec qui ?</h2><div class="d-choix">${choix("partenaire", "Blanca", r.partenaire, "Kevin et Blanca")}${choix("partenaire", "Dorian", r.partenaire, "Kevin et Dorian")}</div>
        <h2>Comment ?</h2><div class="d-choix">${choix("mode", "duel", r.mode, "L'un contre l'autre")}${choix("mode", "ensemble", r.mode, "Ensemble")}</div>
        ${aide}
        <h2>Le thème</h2>
        <div class="d-theme"><small>LE THÈME · ${th.ico}</small><b lang="es">${esc(th.nom)}</b><span>${esc(th.fr)}</span></div>
        <div class="d-bas"><a class="f-btn gros" href="#/jeux/bomba/partie">¡Enciende la mecha!</a><button class="d-lien" data-d="theme">Un autre thème</button></div>
      </div>`,
    apres: brancher,
  };
}

const BOMBE = () => `<svg class="d-bombe" viewBox="0 0 300 300" aria-hidden="true">
  <path class="d-cendre" d="M196 92 Q230 40 270 50"/>
  <path class="d-meche" d="M196 92 Q230 40 270 50" pathLength="100" stroke-dasharray="100 200"/>
  <g class="d-corps"><circle cx="150" cy="180" r="100" fill="#13294B"/><circle cx="112" cy="140" r="22" fill="#3D5275"/><circle cx="100" cy="128" r="8" fill="#5A7099"/>
  <rect x="172" y="76" width="44" height="34" rx="6" fill="#3D5275" transform="rotate(35 194 93)"/></g>
  <foreignObject class="d-etincelle" x="225" y="-28" width="90" height="90">${chispa("joie", 2, couleur())}</foreignObject>
</svg>`;

let B = null; // la manche en cours de La Bomba
const perdus = {}; // les manches perdues de la soirée (pas enregistrées)
function vueBomba() {
  const r = reglages(), th = THEMES[r.theme];
  return {
    onglet: null,
    html: `<div class="feria d-bomba">
        <div class="d-haut"><a class="f-rond" href="#/jeux/bomba" data-arriere aria-label="Arrêter">${ICONES.fermer}</a>
          <div class="d-theme petit"><small>THÈME · ${th.ico}</small><b lang="es">${esc(th.nom)}</b></div>${r.mode === "ensemble" ? `<span class="d-dits"><b>0</b>mots</span>` : ""}</div>
        <div class="d-scene">${BOMBE()}<div class="d-ayuda"></div></div>
        <div class="d-tour"><button class="d-passe" data-d="passe"><small>Au tour de</small><b>Kevin</b><span>Dis un mot, puis touche ici</span></button></div>
      </div>`,
    apres: () => { brancher(); lancerBomba(); },
  };
}

function lancerBomba() {
  const r = reglages(), joueurs = ["Kevin", r.partenaire];
  B = { r, joueurs, tour: 0, duree: J.dureeMeche(), brule: 0, avant: performance.now(), tic: 0, jokers: J.JOKERS, montres: [], dits: 0, lettre: "" };
  const b = B, meche = $(".d-meche"), etin = $(".d-etincelle"), corps = $(".d-corps"), long = meche.getTotalLength();
  majTour();
  coupe = new AbortController();
  // Si on quitte l'appli, la mèche attend.
  document.addEventListener("visibilitychange", () => { if (B === b && !document.hidden) b.avant = performance.now(); }, { signal: coupe.signal });
  const pas = t => {
    if (B !== b || !meche.isConnected) return;
    // Pendant le tour de Kevin (l'un contre l'autre), la mèche brûle 2 ou 3 fois moins vite.
    const vitesse = r.mode === "duel" && b.joueurs[b.tour] === "Kevin" ? 1 / r.aide : 1;
    b.brule += Math.min(250, t - b.avant) * vitesse; b.avant = t;
    const a = Math.min(1, b.brule / b.duree);
    meche.setAttribute("stroke-dasharray", `${(1 - a) * 100} 200`);
    const pt = meche.getPointAtLength((1 - a) * long);
    etin.setAttribute("x", pt.x - 45); etin.setAttribute("y", pt.y - 80);
    // Le tic-tac et le tremblement accélèrent ; dans le dernier tiers, le téléphone vibre à chaque tic.
    const intervalle = 700 - 560 * a;
    corps.style.setProperty("--vit", `${Math.max(.12, intervalle / 1000)}s`);
    if (t >= b.tic) { note(a > .7 ? 1300 : 1000, 0, .05, .07, "square"); if (a > .65) vibrer(a > .85 ? 25 : 12); b.tic = t + intervalle; }
    if (a >= 1) return exploser();
    image = requestAnimationFrame(pas);
  };
  image = requestAnimationFrame(pas);
}

// Le bouton du tour : à qui c'est, la lettre imposée pour l'autre joueur, et les jokers de Kevin.
function majTour() {
  const b = B, qui = b.joueurs[b.tour], kevin = qui === "Kevin";
  const bouton = $(".d-passe");
  bouton.classList.toggle("autre", !kevin);
  bouton.querySelector("b").textContent = qui;
  const consigne = bouton.querySelector("span");
  if (!kevin && b.r.mode === "duel" && b.r.lettre) {
    b.lettre = J.tirerLettre(THEMES[b.r.theme].mots, b.lettre);
    consigne.innerHTML = `Un mot qui commence par <b class="d-lettre">${esc(b.lettre)}</b>`;
  } else consigne.textContent = "Dis un mot, puis touche ici";
  $(".d-ayuda").innerHTML = !kevin ? "" : b.jokers > 0
    ? `<button class="d-joker" data-d="ayuda">¡Ayuda! <span>${b.jokers}</span></button>` : `<span class="d-joker vide">Plus de joker</span>`;
}

function passer() {
  const b = B;
  if (!b) return;
  b.tour = 1 - b.tour; b.dits++;
  const d = $(".d-dits b"); if (d) d.textContent = b.dits;
  vibrer(25); note(660, 0, .08, .08, "triangle");
  majTour();
  const bouton = $(".d-passe");
  bouton.classList.remove("flash"); void bouton.offsetWidth; bouton.classList.add("flash");
}

// « ¡Ayuda! » : 3 mots du thème, avec leur image et leur sens, mais l'espagnol caché (« la v _ _ _ »).
// Un toucher sur une carte montre le mot entier, sans dépenser de joker.
function ayuda() {
  const b = B;
  if (!b || b.jokers <= 0) return;
  b.jokers--;
  const mots = THEMES[b.r.theme].mots;
  const reste = melange(mots.filter(m => !b.montres.includes(m.es)));
  const trois = (reste.length >= 3 ? reste : melange(mots)).slice(0, 3);
  b.montres.push(...trois.map(m => m.es));
  $(".d-ayuda").innerHTML = `<div class="d-idees">${trois.map(m => `<button data-d="devoile" data-es="${esc(m.es)}"><b aria-hidden="true">${m.e || "·"}</b><small>${esc(m.fr)}</small><i lang="es">${esc(J.indice(m.es))}</i></button>`).join("")}</div><p class="d-astuce">Bloqué ? Touche une carte pour voir le mot.</p>`;
  vibrer(15); note(990, 0, .1, .07, "triangle");
}

let resultat = null; // la dernière explosion, pour l'écran « boum »
function exploser() {
  const b = B, perdant = b.joueurs[b.tour], gagnant = b.joueurs[1 - b.tour];
  resultat = { mode: b.r.mode, theme: b.r.theme, perdant, joueurs: b.joueurs, dits: b.dits };
  if (b.r.mode === "duel") {
    perdus[perdant] = (perdus[perdant] || 0) + 1;
    resultat.gage = J.tirerGage(GAGES, b.r.partenaire, gagnant);
  } else {
    const cle = `bomba:${b.r.theme}`, avant = jeux().records[cle] || 0;
    resultat.record = avant; resultat.nouveau = b.dits > avant;
    if (resultat.nouveau) garderJeux({ ...jeux(), records: { ...jeux().records, [cle]: b.dits } });
  }
  petard(); note(80, 0, .6, .3, "sawtooth"); vibrer([200, 60, 300]);
  arreter();
  location.replace("#/jeux/bomba/boum");
}

function vueBoum() {
  const g = resultat, th = THEMES[g.theme];
  const corps = g.mode === "ensemble"
    ? `<h2>${g.dits} mot${g.dits > 1 ? "s" : ""} à deux</h2>
      <div class="d-gage"><small>${g.nouveau ? "NOUVEAU RECORD" : "VOTRE RECORD"}</small>${esc(th.nom)} : ${Math.max(g.record, g.dits)} mots${g.nouveau && g.record ? ` (avant : ${g.record})` : ""}</div>`
    : `<h2>${esc(g.perdant)} a perdu la manche</h2>
      <div class="d-gage"><small>LE GAGE</small>${esc(g.gage)}</div>
      <p class="d-petit">Manches perdues ce soir</p><div class="d-score">${g.joueurs.map(n => `<span><b>${perdus[n] || 0}</b>${esc(n)}</span>`).join("")}</div>`;
  return {
    onglet: null,
    html: `<div class="feria d-boum"><span class="d-bum">¡BUM!</span>${corps}
        <button class="f-btn gros" data-d="encore">Encore une, autre thème !</button><a class="d-lien" href="#/jeux/deux" data-remplace>Changer de jeu</a></div>`,
    apres: () => {
      brancher();
      if (!calme()) { const a = document.getElementById("app"); a.classList.remove("d-secoue"); void a.offsetWidth; a.classList.add("d-secoue"); }
    },
  };
}

// ——— En la frente ———
// Les mots : un mot du livre ou de « Mes mots » ({ es, fr, id }), ou d'un thème ({ es, fr, e }). connu : Kevin l'a déjà.
const MIMABLES = new Set(["nom", "verbe"]);
function motsFrente(ctx, paquet) {
  const connus = J.motsConnus({ mots: ctx.mots, faites: ctx.pos.faites, dateFaite: ctx.pos.dateFaite, avance: apprisEnAvance, aMoi: motsAMoi().reverse() });
  const deja = es => connus.some(m => memeMot(m.es, es));
  const mimable = m => m.moi || MIMABLES.has((m.categorie || "").toLowerCase());
  const livre = m => ({ es: m.es, fr: m.fr.replace(/\s*\([^)]*\)/g, ""), id: m.moi ? "" : m.id, moi: !!m.moi, connu: deja(m.es) });
  if (THEMES[paquet]) return THEMES[paquet].mots.map(m => ({ ...m, connu: deja(m.es) }));
  const mes = connus.filter(mimable).map(livre);
  if (paquet === "mes") return mes;
  if (paquet === "tout") return ctx.mots.filter(mimable).map(livre);
  return [...mes, ...motsAVenir(ctx).filter(mimable).slice(0, 60).map(livre)];
}

function vueFrentePret(ctx) {
  const r = reglages();
  const mes = motsFrente(ctx, "mes").length;
  const paquets = [
    { id: "mes", nom: "Seulement mes mots", sous: `${mes} mot${mes > 1 ? "s" : ""}`, ouvert: mes >= J.SEUIL },
    { id: "suite", nom: "Mes mots et la suite du livre", sous: `${mes} mot${mes > 1 ? "s" : ""} + les suivants`, ouvert: true },
    { id: "tout", nom: "Tout le livre", sous: "pour quand c'est Blanca qui devine", ouvert: true },
  ];
  const paquet = paquets.find(p => p.id === r.paquet && !p.ouvert) ? "suite" : r.paquet;
  return {
    onglet: null,
    html: `<div class="feria f-page d-page">${tete("En la frente", "#/jeux/deux")}
        <p class="f-regle">Mets le téléphone <b>sur ton front</b>, écran vers l'autre. Il te fait deviner le mot <b>en espagnol</b> : phrases simples ou mimes, jamais de français. Penche la tête en avant : trouvé. En arrière : je passe.</p>
        <h2>Qui devine ?</h2><div class="d-choix">${["Kevin", "Blanca", "Dorian"].map(n => choix("devine", n, r.devine, n)).join("")}</div>
        <h2>Avec quels mots ?</h2>
        <div class="f-paquets">${paquets.map(p => `<button class="f-paquet" data-d="paquet" data-v="${p.id}" aria-pressed="${paquet === p.id}"${p.ouvert ? "" : " disabled"}><i></i><span>${p.nom}<small>${p.sous}</small></span></button>`).join("")}</div>
        <h2>Ou un thème</h2>
        <div class="d-themes">${Object.entries(THEMES).map(([id, t]) => `<button data-d="paquet" data-v="${id}" aria-pressed="${paquet === id}"><b aria-hidden="true">${t.ico}</b><span lang="es">${esc(t.nom)}</span></button>`).join("")}</div>
        <div class="d-bas"><a class="f-btn gros" href="#/jeux/frente/partie">¡Listo!</a></div>
      </div>`,
    apres: brancher,
  };
}

let F = null; // la manche en cours d'En la frente
let manche = null; // la dernière manche finie, pour l'écran de fin
function vueFrente(ctx) {
  const r = reglages();
  const pour = r.devine === "Kevin" ? `Fais deviner ce mot à Kevin, en espagnol` : `Kevin : fais deviner ce mot à ${esc(r.devine)}, en espagnol`;
  return {
    onglet: null,
    html: `<div class="feria d-frente">
        <div class="d-hud"><a class="f-rond" href="#/jeux/frente" data-arriere aria-label="Arrêter">${ICONES.fermer}</a><div class="d-temps"><i></i></div><span class="d-pts">0</span></div>
        <div class="d-mot"><span class="d-pour">${I.front}${pour}</span><span class="d-image" aria-hidden="true"></span><p class="d-es" lang="es"></p><p class="d-fr"></p><span class="d-nouveau" hidden>nouveau pour Kevin</span></div>
        <div class="d-gestes"><button class="d-g-passe" data-d="geste" data-v="passe">${I.haut}Je passe</button><button class="d-g-ok" data-d="geste" data-v="ok">${I.bas}Trouvé !</button></div>
        <div class="d-decompte"><div><b>3</b><p>Mets le téléphone sur ton front</p></div></div>
      </div>`,
    apres: () => { brancher(); lancerFrente(ctx, r); },
  };
}

function lancerFrente(ctx, r) {
  const paquet = THEMES[r.paquet] || ["mes", "suite", "tout"].includes(r.paquet) ? r.paquet : "suite";
  F = { ctx, r, pioche: melange(motsFrente(ctx, paquet)), vus: [], mot: null, fin: 0, pause: 0, bloque: true, neutre: false };
  const f = F, chiffre = $(".d-decompte b");
  coupe = new AbortController();
  // Pencher la tête : la gravité sur l'axe de l'écran. Écran vers le sol (tête en avant) : trouvé ; vers le plafond : je passe.
  // Il faut revenir droit entre deux gestes. Les deux boutons restent là si le téléphone ne le sait pas.
  addEventListener("devicemotion", e => {
    const z = e.accelerationIncludingGravity?.z;
    if (F !== f || f.bloque || z == null) return;
    if (Math.abs(z) < 3) f.neutre = true;
    else if (f.neutre && Math.abs(z) > 7) { f.neutre = false; geste(z < 0); }
  }, { signal: coupe.signal });
  document.addEventListener("visibilitychange", () => {
    if (F !== f || !f.fin) return;
    if (document.hidden) { f.pause = Math.max(0, f.fin - performance.now()); cancelAnimationFrame(image); }
    else if (f.pause) { f.fin = performance.now() + f.pause; f.pause = 0; image = requestAnimationFrame(tourner); }
  }, { signal: coupe.signal });
  const pas = n => {
    if (F !== f || !chiffre.isConnected) return;
    if (n === 0) {
      $(".d-decompte").remove();
      f.fin = performance.now() + J.DUREE_FRENTE * 1000; f.bloque = false; f.neutre = true;
      suivant(); image = requestAnimationFrame(tourner);
      return;
    }
    chiffre.textContent = n; chiffre.style.animation = "none"; void chiffre.offsetWidth; chiffre.style.animation = "";
    note(440, 0, .15, .08, "triangle"); plusTard(() => pas(n - 1), calme() ? 500 : 900);
  };
  pas(3);
}

function suivant() {
  const f = F;
  if (!f.pioche.length) return finirFrente();
  f.mot = f.pioche.pop();
  const es = $(".d-es");
  es.textContent = f.mot.es; es.classList.toggle("long", f.mot.es.length > 12);
  es.classList.remove("arrive"); void es.offsetWidth; es.classList.add("arrive");
  $(".d-fr").textContent = f.mot.fr;
  $(".d-image").textContent = f.mot.e || "";
  $(".d-nouveau").hidden = !(f.r.devine === "Kevin" && !f.mot.connu);
}

function tourner(t) {
  const f = F;
  if (!f || !$(".d-temps")) return;
  const reste = Math.max(0, f.fin - t);
  $(".d-temps i").style.transform = `scaleX(${reste / (J.DUREE_FRENTE * 1000)})`;
  if (reste <= 0) return finirFrente();
  image = requestAnimationFrame(tourner);
}

function geste(ok) {
  const f = F;
  if (!f || f.bloque || !f.mot) return;
  f.vus.push({ m: f.mot, ok });
  $(".d-pts").textContent = f.vus.filter(v => v.ok).length;
  const zone = $(".d-frente");
  zone.classList.add(ok ? "ok" : "passe");
  if (ok) { note(880, 0, .12, .09, "triangle"); note(1320, .08, .16, .08, "triangle"); vibrer(30); } else { note(300, 0, .15, .07); vibrer([20, 40, 20]); }
  f.bloque = true;
  plusTard(() => { zone.classList.remove("ok", "passe"); f.bloque = false; suivant(); }, 500);
}

function finirFrente() {
  const f = F;
  manche = { devine: f.r.devine, partenaire: f.r.devine === "Kevin" ? reglages().partenaire : f.r.devine, vus: f.vus, gardes: new Set(), jour: f.ctx.jour, ctx: f.ctx };
  [0, 4, 7, 12].forEach((n, i) => note(523 * Math.pow(2, n / 12), i * .1, .4, .09, "triangle"));
  arreter();
  location.replace("#/jeux/frente/fin");
}

function vueFrenteFin() {
  const g = manche, trouves = g.vus.filter(v => v.ok).length, reste = J.gardesRestants(jeux(), g.jour);
  const ligne = (v, i) => {
    const action = v.m.connu ? `<span class="d-vu">déjà à toi</span>`
      : g.gardes.has(i) ? `<span class="d-vu ok">Gardé ✓</span>`
      : reste > 0 ? `<button class="d-garder" data-d="garder" data-v="${i}">Je le garde</button>`
      : `<span class="d-vu">demain</span>`;
    return `<li><span class="d-etat ${v.ok ? "ok" : ""}" aria-label="${v.ok ? "trouvé" : "passé"}">${v.ok ? ICONES.coche : "–"}</span>
      <button class="d-ecoute" data-dire="${esc(v.m.es)}" aria-label="Écouter : ${esc(v.m.es)}" aria-pressed="false">${ICONES.play}</button>
      <div><b lang="es">${esc(v.m.es)}</b><span>${esc(v.m.fr)}</span></div>${action}</li>`;
  };
  const echange = g.devine === "Kevin" ? g.partenaire : "Kevin";
  return {
    onglet: null,
    html: `<div class="feria f-page d-page">
        <h1 class="d-titre">${esc(g.devine)} a trouvé</h1>
        <div class="d-total"><b>${trouves}</b><span>mot${trouves > 1 ? "s" : ""} en ${J.DUREE_FRENTE} secondes<small>${g.vus.length - trouves} passé${g.vus.length - trouves > 1 ? "s" : ""}</small></span></div>
        ${g.vus.length ? `<h2>Les mots de la manche</h2><ul class="d-liste">${g.vus.map(ligne).join("")}</ul>
        <p class="f-note">${reste > 0 ? `Tu peux encore garder ${reste} mot${reste > 1 ? "s" : ""} aujourd'hui (${J.GARDES_PAR_JOUR} par jour, tous jeux confondus).` : `Tu as gardé ${J.GARDES_PAR_JOUR} mots aujourd'hui : les autres attendront demain.`}</p>` : ""}
        <div class="d-bas"><a class="f-btn gros" href="#/jeux/frente/partie" data-remplace>Encore une !</a>
          <button class="d-lien" data-d="echange" data-v="${esc(echange)}">On échange : ${esc(echange)} devine</button>
          <a class="d-lien" href="#/jeux/deux" data-remplace>Changer de jeu</a></div>
      </div>`,
    apres: brancher,
  };
}

// « Je le garde » : un mot du livre est appris en avance (comme depuis le Dico) ; un mot d'un thème va dans « Mes mots ».
// Dans les deux cas, il entre dans « Tes mots à revoir » dès demain.
function garder(i) {
  const g = manche, v = g?.vus[i];
  if (!v || g.gardes.has(i) || J.gardesRestants(jeux(), g.jour) <= 0) return;
  const duLivre = v.m.id || g.ctx.mots.find(m => memeMot(m.es, v.m.es))?.id;
  if (duLivre) apprendreEnAvance(duLivre, g.jour);
  else ajouterMonMot(v.m.es, v.m.fr, "", g.jour, "jeux");
  garderJeux(J.garderSurprise(jeux(), g.jour));
  g.gardes.add(i);
  vibrer(12);
  return true;
}

// ——— les touchers ———
function brancher() {
  document.querySelector('meta[name="theme-color"]').content = "#F7B91C";
  $(".feria")?.addEventListener("click", e => {
    const b = e.target.closest("[data-d]");
    if (!b) return;
    const quoi = b.dataset.d, v = b.dataset.v;
    if (quoi === "passe") return passer();
    if (quoi === "ayuda") return ayuda();
    if (quoi === "devoile") { b.querySelector("i").textContent = b.dataset.es; b.classList.add("vu"); return; }
    if (quoi === "geste") return geste(v === "ok");
    if (quoi === "garder") { if (garder(Number(v))) redessiner(); return; }
    if (quoi === "encore") { regler({ theme: nouveauTheme(reglages().theme) }); return location.replace("#/jeux/bomba/partie"); }
    if (quoi === "echange") { regler({ devine: v }); return location.replace("#/jeux/frente/partie"); }
    if (quoi === "theme") regler({ theme: nouveauTheme(reglages().theme) });
    else if (quoi === "lettre") regler({ lettre: !reglages().lettre });
    else if (quoi === "aide") regler({ aide: Number(v) });
    else if (["partenaire", "mode", "devine", "paquet"].includes(quoi)) regler({ [quoi]: v });
    redessiner();
  });
}
// Redessiner l'écran sans changer d'adresse ni d'animation (un réglage, un mot gardé), en gardant la position dans la page.
let ici = null;
function redessiner() {
  const y = scrollY, rendu = ecranDeux(...ici), app = document.getElementById("app");
  app.innerHTML = rendu.html;
  rendu.apres?.();
  scrollTo(0, y);
}

export function ecranDeux(ctx, quoi, etape) {
  ici = [ctx, quoi, etape];
  arreter();
  taire();
  if (quoi === "bomba") {
    if (etape === "partie") return vueBomba();
    if (etape === "boum" && resultat) return vueBoum();
    return vueBombaPret();
  }
  if (quoi === "frente") {
    if (etape === "partie") return vueFrente(ctx);
    if (etape === "fin" && manche) return vueFrenteFin();
    return vueFrentePret(ctx);
  }
  return vueChoix();
}
