// Lecture du tableau « Espagnol – Vocabulaire » (lecture seule, partagé par lien).
// Trois onglets : « Vocabulaire » (les mots), « Suivi » (une ligne par séance, écrite par le prof)
// et « Soir » (la fiche du soir de chaque leçon). Garde une copie sur le téléphone pour marcher sans réseau.

const ID_TABLEAU = "1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ";
const urlOnglet = nom => `https://docs.google.com/spreadsheets/d/${ID_TABLEAU}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nom)}`;
const CLE_COPIE = "oyb.tableau.v4";

// Découpe un CSV en lignes de cellules (gère les guillemets, virgules et retours à la ligne dans une cellule).
export function lireCsv(texte) {
  const lignes = [];
  let ligne = [], cellule = "", entreGuillemets = false;
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (entreGuillemets) {
      if (c === '"' && texte[i + 1] === '"') { cellule += '"'; i++; }
      else if (c === '"') entreGuillemets = false;
      else cellule += c;
    } else if (c === '"') entreGuillemets = true;
    else if (c === ",") { ligne.push(cellule); cellule = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(cellule); lignes.push(ligne); ligne = []; cellule = "";
    } else cellule += c;
  }
  if (cellule !== "" || ligne.length) { ligne.push(cellule); lignes.push(ligne); }
  return lignes;
}

// Transforme un onglet en objets, en retrouvant les colonnes par leur titre (casse et espaces ignorés).
function versObjets(lignes, noms) {
  const [entete = [], ...reste] = lignes;
  const norm = s => s.trim().toLowerCase();
  const index = Object.fromEntries(Object.entries(noms).map(([cle, nom]) => [cle, entete.findIndex(t => norm(t) === nom)]));
  return reste.map(l => Object.fromEntries(Object.entries(index).map(([cle, i]) => [cle, i >= 0 && l[i] ? l[i].trim() : ""])));
}

// Accepte « 2026-11-23 », « 23/11/2026 », « 23/11/2026 12:00:00 », et le nombre que Google Sheets
// envoie pour une cellule au format date (46349 = 23 nov. 2026, en jours depuis le 30 déc. 1899).
// Renvoie une date ISO (jour seulement) ou "".
export function lireDate(texte) {
  const t = (texte || "").trim();
  if (/^\d{5}(\.\d+)?$/.test(t)) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(t)) * 86400000);
    return d.toISOString().slice(0, 10);
  }
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

export function versMots(lignes) {
  return versObjets(lignes, { es: "espagnol", fr: "français", ex: "exemple", lecon: "leçon", categorie: "catégorie" })
    .filter(m => m.es && m.fr && m.lecon)
    .map(m => ({ ...m, id: `${m.lecon}|${m.es}` }));
}

export function versSuivi(lignes) {
  return versObjets(lignes, { date: "date", lecon: "leçon", type: "type", score: "score (%)", remarque: "remarque" })
    .map((s, rang) => ({ ...s, rang, date: lireDate(s.date), type: s.type.toLowerCase(), score: parseFloat(s.score.replace(",", ".")) }))
    .filter(s => s.lecon && s.type);
}

export function versSoir(lignes) {
  const soir = {};
  for (const s of versObjets(lignes, { lecon: "leçon", mision: "misión", q1: "pregunta 1", q2: "pregunta 2", q3: "pregunta 3", kevin: "para kevin" })) {
    if (s.lecon) soir[s.lecon] = { mision: s.mision, questions: [s.q1, s.q2, s.q3].filter(Boolean), kevin: s.kevin };
  }
  return soir;
}

async function lireOnglet(nom, signal) {
  const rep = await fetch(urlOnglet(nom), { signal, cache: "no-store" });
  if (!rep.ok) throw new Error(`${nom} : http ${rep.status}`);
  const texte = await rep.text();
  if (texte.trimStart().startsWith("<")) throw new Error(`${nom} : pas un csv`);
  return lireCsv(texte);
}

function lireCopie() {
  try { const t = localStorage.getItem(CLE_COPIE); return t ? JSON.parse(t) : null; } catch { return null; }
}
function garderCopie(copie) {
  try { localStorage.setItem(CLE_COPIE, JSON.stringify(copie)); } catch { /* stockage indisponible : on continue sans copie */ }
}

// Charge les trois onglets : le réseau d'abord, la copie si le réseau échoue.
// Renvoie { mots, suivi, soir, lu, horsLigne } ou lève une erreur si rien n'est disponible.
export async function chargerTableau() {
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), 8000);
  try {
    const [vocab, suivi, soir] = await Promise.all(["Vocabulaire", "Suivi", "Soir"].map(n => lireOnglet(n, ctrl.signal)));
    const mots = versMots(vocab);
    if (!mots.length) throw new Error("vocabulaire vide ou colonnes introuvables");
    const copie = { mots, suivi: versSuivi(suivi), soir: versSoir(soir), lu: new Date().toISOString() };
    garderCopie(copie);
    return { ...copie, horsLigne: false };
  } catch (err) {
    const copie = lireCopie();
    if (copie) return { ...copie, horsLigne: true };
    throw err;
  } finally {
    clearTimeout(minuteur);
  }
}
