// Vérifie les conversations de La Charla (charlas/*.js) et son moteur (charla.js).
// Lancer depuis appli/ : node outils/test-charla.mjs chemin/vers/vocabulaire.csv
// (le CSV : l'onglet « Vocabulaire » du Sheet, téléchargé avec l'adresse gviz de donnees.js).
//
// Pour chaque conversation : la leçon existe, la personne existe, 4 ou 5 échanges, dans chaque échange la juste, les pièges
// et les « pour rire » sont tous différents, et chaque mot des réponses de Kevin (juste, pièges, pour rire) a déjà été vu
// jusqu'à la leçon de la conversation : dans le vocabulaire du Sheet, dans les exercices (et le bonus « Encore 6 »), ou comme forme d'un verbe vu
// (aux temps déjà vus). Les répliques de la personne ne sont pas vérifiées (elles peuvent avoir quelques mots nouveaux).
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const charger = f => import(pathToFileURL(path.join(racine, f)).href);
const C = await charger("charla.js");
const { BLOCS, CHARLAS, TROUPE } = await charger("charlas/index.js");
const { EXERCICES } = await charger("exercices.js");
const { BONUS } = await charger("bonus.js");
const { LECONS } = await charger("position.js");
const { conjuguer, TEMPS } = await charger("controles.js");
const { verbeDe } = await charger("dico.js");
const { lireCsv, versMots } = await charger("donnees.js");

const csv = process.argv[2];
if (!csv) { console.error("Donne le CSV du vocabulaire : node outils/test-charla.mjs chemin/vers/vocabulaire.csv"); process.exit(1); }
const vocab = versMots(lireCsv(fs.readFileSync(csv, "utf8")));
let erreurs = 0;
const faux = (...t) => { erreurs++; console.log("✗", ...t); };
const egal = (nom, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) faux(nom, "obtenu", JSON.stringify(a), "attendu", JSON.stringify(b)); };

// 1. Le tableau contient-il le vocabulaire des unités 16 à 25 ? (les sessions de contenu en dépendent)
const parUnite = {};
for (const m of vocab) { const n = C.uniteDe(m.lecon); if (n) parUnite[n] = (parUnite[n] || 0) + 1; }
const manquent = Array.from({ length: 10 }, (_, i) => 16 + i).filter(n => (parUnite[n] || 0) < 10);
if (manquent.length) faux(`Le Sheet n'a pas (ou presque pas) le vocabulaire des unités ${manquent.join(", ")} : à dire à Kevin, les sessions de contenu en dépendent.`);
else console.log(`Vocabulaire des unités 16 à 25 : présent (${Array.from({ length: 10 }, (_, i) => parUnite[16 + i]).join(", ")} mots).`);

// 2. Les mots vus, leçon par leçon.
const rang = Object.fromEntries(LECONS.map((l, i) => [l.id, i]));
const ajout = (ens, texte) => C.mots(String(texte || "").replace(/\([^)]*\)/g, " ").replace(/…/g, " ").replace(/\s*\/\s*/g, " ")).forEach(w => ens.add(w));
// Mots-outils, noms propres et formules de tous les jours (Kevin les entend partout à Huesca) : acceptés partout. Liste courte, exprès.
const TOUJOURS = new Set(C.mots(`
  Kevin Blanca Léo Dorian Huesca Marta Javier
  el la los las lo un una unos unas y o de del a al en con que no sí si se me te le nos os les mi mis tu tus su sus
  yo tú él ella nosotros ellos es muy más pero también
  hola adiós gracias vale encantado encantada hasta luego mañana buenos días por favor
`));
const vusA = new Map(); // rang de leçon → Set de mots vus jusque-là
function motsVus(lecon) {
  const r = rang[lecon];
  if (vusA.has(r)) return vusA.get(r);
  const ens = new Set(TOUJOURS);
  const ok = id => id in rang && rang[id] <= r;
  const temps = Object.keys(TEMPS).filter(t => ok(TEMPS[t].lecon));
  for (const m of vocab) {
    if (!ok(m.lecon)) continue;
    ajout(ens, m.es);
    // Les formes des verbes vus, aux temps déjà vus (même les verbes « à vérifier », conjugués comme des réguliers).
    const vb = verbeDe(m);
    if (vb) for (const t of temps) for (let p = 0; p < 6; p++) { try { ajout(ens, conjuguer(vb.v, p, vb.d, t)); } catch { /* forme inconnue */ } }
  }
  // Une phrase « à trous » (« Nosotros ___ francés en casa. (hablar) ») est de l'espagnol : on la prend aussi.
  const trou = (q, temps) => {
    if (/___/.test(q.fr || "")) ajout(ens, q.fr);
    if (q.v) try { ajout(ens, conjuguer(q.v, q.p, q.d, q.t || temps)); } catch { /* forme inconnue */ }
  };
  for (const [id, ex] of Object.entries(EXERCICES)) {
    if (!ok(id)) continue;
    for (const q of ex.ecrire || []) { [].concat(q.es || []).forEach(t => ajout(ens, t)); trou(q); }
    for (const q of ex.dire || []) ajout(ens, q.es);
  }
  // Le bonus « Encore 6 » de chaque leçon : des exercices aussi.
  for (const [id, b] of Object.entries(BONUS)) {
    if (!ok(id)) continue;
    for (const q of b.phrases || []) { [].concat(q.es || []).forEach(t => ajout(ens, t)); trou(q, b.t); }
  }
  vusA.set(r, ens);
  return ens;
}

// 3. Les conversations.
const ids = new Set();
const texteOk = t => typeof t === "string" && t.trim().length > 0;
for (const b of BLOCS) for (const c of b.charlas) {
  const nom = c.id || "(sans id)";
  if (!/^[a-z0-9-]+$/.test(c.id || "")) faux(`${nom} : id manquant ou pas en minuscules-tirets`);
  if (ids.has(c.id)) faux(`${nom} : id en double`);
  ids.add(c.id);
  if (!(c.lecon in rang)) { faux(`${nom} : la leçon « ${c.lecon} » n'existe pas`); continue; }
  const n = C.uniteDe(c.lecon);
  if (!n || n < b.de || n > b.a) faux(`${nom} : leçon ${c.lecon} hors du bloc ${b.id}`);
  const p = typeof c.perso === "string" ? TROUPE[c.perso] : c.perso;
  if (!p || !texteOk(p.nom) || !Array.isArray(p.couleur) || p.couleur.length !== 2) faux(`${nom} : personne inconnue ou fiche incomplète (${JSON.stringify(c.perso)})`);
  if (!texteOk(c.lieu)) faux(`${nom} : lieu manquant`);
  const ech = c.echanges || [];
  if (ech.length < 4 || ech.length > 5) faux(`${nom} : ${ech.length} échanges (4 ou 5)`);
  const vus = motsVus(c.lecon);
  ech.forEach((e, i) => {
    const ou = `${nom} · échange ${i + 1}`;
    for (const k of ["lui", "ok", "suite"]) if (!texteOk(e[k])) faux(`${ou} : « ${k} » manquant`);
    for (const k of ["pieges", "rires"]) {
      if (!Array.isArray(e[k]) || !e[k].length) { faux(`${ou} : au moins un élément dans « ${k} »`); continue; }
      for (const x of e[k]) {
        if (!Array.isArray(x) || x.length < 3 || !x.slice(0, 3).every(texteOk)) faux(`${ou} : ${k} mal formé (texte, réaction, explication)`, JSON.stringify(x));
        if (k === "pieges" && x[3] !== undefined && !(x[3] in C.ERREURS)) faux(`${ou} : type d'erreur inconnu « ${x[3]} » (voir ERREURS dans charla.js)`);
        if (k === "rires" && x.length > 3) faux(`${ou} : une réponse pour rire n'a pas de type d'erreur`);
        // Les explications : seulement <i>…</i> comme balise.
        if (/<(?!\/?i>)/.test(x[2] || "")) faux(`${ou} : balise interdite dans l'explication (seulement <i>)`, x[2]);
      }
    }
    // Toutes les réponses de Kevin différentes (sans tenir compte des accents ni de la ponctuation).
    const kevin = [e.ok, ...(e.pieges || []).map(x => x[0]), ...(e.rires || []).map(x => x[0])].filter(texteOk);
    const cles = kevin.map(t => C.mots(t).join(" "));
    if (new Set(cles).size !== cles.length) faux(`${ou} : deux réponses identiques`, JSON.stringify(kevin));
    // Chaque mot des réponses de Kevin, déjà vu à la leçon de la conversation.
    for (const t of kevin) {
      const inconnus = C.mots(t).filter(w => !/^\d+$/.test(w) && !vus.has(w));
      if (inconnus.length) faux(`${ou} : « ${t} » → ${inconnus.map(w => `« ${w} »`).join(", ")} pas encore vu à ${c.lecon}`);
    }
  });
}
console.log(`${CHARLAS.length} conversation(s) vérifiée(s) : ${BLOCS.map(b => `${b.id} ${b.charlas.length}`).join(", ")}.`);

// 4. Le moteur.
const conv = (id, lecon) => ({ id, lecon, perso: "marta", lieu: "x", echanges: [] });
const T = [conv("a", "U1-L4"), conv("b", "U2-L4"), conv("c", "U6-L1"), conv("d", "U7-L1")];
const faites = new Set(LECONS.slice(0, rang["U7-L2"]).map(l => l.id));
// Le choix du jour : même tirage toute la journée, d'abord le bloc de Kevin, jamais une déjà faite tant qu'il y a du nouveau.
const j1 = C.charlaDuJour(T, { faites, unite: 7, etat: {} }, "2026-12-01");
if (!["c", "d"].includes(j1.charla.id)) faux("charla du jour : pas dans le bloc de Kevin", j1.charla.id);
egal("charla du jour : même tirage", C.charlaDuJour(T, { faites, unite: 7, etat: {} }, "2026-12-01").charla.id, j1.charla.id);
let etat = {};
for (const jour of ["2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04"]) {
  const x = C.charlaDuJour(T, { faites, unite: 7, etat }, jour);
  if (x.plusDeNouvelle) faux(`${jour} : plus de nouvelle alors qu'il en reste`);
  if (Object.values(etat.jours || {}).some(v => v.id === x.charla.id)) faux(`${jour} : une charla déjà faite revient`);
  // Faite aujourd'hui : le choix ne change pas.
  etat = C.apresCharla({ charla: etat }, { id: x.charla.id, ok: 3, sur: 4 }, jour).jeux.charla;
  egal(`${jour} : le choix reste après la partie`, C.charlaDuJour(T, { faites, unite: 7, etat }, jour).charla.id, x.charla.id);
}
const ordre = Object.keys(etat.jours).sort().map(d => etat.jours[d].id);
if (ordre.slice(0, 2).some(id => !["c", "d"].includes(id))) faux("le bloc de Kevin ne passe pas en premier", ordre);
const fin = C.charlaDuJour(T, { faites, unite: 7, etat }, "2026-12-05");
if (!fin.plusDeNouvelle) faux("toutes faites : plusDeNouvelle attendu");
if (fin.charla.id === etat.jours["2026-12-04"].id) faux("toutes faites : la charla d'hier revient");
egal("rien de débloqué", C.charlaDuJour(T, { faites: new Set(), unite: 1, etat: {} }, "2026-12-01"), null);
// L'ampoule et la rejouée.
const r1 = C.apresCharla({ jours: [] }, { id: "a", ok: 2, sur: 4 }, "2026-12-01");
egal("ampoule allumée", [r1.ampoule, r1.jeux.jours], [true, ["2026-12-01"]]);
const r2 = C.apresCharla(r1.jeux, { id: "b", ok: 4, sur: 4 }, "2026-12-01");
egal("un seul essai par jour", [r2.ampoule, r2.jeux.charla.jours["2026-12-01"].id], [false, "a"]);
egal("anciennes", C.anciennes(T, etat, ordre[3]).map(x => x.charla.id), ordre.slice(0, 3).reverse());
// Les 3 réponses : une juste, un piège, un pour rire, tirés parmi plusieurs.
const e = { ok: "A", pieges: [["P1", "r", "e", "personne"], ["P2", "r", "e"]], rires: [["R1", "r", "e"], ["R2", "r", "e"]] };
const vu = new Set();
for (let i = 0; i < 60; i++) { const r = C.reponses(e); egal("3 réponses", r.map(x => x.sorte).sort(), ["ok", "piege", "rire"]); r.forEach(x => vu.add(x.t)); }
egal("tous les pièges et rires sortent", [...vu].sort(), ["A", "P1", "P2", "R1", "R2"]);
// Le micro : indulgent (accents, ponctuation, majuscules).
const cp = C.compris("¡Sí, soy francés! 😅", new Set(C.mots("si soy frances")));
egal("micro indulgent", [cp.n, cp.sur], [3, 3]);
egal("micro partiel", (({ n, sur }) => [n, sur])(C.compris("Me llamo Kevin. ¡Encantado!", new Set(C.mots("me llamo kevin")))), [3, 4]);
egal("voix sans émoji", C.pourLaVoix("¿Yo? Me llamo Marta… 😅"), "¿Yo? Me llamo Marta…");

console.log(erreurs ? `${erreurs} erreur(s).` : "Tout est bon.");
process.exit(erreurs ? 1 : 0);
