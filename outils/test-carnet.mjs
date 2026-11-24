// Vérifie « Mes erreurs » (chantier 11, carnet.js) avec les vraies lignes du carnet du prof (24 nov. 2026) :
// 1. la lecture du tableau (colonnes par leur titre, notes entre parenthèses, « Vue » en nombre) et des « Phrase personnalisée » ;
// 2. les clés (la règle change : même carte ; la bonne forme change : autre carte) ;
// 3. le choix des cartes du jour (5 au plus, 1 phrase au plus, les plus fréquentes d'abord, rien deux fois le même jour) ;
// 4. le rythme (ratée → demain, juste → 3 jours, avec l'indice → même boîte) et la synchronisation (ligne retirée, « Vue » qui monte, carnet vide) ;
// 5. le jugement des réponses (accents et ñ obligatoires, ¿ ¡ rappelés, majuscules et virgules libres, plusieurs formes dans une ligne).
// Lancer depuis appli/ : node outils/test-carnet.mjs
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-carnet-"));
for (const f of ["carnet.js", "corriger.js"]) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };
const C = await import(path.join(tmp, "carnet.js"));

let fautes = 0, essais = 0;
const verifier = (nom, obtenu, attendu) => {
  essais++;
  const a = JSON.stringify(obtenu), b = JSON.stringify(attendu);
  if (a !== b) { fautes++; console.log(`✗ ${nom}\n   obtenu  : ${a}\n   attendu : ${b}`); }
};

// Le tableau tel que DocumentApp le renvoie (une ligne vide au-dessus, comme dans l'export du Doc).
const TABLEAU = [
  ["", "", "", ""],
  ["Erreur", "Bonne forme", "Règle en une ligne", "Vue (fois)"],
  ["vivo a Huesca, a la casa", "vivo en Huesca, en casa", "Pour un lieu où l'on est : en.", "4"],
  ["durante 5 años", "desde hace 5 años", "« Depuis » une durée : desde hace.", "1"],
  ["perro (pour « mais »)", "pero", "perro = chien ; pero = mais.", "2"],
  ["vivemos", "vivimos", "Verbes en -ir : nosotros → -imos.", "2"],
  ["he trabajando", "he trabajado", "Après he/has/ha : participe en -ado / -ido.", "2"],
  ["me gusta los perros", "me gustan los perros", "Gustar s'accorde avec la chose aimée.", "1"],
  ["manana, anos, espagnol, murer", "mañana, años, español, mujer", "Le son « gn » s'écrit ñ ; « mujer » avec un j.", "5"],
  ["¿Habla francés? (à deux personnes)", "¿Habláis francés?", "Vosotros (vous, à plusieurs qu'on tutoie) : -áis.", "1"],
  ["trabojo, trobajo", "trabajo", "Trabajar : tra-ba-jo, avec deux a.", "3"],
  ["my mujer", "mi mujer", "« my » est de l'anglais ; mon / ma = mi.", "2"],
  ["Blanca es en Huesca ; sois en Huesca", "Blanca está en Huesca ; sois de Huesca", "Lieu où l'on est : estar ; origine : ser de.", "2"],
  ["Blanca es español ; somos frances", "Blanca es española ; somos franceses", "L'adjectif s'accorde : -a au féminin, -es au pluriel.", "3"],
  ["tú es", "tú eres", "Ser avec tú : eres.", "1"],
  ["mas despacio, ¿como…?, ¿que…?", "más despacio, ¿cómo…?, ¿qué…?", "Accent sur más, et sur cómo / qué dans une question.", "3"],
];
const BILANS = [
  "20 nov. 2026, test de niveau : 18,5 / 27 (69 %). Compréhension écrite 3/3…",
  "Phrase personnalisée (U1-L2, 24 nov. 2026) : Me llamo Kevin, soy francés y tengo treinta y seis años.",
  "Prochain bilan : dimanche 27 déc. 2026 (fin de l'étape 1)",
];
const carnet = C.lireCarnet({ tableau: TABLEAU, bilans: BILANS });

// 1. La lecture
verifier("14 erreurs", carnet.erreurs.length, 14);
verifier("1 phrase", carnet.phrases.map(p => [p.lecon, p.date, p.es]), [["U1-L2", "24 nov. 2026", "Me llamo Kevin, soy francés y tengo treinta y seis años."]]);
const perro = carnet.erreurs.find(e => e.bonne === "pero");
verifier("note du prof à part", [perro.erreur, perro.note], ["perro", "pour « mais »"]);
const habla = carnet.erreurs.find(e => e.bonne === "¿Habláis francés?");
verifier("note après une question", [habla.erreur, habla.note], ["¿Habla francés?", "à deux personnes"]);
verifier("vue et règle", [carnet.erreurs[0].vue, carnet.erreurs[0].regle], [4, "Pour un lieu où l'on est : en."]);
const melange = C.lireCarnet({ tableau: [[" Vue (fois) ", "BONNE FORME", "Erreur", "Règle en une ligne"], ["2", "pero", "perro", "r"], ["", "", "", ""]] });
verifier("colonnes dans un autre ordre", melange.erreurs.map(e => [e.erreur, e.bonne, e.regle, e.vue]), [["perro", "pero", "r", 2]]);
verifier("pas de tableau : rien", C.lireCarnet({ tableau: [["a", "b"]], bilans: [] }), { erreurs: [], phrases: [] });
verifier("réponse illisible : rien", C.lireCarnet(null), { erreurs: [], phrases: [] });
verifier("phrase sans date", C.lireCarnet({ bilans: ["Phrase personnalisée (U1-L3) : Vivo en Huesca."] }).phrases[0].lecon, "U1-L3");

// 2. Les clés
const autreRegle = C.lireCarnet({ tableau: [TABLEAU[1], ["vivo a Huesca", "Vivo en Huesca, en casa.", "autre règle", "6"]] });
verifier("même bonne forme (casse, point) : même clé", autreRegle.erreurs[0].cle, carnet.erreurs[0].cle);
const autreForme = C.lireCarnet({ tableau: [TABLEAU[1], ["mas", "más", "", "1"], ["mas", "mas", "", "1"]] });
verifier("un accent change la clé", autreForme.erreurs[0].cle !== autreForme.erreurs[1].cle, true);

// 3. Les cartes du jour
const J = "2026-11-25";
let fiches = {};
const jour1 = C.cartesDuJour(carnet, fiches, J);
verifier("5 cartes, 4 erreurs + 1 phrase", jour1.map(c => c.type), ["erreur", "erreur", "erreur", "erreur", "phrase"]);
verifier("les plus fréquentes d'abord", jour1.slice(0, 2).map(c => c.vue), [5, 4]);
for (const c of jour1.slice(0, 3)) fiches[c.cle] = C.nouvelleFiche(fiches[c.cle], "juste", J, c.vue);
verifier("3 faites aujourd'hui : il en reste 2", C.cartesDuJour(carnet, fiches, J).length, 2);
verifier("les faites ne reviennent pas le même jour", C.cartesDuJour(carnet, fiches, J).some(c => fiches[c.cle]), false);
for (const c of C.cartesDuJour(carnet, fiches, J)) fiches[c.cle] = C.nouvelleFiche(fiches[c.cle], "rate", J, c.vue);
verifier("5 faites : plus rien", C.cartesDuJour(carnet, fiches, J), []);
verifier("pas de carnet : rien", C.cartesDuJour(null, {}, J), []);

// 4. Le rythme
const f0 = C.nouvelleFiche(undefined, "rate", J, 5);
verifier("ratée : demain", [f0.boite, C.quandRevient(f0)], [0, "demain"]);
const f1 = C.nouvelleFiche(f0, "juste", J, 5);
verifier("juste : dans 3 jours", C.quandRevient(f1), "dans 3 jours");
verifier("avec l'indice : même boîte", C.nouvelleFiche(f1, "aide", J).boite, 1);
const demain = "2026-11-26";
const fichesDemain = { [carnet.erreurs[0].cle]: C.nouvelleFiche(undefined, "juste", J, 4), [carnet.erreurs[6].cle]: C.nouvelleFiche(undefined, "rate", J, 5) };
const d = C.cartesDuJour(carnet, fichesDemain, demain);
verifier("le lendemain : la ratée revient, la réussie non", [d.includes(carnet.erreurs[6]), d.includes(carnet.erreurs[0])], [true, false]);
verifier("dans 3 jours, la réussie revient", C.cartesDuJour(carnet, fichesDemain, "2026-11-28").includes(carnet.erreurs[0]), true);

// La synchronisation
const sansLigne = { erreurs: carnet.erreurs.slice(1), phrases: carnet.phrases };
const s1 = C.synchroniser(fichesDemain, sansLigne);
verifier("ligne retirée : sa fiche part", Object.keys(s1), [carnet.erreurs[6].cle]);
verifier("carnet vide : on ne touche à rien", C.synchroniser(fichesDemain, { erreurs: [], phrases: [] }), fichesDemain);
const plus = { erreurs: carnet.erreurs.map(e => e.cle === carnet.erreurs[0].cle ? { ...e, vue: 5 } : e), phrases: [] };
verifier("« Vue » qui monte : boîte 0", C.synchroniser(fichesDemain, plus)[carnet.erreurs[0].cle].boite, 0);
verifier("« Vue » qui monte : revient le lendemain", C.cartesDuJour(plus, C.synchroniser(fichesDemain, plus), demain).includes(plus.erreurs[0]), true);

// La copie
C.garderCarnet(carnet, "2026-11-25T10:00:00Z");
verifier("copie relue", [C.carnetActuel().erreurs.length, C.carnetActuel().lu], [14, "2026-11-25T10:00:00Z"]);

// 5. Le jugement
const carte = bonne => carnet.erreurs.find(e => e.bonne === bonne);
const juge = (tape, bonne) => { const r = C.juger(tape, carte(bonne)); return [r.ok, r.niveau, r.rappel || r.astuce || ""]; };
verifier("juste", juge("vivo en Huesca, en casa", "vivo en Huesca, en casa"), [true, "juste", ""]);
verifier("majuscules et virgules libres", juge("Vivo en Huesca en casa.", "vivo en Huesca, en casa"), [true, "juste", ""]);
verifier("4 formes d'un coup", juge("mañana años español mujer", "mañana, años, español, mujer"), [true, "juste", ""]);
verifier("un ñ oublié : faux, avec l'astuce", juge("mañana, años, espanol, mujer", "mañana, años, español, mujer"),
  [false, "presque", "« español » prend un ñ : sans lui, c'est un autre mot."]);
verifier("un accent oublié : faux", juge("mas despacio, ¿cómo?, ¿qué?", "más despacio, ¿cómo…?, ¿qué…?"),
  [false, "presque", "« más » prend un accent : à l'oral, il dit où appuyer."]);
verifier("les ¿ et … ne comptent pas", juge("más despacio cómo qué", "más despacio, ¿cómo…?, ¿qué…?"), [true, "juste", "N'oublie pas le ¿ au début d'une question."]);
verifier("¿ oublié : juste, avec le rappel", juge("Habláis francés", "¿Habláis francés?"), [true, "juste", "N'oublie pas le ¿ au début d'une question."]);
verifier("¿ présent : pas de rappel", juge("¿habláis francés?", "¿Habláis francés?"), [true, "juste", ""]);
verifier("accent oublié sur habláis : faux", juge("¿Hablais francés?", "¿Habláis francés?")[0], false);
verifier("la note n'est pas à écrire", juge("pero", "pero"), [true, "juste", ""]);
verifier("deux phrases avec ;", juge("Blanca está en Huesca, sois de Huesca", "Blanca está en Huesca ; sois de Huesca"), [true, "juste", ""]);
verifier("l'ancienne faute : faux", juge("Blanca es en Huesca ; sois en Huesca", "Blanca está en Huesca ; sois de Huesca")[0], false);

console.log(fautes ? `\n${fautes} erreur(s) sur ${essais} vérifications.` : `✓ ${essais} vérifications, tout est juste.`);
process.exit(fautes ? 1 : 0);
