// Vérifie les missions du jour de la Feria (missions.js).
// Lancer depuis appli/ : node outils/test-missions.mjs chemin/vers/vocabulaire.csv
// (le CSV : l'onglet « Vocabulaire » du Sheet, téléchargé avec l'adresse gviz de donnees.js).
//
// 1. Le pluriel : une liste écrite à la main (tous les cas difficiles), puis chaque nom du Sheet a un pluriel connu ou
//    est rangé exprès dans SANS_PLURIEL / les noms au pluriel seulement.
// 2. Le genre, les pièges, les nombres en lettres, la correction de ce que Kevin écrit.
// 3. La mission du jour, à plusieurs étapes du livre : seulement des mots vus, 6 colis (au singulier et sans étiquettes
//    avant U4-L2, puis 3 étiquettes) ou 6 lignes (à partir de U4-L2), jamais deux mots de la même carte, au moins un duo
//    d'erreur fréquente, la même toute la journée, l'ampoule et « un seul essai ». Pas de mission en U1-L1 et U1-L2.
// 4. Les duos (Q112) : chaque phrase n'a que des mots vus jusqu'à la leçon du duo (ou de la phrase), d'après le Sheet,
//    avec au plus un mot nouveau, traduit dans la 4e case ; et pas de traduction pour un mot déjà vu.
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ici = path.dirname(new URL(import.meta.url).pathname);
const charger = f => import(pathToFileURL(path.join(ici, "..", f)).href);
const M = await charger("missions.js");
const { LECONS } = await charger("position.js");
const { lireCsv, versMots } = await charger("donnees.js");
const { hasardDuJour } = await charger("charla.js");
const { DUOS } = await charger("duos.js");
const DUO = Object.fromEntries(DUOS.map(d => [d.id, d]));
globalThis.localStorage ??= { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { conjuguer, TEMPS } = await charger("controles.js");
const { verbeDe } = await charger("dico.js");

let erreurs = 0;
const faux = (...t) => { erreurs++; console.log("✗", ...t); };
const egal = (nom, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) faux(nom, "obtenu", JSON.stringify(a), "attendu", JSON.stringify(b)); };

// ——— 1. le pluriel, écrit à la main ———
const PL = {
  piso: "pisos", ciudad: "ciudades", reunión: "reuniones", ordenador: "ordenadores", cumpleaños: "cumpleaños", lunes: "lunes",
  mes: "meses", examen: "exámenes", joven: "jóvenes", imagen: "imágenes", orden: "órdenes", salón: "salones", turrón: "turrones",
  jardín: "jardines", autobús: "autobuses", inglés: "ingleses", país: "países", árbol: "árboles", móvil: "móviles", lápiz: "lápices",
  disfraz: "disfraces", vez: "veces", luz: "luces", rey: "reyes", ley: "leyes", sofá: "sofás", café: "cafés", papá: "papás",
  dosis: "dosis", tren: "trenes", pan: "panes", sol: "soles", mujer: "mujeres", reloj: "relojes", tobogán: "toboganes",
  sartén: "sartenes", pádel: "pádeles", virus: "virus", día: "días", mano: "manos", agua: "aguas", tutor: "tutores", carácter: "caracteres",
  autorización: "autorizaciones", bici: "bicis", tribu: "tribus", régimen: "regímenes", hotel: "hoteles", gas: "gases", crisis: "crisis",
};
for (const [s, p] of Object.entries(PL)) egal(`pluriel(${s})`, M.pluriel(s)?.forme, p);
egal("pluriel d'un mot étranger", M.pluriel("club"), null);
egal("pluriel en plusieurs mots", M.pluriel("fin de semana"), null);
egal("règle de reunión", M.pluriel("reunión").regle, "accent");
egal("règle d'examen", M.pluriel("examen").regle, "accentAjoute");
egal("règle de cumpleaños", M.pluriel("cumpleaños").regle, "invariable");

// ——— 2. le genre, les pièges, les nombres, la correction ———
const carte = (es, fr, lecon = "U1-L3") => ({ id: `${lecon}|${es}`, es, fr, lecon, categorie: "nom" });
const [manana] = M.nomsDe(carte("la mañana", "le matin"));
egal("mañana : genre", manana.genre, "f"); egal("mañana : piège", M.piege(manana), "francais");
const [edad] = M.nomsDe(carte("la edad", "l'âge"));
egal("edad : piège (l'âge est masculin)", M.piege(edad), "francais");
egal("día : piège -a", M.piege(M.nomsDe(carte("el día", "le jour"))[0]), "finA");
const [agua] = M.nomsDe(carte("el agua", "l'eau"));
egal("agua : féminin avec el", [agua.genre, M.piege(agua), M.articlePluriel(agua)], ["f", "a", "las"]);
const deux = M.nomsDe(carte("el hermano / la hermana", "le frère / la sœur"));
egal("hermano / hermana : deux noms", deux.map(n => `${n.art} ${n.mot} = ${n.fr}`), ["el hermano = le frère", "la hermana = la sœur"]);
const ped = M.nomsDe(carte("el pediatra / la pediatra", "le / la pédiatre"));
egal("le / la pédiatre", ped.map(n => n.fr), ["le pédiatre", "la pédiatre"]);
egal("los suegros : au pluriel seulement", M.nomsDe(carte("los suegros", "les beaux-parents")).map(n => [n.plurielSeul, n.pluriel]), [[true, null]]);
egal("sans article : rien", M.nomsDe(carte("papá / mamá", "papa / maman")), []);
egal("plusieurs mots : rien", M.nomsDe(carte("el fin de semana", "le week-end")), []);
egal("pas un nom : rien", M.nomsDe({ ...carte("vivir", "vivre"), categorie: "verbe" }), []);
egal("nombres", [2, 15, 16, 20, 22, 30, 47, 100].map(M.enLettres), ["dos", "quince", "dieciséis", "veinte", "veintidós", "treinta", "cuarenta y siete", "cien"]);
egal("étiquette juste", M.corrigerEtiquette("reuniones", "reuniones"), { juste: true, accent: false });
egal("étiquette : accent en trop", M.corrigerEtiquette("reuniónes", "reuniones"), { juste: true, accent: true });
egal("étiquette : avec l'article", M.corrigerEtiquette("Las reuniones", "reuniones"), { juste: true, accent: false });
egal("étiquette : lettre fausse", M.corrigerEtiquette("ciudads", "ciudades"), { juste: false });
const l3 = { q: 3, rep: "tres reuniones" }, l1 = { q: 1, rep: "una hora" };
egal("ligne juste", M.corrigerLigne("tres reuniones", l3), { juste: true, chiffre: false, accent: false });
egal("ligne en chiffres", M.corrigerLigne("3 reuniones", l3), { juste: true, chiffre: true, accent: false });
egal("ligne : genre faux", M.corrigerLigne("un hora", l1), { juste: false });
egal("ligne : 1 en chiffre", M.corrigerLigne("1 hora", l1), { redemande: true });
egal("ligne : accent oublié", M.corrigerLigne("dieciseis dias", { q: 16, rep: "dieciséis días" }), { juste: true, chiffre: false, accent: true });

// ——— 3. le Sheet : chaque nom a un pluriel, ou il est rangé exprès ———
const csv = process.argv[2];
if (!csv) { console.error("Donne le CSV du vocabulaire : node outils/test-missions.mjs chemin/vers/vocabulaire.csv"); process.exit(1); }
const vocab = versMots(lireCsv(fs.readFileSync(csv, "utf8")));
const noms = vocab.flatMap(M.nomsDe);
const sans = noms.filter(n => !n.pluriel && !n.plurielSeul && !M.SANS_PLURIEL.has(n.mot));
if (sans.length) faux("Noms du Sheet sans pluriel (à écrire dans PLURIELS ou SANS_PLURIEL) :", sans.map(n => n.mot).join(", "));
console.log(`Sheet : ${noms.length} noms, ${noms.filter(n => n.pluriel).length} avec un pluriel, ${noms.filter(n => M.piege(n)).length} pièges.`);

// ——— 4. la mission du jour, à plusieurs étapes du livre ———
const rang = Object.fromEntries(LECONS.map((l, i) => [l.id, i]));
const rangDe = id => rang[id] ?? 1e6;
const jusqua = id => new Set(LECONS.filter(l => rangDe(l.id) <= rangDe(id)).map(l => l.id));
const jours = ["2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28", "2026-11-30", "2026-12-01"];
const SANS_MISSION = new Set(["U1-L1", "U1-L2"]);
for (const ici of ["U1-L1", "U1-L2", "U1-L3", "U1-L4", "U1-L6", "U2-L1", "U2-L4", "U4-L1", "U4-L2", "U8-L3", "U15-L1", "U25-L5"]) {
  const faites = jusqua(ici), pl = faites.has(M.LECON_PLURIEL);
  const ouverts = M.duosOuverts(DUOS, faites), frequents = ouverts.filter(d => d.frequent);
  let jeux = { jours: [] }, formes = [];
  for (const jour of jours) {
    const args = () => ({ mots: vocab, vu: m => faites.has(m.lecon), faites, etat: jeux.missions, jour, hasard: hasardDuJour(jour, "mision"), duos: DUOS });
    const mi = M.missionDuJour(args());
    if (SANS_MISSION.has(ici)) { if (mi) faux(ici, jour, "une mission alors que le livre n'a pas assez de noms"); continue; }
    if (!mi) { faux(ici, jour, "pas de mission"); continue; }
    formes.push(mi.forme);
    for (const n of mi.mots) if (!faites.has(n.lecon)) faux(ici, jour, "mot pas encore vu", n.mot, n.lecon);
    if (new Set(mi.mots.map(n => n.id)).size !== mi.mots.length) faux(ici, jour, "deux mots de la même carte");
    if (mi.forme === "duos") {
      if (mi.phrases.length !== M.PHRASES_DUO) faux(ici, jour, `${mi.phrases.length} phrases de duo`);
      if (new Set(mi.cles).size !== mi.cles.length) faux(ici, jour, "deux fois la même phrase");
      for (const id of mi.duos) if (!ouverts.some(d => d.id === id)) faux(ici, jour, "duo pas encore ouvert", id);
      if (frequents.length && !mi.duos.some(id => DUO[id].frequent)) faux(ici, jour, "pas de duo d'erreur fréquente");
      for (const p of mi.phrases) { const l = DUO[p.duo].phrases[Number(p.cle.split(":")[2])][4]; if (l && !faites.has(l)) faux(ici, jour, "phrase pas encore ouverte", p.cle); }
    } else if (mi.forme === "repartidor") {
      // Au tout début (U1-L3 : 5 noms vus), moins de 6 colis, mais au moins SEUIL.
      if (mi.colis.length !== M.COLIS && !(ici === "U1-L3" && mi.colis.length >= M.SEUIL)) faux(ici, jour, `${mi.colis.length} colis`);
      if (mi.etiquettes.length !== (pl ? M.ETIQUETTES : 0)) faux(ici, jour, `${mi.etiquettes.length} étiquettes`);
      egal(`${ici} ${jour} : les camions`, M.camionsDe(mi), pl ? ["EL", "LA", "LOS", "LAS"] : ["EL", "LA"]);
      for (const c of mi.colis) {
        const attendu = c.nombre === "p" ? M.articlePluriel(c.n).toUpperCase() : c.n.art.toUpperCase();
        if (c.camion !== attendu) faux(ici, jour, "camion", c.texte, c.camion);
        if (!pl && (c.nombre !== "s" || c.n.plurielSeul)) faux(ici, jour, "un pluriel avant U4-L2", c.texte);
      }
      for (const e of mi.etiquettes) if (e.rep === e.n.mot) faux(ici, jour, "étiquette qui ne change pas", e.de);
    } else {
      if (!faites.has(M.LECON_NOMBRES)) faux(ici, jour, "liste avant les nombres");
      if (mi.lignes.length !== M.LIGNES) faux(ici, jour, `${mi.lignes.length} lignes`);
      if (mi.lignes.filter(l => l.q === 1).length !== 2) faux(ici, jour, "il faut 2 lignes « 1 »");
      for (const l of mi.lignes) {
        if (l.q < 1 || l.q > 20) faux(ici, jour, "nombre", l.q);
        if (!M.corrigerLigne(l.rep, l)?.juste) faux(ici, jour, "la bonne réponse ne passe pas", l.rep);
      }
    }
    // La même toute la journée, même après l'avoir faite.
    const cles = mi.forme === "duos" ? mi.cles : mi.mots.map(n => n.cle);
    const r = M.apresMission(jeux, { forme: mi.forme, ok: 5, sur: 9, cles, regles: mi.duos || [] }, jour);
    if (!r.ampoule) faux(ici, jour, "l'ampoule ne s'allume pas");
    const encore = M.missionDuJour({ ...args(), etat: r.jeux.missions });
    egal(`${ici} ${jour} : la même toute la journée`, encore.forme === "duos" ? encore.cles : encore.mots.map(n => n.cle), cles);
    const r2 = M.apresMission(r.jeux, { forme: mi.forme, ok: 9, sur: 9 }, jour);
    if (r2.ampoule || r2.jeux.missions.jours[jour].ok !== 5) faux(ici, jour, "un 2e essai a compté");
    jeux = r.jeux;
  }
  // Seul le Repartidor existe tant qu’il n’y a ni 2 duos ni le pluriel : il revient chaque jour.
  if (ouverts.length >= 2 || pl) for (let k = 1; k < formes.length; k++) if (formes[k] === formes[k - 1]) faux(ici, `deux fois de suite : ${formes[k]}`);
  if (ouverts.length >= 2 && !formes.includes("duos")) faux(ici, "jamais de Uno de dos en 6 jours");
  if (!faites.has(M.LECON_NOMBRES) && formes.includes("lista")) faux(ici, "liste avant U4-L2");
  console.log(`${ici} : ${formes.join(", ")}`);
}
// ——— 5. Uno de dos : les phrases écrites à la main (duos.js) ———
// Les mots vus jusqu'à une leçon : les cartes du Sheet (et le pluriel des noms et adjectifs), les verbes conjugués aux temps
// vus quand toutes leurs règles sont vues, et les petits mots du livre qui n'ont pas de carte (OUTILS, d'après PROGRAMME.md).
const OUTILS = {
  "U1-L1": `el la los las lo un una unos unas y o de del al a con en no sí muy más cómo qué hola adiós gracias por favor
            yo tú él ella nosotros nosotras vosotros vosotras ellos ellas me te se nos os mi tu su`,
  "U1-L2": `tengo tienes tiene tenemos tenéis tienen años`,
  "U1-L3": `cinco`,
  "U1-L4": `español española inglés francia`,
  "U1-L6": `mucho mucha muchos muchas poco`,
  "U2-L1": `cero uno dos tres cuatro seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte`,
  "U2-L2": `veintiuno veintidós veintitrés veinticuatro veinticinco treinta cuarenta cincuenta sesenta setenta ochenta noventa cien`,
  "U2-L3": `menos cuarto media`,
  "U2-L4": `lunes martes miércoles jueves viernes sábado domingo sábados domingos`,
  "U2-L5": `enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre`,
  "U4-L1": `mis tus sus nuestro nuestra nuestros nuestras vuestro vuestra vuestros vuestras`,
  "U4-L4": `que`,
  "U5-L1": `usted ustedes`,
  "U11-L6": `durante`,
};
const PROPRES = new Set(["kevin", "blanca", "léo", "dorian", "huesca", "parís", "galicia", "españa", "zaragoza", "valencia", "madrid"]);
const minus = t => t.toLocaleLowerCase("es"), motsDe = t => minus(t).match(/\p{L}+/gu) || [];
const vusCache = {};
function vusJusqua(id) {
  if (vusCache[id]) return vusCache[id];
  const r = rangDe(id), vus = new Set();
  for (const m of vocab.filter(m => rangDe(m.lecon) <= r)) {
    const es = m.es.replace(/\([^)]*\)/g, " ").replace(/=.*/, " ");
    for (const w of motsDe(es)) { vus.add(w); if (m.categorie !== "verbe") vus.add(/[aeiouáéó]$/.test(w) ? w + "s" : w.replace(/ó(n)$/, "o$1") + "es"); }
    if (!/^\p{L}*[aeií]r(se)?$/u.test(minus(es.trim().split(/[\s…]+/)[0] || ""))) continue;
    const vb = verbeDe({ ...m, categorie: "verbe" });
    if (!vb || vb.regles.some(x => x.lecon && !x.texte.startsWith("Un verbe en -se") && rangDe(x.lecon) > r)) continue;
    for (const [k, t] of Object.entries(TEMPS)) if (rangDe(t.lecon) <= r) for (let p = 0; p < 6; p++) {
      try { for (const w of motsDe(conjuguer(vb.v, p, vb.d, k))) vus.add(w); } catch { /* un temps sans cette personne */ }
    }
  }
  for (const [l, v] of Object.entries(OUTILS)) if (rangDe(l) <= r) for (const w of v.split(/\s+/).filter(Boolean)) vus.add(w);
  return (vusCache[id] = vus);
}
const ids = new Set();
let verifiees = 0;
for (const d of DUOS) {
  if (ids.has(d.id)) faux("duo en double", d.id); ids.add(d.id);
  if (!d.court || !d.nom || d.carte?.length !== 2 || d.ex?.length !== 2 || d.regle?.length !== 2) faux(d.id, "il manque court, nom, carte (2), ex (2) ou regle (2)");
  if (d.lecon && !(d.lecon in rang)) faux(d.id, "leçon inconnue", d.lecon);
  if (d.phrases.filter(ph => !ph[4]).length < 8) faux(d.id, `seulement ${d.phrases.length} phrases à l'ouverture`);
  const vues = new Set();
  for (const ph of d.phrases) {
    const [es, juste, fr, nv] = ph, p = M.decouper(es);
    if (!p) { faux(d.id, "pas de {a|b}", es); continue; }
    if (/[{}|]/.test(p.avant + p.apres)) faux(d.id, "deux trous", es);
    if (p.a === p.b) faux(d.id, "les deux choix sont pareils", es);
    if (juste !== 0 && juste !== 1) faux(d.id, "la bonne réponse doit être 0 ou 1", es);
    if (!fr) faux(d.id, "pas de français", es);
    if (nv && !/^[^=]+ = [^=]+$/.test(nv)) faux(d.id, "mot nouveau : « mot = sens »", nv);
    if (vues.has(es)) faux(d.id, "phrase en double", es); vues.add(es);
    if (/[<>]/.test(es + fr)) faux(d.id, "pas de HTML dans une phrase", es);
    const lp = ph[4];
    if (lp && (!(lp in rang) || !d.lecon || rangDe(lp) <= rangDe(d.lecon))) faux(d.id, "leçon de phrase inconnue ou inutile", es, lp);
    if (!d.lecon) continue;
    const vus = vusJusqua(lp || d.lecon), nvMots = nv ? motsDe(nv.split("=")[0]) : [];
    const inconnus = [...new Set(motsDe(es.replace(/[{}|]/g, " ")))].filter(w => !vus.has(w) && !PROPRES.has(w));
    if (inconnus.some(w => !nvMots.includes(w)) || inconnus.length > 1) faux(d.id, `(${lp || d.lecon}) mot pas encore vu :`, inconnus.join(", "), "·", es);
    if (nv && nvMots.every(w => vus.has(w))) faux(d.id, `(${lp || d.lecon}) « ${nv} » est déjà vu : pas de traduction`, es);
    verifiees++;
  }
  const bonnes = d.phrases.map(ph => ph[1]);
  if (!bonnes.includes(0) || !bonnes.includes(1)) faux(d.id, "il faut des phrases pour les deux réponses");
}
egal("découper", M.decouper("Yo {soy|estoy} francés."), { avant: "Yo ", a: "soy", b: "estoy", apres: " francés." });
egal("phrase complète", M.phraseComplete({ avant: "¿", a: "Qué", b: "Cuál", apres: " hora es?", juste: 0 }), "¿Qué hora es?");
// Les leçons qui ouvrent les duos (Q110, Q28-1 à Q28-4).
egal("les leçons des duos", Object.fromEntries(DUOS.map(d => [d.id, d.lecon])),
  { ser: "U1-L4", quecual: "U5-L4", muy: "U5-L2", porpara: null, manana: "U2-L4", lunes: "U2-L4", tarde: "U3-L3",
    eseres: "U1-L5", genre: "U1-L5", ena: "U2-L3", desdehace: "U11-L6", pero: "U14-L4" });
egal("fermé tant qu'il n'y a qu'un duo", M.unoDeDos(DUOS, jusqua("U1-L4"), {}, "2026-11-25", hasardDuJour("2026-11-25", "x")), null);
// Un seul duo nouveau par mission, avec sa carte, un duo fréquent d'abord ; plus de carte une fois joué.
{
  const faites = jusqua("U2-L4"), h = () => hasardDuJour("2026-11-25", "x");
  const m1 = M.unoDeDos(DUOS, faites, { regles: { ser: "2026-11-01" } }, "2026-11-25", h());
  egal("le 1er duo nouveau : un fréquent", [m1.nouveau, m1.phrases.filter(p => p.duo === m1.nouveau).length], ["eseres", 4]);
  if (M.unoDeDos(DUOS, jusqua("U3-L5"), {}, "2026-11-25", h()).phrases.some(p => /^Voy|va$/.test(p.avant.trim()))) faux("une phrase « voy a » avant U3-L6");
  const e = M.apresMission({ jours: [], missions: { regles: { ser: "2026-11-01" } } }, { forme: "duos", ok: 8, sur: 8, cles: m1.cles, regles: m1.duos }, "2026-11-25").jeux.missions;
  const m2 = M.unoDeDos(DUOS, faites, e, "2026-11-26", h());
  if (m1.duos.includes(m2.nouveau)) faux("un duo déjà joué revient comme nouveau", m2.nouveau);
  const m3 = M.unoDeDos(DUOS, faites, e, "2026-11-25", h());
  egal("le même jour, la même mission", m3.cles, m1.cles);
}
console.log(`Uno de dos : ${DUOS.length} duos, ${DUOS.reduce((t, d) => t + d.phrases.length, 0)} phrases, ${verifiees} vérifiées mot par mot.`);

// L'ampoule déjà allumée par la Charla : la mission compte, sans 2e ampoule.
const r = M.apresMission({ jours: ["2026-11-25"] }, { forme: "repartidor", ok: 3, sur: 9 }, "2026-11-25");
egal("ampoule déjà allumée", [r.ampoule, r.jeux.jours.length, !!M.faiteAujourdhui(r.jeux, "2026-11-25")], [false, 1, true]);

console.log(erreurs ? `\n${erreurs} erreur(s).` : "\nTout est bon.");
process.exit(erreurs ? 1 : 0);
