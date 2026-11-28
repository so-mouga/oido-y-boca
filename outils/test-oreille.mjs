// Vérifie le chantier 24 (APPLI.md, point 8 duodecies) :
//   - la carte 1 qu'on écrit (jugerMot) : juste, accents, article oublié, mauvais article, « / », parenthèses, « … », indice ;
//   - la carte 5 « à l'oreille » (jugerOreille) : accents et ñ ne comptent pas, 1 petit mot ou 1 erreur = Avec peine,
//     2 erreurs ou le mot de la carte = Non, indice ;
//   - le rythme (étape 3, 28 nov.) : la carte 5 naît en boîte 0 quand la carte 1 passe en boîte 3, arrive le lendemain,
//     puis 1, 3, 7, 14… ; ratée, elle reste une dictée ; la migration des fiches « #2 » ; la sauvegarde ;
//   - la file de « Ta journée » (valeurAvant).
// Lancer depuis appli/ : node outils/test-oreille.mjs [chemin/vers/vocabulaire.csv]
// Avec un CSV (l'onglet Vocabulaire), il vérifie aussi que chaque mot accepte sa propre forme écrite, et liste les mots à « / ».
import fs from "fs";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-oreille-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js")))
  fs.writeFileSync(path.join(tmp, f), fs.readFileSync(path.join(racine, f), "utf8").replace(/\?v=\d+/g, ""));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const C = await import(path.join(tmp, "cartes.js"));
const P = await import(path.join(tmp, "progression.js"));
const O = await import(path.join(tmp, "oreille.js"));
const { corriger } = await import(path.join(tmp, "corriger.js"));

let fautes = 0;
const ok = (cond, msg) => { if (!cond) { fautes++; console.log("✗", msg); } };
const egal = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`);

// ——— la carte 1 : ce que j'écris note ———
const m1 = (tape, es, o) => { const r = O.jugerMot(tape, es, o); return [r.niveau, r.note]; };
egal(m1("la reunión", "la reunión"), ["juste", 3], "carte 1 : juste");
egal(m1("La reunion", "la reunión"), ["accents", 3], "carte 1 : accent oublié = Oui, avec un rappel");
egal(m1("reunión", "la reunión"), ["article", 2], "carte 1 : article oublié = Avec peine (Q24-15)");
egal(m1("reunion", "la reunión"), ["article", 2], "carte 1 : article et accent oubliés = Avec peine");
egal(m1("el reunión", "la reunión"), ["faux", 1], "carte 1 : mauvais article = Non");
egal(m1("la junta", "la reunión"), ["faux", 1], "carte 1 : autre mot = Non");
egal(m1("la cuñada", "el cuñado / la cuñada"), ["juste", 3], "carte 1 : une des deux formes suffit (Q24-17)");
egal(m1("el cuñado", "el cuñado / la cuñada"), ["juste", 3], "carte 1 : l'autre forme aussi");
egal(m1("cuñado", "el cuñado / la cuñada"), ["article", 2], "carte 1 : « / » et article oublié");
egal(m1("francesa", "francés / francesa"), ["juste", 3], "carte 1 : « / » sans article");
egal(m1("sobre", "sobre (= environ)"), ["juste", 3], "carte 1 : la parenthèse ne s'écrit pas");
egal(m1("ir a buscar", "ir a buscar (a alguien)"), ["juste", 3], "carte 1 : parenthèse en espagnol");
egal(m1("tener años", "tener … años"), ["juste", 3], "carte 1 : « … » sans rien");
egal(m1("tener … años", "tener … años"), ["juste", 3], "carte 1 : « … » écrit");
egal(m1("cuantas", "¿cuántos? / ¿cuántas?"), ["accents", 3], "carte 1 : ¿ ? ne comptent pas");
egal(m1("¡Qué bien!", "¡Qué bien!"), ["juste", 3], "carte 1 : ¡ ! écrits");
egal(m1("ano", "el año"), ["faux", 1], "carte 1 : un ñ oublié compte faux (comme les autres cartes écrites)");
egal(m1("la reunión", "la reunión", { indice: true }), ["juste", 2], "carte 1 : avec un indice, Avec peine au mieux");
egal(m1("reunión", "la reunión", { indice: true }), ["article", 2], "carte 1 : indice et article oublié");

// ——— la carte 5 : à l'oreille ———
const P5 = "Tengo una reunión a las diez.";
const o5 = (tape, phrase = P5, mot = "reunión", o) => { const r = O.jugerOreille(tape, phrase, mot, o); return [r.niveau, r.note]; };
egal(o5("Tengo una reunión a las diez"), ["juste", 3], "carte 5 : juste, sans le point");
egal(o5("tengo una reunion a las diez"), ["accents", 3], "carte 5 : accent oublié = Oui");
egal(O.jugerOreille("tengo una reunion a las diez", P5, "reunión").accents, ["reunión"], "carte 5 : le rappel nomme le mot sans accent");
egal(o5("Hace muchos anos", "Hace muchos años.", "años"), ["accents", 3], "carte 5 : ñ oublié = Oui (réglage du prof)");
egal(o5("Tengo una reunion las diez"), ["petit", 2], "carte 5 : un petit mot oublié = Avec peine");
egal(O.jugerOreille("Tengo una reunion las diez", P5, "reunión").petits, ["a"], "carte 5 : « Petit mot oublié : a »");
egal(o5("Tengo una reunión en las diez"), ["presque", 2], "carte 5 : un petit mot faux = Avec peine");
egal(o5("Tengo una reunión a la diez"), ["presque", 2], "carte 5 : une seule autre erreur = Avec peine");
egal(o5("Tengo una region a las diez"), ["mot", 1], "carte 5 : le mot de la carte raté = Non");
egal(o5("Tengo una a las diez"), ["mot", 1], "carte 5 : le mot de la carte oublié = Non");
egal(o5("Tengo reunion las diez"), ["faux", 1], "carte 5 : 2 erreurs = Non");
egal(o5("Tengo una reunión a las diez", P5, "reunión", { indice: true }), ["juste", 2], "carte 5 : avec un indice, Avec peine au mieux");
egal(o5("Me llamo Kevin y mi pareja se llama Blanca", "Me llamo Kevin y mi pareja se llama Blanca.", "llamo"), ["juste", 3], "carte 5 : verbe conjugué");
egal(o5("Me llamo Kevin y mi pareja llama Blanca", "Me llamo Kevin y mi pareja se llama Blanca.", "llamo"), ["petit", 2], "carte 5 : « se » oublié");
egal(o5("Vivo en Huesca cinco años", "Vivo en Huesca desde hace cinco años.", "desde hace"), ["mot", 1], "carte 5 : une expression de plusieurs mots ratée");
// corriger.js garde ses règles d'avant sans l'option.
ok(!["juste", "accents"].includes(corriger("ano", ["año"]).niveau), "corriger : le ñ compte toujours, sans l'option");
egal(corriger("ano", ["año"], { enye: false }).niveau, "accents", "corriger : { enye: false }");

// ——— le rythme ———
const csv = `"espagnol","français","exemple","leçon","unité","catégorie"
"la reunión","la réunion","Tengo una reunión a las diez.","U1-L4","Me présenter","nom"
"hace frío","il fait froid","Hoy hace mucho frío.","U1-L4","Me présenter","expression"`;
const [reunion, frio] = versMots(lireCsv(csv));
const jour = n => new Date(Date.UTC(2026, 10, 25 + n)).toISOString().slice(0, 10);
const depart = () => jour(0);
const dueN = n => C.cartesARevoir([reunion], P.fichesCartes(), jour(n), depart).find(c => c.mot.id === reunion.id)?.n ?? null;
const k5 = C.cleCarte(reunion.id, C.ORE);
// Quand vient la carte 5, d'après sa propre fiche (la carte 1 du mot peut tomber le même jour et passer devant).
const quand5 = n => C.etatCarte(C.cartesDuMot(reunion, P.fichesCartes()).find(c => c.n === C.ORE), reunion, jour(n), depart, P.fichesCartes()).texte.replace(/^revient /, "");
egal(k5, `${reunion.id}#o`, "la carte 5 a sa propre clé");
egal(C.nbCartes(reunion), 2, "la reunión : la carte 1 et la carte 5");
ok(!C.cartesDuMot(reunion, {}).some(c => c.n === 2), "plus de carte 2 (étape 3)");
egal(C.etatCarte(C.cartesDuMot(reunion, {}).find(c => c.n === C.ORE), reunion, jour(0), depart, {}).texte, "après la 1", "le Livre : la 5 « après la 1 »");
// Carte 1 : jours 1 et 4 Oui → boîte 2 ; jour 7 Oui → boîte 3 → la carte 5 naît, en boîte 0, et arrive le lendemain.
P.noterMot(reunion.id, 3, jour(1)); P.noterMot(reunion.id, 3, jour(4));
ok(!P.fichesCartes()[k5], "pas de carte 5 avant le rendez-vous des 3 jours");
P.noterMot(reunion.id, 3, jour(7));
egal(P.fichesCartes()[k5], { boite: 0, vu: null, dep: jour(7) }, "carte 1 en boîte 3 : la carte 5 naît en boîte 0");
ok(!P.fichesCartes()[`${reunion.id}#2`], "et pas de carte 2");
egal(dueN(7), null, "pas le jour même (une carte par mot et par jour)");
egal(dueN(8), C.ORE, "la carte 5 arrive le lendemain");
// Elle suit les rendez-vous 0, 1, 3, 7, 14, 30, 60.
P.noterMot(k5, 3, jour(8));
egal(P.fichesCartes()[k5].boite, 1, "1re réussite de la carte 5 : boîte 1");
egal(quand5(9), "aujourd'hui", "puis à 1 jour");
P.noterMot(k5, 3, jour(9)); egal(quand5(11), "demain", "pas avant 3 jours"); egal(quand5(12), "aujourd'hui", "à 3 jours");
P.noterMot(k5, 3, jour(12)); egal(quand5(19), "aujourd'hui", "puis à 7 jours");
P.noterMot(k5, 3, jour(19)); egal(quand5(33), "aujourd'hui", "puis à 14 jours");
// Ratée, elle reste une dictée et revient demain.
P.noterMot(k5, 1, jour(33));
egal(P.fichesCartes()[k5].boite, 0, "carte 5 ratée : boîte 0");
egal(quand5(34), "aujourd'hui", "la carte 5 ratée revient demain, toujours à l'oreille");
// Avec peine la première fois : boîte 0, le délai repart du jour même.
P.noterMot(`${frio.id}#o`, 2, jour(0));
egal(P.fichesCartes()[`${frio.id}#o`].boite, 0, "carte 5 « Avec peine » la 1re fois : boîte 0");
// Un mot sans phrase à trou n'a pas de carte 5 (Q24-20) ; « Mes mots » non plus.
ok(!C.cartesDuMot(frio, {}).some(c => c.n === C.ORE), "pas de carte 5 sans phrase à trou");
ok(!C.cartesDuMot({ id: "moi|x", moi: true, es: "x", ex: "x" }, {}).some(c => c.n === C.ORE), "pas de carte 5 pour Mes mots");

// ——— la migration des cartes 2 (étape 3, Q26-9, Q26-10) ———
const k2 = `${reunion.id}#2`;
const ancienne = mots => P.lireSauvegarde(JSON.stringify({ appli: "oido-y-boca", le: jour(0), jours: {}, ecoute: 0, mots }));
egal(P.migrerCartes2({ [reunion.id]: { boite: 3, vu: jour(0) }, [k2]: { boite: 2, vu: jour(0), dep: jour(0) } }, jour(5)),
  { [reunion.id]: { boite: 3, vu: jour(0) }, [k5]: { boite: 0, vu: null, dep: jour(5) } }, "une fiche #2 devient une carte 5 en boîte 0, partie le jour de la migration");
egal(P.migrerCartes2({ [k2]: { boite: 4, vu: jour(0) }, [k5]: { boite: 3, vu: jour(1) } }, jour(5)),
  { [k5]: { boite: 3, vu: jour(1) } }, "une carte 5 qui existe déjà est gardée telle quelle (Q26-10)");
const sansDeux = { [reunion.id]: { boite: 1, vu: jour(0) } };
ok(P.migrerCartes2(sansDeux, jour(5)) === sansDeux, "rien à migrer : rien ne change");
P.restaurer(ancienne({ [reunion.id]: { boite: 6, vu: jour(0) }, [k2]: { boite: 3, vu: jour(0) } }));
ok(!P.fichesCartes()[k2] && P.fichesCartes()[k5]?.boite === 0, "restaurer une ancienne sauvegarde : la carte 2 devient une carte 5");
egal(P.fichesCartes()[k5].dep, new Date().toLocaleDateString("sv-SE"), "elle part du jour de la restauration");
// Au lancement : un téléphone qui a encore des fiches #2 les convertit une seule fois.
memoire["oyb.v2"] = JSON.stringify({ mots: { [k2]: { boite: 1, vu: jour(0) } }, jours: {}, ecoute: 0 });
const P2 = await import(`${pathToFileURL(path.join(tmp, "progression.js")).href}?relance`);
ok(P2.fichesCartes()[k5] && !P2.fichesCartes()[k2], "au lancement, la fiche #2 devient une carte 5");
ok(!JSON.parse(memoire["oyb.v2"]).mots[k2], "et le téléphone garde la version convertie");
// Garde-fou : une progression sans carte 2 se relit à l'identique au lancement (rien n'est perdu).
memoire["oyb.v2"] = JSON.stringify({ mots: { [reunion.id]: { boite: 2, vu: jour(0) } }, jours: { [jour(0)]: { revision: 3 } }, ecoute: 2 });
const P3 = await import(`${pathToFileURL(path.join(tmp, "progression.js")).href}?relance2`);
egal(P3.fichesCartes(), { [reunion.id]: { boite: 2, vu: jour(0) } }, "au lancement sans carte 2 : les fiches sont gardées");
egal(P3.niveauEcoute(), 2, "au lancement : le reste de la progression aussi");
// La sauvegarde garde la carte 5.
P.noterMot(k5, 3, jour(30));
const d = JSON.parse(P.donneesSauvegarde(jour(30)));
ok(d.mots[k5], "la carte 5 part dans la sauvegarde");
egal(P.lireSauvegarde(JSON.stringify(d)).etat.mots[k5], d.mots[k5], "et revient à la restauration");

// ——— la file de « Ta journée » (Q24-22) ———
P.cocher(jour(1), "attente", 58); P.cocher(jour(2), "revision", 20); P.cocher(jour(3), "attente", 0);
egal(P.valeurAvant(jour(3), "attente"), 58, "la veille notée (un jour sans chiffre est sauté)");
egal(P.valeurAvant(jour(4), "attente"), 0, "0 compte comme une valeur");
egal(P.valeurAvant(jour(1), "attente"), null, "rien avant");

// ——— « On me comprend ? » (micro.js) : les mots compris, jamais une note ———
const M = await import(path.join(tmp, "micro.js"));
const vert = (phrase, alt) => { const x = M.compris(phrase, alt); return `${x.n}/${x.sur}`; };
const PH = "Este domingo comemos con mi suegro.";
egal(vert(PH, ["este domingo comemos con mi suegro"]), "6/6", "micro : tout compris");
egal(vert(PH, ["este domingo comemos mi suegro"]), "5/6", "micro : « con » avalé");
egal(M.compris(PH, ["este domingo comemos mi suegro"]).liste.filter(x => !x.oui).map(x => x.w), ["con"], "micro : le mot gris est « con »");
egal(vert(PH, ["el domingo como con mi suegra", "este domingo comemos con mi suegro"]), "6/6", "micro : une des 3 versions suffit");
egal(vert("¿Puedes repetir, por favor?", ["puedes repetir por favor"]), "4/4", "micro : ¿ ? et virgule ignorés");
egal(vert("Hace muchos años.", ["hace muchos anos"]), "3/3", "micro : ñ et accents ignorés");
egal(vert(PH, []), "0/6", "micro : rien entendu");
ok(!M.reconnaissancePossible(), "micro : sans navigateur, pas de reconnaissance (l'enregistrement prend le relais)");

// ——— tout le Sheet ———
if (process.argv[2]) {
  const mots = versMots(lireCsv(fs.readFileSync(process.argv[2], "utf8")));
  let refus = 0;
  for (const m of mots) {
    for (const f of O.reponsesMot(m.es)) {
      const r = O.jugerMot(f, m.es);
      if (r.note !== 3) { refus++; console.log("✗ carte 1 refuse sa propre forme :", m.es, "→", f); }
    }
    const t = C.trouDe(m);
    if (t && m.ex) {
      const r = O.jugerOreille(m.ex, m.ex, t.reponse);
      ok(r.note === 3, `carte 5 accepte son propre exemple : ${m.ex}`);
    }
  }
  ok(!refus, "chaque mot accepte sa propre forme écrite");
  console.log(`Carte 1 : ${mots.length} mots, ${mots.filter(m => /\//.test(m.es)).length} avec « / » (une des formes suffit).`);
  console.log(`Carte 5 : ${mots.filter(m => C.trouDe(m)).length} mots en auront une (ceux qui ont une phrase à trou).`);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fautes ? `${fautes} faute(s).` : "Tout est bon.");
process.exit(fautes ? 1 : 0);
