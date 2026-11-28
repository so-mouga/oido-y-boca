// El Chiringuito, le stand de tapas de la Feria : monter des phrases. Pour Kevin seul.
//   #/jeux/chiringuito          avant la partie : avec quelles phrases, le niveau
//   #/jeux/chiringuito/partie   un client commande en français ; on touche les assiettes (les mots espagnols) dans l'ordre (90 s)
//   #/jeux/chiringuito/fin      le score, le record du niveau, les commandes à revoir
// Le jeu vérifie à chaque assiette : une mauvaise assiette tremble et reste sur le comptoir. Phrase finie : « ¡Servido! »,
// la phrase s'écrit en entier et la voix la dit. Les phrases viennent des exercices et des cartes 3 et 4 des leçons faites
// (jeux.js, phrasesChiringuito) ; les pièges sont fabriqués tout seuls (article, ser / estar, petit mot, personne du verbe, genre).
// Rien ici ne touche à la révision des mots.

import { esc, ICONES } from "../ui.js?v=86";
import { EXERCICES } from "../exercices.js?v=86";
import { conjuguer, TEMPS } from "../controles.js?v=86";
import { tousLesVerbes } from "../verbes.js?v=86";
import { etatJeux, garderJeux } from "../progression.js?v=86";
import { dire, taire } from "../voix.js?v=86";
import { chispa } from "../mascotte.js?v=86";
import * as J from "../jeux.js?v=86";
import { rosette } from "./jeux.js?v=86";

const $ = (s, r = document) => r.querySelector(s);
const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const jeux = () => ({ ...J.JEUX_VIDE(), ...etatJeux() });
const couleur = () => J.etape(J.attrapes(jeux())).i;
const flamme = (humeur, taille) => chispa(humeur, taille, couleur());
const REGLAGES = { paquet: "mes", niveau: "normal" };
const reglages = () => ({ ...REGLAGES, ...(jeux().chiringuito || {}) });
const regler = r => garderJeux({ ...jeux(), chiringuito: { ...reglages(), ...r } });
const recordDe = niveau => jeux().records[`chiringuito:${niveau}`] || 0;
// Le meilleur record, tous niveaux confondus, et son niveau (pour le stand de la salle).
export const recordChiringuito = () => Object.entries(J.NIVEAUX_CHIRINGUITO).reduce((r, [id, n]) => recordDe(id) > r.score ? { score: recordDe(id), nom: n.nom } : r, { score: 0, nom: "" });
// En français, une espace insécable avant ? ! : ; pour que le signe ne parte jamais seul à la ligne.
const fr = t => esc(t).replace(/ ([?!:;])/g, " $1");

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
const boutonMuet = () => `<button class="f-rond" data-h="muet" aria-label="${jeux().muet ? "Remettre le son" : "Couper le son"}" aria-pressed="${jeux().muet}">${jeux().muet ? I.muet : I.son}</button>`;

// ——— les sons (fabriqués sur place), la vibration et la voix : tout se tait avec le bouton muet de la Feria ———
let audio = null;
function note(freq, debut = 0, duree = .2, volume = .1, type = "sine") {
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
const demi = n => 523.25 * Math.pow(2, n / 12);
// Le « clac » d'une assiette posée : il monte avec le combo.
const clac = n => note(660 * Math.pow(2, Math.min(n, 12) / 12), 0, .09, .07, "triangle");
const vibrer = m => { if (!jeux().muet) try { navigator.vibrate?.(m); } catch { /* pas de vibreur */ } };
const direPhrase = es => { if (!jeux().muet) dire(es); };

// ——— les phrases ———
function donnees(ctx) {
  const { phrases, propres } = J.phrasesChiringuito(EXERCICES, ctx.pos.faites, ctx.mots);
  const paquets = J.paquetsChiringuito(phrases, ctx.pos.dateFaite, ctx.jour);
  const r = reglages();
  const choisi = paquets.find(p => p.id === r.paquet && p.ouvert) || paquets.find(p => p.ouvert) || null;
  return { phrases, propres, paquets, choisi, niveau: J.NIVEAUX_CHIRINGUITO[r.niveau] ? r.niveau : "normal" };
}
// Pour les pièges : les autres formes de chaque verbe (même temps, autre personne), aux temps déjà vus, et les mots connus.
function outilsPieges(ctx, phrases) {
  const formes = new Map(), lexique = new Set();
  const seul = f => (f || "").split(" ").pop().toLowerCase();
  for (const t of J.tempsVus(ctx.pos.faites, TEMPS)) {
    for (const x of tousLesVerbes(ctx)) {
      let six;
      try { six = [0, 1, 2, 3, 4, 5].map(p => seul(conjuguer(x.v, p, x.d, t))); } catch { continue; }
      // Les formes en un seul mot (pas « he comido ») : chacune connaît les 5 autres.
      if (six.some(f => !f || f.includes(" "))) continue;
      six.forEach(f => formes.set(f, [...new Set([...(formes.get(f) || []), ...six.filter(g => g !== f)])]));
    }
  }
  for (const m of ctx.mots) for (const w of (m.es || "").toLowerCase().split(/[^\p{L}]+/u)) if (w) lexique.add(w);
  for (const p of phrases) for (const w of p.mots) lexique.add(w.toLowerCase());
  return { formes, lexique };
}

// ——— avant la partie ———
function vuePret(ctx, d) {
  const paquet = p => `<button class="f-paquet" data-h="paquet" data-v="${p.id}" aria-pressed="${p === d.choisi}"${p.ouvert ? "" : " disabled"}><i></i><span>${esc(p.nom)}<small>${esc(p.aide)}</small></span></button>`;
  const n = J.niveauChiringuito(d.niveau);
  return {
    onglet: null,
    html: `<div class="feria f-pret h-pret">
        <div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1>El Chiringuito</h1></div>
        <p class="f-regle">Un client commande en français. <b>Touche les assiettes dans l'ordre</b> pour monter sa commande en espagnol. Attention aux pièges. <b>3 assiettes justes de suite : ×2. 6 : ×3. 10 : ¡FUEGO! ×5.</b></p>
        <div><h2>Avec quelles phrases ?</h2><div class="f-paquets">${d.paquets.map(paquet).join("")}</div></div>
        <div><h2>Le niveau</h2><div class="h-niveaux">${Object.entries(J.NIVEAUX_CHIRINGUITO).map(([id, x]) => { const rec = recordDe(id);
          return `<button data-h="niveau" data-v="${id}" aria-pressed="${id === d.niveau}">${x.nom}${rec ? `<small>${rec}</small>` : ""}</button>`; }).join("")}</div>
          <p class="h-quoi">${esc(n.quoi)}</p></div>
        <div class="c-bas">${flamme("idle", 1)}${d.choisi ? `<a class="f-btn gros" href="#/jeux/chiringuito/partie">¡Marchando!</a>` : `<span class="f-btn gros h-ferme">Bientôt</span>`}</div>
      </div>`,
    apres: brancher,
  };
}

// ——— la partie ———
function vuePartie() {
  return {
    onglet: null,
    html: `<div class="feria h-partie">
        <div class="f-hud"><a class="f-rond" href="#/jeux/chiringuito" data-arriere aria-label="Arrêter la partie">${ICONES.fermer}</a>
          <div class="f-temps" role="timer" aria-label="Temps restant"><i></i></div>${boutonMuet()}</div>
        <div class="c-points"><div class="c-score" aria-label="Score">0</div><span class="c-multi un">×1</span></div>
        <div class="h-stand"><div class="h-store"></div>
          <div class="h-salle"><div class="h-grill" aria-hidden="true"><i></i><i></i><i></i></div><div class="h-client"></div><p class="h-commande" aria-live="polite"></p></div>
          <div class="h-comptoir"><div class="h-chef"><span class="h-toque"></span>${flamme("idle", 0)}</div>
            <div class="h-plateau" aria-label="Le plateau"></div><div class="h-assiettes"></div></div></div>
        <div class="c-decompte"><div><b>3</b><p>${jeux().muet ? "Le son est coupé : remets-le pour entendre les phrases." : "Le premier client arrive…"}</p></div></div>
      </div>`,
    apres: brancher,
  };
}

// Les clients : des silhouettes simples, de couleurs différentes (personne de réel).
const TEINTES = [["#0F8A83", "#F2C9A0"], ["#D8472A", "#C68B5E"], ["#13294B", "#F2C9A0"], ["#7A3F8F", "#8D5A3B"], ["#2E6B43", "#E8B98E"]];
function client(k, h = "idle") {
  const [habit, peau] = TEINTES[k % TEINTES.length];
  const bouche = h === "joie" ? `<path d="M24 35q8 8 16 0" fill="none" stroke="#13294B" stroke-width="2.4" stroke-linecap="round"/>`
    : h === "fache" ? `<path d="M25 37h14" stroke="#13294B" stroke-width="2.4" stroke-linecap="round"/>`
    : `<path d="M26 36q6 4 12 0" fill="none" stroke="#13294B" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 64 76" aria-hidden="true"><path d="M6 76c0-18 11-28 26-28s26 10 26 28z" fill="${habit}"/><circle cx="32" cy="28" r="18" fill="${peau}"/>
    <circle cx="25" cy="27" r="2.3" fill="#13294B"/><circle cx="39" cy="27" r="2.3" fill="#13294B"/>${bouche}</svg>`;
}

function lancer(ctx, d) {
  const racine = $(".h-partie");
  P = { ctx, racine, niveau: d.niveau, paquet: d.choisi, pioche: [], outils: outilsPieges(ctx, d.phrases),
    score: 0, combo: 0, serie: 0, servis: 0, ok: 0, ko: 0, rates: [], k: 0, fin: 0, pause: 0, bloque: true, fuego: false, c: null };
  const p = P;
  coupe = new AbortController();
  // Si on quitte l'appli (écran éteint, autre appli), le chrono et la patience du client attendent.
  document.addEventListener("visibilitychange", () => {
    if (P !== p || !p.fin) return;
    if (document.hidden) { p.pause = performance.now(); cancelAnimationFrame(image); taire(); }
    else if (p.pause) { const d = performance.now() - p.pause; p.fin += d; p.debut += d; p.pause = 0; image = requestAnimationFrame(tourner); }
  }, { signal: coupe.signal });
  const chiffre = $(".c-decompte b", racine);
  const compte = n => {
    if (P !== p || !racine.isConnected) return;
    if (n === 0) {
      $(".c-decompte", racine).remove();
      p.fin = performance.now() + J.DUREE_CHIRINGUITO * 1000; p.bloque = false;
      nouvelleCommande(); image = requestAnimationFrame(tourner);
      return;
    }
    chiffre.textContent = n; chiffre.style.animation = "none"; void chiffre.offsetWidth; chiffre.style.animation = "";
    note(440, 0, .15, .08, "triangle"); plusTard(() => compte(n - 1), calme() ? 450 : 700);
  };
  compte(3);
}

function nouvelleCommande() {
  const p = P;
  if (!p.pioche.length) { p.pioche = J.melanger(p.paquet.mots); if (p.pioche[p.pioche.length - 1] === p.c && p.pioche.length > 1) p.pioche.unshift(p.pioche.pop()); }
  const c = p.pioche.pop();
  const n = J.niveauChiringuito(p.niveau);
  const pieges = J.piegesPhrase(c.mots, n.pieges, p.outils);
  p.c = c; p.pose = 0; p.erreur = false; p.k++;
  p.patience = n.patience * 1000; p.debut = performance.now();
  const cl = $(".h-client", p.racine); cl.className = "h-client arrive";
  cl.innerHTML = `${client(p.k)}${p.patience ? `<span class="h-patience"><i></i></span>` : ""}`;
  $(".h-commande", p.racine).innerHTML = `<small>Le client commande</small>${fr(c.fr)}`;
  const pl = $(".h-plateau", p.racine); pl.className = "h-plateau"; pl.innerHTML = `<span class="h-vide">Touche les assiettes dans l'ordre…</span>`;
  $(".h-assiettes", p.racine).innerHTML = J.melanger([...c.mots.map(w => ({ w })), ...pieges.map(w => ({ w }))])
    .map(a => `<button class="h-assiette" data-h="assiette" data-w="${esc(a.w)}" lang="es">${esc(a.w)}</button>`).join("");
}

function tourner(t) {
  const p = P;
  if (!p || !p.racine.isConnected) return arreter();
  const reste = Math.max(0, p.fin - t), barre = $(".f-temps", p.racine);
  barre.firstElementChild.style.transform = `scaleX(${Math.min(1, reste / (J.DUREE_CHIRINGUITO * 1000))})`;
  barre.classList.toggle("presse", reste <= 10000);
  if (p.patience && !p.bloque) {
    const part = Math.max(0, 1 - (t - p.debut) / p.patience), b = $(".h-patience", p.racine);
    if (b) { b.firstElementChild.style.transform = `scaleX(${part})`; b.classList.toggle("presse", part < .3); }
    if (part <= 0) partFache();
  }
  if (reste <= 0) return finir();
  image = requestAnimationFrame(tourner);
}

function majCombo(saut) {
  const p = P, x = J.multi(p.combo), el = $(".c-multi", p.racine);
  el.textContent = x === 5 ? "¡FUEGO! ×5" : `×${x}`; el.classList.toggle("un", x === 1);
  if (saut) { el.classList.remove("saut"); void el.offsetWidth; el.classList.add("saut"); }
  $(".h-chef .m", p.racine).dataset.n = J.taille(p.combo);
  const feu = x === 5;
  if (feu && !p.fuego) { annonce("¡FUEGO!"); [0, 4, 7, 12, 16].forEach((n, i) => note(demi(n), i * .06, .3, .08, "sawtooth")); vibrer([30, 40, 30, 40, 60]); }
  p.fuego = feu; p.racine.classList.toggle("fuego", feu);
}
function annonce(texte, classe = "") {
  const f = document.createElement("span"); f.className = `c-feu ${classe}`; f.textContent = texte; f.setAttribute("aria-hidden", "true");
  P.racine.append(f); plusTard(() => f.remove(), 1000);
}
function envol(el, texte, classe = "") {
  const r = el.getBoundingClientRect(), b = P.racine.getBoundingClientRect(), s = document.createElement("span");
  s.className = `c-envol ${classe}`; s.textContent = texte; s.setAttribute("aria-hidden", "true");
  s.style.left = `${r.left - b.left + r.width / 2 - 14}px`; s.style.top = `${r.top - b.top - 10}px`;
  P.racine.append(s); plusTard(() => s.remove(), 750);
}

// Une assiette touchée : juste si c'est le mot suivant ; une assiette fausse tremble et reste sur le comptoir.
function prendre(a) {
  const p = P;
  if (!p || p.bloque || a.classList.contains("prise")) return;
  const attendu = p.c.mots[p.pose];
  if (a.dataset.w === attendu) {
    a.classList.add("prise");
    const pl = $(".h-plateau", p.racine); pl.querySelector(".h-vide")?.remove();
    pl.insertAdjacentHTML("beforeend", `<span class="h-mot" lang="es">${esc(attendu)}</span>`);
    p.pose++;
    const avant = J.multi(p.combo); p.combo++; p.serie = Math.max(p.serie, p.combo);
    const gain = J.points(p.combo); p.score += gain; $(".c-score", p.racine).textContent = p.score;
    envol(pl.lastElementChild, `+${gain}`); clac(p.combo); vibrer(8);
    majCombo(J.multi(p.combo) > avant);
    if (p.pose === p.c.mots.length) servir();
  } else {
    p.ko++; p.combo = 0; p.erreur = true; majCombo(false);
    a.classList.remove("non"); void a.offsetWidth; a.classList.add("non");
    note(196, 0, .25, .08); vibrer([40, 60, 40]);
    const m = $(".h-chef .m", p.racine); m.dataset.h = "grimace"; plusTard(() => { if (m.isConnected) m.dataset.h = "idle"; }, 700);
    if (J.niveauChiringuito(p.niveau).aide) {
      const bonne = [...p.racine.querySelectorAll(".h-assiette:not(.prise)")].find(x => x.dataset.w === attendu);
      bonne?.classList.add("montre"); plusTard(() => bonne?.classList.remove("montre"), 900);
    }
    if (p.patience) p.debut -= 2000; // le client s'impatiente un peu plus
  }
}

// La commande est servie : « ¡Servido! », le plateau glisse vers le client, la phrase s'écrit en entier et la voix la dit.
function servir() {
  const p = P;
  p.bloque = true; p.servis++;
  if (p.erreur) p.rates.push(p.c);
  if (p.patience) {
    const bonus = J.pourboire(1 - (performance.now() - p.debut) / p.patience);
    if (bonus) { p.score += bonus; $(".c-score", p.racine).textContent = p.score; const pl0 = $(".h-plateau", p.racine); plusTard(() => { if (P === p) envol(pl0, `+${bonus} ¡Rápido!`, "or"); }, 250); }
  }
  annonce("¡Servido!", "ole");
  $(".h-plateau", p.racine).classList.add("servi");
  $(".h-commande", p.racine).insertAdjacentHTML("beforeend", `<span class="h-dit" lang="es">${esc(p.c.es)}</span>`);
  $(".h-client", p.racine).innerHTML = client(p.k, "joie");
  const m = $(".h-chef .m", p.racine); m.dataset.h = "joie";
  direPhrase(p.c.es);
  [0, 4, 7].forEach((n, i) => note(784 * Math.pow(2, n / 12), i * .07, .2, .07, "triangle"));
  plusTard(() => { if (P !== p) return; $(".h-client", p.racine).classList.add("part"); m.dataset.h = "idle"; }, 1300);
  plusTard(() => { if (P !== p) return; p.bloque = false; nouvelleCommande(); }, 1750);
}
// Le client a trop attendu : il repart, la commande est ratée (on la montre et on l'entend en entier).
function partFache() {
  const p = P;
  p.bloque = true; p.ko++; p.combo = 0; majCombo(false); p.rates.push(p.c);
  $(".h-client", p.racine).innerHTML = client(p.k, "fache");
  $(".h-commande", p.racine).insertAdjacentHTML("beforeend", `<span class="h-dit rate" lang="es">${esc(p.c.es)}</span>`);
  direPhrase(p.c.es); note(196, 0, .35, .08);
  plusTard(() => { if (P === p) $(".h-client", p.racine).classList.add("part"); }, 1600);
  plusTard(() => { if (P !== p) return; p.bloque = false; nouvelleCommande(); }, 2100);
}

function finir() {
  const p = P;
  const r = J.apresPartie(jeux(), { jeu: "chiringuito", paquet: p.niveau, score: p.score, ok: p.servis, ko: p.ko, serie: p.serie, trouves: [] }, p.ctx.jour);
  garderJeux(r.jeux);
  derniere = { niveau: p.niveau, score: p.score, servis: p.servis, ko: p.ko, serie: p.serie, record: r.record, ancien: r.ancien, fete: true,
    trophees: r.trophees, rates: p.rates.filter((c, i, t) => t.indexOf(c) === i).slice(0, 6) };
  [0, 4, 7].forEach((n, i) => note(demi(n), i * .12, .5, .09));
  arreter();
  location.replace("#/jeux/chiringuito/fin");
}

// ——— la fin ———
function vueFin() {
  const g = derniere, n = J.niveauChiringuito(g.niveau);
  const h1 = g.record ? "Nouveau record !" : g.ancien && g.score >= g.ancien * .8 ? "Tout près du record." : g.servis ? "¡Buen trabajo!" : "On s'échauffe.";
  const sous = g.record ? (g.ancien ? `L'ancien était à ${g.ancien}.` : "Le premier d'une longue série.") : g.ancien ? `Record à battre : ${g.ancien}.` : "";
  const rates = g.rates.length ? `<div class="f-rates"><h2>Les commandes à revoir</h2><ul>${g.rates.map(c =>
    `<li><div><b lang="es">${esc(c.es)}</b><span>${fr(c.fr)}</span></div><button data-dire="${esc(c.es)}" aria-label="Écouter : ${esc(c.es)}" aria-pressed="false">${ICONES.play}</button></li>`).join("")}</ul></div>` : "";
  return {
    onglet: null,
    html: `<div class="feria f-fin h-fin"><div class="f-corps">
        <div class="f-podium">${flamme(g.record ? "joie" : "idle", g.record ? 3 : 1)}<div><small class="c-niv">El Chiringuito · ${n.nom}</small><h1>${h1}</h1>${sous ? `<p>${sous}</p>` : ""}</div></div>
        <div class="f-total">${g.record ? `<span class="f-nouveau">Record battu</span>` : ""}
          <div class="f-gros"><b data-compte>${g.fete ? 0 : g.score}</b><span>ton record ${n.nom}<i>${Math.max(g.ancien, g.score)}</i></span></div>
          <div class="f-chiffres"><div><b>${g.servis}</b>commande${g.servis > 1 ? "s" : ""} servie${g.servis > 1 ? "s" : ""}</div><div><b>${g.serie}</b>assiettes de suite, au mieux</div><div><b>${g.ko}</b>erreur${g.ko > 1 ? "s" : ""}</div></div></div>
        ${g.trophees.map(t => `<div class="f-gagne">${rosette(t.couleur)}<div><b>${esc(t.nom)}</b>Nouveau trophée · ${esc(t.quoi)}</div></div>`).join("")}
        ${rates}
      </div><div class="f-bas"><a class="f-btn gros" href="#/jeux/chiringuito/partie" data-remplace>Encore une !</a><a class="f-retour" href="#/jeux/chiringuito" data-remplace>Retour au stand</a></div></div>`,
    apres: () => { brancher(); feter(); },
  };
}
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
  if (g.record) plusTard(() => { [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => note(demi(n), i * .1, .45, .09, "triangle")); vibrer([40, 60, 40, 60, 120]); }, 900);
}

// ——— les touchers ———
function brancher() {
  document.querySelector('meta[name="theme-color"]').content = "#F7B91C";
  const racine = $(".feria");
  racine?.addEventListener("click", e => {
    const b = e.target.closest("[data-h]");
    if (!b) return;
    const quoi = b.dataset.h, v = b.dataset.v;
    if (quoi === "assiette") return prendre(b);
    if (quoi === "muet") {
      garderJeux({ ...jeux(), muet: !jeux().muet });
      if (jeux().muet) taire();
      b.outerHTML = boutonMuet();
      return;
    }
    if (quoi === "paquet") {
      regler({ paquet: v });
      racine.querySelectorAll('[data-h="paquet"]').forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    }
    if (quoi === "niveau") {
      regler({ niveau: v });
      racine.querySelectorAll('[data-h="niveau"]').forEach(x => x.setAttribute("aria-pressed", String(x === b)));
      $(".h-quoi", racine).textContent = J.niveauChiringuito(v).quoi;
    }
  });
}

export function ecranChiringuito(ctx, etape) {
  arreter();
  const d = donnees(ctx);
  if (etape === "partie" && d.choisi) { const v = vuePartie(); return { ...v, apres: () => { v.apres(); lancer(ctx, d); } }; }
  if (etape === "fin" && derniere) return vueFin();
  return vuePret(ctx, d);
}
