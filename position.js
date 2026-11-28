// Où j'en suis dans le livre, d'après l'onglet « Suivi » (écrit seulement par le prof).
// Fait = une ligne de type « leçon » pour cette leçon. L'appli n'ouvre que ce qui est fait.
// Chantier 22 : la prochaine séance avec le prof (leçon, contrôle, consolidation ou oral), dans l'ordre du prof (prochaineSeance).

import { PARTIES } from "./livre.js?v=79";

export const UNITES = PARTIES.flatMap(p => p.unites.map(u => ({ ...u, partie: p.n })));
export const LECONS = UNITES.flatMap(u => u.lecons.map(l => ({ ...l, unite: u, partie: u.partie })));
const PAR_ID = Object.fromEntries(LECONS.map(l => [l.id, l]));
export const lecon = id => PAR_ID[id] || null;

const SEUIL_CONTROLE = 80;
const NOEL = { debut: "2026-12-21", fin: "2026-12-27" };

export const isoDuJour = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Lit « Suivi » et renvoie tout ce que les écrans ont besoin de savoir.
export function calculerPosition(suivi, aujourdhui = isoDuJour()) {
  const lignesLecon = suivi.filter(s => s.type === "leçon" && PAR_ID[s.lecon]);
  const faites = new Set(lignesLecon.map(s => s.lecon));
  const dateFaite = {};
  for (const s of lignesLecon) if (s.date && (!dateFaite[s.lecon] || s.date > dateFaite[s.lecon])) dateFaite[s.lecon] = s.date;

  // Contrôles : meilleur score par unité (« U3-contrôle »).
  const controles = {};
  for (const s of suivi.filter(s => s.type === "contrôle")) {
    const id = s.lecon.replace(/-contr[oô]le$/i, "");
    if (!Number.isNaN(s.score)) controles[id] = Math.max(controles[id] ?? 0, s.score);
  }
  const controleReussi = id => (controles[id] ?? -1) >= SEUIL_CONTROLE;

  // La dernière leçon faite : la plus récente par date, puis par ordre des lignes.
  const derniere = lignesLecon.length
    ? lignesLecon.reduce((a, b) => ((b.date || "") > (a.date || "") || ((b.date || "") === (a.date || "") && b.rang > a.rang)) ? b : a)
    : null;

  const prochaine = prochaineEtape(faites, controleReussi, aujourdhui);

  return {
    faites, dateFaite, controles, controleReussi,
    derniere: derniere ? PAR_ID[derniere.lecon] : null,
    prochaine,
    seanceDuJour: suivi.some(s => s.date === aujourdhui),
    // La ligne du jour (la dernière s'il y en a plusieurs) : l'accueil dit quelle séance a été faite.
    ligneDuJour: suivi.filter(s => s.date === aujourdhui).sort(ordreSuivi).at(-1) || null,
    seance: prochaineSeance(suivi, prochaine),
    nbFaites: faites.size,
  };
}

// ── Chantier 22 : la séance orale (règle du prof, 27 nov. 2026) ──
// Plus de jour fixe : après 4 séances de travail (lignes leçon, consolidation, contrôle ou reprise ; pas orale ni bilan),
// la suivante est orale, quel que soit le jour. On compte depuis la dernière ligne « orale », ou, s'il n'y en a pas encore,
// les lignes datées du 30 nov. 2026 ou après (ce lundi-là, c'est une leçon). « oral » sans e est accepté aussi.
// L'ordre du prof, pour la prochaine séance :
//   1. la dernière séance est un contrôle sous 80 % → une consolidation, puis on refait le contrôle ;
//   2. sinon, la dernière leçon a « Grammaire non validée » et moins de 2 consolidations depuis (aucune « Grammaire validée »)
//      → une consolidation (une 3e si je la choisis : le prof écrit sa ligne, l'appli suit le lendemain) ;
//   3. sinon, 4 séances de travail depuis le dernier oral → l'oral ;
//   4-5. sinon, le contrôle de l'unité terminée, ou la leçon suivante (prochaineEtape).
// L'appli ne fait qu'annoncer : c'est le prof qui décide, et sa ligne du lendemain fait foi.
export const DEBUT_ORAL = "2026-11-30";
export const SEANCES_AVANT_ORAL = 4;
const TRAVAIL = new Set(["leçon", "consolidation", "contrôle", "reprise"]);
export const estOrale = s => s.type === "orale" || s.type === "oral";
// La remarque commence toujours par « Grammaire validée : 85 %. » ou « Grammaire non validée : 70 %. » (règle du prof, 28 nov.) :
// on ne regarde que le début, pour qu'un résumé qui en reparle (« la grammaire non validée hier… ») ne compte pas.
const NON_VALIDEE = /^\s*grammaire\s+non\s+valid[ée]e/i;
const VALIDEE = /^\s*grammaire\s+valid[ée]e/i;

// Les lignes dans l'ordre des séances : par date, puis par ordre dans l'onglet.
const ordreSuivi = (a, b) => (a.date || "").localeCompare(b.date || "") || a.rang - b.rang;

export function prochaineSeance(suivi, prochaine) {
  const lignes = [...suivi].sort(ordreSuivi);
  const iOrale = lignes.findLastIndex(estOrale);
  const derniereOrale = iOrale >= 0 ? lignes[iOrale].date : "";
  const depuis = iOrale >= 0 ? lignes.slice(iOrale + 1) : lignes.filter(s => s.date >= DEBUT_ORAL);
  const compteur = depuis.filter(s => TRAVAIL.has(s.type)).length;
  const base = { compteur, derniereOrale };

  // 1. Un contrôle raté juste avant (les lignes « bilan » ne comptent pas comme séance).
  const derniere = lignes.filter(s => TRAVAIL.has(s.type) || estOrale(s)).at(-1);
  if (derniere?.type === "contrôle" && !Number.isNaN(derniere.score) && derniere.score < SEUIL_CONTROLE) {
    const unite = UNITES.find(u => u.id === derniere.lecon.replace(/-contr[oô]le$/i, "")) || null;
    return { ...base, type: "consolidation", apresControle: true, unite };
  }

  // 2. La consolidation d'une leçon dont la grammaire n'est pas validée.
  const iLecon = lignes.findLastIndex(s => s.type === "leçon");
  if (iLecon >= 0 && NON_VALIDEE.test(lignes[iLecon].remarque || "")) {
    const idLecon = lignes[iLecon].lecon;
    const conso = lignes.slice(iLecon + 1).filter(s => s.type === "consolidation" && s.lecon === idLecon);
    if (conso.length < 2 && !conso.some(s => VALIDEE.test(s.remarque || "")))
      return { ...base, type: "consolidation", idLecon, lecon: PAR_ID[idLecon] || null, n: conso.length + 1 };
  }

  // 3. L'oral.
  if (compteur >= SEANCES_AVANT_ORAL) return { ...base, type: "orale" };

  // 4-5. Le contrôle de l'unité, ou la leçon suivante (rien si le livre est fini).
  return prochaine ? { ...base, ...prochaine } : { ...base, type: "fin" };
}

// La prochaine séance avec le prof : la première leçon non faite dans l'ordre du livre,
// ou le contrôle d'une unité terminée mais pas encore réussie. Noël seulement la semaine du 21 déc.
function prochaineEtape(faites, controleReussi, aujourdhui) {
  const semaineNoel = aujourdhui >= NOEL.debut && aujourdhui <= NOEL.fin;
  for (const u of UNITES) {
    if (u.id === "Noël" && !semaineNoel) continue;
    const reste = u.lecons.find(l => !faites.has(l.id));
    if (reste) return { type: "leçon", lecon: reste, unite: u };
    if (u.controle && !controleReussi(u.id)) return { type: "contrôle", unite: u };
  }
  return null;
}

// État d'une leçon dans le livre : faite, ici (la dernière faite), prochaine, ou à venir.
export function etatLecon(id, pos) {
  if (pos.derniere?.id === id) return "ici";
  if (pos.faites.has(id)) return "faite";
  if (pos.prochaine?.type === "leçon" && pos.prochaine.lecon.id === id) return "prochaine";
  return "avenir";
}

// L'unité à mettre en avant : celle de la prochaine étape, sinon celle de la dernière leçon, sinon la 1.
export function uniteCourante(pos) {
  return pos.prochaine?.unite || pos.derniere?.unite || UNITES[0];
}
