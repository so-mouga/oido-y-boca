// La Charla, le défi du jour de la Feria : le moteur, sans écran et sans import (il se teste avec node).
// Une petite conversation en espagnol avec quelqu'un de Huesca. À chaque message de la personne, 3 réponses mélangées :
// la juste, un piège (presque juste) et une pour rire (correcte, mais à côté). Pas de chrono, pas de points.
// La charla du jour : un seul essai, fixe pour la journée, elle allume l'ampoule. Les anciennes se rejouent sans score.
// Les conversations sont dans charlas/ (un fichier par bloc de 5 unités) ; leur format est décrit dans charlas/index.js.

// Les types d'erreur qu'un piège peut porter (4e case du piège, facultative). Pas encore branché : plus tard, la Charla
// pourra choisir les pièges d'après les vraies erreurs de Kevin (carnet du prof, « Mes erreurs »).
export const ERREURS = {
  "ser-estar": "ser ou estar",
  personne: "la personne du verbe (trabajas / trabajo)",
  temps: "le temps du verbe",
  preposition: "a, en, de, por, para…",
  article: "el, la, un, una…",
  genre: "masculin ou féminin",
  nombre: "les nombres",
  heure: "l'heure (son las / a las)",
  formule: "les formules toutes faites (hola, hasta luego…)",
  question: "le mot de la question (dónde, cuándo, cuánto…)",
  ordre: "l'ordre des mots",
  gustar: "gustar et ses amis (me gusta / me gustan)",
};

// Le numéro d'unité d'une leçon (« U12-L3 » → 12), null pour Noël. Le bloc d'une unité : 1 pour U1-U5, 2 pour U6-U10…
export const uniteDe = lecon => { const m = /^U(\d+)-/.exec(lecon || ""); return m ? Number(m[1]) : null; };
export const blocDe = n => (n ? Math.ceil(n / 5) : null);

// La fiche d'une personne : une fiche de la troupe (perso: "marta") ou une fiche écrite dans la conversation.
export const persoDe = (c, troupe) => (typeof c.perso === "string" ? troupe[c.perso] : c.perso) || { nom: "?", qui: "", couleur: ["#3D5275", "#E8B98E"] };

// Un hasard fixe pour une journée (le même jour donne toujours le même tirage).
export function hasardDuJour(jour, sel = "") {
  let a = 0;
  for (const c of jour + sel) a = (Math.imul(a, 31) + c.charCodeAt(0)) | 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function melanger(t, hasard = Math.random) {
  t = [...t];
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}
const tirer = (t, hasard) => t[Math.floor(hasard() * t.length)];

// Les 3 réponses d'un échange, mélangées : la juste, un piège et une pour rire, tirés au hasard (une partie rejouée change).
// [{ t, sorte: "ok" | "piege" | "rire", reaction, expl, erreur }]
export function reponses(e, hasard = Math.random) {
  const [pt, pr, pe, erreur] = tirer(e.pieges, hasard);
  const [rt, rr, re] = tirer(e.rires, hasard);
  return melanger([
    { t: e.ok, sorte: "ok" },
    { t: pt, sorte: "piege", reaction: pr, expl: pe, erreur: erreur || null },
    { t: rt, sorte: "rire", reaction: rr, expl: re },
  ], hasard);
}

// Les conversations débloquées : leur leçon est faite.
export const debloquees = (charlas, faites) => charlas.filter(c => faites.has(c.lecon));

// La charla du jour. etat : jeux.charla ({ jours: { date: { id, ok, sur } } }) ; unite : le numéro de l'unité de Kevin.
// Parmi les débloquées : d'abord celles jamais faites, en priorité celles du bloc de Kevin ; jamais celle de la dernière fois.
// Quand il n'y a plus de nouvelle : une ancienne (plusDeNouvelle). Le tirage ne regarde que les jours d'avant : il reste
// le même toute la journée, même une fois la charla faite. Rend { charla, faite (le résultat d'aujourd'hui ou null), plusDeNouvelle } ou null.
export function charlaDuJour(charlas, { faites, unite, etat }, jour) {
  const jours = etat?.jours || {};
  const parId = new Map(charlas.map(c => [c.id, c]));
  const auj = jours[jour];
  if (auj && parId.has(auj.id)) return { charla: parId.get(auj.id), faite: auj, plusDeNouvelle: !!auj.ancienne };
  const ouvertes = debloquees(charlas, faites);
  if (!ouvertes.length) return null;
  const avant = Object.keys(jours).filter(d => d < jour).sort();
  const deja = new Set(avant.map(d => jours[d].id));
  const hier = avant.length ? jours[avant[avant.length - 1]].id : null;
  const hasard = hasardDuJour(jour, "charla");
  const nouvelles = ouvertes.filter(c => !deja.has(c.id));
  const duBloc = nouvelles.filter(c => blocDe(uniteDe(c.lecon)) === blocDe(unite));
  if (nouvelles.length) return { charla: tirer(duBloc.length ? duBloc : nouvelles, hasard), faite: null, plusDeNouvelle: false };
  const autres = ouvertes.filter(c => c.id !== hier);
  return { charla: tirer(autres.length ? autres : ouvertes, hasard), faite: null, plusDeNouvelle: true };
}

// Les anciennes, à rejouer : les charlas déjà faites (comme charla du jour), de la plus récente à la plus ancienne,
// avec le score de la première fois. sauf : l'identifiant à laisser de côté (celle d'aujourd'hui).
export function anciennes(charlas, etat, sauf = null) {
  const jours = etat?.jours || {};
  const premier = new Map();
  for (const d of Object.keys(jours).sort()) if (!premier.has(jours[d].id)) premier.set(jours[d].id, { ...jours[d], jour: d });
  const parId = new Map(charlas.map(c => [c.id, c]));
  return [...premier.values()].filter(x => x.id !== sauf && parId.has(x.id))
    .sort((a, b) => (a.jour < b.jour ? 1 : -1)).map(x => ({ charla: parId.get(x.id), ok: x.ok, sur: x.sur }));
}

// La fin de la charla du jour : le résultat est gardé, et l'ampoule du jour s'allume (la guirlande de la Feria : jeux.jours).
// Une charla rejouée ne change rien. Rend { jeux, ampoule } (ampoule : vient de s'allumer).
export function apresCharla(jeux, { id, ok, sur, ancienne = false }, jour) {
  const charla = { jours: {}, relues: {}, ...(jeux.charla || {}) };
  if (charla.jours[jour]) return { jeux, ampoule: false };
  const jours = jeux.jours || [];
  const ampoule = !jours.includes(jour);
  return {
    jeux: { ...jeux, jours: ampoule ? [...jours, jour] : jours, charla: { ...charla, jours: { ...charla.jours, [jour]: { id, ok, sur, ...(ancienne ? { ancienne: true } : {}) } } } },
    ampoule,
  };
}

// La page de relecture (pour Blanca) : cocher « relue ».
export function relire(jeux, id, oui, jour) {
  const charla = { jours: {}, relues: {}, ...(jeux.charla || {}) };
  const relues = { ...charla.relues };
  if (oui) relues[id] = jour; else delete relues[id];
  return { ...jeux, charla: { ...charla, relues } };
}

// Les mots d'une phrase, pour comparer : minuscules, sans accents ni ponctuation (indulgent, comme le micro).
export const mots = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);

// Ce que le micro a compris : chaque mot de la phrase, compris ou pas. entendus : Set de mots(…) de ce qui a été entendu.
export function compris(phrase, entendus) {
  const liste = phrase.split(/\s+/).filter(Boolean).map(w => ({ w, oui: mots(w).length > 0 && mots(w).every(x => entendus.has(x)) }));
  // Un « mot » sans lettre (un émoji, un tiret) ne compte pas.
  const vrais = liste.filter(x => mots(x.w).length);
  return { liste, n: vrais.filter(x => x.oui).length, sur: vrais.length };
}

// Pour la voix : sans émojis.
export const pourLaVoix = t => String(t || "").replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "").replace(/\s{2,}/g, " ").trim();
