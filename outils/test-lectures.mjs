// Vérifie les lectures (lectures.js) avec le vrai vocabulaire du Sheet :
// - chaque mot d'un texte, de son titre et de ses questions est vu dans le livre jusqu'à l'unité du texte
//   (une carte du Sheet, une forme conjuguée d'un verbe vu, un petit mot de grammaire déjà vu),
//   ou fait partie des mots nouveaux du texte (2 au plus) ;
// - chaque mot du texte a sa traduction (dans le texte ou dans GLOSE), sauf les prénoms ;
// - chaque question a 3 choix et une bonne réponse ; les textes d'un niveau vont de la plus petite unité à la plus grande.
// Lancer depuis appli/ : node outils/test-lectures.mjs [chemin/vers/vocabulaire.csv]
// Sans chemin, le test lit l'onglet « Vocabulaire » du Sheet directement.
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
// Les modules de l'appli sont des modules ES en .js : on les copie dans un dossier marqué « type: module ».
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-lectures-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js"))) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const { conjuguer, TEMPS } = await import(path.join(tmp, "controles.js"));
const { verbeDe } = await import(path.join(tmp, "dico.js"));
const L = await import(path.join(tmp, "lectures.js"));

const csv = process.argv[2]
  ? fs.readFileSync(process.argv[2], "utf8")
  : await (await fetch("https://docs.google.com/spreadsheets/d/1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ/gviz/tq?tqx=out:csv&sheet=Vocabulaire")).text();
const mots = versMots(lireCsv(csv));

const min = s => s.toLocaleLowerCase("es");
const motsDe = s => (min(s).match(/\p{L}+/gu) || []);
const uniteDe = lecon => { const m = lecon.match(/^U(\d+)/); return m ? Number(m[1]) : 8.5; }; // Noël : entre U8 et U9

// ── Les petits mots de grammaire, vus à partir de l'unité donnée (pas dans le Sheet) ──
// U1 : articles, prépositions, pronoms, possessifs courants, et ce que les phrases clés de U1 utilisent
// (español, inglés : U1-L4 ; cinco : U1-L3 ; mucho, un poco : U1-L6 ; Francia : l'exemple de « el jefe »).
const OUTILS = {
  1: `el la los las un una y o de del al a con en por para no sí muy mucho mucha muchos muchas poco más cómo qué dónde
      mi mis tu tus su sus yo tú él ella nosotros me te se hola adiós gracias favor español española inglés cinco francia`,
  // U2 : les nombres, les jours, les mois (et « las », « menos », « cuarto », « media » pour l'heure).
  2: `cero uno una dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete
      dieciocho diecinueve veinte veintiuno veintidós veintitrés veinticuatro veinticinco treinta cuarenta cincuenta sesenta
      setenta ochenta noventa cien mil menos cuarto media
      lunes martes miércoles jueves viernes sábado domingo sábados domingos
      enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre`,
  // U4 : les possessifs (U4-L1) et « tener que » (U4-L4).
  4: `nuestro nuestra nuestros nuestras vuestro vuestra vuestros vuestras que`,
  // U5 : usted (U5-L1), vosotros (U5-L4).
  5: `usted ustedes vosotros vosotras`,
  // U6 : gustar (le, les, a mí, a ti), commander (« quería », « ¿me pones…? »), también / tampoco, demasiado.
  6: `le les mí ti tampoco quería pones demasiado demasiada demasiados demasiadas`,
  // U7 : hay (U7-L1), aquí / ahí / allí et este / ese / aquel (U7-L3).
  7: `hay aquí ahí allí este esta estos estas ese esa esos esas eso esto aquel aquella aquellos aquellas`,
  // U8 : les impératifs irréguliers (U8-L2), ceux des verbes en -se (U8-L3), les 4 « non » (U8-L4), « lo » de « ¡Qué bien lo haces! ».
  8: `ven pon sal haz di ve ten sé lávate siéntate ponte quítate báñate dúchate vístete acuéstate levántate despiértate date
      toques corras grites hagas lo`,
};
const outilsJusqua = u => new Set(Object.entries(OUTILS).filter(([k]) => Number(k) <= u).flatMap(([, v]) => v.split(/\s+/).filter(Boolean)));

// Les gérondifs qui changent (e → i, o → u).
const GERONDIFS = { dormir: "durmiendo", pedir: "pidiendo", servir: "sirviendo", vestir: "vistiendo", decir: "diciendo", venir: "viniendo", poder: "pudiendo", preferir: "prefiriendo", ir: "yendo" };

// Les noms propres des textes : jamais comptés comme des mots.
const PROPRES = new Set([...L.NOMS, "san", "lorenzo"]);

// Les mots vus jusqu'à l'unité u : chaque mot de chaque carte (« trabajar desde casa » → trabajar, desde, casa ;
// « francés / francesa » → les deux), et pour un verbe, ses formes aux temps déjà vus.
function vusJusqua(u) {
  const vus = new Set();
  const temps = Object.entries(TEMPS).filter(([, t]) => uniteDe(t.lecon) <= u).map(([k]) => k);
  for (const m of mots.filter(m => uniteDe(m.lecon) <= u)) {
    const es = m.es.replace(/\([^)]*\)/g, " ").replace(/=.*/, " ");
    for (const w of motsDe(es)) vus.add(w);
    // Le pluriel des noms et des adjectifs (la grammaire de U1) : « el año » → años, « la hermana » → hermanas.
    if (m.categorie !== "verbe") for (const w of motsDe(es)) vus.add(/[aeiouáéó]$/.test(w) ? w + "s" : w + "es");
    // Un verbe : le premier mot de la carte, s'il ressemble à un infinitif (« trabajar desde casa » compte aussi).
    const premier = min(es.trim().split(/[\s…]+/)[0] || "");
    if (!/^\p{L}*[aeií]r(se)?$/u.test(premier)) continue;
    const vb = verbeDe({ ...m, categorie: "verbe" });
    if (!vb) continue;
    // Les formes conjuguées ne comptent que si leurs règles sont vues (« se viste » attend le e → i de U6-L2).
    // Sauf la règle des -se : la carte elle-même l'apprend (« llamarse » en U1-L2 : me llamo, te llamas).
    if (vb.regles.some(r => r.lecon && !r.texte.startsWith("Un verbe en -se") && uniteDe(r.lecon) > u)) continue;
    // Le gérondif, à partir de U5-L5 (« estoy trabajando ») : -ando, -iendo, -yendo après une voyelle.
    if (u >= 5) {
      const g = vb.inf.endsWith("ar") ? vb.inf.slice(0, -2) + "ando"
        : /[aeo]$/.test(vb.inf.slice(0, -2)) ? vb.inf.slice(0, -2) + "yendo" : vb.inf.slice(0, -2) + "iendo";
      vus.add(GERONDIFS[vb.inf] || g);
    }
    // Un verbe en -se après une préposition : « antes de ducharme » (U3-L1 et U3-L3).
    if (vb.se && u >= 3) for (const pr of ["me", "te", "se", "nos", "os"]) vus.add(vb.inf + pr);
    for (const t of temps) for (let p = 0; p < 6; p++) {
      try { for (const w of motsDe(conjuguer(vb.v, p, vb.d, t))) vus.add(w); } catch { /* verbe que le moteur ne sait pas conjuguer */ }
    }
  }
  for (const w of outilsJusqua(u)) vus.add(w);
  return vus;
}

let erreurs = 0;
const signaler = (t, msg) => { erreurs++; console.log(`✗ ${t.id} : ${msg}`); };
const cache = {};

for (const nv of L.NIVEAUX) {
  let avant = 0;
  for (const t of nv.textes) {
    if (!L.SORTES[t.sorte]) signaler(t, `sorte inconnue « ${t.sorte} »`);
    if (!nv.unites.includes(t.unite)) signaler(t, `unité ${t.unite} hors du niveau ${nv.n}`);
    if (t.unite < avant) signaler(t, "rangé après un texte d'une unité plus grande");
    avant = t.unite;
    const vus = cache[t.unite] ||= vusJusqua(t.unite);
    const nouveaux = Object.entries(t.nouveaux || {});
    if (nouveaux.length > 2) signaler(t, `${nouveaux.length} mots nouveaux (2 au plus)`);
    const formesNouvelles = new Set(nouveaux.flatMap(([, f]) => f.map(min)));
    for (const [lemme, f] of nouveaux) if (f.every(x => vus.has(min(x)))) signaler(t, `« ${lemme} » est déjà vu : pas besoin de le compter comme nouveau`);
    const nouveauxUtilises = new Set();

    // 1. Le vocabulaire : texte, titre, questions et choix.
    const tout = [t.titre, ...t.texte, ...t.questions.flatMap(q => [q.es, ...q.choix])].join(" ");
    const inconnus = new Set();
    for (const w of motsDe(tout)) {
      if (PROPRES.has(w) || vus.has(w)) continue;
      if (formesNouvelles.has(w)) { nouveauxUtilises.add(w); continue; }
      inconnus.add(w);
    }
    if (inconnus.size) signaler(t, `pas vus en U${t.unite} : ${[...inconnus].join(", ")}`);
    for (const [lemme, f] of nouveaux) if (!f.some(x => nouveauxUtilises.has(min(x)))) signaler(t, `mot nouveau « ${lemme} » absent du texte`);

    // 2. Les traductions : chaque mot du texte se touche et a sa traduction ; chaque traduction du texte sert.
    const servies = new Set();
    for (const p of t.texte) for (const ph of L.phrases(p)) for (const m of L.morceaux(ph, t)) {
      if (m.g === undefined) continue;
      if (m.g === null) signaler(t, `pas de traduction pour « ${m.t} » (${ph})`);
      else servies.add(min(m.t));
    }
    for (const cle of Object.keys(t.mots || {})) if (!servies.has(cle)) signaler(t, `traduction inutilisée « ${cle} »`);

    // 3. Les questions.
    if (t.questions.length !== 3) signaler(t, `${t.questions.length} questions (3 attendues)`);
    for (const q of t.questions) {
      if (!q.es || !q.fr) signaler(t, `question sans espagnol ou sans français : ${q.es}`);
      if (q.choix.length !== 3 || new Set(q.choix).size !== 3) signaler(t, `« ${q.es} » : il faut 3 choix différents`);
      if (!(q.bonne >= 0 && q.bonne < q.choix.length)) signaler(t, `« ${q.es} » : bonne réponse hors des choix`);
    }
    console.log(`${erreurs ? "·" : "✓"} niveau ${nv.n} · U${t.unite} · ${t.titre} · ${L.nbMots(t)} mots`);
  }
}

const ids = L.TEXTES.map(t => t.id);
if (new Set(ids).size !== ids.length) { erreurs++; console.log("✗ deux textes ont le même id"); }

console.log(erreurs ? `\n${erreurs} problème(s).` : `\nTout est bon : ${L.TEXTES.length} textes vérifiés.`);
process.exit(erreurs ? 1 : 0);
