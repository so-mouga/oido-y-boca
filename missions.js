// Les missions du jour de la Feria (chantier 12, maquette .impeccable/mocks/missions/index.html).
// Une mission par jour, sous La Charla : la faire (ou faire la Charla) allume l'ampoule du jour.
// La Misión suit le livre (chantier 28, Q110 à Q115) : seulement des mots déjà vus (leçon faite, ou appris en avance, Q28-7),
// ceux qu'il a le moins vus d'abord. Plus de mots nouveaux ni de « Je le garde » (Q114, remplace Q12-8).
// On travaille les noms : el / la / los / las, le pluriel, un / una avec les nombres.
//   El Repartidor (Q115) : avant U4-L2, 6 colis au singulier dans les camions EL et LA, sans étiquettes ;
//     à partir de U4-L2 (le pluriel), les camions EL, LA, LOS, LAS, puis 3 étiquettes à écrire au pluriel.
//   La lista de Blanca : 6 lignes d'un pense-bête (« 3 · reunión » → tres reuniones), à partir de U4-L2 (Q28-6).
//   Uno de dos : 8 phrases à trou, deux camions (ser / estar, es / eres…) ; les phrases et leurs leçons sont dans duos.js.
// Quand la forme du jour n'a pas assez de mots, on essaie les autres ; sinon, pas de mission ce jour-là.
// Ce fichier n'a ni écran ni import : il se teste avec node (outils/test-missions.mjs).

export const COLIS = 6, ETIQUETTES = 3, LIGNES = 6;
export const SEUIL = 4;         // il faut au moins 4 noms déjà vus pour une mission (atteint en U1-L3)
export const LECON_PLURIEL = "U4-L2";   // le pluriel : camions LOS / LAS, étiquettes, et la liste de Blanca
export const LECON_NOMBRES = LECON_PLURIEL;

const ACCENT = { á: "a", é: "e", í: "i", ó: "o", ú: "u" };
const AJOUT = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };
export const sansAccent = t => String(t || "").replace(/[áéíóú]/g, c => ACCENT[c]);
const FORTES = "aeoáéóíú";      // les voyelles qui font une syllabe à elles seules (í et ú accentués aussi)
const estVoyelle = c => "aeiouáéíóúü".includes(c);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Les syllabes, pour l'accent : les groupes de voyelles. Deux voyelles fortes se séparent (a-e), une faible non accentuée
// s'unit à sa voisine (ie, ue, ai). Le u muet de que, qui, gue, gui ne compte pas.
export function noyaux(mot) {
  const res = [];
  for (let k = 0; k < mot.length; k++) {
    const c = mot[k];
    if (!estVoyelle(c)) continue;
    if (c === "u" && "qg".includes(mot[k - 1]) && "eiéí".includes(mot[k + 1] || "")) continue;
    const prec = res[res.length - 1];
    if (prec && prec.fin === k - 1 && !(FORTES.includes(c) && FORTES.includes(mot[prec.fin]))) { prec.fin = k; continue; }
    res.push({ debut: k, fin: k });
  }
  return res;
}
// Met l'accent sur une syllabe : sur la voyelle forte, ou sur la 2e de deux faibles (ui → uí).
function accentuer(mot, n) {
  const s = mot.slice(n.debut, n.fin + 1);
  let j = [...s].findIndex(c => "aeo".includes(c));
  if (j < 0) j = s.length - 1;
  const k = n.debut + j;
  return mot.slice(0, k) + AJOUT[mot[k]] + mot.slice(k + 1);
}
const aAccent = mot => /[áéíóú]/.test(mot);
// Enlève l'accent écrit de la dernière syllabe, sauf un hiatus (país, baúl) qui le garde.
function enleverAccentFinal(mot) {
  const k = mot.search(/[áéíóú][^aeiouáéíóú]*$/);
  if (k < 0) return mot;
  if ("íú".includes(mot[k]) && "aeo".includes(mot[k - 1] || "")) return mot;
  return mot.slice(0, k) + ACCENT[mot[k]] + mot.slice(k + 1);
}

// Les pluriels écrits à la main (ceux que la règle ne trouve pas), et les noms qu'on ne met pas au pluriel ici
// (ce qu'on ne compte pas : la gente, el dinero…). Revus sur tout le Sheet (outils/test-missions.mjs).
export const PLURIELS = { "carácter": "caracteres", "régimen": "regímenes", "jersey": "jerséis", "menú": "menús", "sofá": "sofás", "esquí": "esquís" };
export const SANS_PLURIEL = new Set(["gente", "dinero", "sed", "hambre", "salud", "basura", "música", "calor", "frío", "tos", "fiebre", "agua", "carne",
  "leche", "arroz", "sal", "mediodía", "norte", "sur", "tráfico", "ruido", "paciencia", "suerte", "prisa", "miedo", "pena", "ropa", "fútbol", "tenis",
  "baloncesto", "español", "inglés", "francés", "tiempo", "wifi", "internet"]);

// Le pluriel d'un nom : { forme, regle } ou null quand l'appli ne sait pas (mot étranger : jamais au pluriel ici).
// regle : voyelle (+s), consonne (+es), accent (+es, l'accent tombe), accentAjoute (+es, un accent apparaît),
// z (→ ces), invariable (cumpleaños), y (+es), main (écrit à la main).
export function pluriel(mot) {
  if (!mot || /\s/.test(mot)) return null;
  if (PLURIELS[mot]) return { forme: PLURIELS[mot], regle: "main" };
  const d = mot[mot.length - 1], ns = noyaux(mot);
  if ("aeoiuáéó".includes(d)) return { forme: mot + "s", regle: "voyelle" };
  if ("íú".includes(d)) return null;
  if (d === "z") return { forme: mot.slice(0, -1) + "ces", regle: "z" };
  if (d === "y") return estVoyelle(mot[mot.length - 2]) ? { forme: mot + "es", regle: "y" } : null;
  if ("sx".includes(d) && ns.length >= 2 && !aAccent(mot)) return { forme: mot, regle: "invariable" };
  if (!"nlrdjsx".includes(d)) return null;
  if (aAccent(mot)) {
    // L'accent est sur la dernière syllabe (reunión, autobús) : avec -es, il n'a plus besoin d'être écrit.
    const der = ns[ns.length - 1];
    if (/[áéíóú]/.test(mot.slice(der.debut, der.fin + 1))) {
      const f = enleverAccentFinal(mot) + "es";
      return { forme: f, regle: f === mot + "es" ? "consonne" : "accent" };
    }
    return { forme: mot + "es", regle: "consonne" };     // árbol → árboles
  }
  // examen → exámenes : on prononce pareil, mais il faut maintenant écrire l'accent.
  if (d === "n" && ns.length >= 2) return { forme: accentuer(mot, ns[ns.length - 2]) + "es", regle: "accentAjoute" };
  return { forme: mot + "es", regle: "consonne" };
}

// Le genre en français, pour repérer les pièges (la mañana / le matin). Les mots en l' : écrits à la main.
const FR_ELIDE = { "âge": "m", "après-midi": "m", "an": "m", "année": "f", "argent": "m", "heure": "f", "eau": "f", "ordinateur": "m", "entreprise": "f",
  "appartement": "m", "ami": "m", "amie": "f", "anniversaire": "m", "euro": "m", "école": "f", "enfant": "m", "oncle": "m", "assiette": "f", "addition": "f",
  "entrée": "f", "ascenseur": "m", "endroit": "m", "homme": "m", "été": "m", "hiver": "m", "automne": "m", "avion": "m", "arbre": "m", "œil": "m", "épaule": "f",
  "oreille": "f", "histoire": "f", "idée": "f", "église": "f", "hôpital": "m", "examen": "m", "erreur": "f", "équipe": "f", "affaire": "f", "aide": "f",
  "aéroport": "m", "hôtel": "m", "épouse": "f", "époux": "m", "intérieur": "m", "extérieur": "m", "orage": "m", "ombre": "f", "huile": "f", "œuf": "m", "image": "f" };
export function genreFrancais(fr) {
  const t = String(fr || "").replace(/\([^)]*\)/g, "").trim().toLowerCase().split(/[,;]/)[0].trim();
  if (/^le /.test(t)) return "m";
  if (/^la /.test(t)) return "f";
  const m = /^l['’]\s*([^\s]+)/.exec(t);
  return m ? FR_ELIDE[m[1]] || null : null;
}
// Les noms féminins qui prennent « el » au singulier (un a accentué au début) : el agua, las aguas.
export const FEM_A = new Set(["agua", "hambre", "aula", "área", "alma", "arma", "águila", "hacha", "ave", "hada"]);

// Les noms d'une carte du Sheet. « el hermano / la hermana » → deux noms ; « los suegros » → un nom au pluriel seulement ;
// sans article (« papá / mamá ») ou en plusieurs mots (« el fin de semana ») : rien (les missions gardent des mots courts).
export function nomsDe(m) {
  if ((m.categorie || "").trim().toLowerCase() !== "nom") return [];
  const es = String(m.es || "").replace(/\([^)]*\)/g, " ").split("/").map(s => s.trim());
  const fr = String(m.fr || "").replace(/\([^)]*\)/g, " ").split("/").map(s => s.trim());
  // « le / la pédiatre » : l'article seul reçoit le nom de l'autre morceau.
  const nomFr = (fr.find(f => /\s/.test(f)) || "").replace(/^(le|la|les|l['’])\s*/, "");
  fr.forEach((f, k) => { if (/^(le|la|l['’])$/.test(f)) fr[k] = `${f} ${nomFr}`; });
  const res = [];
  es.forEach((e, k) => {
    const x = /^(el|la|los|las)\s+([a-záéíóúñü]+)$/.exec(e.toLowerCase());
    if (!x) return;
    const [, art, mot] = x;
    const plurielSeul = art === "los" || art === "las";
    const genre = art === "la" || art === "las" || FEM_A.has(mot) ? "f" : "m";
    const sens = (es.length === fr.length ? fr[k] : fr.join(" / ")).trim();
    const p = plurielSeul || SANS_PLURIEL.has(mot) ? null : pluriel(mot);
    res.push({ cle: `${m.id}:${k}`, id: m.id, lecon: m.lecon, mot, art, genre, plurielSeul, pluriel: p, fr: sens, frGenre: es.length === fr.length ? genreFrancais(sens) : null });
  });
  return res;
}
export const articlePluriel = n => n.genre === "f" ? "las" : "los";
// Un piège : le français a l'autre genre (la mañana, le matin), la terminaison trompe (el día, la mano), ou el agua.
export function piege(n) {
  if (n.plurielSeul) return null;
  if (FEM_A.has(n.mot)) return "a";
  if (n.frGenre && n.frGenre !== n.genre) return "francais";
  if (n.genre === "m" && /a$/.test(n.mot)) return "finA";
  if (n.genre === "f" && /o$/.test(n.mot)) return "finO";
  return null;
}

// ——— les explications (une ligne, l'espagnol en <i>) ———
const it = t => `<i>${esc(t)}</i>`;
export function explGenre(n, nombre) {
  const sing = `${n.art} ${n.mot}`, pl = n.plurielSeul ? sing : n.pluriel ? `${articlePluriel(n)} ${n.pluriel.forme}` : "";
  const auPl = nombre === "p" && pl && !n.plurielSeul ? ` Au pluriel : ${it(pl)}.` : "";
  switch (piege(n)) {
    case "a": return `${it(n.mot)} est féminin, mais on dit ${it("el " + n.mot)} : c'est le a accentué du début.${n.pluriel ? ` Au pluriel : ${it("las " + n.pluriel.forme)}.` : ""}`;
    case "francais": return `Piège : en français c'est « ${esc(n.fr)} », mais en espagnol ${it(sing)}.${auPl}`;
    case "finA": return `${it(sing)} finit en -a, mais il est masculin.${auPl}`;
    case "finO": return `${it(sing)} finit en -o, mais il est féminin.${auPl}`;
  }
  if (n.plurielSeul) return `${it(sing)} : ce mot s'emploie au pluriel.`;
  if (/(dad|tad|ión)$/.test(n.mot)) return `Les mots en ${/ión$/.test(n.mot) ? "-ión" : "-dad"} sont toujours féminins : ${it(sing)}.${auPl}`;
  if (auPl) return `${it(sing)}, au pluriel ${it(pl)}.`;
  return `${it(sing)}${/o$/.test(n.mot) && n.genre === "m" ? " : en -o, masculin" : /a$/.test(n.mot) && n.genre === "f" ? " : en -a, féminin" : ""}.`;
}
export function explPluriel(n) {
  const p = n.pluriel, pl = `${articlePluriel(n)} ${p.forme}`;
  switch (p.regle) {
    case "voyelle": return `Après une voyelle, on ajoute -s : ${it(pl)}.`;
    case "consonne": return `Après une consonne, on ajoute -es : ${it(pl)}.`;
    case "accent": return `On ajoute -es, et <b>l'accent tombe</b> : ${it(pl)}.`;
    case "accentAjoute": return `On ajoute -es, et <b>un accent apparaît</b> pour garder le même son : ${it(pl)}.`;
    case "z": return `Le z devient c devant -es : ${it(pl)}.`;
    case "invariable": return `Ce mot ne change pas au pluriel : ${it(`${n.art} ${n.mot}`)}, ${it(pl)}.`;
    case "y": return `Après -y, on ajoute -es : ${it(pl)}.`;
    default: return `Au pluriel : ${it(pl)}.`;
  }
}

// ——— les nombres en lettres, de 0 à 100 ———
const UNITES = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince",
  "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis",
  "veintisiete", "veintiocho", "veintinueve"];
const DIZAINES = { 30: "treinta", 40: "cuarenta", 50: "cincuenta", 60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa", 100: "cien" };
export const enLettres = n => n < 30 ? UNITES[n] : DIZAINES[n] || `${DIZAINES[n - (n % 10)]} y ${UNITES[n % 10]}`;

// ——— le choix du jour ———
// etat : jeux.missions = { jours: { date: { forme, ok, sur } }, vus: { cle: { n, le } } }.
// Les mots vus aujourd'hui ne comptent pas pour le tirage d'aujourd'hui : la mission reste la même toute la journée.
const vusAvant = (etat, cle, jour) => { const v = etat?.vus?.[cle]; return v ? v.n - (v.le === jour ? 1 : 0) : 0; };
const melanger = (t, h) => { const a = [...t]; for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(h() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

// Les noms à jouer : seulement ceux déjà vus (leçon faite ou appris en avance), dans l'ordre du Sheet.
// mots : le vocabulaire du Sheet ; vu : m => bool.
export function nomsMission(mots, vu) {
  const res = [], deja = new Set();
  mots.forEach((m, k) => { if (vu(m)) nomsDe(m).forEach(n => { if (!deja.has(n.mot)) { deja.add(n.mot); res.push({ ...n, k }); } }); });
  return res;
}
// Les mots du jour : les moins vus dans les missions d'avant (au hasard entre égaux), un piège passe devant à égalité.
// Jamais deux mots de la même carte (el jefe / la jefa) le même jour.
function choisir(noms, etat, jour, hasard, n) {
  const ordre = melanger(noms, hasard).map(x => ({ x, v: vusAvant(etat, x.cle, jour) - (piege(x) ? .5 : 0) }))
    .sort((a, b) => a.v - b.v).map(o => o.x);
  return unParCarte(ordre).slice(0, n);
}
const unParCarte = t => { const ids = new Set(); return t.filter(x => !ids.has(x.id) && ids.add(x.id)); };

// La forme du jour : le Repartidor, la liste de Blanca (une fois le pluriel vu), ou Uno de dos (dès que 2 duos sont
// ouverts). Jamais deux jours de suite la même.
export function formeDuJour({ faites, etat, jour, hasard, duos = [] }) {
  const dispo = ["repartidor"];
  if (faites.has(LECON_NOMBRES)) dispo.push("lista");
  if (duosOuverts(duos, faites).length >= 2) dispo.push("duos");
  if (dispo.length === 1) return dispo[0];
  const avant = Object.keys(etat?.jours || {}).filter(d => d < jour).sort();
  const hier = avant.length ? etat.jours[avant[avant.length - 1]].forme : null;
  const choix = dispo.filter(f => f !== hier);
  return choix[Math.floor(hasard() * choix.length)];
}

// ——— Uno de dos : une phrase à trou, deux camions (les phrases écrites à la main sont dans duos.js) ———
export const PHRASES_DUO = 8;
// « Yo {soy|estoy} francés. » → { avant: "Yo ", a: "soy", b: "estoy", apres: " francés." }
export function decouper(es) {
  const m = /^(.*?)\{([^|}]+)\|([^}]+)\}(.*)$/.exec(es || "");
  return m ? { avant: m[1], a: m[2], b: m[3], apres: m[4] } : null;
}
export const phraseComplete = (p, k = p.juste) => `${p.avant}${k === 0 ? p.a : p.b}${p.apres}`;
// Un duo s'ouvre avec sa leçon (lecon: null = fermé) ; une phrase avec sa propre leçon (5e case) attend celle-ci.
export const duosOuverts = (duos, faites) => duos.filter(d => d.lecon && faites.has(d.lecon));
const phrasesOuvertes = (d, faites) => d.phrases.map((ph, k) => ({ ph, k })).filter(({ ph }) => !ph[4] || faites.has(ph[4]));
// Un duo jamais joué arrive avec sa carte « La règle » : au plus un nouveau par mission, avec 4 phrases ; un duo
// d'erreur fréquente passe avant un duo ordinaire. Les autres : ceux qu'on a le moins vus. Au moins un duo fréquent
// par mission quand il y en a d'ouverts (Q28-5). Dans chaque duo, les phrases les moins vues d'abord.
export function unoDeDos(duos, faites, etat, jour, hasard) {
  const ouverts = duosOuverts(duos, faites);
  if (ouverts.length < 2) return null;
  const cle = (d, k) => `duo:${d.id}:${k}`;
  const vusDuo = d => d.phrases.reduce((t, _, k) => t + vusAvant(etat, cle(d, k), jour), 0);
  const regles = etat?.regles || {};
  const jamais = d => !regles[d.id] || regles[d.id] === jour;
  const nouveau = ouverts.find(d => d.frequent && jamais(d)) || ouverts.find(jamais) || null;
  const autres = melanger(ouverts.filter(d => d !== nouveau), hasard).sort((a, b) => vusDuo(a) - vusDuo(b));
  const choisis = (nouveau ? [nouveau, ...autres.slice(0, 2)] : autres.slice(0, 3));
  const frequent = autres.find(d => d.frequent);
  if (frequent && !choisis.some(d => d.frequent)) choisis[choisis.length - 1] = frequent;
  const parts = choisis.length === 2 ? [4, 4] : nouveau ? [4, 2, 2] : [3, 3, 2];
  const phrases = choisis.flatMap((d, i) => melanger(phrasesOuvertes(d, faites), hasard)
    .sort((x, y) => vusAvant(etat, cle(d, x.k), jour) - vusAvant(etat, cle(d, y.k), jour))
    .slice(0, parts[i])
    .map(({ ph, k }) => ({ duo: d.id, nomDuo: d.nom, court: d.court, cle: cle(d, k), ...decouper(ph[0]), juste: ph[1], fr: ph[2], nv: ph[3] || "",
      regle: d.regle[ph[1]], autre: d.regle[1 - ph[1]] })));
  return { forme: "duos", phrases: melanger(phrases, hasard), nouveau: nouveau?.id || null, duos: choisis.map(d => d.id), mots: [], cles: phrases.map(p => p.cle) };
}

// El Repartidor : 6 colis déjà vus. Avant le pluriel (U4-L2) : au singulier, camions EL et LA, sans étiquettes, et sans
// les noms qui n'existent qu'au pluriel (los suegros). Ensuite : au singulier ou au pluriel, camions EL, LA, LOS, LAS,
// puis 3 étiquettes au pluriel.
export const camionsDe = m => m.pluriel === false ? ["EL", "LA"] : ["EL", "LA", "LOS", "LAS"];
export function repartidor(noms, etat, jour, hasard, avecPl = true) {
  const mots = choisir(avecPl ? noms : noms.filter(n => !n.plurielSeul), etat, jour, hasard, COLIS);
  if (mots.length < SEUIL) return null;
  const colis = mots.map(n => {
    const nombre = !avecPl ? "s" : n.plurielSeul ? "p" : n.pluriel && n.pluriel.forme !== n.mot && hasard() < .5 ? "p" : "s";
    const camion = (nombre === "p" ? articlePluriel(n) : n.art).toUpperCase();
    return { n, nombre, texte: nombre === "p" && !n.plurielSeul ? n.pluriel.forme : n.mot, camion, expl: explGenre(n, nombre) };
  });
  const avecPluriel = n => n.pluriel && !n.plurielSeul && n.pluriel.regle !== "invariable";
  const etiquettes = !avecPl ? [] : mots.filter(avecPluriel).slice(0, ETIQUETTES)
    .map(n => ({ n, de: `${n.art} ${n.mot}`, art: articlePluriel(n), rep: n.pluriel.forme, expl: explPluriel(n) }));
  return { forme: "repartidor", colis, etiquettes, mots, pluriel: avecPl };
}

// La lista de Blanca : 6 lignes déjà vues. 2 lignes « 1 » (un / una : le genre), 4 avec un nombre (le pluriel).
// Les nombres : de 2 à 20 (au-delà, la liste devient absurde : « ochenta y tres hijos »).
export const TITRES = ["Kevin, esta semana:", "No te olvides:", "Para el fin de semana:", "Kevin, para mañana:"];
export function lista(noms, etat, jour, hasard) {
  const ok = n => !!(n.pluriel && !n.plurielSeul && n.pluriel.regle !== "invariable");
  const mots = choisir(noms.filter(ok), etat, jour, hasard, LIGNES);
  if (mots.length < SEUIL) return null;
  const max = 20, nombres = [];
  while (nombres.length < mots.length - 2) {
    const q = 2 + Math.floor(hasard() * (max - 1));
    if (nombres.includes(q)) continue;
    nombres.push(q);
  }
  const lignes = mots.map((n, k) => {
    const q = k < 2 ? 1 : nombres[k - 2];
    const un = n.genre === "f" && !FEM_A.has(n.mot) ? "una" : "un";
    const rep = q === 1 ? `${un} ${n.mot}` : `${enLettres(q)} ${n.pluriel.forme}`;
    const expl = q === 1
      ? `${it(`${n.art} ${n.mot}`)} : ${n.genre === "f" ? "féminin, donc <i>una</i>" : "masculin, donc <i>un</i>"}.${piege(n) === "francais" ? ` (En français : « ${esc(n.fr)} ».)` : ""}`
      : `${it(enLettres(q))}, puis le pluriel. ${explPluriel(n)}`;
    return { n, q, rep, expl };
  });
  return { forme: "lista", titre: TITRES[Math.floor(hasard() * TITRES.length)], lignes: melanger(lignes, hasard), mots };
}

// La mission du jour, toute prête (la même toute la journée : hasard = hasardDuJour(jour, "mision")).
// Si la forme tirée n'a pas assez de mots (le tout début du livre), on essaie les autres ; null : pas de mission.
export function missionDuJour({ mots, vu, faites, etat, jour, hasard, duos = [] }) {
  const noms = nomsMission(mots, vu);
  const forme = formeDuJour({ faites, etat, jour, hasard, duos });
  const faire = {
    repartidor: () => repartidor(noms, etat, jour, hasard, faites.has(LECON_PLURIEL)),
    lista: () => faites.has(LECON_NOMBRES) ? lista(noms, etat, jour, hasard) : null,
    duos: () => unoDeDos(duos, faites, etat, jour, hasard),
  };
  for (const f of [forme, "repartidor", "duos", "lista"]) { const m = faire[f](); if (m) return m; }
  return null;
}

// ——— corriger ce que Kevin écrit ———
// Comme les exercices : un accent oublié ou en trop est signalé mais compté juste ; une lettre fausse compte faux.
const propre = t => String(t || "").toLowerCase().replace(/[.,;:!¡¿?]/g, " ").replace(/\s+/g, " ").trim();
export function corrigerEtiquette(tape, rep) {
  const t = propre(tape).replace(/^(los|las)\s+/, "");
  if (!t) return null;
  if (t === rep) return { juste: true, accent: false };
  if (sansAccent(t) === sansAccent(rep)) return { juste: true, accent: true };
  return { juste: false };
}
// Une ligne de la liste : le nombre (en lettres, ou en chiffres avec un rappel), puis le nom.
// Pour « 1 », un chiffre ne dit pas le genre : on redemande un / una (rien n'est compté).
export function corrigerLigne(tape, ligne) {
  const mots = propre(tape).split(" ").filter(Boolean);
  if (!mots.length) return null;
  const [nb, ...reste] = mots, [rnb, ...rreste] = ligne.rep.split(" ");
  if (ligne.q === 1 && nb === "1") return { redemande: true };
  const chiffre = ligne.q > 1 && nb === String(ligne.q);
  const nbJuste = chiffre || sansAccent(nb) === sansAccent(rnb);
  const nomTape = reste.join(" "), nomRep = rreste.join(" ");
  if (!nbJuste || sansAccent(nomTape) !== sansAccent(nomRep)) return { juste: false };
  return { juste: true, chiffre, accent: nomTape !== nomRep || (!chiffre && nb !== rnb) };
}

// ——— la fin : le résultat gardé, l'ampoule du jour (jeux.jours, la guirlande) ———
// Un seul essai compte par jour ; une mission rejouée ne change rien.
// regles : les duos joués (leur carte « La règle » ne s'affichera plus d'office), gardés même quand la mission est rejouée.
export function apresMission(jeux, { forme, ok, sur, cles = [], regles = [] }, jour) {
  const missions = { jours: {}, vus: {}, regles: {}, ...(jeux.missions || {}) };
  const r = { ...missions.regles };
  for (const id of regles) r[id] ||= jour;
  if (missions.jours[jour]) return { jeux: regles.length ? { ...jeux, missions: { ...missions, regles: r } } : jeux, ampoule: false };
  const vus = { ...missions.vus };
  for (const c of cles) vus[c] = { n: (vus[c]?.n || 0) + 1, le: jour };
  const jours = jeux.jours || [];
  const ampoule = !jours.includes(jour);
  return { jeux: { ...jeux, jours: ampoule ? [...jours, jour] : jours, missions: { ...missions, vus, regles: r, jours: { ...missions.jours, [jour]: { forme, ok, sur } } } }, ampoule };
}
export const faiteAujourdhui = (jeux, jour) => jeux?.missions?.jours?.[jour] || null;
