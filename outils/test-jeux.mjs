// Vérifie le moteur des jeux (jeux.js) sur le vrai vocabulaire du Sheet, à chaque étape du livre :
// 4 réponses différentes dont une seule juste, jamais deux fois le même sens, la même catégorie quand il y en a assez,
// une pioche sans répétition, les paquets, les points, les records et les trophées.
// Lancer depuis appli/ : node outils/test-jeux.mjs chemin/vers/vocabulaire.csv
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-jeux-"));
for (const f of ["jeux.js", "donnees.js", "livre.js"]) fs.copyFileSync(path.join(racine, f), path.join(tmp, f));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const J = await import(path.join(tmp, "jeux.js"));
const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const { PARTIES } = await import(path.join(tmp, "livre.js"));
const UNITES = PARTIES.flatMap(p => p.unites);
const LECONS = UNITES.flatMap(u => u.lecons.map(l => l.id));

const csv = process.argv[2];
if (!csv) { console.error("Donne le CSV du vocabulaire."); process.exit(1); }
const mots = versMots(lireCsv(fs.readFileSync(csv, "utf8")));
let erreurs = 0;
const faux = (...t) => { erreurs++; console.log("✗", ...t); };
const egal = (nom, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) faux(nom, "obtenu", JSON.stringify(a), "attendu", JSON.stringify(b)); };

// Un hasard qu'on peut rejouer.
const graine = g => () => ((g = (g * 1664525 + 1013904223) >>> 0) / 4294967296);
const sens = m => J.court(m.fr).toLowerCase();

// 1. À chaque étape du livre (après chaque leçon) : les mots connus, les paquets, et toutes les questions possibles.
let questions = 0, memeCategorie = 0, possibles = 0, premierJeu = "";
for (let n = 1; n <= LECONS.length; n++) {
  const faites = new Set(LECONS.slice(0, n));
  const dateFaite = Object.fromEntries(LECONS.slice(0, n).map((l, i) => [l, `2026-${String(1 + Math.floor(i / 28)).padStart(2, "0")}-${String(1 + i % 28).padStart(2, "0")}`]));
  const connus = J.motsConnus({ mots, faites, dateFaite });
  if (connus.some(m => !faites.has(m.lecon))) faux(`après ${LECONS[n - 1]} : un mot d'une leçon pas faite`);
  const liste = J.paquets(connus, UNITES, faites);
  if (liste[0].ouvert !== connus.length >= J.SEUIL) faux(`après ${LECONS[n - 1]} : « Tout » ouvert à tort ou fermé à tort`);
  if (liste[0].ouvert && !premierJeu) premierJeu = `${LECONS[n - 1]} (${connus.length} mots)`;
  if (liste.filter(p => !p.ouvert && p.titre).length > 1) faux(`après ${LECONS[n - 1]} : plus d'une unité fermée affichée`);
  for (const p of liste.filter(p => p.ouvert)) {
    if (p.mots.length < J.SEUIL) faux(`après ${LECONS[n - 1]} : paquet ${p.id} ouvert avec ${p.mots.length} mots`);
    if (p.titre && p.mots.some(m => !m.lecon.startsWith(p.id + "-"))) faux(`paquet ${p.id} : un mot d'une autre unité`);
    // Toutes les questions du paquet, seulement aux étapes utiles (sinon 142 × 800 questions à chaque fois).
    if (n > 12 && n % 12 && n !== LECONS.length) continue;
    const h = graine(n * 7 + p.mots.length);
    for (const mot of p.mots) {
      const q = J.question(mot, p.mots, h);
      questions++;
      if (q.reponses.length !== 4) faux(`${p.id} · ${mot.es} : ${q.reponses.length} réponses`);
      if (q.reponses.filter(r => r.juste).length !== 1) faux(`${p.id} · ${mot.es} : pas une seule bonne réponse`);
      if (new Set(q.reponses.map(r => r.texte.toLowerCase())).size !== q.reponses.length) faux(`${p.id} · ${mot.es} : deux fois le même sens`, q.reponses.map(r => r.texte));
      if (q.reponses.some(r => !r.texte)) faux(`${p.id} · ${mot.es} : une réponse vide`);
      const cat = (mot.categorie || "").toLowerCase();
      const dispo = new Set(p.mots.filter(m => m !== mot && (m.categorie || "").toLowerCase() === cat && sens(m) !== sens(mot)).map(sens)).size;
      const eues = q.reponses.filter(r => !r.juste && (r.mot.categorie || "").toLowerCase() === cat).length;
      if (eues !== Math.min(3, dispo)) faux(`${p.id} · ${mot.es} : ${eues} fausses réponses de la même catégorie, ${dispo} possibles`);
      possibles++; if (eues === 3) memeCategorie++;
    }
  }
}
console.log(`${questions} questions vérifiées. Le jeu ouvre après ${premierJeu}. Les 3 fausses réponses sont de la même catégorie dans ${Math.round(memeCategorie / possibles * 100)} % des cas.`);

// 2. ser et estar (« être ») ne sont jamais proposés ensemble.
const u1 = mots.filter(m => m.lecon.startsWith("U1-"));
const ser = u1.find(m => m.es === "ser"), estar = u1.find(m => m.es === "estar");
if (ser && estar) for (let g = 1; g < 200; g++) {
  if (J.fausses(ser, u1, graine(g)).includes(estar)) faux("estar proposé comme fausse réponse de ser");
}
egal("court : parenthèses retirées", J.court("le bureau (la pièce)"), "le bureau");
egal("court : rien d'autre ne change", J.court("vivre, habiter"), "vivre, habiter");

// 3. Mes mots et les mots appris en avance comptent ; un doublon ne compte qu'une fois ; les derniers appris sont à la fin.
{
  const faites = new Set(["U1-L1", "U1-L2"]);
  const aMoi = [{ id: "moi-1", es: "el paraguas", fr: "le parapluie", le: "2026-11-25", moi: true }, { id: "moi-2", es: "Hablar", fr: "parler", le: "2026-11-25", moi: true }];
  const enAvance = mots.find(m => m.lecon === "U3-L1");
  const connus = J.motsConnus({ mots, faites, dateFaite: { "U1-L1": "2026-11-23", "U1-L2": "2026-11-24" }, avance: id => id === enAvance.id ? "2026-11-24" : "", aMoi });
  egal("12 mots du livre + 1 en avance + 1 à moi (hablar en double écarté)", connus.length, 14);
  egal("le dernier appris est à la fin", connus.at(-1).es, "el paraguas");
  egal("les mots de U1-L1 d'abord", connus[0].lecon, "U1-L1");
  const q = J.question(aMoi[0], connus, graine(3));
  egal("un mot à moi (sans catégorie) a quand même 4 réponses", q.reponses.length, 4);
}

// 4. La pioche : tout le paquet passe avant qu'un mot revienne, et jamais deux fois de suite le même.
{
  const paquet = mots.slice(0, 15), tirer = J.creerPioche(paquet, graine(5));
  const tires = Array.from({ length: 60 }, tirer);
  for (let i = 0; i < 60; i += 15) if (new Set(tires.slice(i, i + 15)).size !== 15) faux("la pioche répète un mot avant d'avoir tout passé");
  if (tires.some((m, i) => i && m === tires[i - 1])) faux("la pioche donne deux fois de suite le même mot");
}

// 5. Les points : ×1, ×2 à 3 de suite, ×3 à 6, ×5 à 10.
egal("multi", [0, 2, 3, 5, 6, 9, 10, 25].map(J.multi), [1, 1, 2, 2, 3, 3, 5, 5]);
egal("points", [1, 3, 6, 10].map(J.points), [10, 20, 30, 50]);
egal("taille de la mascotte", [0, 3, 6, 10].map(J.taille), [0, 1, 2, 3]);
egal("pions", [J.pions(0), J.pions(2), J.pions(4), J.pions(8), J.pions(12)], [{ pleins: 0, sur: 3 }, { pleins: 2, sur: 3 }, { pleins: 1, sur: 3 }, { pleins: 2, sur: 4 }, { pleins: 0, sur: 0 }]);

// 6. Les records (un par paquet), les compteurs et les trophées.
{
  let r = J.apresPartie(undefined, { jeu: "montre", paquet: "tout", score: 160, ok: 12, ko: 2, serie: 5, trouves: ["a", "b", "a"] }, "2026-11-25");
  egal("première partie : record et ampoule", [r.record, r.ancien, r.ampoule], [true, 0, true]);
  egal("première partie : trophées", r.trophees.map(t => t.id), ["premier", "bronze"]);
  egal("un mot ne compte qu'une fois par partie", r.jeux.fois, { a: 1, b: 1 });
  r = J.apresPartie(r.jeux, { jeu: "montre", paquet: "U1", score: 90, ok: 9, ko: 0, serie: 9, trouves: ["a"] }, "2026-11-25");
  egal("un autre paquet a son propre record", [r.record, r.jeux.records], [true, { "montre:tout": 160, "montre:U1": 90 }]);
  egal("pas de trophée deux fois, pas d'ampoule deux fois le même jour", [r.trophees.map(t => t.id), r.ampoule, r.jeux.jours], [[], false, ["2026-11-25"]]);
  egal("le mot trouvé dans 2 parties", r.jeux.fois.a, 2);
  r = J.apresPartie(r.jeux, { jeu: "montre", paquet: "tout", score: 150, ok: 15, ko: 0, serie: 15, trouves: [] }, "2026-11-27");
  egal("score plus bas : pas de record", [r.record, r.ancien, r.jeux.records["montre:tout"]], [false, 160, 160]);
  egal("¡Fuego! et Sans faute", r.trophees.map(t => t.id), ["fuego", "sansfaute"]);
  egal("le cumul", [r.jeux.trouves, r.jeux.parties, r.jeux.meilleur, r.jeux.serie, r.jeux.sansFaute], [36, 3, 160, 15, true]);
  r = J.apresPartie({ ...r.jeux, trouves: 95 }, { jeu: "montre", paquet: "tout", score: 0, ok: 5, ko: 9, serie: 1 }, "2026-11-28");
  egal("100 mots trouvés en tout", r.trophees.map(t => t.id), ["cent"]);
  egal("une partie à 0 point ne bat pas un record", r.record, false);
  egal("la date du trophée", r.jeux.trophees.cent, "2026-11-28");
}

// 7. Le premier lot sans trophées : les compteurs sont tenus, et tout est donné d'un coup quand les trophées arrivent.
{
  let r = J.apresPartie(undefined, { jeu: "montre", paquet: "tout", score: 320, ok: 18, ko: 0, serie: 12, trouves: [] }, "2026-11-25", { trophees: false });
  egal("sans trophées : rien de donné", [r.trophees, r.jeux.trophees], [[], {}]);
  r = J.apresPartie(r.jeux, { jeu: "montre", paquet: "tout", score: 20, ok: 2, ko: 5, serie: 1, trouves: [] }, "2026-12-02");
  egal("les trophées arrivent avec ce qui a été joué avant", r.trophees.map(t => t.id), ["premier", "bronze", "argent", "fuego", "sansfaute"]);
  // Une ancienne sauvegarde sans les nouveaux champs ne casse rien.
  r = J.apresPartie({ records: { "montre:tout": 50 }, muet: true }, { jeu: "montre", paquet: "tout", score: 60, ok: 6, ko: 1, serie: 3, trouves: ["x"] }, "2026-12-03");
  egal("ancienne sauvegarde", [r.record, r.jeux.muet, r.jeux.fois, r.jeux.jours], [true, true, { x: 1 }, ["2026-12-03"]]);
}

// 8. La guirlande : du lundi au dimanche, repart le lundi, garde la meilleure semaine.
{
  const jours = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-20", "2026-11-23", "2026-11-25"];
  const s = J.semaine(jours, "2026-11-25"); // un mercredi
  egal("la semaine en cours", s.ampoules, [true, false, true, false, false, false, false]);
  egal("aujourd'hui, le compte, la meilleure semaine", [s.auj, s.n, s.meilleure], [2, 2, 4]);
  egal("le lundi suivant : tout est éteint", J.semaine(jours, "2026-11-30").ampoules, Array(7).fill(false));
  egal("un dimanche est le 7e jour de sa semaine", [J.semaine(["2026-11-29"], "2026-11-29").auj, J.semaine(["2026-11-29"], "2026-11-29").ampoules[6]], [6, true]);
  egal("jamais joué", [J.semaine(undefined, "2026-11-25").n, J.semaine([], "2026-11-25").meilleure], [0, 0]);
}

console.log(erreurs ? `${erreurs} erreur(s).` : "Tout est bon.");
process.exit(erreurs ? 1 : 0);
