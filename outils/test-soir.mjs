// Vérifie le soir avec Blanca (chantiers 9 et 20) : la lecture de l'onglet « Soir » avec ou sans les colonnes
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
const { versSoir, lireReto, tirerPregunta, tirerRepaso, ligneSoir, COLONNES_SOIRS } = await import(path.join(tmp, "donnees.js"));

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

// 5. Le soir de révision
const tout = {};
const types = ["Mímica", "Con prisa", "Ni sí ni no", "Verdad o mentira", "Completa la frase", "Mímica"];
["L1", "L2", "L3", "L4", "L5", "L6"].forEach((l, i) => {
  tout[l] = { questions: [`${l}a`, `${l}b`, `${l}c`, `${l}d`], reto: `${types[i]}: consigne ${l}`, kevin: `grammaire ${l} ; autre` };
});
const fait6 = new Set(["L1", "L2", "L3", "L4", "L5", "L6"]);
const r1 = tirerRepaso(tout, fait6, "L6", "2026-11-26");
verifier("4 questions", r1.questions.length, 4);
verifier("4 leçons différentes, pas la dernière, dans l'ordre", r1.questions.map(q => q.lecon).filter((l, i, t) => t.indexOf(l) === i && l !== "L6").length, 4);
verifier("dans l'ordre du livre", r1.questions.map(q => q.lecon), [...r1.questions.map(q => q.lecon)].sort());
verifier("la question vient de sa leçon", r1.questions.every(q => q.question.startsWith(q.lecon)), true);
verifier("le même tirage toute la soirée", tirerRepaso(tout, fait6, "L6", "2026-11-26"), r1);
let differents = 0;
for (let d = 1; d <= 20; d++) {
  const j = `2026-12-${String(d).padStart(2, "0")}`;
  const r = tirerRepaso(tout, fait6, "L6", j);
  if (JSON.stringify(r.questions) !== JSON.stringify(r1.questions)) differents++;
  if (r.reto.reto.nom === "Mímica") verifier(`${j} : pas le défi de la veille (Mímica)`, r.reto.reto.nom, "autre");
}
verifier("un autre tirage les autres jours", differents >= 15, true);
verifier("Kevin : 1re ligne de grammaire de chaque leçon", r1.kevin.map(k => k.texte), r1.questions.map(q => `grammaire ${q.lecon}`));
verifier("moins de 4 autres leçons : pas de révision", tirerRepaso(tout, new Set(["L1", "L2", "L3", "L4"]), "L4", "2026-11-26"), null);

// 6. Chantier 20 : la question ouverte et ses mots d'aide
const ouvert = versSoir([
  ["leçon", "misión", "pregunta 1", "pregunta 2", "pregunta 3", "para Kevin", "pregunta 4", "reto", "Pregunta abierta", "ayuda"],
  ["U1-L4", "M", "a", "b", "c", "n", "d", "", "Cuéntame tu día", "estoy en mi despacho;  tengo una reunión ; "],
  ["U1-L5", "M", "a", "b", "c", "n", "d", "", "", ""],
]);
verifier("la question ouverte", ouvert["U1-L4"].abierta, "Cuéntame tu día");
verifier("les mots d'aide, coupés au « ; »", ouvert["U1-L4"].ayuda, ["estoy en mi despacho", "tengo una reunión"]);
verifier("pas de question ouverte : vide", [ouvert["U1-L5"].abierta, ouvert["U1-L5"].ayuda], ["", []]);
verifier("ancien Sheet : pas de question ouverte", [ancien["U1-L1"].abierta, ancien["U1-L1"].ayuda], ["", []]);
verifier("la question ouverte ne compte pas dans les 4 questions", ouvert["U1-L4"].questions, ["a", "b", "c", "d"]);

// Le soir de révision prend la question ouverte d'une des 4 leçons tirées, et ne change pas le reste du tirage.
const avecOuvertes = Object.fromEntries(Object.entries(tout).map(([l, s]) => [l, { ...s, abierta: `ouverte ${l}`, ayuda: [`aide ${l}`] }]));
const r2 = tirerRepaso(avecOuvertes, fait6, "L6", "2026-11-26");
verifier("révision : mêmes questions qu'avant", r2.questions, r1.questions);
verifier("révision : même défi qu'avant", r2.reto, r1.reto);
verifier("révision : la question ouverte vient d'une leçon tirée", r1.questions.some(q => q.lecon === r2.abierta.lecon) && r2.abierta.texte === `ouverte ${r2.abierta.lecon}`, true);
verifier("révision : ses mots d'aide", r2.abierta.ayuda, [`aide ${r2.abierta.lecon}`]);
verifier("révision sans questions ouvertes : null", r1.abierta, null);

// 7. La ligne de l'onglet « Soirs »
verifier("9 colonnes", COLONNES_SOIRS.length, 9);
verifier("pas de soir : pas de ligne", ligneSoir("2026-11-27", { ecoute: true }), null);
verifier("soir coché sans nota", ligneSoir("2026-11-27", { soir: true, soirLecon: "U1-L4" }), ["2026-11-27", "U1-L4", "", "", "", "", "", "", "no"]);
const nota = { lecon: "U1-L4", guardada: true, bien: "Habla sin francés", error: "es en casa → está en casa", mejora: "Se bloquea con los números", comida: "Un poco",
  notas: [{ t: "bien", txt: "estoy cansado", ou: "1" }, { t: "err", txt: "a Huesca → en Huesca", ou: "2" }, { t: "bien", txt: "trabajo desde casa", ou: "abierta" }] };
verifier("la nota complète", ligneSoir("2026-11-27", { soir: true, ecoute: true, nota }),
  ["2026-11-27", "U1-L4", "estoy cansado | trabajo desde casa", "a Huesca → en Huesca", "Habla sin francés", "es en casa → está en casa", "Se bloquea con los números", "Un poco", "sí"]);
verifier("des notes prises, soir pas encore gardé : une ligne quand même", ligneSoir("2026-11-27", { nota: { notas: [{ t: "err", txt: "x" }] } })?.[3], "x");

console.log(fautes ? `\n${fautes} faute(s)` : "✓ Le soir : tout est bon");
process.exit(fautes ? 1 : 0);
