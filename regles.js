// Les règles d'une ligne (chantier 18, Q18-2) : une seule version de chaque règle, la même partout.
// La page de leçon montre toutes les lignes de la leçon ; l'exercice raté, seulement celles des mots ratés ;
// la carte retournée, la ligne de son mot ; le Dico, la ligne du verbe.
//
// Une ligne : { texte, mots } ; texte en markdown léger (**gras**, *italique*), mots = ce qu'elle concerne (« desde hace »).
//   { verbe: "ar" } : la ligne d'un groupe de verbes (VERBES ci-dessous) ; { irr: "ser" } : celle d'un verbe irrégulier.
// Le prof fait foi (Q18-3) : quand sa leçon le dit mieux, on remplace la ligne ici.
// Les unités 1 à 3 sont écrites à la main. Les autres leçons sont découpées dans la grammaire du livre
// (PROGRAMME.md, aux « ; »), en attendant d'être écrites quand on y arrive (Q18-10).

import { PARTIES } from "./livre.js?v=83";

// Les verbes : la ligne du Dico, de la carte du verbe, de la leçon et de l'explication de conjugaison (Q18-6, Q18-11).
// Le tiret insécable (‑) garde « ‑imos » en un seul morceau en fin de ligne.
export const VERBES = {
  ar: { lecon: "U1-L1", texte: "Les verbes en **‑ar** : on enlève ‑ar, on ajoute **‑o, ‑as, ‑a, ‑amos, ‑áis, ‑an**." },
  // -ir : la phrase du prof le 25 nov., après « vivemos » (Q59).
  ir: { lecon: "U1-L3", texte: "Les verbes en **‑ir** : comme les ‑er (*como, comes*…), sauf *nosotros* → **‑imos** et *vosotros* → **‑ís**." },
  er: { lecon: "U1-L5", texte: "Les verbes en **‑er** : on enlève ‑er, on ajoute **‑o, ‑es, ‑e, ‑emos, ‑éis, ‑en**." },
  se: { lecon: "U3-L1", texte: "Un verbe en -se : devant le verbe, me, te, se, nos, os, se." },
  ue: { lecon: "U3-L4", texte: "Le **o** devient **ue** (*puedo, vuelvo, duermo*), sauf avec nosotros et vosotros (*podemos*)." },
  ie: { lecon: "U3-L5", texte: "Le **e** devient **ie** (*quiero, empiezo*), sauf avec nosotros et vosotros." },
  i: { lecon: "U6-L2", texte: "Le **e** devient **i** (*pido, pides, pide*), sauf avec nosotros et vosotros." },
  gustar: { lecon: "U6-L1", texte: "Comme *gustar* : le verbe ne change pas, c'est le petit mot devant qui dit à qui (me, te, le, nos, os, les)." },
};

// Ce qui est irrégulier, dit précisément (vérifié forme par forme avec IRREGULIERS, controles.js).
// Les irréguliers absents d'ici : « Verbe irrégulier : ses 6 formes s'apprennent par cœur » (dico.js).
export const CE_QUI_CHANGE = {
  ser: "Pour dire qui on est et comment on est. Irrégulier : **soy, eres, es, somos, sois, son**.",
  estar: "Pour dire où on est et comment on va. Irrégulier : **estoy, estás, está, estamos, estáis, están**.",
  ir: "Irrégulier : **voy, vas, va, vamos, vais, van**. Puis **a** pour dire où (*voy al gimnasio* : *a + el = al*).",
  hacer: "Seul *yo* est irrégulier : **hago**. Le reste suit la règle des -er.",
  poner: "Seul *yo* est irrégulier : **pongo**. Le reste suit la règle des -er.",
  traer: "Seul *yo* est irrégulier : **traigo**. Le reste suit la règle des -er.",
  salir: "Seul *yo* est irrégulier : **salgo**. Le reste suit la règle des -ir.",
  dar: "*Yo* est irrégulier : **doy**. Le reste suit la règle des -ar, mais *vosotros dais* n'a pas d'accent.",
  tener: "*Yo* est irrégulier : **tengo**. Ensuite, le e devient ie (*tienes*…), sauf avec nosotros et vosotros.",
  venir: "*Yo* est irrégulier : **vengo**. Ensuite, le e devient ie (*vienes*…), sauf avec nosotros et vosotros.",
  decir: "*Yo* est irrégulier : **digo**. Ensuite, le e devient i (*dices*…), sauf avec nosotros et vosotros.",
  jugar: "Le u devient ue (*juego*…), sauf avec nosotros et vosotros. C'est le seul verbe qui fait ça.",
  ver: "Seul *yo* est irrégulier : **veo**. Attention : *vosotros veis*, sans accent.",
  enviar: "Le i prend un accent (*envío, envías*…), sauf avec nosotros et vosotros. Le reste suit la règle des -ar.",
  recoger: "Seul *yo* change : **recojo** (le g devient j pour garder le son). Le reste suit la règle des -er.",
  crecer: "Seul *yo* est irrégulier : **crezco**. Le reste suit la règle des -er.",
  conducir: "Seul *yo* est irrégulier : **conduzco**. Le reste suit la règle des -ir.",
  caer: "Seul *yo* est irrégulier : **caigo**. Le reste suit la règle des -er.",
  conocer: "Seul *yo* est irrégulier : **conozco**. Le reste suit la règle des -er.",
  saber: "Seul *yo* est irrégulier : **sé**. Le reste suit la règle des -er.",
  "freír": "Le e devient í, avec un accent (*frío, fríes, fríe*), sauf avec nosotros et vosotros (*freímos, freís*).",
};

const SER = ["soy", "eres", "es", "somos", "sois", "son"];
const ESTAR = ["estoy", "estás", "está", "estamos", "estáis", "están"];
const JOURS = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const MOIS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Les lignes écrites à la main (unités 1 à 3), d'après la grammaire du livre et, pour U1-L3, la version du prof.
const ECRITES = {
  "U1-L1": [{ verbe: "ar" }],
  "U1-L2": [
    { irr: "ser" },
    { texte: "Pour dire son prénom : **me llamo**, **te llamas**, **se llama**.", mots: ["me llamo", "te llamas", "se llama", "llamo", "llamas", "llama"] },
    { texte: "L'âge se dit avec **tener** : *tengo … años*.", mots: ["tengo", "tienes", "tiene", "años"] },
  ],
  "U1-L3": [
    { verbe: "ir" },
    { texte: "**en** pour le lieu où l'on est, jamais *a* : *vivo en Huesca*.", mots: ["en"] },
    { texte: "**desde hace** + une durée, avec le verbe au présent. Jamais *durante*.", mots: ["desde hace"] },
  ],
  "U1-L4": [{ irr: "estar" }],
  "U1-L5": [
    { verbe: "er" },
    { texte: "**ser** : qui on est, comment on est. **estar** : où on est, comment on va.", mots: [...SER, ...ESTAR] },
  ],
  "U1-L6": [
    { texte: "Révision : les 3 groupes (‑ar, ‑er, ‑ir) à toutes les personnes.", mots: [] },
    { texte: "**pero** = mais ; *perro* = chien.", mots: ["pero", "perro"] },
  ],
  "U2-L1": [
    { texte: "Les nombres de 0 à 20.", mots: [] },
    { irr: "tener" },
  ],
  "U2-L2": [
    { texte: "Les nombres de 20 à 100 : *veintiuno* en un seul mot, puis le **y** seulement entre les dizaines et les unités (*treinta y uno, cuarenta y cinco*).", mots: ["y"] },
    { texte: "Les numéros de téléphone se disent par 2 ou 3 chiffres.", mots: [] },
  ],
  "U2-L3": [
    { texte: "L'heure : **es la una**, puis **son las** (*son las ocho*).", mots: ["es la una", "son las"] },
    { texte: "Les minutes : *y cuarto*, *y media*, *menos cuarto*.", mots: ["y cuarto", "y media", "menos cuarto"] },
    { texte: "**a las** pour un rendez-vous : *a las dos*.", mots: ["a las", "a la una"] },
    { texte: "*de la mañana*, *de la tarde* : du matin, de l'après-midi.", mots: ["de la mañana", "de la tarde"] },
  ],
  "U2-L4": [
    { texte: "Les jours s'écrivent sans majuscule : *lunes … domingo*.", mots: JOURS },
    { texte: "**el lunes** = lundi qui vient ; **los lunes** = tous les lundis.", mots: JOURS.flatMap(j => [`el ${j}`, `los ${j.replace(/o$/, "os")}`]) },
    { texte: "*mañana* = demain ; *la mañana* = le matin.", mots: ["mañana", "la mañana"] },
  ],
  "U2-L5": [
    { texte: "Les mois s'écrivent sans majuscule : *enero … diciembre*.", mots: MOIS },
    { texte: "La date : **el** + le jour + **de** + le mois (*el diecinueve de junio*).", mots: MOIS.map(m => `de ${m}`) },
    { texte: "Les années : *dos mil veintisiete*.", mots: ["dos mil"] },
    { texte: "Pour demander la date : *¿Qué día es hoy?*", mots: ["qué día es hoy"] },
  ],
  "U3-L1": [{ verbe: "se" }],
  "U3-L2": [
    { texte: "En Espagne, on déjeune vers 14 h et on dîne vers 21 h.", mots: [] },
    { texte: "*comer* veut dire manger **et** déjeuner.", mots: ["comer", "como", "comes", "come", "comemos", "coméis", "comen"] },
    { texte: "Les repas sans « prendre » : *desayunar, comer, merendar, cenar* (pas de *tomar la cena*).",
      mots: ["desayunar", "desayuno", "desayunamos", "merendar", "meriendo", "merendamos", "cenar", "ceno", "cenamos", "tomar"] },
  ],
  "U3-L3": [
    { texte: "**antes de** / **después de** + l'infinitif : *antes de comer*.", mots: ["antes de", "después de", "antes", "después"] },
    { texte: "*tarde* = tard ; *la tarde* = l'après-midi.", mots: ["tarde", "la tarde"] },
  ],
  "U3-L4": [{ verbe: "ue" }],
  "U3-L5": [
    { verbe: "ie" },
    { texte: "*nunca* se met avant le verbe : *nunca ceno tarde*.", mots: ["nunca"] },
  ],
  "U3-L6": [{ irr: "ir" }],
};

// Les autres leçons : la grammaire du livre coupée aux « ; », chaque morceau avec une majuscule et un point.
// Ce qu'une ligne concerne : ce qui est en gras ou en italique, coupé aux / , + ≠ = → (« *tarde* (tard) ≠ *la tarde* »).
const TERMES = /\*\*([^*]+)\*\*|(?<!\*)\*([^*]+)\*(?!\*)/g;
const termesDe = t => [...t.matchAll(TERMES)].flatMap(m => (m[1] || m[2]).split(/[\/,+≠=→:]| et | ou /))
  .map(x => x.replace(/[…¿¡?!.()«»]/g, " ").trim()).filter(Boolean);
// On ne coupe pas dans une parenthèse (« (*salgo, digo, vengo* ; *dice, viene*) »).
// On coupe aussi après un point suivi d'un gras (« …les noms. **es que** … », U21-L1). Un « 1) » sans « ( » ne
// fait pas descendre le compteur sous 0 (U21-L5).
const couper = g => { const out = []; let d = 0, debut = 0;
  for (let i = 0; i < g.length; i++) {
    if (g[i] === "(") d++; else if (g[i] === ")") d = Math.max(0, d - 1);
    else if (d === 0 && g.startsWith(" ; ", i)) { out.push(g.slice(debut, i)); debut = i + 3; }
    else if (d === 0 && g.startsWith(". **", i)) { out.push(g.slice(debut, i + 1)); debut = i + 2; }
  }
  return [...out, g.slice(debut)]; };
const decoupees = g => couper(g || "").map(x => x.trim()).filter(Boolean)
  .map(x => x.charAt(0).toUpperCase() + x.slice(1)).map(x => /[.!?…»)]$/.test(x) ? x : `${x}.`)
  .map(texte => ({ texte, mots: termesDe(texte) }));

// Deux fautes recopiées du livre, corrigées à l'affichage seulement (PROGRAMME.md reste tel quel).
const CORRECTIONS = {
  "U16-L5": ["même terminaisons", "mêmes terminaisons"],
  "U20-L2": ["trois formes spéciales", "deux formes spéciales"],
};
const corrigee = l => CORRECTIONS[l.id] ? (l.grammaire || "").replace(...CORRECTIONS[l.id]) : l.grammaire;

// Les lignes qui tombent sur une carte par le mot mais pas par le sens : la carte ne les montre pas.
// ¡vaya! (ça alors) n'est pas le subjonctif de ir ; *No, claro* seul est trompeur ; na', pa', to' sont de la prononciation.
export const PAS_SUR_LA_CARTE = {
  "vaya": ["U22-L1"],
  "claro": ["U17-L4"],
  "nada": ["U21-L3"],
  "para": ["U21-L3"],
  "todo": ["U21-L3"],
};

const LECONS = Object.fromEntries(PARTIES.flatMap(p => p.unites.flatMap(u => u.lecons)).map(l => [l.id, l]));

const texteIrr = inf => CE_QUI_CHANGE[inf] || "Verbe irrégulier : ses 6 formes s'apprennent par cœur.";

// Les lignes d'une leçon, prêtes : { texte, mots, lecon, verbe?, irr? }. [] pour une leçon inconnue.
export function lignesDe(idLecon) {
  const l = LECONS[idLecon];
  if (!l) return [];
  return (ECRITES[idLecon] || decoupees(corrigee(l))).map(x =>
    x.verbe ? { ...x, lecon: idLecon, texte: VERBES[x.verbe].texte, mots: [] }
    : x.irr ? { ...x, lecon: idLecon, texte: texteIrr(x.irr), mots: [] }
    : { ...x, lecon: idLecon });
}

// La ligne telle que la page de leçon l'écrit : un irrégulier est nommé devant (« *Ser* : pour dire qui on est… »).
export const texteDansLaLecon = x => x.irr
  ? `*${x.irr.charAt(0).toUpperCase() + x.irr.slice(1)}* : ${x.texte.charAt(0).toLowerCase() + x.texte.slice(1)}`
  : x.texte;

// Toutes les leçons qui ont une ligne, dans l'ordre du livre.
export const toutesLesLecons = () => Object.keys(LECONS);
