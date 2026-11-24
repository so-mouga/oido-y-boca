// La Feria, la salle de jeux (#/jeux) : un monde à part, où on entre pour le plaisir. Toujours ouverte, jamais bloquée.
//   #/jeux                 la salle : la guirlande de la semaine, Chispa, les stands
//   #/jeux/montre          avant la partie : avec quels mots ?
//   #/jeux/montre/partie   le Contre la montre : un mot en espagnol, 4 sens en français, 60 secondes
//   #/jeux/montre/fin      le score, le record, le mot apporté par Chispa, les mots attrapés, les trophées
//   #/jeux/verbes, #/jeux/verbes/partie, #/jeux/verbes/fin : la course de verbes (« venir · tú », 3 formes), même déroulé
//   #/jeux/deux, #/jeux/bomba…, #/jeux/frente… : les jeux à deux (ecrans/deux.js)
//   #/jeux/trophees        les rosettes
//   #/jeux/chispa          Chispa et ses 6 couleurs
// Le moteur (mots, fausses réponses, points, records, guirlande) est dans jeux.js, sans écran, et se teste avec node.
// Pendant une partie l'écran n'est pas redessiné : on change seulement ce qui bouge. Rien ici ne touche à la révision des mots.

import { esc, id, titre, ICONES, barreOnglets } from "../ui.js?v=52";
import { UNITES } from "../position.js?v=52";
import { conjuguer, TEMPS, PERSONNES } from "../controles.js?v=52";
import { mesVerbes, verbesCours } from "../verbes.js?v=52";
import { motsAMoi, motsAVenir } from "../dico.js?v=52";
import { cases, apprisEnAvance, apprendreEnAvance, etatJeux, garderJeux } from "../progression.js?v=52";
import { dire, taire } from "../voix.js?v=52";
import { chispa } from "../mascotte.js?v=52";
import * as J from "../jeux.js?v=52";
import { ecranDeux } from "./deux.js?v=52";

let partie = null;    // la partie en cours
let derniere = null;  // la dernière partie finie, pour l'écran de fin et le retour dans la salle
let minuteurs = [], image = 0, coupe = null;

const calme = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const jeux = () => ({ ...J.JEUX_VIDE(), ...etatJeux() });
// La couleur de Chispa : son étape, selon les mots attrapés.
const couleur = () => J.etape(J.attrapes(jeux())).i;
const flamme = (humeur, taille) => chispa(humeur, taille, couleur());
const $ = (s, r = document) => r.querySelector(s);
const plusTard = (f, ms) => minuteurs.push(setTimeout(f, ms));
function arreter() {
  cancelAnimationFrame(image);
  minuteurs.forEach(clearTimeout); minuteurs = [];
  coupe?.abort(); coupe = null;
  partie = null;
  taire();
}

const svg = corps => `<svg viewBox="0 0 24 24" aria-hidden="true">${corps}</svg>`;
const I = {
  etoile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.5 5.8 21.1l1.6-7L2 9.3l7.1-.7z"/></svg>',
  son: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM16.5 9a4.5 4.5 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'),
  muet: svg('<path d="M4 9.5v5h4l5 4.5v-14L8 9.5zM17 9.5l5 5M22 9.5l-5 5"/>'),
};
const boutonMuet = () => `<button class="f-rond" data-j="muet" aria-label="${jeux().muet ? "Remettre le son" : "Couper le son"}" aria-pressed="${jeux().muet}">${jeux().muet ? I.muet : I.son}</button>`;

// ——— les sons (fabriqués sur place), la vibration et la voix : tout se tait avec le bouton muet ———
let audio = null;
function note(freq, debut = 0, duree = .25, volume = .1, type = "sine") {
  if (jeux().muet) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const t = audio.currentTime + .02 + debut, o = audio.createOscillator(), g = audio.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + duree);
    o.connect(g).connect(audio.destination); o.start(t); o.stop(t + duree + .05);
  } catch { /* le son est un bonus */ }
}
const demi = n => 523.25 * Math.pow(2, n / 12);
const SONS = {
  // La note monte d'un demi-ton à chaque bonne réponse de suite.
  juste: combo => { const n = Math.min(combo, 12); note(demi(n), 0, .18, .09, "triangle"); note(demi(n + 7), .06, .22, .07, "triangle"); },
  rate: () => note(196, 0, .3, .08),
  palier: () => [0, 4, 7].forEach((n, i) => note(demi(n + 12), i * .07, .2, .08, "triangle")),
  fuego: () => [0, 4, 7, 12, 16].forEach((n, i) => note(demi(n), i * .06, .3, .09, "sawtooth")),
  tic: () => note(880, 0, .06, .05, "square"),
  compte: () => note(440, 0, .18, .09, "triangle"),
  fin: () => [0, 4, 7].forEach((n, i) => note(demi(n), i * .12, .5, .09)),
  record: () => [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => note(demi(n), i * .1, .45, .09, "triangle")),
};
const vibrer = motif => { if (!jeux().muet) try { navigator.vibrate?.(motif); } catch { /* pas de vibreur */ } };
const direMot = texte => { if (!jeux().muet) dire(texte); };

// ——— les mots et les paquets ———
function donnees(ctx) {
  const connus = J.motsConnus({ mots: ctx.mots, faites: ctx.pos.faites, dateFaite: ctx.pos.dateFaite, avance: apprisEnAvance, aMoi: motsAMoi().reverse() });
  const paquets = J.paquets(connus, UNITES, ctx.pos.faites);
  const choisi = paquets.find(p => p.id === jeux().paquet && p.ouvert) || paquets[0];
  return { connus, paquets, choisi };
}
const recordDe = (idPaquet, jeu = "montre") => jeux().records[`${jeu}:${idPaquet}`] || 0;

// La course de verbes : mes verbes (vus ou en cours), aux temps déjà vus.
function donneesVerbes(ctx) {
  const paquets = J.paquetsVerbes(mesVerbes(ctx), verbesCours(ctx));
  const choisi = paquets.find(p => p.id === jeux().paquetVerbes && p.ouvert) || paquets[0];
  return { paquets, choisi, temps: J.tempsVus(ctx.pos.faites, TEMPS) };
}
// « au passé composé », « à l'imparfait » ; rien au présent.
const auTemps = t => t === "present" ? "" : `${t === "imp" ? "à l'" : "au "}${TEMPS[t].nom}`;

// La leçon du jour pas encore faite : Chispa le dit gentiment, sans rien bloquer.
function leconEnAttente(ctx) {
  const der = ctx.pos.derniere;
  return der && ctx.pos.dateFaite[der.id] === ctx.jour && !cases(ctx.jour)[`exos:${der.id}`] ? der : null;
}

// ——— la salle ———
function guirlande(ctx, vient) {
  const s = J.semaine(jeux().jours, ctx.jour);
  const couleurs = ["#D8472A", "#FFF6E0", "#0F8A83", "#13294B", "#D8472A", "#FFF6E0", "#0F8A83"];
  const q = (a, b, d, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * d;
  const amp = ["L", "M", "M", "J", "V", "S", "D"].map((j, i) => {
    const t = (i + .5) / 7, x = q(0, 195, 390, t).toFixed(1), y = q(8, 66, 8, t) + 13;
    return `<g class="f-amp${s.ampoules[i] ? " on" : ""}${i === s.auj ? " auj" : ""}${vient && i === s.auj ? " vient" : ""}" style="--c:${couleurs[i]}"><circle class="halo" cx="${x}" cy="${y.toFixed(1)}" r="22"/><circle cx="${x}" cy="${y.toFixed(1)}" r="13"/><text x="${x}" y="${(y + 33).toFixed(1)}">${j}</text></g>`;
  }).join("");
  const dit = `Cette semaine : ${s.n} jour${s.n > 1 ? "s" : ""} joué${s.n > 1 ? "s" : ""} sur 7.`;
  return { s, html: `<svg class="f-semaine" viewBox="0 0 390 96" role="img" aria-label="${dit}"><path d="M0 8Q195 66 390 8"/>${amp}</svg>` };
}

function vueSalle(ctx, d, dv) {
  const entree = document.getElementById("app")?.dataset.ecran !== "jeux";
  const vient = !!derniere?.ampoule;
  if (derniere) derniere.ampoule = false;
  const n = d.connus.length, joue = d.paquets[0].ouvert, rec = recordDe("tout");
  const g = guirlande(ctx, vient);
  const lecon = leconEnAttente(ctx);
  const bulle = lecon ? `<b>Ta leçon t'attend !</b> Vas-y d'abord si tu veux, je te garde la place.<br><a href="#/pratique/${lecon.id}/jour">Faire ma leçon</a>`
    : !joue ? `<b>¡Hola, Kevin!</b> Je prépare le stand. Encore ${J.SEUIL - n} mot${J.SEUIL - n > 1 ? "s" : ""} et on joue.`
    : vient ? `<b>Et une ampoule de plus !</b> ${g.s.n} cette semaine.`
    : rec ? `<b>¡Hola, Kevin!</b> Ton record : ${rec} points. On le bat ?`
    : g.s.ampoules[g.s.auj] ? `<b>¡Hola, Kevin!</b> On fait un tour ?`
    : `<b>¡Hola, Kevin!</b> Une partie, et j'allume l'ampoule d'aujourd'hui.`;
  const comptoir = `<h2>Contre la montre</h2><p>Un mot en espagnol, 4 sens en français. Le plus de points possible.</p>`;
  const stand = joue
    ? `<a class="f-stand" href="#/jeux/montre"><div class="f-toile"></div><div class="f-comptoir">${comptoir}
        <div class="f-ligne"><span>${rec ? `Ton record<b>${rec}</b>` : "Pas encore de record"}</span><span>${J.DUREE} secondes</span></div><span class="f-btn">Jouer</span></div></a>`
    : `<div class="f-stand"><div class="f-toile"></div><div class="f-comptoir">${comptoir}
        <div class="f-attente"><b>Arrive bientôt.</b> Il faut ${J.SEUIL} mots pour jouer, tu en as ${n}.</div></div></div>`;
  const recV = recordDe("tous", "verbes");
  const comptoirV = `<h2>La course de verbes</h2><p>Un verbe, une personne : trouve la bonne forme parmi 3.</p>`;
  const standVerbes = dv.paquets[0].ouvert
    ? `<a class="f-stand verbes" href="#/jeux/verbes"><div class="f-toile"></div><div class="f-comptoir">${comptoirV}
        <div class="f-ligne"><span>${recV ? `Ton record<b>${recV}</b>` : "Pas encore de record"}</span><span>${J.DUREE} secondes</span></div><span class="f-btn">Jouer</span></div></a>`
    : `<div class="f-stand verbes"><div class="f-toile"></div><div class="f-comptoir">${comptoirV}
        <div class="f-attente"><b>Arrive bientôt.</b> ${esc(dv.paquets[0].aide)}.</div></div></div>`;
  const ferme = (nom, quoi, quand = "Plus tard") => `<div class="f-stand ferme"><div class="f-toile"></div><div class="f-comptoir"><h2>${nom}</h2><p>${quoi}</p><span class="f-pancarte">${quand}</span></div></div>`;
  const bilan = g.s.meilleure > 1 ? `<p class="f-bilan">Ta meilleure semaine : ${g.s.meilleure} jours.</p>` : "";
  return {
    onglet: "jeux",
    html: `<div class="feria f-salle${entree ? " entree" : ""}">${g.html}
        <div class="f-haut"><h1>La Feria</h1>${boutonMuet()}</div>
        <div class="f-accueil"><a href="#/jeux/chispa" aria-label="Voir Chispa">${flamme(lecon ? "idle" : "joie", 2)}</a><p class="f-bulle">${bulle}</p></div>${bilan}
        <div class="f-stands">${stand}
          ${standVerbes}
          <a class="f-stand deux" href="#/jeux/deux"><div class="f-toile"></div><div class="f-comptoir"><h2>À deux</h2><p>Avec Blanca ou Dorian, sur le canapé : La Bomba et En la frente.</p><span class="f-btn">Jouer</span></div></a>
          ${vitrine()}
          <div class="f-petits">${ferme("Les paires", "5 mots, 5 sens, 3 vagues", "Le prochain jeu")}${ferme("La Tómbola", "Des boletos, une roue, des tenues pour Chispa")}${ferme("Le défi du jour", "Un seul essai par jour")}${ferme("L'album", "Des vignettes d'Espagne à collectionner")}</div>
        </div>
      </div>${barreOnglets("jeux")}`,
    apres: brancher,
  };
}

// ——— avant la partie ———
const JEUX = {
  montre: { titre: "Contre la montre", regle: "Tu entends un mot, tu touches son sens.", unite: "mots", cle: "paquet" },
  verbes: { titre: "La course de verbes", regle: "Un verbe et une personne : touche la bonne forme.", unite: "verbes", cle: "paquetVerbes" },
};
function vuePret(ctx, d, jeu = "montre") {
  const J0 = JEUX[jeu];
  const ligne = p => {
    const rec = recordDe(p.id, jeu);
    const sous = p.ouvert ? [p.titre ? titre(p.titre) : "", `${p.mots.length} ${J0.unite}`].filter(Boolean).join(" · ") : esc(p.aide);
    return `<button class="f-paquet" data-j="paquet" data-jeu="${jeu}" data-id="${esc(p.id)}" aria-pressed="${p === d.choisi}"${p.ouvert ? "" : " disabled"}><i></i><span>${esc(p.nom)}<small>${sous}</small></span>${p.ouvert && rec ? `<em aria-label="record ${rec}">${rec}</em>` : ""}</button>`;
  };
  const temps = jeu === "verbes" ? `<p class="f-temps-vus">Temps : ${d.temps.map(t => TEMPS[t].nom).join(", ")}.</p>` : "";
  return {
    onglet: null,
    html: `<div class="feria f-pret">
        <div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1>${J0.titre}</h1></div>
        <p class="f-regle">${J0.regle} <b>3 de suite : ×2. 6 : ×3. 10 : ¡FUEGO! ×5.</b> Une erreur, et le compteur repart à ×1.</p>
        <div><h2>Avec quels ${J0.unite} ?</h2><div class="f-paquets">${d.paquets.map(ligne).join("")}</div>${temps}</div>
        <div class="f-bas">${flamme("idle", 1)}<a class="f-btn gros" href="#/jeux/${jeu}/partie">¡Vamos!</a></div>
      </div>`,
    apres: brancher,
  };
}

// ——— la partie ———
function vuePartie(ctx, d, jeu = "montre") {
  return {
    onglet: null,
    html: `<div class="feria f-partie">
        <div class="f-hud"><a class="f-rond" href="#/jeux/${jeu}" data-arriere aria-label="Arrêter la partie">${ICONES.fermer}</a>
          <div class="f-temps" role="timer" aria-label="Temps restant"><i></i></div>${boutonMuet()}</div>
        <div class="f-points"><div class="f-score" aria-label="Score">0</div><div class="f-combo"><span class="f-multi un">×1</span><span class="f-pions"><i></i><i></i><i></i></span></div></div>
        <div class="f-carte"><span class="f-etiquette">${I.etoile}Mot surprise · devine !</span>${flamme("idle", 0)}<p class="f-mot" lang="es"></p>${jeu === "verbes" ? `<p class="f-personne"><span lang="es"></span><small></small></p>` : `<button class="f-son" data-j="redire" aria-label="Réécouter">${ICONES.play}</button>`}</div>
        <div class="f-reponses"></div>
        <div class="f-decompte"><b>3</b></div>
      </div>`,
    apres: () => { brancher(); lancer(ctx, d.choisi, jeu, d.temps); },
  };
}

function humeur(h, duree) {
  const m = $(".f-carte .m");
  if (!m) return;
  m.dataset.h = h;
  clearTimeout(humeur.t);
  if (duree) humeur.t = setTimeout(() => { if (m.isConnected) m.dataset.h = "idle"; }, duree);
}

function lancer(ctx, paquet, jeu = "montre", temps = ["present"]) {
  const racine = $(".f-partie");
  partie = { ctx, racine, jeu, temps, paquet, mots: paquet.mots, tirer: J.creerPioche(paquet.mots), q: null,
    score: 0, combo: 0, serie: 0, ok: 0, ko: 0, rates: [], trouves: [], bloque: true, fin: 0, pause: 0, tics: 5,
    // Le mot surprise : un mot des prochaines leçons, posé une fois, entre la 5e et la 7e question.
    n: 0, surpriseA: 4 + Math.floor(Math.random() * 3), surprise: jeu === "montre" ? J.motSurprise(motsAVenir(ctx), paquet.mots, jeux(), ctx.jour) : null, montre: null, apporte: null, devine: false };
  const p = partie;
  // Si on quitte l'appli (écran éteint, autre appli), le chrono attend.
  coupe = new AbortController();
  document.addEventListener("visibilitychange", () => {
    if (partie !== p || !p.fin) return;
    if (document.hidden) { p.pause = Math.max(0, p.fin - performance.now()); cancelAnimationFrame(image); taire(); }
    else if (p.pause) { p.fin = performance.now() + p.pause; p.pause = 0; image = requestAnimationFrame(tourner); }
  }, { signal: coupe.signal });
  const chiffre = $(".f-decompte b", racine);
  const pas = n => {
    if (partie !== p || !racine.isConnected) return;
    if (n === 0) {
      $(".f-decompte", racine).remove();
      p.fin = performance.now() + J.DUREE * 1000; p.bloque = false;
      poser(); image = requestAnimationFrame(tourner);
      return;
    }
    chiffre.textContent = n; chiffre.style.animation = "none"; void chiffre.offsetWidth; chiffre.style.animation = "";
    SONS.compte(); plusTard(() => pas(n - 1), calme() ? 450 : 700);
  };
  pas(3);
}

function poser() {
  const p = partie;
  if (!p || !p.racine.isConnected) return;
  const carte = $(".f-carte", p.racine), mot = $(".f-mot", p.racine);
  if (p.jeu === "verbes") return poserVerbe(carte, mot);
  const surprise = p.n++ === p.surpriseA && p.surprise;
  p.q = surprise ? { ...J.question(p.surprise, p.mots), surprise: true } : J.question(p.tirer(), p.mots);
  if (surprise) p.montre = p.surprise;
  carte.classList.toggle("surprise", !!surprise);
  mot.textContent = p.q.mot.es; mot.classList.toggle("long", p.q.mot.es.length > 16);
  carte.classList.remove("arrive"); void carte.offsetWidth; carte.classList.add("arrive");
  $(".f-reponses", p.racine).innerHTML = p.q.reponses.map((r, i) => `<button class="f-rep" data-j="rep" data-i="${i}">${esc(r.texte)}</button>`).join("");
  direMot(p.q.mot.es);
}

// La course de verbes : l'infinitif en grand, la personne (et le temps s'il n'est pas le présent) dessous.
// La voix dit la bonne forme une fois la réponse donnée. q.mot sert aux mots attrapés (un verbe) et aux formes ratées.
function poserVerbe(carte, mot) {
  const p = partie, x = p.tirer();
  const q = J.questionVerbe(x, p.temps, conjuguer);
  p.q = { ...q, mot: { id: `verbe:${x.v}`, es: q.bonne, fr: `${x.v} · ${PERSONNES[q.p]}${q.t === "present" ? "" : ` · ${TEMPS[q.t].nom}`}` } };
  mot.textContent = x.v; mot.classList.toggle("long", x.v.length > 16);
  const per = $(".f-personne", p.racine);
  per.firstElementChild.textContent = PERSONNES[q.p];
  per.lastElementChild.textContent = auTemps(q.t);
  carte.classList.remove("arrive"); void carte.offsetWidth; carte.classList.add("arrive");
  $(".f-reponses", p.racine).innerHTML = q.reponses.map((r, i) => `<button class="f-rep" data-j="rep" data-i="${i}" lang="es">${esc(r.texte)}</button>`).join("");
}

function tourner(t) {
  const p = partie;
  if (!p || !p.racine.isConnected) return arreter();
  const reste = Math.max(0, p.fin - t), barre = $(".f-temps", p.racine);
  barre.firstElementChild.style.transform = `scaleX(${reste / (J.DUREE * 1000)})`;
  const s = Math.ceil(reste / 1000);
  if (s <= 10) barre.classList.add("presse");
  if (s <= p.tics && s > 0) { p.tics = s - 1; SONS.tic(); }
  if (reste <= 0) return finir();
  image = requestAnimationFrame(tourner);
}

function majCombo(saut) {
  const p = partie, x = J.multi(p.combo), el = $(".f-multi", p.racine), pions = J.pions(p.combo);
  el.textContent = x === 5 ? "¡FUEGO! ×5" : `×${x}`;
  el.classList.toggle("un", x === 1);
  if (saut) { el.classList.remove("saut"); void el.offsetWidth; el.classList.add("saut"); }
  $(".f-pions", p.racine).innerHTML = Array.from({ length: pions.sur }, (_, i) => `<i${i < pions.pleins ? ' class="p"' : ""}></i>`).join("");
  $(".f-carte .m", p.racine).dataset.n = J.taille(p.combo);
  p.racine.classList.toggle("fuego", x === 5);
}

function repondre(bouton) {
  const p = partie;
  if (!p || p.bloque || !p.q) return;
  const r = p.q.reponses[Number(bouton.dataset.i)];
  if (p.q.surprise) return repondreSurprise(bouton, r.juste);
  if (p.jeu === "verbes") direMot(p.q.bonne);
  if (r.juste) {
    const avant = J.multi(p.combo);
    p.combo++; p.ok++; p.serie = Math.max(p.serie, p.combo); p.trouves.push(p.q.mot.id);
    const gain = J.points(p.combo);
    p.score += gain;
    bouton.classList.add("juste");
    const sc = $(".f-score", p.racine);
    sc.firstChild.textContent = p.score; sc.classList.remove("tic"); void sc.offsetWidth; sc.classList.add("tic");
    $(".f-plus", sc)?.remove(); sc.insertAdjacentHTML("beforeend", `<span class="f-plus" aria-hidden="true">+${gain}</span>`);
    const apres = J.multi(p.combo), monte = apres > avant;
    majCombo(monte);
    if (monte && apres === 5) {
      $(".f-carte", p.racine).insertAdjacentHTML("beforeend", `<span class="f-feu">¡FUEGO!</span>`);
      plusTard(() => $(".f-feu")?.remove(), 1400);
      humeur("joie", 1400); SONS.fuego(); vibrer([30, 40, 30, 40, 60]);
    } else {
      if (monte) { SONS.palier(); humeur("joie", 900); }
      SONS.juste(p.combo); vibrer(10);
    }
    p.bloque = true; plusTard(() => { p.bloque = false; poser(); }, p.jeu === "verbes" ? 450 : 230);
  } else {
    p.ko++; p.rates.push(p.q.mot); p.combo = 0;
    bouton.classList.add("faux");
    p.racine.querySelectorAll(".f-rep").forEach(b => {
      if (p.q.reponses[Number(b.dataset.i)].juste) b.classList.add("juste"); else if (b !== bouton) b.classList.add("pale");
    });
    p.racine.classList.remove("secoue"); void p.racine.offsetWidth; p.racine.classList.add("secoue");
    majCombo(false);
    humeur("grimace", 950); SONS.rate(); vibrer([40, 60, 40]);
    // La bonne réponse reste allumée 1 seconde : c'est le seul moment où le jeu apprend quelque chose. Le chrono continue.
    p.bloque = true; plusTard(() => { p.bloque = false; poser(); }, 1000);
  }
}

// Le mot surprise : un bonus si on devine, et le combo n'est jamais cassé (on ne pouvait pas le savoir).
// Il ne compte ni dans les erreurs, ni dans les mots qui ont échappé, ni dans les mots attrapés.
function repondreSurprise(bouton, juste) {
  const p = partie;
  p.apporte = p.q.mot; p.devine = juste;
  p.racine.querySelectorAll(".f-rep").forEach(b => {
    if (p.q.reponses[Number(b.dataset.i)].juste) b.classList.add("juste"); else b.classList.add(b === bouton ? "faux" : "pale");
  });
  if (juste) {
    p.score += J.BONUS_SURPRISE;
    const sc = $(".f-score", p.racine);
    sc.firstChild.textContent = p.score;
    $(".f-plus", sc)?.remove(); sc.insertAdjacentHTML("beforeend", `<span class="f-plus" aria-hidden="true">+${J.BONUS_SURPRISE} bonus</span>`);
    humeur("joie", 900); SONS.palier(); vibrer(15);
  } else SONS.rate();
  p.bloque = true; plusTard(() => { p.bloque = false; poser(); }, juste ? 600 : 1100);
}

function finir() {
  const p = partie;
  const r = J.apresPartie(jeux(), { jeu: p.jeu, paquet: p.paquet.id, score: p.score, ok: p.ok, ko: p.ko, serie: p.serie, trouves: p.trouves, surprise: p.montre?.id }, p.ctx.jour);
  garderJeux(r.jeux);
  const parId = new Map(p.jeu === "verbes" ? p.mots.map(x => [`verbe:${x.v}`, { es: x.v }]) : p.mots.map(m => [m.id, m]));
  derniere = { jeu: p.jeu, jour: p.ctx.jour, score: p.score, ok: p.ok, ko: p.ko, serie: p.serie, record: r.record, ancien: r.ancien, ampoule: r.ampoule, fete: true,
    rates: p.rates.filter((m, i, t) => t.indexOf(m) === i).slice(0, 6),
    apporte: p.apporte, devine: p.devine, garde: null,
    attrapes: r.attrapes.map(id => parId.get(id)?.es).filter(Boolean), mue: r.mue, trophees: r.trophees };
  arreter();
  location.replace(`#/jeux/${derniere.jeu}/fin`);
}

// ——— la fin ———
function vueFin() {
  const g = derniere;
  const h1 = g.record ? "Nouveau record !" : g.ancien && g.score >= g.ancien * .8 ? "Tout près du record." : g.ok ? "Belle partie !" : "On s'échauffe.";
  const sous = g.record ? (g.ancien ? `L'ancien était à ${g.ancien}.` : "Le premier d'une longue série.") : g.ancien ? `Record à battre : ${g.ancien}.` : "";
  const rates = g.rates.length ? `<div class="f-rates"><h2>${g.jeu === "verbes" ? "Les formes qui t'ont échappé" : "Les mots qui t'ont échappé"}</h2><ul>${g.rates.map(m =>
    `<li><div><b lang="es">${esc(m.es)}</b><span>${esc(m.fr)}</span></div><button data-dire="${esc(m.es)}" aria-label="Écouter : ${esc(m.es)}" aria-pressed="false">${ICONES.play}</button></li>`).join("")}</ul></div>` : "";
  return {
    onglet: null,
    html: `<div class="feria f-fin"><div class="f-corps">
        <div class="f-podium">${flamme(g.record || g.mue ? "joie" : "idle", g.record || g.mue ? 3 : 1)}<div><h1>${h1}</h1>${sous ? `<p>${sous}</p>` : ""}</div></div>
        <div class="f-total">${g.record ? `<span class="f-nouveau">Record battu</span>` : ""}
          <div class="f-gros"><b data-compte>${g.fete ? 0 : g.score}</b><span>ton record<i>${Math.max(g.ancien, g.score)}</i></span></div>
          <div class="f-chiffres"><div><b>${g.ok}</b>${g.jeu === "verbes" ? `forme${g.ok > 1 ? "s" : ""} trouvée${g.ok > 1 ? "s" : ""}` : `mot${g.ok > 1 ? "s" : ""} trouvé${g.ok > 1 ? "s" : ""}`}</div><div><b>${g.serie}</b>de suite, au mieux</div><div><b>${g.ko}</b>erreur${g.ko > 1 ? "s" : ""}</div></div></div>
        ${carteApporte(g)}
        ${braises(g)}
        ${g.trophees.map(t => `<div class="f-gagne">${rosette(t.couleur)}<div><b>${esc(t.nom)}</b>Nouveau trophée · ${esc(t.quoi)}</div></div>`).join("")}
        ${rates}
      </div><div class="f-bas"><a class="f-btn gros" href="#/jeux/${g.jeu}/partie" data-remplace>Encore une !</a><a class="f-retour" href="#/jeux" data-remplace>Retour à la Feria</a></div></div>`,
    apres: () => { brancher(); feter(); },
  };
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
  if (g.record) plusTard(() => { SONS.record(); vibrer([40, 60, 40, 60, 120]); confettis(); }, 900);
  else SONS.fin();
}

function confettis() {
  const hote = $(".f-fin");
  if (calme() || !hote) return;
  const c = document.createElement("canvas"); c.className = "f-confettis"; hote.append(c);
  const l = innerWidth, h = innerHeight, k = Math.min(devicePixelRatio || 1, 2);
  c.width = l * k; c.height = h * k;
  const x = c.getContext("2d"); x.scale(k, k);
  const couleurs = ["#D8472A", "#FFF6E0", "#0F8A83", "#13294B", "#F0742B"];
  const p = Array.from({ length: 90 }, () => ({ x: l / 2 + (Math.random() - .5) * 80, y: h * .3, vx: (Math.random() - .5) * 11, vy: -Math.random() * 12 - 4,
    w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - .5) * .4, c: couleurs[Math.floor(Math.random() * 5)] }));
  const t0 = performance.now();
  const pas = t => {
    const age = t - t0;
    x.clearRect(0, 0, l, h);
    for (const q of p) {
      q.vy += .32; q.vx *= .99; q.x += q.vx; q.y += q.vy; q.a += q.va;
      x.save(); x.translate(q.x, q.y); x.rotate(q.a); x.globalAlpha = Math.max(0, 1 - age / 2600); x.fillStyle = q.c; x.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); x.restore();
    }
    if (age < 2600 && c.isConnected) requestAnimationFrame(pas); else c.remove();
  };
  requestAnimationFrame(pas);
}

// ——— le mot apporté par Chispa, les mots attrapés, les trophées ———
function carteApporte(g) {
  const m = g.apporte;
  if (!m) return "";
  const suite = g.garde === "oui"
    ? `<p class="f-suite">Gardé ! Tu le reverras demain dans « Tes mots à revoir », puis dans les jeux.${J.peutSurprendre(jeux(), g.jour) ? "" : " C'était ton 2e mot du jour : le prochain viendra demain."}</p>`
    : g.garde === "non" ? `<p class="f-suite">D'accord. Tu le verras avec le prof, à sa leçon.</p>`
    : `<div class="f-deux"><button data-j="garder">Je le garde</button><button data-j="pasgarder">Pas maintenant</button></div>`;
  return `<div class="f-apporte"><span class="f-k">${I.etoile}${g.devine ? "Bien deviné !" : "Chispa t'a apporté un mot"} · ${id(m.lecon)}</span>
    <p class="f-es"><span lang="es">${esc(m.es)}</span><button data-dire="${esc(m.es)}" aria-label="Écouter : ${esc(m.es)}" aria-pressed="false">${ICONES.play}</button></p>
    <p class="f-fr">${esc(m.fr)}</p>${m.ex ? `<p class="f-ex" lang="es">${esc(m.ex)}</p>` : ""}${suite}</div>`;
}

// « Je le garde » : le mot du livre est appris en avance, comme depuis le Dico (révision dès demain).
function garder(oui, carte) {
  const g = derniere;
  if (!g?.apporte || g.garde) return;
  g.garde = oui ? "oui" : "non";
  if (oui) { apprendreEnAvance(g.apporte.id, g.jour); garderJeux(J.garderSurprise(jeux(), g.jour)); vibrer(12); }
  if (carte) carte.outerHTML = carteApporte(g);
}

const jauge = part => `<span class="f-jauge"><i style="width:${Math.round(Math.max(0, Math.min(1, part)) * 100)}%"></i></span>`;
function braises(g) {
  const n = J.attrapes(jeux()), e = J.etape(n);
  const titreB = g.mue ? `Chispa devient ${e.nom} !` : g.attrapes.length ? `+${g.attrapes.length} mot${g.attrapes.length > 1 ? "s" : ""} attrapé${g.attrapes.length > 1 ? "s" : ""}` : "Pas de nouveau mot attrapé";
  const detail = g.attrapes.length ? `<span lang="es">${g.attrapes.slice(0, 4).map(esc).join(", ")}${g.attrapes.length > 4 ? "…" : ""}</span>`
    : `Un mot est attrapé à la ${J.ATTRAPE}e partie où tu le trouves.`;
  return `<a class="f-braises${g.mue ? " mue" : ""}" href="#/jeux/chispa">${flamme(g.mue ? "joie" : "idle", 3)}<span><b>${titreB}</b>${detail}
    ${jauge(e.part)}${e.suivant ? `${n} sur ${e.suivant.seuil} pour Chispa ${e.suivant.nom}` : `${n} mots attrapés`}</span></a>`;
}

// Une rosette de fête, gagnée (pleine) ou à gagner (en pointillés).
function rosette(c, gagne = true) {
  if (!gagne) return `<svg class="f-rosette" viewBox="0 0 44 52" aria-hidden="true"><circle cx="22" cy="20" r="16" fill="none" stroke="#9C8450" stroke-width="2" stroke-dasharray="4 4"/><path d="M15 34l-4 14 8-4 3 6M29 34l4 14-8-4-3 6" fill="none" stroke="#9C8450" stroke-width="2" stroke-dasharray="4 4" stroke-linejoin="round"/></svg>`;
  const petales = Array.from({ length: 10 }, (_, i) => `<circle cx="${(22 + 15 * Math.cos(i * Math.PI / 5)).toFixed(1)}" cy="${(20 + 15 * Math.sin(i * Math.PI / 5)).toFixed(1)}" r="5.2"/>`).join("");
  return `<svg class="f-rosette" viewBox="0 0 44 52" aria-hidden="true"><path d="M14 30l-5 20 9-5 4 7 4-18zM30 30l5 20-9-5-4 7-4-18z" fill="${c}" opacity=".75"/><g fill="${c}">${petales}<circle cx="22" cy="20" r="15"/></g><circle cx="22" cy="20" r="10" fill="#FFF6E0"/><path d="M17 20.5l3.5 3.5 6.5-7" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function vitrine() {
  const j = jeux(), n = J.TROPHEES.filter(t => j.trophees[t.id]).length;
  return `<a class="f-vitrine" href="#/jeux/trophees"><span class="f-rosettes">${J.TROPHEES.slice(0, 4).map(t => rosette(t.couleur, !!j.trophees[t.id])).join("")}</span>
    <span><b>Tes trophées</b>${n} sur ${J.TROPHEES.length}</span>${ICONES.chevron}</a>`;
}

function vueTrophees() {
  const j = jeux();
  const ligne = t => {
    const ok = !!j.trophees[t.id];
    const val = t.score ? j.meilleur : t.trouves ? j.trouves : 0, max = t.score || t.trouves;
    const reste = !ok && max ? ` · ${val.toLocaleString("fr-FR")} sur ${max.toLocaleString("fr-FR")}${jauge(val / max)}` : "";
    return `<li class="${ok ? "" : "pas"}">${rosette(t.couleur, ok)}<span><b>${esc(t.nom)}</b>${esc(t.quoi)}${reste}</span>${ok ? "<em>gagné</em>" : ""}</li>`;
  };
  return {
    onglet: "jeux",
    html: `<div class="feria f-page"><div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1>Tes trophées</h1></div>
        <p class="f-note">Des rosettes, comme à la feria. Elles se gagnent en jouant.</p>
        <ul class="f-liste">${J.TROPHEES.map(ligne).join("")}</ul>
      </div>${barreOnglets("jeux")}`,
    apres: brancher,
  };
}

function vueChispa() {
  const n = J.attrapes(jeux()), e = J.etape(n);
  return {
    onglet: "jeux",
    html: `<div class="feria f-page"><div class="f-tete"><a class="f-rond" href="#/jeux" aria-label="Retour à la Feria">${ICONES.retour}</a><h1>Chispa</h1></div>
        <div class="f-scene">${flamme("joie", 3)}</div>
        <div class="f-fiche"><h2>Chispa ${e.nom}</h2><p>${n} mot${n > 1 ? "s" : ""} attrapé${n > 1 ? "s" : ""}${e.suivant ? ` · Chispa ${e.suivant.nom} à ${e.suivant.seuil}` : ""}</p>${jauge(e.part)}</div>
        <div class="f-etapes">${J.ETAPES.map((x, i) => `<div class="${i === e.i ? "ici" : i > e.i ? "loin" : ""}">${chispa("idle", 3, i)}${x.nom}<br>${x.seuil ? `${x.seuil} mots` : "début"}</div>`).join("")}</div>
        <p class="f-note">Un mot est « attrapé » quand tu l'as trouvé juste dans ${J.ATTRAPE} parties différentes. Pour faire changer Chispa, il faut donc des mots nouveaux : ceux de tes prochaines leçons. Elle ne redescend jamais, et ta révision n'est pas touchée.</p>
      </div>${barreOnglets("jeux")}`,
    apres: brancher,
  };
}

// ——— les touchers propres à la Feria (le reste, liens et « écouter », est géré par app.js) ———
function brancher() {
  document.querySelector('meta[name="theme-color"]').content = "#F7B91C";
  const racine = $(".feria");
  racine?.addEventListener("click", e => {
    const b = e.target.closest("[data-j]");
    if (!b) return;
    const quoi = b.dataset.j;
    if (quoi === "rep") return repondre(b);
    if (quoi === "redire") return partie?.q && direMot(partie.q.mot.es);
    if (quoi === "muet") {
      garderJeux({ ...jeux(), muet: !jeux().muet });
      if (jeux().muet) taire();
      b.outerHTML = boutonMuet();
      return;
    }
    if (quoi === "garder" || quoi === "pasgarder") return garder(quoi === "garder", b.closest(".f-apporte"));
    if (quoi === "paquet") {
      garderJeux({ ...jeux(), [JEUX[b.dataset.jeu || "montre"].cle]: b.dataset.id });
      racine.querySelectorAll('[data-j="paquet"]').forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    }
  });
}

export function ecranJeux(ctx, quoi, etape) {
  arreter();
  const d = donnees(ctx);
  if (["deux", "bomba", "frente"].includes(quoi)) return ecranDeux(ctx, quoi, etape);
  if (quoi === "trophees") return vueTrophees();
  if (quoi === "chispa") return vueChispa();
  if (quoi === "verbes") {
    const dv = donneesVerbes(ctx);
    if (dv.choisi.ouvert) {
      if (etape === "partie") return vuePartie(ctx, dv, "verbes");
      if (etape === "fin" && derniere?.jeu === "verbes") return vueFin();
      return vuePret(ctx, dv, "verbes");
    }
  }
  if (quoi === "montre" && d.choisi.ouvert) {
    if (etape === "partie") return vuePartie(ctx, d);
    if (etape === "fin" && derniere?.jeu === "montre") return vueFin();
    return vuePret(ctx, d);
  }
  return vueSalle(ctx, d, donneesVerbes(ctx));
}
