// Vérifie les règles de l'étape 2 (décisions du 28 nov.) : « Je ne sais pas » après 5 s,
// « Dis-le / Dis-la / Dis-les deux fois », et la durée du compte (2 × la voix + 2 s ; sans voix, 0,5 s par mot).
// Lancer depuis appli/ : node outils/test-apres-erreur.mjs
import { SAIS_PAS_APRES, aDire, pronom, dureeEstimee, dureeCompte, blocDeuxFois, boutonSaisPas } from "../apres-erreur.js";
import { readFileSync } from "node:fs";

let fautes = 0;
const egal = (vu, attendu, quoi) => {
  if (JSON.stringify(vu) !== JSON.stringify(attendu)) { fautes++; console.log(`✗ ${quoi} : ${JSON.stringify(vu)} au lieu de ${JSON.stringify(attendu)}`); }
};

egal(SAIS_PAS_APRES, 5000, "« Je ne sais pas » arrive après 5 s");
egal(pronom("el cuñado"), "le", "un mot : Dis-le");
egal(pronom("tener … años"), "le", "une expression courte : Dis-le");
egal(pronom("Vivo en Huesca desde hace cinco años."), "la", "une phrase : Dis-la");
egal(pronom("Nosotros comemos en casa"), "la", "4 mots sans point : Dis-la");
egal(pronom(["comemos", "coméis"]), "les", "plusieurs formes du tableau : Dis-les");
egal(dureeEstimee("el cuñado"), 1000, "sans voix : 0,5 s par mot");
egal(dureeEstimee(["comemos", "coméis", "comen"]), 1500, "sans voix : tous les mots des formes ratées");
egal(dureeCompte(1000), 4000, "un mot (1 s de voix) : environ 4 s");
egal(dureeCompte(4500), 11000, "une phrase (4,5 s de voix) : 10 à 12 s");
egal(dureeCompte(dureeEstimee("el cuñado")), 4000, "sans voix, la même règle : 2 × 1 s + 2 s");
egal(aDire("Nosotros vivimos en un piso. (vivir)"), "Nosotros vivimos en un piso.", "la voix ne dit pas l'aide entre parenthèses");
egal(aDire(["comemos (comer)", "coméis"]), ["comemos", "coméis"], "pareil pour plusieurs formes");
egal(blocDeuxFois("el cuñado").includes("Dis-le deux fois"), true, "le bloc dit « Dis-le deux fois »");
egal(/Je l'ai dit/.test(blocDeuxFois("el cuñado")), false, "pas de bouton « Je l'ai dit »");
egal(boutonSaisPas('data-p="sais-pas"').includes('class="secondaire sais-pas attend"'), true, "le bouton part caché, sa place gardée");

// Tous les « Je ne sais pas » des écrans passent par boutonSaisPas (aucun bouton écrit en dur).
for (const f of ["ecrans/pratique.js", "ecrans/motsencours.js", "ecrans/verbes.js"]) {
  const src = readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
  egal((src.match(/>Je ne sais pas</g) || []).length, 0, `${f} : pas de « Je ne sais pas » écrit en dur`);
  egal(/armerSaisPas\(/.test(src) && /apresErreur\(/.test(src), true, `${f} : le délai et le compte sont branchés`);
}

if (fautes) { console.log(`${fautes} faute(s).`); process.exit(1); }
console.log("Tout est bon.");
