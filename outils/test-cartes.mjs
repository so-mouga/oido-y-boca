// Vérifie les cartes d'un mot (chantier 15) : la carte 2 (le mot caché dans l'exemple), le déblocage, les « + »,
// une seule carte par mot et par jour, le rythme propre à chaque carte, « Tu bloques sur… », la lecture des colonnes
// « phrase N (fr/es/aide) » du Sheet, et les anciennes sauvegardes.
// Lancer depuis appli/ : node outils/test-cartes.mjs [chemin/vers/vocabulaire.csv]
// Avec un CSV (l'onglet Vocabulaire), il vérifie aussi que l'appli retrouve le mot dans au moins 90 % des exemples.
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-cartes-"));
// Sans les « ?v=N » des imports : un seul exemplaire de progression.js, quel que soit le numéro de version.
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js")))
  fs.writeFileSync(path.join(tmp, f), fs.readFileSync(path.join(racine, f), "utf8").replace(/\?v=\d+/g, ""));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const C = await import(path.join(tmp, "cartes.js"));
const P = await import(path.join(tmp, "progression.js"));

let fautes = 0;
const ok = (cond, msg) => { if (!cond) { fautes++; console.log("✗", msg); } };
const egal = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`);

// ——— la lecture du Sheet ———
const csv = `"espagnol","français","exemple","leçon","unité","catégorie","phrase 1 (fr)","phrase 1 (es)","phrase 1 (aide)","phrase 2 (fr)","phrase 2 (es)","phrase 2 (aide)"
"desde hace","depuis (+ une durée)","Vivo en Huesca desde hace cinco años.","U1-L3","Me présenter","expression","Je travaille à la maison depuis deux ans.","Trabajo desde casa desde hace dos años.","","Nos voisines vivent à Madrid depuis un an.","Nuestras vecinas viven en Madrid desde hace un año. | Las vecinas viven en Madrid desde hace un año.","vecina = voisine"
"llamarse","s'appeler","Me llamo Kevin y mi pareja se llama Blanca.","U1-L2","Me présenter","verbe","","","","","",""
"la ciudad","la ville","Huesca es una ciudad pequeña y tranquila.","U1-L3","Me présenter","nom","","","","","",""`;
const [desde, llamarse, ciudad] = versMots(lireCsv(csv));
egal(desde.phrases.length, 2, "desde hace a 2 phrases");
egal(desde.phrases[1].es, ["Nuestras vecinas viven en Madrid desde hace un año.", "Las vecinas viven en Madrid desde hace un año."], "« | » sépare les bonnes réponses");
egal(desde.phrases[1].aide, "vecina = voisine", "l'aide est lue");
egal(llamarse.phrases, [], "cases vides : pas de phrases");
// Un Sheet sans les nouvelles colonnes se lit comme avant.
const ancien = versMots(lireCsv(`"espagnol","français","exemple","leçon"\n"el piso","l'appartement","¿Vives en un piso o en una casa?","U1-L3"`));
egal(ancien[0].phrases, [], "Sheet d'avant : pas de phrases");
egal(ancien[0].id, "U1-L3|el piso", "Sheet d'avant : même id");

// ——— la carte 2 : le mot caché ———
egal(C.trouDe(desde), { phrase: "Vivo en Huesca ___ cinco años.", reponse: "desde hace" }, "trou de desde hace");
egal(C.trouDe(llamarse), { phrase: "Me ___ Kevin y mi pareja se llama Blanca.", reponse: "llamo" }, "trou d'un verbe conjugué");
egal(C.trouDe(ciudad)?.reponse, "ciudad", "trou d'un nom sans article");
egal(C.trouDe({ es: "el hermano / la hermana", ex: "¿Tienes hermanos?", categorie: "nom" })?.reponse, "hermanos", "trou au pluriel");
egal(C.trouDe({ es: "al lado de", ex: "El baño está al lado del dormitorio.", categorie: "mot-outil" })?.reponse, "al lado del", "de → del");
egal(C.trouDe({ es: "hace frío", ex: "Hoy hace mucho frío.", categorie: "expression" }), null, "mot introuvable : pas de carte 2");
egal(C.nbCartes(desde), 4, "desde hace : 4 cartes");
egal(C.nbCartes(llamarse), 2, "llamarse : 2 cartes");
egal(C.nbCartes({ moi: true, es: "x" }), 1, "mes mots : 1 carte");

// ——— le déroulé, jour après jour ———
const jour = n => new Date(Date.UTC(2026, 10, 25 + n)).toISOString().slice(0, 10);
const depart = () => jour(0); // leçon faite au jour 0
const dues = (mots, n) => C.cartesARevoir(mots, P.fichesCartes(), jour(n), depart);
const nDe = (mots, n, m) => dues(mots, n).find(c => c.mot.id === m.id)?.n ?? null;

// Jour 0, la leçon : la carte 1 de chaque mot (notée dans la leçon). Jours 1 et 4 : Oui → boîte 3 → la carte 2 se débloque.
for (const m of [desde, ciudad]) P.noterMot(m.id, 3, jour(0));
egal(nDe([ciudad], 0, ciudad), null, "vu aujourd'hui : rien de plus aujourd'hui");
egal(nDe([ciudad], 1, ciudad), 1, "jour 1 : carte 1");
P.noterMot(ciudad.id, 3, jour(1));
egal(nDe([ciudad], 2, ciudad), null, "jour 2 : rien (rendez-vous des 3 jours)");
egal(nDe([ciudad], 4, ciudad), 1, "jour 4 : carte 1");
P.noterMot(ciudad.id, 3, jour(4));
ok(P.fichesCartes()[`${ciudad.id}#2`], "carte 1 réussie au rendez-vous des 3 jours : la carte 2 existe");
egal(nDe([ciudad], 4, ciudad), null, "la carte 2 n'arrive pas le jour même");
egal(nDe([ciudad], 5, ciudad), 2, "jour 5 : la carte 2");
P.noterMot(`${ciudad.id}#2`, 1, jour(5));
egal(nDe([ciudad], 6, ciudad), 2, "carte 2 ratée : demain");
P.noterMot(ciudad.id, 1, jour(11)); // la carte 1 ratée plus tard : la carte 2 reste
ok(C.cartesDuMot(ciudad, P.fichesCartes()).find(c => c.n === 2).la, "la carte 2 reste débloquée");

// Les « + » : les cartes 3 et 4 de desde hace, prises le jour 1 (le mot pas encore vu ce jour-là).
egal(C.cartesDuMot(desde, P.fichesCartes()).filter(c => c.la).map(c => c.n), [1], "desde hace : seulement la carte 1 au départ");
P.prendreCarte(C.cleCarte(desde.id, 3), jour(1));
P.prendreCarte(C.cleCarte(desde.id, 4), jour(1));
egal(nDe([desde], 1, desde), 3, "jour 1 : la carte prise passe d'abord (la 3 avant la 4)");
// Une carte prise passe en tête du paquet, même devant un mot très en retard.
const vieux = { id: "U1-L1|viejo", es: "viejo", fr: "vieux", lecon: "U1-L1", phrases: [] };
const ordre = C.cartesARevoir([vieux, desde], P.fichesCartes(), jour(1), () => "2026-01-01").map(c => c.mot.id);
egal(ordre, [desde.id, desde.id, vieux.id], "les cartes prises avec « + » (la 3 et la 4) passent devant les cartes en retard");
egal(dues([desde], 1).map(c => c.n), [3, 4], "les deux cartes prises arrivent le jour même");
P.noterMot(C.cleCarte(desde.id, 3), 3, jour(1));
egal(nDe([desde], 1, desde), 4, "la 4, prise aussi, arrive le même jour malgré la 3 déjà vue");
P.noterMot(C.cleCarte(desde.id, 4), 2, jour(1));
egal(nDe([desde], 1, desde), null, "ensuite, une seule carte par mot et par jour");
egal(nDe([desde], 2, desde), 1, "jour 2 : la carte 1 (à égalité de retard avec la 4, la plus petite)");
P.noterMot(desde.id, 3, jour(2));
egal(nDe([desde], 3, desde), 4, "jour 3 : la 4, ratée à moitié, revient");
P.noterMot(C.cleCarte(desde.id, 4), 2, jour(3));
// Un mot déjà vu aujourd'hui (sa carte 1 vient de passer) : une carte prise avec « + » arrive quand même tout de suite.
const autre = { ...desde, id: "U1-L3|autre" };
P.noterMot(autre.id, 3, jour(5));
egal(nDe([autre], 5, autre), null, "carte 1 vue aujourd'hui : rien de plus");
P.prendreCarte(C.cleCarte(autre.id, 3), jour(5));
egal(nDe([autre], 5, autre), 3, "« + » sur un mot déjà vu aujourd'hui : la carte arrive tout de suite");
egal(C.etatCarte(C.cartesDuMot(autre, P.fichesCartes())[2], autre, jour(5), depart, P.fichesCartes()).texte, "aujourd'hui", "le Livre dit « aujourd'hui »");
egal(P.fichesCartes()[C.cleCarte(desde.id, 4)].boite, 0, "« Avec peine » garde la boîte de la carte 4");
egal(P.fichesCartes()[C.cleCarte(desde.id, 3)].boite, 1, "chaque carte a sa boîte : la 3 en boîte 1");

// « Tu bloques sur… » : 2 « Non » de suite à la carte 1.
P.noterMot(llamarse.id, 1, jour(1)); P.noterMot(llamarse.id, 1, jour(2));
egal(P.fichesCartes()[llamarse.id].nons, 2, "2 Non de suite");
P.noterMot(llamarse.id, 3, jour(3));
egal(P.fichesCartes()[llamarse.id].nons, 0, "un Oui remet à zéro");
P.refuserPhrases(llamarse.id);
ok(P.fichesCartes()[llamarse.id].refus && P.fichesCartes()[llamarse.id].boite === 1, "« Pas maintenant » garde la fiche");

// L'état affiché dans le Livre et le Dico.
const etats = C.cartesDuMot(desde, P.fichesCartes()).map(c => C.etatCarte(c, desde, jour(3), depart, P.fichesCartes()).etat);
egal(etats, ["revision", "attend", "revision", "revision"], "états de desde hace au jour 3");

// ——— les sauvegardes ———
const d = JSON.parse(P.donneesSauvegarde(jour(3)));
ok(d.mots[`${desde.id}#3`], "les cartes 3 et 4 partent dans la sauvegarde");
const relue = P.lireSauvegarde(JSON.stringify(d));
egal(relue.etat.mots[`${desde.id}#4`], d.mots[`${desde.id}#4`], "et reviennent à la restauration");
// Une sauvegarde d'avant le chantier : la carte 1 en boîte 3 a déjà sa carte 2.
const vieille = P.lireSauvegarde(JSON.stringify({ appli: "oido-y-boca", le: jour(0), mots: { [ciudad.id]: { boite: 3, vu: jour(0) } }, jours: {}, ecoute: 0 }));
P.restaurer(vieille);
ok(C.cartesDuMot(ciudad, P.fichesCartes()).find(c => c.n === 2).la, "ancienne sauvegarde : carte 2 débloquée");
egal(nDe([ciudad], 1, ciudad), 2, "ancienne sauvegarde : la carte 2 arrive");
egal(nDe([desde], 1, desde), 1, "ancienne sauvegarde : un mot jamais revu a sa carte 1");

// ——— le plafond ———
egal(P.PLAFOND, 40, "40 cartes par jour");

// ——— tout le Sheet ———
if (process.argv[2]) {
  const mots = versMots(lireCsv(fs.readFileSync(process.argv[2], "utf8")));
  const sans = mots.filter(m => !C.trouDe(m));
  const taux = 1 - sans.length / mots.length;
  console.log(`Carte 2 : le mot retrouvé dans ${mots.length - sans.length} exemples sur ${mots.length} (${Math.round(taux * 100)} %).`);
  ok(taux >= 0.9, "au moins 90 % des mots ont une carte 2");
  for (const m of mots) {
    const t = C.trouDe(m);
    if (t) ok(t.phrase.split("___").length === 2 && t.reponse.trim(), `trou bien formé : ${m.id}`);
    for (const p of m.phrases) ok(p.fr && p.es.every(Boolean), `phrase complète : ${m.id}`);
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fautes ? `${fautes} faute(s).` : "Tout est bon.");
process.exit(fautes ? 1 : 0);
