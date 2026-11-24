// Vérifie les missions du jour de la Feria (missions.js).
// Lancer depuis appli/ : node outils/test-missions.mjs chemin/vers/vocabulaire.csv
// (le CSV : l'onglet « Vocabulaire » du Sheet, téléchargé avec l'adresse gviz de donnees.js).
//
// 1. Le pluriel : une liste écrite à la main (tous les cas difficiles), puis chaque nom du Sheet a un pluriel connu ou
//    est rangé exprès dans SANS_PLURIEL / les noms au pluriel seulement.
// 2. Le genre, les pièges, les nombres en lettres, la correction de ce que Kevin écrit.
// 3. La mission du jour, à plusieurs étapes du livre : 6 colis, 3 étiquettes ou 6 lignes, 4 nouveaux au plus, jamais
//    deux mots de la même carte, la même toute la journée, l'ampoule et « un seul essai ».
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
for (const ici of ["U1-L1", "U1-L3", "U2-L1", "U4-L2", "U8-L3", "U15-L1", "U25-L5"]) {
  const faites = jusqua(ici);
  let jeux = { jours: [] }, formes = [];
  for (const jour of jours) {
    const args = () => ({ mots: vocab, vu: m => faites.has(m.lecon), rang: rangDe, faites, etat: jeux.missions, jour, hasard: hasardDuJour(jour, "mision"), duos: DUOS });
    const mi = M.missionDuJour(args());
    if (!mi) { faux(ici, jour, "pas de mission"); continue; }
    formes.push(mi.forme);
    const nouveaux = mi.mots.filter(n => !n.vu);
    if (nouveaux.length > (ici === "U1-L1" ? 6 : M.NOUVEAUX)) faux(ici, jour, `${nouveaux.length} mots nouveaux`);
    if (new Set(mi.mots.map(n => n.id)).size !== mi.mots.length) faux(ici, jour, "deux mots de la même carte");
    for (const n of nouveaux) if (/\s/.test(n.mot)) faux(ici, jour, "mot nouveau en plusieurs mots", n.mot);
    if (mi.forme === "duos") {
      if (mi.phrases.length !== M.PHRASES_DUO) faux(ici, jour, `${mi.phrases.length} phrases de duo`);
      if (new Set(mi.cles).size !== mi.cles.length) faux(ici, jour, "deux fois la même phrase");
    } else if (mi.forme === "repartidor") {
      if (mi.colis.length !== M.COLIS) faux(ici, jour, `${mi.colis.length} colis`);
      if (mi.etiquettes.length !== M.ETIQUETTES) faux(ici, jour, `${mi.etiquettes.length} étiquettes`);
      for (const c of mi.colis) {
        const attendu = c.nombre === "p" ? M.articlePluriel(c.n).toUpperCase() : c.n.art.toUpperCase();
        if (c.camion !== attendu) faux(ici, jour, "camion", c.texte, c.camion);
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
  for (let k = 1; k < formes.length; k++) if (formes[k] === formes[k - 1]) faux(ici, `deux fois de suite : ${formes[k]}`);
  if (!formes.includes("duos")) faux(ici, "jamais de Uno de dos en 6 jours");
  if (!faites.has(M.LECON_NOMBRES) && formes.includes("lista")) faux(ici, "liste avant U2-L1");
  console.log(`${ici} : ${formes.join(", ")}`);
}
// ——— 5. Uno de dos : les phrases écrites à la main (duos.js) ———
const ids = new Set();
for (const d of DUOS) {
  if (ids.has(d.id)) faux("duo en double", d.id); ids.add(d.id);
  if (!d.court || !d.nom || d.carte?.length !== 2 || d.ex?.length !== 2 || d.regle?.length !== 2) faux(d.id, "il manque court, nom, carte (2), ex (2) ou regle (2)");
  if (d.lecon && !(d.lecon in rang)) faux(d.id, "leçon inconnue", d.lecon);
  if (d.phrases.length < 8) faux(d.id, `seulement ${d.phrases.length} phrases`);
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
  }
  const bonnes = d.phrases.map(ph => ph[1]);
  if (!bonnes.includes(0) || !bonnes.includes(1)) faux(d.id, "il faut des phrases pour les deux réponses");
}
egal("découper", M.decouper("Yo {soy|estoy} francés."), { avant: "Yo ", a: "soy", b: "estoy", apres: " francés." });
egal("phrase complète", M.phraseComplete({ avant: "¿", a: "Qué", b: "Cuál", apres: " hora es?", juste: 0 }), "¿Qué hora es?");
// Un seul duo nouveau par mission, avec sa carte ; plus de carte une fois joué.
{
  const faites = jusqua("U1-L3"), h = () => hasardDuJour("2026-11-25", "x");
  const m1 = M.unoDeDos(DUOS, faites, {}, "2026-11-25", h());
  egal("le 1er duo nouveau", [m1.nouveau, m1.phrases.filter(p => p.duo === m1.nouveau).length], [DUOS[0].id, 4]);
  const e = M.apresMission({ jours: [] }, { forme: "duos", ok: 8, sur: 8, cles: m1.cles, regles: m1.duos }, "2026-11-25").jeux.missions;
  const m2 = M.unoDeDos(DUOS, faites, e, "2026-11-26", h());
  if (m1.duos.includes(m2.nouveau)) faux("un duo déjà joué revient comme nouveau", m2.nouveau);
  const m3 = M.unoDeDos(DUOS, faites, e, "2026-11-25", h());
  egal("le même jour, la même mission", m3.cles, m1.cles);
}
console.log(`Uno de dos : ${DUOS.length} duos, ${DUOS.reduce((t, d) => t + d.phrases.length, 0)} phrases.`);

// L'ampoule déjà allumée par la Charla : la mission compte, sans 2e ampoule.
const r = M.apresMission({ jours: ["2026-11-25"] }, { forme: "repartidor", ok: 3, sur: 9 }, "2026-11-25");
egal("ampoule déjà allumée", [r.ampoule, r.jeux.jours.length, !!M.faiteAujourdhui(r.jeux, "2026-11-25")], [false, 1, true]);

console.log(erreurs ? `\n${erreurs} erreur(s).` : "\nTout est bon.");
process.exit(erreurs ? 1 : 0);
