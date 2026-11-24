// Toucher un mot (chantier 10, APPLI.md « La suite », point 8 bis) : le moteur, sans écran.
// Dans une phrase espagnole, chaque mot (ou groupe de mots) se touche. On retrouve d'où il vient :
// - une carte du Sheet, même sous une autre forme (« vecinos » → el vecino / la vecina, « barata » → barato / barata) ;
// - une expression du Sheet, même avec son verbe conjugué (« tengo prisa » → tener prisa) ;
// - un verbe conjugué, à n'importe quel temps que l'appli connaît (« viven » → vivir · ellos · présent,
//   « me levanté » → levantarse · yo · passé simple, « he comido » → comer · yo · passé composé, « fui » → ir et ser) ;
// - un de mes mots ;
// - un petit mot de grammaire (PETITS_MOTS, écrits ici, jamais devinés) ;
// - ou ce que la question donne elle-même (« el fútbol = le foot » du bonus, « buscar = chercher »).
// Le plus long groupe gagne (« me levanté » avant « me »), comme dans les lectures. Les prénoms ne se touchent pas,
// ni le texte entre parenthèses (« (estar, yo) » : c'est la consigne). Rien de trouvé : « Pas dans ton livre ».
// L'affichage de la bulle est dans ecrans/bulle.js. Vérifié par outils/test-toucher.mjs.

import { esc } from "./ui.js?v=63";
import { conjuguer, ORDRE_TEMPS, TEMPS, PERSONNES } from "./controles.js?v=63";
import { verbeDe, motsAMoi, motVu, normaliser } from "./dico.js?v=63";
import { verbesConnus } from "./verbes.js?v=63";
import { GLOSE, NOMS } from "./lectures.js?v=63";

// Les petits mots que le Sheet n'a pas (ou pas seuls) : pronoms, articles, prépositions, nombres, jours…
// GLOSE (les lectures) d'abord, puis ceux-ci. Un mot du Sheet passe toujours avant.
export const PETITS_MOTS = {
  ...GLOSE,
  me: "me, moi", te: "te, toi", se: "se (verbe en -se) ; on", nos: "nous", os: "vous", le: "lui, le (à lui, à elle)", les: "leur, les (à eux)",
  lo: "le, ça", la: "la", "él": "il, lui", ella: "elle", nosotros: "nous", nosotras: "nous (au féminin)", vosotros: "vous (tutoiement)",
  vosotras: "vous (au féminin)", ellos: "ils, eux", ellas: "elles", usted: "vous (vouvoiement)", ustedes: "vous (vouvoiement, pluriel)",
  "mí": "moi (après a, para…)", ti: "toi (après a, para…)", conmigo: "avec moi", contigo: "avec toi",
  nuestro: "notre", nuestra: "notre", nuestros: "nos", nuestras: "nos", vuestro: "votre", vuestra: "votre", vuestros: "vos", vuestras: "vos",
  sus: "ses, leurs", mis: "mes",
  unos: "des, quelques", unas: "des, quelques", este: "ce, cet", esta: "cette", estos: "ces", estas: "ces", ese: "ce …-là", esa: "cette …-là",
  eso: "ça", esto: "ceci, ça", todo: "tout", toda: "toute", todos: "tous", todas: "toutes", otro: "un autre", otra: "une autre",
  que: "que, qui", "qué": "quoi ? quel ?", "cómo": "comment ?", "dónde": "où ?", "cuándo": "quand ?", "cuánto": "combien ?", "cuánta": "combien ?",
  "cuántos": "combien ?", "cuántas": "combien ?", "cuál": "lequel ? quel ?", "quién": "qui ?", "por qué": "pourquoi ?", cuando: "quand",
  como: "comme", donde: "où", si: "si", "también": "aussi", tampoco: "non plus", nunca: "jamais", siempre: "toujours", nada: "rien", nadie: "personne",
  algo: "quelque chose", hoy: "aujourd'hui", "mañana": "demain ; le matin", ayer: "hier", ahora: "maintenant", luego: "ensuite, plus tard",
  bien: "bien", mal: "mal", "aquí": "ici", "allí": "là-bas", "ahí": "là", "así": "ainsi", tan: "si, tellement", "después": "après", antes: "avant",
  para: "pour", sin: "sans", sobre: "sur", entre: "entre", hasta: "jusqu'à", desde: "depuis, de", durante: "pendant", hacia: "vers",
  "según": "selon", "detrás": "derrière", delante: "devant", cerca: "près", lejos: "loin", encima: "dessus", debajo: "dessous",
  menos: "moins", "más": "plus", mejor: "mieux, meilleur", peor: "pire", poco: "peu", mucha: "beaucoup de", muchos: "beaucoup de", muchas: "beaucoup de",
  "sí": "oui", "no": "non ; ne… pas", vale: "d'accord", pues: "eh bien", entonces: "alors", aunque: "même si",
  uno: "un", dos: "deux", tres: "trois", cuatro: "quatre", cinco: "cinq", seis: "six", siete: "sept", ocho: "huit", nueve: "neuf", diez: "dix",
  once: "onze", doce: "douze", trece: "treize", catorce: "quatorze", quince: "quinze", "dieciséis": "seize", diecisiete: "dix-sept",
  dieciocho: "dix-huit", diecinueve: "dix-neuf", veinte: "vingt", treinta: "trente", cuarenta: "quarante", cincuenta: "cinquante", cien: "cent", mil: "mille",
  media: "et demie", "y media": "et demie", "y cuarto": "et quart", "menos cuarto": "moins le quart",
  lunes: "lundi", martes: "mardi", "miércoles": "mercredi", jueves: "jeudi", viernes: "vendredi", "sábado": "samedi", domingo: "dimanche",
  "español": "espagnol", "española": "espagnole", "españoles": "espagnols", "inglés": "anglais", "francés": "français", "francesa": "française",
  "franceses": "français (pluriel)", gracias: "merci", "muchas gracias": "merci beaucoup", "buenos días": "bonjour", "buenas tardes": "bonjour (l'après-midi)",
  "buenas noches": "bonsoir, bonne nuit", buen: "bon", buena: "bonne", buenos: "bons", buenas: "bonnes", cada: "chaque", "cada día": "chaque jour",
  "veces": "fois", "a veces": "parfois", vez: "fois", "otra vez": "encore une fois", duele: "fait mal (doler)", duelen: "font mal (doler)",
  "sábados": "les samedis", domingos: "les dimanches", lunes: "lundi, le lundi", enero: "janvier", febrero: "février", marzo: "mars", abril: "avril",
  mayo: "mai", junio: "juin", julio: "juillet", agosto: "août", septiembre: "septembre", octubre: "octobre", noviembre: "novembre", diciembre: "décembre",
  veintiuno: "vingt et un", "veintidós": "vingt-deux", "veintitrés": "vingt-trois", veinticuatro: "vingt-quatre", veinticinco: "vingt-cinq",
  "veintiséis": "vingt-six", veintisiete: "vingt-sept", veintiocho: "vingt-huit", veintinueve: "vingt-neuf", sesenta: "soixante",
  setenta: "soixante-dix", ochenta: "quatre-vingts", noventa: "quatre-vingt-dix", medio: "demi, et demi", demasiado: "trop", "súper": "super",
  he: "j'ai (avant un participe : passé composé)", has: "tu as (passé composé)", ha: "il a (passé composé)", hemos: "nous avons (passé composé)",
  "habéis": "vous avez (passé composé)", han: "ils ont (passé composé)", hay: "il y a", "había": "il y avait",
};

const min = s => (s || "").toLocaleLowerCase("es");
// Le gérondif (« trabajando », « haciendo », « leyendo ») et les impératifs irréguliers avec tú (U8).
const GERONDIFS = { dormir: "durmiendo", pedir: "pidiendo", servir: "sirviendo", vestir: "vistiendo", decir: "diciendo", venir: "viniendo", poder: "pudiendo", preferir: "prefiriendo", ir: "yendo", leer: "leyendo", traer: "trayendo", oír: "oyendo" };
const gerondif = inf => GERONDIFS[inf] || (inf.endsWith("ar") ? inf.slice(0, -2) + "ando" : /[aeo]$/.test(inf.slice(0, -2)) ? inf.slice(0, -2) + "yendo" : inf.slice(0, -2) + "iendo");
const IMPERATIFS = { haz: "hacer", pon: "poner", ten: "tener", sal: "salir", ven: "venir", di: "decir", ve: "ir", "sé": "ser" };
// Un pronom collé à la fin (« verme », « buscarla », « lávate », « cógela ») : on le retire pour retrouver le verbe.
const PRONOMS_COLLES = ["nos", "los", "las", "les", "me", "te", "se", "lo", "la", "le"];
const sansAccent = s => s.replace(/[áéíóú]/, c => "aeiou"["áéíóú".indexOf(c)]);
const PROPRES = new Set([...NOMS, "francia", "españa", "valencia", "hyères", "toulon", "marignane", "carpentras", "estados", "unidos"]);
const ARTICLE = /^(el|la|los|las|un|una|unos|unas)\s+/;

// ── L'index : chaque forme connue → ce qu'elle peut être ──
// { sorte: "carte", m, verbe? } · { sorte: "verbe", x, p, t } (p : 0-5, -1 infinitif, -2 participe) · { sorte: "petit", g }
let cache = { cle: null, index: null };
function ajouter(index, cle, entree) {
  cle = min(cle).replace(/[¿?¡!.,…«»"]/g, "").replace(/\s+/g, " ").trim();
  if (!cle) return;
  const l = index.get(cle) || index.set(cle, []).get(cle);
  if (!l.some(e => e.sorte === entree.sorte && (e.m === entree.m && e.x === entree.x) && e.p === entree.p && e.t === entree.t)) l.push(entree);
}
const pluriels = w => /[aeiouáéó]$/.test(w) ? [w + "s"] : w.endsWith("z") ? [w.slice(0, -1) + "ces"] : [w + "es"];
const singuliers = w => [w.endsWith("es") && w.slice(0, -2), w.endsWith("s") && w.slice(0, -1), w.endsWith("ces") && w.slice(0, -3) + "z"].filter(Boolean);

function construire(ctx) {
  const index = new Map();
  const mots = [...ctx.mots, ...motsAMoi()];
  // Les verbes : toutes leurs formes, à tous les temps que l'appli connaît.
  for (const x of verbesConnus(ctx)) {
    ajouter(index, x.v, { sorte: "verbe", x, p: -1 });
    if (x.inf !== x.v) ajouter(index, x.inf, { sorte: "verbe", x, p: -1 });
    for (const t of ORDRE_TEMPS) for (let p = 0; p < 6; p++) {
      let f;
      try { f = conjuguer(x.v, p, x.d, t); } catch { continue; }
      if (!f) continue;
      ajouter(index, f, { sorte: "verbe", x, p, t });
      const ms = f.split(" ");
      // « me levanté » se touche aussi par « levanté » ; « he comido » par « comido » (le participe).
      if (ms.length > 1) ajouter(index, ms.at(-1), { sorte: "verbe", x, p: t === "pc" ? -2 : p, t, seul: true });
    }
    ajouter(index, gerondif(x.inf), { sorte: "verbe", x, p: -3 });
  }
  for (const [f, inf] of Object.entries(IMPERATIFS)) {
    const x = verbesConnus(ctx).find(y => y.v === inf);
    if (x) ajouter(index, f, { sorte: "verbe", x, p: -4 });
  }
  // Les verbes comme gustar (« me gusta », « les encantan ») : leurs formes, sans entraînement (le bouton est celui de la carte).
  for (const m of ctx.mots) {
    const vb = verbeDe(m);
    if (!vb?.gustar) continue;
    const x = { v: vb.v, inf: vb.inf, d: vb.d, fr: m.fr, carte: m, cartes: [m], gustar: true };
    for (const t of ORDRE_TEMPS) for (let p = 0; p < 6; p++) {
      try { const f = conjuguer(vb.v, p, vb.d, t); if (f) ajouter(index, f.split(" ").at(-1), { sorte: "verbe", x, p: p === 5 ? 5 : 2, t }); } catch { /* */ }
    }
  }
  // Les cartes du Sheet et mes mots.
  for (const m of mots) {
    const variantes = m.es.replace(/\([^)]*\)/g, " ").split(/\s*\/\s*/).map(v => min(v).replace(/[¿?¡!.,…]/g, "").trim()).filter(Boolean);
    for (const v of variantes) {
      const sans = v.replace(ARTICLE, "");
      ajouter(index, v, { sorte: "carte", m });
      ajouter(index, sans, { sorte: "carte", m });
      if (!sans.includes(" ") && (m.categorie || "") !== "verbe") {
        for (const f of [...pluriels(sans), ...singuliers(sans)]) ajouter(index, f, { sorte: "carte", m, forme: true });
      }
      // Un mot d'une expression, touché seul (« frío » dans « tengo frío ») : on montre l'expression qui le contient.
      const [premier, ...reste] = sans.split(" ");
      if (reste.length) for (const w of sans.split(" ").slice(/[aeií]r(se)?$/.test(premier) ? 1 : 0)) {
        if (w.length >= 4 && !PETITS_MOTS[w] && !/…/.test(w)) ajouter(index, w, { sorte: "carte", m, partiel: true });
      }
      // Une expression qui commence par un verbe (« tener prisa ») : avec le verbe conjugué.
      if (!reste.length || !/[aeií]r(se)?$/.test(premier)) continue;
      const vb = verbeDe({ ...m, categorie: "verbe", es: premier });
      if (!vb?.formes) continue;
      for (const t of ORDRE_TEMPS) for (let p = 0; p < 6; p++) {
        let f;
        try { f = conjuguer(vb.v, p, vb.d, t); } catch { continue; }
        if (!f) continue;
        ajouter(index, `${f} ${reste.join(" ")}`, { sorte: "carte", m, verbe: { v: vb.v, p, t } });
        // Le verbe seul (« tomamos » quand le Sheet n'a que « tomar algo ») : l'expression, si aucun verbe ne le connaît déjà.
        if (!(index.get(f) || []).some(e => e.sorte === "verbe")) ajouter(index, f, { sorte: "carte", m, verbe: { v: vb.v, p, t }, partiel: true });
      }
    }
  }
  for (const [k, g] of Object.entries(PETITS_MOTS)) ajouter(index, k, { sorte: "petit", g });
  return index;
}
export function indexDe(ctx) {
  const cle = `${ctx.mots.length}|${motsAMoi().length}|${ctx.mots[0]?.id}`;
  if (cache.cle !== cle) cache = { cle, index: construire(ctx) };
  return cache.index;
}

// Les extras d'une question : « el fútbol = le foot · buscar = chercher » → { "el fútbol": "le foot", fútbol: "le foot", buscar: "chercher" }.
export function lireExtras(texte) {
  const extras = {};
  for (const bout of (texte || "").split(/\s*·\s*/)) {
    const [es, fr] = bout.split(/\s*=\s*/);
    if (!es || !fr) continue;
    for (const v of es.split(/\s*\/\s*/)) { extras[min(v.trim())] = fr.trim(); extras[min(v.trim()).replace(ARTICLE, "")] = fr.trim(); }
  }
  return extras;
}

// ── Découper une phrase en morceaux ──
// { t, debut } pour la ponctuation, les espaces, les prénoms et ce qui est entre parenthèses ;
// { t, debut, cle } pour un mot ou un groupe à toucher (cle : la forme cherchée dans l'index, en minuscules).
export function decouper(phrase, ctx, extras = {}) {
  const index = indexDe(ctx);
  const sortie = [];
  // Le texte entre parenthèses reste tel quel (« (hablar) », « (il y avait) ») : c'est la consigne, pas la phrase.
  const re = /\([^)]*\)|\p{L}+|[^\p{L}(]+|\(/gu;
  const jetons = [...phrase.matchAll(re)].map(m => ({ t: m[0], debut: m.index }));
  const connu = cle => index.has(cle) || extras[cle] !== undefined;
  for (let i = 0; i < jetons.length;) {
    const j = jetons[i];
    if (!/^\p{L}/u.test(j.t) || PROPRES.has(min(j.t))) { sortie.push({ t: j.t, debut: j.debut }); i++; continue; }
    let trouve = null;
    for (let n = 5; n >= 2 && !trouve; n--) {
      const bout = jetons.slice(i, i + 2 * n - 1);
      if (bout.length < 2 * n - 1 || bout.some((x, k) => k % 2 ? x.t !== " " : !/^\p{L}+$/u.test(x.t) || PROPRES.has(min(x.t)))) continue;
      const texte = bout.map(x => x.t).join("");
      if (connu(min(texte))) trouve = { t: texte, debut: j.debut, cle: min(texte), n: bout.length };
    }
    if (!trouve) trouve = { t: j.t, debut: j.debut, cle: min(j.t), n: 1 };
    sortie.push({ t: trouve.t, debut: trouve.debut, cle: trouve.cle });
    i += trouve.n;
  }
  return sortie;
}

// ── Ce qu'un morceau veut dire ──
// Renvoie { cle, verbes: [{ x, p, t }], carte: { m, verbe? } | null, petit: "…" | null, extra: "…" | null }.
export function sens(ctx, cle, extras = {}) {
  const index = indexDe(ctx);
  let entrees = index.get(cle) || [];
  let pronom = "";
  if (!entrees.length && !cle.includes(" ")) {
    for (const pr of PRONOMS_COLLES) {
      if (!cle.endsWith(pr) || cle.length < pr.length + 2) continue;
      const base = cle.slice(0, -pr.length);
      const trouve = (index.get(base) || index.get(sansAccent(base)) || []).filter(e => e.sorte === "verbe");
      if (trouve.length) { entrees = trouve.map(e => ({ ...e, p: e.p === -1 ? -1 : -4 })); pronom = pr; break; }
    }
  }
  // Une carte (« casa », même dans « trabajar desde casa ») passe avant un verbe trouvé par le dernier mot d'une forme (« se casa »).
  if (entrees.some(e => e.sorte === "carte")) entrees = entrees.filter(e => !e.seul);
  const verbes = [];
  for (const e of entrees.filter(e => e.sorte === "verbe")) {
    // Un même verbe à plusieurs personnes (« levanté » : yo) : on garde la première ; deux verbes (« fui » : ir et ser) : les deux.
    if (!verbes.some(v => v.x.v === e.x.v)) verbes.push(e);
  }
  // La carte : la forme exacte d'abord (« piso »), puis un pluriel ou un féminin (« vecinos »). Un verbe passe par sa propre carte.
  const cartes = entrees.filter(e => e.sorte === "carte" && !(verbes.length && (e.m.categorie || "") === "verbe"));
  const carte = cartes.find(e => !e.forme && !e.partiel) || cartes.find(e => !e.partiel) || cartes[0] || null;
  const petit = entrees.find(e => e.sorte === "petit")?.g || null;
  return { cle, verbes, carte, petit, pronom, extra: extras[cle] ?? null };
}

// Le statut d'une carte : « déjà appris », « plus loin dans le livre » (et sa leçon), « Mes mots ».
export function statut(ctx, m) {
  if (m.moi) return { cas: "moi" };
  return motVu(ctx, m) ? { cas: "appris", lecon: m.lecon } : { cas: "loin", lecon: m.lecon };
}

// La personne et le temps, en mots : « ellos, ellas · présent », « infinitif », « participe · passé composé ».
export function personneEtTemps({ p, t }) {
  if (p === -1) return "infinitif";
  if (p === -3) return "gérondif (en train de…)";
  if (p === -4) return "impératif (tú)";
  const temps = TEMPS[t || "present"].nom;
  if (p === -2) return `participe · ${temps}`;
  return `${PERSONNES[p]} · ${temps}`;
}

// Le texte d'une phrase sans la consigne entre parenthèses, pour la voix.
export const pourLaVoix = phrase => phrase.replace(/\s*\([^)]*\)/g, "").replace(/___/g, "…").replace(/^—\s*/, "").trim();

// ── Le HTML d'une phrase qu'on peut toucher ──
// options : fr (la traduction écrite par l'auteur, si elle peut se montrer), extras (texte « es = fr · … »),
// gloses ([{ t, g }] : les traductions de l'auteur, morceau par morceau, pour les lectures),
// marques ([{ debut, fin, cls }] : des passages à surligner, comme la bonne réponse ou une erreur).
export function phraseTouchable(ctx, phrase, { fr = "", extras = "", gloses = null, marques = [] } = {}) {
  const ex = lireExtras(extras);
  const morceaux = gloses
    ? (() => { let k = 0; return gloses.map(g => { const d = phrase.indexOf(g.t, k); k = d + g.t.length; return { t: g.t, debut: d, cle: g.g !== undefined ? min(g.t) : undefined, g: g.g, nouveau: g.nouveau }; }); })()
    : decouper(phrase, ctx, ex);
  const html = morceaux.map(m => {
    const fin = m.debut + m.t.length;
    const marque = marques.find(x => m.cle !== undefined && x.debut < fin && x.fin > m.debut);
    const texte = esc(m.t);
    if (m.cle === undefined) return texte;
    const mot = `<span class="tx-mot${m.nouveau ? " nouveau" : ""}" role="button" tabindex="0" data-tx="${esc(m.cle)}"${m.g ? ` data-g="${esc(m.g)}"` : ""}>${texte}</span>`;
    return marque ? `<mark class="${marque.cls}">${mot}</mark>` : mot;
  }).join("");
  return `<span class="tx-ph" lang="es" data-tx-voix="${esc(pourLaVoix(phrase))}"${fr ? ` data-tx-fr="${esc(fr)}"` : ""}${extras ? ` data-tx-extras="${esc(extras)}"` : ""}>${html}</span>`;
}

// Les passages faux d'une réponse corrigée (corriger.js : [{ brut, juste }]) → des marques pour phraseTouchable.
export function marquesDe(texte, morceaux, cls) {
  const marques = [];
  let k = 0;
  for (const { brut, juste } of morceaux || []) {
    const d = texte.indexOf(brut, k);
    if (d < 0) continue;
    k = d + brut.length;
    if (!juste) marques.push({ debut: d, fin: k, cls });
  }
  return marques;
}

export { normaliser };
