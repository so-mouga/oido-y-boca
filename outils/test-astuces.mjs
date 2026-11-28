// Vérifie l'onglet « Astuces » (chantier 26, étape 6, Q26-27 à Q26-33) sur le vrai vocabulaire du Sheet :
// la lecture (par les titres, l'onglet absent qui renvoie « Vocabulaire »), l'entrée des mots du prof le lendemain et une seule fois,
// « mis de côté », l'origine et « retenu le », les lignes que l'appli écrit, et le script Google sur un faux tableau :
// il ne touche jamais aux colonnes du prof.
// Lancer depuis appli/ : node outils/test-astuces.mjs chemin/vers/vocabulaire.csv
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-astuces-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js")))
  fs.writeFileSync(path.join(tmp, f), fs.readFileSync(path.join(racine, f), "utf8").replace(/\?v=\d+/g, ""));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const D = await import(path.join(tmp, "donnees.js"));
const V = await import(path.join(tmp, "progression.js"));
const M = await import(path.join(tmp, "motsencours.js"));
const A = await import(path.join(tmp, "astuces.js"));
const { LECONS } = await import(path.join(tmp, "position.js"));

const csv = process.argv[2];
if (!csv) { console.error("Donne le CSV du vocabulaire."); process.exit(1); }
const vocab = D.lireCsv(fs.readFileSync(csv, "utf8"));
const mots = D.versMots(vocab);
let erreurs = 0, verifs = 0;
const ok = (cond, ...t) => { verifs++; if (!cond) { erreurs++; console.log("✗", ...t); } };
const trouver = es => mots.find(m => m.es === es);
const cunado = trouver("el cuñado / la cuñada"), pueblo = trouver("el pueblo"), reunion = trouver("la reunión"),
  empresa = trouver("la empresa"), casarse = trouver("casarse");
ok(cunado && pueblo && reunion && empresa && casarse, "mots de départ introuvables");
const dansListe = m => M.motEnCours(ctx, m);

// 1. La lecture. Un onglet absent : gviz renvoie « Vocabulaire » → null (on ne lit pas les mots comme des astuces).
ok(D.versAstuces(vocab) === null, "l'onglet Vocabulaire ne doit pas passer pour « Astuces »");
ok(D.versAstuces([]) === null, "un onglet vide → null");
const titres = [...D.COLONNES_ASTUCES];
ok(titres.length === 10 && titres[0] === "clé" && titres.at(-1) === "retenu le", "les 10 colonnes", titres);
const sc = fs.readFileSync(path.join(racine, "outils/sauvegarde.gs"), "utf8");
ok(sc.includes(JSON.stringify(titres).replace(/,/g, ", ").slice(1, 60)), "les titres du script = COLONNES_ASTUCES (début)");
const ligne = o => titres.map(t => o[t] ?? "");
const onglet = lignes => [["Clé ", "mot", "origine", "ajouté le", "astuce du prof", "phrase perso", "blocages en séance", "mis de côté", "mon astuce", "retenu le", "autre"], ...lignes.map(ligne)];
let astuces = D.versAstuces(onglet([
  { "clé": "U1-L3 | el pueblo", mot: "el pueblo", origine: "Prof", "ajouté le": "3/12/2026", "astuce du prof": "Pueblo = village.", "phrase perso": "Mi pueblo.", "blocages en séance": "3/12/2026" },
  { "clé": "U1-L4|la reunión", mot: "la reunión", origine: "appli", "ajouté le": "2026-11-28", "mis de côté": "Oui" },
  { "clé": "", mot: "rien" },
]));
ok(Object.keys(astuces).length === 2, "2 lignes lues (la ligne sans clé est ignorée)", Object.keys(astuces));
ok(astuces["U1-L3|el pueblo"]?.prof === "Pueblo = village.", "la clé tolère les espaces autour de « | », l'astuce du prof est lue");
ok(astuces["U1-L3|el pueblo"].origine === "prof" && astuces["U1-L4|la reunión"].deCote === true, "origine en minuscules, « Oui » = mis de côté");

// 2. Les blocages : une date par blocage, « ; ».
ok(A.blocages({ origine: "prof", blocages: "" }).n === 1, "une ligne du prof sans date de blocage compte 1 blocage");
ok(A.blocages({ origine: "appli", blocages: "" }).n === 0, "une ligne de l'appli sans blocage : 0");
const b2 = A.blocages({ origine: "kevin", ajoute: "2026-11-30", blocages: "28/11/2026 ; 3/12/2026" });
ok(b2.n === 2 && b2.dernier === "2026-12-03" && b2.dernierBlocage === "2026-12-03", "2 blocages, le dernier le 3 déc.", b2);
ok(A.blocages({ origine: "prof", ajoute: "46359" }).dernier === "2026-12-03", "une date au format nombre de Sheets est lue");

// 3. L'entrée d'un mot du prof : le lendemain du blocage, une seule fois (Q26-29).
const ctx = { mots, pos: { faites: new Set(LECONS.map(l => l.id)) }, jour: "2026-12-03", astuces };
// la reunión est en cours ; le prof la mettra de côté plus tard (section 4).
astuces["U1-L4|la reunión"].deCote = false;
M.mettreMotEnCours(ctx, reunion, "2026-11-28", "appli");
let r = A.importerAstuces(ctx, "2026-12-03");
ok(!dansListe(pueblo) && !r.entres.length, "le jour du blocage, el pueblo n'entre pas encore");
ctx.jour = "2026-12-04";
r = A.importerAstuces(ctx, "2026-12-04");
ok(dansListe(pueblo) && r.entres.includes("el pueblo"), "le lendemain, el pueblo entre", r);
ok(V.difficile(pueblo.id).origine === "prof" && V.difficile(pueblo.id).arriveLe === "2026-12-04", "origine prof, arrivé le 4 déc.");
ok(A.nouvellesDuProf(ctx).arrives.includes("el pueblo"), "le Dico dit qu'il est arrivé ce matin");
M.sortirDesCours(ctx, M.cleDe(ctx, pueblo), "2026-12-05");
ctx.jour = "2026-12-06";
A.importerAstuces(ctx, "2026-12-06");
ok(!dansListe(pueblo), "retenu, el pueblo ne revient pas sans nouveau blocage");
ok(V.difficile(M.cleDe(ctx, pueblo)).retenu === "2026-12-05", "retenu le 5 déc.");
astuces["U1-L3|el pueblo"].blocages = "3/12/2026 ; 6/12/2026";
A.importerAstuces(ctx, "2026-12-06");
ok(!dansListe(pueblo), "nouveau blocage le 6 : pas le jour même");
ctx.jour = "2026-12-07";
A.importerAstuces(ctx, "2026-12-07");
ok(dansListe(pueblo), "nouveau blocage noté : el pueblo revient le lendemain");
ok(!V.difficile(M.cleDe(ctx, pueblo)).retenu, "en revenant, « retenu le » s'efface (Q26-33)");
ok(V.difficile(pueblo.id).origine === "prof", "l'origine reste celle de la première entrée");

// 4. Mis de côté (Q26-30) : la reunión sort, n'entre plus toute seule, mais je peux la remettre.
astuces["U1-L4|la reunión"].deCote = true;
r = A.importerAstuces(ctx, "2026-12-07");
ok(!dansListe(reunion) && r.sortis.includes("la reunión"), "mise de côté : elle sort", r);
ok(!V.difficile(M.cleDe(ctx, reunion)).retenu, "sortie sans « retenu le »");
ok(A.nouvellesDuProf(ctx).deCote.includes("la reunión"), "le Dico dit qu'elle est mise de côté");
for (let k = 0; k < 4; k++) V.compterNon(reunion.id);
ok(M.entrerSiBloque(ctx, reunion, "2026-12-07") === null && !dansListe(reunion), "mise de côté, elle n'entre plus toute seule");
M.mettreMotEnCours(ctx, reunion, "2026-12-07");
A.importerAstuces(ctx, "2026-12-08");
ok(dansListe(reunion), "remise à la main, elle n'est pas ressortie au lancement suivant");
M.sortirDesCours(ctx, M.cleDe(ctx, reunion), null);
astuces["U1-L4|la reunión"].deCote = false;
A.importerAstuces(ctx, "2026-12-08");
ok(!dansListe(reunion), "plus de côté, sans nouveau blocage : elle ne revient pas");
ok(V.difficile(reunion.id).deCote === false, "« mis de côté » repassé à non");

// 5. Une ligne de verbe : la clé de l'onglet est l'id du mot, la liste garde l'infinitif.
astuces[casarse.id] = { cle: casarse.id, mot: "casarse", origine: "prof", ajoute: "2026-12-01", blocages: "", deCote: false, prof: "Casarse con alguien." };
A.importerAstuces(ctx, "2026-12-08");
ok(V.verbesEnCours().includes("casarse"), "casarse entre sous son infinitif");
ok(A.cleOnglet(ctx, "casarse") === casarse.id && A.ligneDe(ctx, "casarse")?.prof === "Casarse con alguien.", "la ligne du prof est retrouvée depuis l'infinitif");

// 6. Les lignes que l'appli écrit (Q26-32).
M.mettreMotEnCours(ctx, cunado, "2026-11-28", "appli");
M.mettreMotEnCours(ctx, empresa, "2026-11-30"); // à la main → Kevin
V.garderAstuce(M.cleDe(ctx, cunado), "Cuñada = la grande sœur de Blanca.", "2026-12-01");
const lignes = A.lignesAstuces(ctx);
const de = id => lignes.find(l => l.cle === id);
ok(de(cunado.id)?.origine === "appli" && de(cunado.id).ajoute === "2026-11-28" && de(cunado.id).astuce.startsWith("Cuñada"), "el cuñado : appli, 28 nov., mon astuce", de(cunado.id));
ok(de(empresa.id)?.origine === "Kevin", "la empresa ajoutée à la main : Kevin", de(empresa.id));
ok(de(casarse.id)?.origine === "prof" && de(casarse.id).mot, "casarse : clé = l'id du mot, origine prof", de(casarse.id));
ok(de(pueblo.id)?.retenu === "", "el pueblo revenu : retenu vide");
ok(lignes.every(l => Object.keys(l).join() === "cle,mot,origine,ajoute,astuce,retenu"), "jamais de colonne du prof dans ce qu'on envoie");
// Un mot entré avant l'étape 6, sans origine notée : « appli » s'il a été bloqué, sinon « Kevin ».
const suegros = trouver("los suegros");
V.mettreEnCours(suegros.id, "2026-11-28");
for (let k = 0; k < 3; k++) V.compterNon(suegros.id);
ok(A.lignesAstuces(ctx).find(l => l.cle === suegros.id)?.origine === "appli", "ancien mot bloqué : origine appli");
// Un mot sorti avec mon astuce reste envoyé (pour garder mon astuce et « retenu le » à jour).
M.sortirDesCours(ctx, M.cleDe(ctx, cunado), "2026-12-09");
ok(A.lignesAstuces(ctx).find(l => l.cle === cunado.id)?.retenu === "2026-12-09", "retenu le 9 déc. envoyé après la sortie");

// 7. La sauvegarde garde les nouveaux champs (difficiles).
const relu = V.lireSauvegarde(V.donneesSauvegarde("2026-12-09"));
ok(relu.etat.difficiles[pueblo.id]?.origine === "prof" && relu.etat.difficiles[reunion.id]?.deCote === false, "origine et mis de côté gardés à la restauration");

// 8. Le script Google sur un faux tableau : la ligne est trouvée par sa clé, sinon ajoutée ; les colonnes du prof ne sont jamais écrites.
function fauxTableau(grille) {
  const f = {
    grille, ecrites: [],
    getMaxRows: () => 1000, getLastRow: () => { let n = grille.length; while (n && grille[n - 1].every(c => c === "")) n--; return n; },
    getLastColumn: () => Math.max(...grille.map(l => l.length)),
    setFrozenRows() {},
    getRange(r, c, nr = 1, nc = 1) {
      const zone = {
        setNumberFormat: () => zone, setFontWeight: () => zone,
        getDisplayValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => String(grille[r - 1 + i]?.[c - 1 + j] ?? ""))),
        setValues: v => { v.forEach((l, i) => l.forEach((x, j) => { (grille[r - 1 + i] ||= [])[c - 1 + j] = x; })); return zone; },
        setValue: v => { while (grille.length < r) grille.push([]); grille[r - 1][c - 1] = v; f.ecrites.push(grille[0][c - 1]); return zone; },
      };
      return zone;
    },
  };
  return f;
}
const grille = [["clé", "mot", "origine", "ajouté le", "astuce du prof", "phrase perso", "blocages en séance", "mis de côté", "colonne du prof", "mon astuce", "retenu le"],
  ["U1-L3|el pueblo", "el pueblo", "prof", "3/12/2026", "Pueblo = village.", "Mi pueblo.", "3/12/2026", "non", "note", "", ""]];
const f = fauxTableau(grille);
const gs = new Function("SpreadsheetApp", "LockService", "PropertiesService", "ContentService", "DriveApp", "Utilities", "Logger", "DocumentApp", "ScriptApp",
  sc + "\nreturn { ecrireAstuces_, testerAstuces };")({ openById: () => ({ getSheetByName: () => f }) });
const n = gs.ecrireAstuces_([
  { cle: "U1-L3 | el pueblo", mot: "X", origine: "appli", ajoute: "2026-01-01", astuce: "La mienne.", retenu: "2026-12-05" },
  { cle: cunado.id, mot: cunado.es, origine: "appli", ajoute: "2026-11-28", astuce: "", retenu: "" },
]);
ok(n === 2, "2 lignes écrites");
ok(grille[1].slice(0, 9).join("|") === "U1-L3|el pueblo|el pueblo|prof|3/12/2026|Pueblo = village.|Mi pueblo.|3/12/2026|non|note", "la ligne du prof : clé, mot, origine, ajouté le et ses colonnes intactes", grille[1]);
ok(grille[1][9] === "La mienne." && grille[1][10] === "2026-12-05", "mon astuce et retenu le écrits sur la ligne existante");
ok(grille[2][0] === cunado.id && grille[2][2] === "appli" && grille[2][3] === "2026-11-28" && grille.length === 3, "nouvelle ligne ajoutée à la fin", grille[2]);
const interdites = new Set(["astuce du prof", "phrase perso", "blocages en séance", "mis de côté", "colonne du prof"]);
ok(!f.ecrites.some(t => interdites.has(t)), "le script n'écrit jamais dans une colonne du prof", f.ecrites);
gs.ecrireAstuces_([{ cle: cunado.id, mot: "autre", origine: "Kevin", ajoute: "2027-01-01", astuce: "Nouvelle.", retenu: "" }]);
ok(grille.length === 3 && grille[2][2] === "appli" && grille[2][9] === "Nouvelle.", "renvoyer une clé ne crée pas de doublon et ne change pas l'origine");
// Une colonne de l'appli supprimée par erreur est remise au bout.
const g2 = [["clé", "mot", "origine", "ajouté le", "astuce du prof", "phrase perso", "blocages en séance", "mis de côté", "mon astuce"]];
const f2 = fauxTableau(g2);
new Function("SpreadsheetApp", sc + "\nreturn ecrireAstuces_;")({ openById: () => ({ getSheetByName: () => f2 }) })([{ cle: "a|b", mot: "b", origine: "appli", ajoute: "2026-12-01", astuce: "", retenu: "2026-12-02" }]);
ok(g2[0][9] === "retenu le" && g2[1][9] === "2026-12-02", "la colonne « retenu le » manquante est remise au bout", g2);

if (erreurs) { console.log(`${erreurs} erreur(s) sur ${verifs} vérifications.`); process.exit(1); }
console.log(`Tout est bon (${verifs} vérifications).`);
