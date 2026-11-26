// Vérifie les règles d'une ligne (chantier 18, regles.js) : chaque leçon a ses lignes, une seule version des lignes de verbes,
// le parcours de la maquette (cartes desde hace, el barrio, casarse, tener … años, vivir ; l'exercice raté de U1-L3),
// puis liste chaque carte du Sheet avec sa ligne, livre fini (à relire : une ligne peut tomber sur le mauvais mot).
// Lancer depuis appli/ : node outils/test-regles.mjs [chemin/vers/vocabulaire.csv] [--liste]
// Sans chemin, le test lit l'onglet « Vocabulaire » du Sheet directement.
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-regles-"));
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js"))) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const { VERBES, lignesDe, toutesLesLecons } = await import(path.join(tmp, "regles.js"));
const { REGLES, reglesDuMot, lignesConcernees, verbeDe } = await import(path.join(tmp, "dico.js"));
const { explicationConjugaison } = await import(path.join(tmp, "controles.js"));
const { corriger } = await import(path.join(tmp, "corriger.js"));

const args = process.argv.slice(2);
const chemin = args.find(a => !a.startsWith("--"));
const csv = chemin ? fs.readFileSync(chemin, "utf8")
  : await (await fetch("https://docs.google.com/spreadsheets/d/1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ/gviz/tq?tqx=out:csv&sheet=Vocabulaire")).text();
const mots = versMots(lireCsv(csv));

let erreurs = 0;
const ok = (cond, msg) => { console.log(`${cond ? "✓" : "✗"} ${msg}`); if (!cond) erreurs++; };

// 1. Chaque leçon a au moins une ligne, chaque ligne a un texte.
const lecons = toutesLesLecons();
const vides = lecons.filter(l => !lignesDe(l).length || lignesDe(l).some(x => !x.texte));
ok(!vides.length, `${lecons.length} leçons, ${lecons.reduce((n, l) => n + lignesDe(l).length, 0)} lignes${vides.length ? ` ; sans ligne : ${vides.join(", ")}` : ""}.`);

// 2. Une seule version : la ligne des -ir du Dico, de la leçon et de l'explication de conjugaison.
ok(Object.keys(VERBES).every(k => REGLES[k].texte === VERBES[k].texte), "Le Dico prend les lignes des verbes de regles.js.");
ok(lignesDe("U1-L3")[0].texte === VERBES.ir.texte, "U1-L3 commence par la ligne des -ir du Dico (la version du prof).");
ok(explicationConjugaison("vivir", 3).includes(VERBES.ir.texte), "« Nosotros ___ (vivir) » explique avec la même ligne des -ir.");
ok(explicationConjugaison("hablar", 0).includes(VERBES.ar.texte), "« hablar, avec yo » explique avec la ligne des -ar.");

// 3. Le parcours de la maquette, après U1-L3.
const faites = new Set(["U1-L1", "U1-L2", "U1-L3"]);
const carte = es => mots.find(m => m.es === es);
const textes = es => reglesDuMot(carte(es), faites).map(r => `${r.etiquette} : ${r.texte}`);
ok(!textes("el barrio").length, "el barrio : pas de ligne.");
ok(textes("desde hace").length === 1 && textes("desde hace")[0].startsWith("La règle · U1-L3 : **desde hace**"), `desde hace : ${textes("desde hace")[0]}`);
ok(textes("casarse").length === 1 && textes("casarse")[0].startsWith("La règle · U1-L1 : Les verbes en **‑ar**"), `casarse (U3-L1 pas faite, pas de ligne -se) : ${textes("casarse").join(" | ")}`);
ok(textes("tener … años")[0]?.startsWith("Verbe irrégulier : *Yo* est irrégulier : **tengo**"), `tener … años : ${textes("tener … años")[0]}`);
ok(textes("vivir")[0]?.startsWith("La règle · U1-L3 : Les verbes en **‑ir**"), `vivir : ${textes("vivir")[0]}`);
ok(!textes("comer").length, "comer, avant U1-L5 : pas de ligne (la leçon des -er n'est pas faite).");

// 4. L'exercice raté de U1-L3 : seulement la ligne des mots ratés.
const juste = "Vivo en Huesca desde hace cinco años.";
const rate = tape => lignesConcernees("U1-L3", corriger(tape, [juste]).reponse || []).map(x => x.texte.slice(0, 18));
ok(JSON.stringify(rate("Vivo en Huesca durante cinco años")) === JSON.stringify(["**desde hace** + u"]), `« …durante cinco años » → ${rate("Vivo en Huesca durante cinco años").join(" | ")}`);
ok(rate("Vivo a Huesca durante cinco años").length === 2, `« Vivo a Huesca durante… » → ${rate("Vivo a Huesca durante cinco años").join(" | ")}`);
ok(rate("Vivimos en Huesca desde hace cinco años").length === 1, `« Vivimos en Huesca… » → ${rate("Vivimos en Huesca desde hace cinco años").join(" | ")}`);
ok(!lignesConcernees("U1-L3", corriger("Huesca es una ciudad grande", ["Huesca es una ciudad pequeña."]).reponse).length, "« …ciudad grande » : aucune ligne.");

// 5. La relecture : coupes de U21-L1 et U21-L5, fautes du livre, cartes qui ne prennent pas une ligne par le mot seul.
const tout = new Set(lecons);
ok(lignesDe("U21-L1").some(x => x.texte.startsWith("**es que + phrase**")), "U21-L1 : « es que » a sa propre ligne.");
ok(lignesDe("U21-L5").length > 1, `U21-L5 coupée malgré « 1) 2) 3) » : ${lignesDe("U21-L5").length} lignes.`);
ok(lignesDe("U16-L5")[0].texte.includes("mêmes terminaisons") && lignesDe("U20-L2").some(x => x.texte.includes("Deux formes spéciales")), "U16-L5 et U20-L2 : fautes du livre corrigées.");
const dans = (es, l) => carte(es) && reglesDuMot(carte(es), tout).some(x => x.etiquette.endsWith(l));
ok(carte("vaya") && !dans("vaya", "U22-L1"), "¡vaya! : pas la ligne du subjonctif (U22-L1).");
ok(carte("claro") && !dans("claro", "U17-L4"), "claro : pas « No, claro » seul (U17-L4).");
ok(carte("nada") && !dans("nada", "U21-L3"), "nada : pas la prononciation na' (U21-L3).");
ok(reglesDuMot(carte("es que") || { es: "es que" }, tout).some(x => x.texte.startsWith("**es que")), `es que : ${reglesDuMot(carte("es que") || { es: "es que" }, tout)[0]?.texte.slice(0, 30)}`);

// 6. Chaque carte avec sa ligne, livre fini.
const avec = mots.map(m => ({ m, r: reglesDuMot(m, tout) })).filter(x => x.r.length);
const verbes = avec.filter(x => verbeDe(x.m)).length;
console.log(`\n${avec.length} cartes sur ${mots.length} ont une ligne, livre fini (${verbes} verbes, ${avec.length - verbes} autres mots).`);
if (args.includes("--liste")) for (const { m, r } of avec.filter(x => !verbeDe(x.m))) console.log(`  ${m.lecon}  ${m.es}  ←  ${r.map(x => `${x.etiquette} : ${x.texte}`).join("  |  ")}`);

console.log(erreurs ? `\n${erreurs} erreur(s).` : "\nTout est bon.");
process.exit(erreurs ? 1 : 0);
