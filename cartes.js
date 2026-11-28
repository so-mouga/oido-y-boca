// Les cartes d'un mot (chantier 15, 25 nov. ; revues le 28 nov., étape 3 des décisions) :
//   1. le mot (du français à l'espagnol, à dire puis à écrire) — automatique ;
//   3, 4 : les phrases à écrire en entier, du français vers l'espagnol (colonnes « phrase 1 (fr) », « phrase 1 (es) »,
//      « phrase 1 (aide) », « phrase 2 … » du Sheet) — seulement si je touche leur « + » (2 au plus) ;
//   5. « à l'oreille » (chantier 24) : la voix dit l'exemple du Sheet, je l'écris en entier — automatique, le lendemain du jour
//      où la carte 1 est réussie au rendez-vous des 3 jours (sa boîte passe de 2 à 3). Elle part de la boîte 0 (0, 1, 3, 7…).
// La carte 2 (la phrase à trou) n'est plus une carte : elle reste dans « Mes mots en cours » (trouDe). Les numéros ne changent pas
// (Q26-11) : les anciennes fiches « #2 » deviennent des cartes 5 au lancement (progression.js, migrerCartes2).
// La mémoire de chaque carte est dans progression.js (etat.mots), sous la clé du mot pour la carte 1, « id#3 », « id#4 »
// pour les phrases et « id#o » pour la carte 5. Chaque carte a son propre rythme ; une seule carte par mot et par jour.

import { conjuguer, ORDRE_TEMPS } from "./controles.js?v=82";
import { verbeDe } from "./dico.js?v=82";
import { INTERVALLES, apprisEnAvance } from "./progression.js?v=82";

// Le jour d'où compte la carte 1 d'un mot jamais revu : le jour de sa leçon, de son apprentissage en avance, ou de son ajout (mes mots).
export const departDe = ctx => m => m.moi ? m.le : apprisEnAvance(m.id) || ctx.pos.dateFaite[m.lecon];

export { INTERVALLES };
export const ORE = 5; // le numéro de la carte « à l'oreille »
export const cleCarte = (idMot, n) => n === 1 ? idMot : n === ORE ? `${idMot}#o` : `${idMot}#${n}`;

const jours = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
const echapper = t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Les formes du mot qu'on peut chercher dans l'exemple : sans article, sans parenthèses ni « … », au singulier et au pluriel ;
// pour un verbe, toutes ses formes conjuguées (aux temps que l'appli sait calculer), le reste de l'expression gardé
// (« hacer la compra » → « hago la compra »). Les plus longues d'abord.
function formesDe(m) {
  const brut = (m.es || "").replace(/\([^)]*\)/g, " ");
  const formes = new Set();
  for (const morceau of brut.split("/")) {
    const f = morceau.replace(/[¿?¡!]/g, "").replace(/…/g, " ").trim().replace(/^(el|la|los|las|un|una)\s+/i, "").replace(/\s+/g, " ").toLowerCase();
    if (!f) continue;
    formes.add(f);
    if (/ de$/.test(f)) formes.add(f + "l"); // « al lado de » → « al lado del dormitorio »
    if (!/\s/.test(f)) {
      if (/[aeiouáéó]$/.test(f)) formes.add(f + "s");
      else if (f.endsWith("z")) formes.add(f.slice(0, -1) + "ces");
      else formes.add(f.replace(/ó(n)$/, "o$1").replace(/é(s)$/, "e$1") + "es");
    }
  }
  const vb = verbeDe(m);
  if (vb) {
    const reste = brut.replace(/…/g, " ").trim().split(/\s+/).slice(1).join(" ").toLowerCase();
    // L'infinitif avec un pronom collé : « preocuparme », « felicitarlos », « respetarte ».
    for (const pr of ["me", "te", "se", "nos", "os", "lo", "la", "los", "las", "le", "les"]) formes.add(vb.inf + pr);
    for (const t of ORDRE_TEMPS) for (let p = 0; p < 6; p++) {
      let f;
      try { f = conjuguer(vb.inf, p, vb.d, t); } catch { continue; }
      if (!f) continue;
      formes.add(f);
      if (reste && !reste.includes("…")) formes.add(`${f} ${reste}`);
    }
  }
  return [...formes].sort((a, b) => b.length - a.length);
}

// La phrase à trou : l'exemple du Sheet avec le mot remplacé par « ___ ». Renvoie { phrase, reponse } ou null
// quand l'appli ne retrouve pas le mot dans l'exemple (alors le mot n'a pas de carte 5). Sert à la carte 5 (le mot de la carte)
// et à « Mes mots en cours ».
// La réponse garde la casse de l'exemple (« Vivo » en début de phrase).
const LETTRE = "\\p{L}";
export function trouDe(m) {
  const ex = m.ex || "";
  if (!ex) return null;
  for (const f of formesDe(m)) {
    const re = new RegExp(`(?<!${LETTRE})${echapper(f)}(?!${LETTRE})`, "iu");
    const r = re.exec(ex);
    if (r) return { phrase: ex.slice(0, r.index) + "___" + ex.slice(r.index + r[0].length), reponse: r[0] };
  }
  return null;
}

// Les phrases à écrire du mot (cartes 3, 4…) : [{ fr, es: [réponses acceptées], aide }]. « | » sépare plusieurs bonnes réponses.
export const phrasesDe = m => (m.phrases || []).filter(p => p.fr && p.es?.length).slice(0, 2);

// Le nombre de cartes du mot : la 1, la 5 s'il a un trou, puis une par phrase à écrire. (Les numéros restent fixes : 1, 3, 4, 5.)
export const nbCartes = m => m.moi ? 1 : 1 + (trouDe(m) ? 1 : 0) + phrasesDe(m).length;

// Toutes les cartes qui existent pour ce mot, avec leur fiche ({ boite, vu, dep }) ou null si pas encore là.
//   n = 1 : toujours (pas de fiche = jamais revue) ;
//   n = 3, 4 : si la phrase existe ; là seulement si je l'ai prise (sa fiche existe) ;
//   n = 5 (oreille) : s'il a un trou ; là si sa fiche existe, ou si la carte 1 est déjà en boîte 3 (sauvegarde d'avant le chantier 15).
// La carte 5 est à la fin de la liste (les écrans la rangent après la 1).
// Mes mots n'ont que la carte 1.
export function cartesDuMot(m, fiches) {
  const f1 = fiches[m.id] || null;
  const cartes = [{ n: 1, fiche: f1, la: true }];
  if (m.moi) return cartes;
  const trou = trouDe(m);
  if (trou) {
    const f5 = fiches[cleCarte(m.id, ORE)] || null;
    phrasesDe(m).forEach((p, i) => {
      const f = fiches[cleCarte(m.id, i + 3)] || null;
      cartes.push({ n: i + 3, fiche: f, phrase: p, la: !!f });
    });
    cartes.push({ n: ORE, fiche: f5, trou, oreille: true, la: !!f5 || (f1?.boite ?? 0) >= 3 });
    return cartes;
  }
  phrasesDe(m).forEach((p, i) => {
    const f = fiches[cleCarte(m.id, i + 3)] || null;
    cartes.push({ n: i + 3, fiche: f, phrase: p, la: !!f });
  });
  return cartes;
}

// Quand une carte revient : son retard en jours (≥ 0 : due aujourd'hui). La carte 1 jamais revue compte depuis depart(m) ;
// une carte avec une fiche pas encore vue, depuis sa date de départ ; la carte 5 débloquée sans fiche (vieille sauvegarde),
// depuis le dernier passage de la carte 1.
function retardDe(c, m, aujourdhui, depart, f1) {
  const f = c.fiche;
  const debut = f?.vu || f?.dep || (c.n === 1 ? depart(m) : c.oreille ? f1?.vu : null) || aujourdhui;
  return jours(debut, aujourdhui) - INTERVALLES[f?.boite ?? 0];
}

// Les cartes à revoir aujourd'hui, les plus en retard d'abord.
// Une carte que je viens de prendre avec « + » (jamais vue) arrive tout de suite, même si le mot est déjà passé aujourd'hui
// (Kevin, 25 nov. : « si j'appuie, elle doit apparaître tout de suite ») ; si j'en prends deux, les deux arrivent.
// Sinon, une seule carte par mot et par jour : un mot dont une carte est déjà passée aujourd'hui attend demain (même ratée :
// sinon « il te reste N » ne finirait jamais, et une carte du mot soufflerait la réponse de l'autre) ; parmi ses cartes dues,
// la plus en retard (à égalité, la plus petite).
// Renvoie [{ mot, n, retard, neuve, ...carte }] : d'abord les cartes prises avec « + », puis les plus en retard.
export function cartesARevoir(mots, fiches, aujourdhui, depart) {
  const dues = [];
  for (const m of mots) {
    const cartes = cartesDuMot(m, fiches).filter(c => c.la);
    const f1 = fiches[m.id];
    const avecRetard = c => ({ ...c, retard: Math.max(0, retardDe(c, m, aujourdhui, depart, f1)) });
    const neuves = cartes.filter(c => c.n >= 3 && !c.oreille && !c.fiche?.vu);
    if (neuves.length) { for (const c of neuves) dues.push({ mot: m, ...avecRetard(c), neuve: true }); continue; }
    if (cartes.some(c => c.fiche?.vu === aujourdhui)) continue;
    const candidates = cartes.map(c => ({ ...c, retard: retardDe(c, m, aujourdhui, depart, f1) })).filter(c => c.retard >= 0);
    if (!candidates.length) continue;
    const choisie = candidates.sort((a, b) => b.retard - a.retard || a.n - b.n)[0];
    dues.push({ mot: m, ...choisie, neuve: false });
  }
  // Les cartes que je viens de prendre avec « + » passent en tête : sinon, avec du retard,
  // elles attendraient derrière les cartes en retard.
  return dues.sort((a, b) => b.neuve - a.neuve || b.retard - a.retard);
}

// Pour le Livre et le Dico : où en est une carte. { etat: "absente" | "attend" | "revision" | "sue", texte }.
//   absente : carte 3/4 pas prise (le « + ») ; attend : carte 5 pas encore débloquée (« après la 1 ») ;
//   revision : dans « Tes mots à revoir » ; sue : réussie au rendez-vous des 3 jours (boîte ≥ 3).
export function etatCarte(c, m, aujourdhui, depart, fiches) {
  if (!c.la) return c.oreille ? { etat: "attend", texte: "après la 1" } : { etat: "absente", texte: "" };
  const f = c.fiche;
  if (!f?.vu && c.n >= 3 && !c.oreille) return { etat: "revision", texte: "aujourd'hui" }; // prise avec « + » : tout de suite
  if (!f?.vu && c.n === 1 && !depart(m)) return { etat: "revision", texte: "pas encore revue" };
  const vuAuj = cartesDuMot(m, fiches).some(x => x.fiche?.vu === aujourdhui);
  const retard = retardDe(c, m, aujourdhui, depart, fiches[m.id]);
  const dans = f?.vu === aujourdhui ? Math.max(-retard, 1) : vuAuj && retard >= 0 ? 1 : Math.max(-retard, 0);
  const texte = dans === 0 ? "aujourd'hui" : dans === 1 ? "demain" : `dans ${dans} j`;
  return { etat: (f?.boite ?? 0) >= 3 ? "sue" : "revision", texte: (f?.boite ?? 0) >= 3 ? `revient ${texte === "aujourd'hui" ? "aujourd'hui" : texte}` : texte };
}

// Q79 (chantier 21) : dans un paquet de la révision, une carte ratée (note 1) revient une fois à la fin du paquet.
// Ce 2e passage ne note rien (la carte reste ratée pour aujourd'hui et revient demain) et ne revient pas une 3e fois.
// Renvoie true si la note doit compter (1er passage). Les 2e passages sont toujours à la fin de items.
export function apresNote(items, i, note) {
  const it = items[i];
  if (it.repasse) return false;
  if (note === 1) items.push({ ...it, repasse: true });
  return true;
}
// Où en est le paquet : les vraies cartes (« 8 / 20 »), puis la reprise (« On la revoit · 1 / 3 »).
export function compteSerie(items, i) {
  const premiers = items.filter(x => !x.repasse).length;
  return i < premiers ? { repasse: false, n: i + 1, sur: premiers, premiers }
    : { repasse: true, n: i - premiers + 1, sur: items.length - premiers, premiers };
}
