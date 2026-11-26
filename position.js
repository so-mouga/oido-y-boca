// Où j'en suis dans le livre, d'après l'onglet « Suivi » (écrit seulement par le prof).
// Fait = une ligne de type « leçon » pour cette leçon. L'appli n'ouvre que ce qui est fait.

import { PARTIES } from "./livre.js?v=70";

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

  return {
    faites, dateFaite, controles, controleReussi,
    derniere: derniere ? PAR_ID[derniere.lecon] : null,
    prochaine: prochaineEtape(faites, controleReussi, aujourdhui),
    seanceDuJour: suivi.some(s => s.date === aujourdhui),
    nbFaites: faites.size,
  };
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
