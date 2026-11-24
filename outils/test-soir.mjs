// Vérifie le soir avec Blanca (chantier 9) : la lecture de l'onglet « Soir » avec ou sans les colonnes
// « pregunta 4 » et « reto » (ancienne copie hors ligne), le découpage du défi « Nom: consigne »,
// et le tirage de « Otra pregunta » (leçons faites seulement, pas celle du soir, pas deux fois de suite).
// Lancer depuis appli/ : node outils/test-soir.mjs
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-soir-"));
fs.copyFileSync(path.join(ici, "..", "donnees.js"), path.join(tmp, "donnees.js"));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const { versSoir, lireReto, tirerPregunta } = await import(path.join(tmp, "donnees.js"));

let fautes = 0;
const verifier = (nom, obtenu, attendu) => {
  const a = JSON.stringify(obtenu), b = JSON.stringify(attendu);
  if (a !== b) { fautes++; console.log(`✗ ${nom}\n   obtenu  : ${a}\n   attendu : ${b}`); }
};

// 1. Avec les 2 nouvelles colonnes (dans un autre ordre, avec des espaces et des majuscules)
const neuf = versSoir([
  ["leçon", "misión", "pregunta 1", "pregunta 2", "pregunta 3", "para Kevin", " Reto ", "Pregunta 4"],
  ["U1-L1", "Misión 1", "a", "b", "c", "note", "Ni sí ni no: Hazle preguntas.", "d"],
  ["U1-L2", "Misión 2", "e", "f", "g", "", "", ""],
]);
verifier("4 questions", neuf["U1-L1"].questions, ["a", "b", "c", "d"]);
verifier("le défi", neuf["U1-L1"].reto, "Ni sí ni no: Hazle preguntas.");
verifier("4e question vide : 3 questions", neuf["U1-L2"].questions, ["e", "f", "g"]);
verifier("défi vide", neuf["U1-L2"].reto, "");

// 2. Sans les colonnes (ancien Sheet) : rien ne casse
const ancien = versSoir([["leçon", "misión", "pregunta 1", "pregunta 2", "pregunta 3", "para Kevin"], ["U1-L1", "M", "a", "b", "c", "n"]]);
verifier("ancien Sheet : 3 questions", ancien["U1-L1"].questions, ["a", "b", "c"]);
verifier("ancien Sheet : pas de défi", lireReto(ancien["U1-L1"].reto), null);
// L'ancienne copie hors ligne (objets déjà lus, sans la clé « reto »)
verifier("ancienne copie : pas de défi", lireReto(undefined), null);

// 3. Le découpage du défi
verifier("nom et consigne", lireReto("Verdad o mentira: Kevin dice 3 frases. Una es mentira."),
  { nom: "Verdad o mentira", consigne: "Kevin dice 3 frases. Una es mentira." });
verifier("consigne avec deux-points", lireReto("Con prisa: (Habla rápido:) «¿Qué te pongo?»"),
  { nom: "Con prisa", consigne: "(Habla rápido:) «¿Qué te pongo?»" });
verifier("sans nom", lireReto("(Habla rápido:) ¿Qué haces?"), { nom: "El reto", consigne: "(Habla rápido:) ¿Qué haces?" });

// 4. « Otra pregunta »
const soir = {
  "U1-L1": { questions: ["q1a", "q1b"] },
  "U1-L2": { questions: ["q2a"] },
  "U1-L3": { questions: ["q3a", "q3b"] },
};
const faites = new Set(["U1-L1", "U1-L2"]);
const tirees = new Set();
for (let i = 0; i < 200; i++) {
  const t = tirerPregunta(soir, faites, "U1-L2");
  tirees.add(`${t.lecon} ${t.question}`);
}
verifier("seulement les leçons faites, pas celle du soir", [...tirees].sort(), ["U1-L1 q1a", "U1-L1 q1b"]);
verifier("pas deux fois la même de suite", tirerPregunta(soir, faites, "U1-L2", "q1a", () => 0), { lecon: "U1-L1", question: "q1b" });
verifier("première leçon : rien à tirer", tirerPregunta(soir, new Set(["U1-L1"]), "U1-L1"), null);
verifier("une seule question possible : on la garde", tirerPregunta(soir, new Set(["U1-L2", "U1-L3"]), "U1-L3", "q2a"), { lecon: "U1-L2", question: "q2a" });

console.log(fautes ? `\n${fautes} faute(s)` : "✓ Le soir : tout est bon");
process.exit(fautes ? 1 : 0);
