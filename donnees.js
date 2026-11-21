// Lecture du tableau « Espagnol – Vocabulaire » (lecture seule, partagé par lien).
// Deux onglets : « Vocabulaire » (les mots) et « Suivi » (une ligne par séance, ajoutée par le prof).
// Garde une copie sur le téléphone pour marcher sans réseau.

const ID_TABLEAU = "1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ";
const urlOnglet = nom => `https://docs.google.com/spreadsheets/d/${ID_TABLEAU}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nom)}`;
const CLE_COPIE = "oyb.tableau.v3";
export const ORDRE_JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

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

// Retrouve les colonnes par leur titre (insensible à la casse et aux espaces).
function colonnes(entete, noms) {
  const norm = s => s.trim().toLowerCase();
  return Object.fromEntries(Object.entries(noms).map(([cle, nom]) => [cle, entete.findIndex(t => norm(t) === nom)]));
}
const val = (l, i) => (i >= 0 && l[i] ? l[i].trim() : "");
const rangJour = j => ORDRE_JOURS.indexOf(j.slice(0, 3).replace(/^./, c => c.toUpperCase()));

// Onglet « Vocabulaire ». Les colonnes « ajouté le » et « statut » sont ignorées.
export function versMots(lignes) {
  const [entete = [], ...reste] = lignes;
  const c = colonnes(entete, { es: "espagnol", fr: "français", ex: "exemple", semaine: "semaine", jour: "jour", theme: "thème" });
  if (c.es < 0 || c.fr < 0 || c.semaine < 0 || c.jour < 0) throw new Error("colonnes du vocabulaire introuvables");
  return reste
    .map(l => ({
      // Identifiant stable : la semaine et le mot espagnol (ne dépend pas de l'ordre des lignes).
      id: `${val(l, c.semaine)}|${val(l, c.es)}`,
      es: val(l, c.es), fr: val(l, c.fr), ex: val(l, c.ex),
      semaine: parseInt(val(l, c.semaine), 10) || 0,
      jour: val(l, c.jour), theme: val(l, c.theme),
    }))
    .filter(m => m.es && m.fr && m.semaine);
}

// Accepte « 2026-11-23 », « 23/11/2026 » et « 23/11/2026 12:00:00 ». Renvoie une date ISO (jour seulement) ou "".
export function lireDate(texte) {
  const t = (texte || "").trim();
  let m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

// Onglet « Suivi » : date | semaine | jour | type | score (%) | remarque.
export function versSuivi(lignes) {
  const [entete = [], ...reste] = lignes;
  const c = colonnes(entete, { date: "date", semaine: "semaine", jour: "jour", type: "type", score: "score (%)", remarque: "remarque" });
  if (c.semaine < 0 || c.jour < 0) return [];
  return reste
    .map(l => ({
      date: lireDate(val(l, c.date)),
      semaine: parseInt(val(l, c.semaine), 10) || 0,
      jour: val(l, c.jour),
      type: val(l, c.type).toLowerCase(),
      score: val(l, c.score), remarque: val(l, c.remarque),
    }))
    .filter(s => s.semaine && rangJour(s.jour) >= 0);
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

// Charge les deux onglets : le réseau d'abord, la copie si le réseau échoue.
// Renvoie { mots, suivi, lu (date ISO), horsLigne } ou lève une erreur si rien n'est disponible.
export async function chargerTableau() {
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), 8000);
  try {
    const [vocab, suivi] = await Promise.all([lireOnglet("Vocabulaire", ctrl.signal), lireOnglet("Suivi", ctrl.signal)]);
    const copie = { mots: versMots(vocab), suivi: versSuivi(suivi), lu: new Date().toISOString() };
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

// Position = la ligne de « Suivi » la plus avancée dans le programme (semaine, puis jour).
// Mots débloqués = tous ceux jusqu'à cette semaine et ce jour inclus.
// Mode essai tant que « Suivi » est vide : les mots de la semaine 1.
export function etatDuJour({ mots, suivi }, aujourdhui = new Date()) {
  if (!suivi.length) {
    return { essai: true, semaine: 1, mots: mots.filter(m => m.semaine === 1), derniere: null, joursDepuis: null };
  }
  const position = suivi.reduce((a, b) =>
    (b.semaine > a.semaine || (b.semaine === a.semaine && rangJour(b.jour) > rangJour(a.jour))) ? b : a);
  const debloques = mots.filter(m =>
    m.semaine < position.semaine || (m.semaine === position.semaine && rangJour(m.jour) <= rangJour(position.jour)));
  const dates = suivi.map(s => s.date).filter(Boolean).sort();
  const derniere = dates.length ? dates[dates.length - 1] : null;
  let joursDepuis = null;
  if (derniere) {
    const midi = d => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };
    joursDepuis = Math.round((midi(aujourdhui) - midi(derniere + "T12:00:00")) / 86400000);
  }
  return { essai: false, semaine: position.semaine, jour: position.jour, mots: debloques, derniere, joursDepuis };
}
