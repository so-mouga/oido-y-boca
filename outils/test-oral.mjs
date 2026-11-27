// Vérifie la prochaine séance avec le prof (chantier 22) : plus d'oral fixe le jeudi ; après 4 séances de travail
// (leçon, consolidation, contrôle, reprise), la suivante est orale, quel que soit le jour. L'ordre du prof :
// contrôle raté → consolidation ; leçon non validée → consolidation (2 au plus) ; compteur à 4 → oral ;
// unité finie → contrôle ; sinon la leçon suivante. Vérifie aussi « Copié ✓ » (suit l'oral, pas le jour)
// et la ligne de « Ta journée » (écran Aujourd'hui, rendu en HTML).
// Lancer depuis appli/ : node outils/test-oral.mjs          (avec la copie du « Suivi » du 27 nov. 2026)
//                        node outils/test-oral.mjs --vrai   (lit aussi le vrai « Suivi » en ligne, en lecture seule)
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-oral-"));
// Sans les « ?v=N » des imports : un seul exemplaire de chaque module, quel que soit le numéro de version.
for (const dossier of ["", "ecrans"]) {
  fs.mkdirSync(path.join(tmp, dossier), { recursive: true });
  for (const f of fs.readdirSync(path.join(racine, dossier)).filter(f => f.endsWith(".js")))
    fs.writeFileSync(path.join(tmp, dossier, f), fs.readFileSync(path.join(racine, dossier, f), "utf8").replace(/\?v=\d+/g, ""));
}
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); }, removeItem: k => { delete memoire[k]; } };

const { lireCsv, versSuivi } = await import(path.join(tmp, "donnees.js"));
const { calculerPosition } = await import(path.join(tmp, "position.js"));

let fautes = 0;
const ok = (cond, msg) => { if (!cond) { fautes++; console.log("✗", msg); } };
const egal = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`);

// ── Ce que l'appli annonce, en clair ──
function annonce(sea) {
  if (sea.type === "orale") return "SÉANCE ORALE";
  if (sea.type === "consolidation") return sea.apresControle ? `consolidation, puis le contrôle de l'unité ${sea.unite?.n} à refaire`
    : `consolidation ${sea.n} de ${sea.idLecon}${sea.n === 2 ? " (une 3e si tu la choisis)" : ""}`;
  if (sea.type === "contrôle") return `contrôle de l'unité ${sea.unite.n}`;
  if (sea.type === "leçon") return `leçon ${sea.lecon.id}`;
  return "livre terminé";
}
const JOURS = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
const jourDe = iso => iso ? `${JOURS[new Date(iso + "T12:00:00").getDay()]} ${iso.slice(8)}/${iso.slice(5, 7)}` : "sans date";
// Rejoue « Suivi » ligne par ligne : après chaque ligne, le compteur et la prochaine séance annoncée.
function rejouer(suivi) {
  return suivi.map((s, i) => {
    const pos = calculerPosition(suivi.slice(0, i + 1), s.date || "2026-11-27");
    return { ligne: s, compteur: pos.seance.compteur, ensuite: annonce(pos.seance) };
  });
}
function montrer(titre, suivi) {
  console.log(`\n── ${titre} ──`);
  for (const { ligne: s, compteur, ensuite } of rejouer(suivi)) {
    const score = Number.isNaN(s.score) ? "" : ` ${s.score} %`;
    const rem = s.remarque ? ` « ${s.remarque.slice(0, 26)}${s.remarque.length > 26 ? "…" : ""} »` : "";
    console.log(`  ${jourDe(s.date).padEnd(9)} ${s.lecon.padEnd(12)} ${(s.type + score).padEnd(16)}${rem}`.padEnd(78)
      + ` compteur ${compteur} → ${ensuite}`);
  }
}

// ── 1. Le vrai « Suivi », copié le 27 nov. 2026 (dates au format nombre de Google Sheets, comme le vrai) ──
const SUIVI_27NOV = `"date","leçon","type","score (%)","remarque"
"46349","U1-L1","leçon","","1re séance. Échauffement 3,5/6, exercices 9/10, mots 5/5"
"46350","U1-L2","leçon","","Échauffement 5/5 + en/a 4/4, ser série 1 3,5/6, série 2 5/6, phrase clé OK de mémoire"
"46351","U1-L3","leçon","","Échauffement 5/7, vivir série 1 5/6, série 2 2/4 (en et desde hace justes), mots 3/3, phrase clé OK de mémoire"
"46352","U1-L4","leçon","","Échauffement 4/5 + ser/estar 1/3, estar série 1 9/9, série 2 4,5/5, mots 2/3, entraînement en plus 7,5/8 (ser/estar 8/8), phrase clé OK de mémoire. Mission de la veille non faite (fatigue)"
"46353","U1-L4","consolidation","","Rab sur les erreurs et les mots de U1-L3 (pas un contrôle) : tour 1 6/10, tour 2 6,5/8"
"46353","U1-L5","leçon","","Grammaire validée : 86 %. Pas de dictée d'écoute (méthode mise à jour après la séance). Échauffement mots 4/5, erreurs tour 1 3/6, tour 2 6,5/7 ; série 1 10/12, série 2 8/9 (18/21) ; fin en mode vocal : question libre, 5 mots répétés, phrase clé juste de mémoire après 2 essais"`;
const vrai = versSuivi(lireCsv(SUIVI_27NOV));
montrer("Le vrai « Suivi » au 27 nov.", vrai);
const r0 = rejouer(vrai);
egal(r0.map(r => r.compteur), [0, 0, 0, 0, 0, 0], "avant le 30 nov., rien ne compte pour l'oral");
egal(r0.at(-1).ensuite, "leçon U1-L6", "lundi 30 nov. : la leçon U1-L6, pas l'oral");
egal(calculerPosition(vrai, "2026-11-27").derniere.id, "U1-L5", "la dernière leçon reste U1-L5");

// ── 2. Les cas inventés (à partir du vrai « Suivi ») ──
let rang = 100;
const V = "Grammaire validée : 86 %. Écoute : 14/18.";
const L = (date, lecon, type, remarque = V, score = NaN) => ({ date, lecon, type, remarque, score, rang: rang++ });

// 2a. Ta semaine du 30 nov. : U1-L6 (1), contrôle U1 réussi (2), U2-L1 (3), U2-L2 (4), puis l'oral un lundi.
const semaine = [...vrai,
  L("2026-11-30", "U1-L6", "leçon"), L("2026-12-01", "U1-contrôle", "contrôle", "Écoute : 15/18.", 84),
  L("2026-12-02", "U2-L1", "leçon"), L("2026-12-03", "U2-L2", "leçon"), L("2026-12-07", "Oral", "orale", "Écoute : 15/18.")];
montrer("Cas 1 : ta semaine du 30 nov., puis l'oral un lundi", semaine);
egal(rejouer(semaine).slice(6).map(r => [r.compteur, r.ensuite]),
  [[1, "contrôle de l'unité 1"], [2, "leçon U2-L1"], [3, "leçon U2-L2"], [4, "SÉANCE ORALE"], [0, "leçon U2-L3"]],
  "semaine du 30 nov. : contrôle après U1-L6, l'oral après 4 séances, remise à zéro");
const lundi = calculerPosition(semaine.slice(0, 10), "2026-12-07");
egal([lundi.seance.type, lundi.prochaine.lecon.id], ["orale", "U2-L3"], "le lundi de l'oral : « prochaine leçon » reste U2-L3");
const apresOral = calculerPosition(semaine, "2026-12-07");
egal([apresOral.derniere.id, apresOral.prochaine.lecon.id, apresOral.seanceDuJour], ["U2-L2", "U2-L3", true],
  "une ligne orale ne change ni la dernière ni la prochaine leçon, et coche la séance du jour");

// 2b. Une leçon non validée avec le compteur à 4 : la consolidation d'abord, l'oral juste après.
const nonValidee = [...vrai,
  L("2026-11-30", "U1-L6", "leçon"), L("2026-12-01", "U1-contrôle", "contrôle", "", 90), L("2026-12-02", "U2-L1", "leçon"),
  L("2026-12-03", "U2-L2", "leçon", "GRAMMAIRE NON VALIDÉE : 70 %. Écoute : 12/18."),
  L("2026-12-04", "U2-L2", "consolidation", "Grammaire validée : 82 %. Écoute : 13/18."),
  L("2026-12-07", "Oral", "orale")];
montrer("Cas 2 : leçon non validée avec le compteur à 4", nonValidee);
egal(rejouer(nonValidee).slice(9).map(r => [r.compteur, r.ensuite]),
  [[4, "consolidation 1 de U2-L2"], [5, "SÉANCE ORALE"], [0, "leçon U2-L3"]],
  "non validée au compteur 4 : consolidation, puis l'oral (casse ignorée)");

// 2c. Jamais validée : 2 consolidations avant l'oral ; une 3e si le prof l'écrit.
const deuxFois = [...vrai,
  L("2026-11-30", "U1-L6", "leçon"), L("2026-12-01", "U1-contrôle", "contrôle", "", 90), L("2026-12-02", "U2-L1", "leçon"),
  L("2026-12-03", "U2-L2", "leçon", "Grammaire non validée : 70 %."), L("2026-12-04", "U2-L2", "consolidation", "Grammaire non validée : 74 %."),
  L("2026-12-07", "U2-L2", "consolidation", "Grammaire non validée : 76 %."), L("2026-12-08", "U2-L2", "consolidation", "Grammaire validée : 80 %."),
  L("2026-12-09", "Oral", "orale")];
montrer("Cas 2 bis : non validée, 2 consolidations, puis une 3e choisie", deuxFois);
egal(rejouer(deuxFois).slice(9).map(r => r.ensuite),
  ["consolidation 1 de U2-L2", "consolidation 2 de U2-L2 (une 3e si tu la choisis)", "SÉANCE ORALE", "SÉANCE ORALE", "leçon U2-L3"],
  "2 consolidations au plus, l'appli suit une 3e écrite par le prof");

// 2d. Un contrôle raté : consolidation, puis le contrôle à refaire.
const rate = [...vrai,
  L("2026-11-30", "U1-L6", "leçon"), L("2026-12-01", "U1-contrôle", "contrôle", "Écoute : 11/18.", 72),
  L("2026-12-02", "U1-contrôle", "consolidation"), L("2026-12-03", "U1-contrôle", "contrôle", "", 85)];
montrer("Cas 3 : contrôle raté, consolidation, contrôle refait", rate);
egal(rejouer(rate).slice(6).map(r => [r.compteur, r.ensuite]),
  [[1, "contrôle de l'unité 1"], [2, "consolidation, puis le contrôle de l'unité 1 à refaire"], [3, "contrôle de l'unité 1"], [4, "SÉANCE ORALE"]],
  "contrôle sous 80 % : consolidation, puis le contrôle à refaire ; le contrôle compte dans le compteur");

// 2e. La remise à zéro après une ligne orale, l'oral le même jour qu'une leçon, et « oral » sans e.
const zero = [...semaine,
  L("2026-12-08", "U2-L3", "leçon"), L("2026-12-09", "U2-L4", "leçon"), L("2026-12-10", "U2-L5", "leçon"),
  L("2026-12-11", "U2-contrôle", "contrôle", "", 88), L("2026-12-11", "Oral", "oral"), L("2026-12-14", "U3-L1", "leçon")];
montrer("Cas 4 : remise à zéro après l'oral (et « oral » sans e)", zero);
egal(rejouer(zero).slice(10).map(r => [r.compteur, r.ensuite]),
  [[0, "leçon U2-L3"], [1, "leçon U2-L4"], [2, "leçon U2-L5"], [3, "contrôle de l'unité 2"], [4, "SÉANCE ORALE"], [0, "leçon U3-L1"], [1, "leçon U3-L2"]],
  "remise à zéro après chaque oral, même écrit « oral »");

// 2f. Les lignes « bilan » ne comptent pas, et ne cachent pas un contrôle raté.
const bilan = [...vrai, L("2026-11-30", "U1-L6", "leçon"), L("2026-12-01", "U1-contrôle", "contrôle", "", 60), L("2026-12-01", "Bilan U1", "bilan")];
egal([calculerPosition(bilan, "2026-12-01").seance.compteur, calculerPosition(bilan, "2026-12-01").seance.type], [2, "consolidation"],
  "une ligne bilan ne compte pas et laisse voir le contrôle raté");

// ── 3. « Copié ✓ » suit l'oral, pas le jour ; les mots pour l'oral ──
const P = await import(path.join(tmp, "progression.js"));
const MM = await import(path.join(tmp, "ecrans", "mesmots.js"));
const ctxDu = (suivi, jour) => ({ jour, pos: calculerPosition(suivi, jour) });
// L'ancienne sauvegarde : une copie le jeudi 26 nov. (ancien oral), dans la case « dimanche ».
P.cocher("2026-11-26", "dimanche", true);
for (const [es, le] of [["el tejado", "2026-11-25"], ["la acera", "2026-11-27"], ["el atasco", "2026-12-02"]])
  P.ajouterMonMot(es, es, "", le, "ecoute");
const avantOral = semaine.slice(0, 10); // jusqu'à U2-L2 : l'oral est la prochaine séance
const ctx4 = ctxDu(avantOral, "2026-12-04");
egal(ctx4.pos.seance.type, "orale", "le vendredi 4 déc., l'oral est la prochaine séance");
egal(MM.copieFaite(ctx4), false, "la copie du 26 nov. (ancien jeudi) ne compte pas pour le nouvel oral");
egal(MM.motsPourLOral(ctx4).map(m => m.es), ["la acera", "el atasco"], "avant le 1er oral : les mots depuis la dernière copie d'avant le 30 nov.");
P.cocher("2026-12-04", "dimanche", true);
egal(MM.copieFaite(ctx4), true, "copié le vendredi : « Copié ✓ »");
for (const [es, le] of [["la farola", "2026-12-07"], ["el buzón", "2026-12-09"]]) P.ajouterMonMot(es, es, "", le, "ecoute");
egal(MM.copieFaite(ctxDu(avantOral, "2026-12-07")), true, "toujours « Copié ✓ » le lundi de l'oral (copie de la veille)");
const ctx9 = ctxDu(semaine, "2026-12-09");
egal(MM.copieFaite(ctx9), false, "après l'oral du 7 déc., la copie d'avant ne vaut plus");
egal(MM.motsPourLOral(ctx9).map(m => m.es), ["la farola", "el buzón"], "après l'oral : les mots depuis le jour de l'oral");
egal(MM.texteProf([{ es: "la farola", fr: "le lampadaire" }]).startsWith("Mis palabras"), true, "le texte pour le prof");

// ── 4. La ligne de « Ta journée » (rendu HTML de l'écran Aujourd'hui) ──
const A = await import(path.join(tmp, "ecrans", "aujourdhui.js"));
const html = (suivi, jour) => {
  const ctx = { jour, pos: calculerPosition(suivi, jour), soir: {}, motsParLecon: {}, mots: [], suivi };
  const h = A.ecranAujourdhui(ctx).html;
  const li = h.match(/<li class="tache[^]*?<\/li>/)?.[0] || "";
  return li.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};
const lignesAffichees = [
  ["ven 27/11 (aujourd'hui)", html(vrai, "2026-11-27")],
  ["lun 30/11, avant la séance", html(vrai, "2026-11-30")],
  ["mar 01/12, avant", html(semaine.slice(0, 7), "2026-12-01")],
  ["jeu 03/12, après U2-L2", html(semaine.slice(0, 10), "2026-12-03")],
  ["ven 04/12, copié le jour même", html(avantOral, "2026-12-04")],
  ["lun 07/12, après l'oral", html(semaine, "2026-12-07")],
  ["jeu 03/12, U2-L2 non validée, après", html(nonValidee.slice(0, 10), "2026-12-03")],
  ["ven 04/12, consolidation à faire", html(nonValidee.slice(0, 10), "2026-12-04")],
  ["mer 02/12, contrôle raté la veille", html(rate.slice(0, 8), "2026-12-02")],
  ["sam 05/12 (week-end)", html(avantOral, "2026-12-05")],
];
console.log("\n── Ce que montre la 1re ligne de « Ta journée » ──");
for (const [quand, texte] of lignesAffichees) console.log(`  ${quand.padEnd(38)} ${texte || "(pas de ligne)"}`);
const t = Object.fromEntries(lignesAffichees);
ok(t["lun 30/11, avant la séance"].includes("Leçon avec le prof") && t["lun 30/11, avant la séance"].includes("U1-L6"), "lundi 30 nov. : Leçon U1-L6");
ok(t["mar 01/12, avant"].includes("Contrôle de l'unité 1 avec le prof"), "mardi 1er déc. : le contrôle de l'unité 1");
ok(t["jeu 03/12, après U2-L2"].includes("prochaine séance : l'oral"), "le jour de la 4e séance : « prochaine séance : l'oral »");
ok(t["ven 04/12, copié le jour même"].includes("Séance orale avec le prof") && t["ven 04/12, copié le jour même"].includes("Copié ✓"), "vendredi : la séance orale, « Copié ✓ »");
ok(t["lun 07/12, après l'oral"].includes("Séance orale avec le prof") && t["lun 07/12, après l'oral"].includes("faite"), "le jour de l'oral : faite");
ok(t["ven 04/12, consolidation à faire"].includes("Consolidation avec le prof"), "la consolidation annoncée");
ok(t["mer 02/12, contrôle raté la veille"].includes("refaire le contrôle de l'unité 1"), "après un contrôle raté");
ok(!t["sam 05/12 (week-end)"].includes("Séance orale"), "pas de ligne d'oral le week-end");
const tout = lignesAffichees.map(x => x[1]).join(" ");
ok(!/jeudi|12 h/.test(tout), "plus de « jeudi » ni de « 12 h »");

// ── 5. Avec --vrai : le « Suivi » en ligne, en lecture seule ──
if (process.argv.includes("--vrai")) {
  const url = "https://docs.google.com/spreadsheets/d/1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ/gviz/tq?tqx=out:csv&sheet=Suivi";
  const enLigne = versSuivi(lireCsv(await (await fetch(url)).text()));
  montrer(`Le vrai « Suivi » en ligne (${enLigne.length} lignes)`, enLigne);
  const auj = new Date().toISOString().slice(0, 10);
  console.log(`  → aujourd'hui (${auj}), l'appli annonce : ${annonce(calculerPosition(enLigne, auj).seance)}`);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(fautes ? `\n${fautes} faute(s)` : "\nTout est bon : la prochaine séance suit « Suivi » et l'ordre du prof.");
process.exit(fautes ? 1 : 0);
