// Le moteur des jeux de la Feria (la salle de jeux) : quels mots, quelles fausses réponses, les points, les records, les trophées.
// Rien ici ne touche à l'écran ni au téléphone : tout se teste avec node (outils/test-jeux.mjs).
// Les jeux ne changent jamais la révision des mots.

export const SEUIL = 12;      // il faut 12 mots connus pour jouer (Q-A1)
export const DUREE = 60;      // secondes d'un Contre la montre (Q-A5)
export const DERNIERS = 30;   // le paquet « Mes 30 derniers mots » (Q-A2)
export const PALIERS = [3, 6, 10]; // bonnes réponses de suite : ×2, ×3, puis ¡FUEGO! ×5

// Le sens tel qu'on l'affiche sur un bouton : sans les parenthèses, pour lire vite (« le bureau (la pièce) » → « le bureau »).
export const court = fr => (fr || "").replace(/\s*\([^)]*\)/g, "").replace(/\s{2,}/g, " ").trim() || (fr || "").trim();
const cle = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ]+/g, " ").trim();
const categorie = m => (m.categorie || "").trim().toLowerCase();

// Les mots que je connais, du plus ancien au plus récent : les leçons faites, les mots du livre appris en avance, et « Mes mots ».
// mots : le vocabulaire du tableau ; faites : Set des leçons faites ; dateFaite : { leçon: date } ;
// avance : idMot => date ou "" ; aMoi : mes mots ({ id, es, fr, le }).
export function motsConnus({ mots, faites, dateFaite = {}, avance = () => "", aMoi = [] }) {
  const liste = [];
  mots.forEach((m, i) => {
    const depuis = faites.has(m.lecon) ? (dateFaite[m.lecon] || "") : avance(m.id);
    if (faites.has(m.lecon) || depuis) liste.push({ m, depuis: depuis || "", i });
  });
  aMoi.forEach((m, i) => liste.push({ m, depuis: m.le || "", i: mots.length + i }));
  liste.sort((a, b) => (a.depuis < b.depuis ? -1 : a.depuis > b.depuis ? 1 : a.i - b.i));
  // Le même mot deux fois (dans le livre et dans « Mes mots ») ne compte qu'une fois.
  const vus = new Set();
  return liste.map(x => x.m).filter(m => { const k = cle(m.es); if (!k || vus.has(k)) return false; vus.add(k); return true; });
}

// Les paquets à choisir avant une partie : « Tout ce que je sais », « Mes 30 derniers mots », puis une unité par unité finie,
// et la première unité pas finie, fermée, pour montrer la suite. unites : [{ id, n, titre, lecons: [{ id }] }].
export function paquets(connus, unites, faites) {
  const liste = [
    { id: "tout", nom: "Tout ce que je sais", mots: connus, ouvert: connus.length >= SEUIL,
      aide: "Les leçons faites et « Mes mots »" },
    { id: "derniers", nom: `Mes ${DERNIERS} derniers mots`, mots: connus.slice(-DERNIERS), ouvert: connus.length > DERNIERS,
      aide: connus.length > DERNIERS ? "Ceux que tu apprends en ce moment" : `Quand tu auras plus de ${DERNIERS} mots` },
  ];
  let attente = false;
  for (const u of unites) {
    const finie = u.lecons.length > 0 && u.lecons.every(l => faites.has(l.id));
    if (!finie && (attente || !u.n)) continue; // une seule unité fermée, et jamais Noël
    const ids = new Set(u.lecons.map(l => l.id));
    const mots = connus.filter(m => ids.has(m.lecon));
    if (finie && mots.length < SEUIL) continue;
    liste.push({ id: u.id, nom: u.n ? `Unité ${u.n}` : u.id, titre: u.titre, mots: finie ? mots : [], ouvert: finie,
      aide: finie ? "" : "S'ouvre quand l'unité est finie" });
    if (!finie) attente = true;
  }
  return liste;
}

// Mélange (Fisher-Yates), avec un hasard qu'on peut fixer dans les tests.
export function melanger(t, hasard = Math.random) {
  t = [...t];
  for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
  return t;
}

// Les 3 fausses réponses : la même catégorie d'abord, complétées par les autres s'il en manque (Q-A4).
// Jamais le sens du bon mot (ser / estar = « être »), jamais deux fois le même sens.
export function fausses(mot, mots, hasard = Math.random) {
  const pris = new Set([cle(court(mot.fr))]);
  const autres = melanger(mots.filter(m => m !== mot), hasard);
  const choisis = [];
  for (const m of [...autres.filter(m => categorie(m) === categorie(mot)), ...autres.filter(m => categorie(m) !== categorie(mot))]) {
    if (choisis.length === 3) break;
    const k = cle(court(m.fr));
    if (!k || pris.has(k)) continue;
    pris.add(k);
    choisis.push(m);
  }
  return choisis;
}

// La pioche : tous les mots du paquet passent avant qu'un mot revienne, et jamais deux fois de suite le même.
export function creerPioche(mots, hasard = Math.random) {
  let reste = [], dernier = null;
  return () => {
    if (!reste.length) {
      reste = melanger(mots, hasard);
      if (reste.length > 1 && reste[reste.length - 1] === dernier) reste.unshift(reste.pop());
    }
    return (dernier = reste.pop());
  };
}

// Une question : le mot, et ses 4 réponses mélangées ({ mot, texte, juste }).
export function question(mot, mots, hasard = Math.random) {
  const reponses = melanger([mot, ...fausses(mot, mots, hasard)], hasard).map(m => ({ mot: m, texte: court(m.fr), juste: m === mot }));
  return { mot, reponses };
}

export const multi = combo => combo >= PALIERS[2] ? 5 : combo >= PALIERS[1] ? 3 : combo >= PALIERS[0] ? 2 : 1;
export const points = combo => 10 * multi(combo); // combo : le nombre de bonnes réponses de suite, celle-ci comprise
// La taille de la mascotte (0 étincelle, 1, 2, 3 feu de joie) et les pions vers le palier suivant.
export const taille = combo => [1, 2, 3, 5].indexOf(multi(combo));
export function pions(combo) {
  const x = multi(combo);
  if (x === 5) return { pleins: 0, sur: 0 };
  const [de, a] = x === 1 ? [0, PALIERS[0]] : x === 2 ? [PALIERS[0], PALIERS[1]] : [PALIERS[1], PALIERS[2]];
  return { pleins: combo - de, sur: a - de };
}

// Les trophées : des rosettes de palier, jamais liées aux jours (Q-A10).
export const TROPHEES = [
  { id: "premier", nom: "Premier tour", quoi: "Finir ta première partie", couleur: "#0F8A83" },
  { id: "bronze", nom: "Rosette de bronze", quoi: "150 points en une partie", couleur: "#B8733A", score: 150 },
  { id: "argent", nom: "Rosette d'argent", quoi: "300 points en une partie", couleur: "#8E9BAE", score: 300 },
  { id: "or", nom: "Rosette d'or", quoi: "500 points en une partie", couleur: "#E9A20B", score: 500 },
  { id: "fuego", nom: "¡Fuego!", quoi: "10 bonnes réponses de suite", couleur: "#D8472A" },
  { id: "sansfaute", nom: "Sans faute", quoi: "Une partie sans erreur (15 réponses au moins)", couleur: "#2E6B43" },
  { id: "cent", nom: "100 mots trouvés", quoi: "En tout, toutes parties confondues", couleur: "#13294B", trouves: 100 },
  { id: "mille", nom: "1 000 mots trouvés", quoi: "En tout, toutes parties confondues", couleur: "#7A3F8F", trouves: 1000 },
];

// Ce que le téléphone garde pour les jeux. « fois » : pour chaque mot, le nombre de parties où il a été trouvé ;
// « jours » : les jours où une partie a été finie (la guirlande) ; « serie » et « sansFaute » : pour les trophées.
// « surprises » : pour chaque mot surprise montré, le dernier jour ; « gardes » : le nombre de mots surprise gardés par jour.
export const JEUX_VIDE = () => ({ records: {}, trophees: {}, trouves: 0, parties: 0, meilleur: 0, serie: 0, sansFaute: false,
  fois: {}, jours: [], surprises: {}, gardes: {}, muet: false, paquet: "tout", paquetVerbes: "tous" });

// La fin d'une partie. jeux : ce que le téléphone garde ; partie : { jeu, paquet, score, ok, ko, serie (la meilleure),
// trouves : les identifiants des mots trouvés }. Renvoie le nouvel état, si le record du paquet est battu, l'ancien record,
// si l'ampoule du jour vient de s'allumer, et les trophées gagnés à l'instant.
// « trophees: false » : les compteurs sont tenus, mais aucun trophée n'est donné (premier lot, avant que les trophées existent) ;
// ils seront tous donnés, avec ce qui a été joué avant, à la première partie où ils existent.
export function apresPartie(jeux, partie, jour, { trophees = true } = {}) {
  const avant = { ...JEUX_VIDE(), ...jeux };
  const cleRecord = `${partie.jeu}:${partie.paquet}`;
  const ancien = avant.records[cleRecord] || 0;
  const record = partie.score > ancien;
  const fois = { ...avant.fois };
  for (const id of new Set(partie.trouves || [])) fois[id] = (fois[id] || 0) + 1;
  const ampoule = !avant.jours.includes(jour);
  const attrapesAvant = attrapes(avant);
  const apres = {
    ...avant,
    records: record ? { ...avant.records, [cleRecord]: partie.score } : avant.records,
    trouves: avant.trouves + partie.ok,
    parties: avant.parties + 1,
    meilleur: Math.max(avant.meilleur, partie.score),
    serie: Math.max(avant.serie, partie.serie || 0),
    sansFaute: avant.sansFaute || (partie.ko === 0 && partie.ok >= 15),
    fois,
    jours: ampoule ? [...avant.jours, jour] : avant.jours,
    surprises: partie.surprise ? { ...avant.surprises, [partie.surprise]: jour } : avant.surprises,
  };
  const gagne = t => t.id === "premier" ? true
    : t.score ? apres.meilleur >= t.score
    : t.trouves ? apres.trouves >= t.trouves
    : t.id === "fuego" ? apres.serie >= PALIERS[2]
    : t.id === "sansfaute" ? apres.sansFaute
    : false;
  const nouveaux = trophees ? TROPHEES.filter(t => !avant.trophees[t.id] && gagne(t)) : [];
  if (nouveaux.length) apres.trophees = { ...avant.trophees, ...Object.fromEntries(nouveaux.map(t => [t.id, jour])) };
  // Les mots attrapés à l'instant (trouvés dans une 3e partie), et Chispa qui change de couleur.
  const nouveauxAttrapes = [...new Set(partie.trouves || [])].filter(id => fois[id] === ATTRAPE);
  const mue = etape(attrapes(apres)).i > etape(attrapesAvant).i;
  return { jeux: apres, record, ancien, ampoule, trophees: nouveaux, attrapes: nouveauxAttrapes, mue };
}

// La guirlande de la semaine : une ampoule par jour joué, du lundi au dimanche. Rien ne retombe à zéro :
// le lundi la guirlande repart éteinte, et la salle retient la meilleure semaine.
const midi = iso => new Date(iso + "T12:00:00");
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const lundiDe = jour => { const d = midi(jour); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
export function semaine(jours, jour) {
  const lundi = midi(lundiDe(jour));
  const joues = new Set(jours || []);
  const ampoules = Array.from({ length: 7 }, (_, i) => { const d = new Date(lundi); d.setDate(lundi.getDate() + i); return joues.has(iso(d)); });
  const parSemaine = {};
  for (const j of joues) parSemaine[lundiDe(j)] = (parSemaine[lundiDe(j)] || 0) + 1;
  return { ampoules, auj: (midi(jour).getDay() + 6) % 7, n: ampoules.filter(Boolean).length, meilleure: Math.max(0, ...Object.values(parSemaine)) };
}

// ——— Chispa change de couleur : les mots « attrapés » ———
// Un mot est attrapé quand il a été trouvé juste dans 3 parties différentes. Pour faire changer Chispa, il faut donc
// des mots nouveaux, pas rejouer les mêmes. Elle ne redescend jamais. Rien ici ne touche à la révision.
export const ATTRAPE = 3;
export const ETAPES = [
  { nom: "naranja", seuil: 0 }, { nom: "roja", seuil: 40 }, { nom: "fucsia", seuil: 120 },
  { nom: "violeta", seuil: 250 }, { nom: "azul", seuil: 450 }, { nom: "arcoíris", seuil: 750 },
];
export const attrapes = jeux => Object.values(jeux?.fois || {}).filter(n => n >= ATTRAPE).length;
// L'étape de Chispa pour n mots attrapés : { i, nom, seuil, suivant (l'étape d'après ou null), part (0 à 1 vers la suivante) }.
export function etape(n) {
  const i = ETAPES.reduce((r, e, k) => (n >= e.seuil ? k : r), 0);
  const suivant = ETAPES[i + 1] || null;
  return { i, ...ETAPES[i], suivant, part: suivant ? (n - ETAPES[i].seuil) / (suivant.seuil - ETAPES[i].seuil) : 1 };
}

// ——— Le mot surprise ———
// Une fois par partie, un mot des prochaines leçons du livre, à deviner par élimination parmi des mots connus.
// Au plus 5 mots gardés par jour, tous jeux confondus (mot surprise, En la frente) : ensuite, plus de mot surprise ce jour-là.
// Chaque mot gardé entre dans « Tes mots à revoir » : sans limite, la révision déborderait.
export const GARDES_PAR_JOUR = 5;
export const gardesRestants = (jeux, jour) => Math.max(0, GARDES_PAR_JOUR - ((jeux?.gardes || {})[jour] || 0));
export const peutSurprendre = (jeux, jour) => ((jeux?.gardes || {})[jour] || 0) < GARDES_PAR_JOUR;
// aVenir : les mots pas encore vus, de la leçon la plus proche à la plus lointaine ; connus : les mots du paquet.
// On prend le premier qui n'a pas déjà été montré aujourd'hui, dont le sens ne ressemble à aucun mot connu,
// et qui a 3 fausses réponses possibles. null s'il n'y en a pas.
export function motSurprise(aVenir, connus, jeux, jour, hasard = Math.random) {
  if (!peutSurprendre(jeux, jour) || connus.length < SEUIL) return null;
  const sens = new Set(connus.map(m => cle(court(m.fr))));
  const deja = (jeux?.surprises) || {};
  const possibles = (aVenir || []).slice(0, 40).filter(m => m.es && m.fr && !sens.has(cle(court(m.fr))));
  const choix = possibles.find(m => deja[m.id] !== jour) || null;
  return choix && fausses(choix, connus, hasard).length === 3 ? choix : null;
}
// « Je le garde » : compte le mot gardé du jour (le mot lui-même passe par apprendreEnAvance, comme dans le Dico).
export function garderSurprise(jeux, jour) {
  const avant = { ...JEUX_VIDE(), ...jeux };
  return { ...avant, gardes: { [jour]: (avant.gardes[jour] || 0) + 1 } };
}
export const BONUS_SURPRISE = 30;

// ——— La course de verbes ———
// Un verbe et une personne (« venir · tú »), et 3 formes : la bonne, le même verbe à une autre personne,
// et, quand plusieurs temps sont vus, la même personne à un autre temps. Seulement mes verbes et les temps déjà vus.
// conj(v, p, d, t) est la conjugaison de l'appli (controles.js), passée en paramètre pour que ce fichier reste sans import.
export const SEUIL_VERBES = 4;
export const REPONSES_VERBES = 3;

// Les temps vus : le présent, puis chaque temps dont la leçon est faite. temps : TEMPS de controles.js.
export const tempsVus = (faites, temps) => Object.keys(temps).filter(t => t === "present" || faites.has(temps[t].lecon));

// Les paquets : « Tous mes verbes » et « Mes verbes en cours », chacun ouvert à partir de 4 verbes.
export function paquetsVerbes(tous, cours) {
  return [
    { id: "tous", nom: "Tous mes verbes", mots: tous, ouvert: tous.length >= SEUIL_VERBES, aide: `Il faut ${SEUIL_VERBES} verbes, tu en as ${tous.length}` },
    { id: "cours", nom: "Mes verbes en cours", mots: cours, ouvert: cours.length >= SEUIL_VERBES,
      aide: cours.length ? `Il en faut ${SEUIL_VERBES}, tu en as ${cours.length} : ajoute-les depuis le Dico` : "Ajoute des verbes depuis le Dico (« Je l'apprends »)" },
  ];
}

// Une question : { verbe, p, t, bonne, reponses: [{ texte, juste }] }. x : { v, d } (un verbe de verbes.js).
export function questionVerbe(x, temps, conj, hasard = Math.random) {
  const t = temps[Math.floor(hasard() * temps.length)] || "present";
  const p = Math.floor(hasard() * 6);
  const bonne = conj(x.v, p, x.d, t);
  const pris = new Set([bonne]);
  const choisis = [];
  const prendre = f => { if (f && !pris.has(f) && choisis.length < REPONSES_VERBES - 1) { pris.add(f); choisis.push(f); } };
  // Un autre temps, même personne : seulement s'il y en a un de vu.
  for (const u of melanger(temps.filter(u => u !== t), hasard)) { const avant = choisis.length; prendre(conj(x.v, p, x.d, u)); if (choisis.length > avant) break; }
  // Le reste : le même verbe au même temps, à d'autres personnes.
  for (const q of melanger([0, 1, 2, 3, 4, 5].filter(q => q !== p), hasard)) prendre(conj(x.v, q, x.d, t));
  return { verbe: x, p, t, bonne, reponses: melanger([bonne, ...choisis], hasard).map(texte => ({ texte, juste: texte === bonne })) };
}

// ——— Les jeux à deux (La Bomba, En la frente) ———
export const DUREE_FRENTE = 60;
export const JOKERS = 3;
// La mèche de La Bomba : entre 15 et 40 secondes « de mèche » (en millisecondes). Pendant le tour de Kevin, elle brûle moins vite.
export const dureeMeche = (hasard = Math.random) => (15 + hasard() * 25) * 1000;

// L'indice d'un joker « ¡Ayuda! » : l'article et la première lettre de chaque mot, puis un trait par lettre.
// « la vaca » → « la v _ _ _ » ; « el oso de peluche » → « el o _ _   de   p _ _ _ _ _ _ ».
const PETITS = new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "y", "de", "del", "o", "a", "en"]);
export const indice = es => es.split(" ").map(w => PETITS.has(w.toLowerCase()) ? w
  : [...w].map((c, i) => i === 0 || !/\p{L}/u.test(c) ? c : "_").join(" ")).join("   ");

// La lettre imposée : une première lettre d'un mot du thème (sans l'article), donc toujours possible ; jamais deux fois de suite la même.
export function tirerLettre(mots, avant = "", hasard = Math.random) {
  const lettres = [...new Set(mots.map(m => {
    const w = m.es.replace(/^[¿¡]/, "").split(" ").find(x => !PETITS.has(x.toLowerCase())) || m.es;
    return w[0].toUpperCase();
  }))].filter(l => /\p{L}/u.test(l));
  const choix = lettres.length > 1 ? lettres.filter(l => l !== avant) : lettres;
  return choix[Math.floor(hasard() * choix.length)] || "";
}

// Le gage du perdant : les gages communs et ceux de la partenaire (Blanca : de couple ; Dorian : d'enfant).
// autre : le joueur qui n'a pas perdu, à qui le gage s'adresse.
export function tirerGage(gages, partenaire, autre, hasard = Math.random) {
  const liste = [...(gages.tous || []), ...(gages[partenaire] || [])];
  return (liste[Math.floor(hasard() * liste.length)] || "").replace(/\{autre\}/g, autre);
}

// ——— La Caseta de tiro ———
// La voix dit un mot espagnol, des cibles défilent sur 3 rails : on tire sur celle qui porte son sens (ou le mot écrit).
// Un jeu d'oreille. Les cibles, les rails et la voix sont dans ecrans/caseta.js ; ici, les mots, les niveaux et les points.
export const DUREE_CASETA = 60;
export const BONUS_OR = 30;        // la cible dorée : 30 points de plus…
export const TEMPS_OR = 3;         // … et 3 secondes de plus
export const UN_NOUVEAU_SUR = 5;   // « la suite du livre » : au plus un mot nouveau sur 5 mots entendus
export const SUITE_CASETA = 30;    // les 30 prochains mots du livre
export const PART_PIEGES = .4;     // en Experto, environ 4 mots entendus sur 10 sont des pièges de l'oreille

// Les 3 niveaux. vitesse : des cibles ; acc : ce que chaque bonne réponse de suite ajoute (jusqu'à 14) ;
// aide : la bonne cible s'allume après une erreur ; ecrit : le mot entendu est écrit sur le comptoir dès le début,
// au 2e « Otra vez », ou jamais ; penalite : secondes perdues par erreur ; voix : vitesse de la voix ; pieges : pièges mêlés.
export const NIVEAUX_CASETA = {
  tranquilo: { nom: "Tranquilo", quoi: "Pour s'échauffer. Lent. Après une erreur, la bonne cible s'allume. Le mot est écrit.",
    vitesse: .75, acc: .05, aide: true, ecrit: "debut", penalite: 0, voix: .85, pieges: false },
  normal: { nom: "Normal", quoi: "Pas d'aide après une erreur. Le mot s'écrit au 2e « Otra vez ».",
    vitesse: 1, acc: .07, aide: false, ecrit: "otra", penalite: 0, voix: .9, pieges: false },
  experto: { nom: "Experto", quoi: "Rapide. Des pièges : des mots qui sonnent presque pareil. Le mot n'est jamais écrit. Une erreur coûte 2 secondes.",
    vitesse: 1.35, acc: .09, aide: false, ecrit: "jamais", penalite: 2, voix: 1, pieges: true },
};
export const niveauCaseta = id => NIVEAUX_CASETA[id] || NIVEAUX_CASETA.normal;
// La vitesse des cibles : celle du niveau, qui monte avec le combo.
export const accelCaseta = (id, combo) => niveauCaseta(id).vitesse * (1 + Math.min(combo, 14) * niveauCaseta(id).acc);
export const pointsCaseta = (combo, or) => points(combo) + (or ? BONUS_OR : 0);

// Les pièges de l'oreille (themes.js) : chaque mot connaît son jumeau ({ es, fr, id, piege, famille, paire }).
export function motsPieges(pieges) {
  return pieges.flatMap(([a, fa, b, fb, famille], i) => {
    const x = { id: `piege:${i}:a`, es: a, fr: fa, famille, piege: true };
    const y = { id: `piege:${i}:b`, es: b, fr: fb, famille, piege: true };
    x.paire = y; y.paire = x;
    return [x, y];
  });
}

// Ce qu'on lit sur une cible, et son autre côté (montré quand on tire dessus) : le sens en français ou le mot espagnol.
export const texteCible = (m, sens) => sens === "es" ? m.es : court(m.fr);
export const autreCote = (m, sens) => sens === "es" ? court(m.fr) : m.es;

// Les 3 paquets. connus : mes mots ; aVenir : les mots du livre pas encore vus (dans l'ordre du livre) ; pieges : motsPieges(…).
// « La suite du livre » : les prochains mots, sauf ceux dont le sens ressemble à un mot connu (deux cibles « être »).
export function paquetsCaseta(connus, aVenir, pieges) {
  const sens = new Set(connus.map(m => cle(court(m.fr))));
  const suite = [];
  for (const m of aVenir || []) {
    if (suite.length === SUITE_CASETA) break;
    const k = cle(court(m.fr));
    if (!m.es || !k || sens.has(k)) continue;
    sens.add(k);
    suite.push({ ...m, nouveau: true });
  }
  const ouvert = connus.length >= SEUIL;
  return [
    { id: "tout", nom: "Tout ce que je sais", mots: connus, ouvert,
      aide: ouvert ? `${connus.length} mots` : `Il faut ${SEUIL} mots, tu en as ${connus.length}` },
    { id: "suite", nom: "Mes mots et la suite du livre", mots: [...connus, ...suite], ouvert: ouvert && suite.length > 0,
      aide: ouvert ? "Avec des mots nouveaux, un sur cinq au plus" : `Il faut ${SEUIL} mots, tu en as ${connus.length}` },
    { id: "pieges", nom: "Les pièges de l'oreille", mots: pieges, ouvert: pieges.length > 0,
      aide: "Des mots qui sonnent presque pareil : perro / pero, papá / papa…" },
  ];
}

// Peut-on faire entendre un mot nouveau maintenant ? Oui si, avec lui, il reste au plus un mot nouveau sur 5 entendus.
export const nouveauPermis = (entendus, nouveaux) => (nouveaux + 1) * UN_NOUVEAU_SUR <= entendus + 1;
// Le mot entendu est-il un piège ? Toujours avec le paquet des pièges ; en Experto, environ 4 fois sur 10.
export const piegeMaintenant = (paquet, niveau, hasard = Math.random) =>
  paquet === "pieges" || (niveauCaseta(niveau).pieges && hasard() < PART_PIEGES);
// Les mots trouvés qui comptent pour les mots attrapés : mes mots seulement (ni les pièges, ni les mots nouveaux).
export const trouvesCaseta = mots => mots.filter(m => m && m.id && !m.piege && !m.nouveau).map(m => m.id);
