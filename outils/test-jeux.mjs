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

// 9. Les mots attrapés et les couleurs de Chispa.
{
  egal("étapes", [0, 39, 40, 119, 120, 749, 750, 2000].map(n => J.etape(n).nom), ["naranja", "naranja", "roja", "roja", "fucsia", "azul", "arcoíris", "arcoíris"]);
  egal("vers l'étape suivante", [J.etape(20).part, J.etape(800).suivant, J.etape(800).part], [0.5, null, 1]);
  let jeux;
  for (let i = 0; i < 2; i++) jeux = J.apresPartie(jeux, { jeu: "montre", paquet: "tout", score: 10, ok: 1, ko: 0, serie: 1, trouves: ["a", "b"] }, `2026-11-2${i}`).jeux;
  egal("pas encore attrapé à 2 parties", J.attrapes(jeux), 0);
  const r = J.apresPartie(jeux, { jeu: "montre", paquet: "tout", score: 10, ok: 1, ko: 0, serie: 1, trouves: ["a", "a", "c"] }, "2026-11-23");
  egal("attrapé à la 3e partie, une seule fois", [r.attrapes, J.attrapes(r.jeux)], [["a"], 1]);
  const r2 = J.apresPartie(r.jeux, { jeu: "montre", paquet: "tout", score: 10, ok: 1, ko: 0, serie: 1, trouves: ["a"] }, "2026-11-24");
  egal("un mot déjà attrapé ne compte pas deux fois", [r2.attrapes, J.attrapes(r2.jeux)], [[], 1]);
  const fois = Object.fromEntries(Array.from({ length: 39 }, (_, i) => [`m${i}`, 3]));
  const r3 = J.apresPartie({ fois: { ...fois, x: 2 } }, { jeu: "montre", paquet: "tout", score: 10, ok: 1, ko: 0, serie: 1, trouves: ["x"] }, "2026-11-25");
  egal("le 40e mot attrapé : Chispa devient roja", [J.attrapes(r3.jeux), r3.mue, J.etape(J.attrapes(r3.jeux)).nom], [40, true, "roja"]);
  egal("pas de mue sans changement d'étape", r2.mue, false);
}

// 10. Le mot surprise, sur le vrai livre.
{
  const faites = new Set(LECONS.slice(0, 6));
  const connus = J.motsConnus({ mots, faites });
  const aVenir = mots.filter(m => !faites.has(m.lecon)).sort((a, b) => LECONS.indexOf(a.lecon) - LECONS.indexOf(b.lecon));
  const jour = "2026-11-25";
  const s1 = J.motSurprise(aVenir, connus, {}, jour, graine(1));
  if (!s1 || faites.has(s1.lecon)) faux("le mot surprise doit venir d'une leçon pas faite", s1?.es);
  else {
    egal("le premier mot de la leçon suivante", s1.lecon, LECONS[6]);
    const q = J.question(s1, connus, graine(2));
    if (q.reponses.filter(r => r.juste).length !== 1 || q.reponses.some(r => !r.juste && !faites.has(r.mot.lecon))) faux("le mot surprise : 3 fausses réponses connues, une seule juste");
    const sens = new Set(connus.map(m => J.court(m.fr).toLowerCase()));
    if (sens.has(J.court(s1.fr).toLowerCase())) faux("le mot surprise a le sens d'un mot connu");
    // Déjà montré aujourd'hui : on passe au suivant.
    const r = J.apresPartie(undefined, { jeu: "montre", paquet: "tout", score: 10, ok: 1, ko: 0, serie: 1, trouves: [], surprise: s1.id }, jour);
    const s2 = J.motSurprise(aVenir, connus, r.jeux, jour, graine(3));
    if (!s2 || s2 === s1) faux("le même mot surprise deux fois le même jour");
    egal("le lendemain, il peut revenir", J.motSurprise(aVenir, connus, r.jeux, "2026-11-26", graine(3))?.id, s1.id);
    // 5 mots gardés (tous jeux confondus) : plus de surprise ce jour-là, mais le lendemain si.
    let g = r.jeux;
    for (let i = 0; i < 4; i++) g = J.garderSurprise(g, jour);
    egal("4 gardés : encore 1", [J.peutSurprendre(g, jour), J.gardesRestants(g, jour)], [true, 1]);
    g = J.garderSurprise(g, jour);
    egal("5 gardés par jour au plus", [J.peutSurprendre(g, jour), J.gardesRestants(g, jour), J.motSurprise(aVenir, connus, g, jour), J.peutSurprendre(g, "2026-11-26")], [false, 0, null, true]);
    egal("garder ne retient que le jour même", J.garderSurprise(g, "2026-11-26").gardes, { "2026-11-26": 1 });
  }
  egal("pas assez de mots : pas de surprise", J.motSurprise(aVenir, connus.slice(0, 5), {}, jour), null);
  egal("plus rien à venir : pas de surprise", J.motSurprise([], connus, {}, jour), null);
}

// 11. La course de verbes, sur la vraie conjugaison de l'appli (controles.js) et les vrais verbes.
{
  const tmpV = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-jeux-verbes-"));
  for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js"))) fs.copyFileSync(path.join(racine, f), path.join(tmpV, f));
  fs.writeFileSync(path.join(tmpV, "package.json"), '{"type":"module"}');
  const memoire = {};
  globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };
  const version = (fs.readFileSync(path.join(racine, "index.html"), "utf8").match(/app\.js\?v=(\d+)/) || [])[1];
  const { conjuguer, TEMPS } = await import(path.join(tmpV, `controles.js?v=${version}`));
  const V = await import(path.join(tmpV, `verbes.js?v=${version}`));
  const toutes = new Set(LECONS);
  const verbes = V.verbesConnus({ mots, pos: { faites: toutes } });
  egal("temps vus au début", J.tempsVus(new Set(["U1-L1"]), TEMPS), ["present"]);
  egal("tous les temps à la fin du livre", J.tempsVus(toutes, TEMPS), ["present", "pc", "ps", "imp"]);
  const temps = J.tempsVus(toutes, TEMPS);
  let n = 0, autreTemps = 0;
  for (const x of verbes) for (let g = 1; g <= 6; g++) {
    const q = J.questionVerbe(x, temps, conjuguer, graine(g * 31 + x.v.length));
    n++;
    if (q.reponses.length !== 3) faux(`${x.v} : ${q.reponses.length} réponses`);
    if (new Set(q.reponses.map(r => r.texte)).size !== q.reponses.length) faux(`${x.v} : deux réponses identiques`);
    if (q.reponses.filter(r => r.juste).length !== 1) faux(`${x.v} : pas une seule bonne réponse`);
    if (q.bonne !== conjuguer(x.v, q.p, x.d, q.t)) faux(`${x.v} : la bonne réponse n'est pas la forme calculée`);
    const formesDuTemps = new Set([0, 1, 2, 3, 4, 5].map(p => conjuguer(x.v, p, x.d, q.t)));
    if (q.reponses.some(r => !r.juste && !formesDuTemps.has(r.texte))) autreTemps++;
  }
  console.log(`Course de verbes : ${verbes.length} verbes, ${n} questions vérifiées ; ${Math.round(autreTemps / n * 100)} % ont une fausse réponse à un autre temps.`);
  // Au présent seulement (le début du livre) : les fausses réponses sont toutes au présent.
  for (const x of verbes.slice(0, 20)) {
    const q = J.questionVerbe(x, ["present"], conjuguer, graine(7));
    const pres = new Set([0, 1, 2, 3, 4, 5].map(p => conjuguer(x.v, p, x.d)));
    if (q.t !== "present" || q.reponses.some(r => !pres.has(r.texte))) faux(`${x.v} : un autre temps alors que seul le présent est vu`);
  }
  const debut = V.mesVerbes({ mots, pos: { faites: new Set(LECONS.slice(0, 2)) } });
  const pq = J.paquetsVerbes(debut, []);
  egal("les paquets de verbes", pq.map(p => [p.id, p.ouvert]), [["tous", debut.length >= J.SEUIL_VERBES], ["cours", false]]);
  console.log(`Après ${LECONS[1]} : ${debut.length} verbes (${debut.map(x => x.v).join(", ")}).`);
}

// 12. Les jeux à deux : les indices, la lettre imposée, les gages, et les 8 thèmes eux-mêmes.
{
  fs.copyFileSync(path.join(racine, "themes.js"), path.join(tmp, "themes.js"));
  const { THEMES, GAGES } = await import(path.join(tmp, "themes.js"));
  egal("indice simple", J.indice("la vaca"), "la   v _ _ _");
  egal("indice à plusieurs mots", J.indice("el oso de peluche"), "el   o _ _   de   p _ _ _ _ _ _");
  egal("indice avec ponctuation", J.indice("¿Truco o trato?"), "¿ _ _ _ _ _   o   t _ _ _ _ ?");
  egal("indice d'un verbe", J.indice("esconderse"), "e _ _ _ _ _ _ _ _ _");
  const ids = Object.keys(THEMES);
  egal("8 thèmes", ids.length, 8);
  for (const [id, t] of Object.entries(THEMES)) {
    if (t.mots.length < 20) faux(`thème ${id} : seulement ${t.mots.length} mots`);
    const vus = new Set();
    for (const m of t.mots) {
      if (!m.es || !m.fr) faux(`thème ${id} : un mot sans espagnol ou sans français`);
      if (vus.has(m.es)) faux(`thème ${id} : ${m.es} en double`);
      vus.add(m.es);
    }
    // La lettre imposée : toujours la première lettre d'un vrai mot du thème, jamais deux fois de suite.
    let avant = "";
    for (let g = 1; g < 40; g++) {
      const l = J.tirerLettre(t.mots, avant, graine(g));
      const ok = t.mots.some(m => m.es.replace(/^[¿¡]/, "").split(" ").some(w => w[0].toUpperCase() === l));
      if (!ok) faux(`thème ${id} : la lettre ${l} ne commence aucun mot`);
      if (l === avant) faux(`thème ${id} : deux fois de suite la lettre ${l}`);
      avant = l;
    }
  }
  // Les gages : la partenaire choisit la liste, {autre} est remplacé par le joueur qui n'a pas perdu.
  const tous = new Set(GAGES.tous);
  for (let g = 1; g < 60; g++) {
    const k = J.tirerGage(GAGES, "Blanca", "Kevin", graine(g));
    if (k.includes("{autre}")) faux("gage : {autre} pas remplacé");
    const d = J.tirerGage(GAGES, "Dorian", "Kevin", graine(g));
    if (GAGES.Blanca.some(x => x.replace(/\{autre\}/g, "Kevin") === d)) faux("un gage de couple tiré en jouant avec Dorian");
    if (!tous.has(d) && !GAGES.Dorian.some(x => x.replace(/\{autre\}/g, "Kevin") === d)) faux("gage inconnu : " + d);
  }
  const t = J.dureeMeche(() => 0), u = J.dureeMeche(() => .999);
  if (t !== 15000 || u > 40000) faux("la mèche doit durer entre 15 et 40 secondes");
}

// 13. La Caseta de tiro : les pièges de l'oreille, les 3 paquets à chaque étape du livre, un mot nouveau sur 5 au plus,
// les niveaux, les points et le record par niveau.
{
  const { PIEGES } = await import(path.join(tmp, "themes.js"));
  const pieges = J.motsPieges(PIEGES);
  egal("28 paires de pièges", PIEGES.length, 28);
  egal("56 mots pièges", pieges.length, 56);
  const MEMES = [["hola", "ola"], ["vaca", "baca"], ["tuvo", "tubo"], ["valla", "vaya"], ["calló", "cayó"], ["haya", "halla"]];
  for (const m of pieges) {
    if (!m.es || !m.fr || !m.famille) faux(`piège ${m.es} : incomplet`);
    if (m.paire.paire !== m) faux(`piège ${m.es} : son jumeau ne le connaît pas`);
    if (m.es === m.paire.es) faux(`piège ${m.es} : le même mot deux fois`);
    if (J.court(m.fr) === J.court(m.paire.fr)) faux(`piège ${m.es} : le même sens que son jumeau`);
    if (MEMES.some(([a, b]) => [a, b].includes(m.es) && [a, b].includes(m.paire.es))) faux(`piège ${m.es} / ${m.paire.es} : ils sonnent exactement pareil`);
    if (!m.piege || !m.id.startsWith("piege:")) faux(`piège ${m.es} : mal marqué`);
  }
  egal("des identifiants uniques", new Set(pieges.map(m => m.id)).size, pieges.length);
  let premier = "";
  for (let n = 1; n <= LECONS.length; n++) {
    const faites = new Set(LECONS.slice(0, n));
    const connus = J.motsConnus({ mots, faites });
    const aVenir = mots.filter(m => !faites.has(m.lecon));
    const [tout, suite, pq] = J.paquetsCaseta(connus, aVenir, pieges);
    if (tout.ouvert !== connus.length >= J.SEUIL) faux(`après ${LECONS[n - 1]} : « Tout » ouvert à tort`);
    if (!pq.ouvert) faux("les pièges doivent toujours être ouverts");
    const nouveaux = suite.mots.filter(m => m.nouveau);
    if (nouveaux.length > J.SUITE_CASETA) faux(`après ${LECONS[n - 1]} : trop de mots nouveaux`);
    if (nouveaux.some(m => faites.has(m.lecon))) faux(`après ${LECONS[n - 1]} : un mot « nouveau » déjà vu`);
    const sens = suite.mots.map(m => J.court(m.fr).toLowerCase());
    const sensNouveaux = nouveaux.map(m => J.court(m.fr).toLowerCase());
    if (sensNouveaux.some(k => sens.filter(x => x === k).length > 1)) faux(`après ${LECONS[n - 1]} : un mot nouveau a le même sens qu'un autre`);
    if (suite.ouvert && !premier) premier = `${LECONS[n - 1]} (${connus.length} mots + ${nouveaux.length} nouveaux)`;
    if (connus.some(m => m.nouveau)) faux("les mots du livre ne doivent pas être marqués nouveaux");
  }
  console.log(`Caseta : « la suite du livre » s'ouvre après ${premier}.`);
  // Un mot nouveau sur 5 au plus : même en en prenant un dès que c'est permis.
  let entendus = 0, nouv = 0;
  for (let i = 0; i < 200; i++) { if (J.nouveauPermis(entendus, nouv)) nouv++; entendus++; if (nouv * J.UN_NOUVEAU_SUR > entendus) faux(`un mot nouveau sur 5 dépassé : ${nouv} sur ${entendus}`); }
  egal("40 mots nouveaux sur 200", nouv, 40);
  egal("jamais un mot nouveau en premier", J.nouveauPermis(0, 0), false);
  // Les pièges : toujours avec leur paquet ; en Experto, environ 4 fois sur 10 ; jamais en Tranquilo et Normal.
  let n = 0; const h = graine(7);
  for (let i = 0; i < 1000; i++) if (J.piegeMaintenant("tout", "experto", h)) n++;
  if (n < 350 || n > 450) faux(`Experto : ${n} pièges sur 1000`);
  if (J.piegeMaintenant("tout", "normal", () => 0) || J.piegeMaintenant("suite", "tranquilo", () => 0)) faux("des pièges hors Experto");
  if (!J.piegeMaintenant("pieges", "tranquilo", () => .99)) faux("le paquet des pièges sans piège");
  // Les niveaux : Experto plus rapide que Normal, lui-même plus rapide que Tranquilo ; la vitesse monte avec le combo.
  const v = id => J.accelCaseta(id, 0);
  if (!(v("tranquilo") < v("normal") && v("normal") < v("experto"))) faux("les niveaux ne sont pas dans l'ordre");
  if (J.accelCaseta("normal", 20) !== J.accelCaseta("normal", 14)) faux("la vitesse doit plafonner à 14 de suite");
  egal("un niveau inconnu vaut Normal", J.niveauCaseta("??").nom, "Normal");
  egal("les points de la Caseta", [J.pointsCaseta(1, false), J.pointsCaseta(3, false), J.pointsCaseta(10, true)], [10, 20, 80]);
  egal("le côté des cibles", [J.texteCible({ es: "el piso", fr: "l'appartement (le logement)" }, "fr"), J.autreCote({ es: "el piso", fr: "l'appartement" }, "es")], ["l'appartement", "l'appartement"]);
  // Les mots trouvés qui comptent pour Chispa : ni les pièges, ni les mots nouveaux.
  egal("mots attrapés de la Caseta", J.trouvesCaseta([{ id: "a" }, { id: "b", nouveau: true }, pieges[0], null]), ["a"]);
  // Le record est tenu par niveau.
  let jx = J.JEUX_VIDE();
  jx = J.apresPartie(jx, { jeu: "caseta", paquet: "normal", score: 120, ok: 10, ko: 1, serie: 6, trouves: [] }, "2026-11-24").jeux;
  const r = J.apresPartie(jx, { jeu: "caseta", paquet: "experto", score: 90, ok: 7, ko: 3, serie: 4, trouves: [] }, "2026-11-24");
  egal("un record par niveau", [r.record, r.jeux.records["caseta:normal"], r.jeux.records["caseta:experto"]], [true, 120, 90]);
}

// 14. El Chiringuito : les phrases des vrais exercices, les mots des assiettes, les pièges, les paquets.
{
  const src = fs.readFileSync(path.join(racine, "exercices.js"), "utf8").replace(/^import .*$/m, "const md = s => s;");
  fs.writeFileSync(path.join(tmp, "exercices.js"), src);
  const { EXERCICES } = await import(path.join(tmp, "exercices.js"));
  const toutes = new Set(Object.keys(EXERCICES));
  const { phrases, propres } = J.phrasesChiringuito(EXERCICES, toutes);
  if (phrases.length < 150) faux(`Chiringuito : seulement ${phrases.length} phrases`);
  for (const p of phrases) {
    if (p.mots.length < 3 || p.mots.length > 7) faux(`Chiringuito : ${p.es} a ${p.mots.length} mots`);
    if (p.mots.some(w => /[¿?¡!.,]/.test(w))) faux(`Chiringuito : ponctuation sur une assiette (${p.es})`);
    // Pas de majuscule sur une assiette, sauf un nom propre : la majuscule donnerait le premier mot.
    if (p.mots.some(w => /^\p{Lu}/u.test(w) && !propres.has(w))) faux(`Chiringuito : majuscule sur une assiette (${p.es})`);
    if (!toutes.has(p.lecon)) faux(`Chiringuito : leçon inconnue ${p.lecon}`);
  }
  for (const w of ["Kevin", "Blanca", "Dorian", "Huesca"]) if (!propres.has(w)) faux(`Chiringuito : ${w} n'est pas reconnu comme nom propre`);
  for (const w of ["Me", "Nos", "Es", "Tengo"]) if (propres.has(w)) faux(`Chiringuito : ${w} pris pour un nom propre`);
  const noel = J.phrasesChiringuito(EXERCICES, new Set(["U2-L5"])).phrases.find(p => /^Navidad/.test(p.es));
  if (noel && noel.mots[0] !== "Navidad") faux("Chiringuito : « Navidad » perd sa majuscule quand seule sa leçon est faite");
  egal("une phrase sans doublon", new Set(phrases.map(p => p.mots.join(" ").toLowerCase())).size, phrases.length);
  // Seulement les leçons faites.
  const debut = J.phrasesChiringuito(EXERCICES, new Set(["U1-L1", "U1-L2"])).phrases;
  if (debut.some(p => !["U1-L1", "U1-L2"].includes(p.lecon))) faux("Chiringuito : une phrase d'une leçon pas faite");
  // Les pièges : jamais un mot de la phrase, jamais deux fois le même, au plus n.
  const formes = new Map([["tengo", ["tienes", "tiene"]], ["tiene", ["tengo", "tienes"]]]);
  const lexique = new Set(["pequeño", "pequeña", "muchos", "muchas"]);
  let avec = 0;
  for (const p of phrases) for (let g = 1; g < 4; g++) {
    const x = J.piegesPhrase(p.mots, 2, { formes, lexique, hasard: graine(g) });
    if (x.length > 2 || new Set(x).size !== x.length) faux(`pièges en double ou en trop : ${p.es}`);
    if (x.some(w => p.mots.some(m => m.toLowerCase() === w.toLowerCase()))) faux(`un piège est dans la phrase : ${p.es} (${x})`);
    if (g === 1 && x.length) avec++;
  }
  if (avec < phrases.length * .7) faux(`Chiringuito : trop peu de phrases avec un piège (${avec} sur ${phrases.length})`);
  egal("pas de piège en Tranquilo", J.piegesPhrase(["me", "llamo", "Kevin"], 0), []);
  egal("l'autre genre, s'il existe", J.piegesPhrase(["huesca", "es", "una", "ciudad", "pequeña"].map(w => w), 9, { lexique }).includes("pequeño"), true);
  egal("l'autre personne du verbe", J.piegesPhrase(["dorian", "tiene", "siete", "años"], 9, { formes }).includes("tengo"), true);
  // Les paquets : la semaine = les leçons faites ces 7 derniers jours.
  const pq = J.paquetsChiringuito(debut, { "U1-L1": "2026-11-01", "U1-L2": "2026-11-22" }, "2026-11-24");
  egal("paquets du Chiringuito", pq.map(p => p.id), ["mes", "semaine"]);
  if (pq[1].mots.some(p => p.lecon !== "U1-L2")) faux("Chiringuito : une phrase d'une vieille leçon dans « la semaine »");
  egal("le pourboire", [J.pourboire(.9), J.pourboire(.5)], [J.BONUS_RAPIDE, 0]);
  console.log(`Chiringuito : ${phrases.length} phrases, ${avec} avec au moins un piège ; ${debut.length} après U1-L2.`);
}

console.log(erreurs ? `${erreurs} erreur(s).` : "Tout est bon.");
process.exit(erreurs ? 1 : 0);
