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
  fois: {}, jours: [], surprises: {}, gardes: {}, muet: false, paquet: "tout" });

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
// Au plus 2 mots gardés par jour : ensuite, plus de mot surprise ce jour-là.
export const GARDES_PAR_JOUR = 2;
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
