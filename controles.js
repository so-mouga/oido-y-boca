// Les contrôles blancs : un par unité, pour préparer le vrai contrôle avec le prof.
// Les phrases sont écrites à l'avance, n'utilisent que ce qui a été vu dans l'unité,
// et ont été relues par Blanca (liste du 22 nov.). L'appli tire les questions au hasard à chaque essai.
//
// ecrit : les thèmes de la partie écrite. Chaque thème a des groupes de phrases et un nombre de questions :
//         on prend autant dans chaque groupe (nb / nombre de groupes), puis on complète au hasard.
//         Pour « mots », les questions viennent des mots de l'unité dans le tableau.
// Une phrase : { fr, es: [réponses acceptées], expl } ; pour le présent, { fr, v, p, es } et l'explication
// se construit toute seule à partir du verbe (v) et de la personne (p : 0 = yo … 5 = ellos).

import { md } from "./ui.js?v=23";

const PERSONNES = ["yo", "tú", "él, ella", "nosotros", "vosotros", "ellos, ellas"];
const TERMINAISONS = {
  ar: ["o", "as", "a", "amos", "áis", "an"],
  er: ["o", "es", "e", "emos", "éis", "en"],
  ir: ["o", "es", "e", "imos", "ís", "en"],
};
const IRREGULIERS = {
  ser: ["soy", "eres", "es", "somos", "sois", "son"],
  estar: ["estoy", "estás", "está", "estamos", "estáis", "están"],
};

// « *vivir*, avec *vosotros* : viv + **ís**. Les verbes en -ir : -o, -es, -e, -imos, -ís, -en. »
export function explicationConjugaison(v, p) {
  const avec = `*${v}*, avec *${PERSONNES[p]}*`;
  if (IRREGULIERS[v]) return `${avec} : **${IRREGULIERS[v][p]}**. *${v[0].toUpperCase() + v.slice(1)}* : ${IRREGULIERS[v].join(", ")}.`;
  const g = v.slice(-2);
  // Le tiret insécable (‑) garde « -imos » en un seul morceau en fin de ligne.
  return `${avec} : ${v.slice(0, -2)} + **${TERMINAISONS[g][p]}**. Les verbes en ‑${g} : ${TERMINAISONS[g].map(t => `‑${t}`).join(", ")}.`;
}

const ESTAR_LIEU = "*Estar* : le lieu où l'on se trouve.";
const EN_LIEU = "« À » ou « dans » + un lieu se dit **en** (pour être ou habiter quelque part).";

export const CONTROLES = {
  U1: {
    verifie: [
      "le présent des 3 groupes, à toutes les personnes",
      "*ser* / *estar*",
      "*en* et *desde hace*",
      "les 30 mots",
      "ta présentation d'1 minute, à l'écrit puis à l'oral",
    ],
    ecrit: [
      {
        nom: "Le présent", consigne: "Complète", nb: 10,
        groupes: [
          [
            { fr: "Yo ___ desde casa.", v: "trabajar", p: 0, es: ["trabajo"] },
            { fr: "¿Tú ___ inglés?", v: "hablar", p: 1, es: ["hablas"] },
            { fr: "Mi cuñado ___ en una empresa.", v: "trabajar", p: 2, es: ["trabaja"] },
            { fr: "Vosotros ___ muy rápido.", v: "hablar", p: 4, es: ["habláis"] },
            { fr: "Mis primos ___ español.", v: "hablar", p: 5, es: ["hablan"] },
          ],
          [
            { fr: "Yo ___ con mis suegros.", v: "comer", p: 0, es: ["como"] },
            { fr: "¿Tú ___ español?", v: "aprender", p: 1, es: ["aprendes"] },
            { fr: "Mi hermana ___ en el despacho.", v: "comer", p: 2, es: ["come"] },
            { fr: "Nosotros ___ español.", v: "aprender", p: 3, es: ["aprendemos"] },
            { fr: "Vosotros ___ en casa.", v: "comer", p: 4, es: ["coméis"] },
          ],
          [
            { fr: "Yo ___ en Huesca.", v: "vivir", p: 0, es: ["vivo"] },
            { fr: "¿Dónde ___ tú?", v: "vivir", p: 1, es: ["vives"] },
            { fr: "Mi cuñada ___ en un pueblo.", v: "vivir", p: 2, es: ["vive"] },
            { fr: "Vosotros ___ en un piso.", v: "vivir", p: 4, es: ["vivís"] },
            { fr: "Mis primos ___ en la ciudad.", v: "vivir", p: 5, es: ["viven"] },
          ],
          [
            { fr: "Yo ___ francés.", v: "ser", p: 0, es: ["soy"] },
            { fr: "Nosotros ___ hermanos.", v: "ser", p: 3, es: ["somos"] },
            { fr: "Vosotros ___ españoles.", v: "ser", p: 4, es: ["sois"] },
            { fr: "Mis primos ___ franceses.", v: "ser", p: 5, es: ["son"] },
          ],
          [
            { fr: "Yo ___ cansado.", v: "estar", p: 0, es: ["estoy"] },
            { fr: "¿Dónde ___ tú?", v: "estar", p: 1, es: ["estás"] },
            { fr: "Nosotros ___ en casa.", v: "estar", p: 3, es: ["estamos"] },
            { fr: "Vosotros ___ en el despacho.", v: "estar", p: 4, es: ["estáis"] },
            { fr: "Mis suegros ___ en la boda.", v: "estar", p: 5, es: ["están"] },
          ],
        ],
      },
      {
        nom: "Ser / estar", consigne: "Complète avec ser ou estar", nb: 5,
        groupes: [[
          { fr: "Blanca ___ española.", es: ["es"], expl: "*Ser* : la nationalité." },
          { fr: "¿Tú ___ francés?", es: ["eres"], expl: "*Ser* : la nationalité." },
          { fr: "Blanca ___ mi pareja.", es: ["es"], expl: "*Ser* : qui est la personne (la relation)." },
          { fr: "Huesca ___ una ciudad pequeña.", es: ["es"], expl: "*Ser* : dire ce qu'est une chose." },
          { fr: "Yo ___ en mi despacho.", es: ["estoy"], expl: ESTAR_LIEU },
          { fr: "Mis suegros ___ en el pueblo.", es: ["están"], expl: ESTAR_LIEU },
          { fr: "Hoy nosotros ___ cansados.", es: ["estamos"], expl: "*Estar* : un état du moment (la fatigue)." },
          { fr: "¿Dónde ___ Blanca?", es: ["está"], expl: ESTAR_LIEU },
        ]],
      },
      {
        nom: "En, desde hace", consigne: "Traduis", nb: 3,
        groupes: [
          [
            { fr: "J'habite à Huesca.", es: ["Vivo en Huesca."],
              expl: "« À » + une ville se dit **en** pour être ou habiter quelque part : *vivo en Huesca* (pas « a »)." },
            { fr: "Mes beaux-parents habitent dans un village.", es: ["Mis suegros viven en un pueblo."], expl: EN_LIEU },
            { fr: "Je travaille dans une entreprise française.", es: ["Trabajo en una empresa francesa.", "Trabajo para una empresa francesa."],
              expl: "« Dans » + un lieu se dit **en** (pour être ou habiter quelque part)." },
          ],
          [
            { fr: "Je travaille à la maison depuis un an.",
              es: ["Trabajo en casa desde hace un año.", "Trabajo desde casa desde hace un año.", "Hace un año que trabajo en casa.", "Llevo un año trabajando en casa."],
              expl: "« Depuis » + une durée se dit **desde hace** (pas « durante »)." },
            { fr: "Mon cousin habite en Espagne depuis un an.", es: ["Mi primo vive en España desde hace un año."],
              expl: "« En » + un pays se dit **en**, et « depuis » + une durée se dit **desde hace**." },
          ],
        ],
      },
      { nom: "Les mots", consigne: "Traduis", nb: 10, mots: true },
    ],
    // Les 6 points de la présentation, les mêmes sur tous les écrans.
    points: [
      "Mon nom et ma nationalité (*soy*)",
      "Mon âge (*tengo … años*)",
      "Où je vis, depuis quand (*en*, *desde hace*)",
      "Mon travail",
      "Ma famille (*ser* / *estar*)",
      "Un petit mot (*pero, también, todavía, ya, porque*)",
    ],
    // « Treinta y seis » est une exception : les nombres au-delà de 20 arrivent à l'unité 2.
    modele: "Me llamo Kevin y soy francés. Tengo treinta y seis años. Vivo en Huesca desde hace cinco años, en un piso. "
      + "Trabajo desde casa, en francés y en inglés. Blanca es mi pareja. Nos casamos en junio. Mis suegros viven en un pueblo. "
      + "Entiendo un poco, pero todavía no hablo mucho. Aprendo español porque Blanca es española.",
  },
};

export const nbQuestions = c => c.ecrit.reduce((n, t) => n + t.nb, 0);

const melanger = t => {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

// Un mot du tableau en question : « le quartier » → « el barrio » ou « barrio » ;
// « el hermano / la hermana » → chaque forme, avec ou sans article.
function reponsesMot(es) {
  const formes = [es, ...es.split(/\s*\/\s*/)];
  const sansArticle = formes.map(f => f.replace(/^(el|la|los|las)\s+/i, ""));
  return [...new Set([...formes, ...sansArticle])];
}

// Tire les questions de la partie écrite, thème après thème.
export function tirerEcrit(c, motsUnite) {
  return c.ecrit.flatMap(t => {
    let choisies;
    if (t.mots) {
      choisies = melanger(motsUnite).slice(0, t.nb).map(m => ({ fr: m.fr, es: reponsesMot(m.es), exemple: m.ex }));
    } else {
      const parGroupe = Math.floor(t.nb / t.groupes.length);
      const prises = t.groupes.map(g => melanger(g));
      choisies = prises.flatMap(g => g.slice(0, parGroupe));
      choisies.push(...melanger(prises.flatMap(g => g.slice(parGroupe))).slice(0, t.nb - choisies.length));
      choisies = melanger(choisies).map(q => q.v
        ? { fr: `${q.fr} (${q.v})`, es: q.es, expl: explicationConjugaison(q.v, q.p) }
        : q);
    }
    return choisies.map(q => ({ type: "ecrire", controle: true, theme: t.nom, consigne: t.consigne, ...q }));
  });
}

// La bonne réponse, comme on l'affiche dans « Tes erreurs » : la phrase complétée, ou la traduction.
export function phraseJuste(q) {
  if (q.fr.includes("___")) return md(q.fr.replace(/\s*\([^)]*\)\s*$/, "").replace("___", `**${q.es[0]}**`));
  return `<b>${md(q.es[0])}</b>`;
}
