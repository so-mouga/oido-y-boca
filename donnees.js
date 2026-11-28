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

// Les phrases à écrire (chantier 15) : les colonnes « phrase 1 (fr) », « phrase 1 (es) », « phrase 1 (aide) », « phrase 2 … »,
// autant qu'il y en a (une colonne « phrase 3 » donnerait une carte de plus). « | » sépare plusieurs bonnes réponses en espagnol.
// L'aide (facultative) donne le mot pas encore vu de la phrase (« habitante = habitant »).
// Un mot sans ces colonnes n'a pas de phrases : il garde ses cartes 1 et 2.
function phrasesDesLignes(lignes) {
  const [entete = [], ...reste] = lignes;
  const cols = {};
  entete.forEach((t, i) => {
    const r = t.trim().toLowerCase().match(/^phrase (\d+) \((fr|es|aide)\)$/);
    if (r) (cols[r[1]] ||= {})[r[2]] = i;
  });
  const nums = Object.keys(cols).map(Number).sort((a, b) => a - b);
  return reste.map(l => nums.map(n => {
    const c = cols[n], val = i => (i >= 0 && l[i] ? l[i].trim() : "");
    const fr = val(c.fr ?? -1), es = val(c.es ?? -1).split("|").map(x => x.trim()).filter(Boolean);
    return fr && es.length ? { fr, es, aide: val(c.aide ?? -1) } : null;
  }).filter(Boolean));
}

export function versMots(lignes) {
  const phrases = phrasesDesLignes(lignes);
  return versObjets(lignes, { es: "espagnol", fr: "français", ex: "exemple", lecon: "leçon", categorie: "catégorie", role: "rôle" })
    .map((m, i) => ({ ...m, phrases: phrases[i], role: m.role.toLowerCase() }))
    .filter(m => m.es && m.fr && m.lecon)
    .map(m => ({ ...m, id: `${m.lecon}|${m.es}` }));
}

// Chantier 27 (décisions du 28 nov., 7 bis.1) : la colonne « rôle » de « Vocabulaire » dit ce qu'est chaque mot dans sa leçon :
// « mot » (les 5 mots de la page), « verbe » (le verbe de grammaire), « en plus » (les mots fréquents ajoutés le 23 nov.).
// Le soir, Blanca voit les mots et le verbe, que Kevin doit dire, puis les mots en plus, qu'elle peut placer.
// Sans la colonne (ancienne copie hors ligne), tous les mots restent à dire, comme avant.
export function motsDuSoir(mots) {
  const plus = m => m.role === "en plus";
  return { aDire: mots.filter(m => !plus(m)), enPlus: mots.filter(plus) };
}

export function versSuivi(lignes) {
  return versObjets(lignes, { date: "date", lecon: "leçon", type: "type", score: "score (%)", remarque: "remarque" })
    .map((s, rang) => ({ ...s, rang, date: lireDate(s.date), type: s.type.toLowerCase(), score: parseFloat(s.score.replace(",", ".")) }))
    .filter(s => s.lecon && s.type);
}

// Une ligne par leçon : misión, 4 questions (la 4e peut manquer), le défi (« reto », peut manquer) et la note pour moi.
// La copie hors ligne d'avant la v=43 n'a ni « pregunta 4 » ni « reto » : l'écran fait sans.
// Chantier 20 : la question ouverte (« pregunta abierta ») et ses mots d'aide (« ayuda », séparés par « ; »), qui peuvent manquer aussi.
export function versSoir(lignes) {
  const soir = {};
  const colonnes = { lecon: "leçon", mision: "misión", q1: "pregunta 1", q2: "pregunta 2", q3: "pregunta 3", q4: "pregunta 4", reto: "reto", kevin: "para kevin",
    abierta: "pregunta abierta", ayuda: "ayuda" };
  for (const s of versObjets(lignes, colonnes)) {
    if (s.lecon) soir[s.lecon] = { mision: s.mision, questions: [s.q1, s.q2, s.q3, s.q4].filter(Boolean), reto: s.reto, kevin: s.kevin,
      abierta: s.abierta, ayuda: s.ayuda.split(";").map(x => x.trim()).filter(Boolean) };
  }
  return soir;
}

// Le défi s'écrit « Nom: consigne » (« Ni sí ni no: Hazle preguntas… »). Sans nom reconnaissable : « El reto ».
export function lireReto(texte) {
  const t = (texte || "").trim();
  if (!t) return null;
  const m = t.match(/^([^:¿¡«(]{2,30}):\s*(.+)$/s);
  return m ? { nom: m[1].trim(), consigne: m[2].trim() } : { nom: "El reto", consigne: t };
}

// « Otra pregunta » : une question au hasard (1 à 4) d'une leçon déjà faite, sauf celle du soir
// et sauf la dernière tirée. Renvoie { lecon, question } ou null s'il n'y en a pas.
export function tirerPregunta(soir, faites, ceSoir, avant = null, hasard = Math.random) {
  const toutes = [];
  for (const id of faites) {
    if (id === ceSoir || !soir[id]) continue;
    for (const question of soir[id].questions || []) toutes.push({ lecon: id, question });
  }
  const choix = toutes.length > 1 && avant ? toutes.filter(t => t.question !== avant) : toutes;
  return choix.length ? choix[Math.floor(hasard() * choix.length)] : null;
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

// Un hasard fixe pour une journée : la même date donne toujours le même tirage (mulberry32 sur la date).
export function hasardDuJour(jour) {
  let a = 0;
  for (const c of jour) a = (Math.imul(a, 31) + c.charCodeAt(0)) | 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Le soir de révision (« repaso ») : les soirs sans nouvelle fiche, 4 questions de 4 leçons faites différentes
// (pas la dernière, déjà faite la veille), dans l'ordre du livre, et un défi d'un autre type que celui de la dernière fiche.
// Fixe pour la journée (hasardDuJour). null s'il y a moins de 4 autres leçons avec des questions.
export function tirerRepaso(soir, faites, derniere, jour, hasard = hasardDuJour(jour)) {
  const ordre = [...faites].filter(id => id !== derniere && soir[id]?.questions?.length);
  if (ordre.length < 4) return null;
  const melange = ordre.map(id => ({ id, cle: hasard() })).sort((a, b) => a.cle - b.cle).map(x => x.id);
  const choisies = melange.slice(0, 4).sort((a, b) => ordre.indexOf(a) - ordre.indexOf(b));
  const questions = choisies.map(id => {
    const qs = soir[id].questions;
    return { lecon: id, question: qs[Math.floor(hasard() * qs.length)] };
  });
  const typeHier = lireReto(soir[derniere]?.reto)?.nom;
  const retos = ordre.map(id => ({ lecon: id, reto: lireReto(soir[id].reto) })).filter(r => r.reto && r.reto.nom !== typeHier);
  const reto = retos.length ? retos[Math.floor(hasard() * retos.length)] : null;
  const kevin = choisies
    .map(id => ({ lecon: id, texte: (soir[id].kevin || "").split(";")[0].trim() }))
    .filter(k => k.texte);
  // La question ouverte (chantier 20) : celle d'une des 4 leçons tirées, au hasard du jour. null si aucune n'en a.
  const avecAbierta = choisies.filter(id => soir[id].abierta);
  const id = avecAbierta.length ? avecAbierta[Math.floor(hasard() * avecAbierta.length)] : null;
  const abierta = id ? { lecon: id, texte: soir[id].abierta, ayuda: soir[id].ayuda || [] } : null;
  return { questions, reto, kevin, abierta };
}

// Chantier 20 : l'onglet « Soirs » du tableau, une ligne par soir, écrite par le script Google de la sauvegarde (le prof la lit le matin).
// Les titres sont écrits par le script (outils/sauvegarde.gs, même liste). La date sert de clé : renvoyer un jour remplace sa ligne.
export const COLONNES_SOIRS = ["fecha", "lección", "apuntado: bien dicho", "apuntado: errores", "lo que ha dicho bien", "un error",
  "¿ha mejorado? ¿dónde se bloquea?", "comida en español", "escucha"];

// La ligne d'un jour, à partir de ses cases (soir, écoute, nota de Blanca). null si le soir n'a pas eu lieu (rien coché, rien noté).
export function ligneSoir(jour, c = {}) {
  const n = c.nota || {};
  const notas = n.notas || [];
  if (!c.soir && !n.guardada && !notas.length) return null;
  const de = t => notas.filter(x => x.t === t).map(x => x.txt).join(" | ");
  return [jour, n.lecon || c.soirLecon || "", de("bien"), de("err"), n.bien || "", n.error || "", n.mejora || "", n.comida || "", c.ecoute ? "sí" : "no"];
}
