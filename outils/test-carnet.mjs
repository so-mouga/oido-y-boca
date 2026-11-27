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

// 6. Plusieurs fautes sur une ligne : une case par faute (Q11-11)
const cases = bonne => C.decouper(carte(bonne));
verifier("4 cases", cases("mañana, años, español, mujer"), [
  { faute: "manana", bonne: "mañana" }, { faute: "anos", bonne: "años" }, { faute: "espagnol", bonne: "español" }, { faute: "murer", bonne: "mujer" }]);
verifier("3 cases, avec ¿…?", cases("más despacio, ¿cómo…?, ¿qué…?").map(c => c.bonne), ["más despacio", "¿cómo…?", "¿qué…?"]);
verifier("2 cases sur « ; »", cases("Blanca está en Huesca ; sois de Huesca"), [{ faute: "Blanca es en Huesca", bonne: "Blanca está en Huesca" }, { faute: "sois en Huesca", bonne: "sois de Huesca" }]);
verifier("2 bouts de phrase", cases("vivo en Huesca, en casa").map(c => c.faute), ["vivo a Huesca", "a la casa"]);
verifier("2 fautes, 1 bonne forme", cases("trabajo"), [{ faute: "trabojo", bonne: "trabajo" }, { faute: "trobajo", bonne: "trabajo" }]);
verifier("une seule faute : une case", [cases("vivimos"), cases("¿Habláis francés?"), cases("pero")], [null, null, null]);
verifier("découpage qui ne tombe pas juste : une case", C.decouper({ erreur: "a, b, c", bonne: "x, y" }), null);
const jc = (saisies, bonne) => { const r = C.jugerCases(saisies, cases(bonne)); return [r.ok, r.justes, r.astuce || r.rappel]; };
verifier("4 cases justes", jc(["mañana", " años ", "Español", "mujer"], "mañana, años, español, mujer"), [true, 4, ""]);
verifier("1 case fausse : 3 sur 4, astuce du ñ", jc(["mañana", "años", "espanol", "mujer"], "mañana, años, español, mujer"),
  [false, 3, "« español » prend un ñ : sans lui, c'est un autre mot."]);
verifier("case vide : fausse", jc(["mañana", "", "español", "mujer"], "mañana, años, español, mujer").slice(0, 2), [false, 3]);
verifier("¿ oublié dans une case : rappel", jc(["más despacio", "cómo", "¿qué?"], "más despacio, ¿cómo…?, ¿qué…?"), [true, 3, "N'oublie pas le ¿ au début d'une question."]);
verifier("deux mots collés : faux", jc(["Blancaestá en Huesca", "sois de Huesca"], "Blanca está en Huesca ; sois de Huesca").slice(0, 2), [false, 1]);

// 7. Une phrase nouvelle à traduire (point 8 quindecies)
const mp = (e, b) => C.morceauPiege(e, b);
verifier("piège : está en", mp("Blanca es en Huesca", "Blanca está en Huesca"), { texte: "está en", ortho: false });
verifier("piège : estamos en", mp("somos en casa", "estamos en casa").texte, "estamos en");
verifier("piège sans le nombre : desde hace", mp("durante 5 años", "desde hace 5 años").texte, "desde hace");
verifier("piège sans le nom : en", mp("vivo a Huesca", "vivo en Huesca").texte, "en");
verifier("piège : cuál es", mp("¿Qué es tu apellido?", "¿Cuál es tu apellido?").texte, "Cuál es");
verifier("orthographe : mañana", mp("manana", "mañana"), { texte: "mañana", ortho: true });
verifier("trabajo : lettres", mp("trabojo", "trabajo"), { texte: "trabajo", ortho: false });
verifier("seulement la ponctuation : pas de piège", mp("No soy francés.", "No, soy francés."), null);
const tr = (tape, piege, ortho = false) => { const r = C.jugerTraduction(tape, { piege, ortho }); return [r.ok, r.position, r.rappel]; };
verifier("traduction juste", tr("Blanca está en casa", "está en"), [true, 1, ""]);
verifier("autre traduction juste aussi", tr("Hoy Blanca está en casa.", "está en")[0], true);
verifier("le piège raté", tr("Blanca es en casa", "está en")[0], false);
verifier("accent oublié : juste, rappel", tr("Léo y Dorian estan en el barrio", "están en"), [true, 3, "Accent : « están en »."]);
verifier("ñ oublié hors orthographe : juste", tr("desde hace cinco anos trabajo", "años")[0], true);
verifier("carte d'orthographe : le ñ compte", [tr("Manana trabajo", "mañana", true)[0], tr("Mañana trabajo", "mañana", true)[0]], [false, true]);
verifier("mots entiers seulement", tr("Blanca estamos", "está")[0], false);

const carteEstar = { type: "erreur", cle: "e:blanca está en huesca", erreur: "Blanca es en Huesca", bonne: "Blanca está en Huesca", regle: "r", vue: 6 };
const EX = {
  "U1-L4": { ecrire: [
    { consigne: "Traduis", fr: "Blanca est à la maison.", es: ["Blanca está en casa."] },
    { consigne: "Traduis", fr: "Blanca est fatiguée.", es: ["Blanca está cansada."] },
    { consigne: "Complète", fr: "Léo ___ en el barrio. (estar)", es: ["está"], trad: "Léo est dans le quartier." },
    { consigne: "Complète", fr: "Yo ___ en casa. (estar)", es: ["estoy"] } ], dire: [] },
  "U1-L9": { ecrire: [{ consigne: "Traduis", fr: "Mon chef est à Madrid.", es: ["Mi jefe está en Madrid."] }], dire: [] },
};
const faitesL = new Set(["U1-L1", "U1-L2", "U1-L3", "U1-L4"]);
const pe = C.phrasesDesExercices(EX, faitesL, C.morceauPiege(carteEstar.erreur, carteEstar.bonne));
verifier("exercices : seulement « está en », leçons faites", pe.map(p => [p.fr, p.es]), [["Blanca est à la maison.", "Blanca está en casa."], ["Léo est dans le quartier.", "Léo está en el barrio."]]);
verifier("exercices : un piège trop court (« en ») ne prend rien", C.phrasesDesExercices(EX, faitesL, { texte: "en", ortho: false }), []);
const RES = { "e:blanca está en huesca": [
  { fr: "Mes beaux-parents sont à Huesca.", es: "Mis suegros están en Huesca.", piege: "están en", apres: "U1-L5" },
  { fr: "Je suis dans mon bureau.", es: "Estoy en mi despacho.", piege: "Estoy en", apres: "U1-L4" },
  { fr: "Ma sœur est à Paris.", es: "Mi hermana está en París.", piege: "está en", apres: "U1-L5" } ] };
const pt = tour => C.phraseATraduire(carteEstar, { reserve: RES, exercices: EX, faites: new Set([...faitesL, "U1-L5"]), tour })?.fr;
verifier("réserve d'abord, à tour de rôle", [pt(0), pt(1), pt(2), pt(3)], ["Mes beaux-parents sont à Huesca.", "Je suis dans mon bureau.", "Ma sœur est à Paris.", "Mes beaux-parents sont à Huesca."]);
verifier("jamais deux fois de suite la même", [0, 1, 2, 3, 4].every(t => pt(t) !== pt(t + 1)), true);
verifier("phrase de la réserve pas encore permise : cachée", C.phraseATraduire(carteEstar, { reserve: RES, exercices: EX, faites: faitesL, tour: 0 }).fr, "Je suis dans mon bureau.");
verifier("réserve vide : les exercices", C.phraseATraduire(carteEstar, { reserve: {}, exercices: EX, faites: faitesL, tour: 1 }), { fr: "Léo est dans le quartier.", es: "Léo está en el barrio.", piege: "está en", ortho: false, source: "U1-L4" });
verifier("rien : l'ancienne carte « Corrige »", C.phraseATraduire(carteEstar, { reserve: {}, exercices: {}, faites: faitesL }), null);
verifier("ligne à plusieurs fautes : garde ses cases", C.phraseATraduire({ ...carteEstar, erreur: "Blanca es en Huesca ; somos en casa", bonne: "Blanca está en Huesca ; estamos en casa" }, { reserve: RES, exercices: EX, faites: faitesL }), null);
verifier("ponctuation seule : « Corrige »", C.phraseATraduire({ ...carteEstar, erreur: "No soy francés.", bonne: "No, soy francés." }, { reserve: RES, exercices: EX, faites: faitesL }), null);
const t1 = C.nouvelleFiche(undefined, "juste", J, 6), t2 = C.nouvelleFiche(t1, "rate", demain, 6);
verifier("le tour avance à chaque passage", [t1.tour, t2.tour], [1, 2]);
verifier("réussites de suite : 3, 7, 14 jours", [1, 2, 3].map(n => C.quandRevient({ boite: n })), ["dans 3 jours", "dans 7 jours", "dans 14 jours"]);

// 8. Le prof coupe et supprime des lignes (Q11-18) : rien ne casse
const avant = C.lireCarnet({ tableau: [TABLEAU[1],
  ["Blanca es en Huesca ; somos en casa", "Blanca está en Huesca ; estamos en casa", "estar", "6"], ["vivemos", "vivimos", "-imos", "3"], ["tú es", "tú eres", "eres", "1"]] });
const fichesAvant = Object.fromEntries(avant.erreurs.map(c => [c.cle, C.nouvelleFiche(undefined, "juste", J, c.vue)]));
const apres = C.lireCarnet({ tableau: [TABLEAU[1],
  ["Blanca es en Huesca", "Blanca está en Huesca", "estar", "6"], ["somos en casa", "estamos en casa", "estar", "6"], ["vivemos", "vivimos", "-imos", "3"]] });
const synchro = C.synchroniser(fichesAvant, apres);
verifier("lignes coupées : nouvelles cartes, de zéro ; supprimée : partie ; gardée : intacte", Object.keys(synchro), ["e:vivimos"]);
verifier("les cartes coupées sont toutes à faire", C.cartesDuJour(apres, synchro, demain).map(c => c.bonne), ["Blanca está en Huesca", "estamos en casa"]);
const vieille = { ...fichesAvant, "e:une carte disparue": { boite: 3, vu: "2026-11-20" } };
verifier("vieille sauvegarde : les cartes inconnues sont ignorées puis effacées", [C.cartesDuJour(apres, vieille, demain).length, Object.keys(C.synchroniser(vieille, apres))], [2, ["e:vivimos"]]);

console.log(fautes ? `\n${fautes} erreur(s) sur ${essais} vérifications.` : `✓ ${essais} vérifications, tout est juste.`);
process.exit(fautes ? 1 : 0);
