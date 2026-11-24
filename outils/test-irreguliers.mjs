// Vérifie, forme par forme, les verbes irréguliers que l'appli conjugue au présent (controles.js),
// et que chacun a sa leçon dans le Dico (dico.js). Lancer depuis appli/ : node outils/test-irreguliers.mjs
// Les formes attendues sont tapées ici à la main, indépendamment de controles.js.
import fs from "fs";
import os from "os";
import path from "path";

const ATTENDU = {
  ser: ["soy", "eres", "es", "somos", "sois", "son"],
  estar: ["estoy", "estás", "está", "estamos", "estáis", "están"],
  tener: ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
  ir: ["voy", "vas", "va", "vamos", "vais", "van"],
  hacer: ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
  poner: ["pongo", "pones", "pone", "ponemos", "ponéis", "ponen"],
  traer: ["traigo", "traes", "trae", "traemos", "traéis", "traen"],
  dar: ["doy", "das", "da", "damos", "dais", "dan"],
  salir: ["salgo", "sales", "sale", "salimos", "salís", "salen"],
  decir: ["digo", "dices", "dice", "decimos", "decís", "dicen"],
  venir: ["vengo", "vienes", "viene", "venimos", "venís", "vienen"],
  jugar: ["juego", "juegas", "juega", "jugamos", "jugáis", "juegan"],
  // Ajoutés pour les unités 9 à 15 (23 nov.)
  ver: ["veo", "ves", "ve", "vemos", "veis", "ven"],
  enviar: ["envío", "envías", "envía", "enviamos", "enviáis", "envían"],
  recoger: ["recojo", "recoges", "recoge", "recogemos", "recogéis", "recogen"],
  crecer: ["crezco", "creces", "crece", "crecemos", "crecéis", "crecen"],
  conducir: ["conduzco", "conduces", "conduce", "conducimos", "conducís", "conducen"],
  caer: ["caigo", "caes", "cae", "caemos", "caéis", "caen"],
  conocer: ["conozco", "conoces", "conoce", "conocemos", "conocéis", "conocen"],
  saber: ["sé", "sabes", "sabe", "sabemos", "sabéis", "saben"],
  // Les verbes en -se se construisent avec le pronom devant.
  ponerse: ["me pongo", "te pones", "se pone", "nos ponemos", "os ponéis", "se ponen"],
  darse: ["me doy", "te das", "se da", "nos damos", "os dais", "se dan"],
  caerse: ["me caigo", "te caes", "se cae", "nos caemos", "os caéis", "se caen"],
  conocerse: ["me conozco", "te conoces", "se conoce", "nos conocemos", "os conocéis", "se conocen"],
  "freír": ["frío", "fríes", "fríe", "freímos", "freís", "fríen"], // U19-L4 (24 nov.)
};

// controles.js importe ui.js (pour l'affichage) : on le charge sans cet import.
const ici = path.dirname(new URL(import.meta.url).pathname);
const source = fs.readFileSync(path.join(ici, "../controles.js"), "utf8").replace(/^import .*$/m, "const md = x => x;");
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "oyb-")), "controles.mjs");
fs.writeFileSync(tmp, source);
const { conjuguer, irregulierConnu } = await import(tmp);
const dico = fs.readFileSync(path.join(ici, "../dico.js"), "utf8");

let erreurs = 0, formes = 0;
for (const [v, attendu] of Object.entries(ATTENDU)) {
  attendu.forEach((f, p) => {
    formes++;
    const calcule = conjuguer(v, p);
    if (calcule !== f) { erreurs++; console.log(`✗ ${v}, personne ${p} : ${calcule} au lieu de ${f}`); }
  });
  const inf = v.replace(/se$/, "");
  if (!irregulierConnu(inf)) { erreurs++; console.log(`✗ ${inf} n'est pas dans IRREGULIERS`); }
  if (!new RegExp(`(\\b|")${inf}"?: "U\\d+-L\\d+"`).test(dico)) { erreurs++; console.log(`✗ ${inf} n'a pas de leçon dans LECON_IRREGULIER (dico.js)`); }
}
console.log(`${formes} formes vérifiées, ${erreurs} erreur(s).`);
process.exit(erreurs ? 1 : 0);
