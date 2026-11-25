// Les 4 cartes d'un mot (chantier 15, 25 nov.) :
//   1. le mot (la carte d'avant, du français à l'espagnol, à dire) — automatique ;
//   2. la phrase à trou : l'exemple du Sheet, le mot caché, à écrire — automatique, une fois la carte 1 réussie
//      au rendez-vous des 3 jours (sa boîte passe de 2 à 3) ;
//   3, 4… : les phrases à écrire en entier, du français vers l'espagnol (colonnes « phrase 1 (fr) », « phrase 1 (es) »,
//      « phrase 1 (aide) », « phrase 2 … » du Sheet) — seulement si je touche leur « + ». Une colonne « phrase 3 » donnerait une carte 5.
// La mémoire de chaque carte est dans progression.js (etat.mots), sous la clé du mot pour la carte 1 (les anciennes sauvegardes
// restent bonnes) et « id#n » pour les autres. Chaque carte a son propre rythme ; une seule carte par mot et par jour.

import { conjuguer, ORDRE_TEMPS } from "./controles.js?v=69";
import { verbeDe } from "./dico.js?v=69";
import { INTERVALLES, apprisEnAvance } from "./progression.js?v=69";

// Le jour d'où compte la carte 1 d'un mot jamais revu : le jour de sa leçon, de son apprentissage en avance, ou de son ajout (mes mots).
export const departDe = ctx => m => m.moi ? m.le : apprisEnAvance(m.id) || ctx.pos.dateFaite[m.lecon];

export { INTERVALLES };
export const cleCarte = (idMot, n) => n === 1 ? idMot : `${idMot}#${n}`;

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

// La carte 2 : l'exemple du Sheet avec le mot remplacé par « ___ ». Renvoie { phrase, reponse } ou null
// quand l'appli ne retrouve pas le mot dans l'exemple (alors le mot n'a pas de carte 2).
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
export const phrasesDe = m => (m.phrases || []).filter(p => p.fr && p.es?.length);

// Le nombre de cartes du mot : 1, 2 s'il a un trou, puis une par phrase à écrire.
// (Les numéros restent fixes : sans trou, les phrases gardent les numéros 3 et 4.)
export const nbCartes = m => m.moi ? 1 : phrasesDe(m).length ? 2 + phrasesDe(m).length : trouDe(m) ? 2 : 1;

// Toutes les cartes qui existent pour ce mot, avec leur fiche ({ boite, vu, dep }) ou null si pas encore là.
//   n = 1 : toujours (pas de fiche = jamais revue) ;
//   n = 2 : s'il a un trou ; là si sa fiche existe, ou si la carte 1 est déjà en boîte 3 (sauvegarde d'avant le chantier) ;
//   n ≥ 3 : si la phrase existe ; là seulement si je l'ai prise (sa fiche existe).
// Mes mots n'ont que la carte 1.
export function cartesDuMot(m, fiches) {
  const f1 = fiches[m.id] || null;
  const cartes = [{ n: 1, fiche: f1, la: true }];
  if (m.moi) return cartes;
  const trou = trouDe(m);
  if (trou) {
    const f2 = fiches[cleCarte(m.id, 2)] || null;
    cartes.push({ n: 2, fiche: f2, trou, la: !!f2 || (f1?.boite ?? 0) >= 3 });
  }
  phrasesDe(m).forEach((p, i) => {
    const f = fiches[cleCarte(m.id, i + 3)] || null;
    cartes.push({ n: i + 3, fiche: f, phrase: p, la: !!f });
  });
  return cartes;
}

// Quand une carte revient : son retard en jours (≥ 0 : due aujourd'hui). La carte 1 jamais revue compte depuis depart(m) ;
// la carte 2 débloquée sans fiche, depuis le dernier passage de la carte 1.
function retardDe(c, m, aujourdhui, depart, f1) {
  const f = c.fiche;
  const debut = f?.vu || f?.dep || (c.n === 1 ? depart(m) : c.n === 2 ? f1?.vu : null) || aujourdhui;
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
    const neuves = cartes.filter(c => c.n >= 3 && !c.fiche?.vu);
    if (neuves.length) { for (const c of neuves) dues.push({ mot: m, ...avecRetard(c), neuve: true }); continue; }
    if (cartes.some(c => c.fiche?.vu === aujourdhui)) continue;
    const candidates = cartes.map(c => ({ ...c, retard: retardDe(c, m, aujourdhui, depart, f1) })).filter(c => c.retard >= 0);
    if (!candidates.length) continue;
    const choisie = candidates.sort((a, b) => b.retard - a.retard || a.n - b.n)[0];
    dues.push({ mot: m, ...choisie, neuve: false });
  }
  // Les cartes que je viens de prendre avec « + » passent en tête : sinon, avec du retard et le plafond de 40,
  // elles attendraient des jours derrière les cartes en retard.
  return dues.sort((a, b) => b.neuve - a.neuve || b.retard - a.retard);
}

// Pour le Livre et le Dico : où en est une carte. { etat: "absente" | "attend" | "revision" | "sue", texte }.
//   absente : carte 3/4 pas prise (le « + ») ; attend : carte 2 pas encore débloquée ;
//   revision : dans « Tes mots à revoir » ; sue : réussie au rendez-vous des 3 jours (boîte ≥ 3).
export function etatCarte(c, m, aujourdhui, depart, fiches) {
  if (!c.la) return c.n === 2 ? { etat: "attend", texte: "après la 1" } : { etat: "absente", texte: "" };
  const f = c.fiche;
  if (!f?.vu && c.n >= 3) return { etat: "revision", texte: "aujourd'hui" }; // prise avec « + » : tout de suite
  if (!f?.vu && c.n === 1 && !depart(m)) return { etat: "revision", texte: "pas encore revue" };
  const vuAuj = cartesDuMot(m, fiches).some(x => x.fiche?.vu === aujourdhui);
  const retard = retardDe(c, m, aujourdhui, depart, fiches[m.id]);
  const dans = f?.vu === aujourdhui ? Math.max(-retard, 1) : vuAuj && retard >= 0 ? 1 : Math.max(-retard, 0);
  const texte = dans === 0 ? "aujourd'hui" : dans === 1 ? "demain" : `dans ${dans} j`;
  return { etat: (f?.boite ?? 0) >= 3 ? "sue" : "revision", texte: (f?.boite ?? 0) >= 3 ? `revient ${texte === "aujourd'hui" ? "aujourd'hui" : texte}` : texte };
}
