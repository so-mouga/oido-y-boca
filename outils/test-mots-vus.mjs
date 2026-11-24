// Vérifie que les exercices (exercices.js), le bonus (bonus.js) et le contrôle (controles.js) n'utilisent
// que des mots déjà vus à la fin de leur unité (Q10-12) : une carte du Sheet d'une leçon ≤ celle de l'exercice, une forme conjuguée
// d'un verbe vu (aux temps déjà vus), un petit mot de grammaire déjà vu (la liste OUTILS de test-lectures.mjs, par unité),
// un mot de l'exemple d'une carte vue, un exemple de la grammaire du livre d'une leçon vue,
// ou un mot donné dans la question elle-même (le verbe entre parenthèses, « sens » et « mot » du bonus).
// Les prénoms et les villes ne comptent pas. Le français des consignes non plus (« Traduis » : seule la réponse espagnole compte).
// Lancer depuis appli/ : node outils/test-mots-vus.mjs [chemin/vers/vocabulaire.csv]
// Sans chemin, le test lit l'onglet « Vocabulaire » du Sheet directement.
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-mots-vus-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js"))) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const { conjuguer, TEMPS, CONTROLES } = await import(path.join(tmp, "controles.js"));
const { verbeDe, rangLecon } = await import(path.join(tmp, "dico.js"));
const { LECONS } = await import(path.join(tmp, "position.js"));
const { EXERCICES } = await import(path.join(tmp, "exercices.js"));
const { BONUS } = await import(path.join(tmp, "bonus.js"));
const { NOMS } = await import(path.join(tmp, "lectures.js"));

const csv = process.argv[2]
  ? fs.readFileSync(process.argv[2], "utf8")
  : await (await fetch("https://docs.google.com/spreadsheets/d/1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ/gviz/tq?tqx=out:csv&sheet=Vocabulaire")).text();
const mots = versMots(lireCsv(csv));

const min = s => s.toLocaleLowerCase("es");
const motsDe = s => (min(s || "").match(/\p{L}+/gu) || []);
const uniteDe = lecon => { const m = lecon.match(/^U(\d+)/); return m ? Number(m[1]) : 8.5; }; // Noël : entre U8 et U9

// Les petits mots de grammaire, par unité : la même liste que test-lectures.mjs (à garder pareilles).
const OUTILS = {
  1: `el la los las un una y o de del al a con en por para no sí muy mucho mucha muchos muchas poco más cómo qué dónde
      mi mis tu tus su sus yo tú él ella nosotros me te se hola adiós gracias favor español española inglés cinco francia`,
  // En plus de test-lectures.mjs : les 6 personnes de la conjugaison, vues dès le présent de U1-L1 (vosotros, ellos).
  "1b": `nosotras vosotros vosotras ellos ellas`,
  // L'âge de Léo et de Dorian avec « tener … años » (U1-L2), avant les nombres de U2.
  "1c": `cuatro siete`,
  // Le féminin et le pluriel de « poco » (U6-L3 : *poca verdura*).
  "1d": `poca pocos pocas`,
  2: `cero uno una dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete
      dieciocho diecinueve veinte veintiuno veintidós veintitrés veinticuatro veinticinco veintiséis veintisiete veintiocho veintinueve treinta cuarenta cincuenta sesenta
      setenta ochenta noventa cien mil menos cuarto media
      lunes martes miércoles jueves viernes sábado domingo sábados domingos
      enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre`,
  // Le féminin de « todo el día » (U9-L1) : *toda la tarde*.
  9: `toda todas`,
  4: `nuestro nuestra nuestros nuestras vuestro vuestra vuestros vuestras que`,
  5: `usted ustedes vosotros vosotras`,
  6: `le les mí ti tampoco quería pones demasiado demasiada demasiados demasiadas`,
  7: `hay aquí ahí allí este esta estos estas ese esa esos esas eso esto aquel aquella aquellos aquellas`,
  8: `ven pon sal haz di ve ten sé lávate siéntate ponte quítate báñate dúchate vístete acuéstate levántate despiértate date
      toques corras grites hagas lo`,
};
const sansAccent = w => w.normalize("NFD").replace(/[\u0301]/g, "").normalize("NFC");
// Le pluriel et le singulier d'un mot (« portugués » → portugueses, « español » → españoles, « años » → año).
const nombres = w => [/[aeiouáéó]$/.test(w) ? w + "s" : /[áéíóú][ns]$/.test(w) ? sansAccent(w) + "es" : /z$/.test(w) ? w.slice(0, -1) + "ces" : w + "es",
  w.endsWith("s") && w.slice(0, -1), w.endsWith("es") && w.slice(0, -2), w.endsWith("eses") && w.slice(0, -4) + "és"].filter(Boolean);
const PROPRES = new Set([...NOMS, "navidad", "nochebuena", "galicia", "valencia", "francia", "hyères", "toulon", "marignane", "carpentras", "españa", "dragon", "ball",
  // Les mots transparents de la vraie histoire de Kevin (U15), absents du livre : pareils en français (Q13-1, validé par Kevin le 24 nov.).
  "internet", "metro"]);

// Les formes d'un verbe aux temps vus à ce rang (gérondif dès U5, « ducharme » dès U3, comme test-lectures.mjs).
const GERONDIFS = { dormir: "durmiendo", pedir: "pidiendo", servir: "sirviendo", vestir: "vistiendo", decir: "diciendo", venir: "viniendo", poder: "pudiendo", preferir: "prefiriendo", ir: "yendo" };
function formes(v, d, rang, u, se) {
  const out = new Set();
  const inf = v.replace(/se$/, "");
  for (const [t, def] of Object.entries(TEMPS)) {
    if (rangLecon(def.lecon) > rang) continue;
    for (let p = 0; p < 6; p++) { try { for (const w of motsDe(conjuguer(v, p, d, t))) out.add(w); } catch { /* inconnu du moteur */ } }
  }
  if (u >= 5) {
    const r = inf.slice(0, -2);
    out.add(GERONDIFS[inf] || (inf.endsWith("ar") ? r + "ando" : /[aeo]$/.test(r) ? r + "yendo" : r + "iendo"));
  }
  if (se && u >= 3) for (const pr of ["me", "te", "se", "nos", "os"]) out.add(inf + pr);
  out.add(inf); out.add(v);
  return out;
}

// Les mots vus jusqu'au rang donné (une leçon), mis en cache.
const cache = new Map();
function vusJusqua(rang) {
  if (cache.has(rang)) return cache.get(rang);
  const u = uniteDe(LECONS.find(l => rangLecon(l.id) === rang)?.id || "U25");
  const vus = new Set();
  for (const m of mots.filter(m => rangLecon(m.lecon) <= rang)) {
    const es = m.es.replace(/\([^)]*\)/g, " ").replace(/=.*/, " ");
    // Ce que la carte précise entre parenthèses, en espagnol (« apuntar (a una actividad) ») : lu sur la carte.
    for (const p of m.es.matchAll(/\(([^)=]*)\)/g)) for (const w of motsDe(p[1])) vus.add(w);
    // Le pluriel d'un nom ou d'un adjectif (« el año » → años), et le singulier d'une carte au pluriel (« los suegros » → suegro,
    // « tener … años » → año). Pas pour le verbe d'une carte (« tener »).
    motsDe(es).forEach((w, i) => {
      vus.add(w);
      if (m.categorie !== "verbe" || i > 0) for (const f of nombres(w)) vus.add(f);
    });
    // L'exemple de la carte, déjà lu sur la carte (« Me despierto a las siete » avant la règle e → ie).
    // Avec le pluriel d'un nom de l'exemple (« ¿Prefieres vino o cerveza? » → cervezas).
    for (const w of motsDe(m.ex)) { vus.add(w); for (const f of nombres(w)) vus.add(f); }
    const premier = min(es.trim().split(/[\s…]+/)[0] || "");
    if (!/^\p{L}*[aeií]r(se)?$/u.test(premier)) continue;
    const vb = verbeDe({ ...m, categorie: "verbe" });
    if (!vb) continue;
    // Une carte qui apprend le verbe dans une tournure (« tener … años » en U1-L2) : son présent est vu, même irrégulier.
    if (vb.regles.some(r => r.lecon && !r.texte.startsWith("Un verbe en -se") && rangLecon(r.lecon) > rang)) {
      if (/\s/.test(es.trim())) for (let p = 0; p < 6; p++) { try { for (const w of motsDe(conjuguer(vb.v, p, vb.d))) vus.add(w); } catch { /* */ } }
      continue;
    }
    for (const w of formes(vb.v, vb.d, rang, u, vb.se)) vus.add(w);
  }
  // La grammaire du livre des leçons vues : ses exemples en italique ou en gras (*tengo … años*, *estoy cansado*, **duele**).
  for (const l of LECONS.filter(l => rangLecon(l.id) <= rang)) for (const m of (l.grammaire || "").matchAll(/\*+([^*]+)\*+/g)) for (const w of motsDe(m[1])) { vus.add(w); for (const f of nombres(w)) vus.add(f); }
  for (const [k, v] of Object.entries(OUTILS)) if (parseInt(k) <= u) for (const w of v.split(/\s+/).filter(Boolean)) { vus.add(w); for (const f of nombres(w)) vus.add(f); }
  cache.set(rang, vus);
  return vus;
}

// Ce que la question donne elle-même : le verbe à conjuguer et ses formes, « sens », « mot », le texte entre parenthèses.
function donnes(q, rang, u) {
  const d = new Set();
  if (q.v) for (const w of formes(q.v, q.d, Infinity, u, /se$/.test(q.v))) d.add(w);
  // Le mot donné par le bonus (« italiano = italien ») : avec son pluriel et son féminin (« italianos », « médica »).
  for (const w of motsDe((q.mot || "").replace(/=[^·]*/g, " "))) {
    for (const f of [w, ...nombres(w), w.replace(/o$/, "a"), w.replace(/o$/, "as")]) d.add(f);
    // Un verbe donné (« beber = boire ») : ses formes aussi (*Bebo mucha agua*).
    if (/[aeií]r(se)?$/u.test(w) && w.length > 3) for (const f of formes(w, undefined, Infinity, u, /se$/.test(w))) d.add(f);
  }
  // « sens » : le sens du verbe (« rester »), ou des mots donnés dans un exercice (« la cámara = la caméra · grabar = filmer »).
  for (const w of motsDe((q.sens || "").replace(/=[^·]*/g, " "))) {
    for (const f of [w, ...nombres(w)]) d.add(f);
    if (/[aeií]r(se)?$/u.test(w) && w.length > 3) for (const f of formes(w, undefined, Infinity, u, /se$/.test(w))) d.add(f);
  }
  for (const m of (q.fr || "").matchAll(/\(([^)]*)\)/g)) for (const w of motsDe(m[1])) {
    d.add(w);
    // Un verbe donné entre parenthèses (« (aprender) ») : ses formes aussi, gérondif compris dès U5 (*estoy aprendiendo*).
    if (/[aeií]r(se)?$/u.test(w) && w.length > 3) for (const f of formes(w, undefined, Infinity, u, /se$/.test(w))) d.add(f);
  }
  return d;
}

// L'espagnol d'une question : la phrase à compléter (sans les parenthèses), ses réponses, et la réponse d'un « À dire ».
const sansParentheses = s => (s || "").replace(/\([^)]*\)/g, " ");
const espagnolDe = (q, phraseEspagnole) => [phraseEspagnole ? sansParentheses(q.fr) : "", ...(Array.isArray(q.es) ? q.es.slice(0, 1) : [q.es || ""]).map(sansParentheses)].join(" ");

// Un pronom collé à la fin d'un verbe connu (« comprarlas », « cógela », « hazlos ») : appris en U10-L3 et U10-L4.
// Avant U10, seulement une variante d'une forme déjà lue (« felicitarlos » sur la carte → felicitarlas).
const CLITIQUES = ["los", "las", "lo", "la", "les", "le", "me", "te", "nos", "os", "se"];
function colle(w, connu, u) {
  for (const c of CLITIQUES) {
    if (!w.endsWith(c) || w.length - c.length < 2) continue;
    const base = w.slice(0, -c.length);
    if (u >= 10 && (connu(base) || connu(sansAccent(base)))) return true;
    if (/[aeií]r$/.test(base) && CLITIQUES.some(c2 => c2 !== c && connu(base + c2))) return true;
  }
  return false;
}
const fautes = []; // { ou, lecon, phrase, mots }
function verifier(ou, lecon, q, phraseEspagnole) {
  // Un mot de la même unité, même d'une leçon un peu plus loin, est accepté (Q10-12) : l'unité se fait en une semaine avec le prof.
  const rang = Math.max(rangLecon(lecon), ...LECONS.filter(l => uniteDe(l.id) === uniteDe(lecon)).map(l => rangLecon(l.id)));
  const u = uniteDe(lecon);
  const vus = vusJusqua(rang), d = donnes(q, rang, u);
  // Un mot donné par la question se reconnaît aussi quand son pluriel prend un accent (« joven » → jóvenes).
  const dSans = new Set([...d].map(sansAccent));
  const connu = w => vus.has(w) || d.has(w) || dSans.has(sansAccent(w));
  const inconnus = [...new Set(motsDe(espagnolDe(q, phraseEspagnole)))].filter(w => !connu(w) && !colle(w, connu, u) && !PROPRES.has(w));
  if (inconnus.length) fautes.push({ ou, lecon, phrase: phraseEspagnole ? q.fr : `${q.fr} → ${Array.isArray(q.es) ? q.es[0] : q.es}`, mots: inconnus });
}

for (const [lecon, ex] of Object.entries(EXERCICES)) {
  for (const q of ex.ecrire || []) verifier("exercice", lecon, q, q.fr.includes("___"));
  for (const q of ex.dire || []) verifier("à dire", lecon, q, false);
}
for (const [lecon, b] of Object.entries(BONUS)) {
  // Une phrase sans trou est écrite en français (« Écris en lettres », « Il est 4 h 15 ») : seule la réponse compte.
  for (const q of b.phrases || []) verifier("bonus", lecon, q, q.fr.includes("___"));
}
for (const [idU, c] of Object.entries(CONTROLES)) {
  const derniere = LECONS.filter(l => l.unite.id === idU).at(-1)?.id;
  for (const t of c.ecrit) for (const g of t.groupes || []) for (const q of g) verifier("contrôle", derniere, q, q.fr.includes("___"));
}

const parLecon = Object.groupBy(fautes, f => f.lecon);
for (const [lecon, fs_] of Object.entries(parLecon).sort((a, b) => rangLecon(a[0]) - rangLecon(b[0]))) {
  console.log(`\n${lecon}`);
  for (const f of fs_) console.log(`  ✗ [${f.ou}] ${f.phrase}   ← pas encore vu : ${f.mots.join(", ")}`);
}
console.log(fautes.length ? `\n${fautes.length} phrase(s) avec un mot pas encore vu.` : "\nTout est bon : chaque mot est déjà vu à sa leçon.");
process.exit(fautes.length ? 1 : 0);
