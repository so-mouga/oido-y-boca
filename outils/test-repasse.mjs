// Vérifie le 2e passage d'une carte ratée dans « Tes cartes à revoir » (chantier 21, Q79) : une carte notée « Non »
// revient une fois à la fin du paquet ; ce 2e passage ne change pas sa mémoire (ratée aujourd'hui, revient demain),
// elle ne revient pas une 3e fois, le compteur reste « n / 20 » puis « On la revoit · n / k », et le plafond ne compte
// que les vraies cartes. Le moteur est celui de l'écran (cartes.js : apresNote, compteSerie ; progression.js : noterMot).
// Lancer depuis appli/ : node outils/test-repasse.mjs
import fs from "fs";
import os from "os";
import path from "path";

const ici = path.dirname(new URL(import.meta.url).pathname);
const racine = path.join(ici, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "oyb-repasse-"));
// Sans les « ?v=N » des imports : un seul exemplaire de progression.js, quel que soit le numéro de version.
for (const f of fs.readdirSync(racine).filter(f => f.endsWith(".js")))
  fs.writeFileSync(path.join(tmp, f), fs.readFileSync(path.join(racine, f), "utf8").replace(/\?v=\d+/g, ""));
fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
const memoire = {};
globalThis.localStorage = { getItem: k => memoire[k] ?? null, setItem: (k, v) => { memoire[k] = String(v); } };

const { lireCsv, versMots } = await import(path.join(tmp, "donnees.js"));
const C = await import(path.join(tmp, "cartes.js"));
const P = await import(path.join(tmp, "progression.js"));

let fautes = 0;
const ok = (cond, msg) => { if (!cond) { fautes++; console.log("✗", msg); } };
const egal = (a, b, msg) => ok(JSON.stringify(a) === JSON.stringify(b), `${msg} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`);

// 5 mots de U1-L3, leçon faite au jour 0 : au jour 1, leurs cartes 1 sont dues.
const csv = `"espagnol","français","exemple","leçon"
"el pueblo","le village","Vivo en un pueblo pequeño.","U1-L3"
"la ciudad","la ville","Huesca es una ciudad tranquila.","U1-L3"
"el piso","l'appartement","¿Vives en un piso o en una casa?","U1-L3"
"el barrio","le quartier","Mi barrio es muy bonito.","U1-L3"
"la casa","la maison","Mi casa es grande.","U1-L3"`;
const mots = versMots(lireCsv(csv));
const jour = n => new Date(Date.UTC(2026, 10, 25 + n)).toISOString().slice(0, 10);
const depart = () => jour(0);
const dues = n => C.cartesARevoir(mots, P.fichesCartes(), jour(n), depart);
const [pueblo, ciudad, piso, barrio, casa] = mots;

// Le paquet du jour 1, comme serieRevision : une question par carte due.
const items = dues(1).map(c => ({ type: "carte", mot: c.mot, n: c.n }));
egal(items.length, 5, "jour 1 : les 5 cartes 1 sont dues");

// Ce que je réponds : 1er passage, puis 2e passage pour les ratées.
const premier = { [pueblo.id]: 1, [ciudad.id]: 3, [piso.id]: 1, [barrio.id]: 2, [casa.id]: 3 };
const second = { [pueblo.id]: 1, [piso.id]: 3 };
const comptes = [], notes = [], repasse = [];
for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const c = C.compteSerie(items, i);
  comptes.push(`${c.repasse ? "On la revoit · " : ""}${c.n} / ${c.sur}`);
  const n = it.repasse ? second[it.mot.id] : premier[it.mot.id];
  if (C.apresNote(items, i, n)) { P.noterMot(it.mot.id, n, jour(1)); notes.push(n); } else repasse.push(n);
  ok(i < 50, "la série ne finit jamais");
  if (i >= 50) break;
}

// Le paquet : les 2 « Non » reviennent une fois, à la fin, dans l'ordre ; « Avec peine » ne revient pas.
egal(items.map(x => !!x.repasse), [false, false, false, false, false, true, true], "les ratées reviennent à la fin");
egal(items.filter(x => x.repasse).map(x => x.mot.es), ["el pueblo", "el piso"], "seules les cartes « Non » reviennent");
egal(items.length, 7, "ratée 2 fois : pas de 3e passage");

// Le compteur : « n / 5 » pendant les vraies cartes, puis « On la revoit · n / 2 ».
egal(comptes, ["1 / 5", "2 / 5", "3 / 5", "4 / 5", "5 / 5", "On la revoit · 1 / 2", "On la revoit · 2 / 2"], "le compteur");
// Le bilan : « Trouvées » et « À revoir bientôt » sur les 5 vraies cartes ; « Revues à la fin » à part.
egal(notes, [1, 3, 1, 2, 3], "le bilan ne compte que le 1er passage");
egal(repasse, [1, 3], "Revues à la fin : 1 retrouvée sur 2");
// Le plafond des 40 cartes par jour compte les vraies cartes.
egal(C.compteSerie(items, 0).premiers, 5, "le plafond compte 5 cartes, pas 7");

// La mémoire : le 2e passage ne change rien. Piso retrouvé au 2e passage reste ratée (boîte 0) et revient demain.
const f = P.fichesCartes();
egal([f[pueblo.id].boite, f[piso.id].boite], [0, 0], "les ratées restent en boîte 0");
egal([f[pueblo.id].nons, f[piso.id].nons], [1, 1], "un seul « Non » compté pour « Tu bloques sur… »");
egal(f[ciudad.id].boite, 1, "ciudad trouvée : boîte 1");
egal(dues(1).length, 0, "rien ne revient plus aujourd'hui");
ok(["el pueblo", "el piso"].every(es => dues(2).some(c => c.mot.es === es && c.n === 1)), "demain : les 2 ratées reviennent");

// En dehors de la révision, rien ne change : un « Oui » ou « Avec peine » n'ajoute rien.
const autre = [{ type: "carte", mot: casa, n: 1 }];
ok(C.apresNote(autre, 0, 3) && autre.length === 1, "« Oui » : pas de 2e passage");
ok(C.apresNote(autre, 0, 2) && autre.length === 1, "« Avec peine » : pas de 2e passage");
// Une carte écrite (2, 3, 4) ratée revient aussi, avec sa clé.
const ecrite = [{ type: "ecrire", mot: casa, n: 3, cle: C.cleCarte(casa.id, 3) }];
C.apresNote(ecrite, 0, 1);
egal(ecrite.map(x => [x.cle, !!x.repasse]), [[C.cleCarte(casa.id, 3), false], [C.cleCarte(casa.id, 3), true]], "carte écrite ratée : même clé au 2e passage");
ok(!C.apresNote(ecrite, 1, 1) && ecrite.length === 2, "carte écrite ratée 2 fois : pas de 3e passage");

console.log(fautes ? `${fautes} faute(s)` : "test-repasse : tout est bon");
process.exit(fautes ? 1 : 0);
