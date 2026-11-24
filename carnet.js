// « Mes erreurs » (chantier 11) : des cartes faites toutes seules depuis le carnet du prof (Google Doc « Espagnol – Carnet de suivi »).
// Le script Google (outils/sauvegarde.gs, demande « quoi=carnet ») renvoie le carnet presque brut :
//   { tableau: [[cellules], …] (le tableau de « 2. Mes erreurs fréquentes »), bilans: ["paragraphe", …] (la section « 4. Bilans ») }.
// Ici, on en fait des cartes, on garde une copie sur le téléphone, et on choisit les cartes du jour.
// Le carnet n'est jamais modifié : l'appli le lit, rien d'autre.
//
// Une carte erreur : { type: "erreur", cle, erreur, note, bonne, regle, vue } ; « Corrige : erreur », tu écris la bonne forme.
// Une carte phrase : { type: "phrase", cle, lecon, date, es } ; ta phrase personnalisée, à redire de mémoire.
// La clé vient de la bonne forme (ou de la phrase) : si le prof change la règle ou le nombre de fois, la carte garde ses progrès ;
// s'il change la bonne forme, c'est une autre carte, qui repart de zéro.

import { corriger } from "./corriger.js?v=55";

const CLE_COPIE = "oyb.carnet";
export const MAX_PAR_JOUR = 5; // dont 1 phrase à dire au plus
// Jours avant de revoir une carte, selon sa boîte : ratée → demain, réussie → 3 jours, puis 7, 14…
const INTERVALLES = [1, 3, 7, 14, 30, 60];

// La petite ligne sous « Ta phrase de U1-L2 · Qui je suis » : ce que dit la phrase, sans la donner. Écrite à la main, leçon par leçon ;
// sans ligne, le titre de la leçon suffit.
export const SUJETS = {
  "U1-L2": "Ta présentation : ton nom, ta nationalité, ton âge.",
};

const PONCTUATION = /[¿?¡!.,;:«»"“”'’()…\-–—]/g;
// Pour la clé : minuscules, sans ponctuation, mais avec les accents (« mas » et « más » sont deux réponses différentes).
export const normaliser = t => String(t || "").toLowerCase().replace(PONCTUATION, " ").replace(/\s+/g, " ").trim();

// Les notes du prof entre parenthèses ne sont pas à écrire : « perro (pour « mais ») » → { texte: "perro", note: "pour « mais »" }.
export function separer(texte) {
  const notes = [];
  const sans = String(texte || "").replace(/\s*\(([^()]*)\)/g, (_, n) => { notes.push(n.trim()); return ""; }).replace(/\s+/g, " ").trim();
  return { texte: sans, note: notes.filter(Boolean).join(" · ") };
}

const minuscules = s => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

// Le carnet brut → { erreurs, phrases }. Le tableau est retrouvé par ses titres de colonnes, dans n'importe quel ordre.
export function lireCarnet(brut) {
  const lignes = (Array.isArray(brut?.tableau) ? brut.tableau : []).map(l => (Array.isArray(l) ? l : []).map(c => String(c ?? "").trim()));
  const iEntete = lignes.findIndex(l => l.some(c => minuscules(c) === "bonne forme"));
  const erreurs = [];
  if (iEntete >= 0) {
    const entete = lignes[iEntete].map(minuscules);
    const col = debut => entete.findIndex(c => c.startsWith(debut));
    const [cE, cB, cR, cV] = [col("erreur"), col("bonne forme"), col("règle"), col("vue")];
    for (const l of lignes.slice(iEntete + 1)) {
      const e = separer(l[cE]), b = separer(l[cB]);
      if (!e.texte || !b.texte) continue;
      const cle = `e:${normaliser(b.texte)}`;
      if (erreurs.some(x => x.cle === cle)) continue;
      erreurs.push({
        type: "erreur", cle, erreur: e.texte, note: e.note, bonne: b.texte,
        regle: cR >= 0 ? l[cR] || "" : "", vue: Math.max(1, parseInt(cV >= 0 ? l[cV] : "", 10) || 1),
      });
    }
  }
  const phrases = [];
  for (const p of Array.isArray(brut?.bilans) ? brut.bilans : []) {
    const m = String(p || "").replace(/\s+/g, " ").trim().match(/^phrase personnalisée\s*\(\s*([^,)]+?)\s*(?:,\s*([^)]*))?\)\s*:\s*(.+)$/i);
    if (!m) continue;
    const es = m[3].trim(), cle = `p:${normaliser(es)}`;
    if (es && !phrases.some(x => x.cle === cle)) phrases.push({ type: "phrase", cle, lecon: m[1].trim(), date: (m[2] || "").trim(), es });
  }
  return { erreurs, phrases };
}

// ——— la copie sur le téléphone ———

export function carnetActuel() {
  try {
    const c = JSON.parse(localStorage.getItem(CLE_COPIE));
    return c && Array.isArray(c.erreurs) && Array.isArray(c.phrases) ? c : null;
  } catch { return null; }
}
export function garderCarnet(carnet, lu) {
  try { localStorage.setItem(CLE_COPIE, JSON.stringify({ ...carnet, lu })); } catch { /* stockage indisponible */ }
}

// ——— le rythme : une fiche par carte, { boite, vu, vue } ———

const jours = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
const toutes = carnet => carnet ? [...carnet.erreurs, ...carnet.phrases] : [];

// Une carte jamais vue est à faire tout de suite ; une carte vue aujourd'hui attend demain.
function retard(f, jour) {
  if (!f?.vu) return Infinity;
  if (f.vu >= jour) return -1;
  return jours(f.vu, jour) - INTERVALLES[Math.min(f.boite || 0, INTERVALLES.length - 1)];
}

export const faitesAujourdhui = (carnet, fiches, jour) => toutes(carnet).filter(c => fiches[c.cle]?.vu === jour).length;

// Les cartes du jour : 5 au plus (moins celles déjà faites aujourd'hui), dont 1 phrase au plus.
// Les erreurs les plus fréquentes d'abord (« Vue (fois) »), puis les plus en retard.
export function cartesDuJour(carnet, fiches, jour) {
  if (!carnet) return [];
  const place = MAX_PAR_JOUR - faitesAujourdhui(carnet, fiches, jour);
  if (place <= 0) return [];
  const dues = liste => liste.map(c => ({ c, r: retard(fiches[c.cle], jour) })).filter(x => x.r >= 0);
  const erreurs = dues(carnet.erreurs).sort((a, b) => b.c.vue - a.c.vue || b.r - a.r).map(x => x.c);
  const phraseFaite = carnet.phrases.some(p => fiches[p.cle]?.vu === jour);
  const phrase = phraseFaite ? [] : dues(carnet.phrases).sort((a, b) => b.r - a.r).map(x => x.c).slice(0, 1);
  return [...erreurs.slice(0, place - phrase.length), ...phrase].slice(0, place);
}

// Après une carte : "juste" (sans indice) → la boîte suivante ; "aide" (juste avec l'indice) → même boîte ; "rate" → demain.
export function nouvelleFiche(f, resultat, jour, vue) {
  const b = f?.boite || 0;
  const boite = resultat === "juste" ? Math.min(b + 1, INTERVALLES.length - 1) : resultat === "rate" ? 0 : b;
  return { boite, vu: jour, ...(vue && { vue }) };
}
// « Elle revient demain » / « dans 3 jours ».
export function quandRevient(f) {
  const n = INTERVALLES[Math.min(f?.boite || 0, INTERVALLES.length - 1)];
  return n === 1 ? "demain" : `dans ${n} jours`;
}

// Quand un nouveau carnet arrive : les fiches des lignes retirées par le prof disparaissent ; une erreur que le prof
// a notée une fois de plus (« Vue » qui monte) repart en boîte 0, donc revient dès que possible.
// Protection : un carnet sans aucune carte (tableau cassé, section renommée…) ne touche à rien.
export function synchroniser(fiches, carnet) {
  const cartes = toutes(carnet);
  if (!cartes.length) return fiches;
  const r = {};
  for (const c of cartes) {
    const f = fiches[c.cle];
    if (!f) continue;
    r[c.cle] = c.vue && f.vue && c.vue > f.vue ? { ...f, boite: 0, vue: c.vue } : f;
  }
  return r;
}

// ——— juger une réponse écrite ———
// Les accents et le ñ comptent (corriger avec accents: true) ; la casse et la ponctuation non.
// Un ¿ ou un ¡ oublié ne compte pas faux, mais on le rappelle.
export function juger(tape, carte) {
  const r = corriger(tape, [carte.bonne], { accents: true });
  const ok = r.niveau === "juste";
  const oubli = ["¿", "¡"].find(s => carte.bonne.includes(s) && !String(tape).includes(s));
  const rappel = ok && oubli ? `N'oublie pas le ${oubli} au début ${oubli === "¿" ? "d'une question" : "d'une exclamation"}.` : "";
  return { ...r, ok, rappel };
}

// ——— plusieurs fautes sur une ligne (Q11-11) : une case par faute ———
// « manana, anos, espagnol, murer » → « mañana, años, español, mujer » : 4 cases. On coupe sur « ; », sinon sur les virgules,
// seulement si les deux côtés donnent le même nombre de morceaux. Une seule bonne forme pour plusieurs fautes
// (« trabojo, trobajo » → « trabajo ») : chaque case attend cette forme. Sinon (une faute, ou un découpage qui ne tombe pas juste) : null, une seule case.
const morceaux = (texte, sep) => texte.split(sep).map(t => t.trim()).filter(Boolean);
export function decouper(carte) {
  for (const sep of [";", ","]) {
    const f = morceaux(carte.erreur, sep), b = morceaux(carte.bonne, sep);
    if (f.length < 2) continue;
    if (b.length === f.length) return f.map((faute, i) => ({ faute, bonne: b[i] }));
    if (b.length === 1 && !carte.bonne.includes(sep === ";" ? "," : ";")) return f.map(faute => ({ faute, bonne: b[0] }));
  }
  return null;
}

// Juge chaque case. Renvoie { ok (toutes justes), justes, lignes: [{ faute, bonne, saisie, ok, r }], astuce, rappel }.
export function jugerCases(saisies, cases) {
  const lignes = cases.map((c, i) => {
    const saisie = String(saisies[i] || "").trim();
    const r = saisie ? juger(saisie, { bonne: c.bonne }) : { ok: false, niveau: "faux" };
    return { ...c, saisie, ok: r.ok, r };
  });
  const premiere = lignes.find(l => !l.ok && l.r.astuce);
  const rappel = lignes.find(l => l.ok && l.r.rappel)?.r.rappel || "";
  return { ok: lignes.every(l => l.ok), justes: lignes.filter(l => l.ok).length, lignes, astuce: premiere?.r.astuce || "", rappel };
}
