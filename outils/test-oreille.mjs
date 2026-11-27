// Vérifie le chantier 24 (APPLI.md, point 8 duodecies) :
//   - la carte 1 qu'on écrit (jugerMot) : juste, accents, article oublié, mauvais article, « / », parenthèses, « … », indice ;
//   - la carte 5 « à l'oreille » (jugerOreille) : accents et ñ ne comptent pas, 1 petit mot ou 1 erreur = Avec peine,
//     2 erreurs ou le mot de la carte = Non, indice ;
//   - le rythme : la carte 2 réussie au rendez-vous des 7 jours laisse sa place à la 5, 14 jours plus tard ; la 5 réussie
//     revient à 7, 14, 30, 60 jours ; ratée, elle reste une dictée ; les anciennes sauvegardes ; la sauvegarde ;
//   - la file de « Ta journée » (valeurAvant).
// Lancer depuis appli/ : node outils/test-oreille.mjs [chemin/vers/vocabulaire.csv]
// Avec un CSV (l'onglet Vocabulaire), il vérifie aussi que chaque mot accepte sa propre forme écrite, et liste les mots à « / ».
import fs from "fs";
import os from "os";
import path from "path";

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
const k2 = C.cleCarte(reunion.id, 2), k5 = C.cleCarte(reunion.id, C.ORE);
// Quand vient la carte 5, d'après sa propre fiche (la carte 1 du mot peut tomber le même jour et passer devant).
const quand5 = n => C.etatCarte(C.cartesDuMot(reunion, P.fichesCartes()).find(c => c.n === C.ORE), reunion, jour(n), depart, P.fichesCartes()).texte.replace(/^revient /, "");
egal(k5, `${reunion.id}#o`, "la carte 5 a sa propre clé");
egal(C.nbCartes(reunion), 2, "la carte 5 ne s'ajoute pas au compte (elle remplace la 2)");
// Carte 1 : jours 1 et 4 Oui → boîte 2 ; jour 7 Oui → boîte 3 → la carte 2 naît.
P.noterMot(reunion.id, 3, jour(1)); P.noterMot(reunion.id, 3, jour(4)); P.noterMot(reunion.id, 3, jour(7));
egal(dueN(8), 2, "la carte 2 arrive");
// Carte 2 : jours 8 (→1), 9 (→2), 12 (→3), 19 (→4 : réussie au rendez-vous des 7 jours).
for (const j of [8, 9, 12]) P.noterMot(k2, 3, jour(j));
egal(C.cartesDuMot(reunion, P.fichesCartes()).find(c => c.n === C.ORE).la, false, "pas de carte 5 avant le rendez-vous des 7 jours");
egal(C.etatCarte(C.cartesDuMot(reunion, P.fichesCartes()).find(c => c.n === 2), reunion, jour(19), depart, P.fichesCartes()).texte, "revient aujourd'hui", "jour 19 : la carte 2 au rendez-vous des 7 jours");
P.noterMot(k2, 3, jour(19));
const apres = C.cartesDuMot(reunion, P.fichesCartes());
ok(apres.find(c => c.n === 2).remplacee && !apres.find(c => c.n === 2).la, "la carte 2 réussie à 7 jours est remplacée");
ok(apres.find(c => c.n === C.ORE).la, "la carte 5 est là");
egal(quand5(32), "demain", "jour 32 : la carte 5 attend ses 14 jours");
egal(quand5(33), "aujourd'hui", "jour 33 (19 + 14) : la carte 5");
// Le jour 33, la carte 1 n'est pas due (boîte 3, vue le jour 7, revient le 14, puis on la met loin) : c'est bien la 5 qui sort.
for (let k = 0; k < 3; k++) P.noterMot(reunion.id, 3, jour(14));
egal(dueN(33), C.ORE, "jour 33 : la carte 5 sort, pas la 2");
egal(C.etatCarte(apres.find(c => c.n === 2), reunion, jour(20), depart, P.fichesCartes()).texte, "remplacée par la 5", "le Livre dit « remplacée par la 5 »");
egal(C.etatCarte(apres.find(c => c.n === C.ORE), reunion, jour(20), depart, P.fichesCartes()).texte, "dans 13 j", "le Livre dit quand vient la 5");
// La carte 5 réussie la première fois : 7 jours, puis 14, 30, 60.
P.noterMot(k5, 3, jour(33));
egal(P.fichesCartes()[k5].boite, 3, "1re réussite de la carte 5 : boîte 3");
egal(quand5(39), "demain", "pas avant 7 jours");
egal(quand5(40), "aujourd'hui", "la carte 5 revient à 7 jours");
P.noterMot(k5, 3, jour(40)); egal(quand5(53), "demain", "puis 14 jours"); egal(quand5(54), "aujourd'hui", "à 14 jours");
P.noterMot(k5, 3, jour(54)); egal(quand5(84), "aujourd'hui", "puis à 30 jours");
P.noterMot(k5, 3, jour(84)); egal(quand5(144), "aujourd'hui", "puis à 60 jours");
// Ratée, elle reste une dictée : demain, et la carte 2 ne revient pas.
P.noterMot(k5, 1, jour(144));
egal(quand5(145), "aujourd'hui", "la carte 5 ratée revient demain, toujours à l'oreille");
ok(!C.cartesDuMot(reunion, P.fichesCartes()).find(c => c.n === 2).la, "la carte 2 ne revient pas");
// Avec peine la première fois : même rendez-vous (boîte 2, 3 jours).
P.noterMot(`${frio.id}#o`, 2, jour(0));
egal(P.fichesCartes()[`${frio.id}#o`].boite, 2, "carte 5 « Avec peine » la 1re fois : boîte 2");
// Un mot sans phrase à trou n'a pas de carte 5 (Q24-20) ; « Mes mots » non plus.
ok(!C.cartesDuMot(frio, {}).some(c => c.n === C.ORE), "pas de carte 5 sans phrase à trou");
ok(!C.cartesDuMot({ id: "moi|x", moi: true, es: "x", ex: "x" }, {}).some(c => c.n === C.ORE), "pas de carte 5 pour Mes mots");

// ——— les anciennes sauvegardes (Q24-19) ———
const ancienne = (boite2, vu2) => P.lireSauvegarde(JSON.stringify({ appli: "oido-y-boca", le: jour(0), jours: {}, ecoute: 0,
  mots: { [reunion.id]: { boite: 6, vu: jour(0) }, [k2]: { boite: boite2, vu: vu2 } } }));
P.restaurer(ancienne(3, jour(0)));
egal(dueN(7), 2, "ancienne sauvegarde, carte 2 en boîte 3 : elle reste une carte 2");
P.restaurer(ancienne(4, jour(0)));
egal(dueN(13), null, "ancienne sauvegarde, carte 2 en boîte 4 : rien avant sa date");
egal(dueN(14), C.ORE, "ancienne sauvegarde, carte 2 en boîte 4 : la carte 5 à sa date (14 jours)");
P.restaurer(ancienne(5, jour(0)));
egal(dueN(29), null, "ancienne sauvegarde, carte 2 en boîte 5 : pas avant 30 jours");
egal(dueN(30), C.ORE, "ancienne sauvegarde, carte 2 en boîte 5 : la carte 5 à 30 jours");
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
