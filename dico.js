// Ton dico : les mots et expressions des leçons faites (les cartes du Sheet), sans les phrases des exercices.
// Ici : les sortes de mots, la recherche, et ce que l'appli sait de chaque verbe.
// Les écrans sont dans ecrans/dico.js.

import { irregulierConnu } from "./controles.js?v=31";

// Les sortes du sommaire, et les catégories du Sheet qui vont dedans.
// « Mes mots » (chantier 3) : ses mots viendront du téléphone, pas du Sheet ; la ligne reste cachée tant qu'elle est vide.
export const SORTES = [
  { cle: "verbes", nom: "Verbes", tag: "verbe", cats: ["verbe"] },
  { cle: "noms", nom: "Noms", tag: "nom", cats: ["nom"] },
  { cle: "adjectifs", nom: "Adjectifs", tag: "adjectif", cats: ["adjectif"] },
  { cle: "expressions", nom: "Expressions", tag: "expression", cats: ["expression", "question"] },
  { cle: "petits-mots", nom: "Petits mots", tag: "petit mot", cats: ["adverbe", "mot-outil"] },
  { cle: "mes-mots", nom: "Mes mots", tag: "à toi", cats: [] },
];
// Une catégorie inconnue (une nouvelle valeur dans le Sheet) va dans « Expressions » plutôt que de disparaître.
export const sorteDe = m => SORTES.find(s => s.cats.includes((m.categorie || "").trim().toLowerCase())) || SORTES[3];

// Les mots du Dico : ceux des leçons faites, dans l'ordre du Sheet (celui du livre).
export const motsDuDico = ctx => ctx.mots.filter(m => ctx.pos.faites.has(m.lecon));

// La recherche ne tient compte ni des accents, ni des majuscules, ni de ¿ ¡ ? ! … : « etre » trouve « être ».
export const normaliser = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[¿¡?!…«»"().,;:=]/g, " ").replace(/\s+/g, " ").trim();

// Cherche dans l'espagnol et le français. D'abord les mots dont un mot commence par la recherche, puis les autres.
export function chercher(mots, texte) {
  const q = normaliser(texte);
  if (!q) return [];
  return mots.map(m => {
    const t = `${normaliser(m.es)} | ${normaliser(m.fr)}`;
    if (!t.includes(q)) return null;
    return { m, rang: ` ${t}`.includes(` ${q}`) ? 0 : 1 };
  }).filter(Boolean).sort((a, b) => a.rang - b.rang).map(x => x.m);
}

// ── Les verbes ──
// Le Sheet ne dit pas si un verbe est régulier. Les deux listes ci-dessous le disent pour les 160 verbes du Sheet,
// vérifiés un par un le 23 nov. 2026 (sans -se : « levantarse » → levantar).
// Un verbe qui n'est dans aucune des deux (ajouté au Sheet plus tard) n'a pas de formes : l'appli n'invente rien.
// Pour lui donner ses formes, le vérifier puis l'ajouter à l'une des deux listes.
const REGULIERS = new Set(`abrir aceptar aclarar acompañar acostumbrar adaptar adelgazar ahorrar alegrar alquilar apagar aprender
  apuntar arreglar avisar añadir bailar bajar bañar beber brindar cambiar cancelar casar cenar cocinar coincidir comer compartir
  confirmar contestar correr cortar creer cuidar cumplir currar decidir dejar desayunar descansar discutir duchar durar emocionar
  enamorar ensayar enterar entrenar equivocar esconder escribir esperar estirar explicar felicitar firmar flipar ganar grabar
  gritar invitar jubilar lavar leer levantar ligar llamar llegar llevar llorar mejorar mezclar mirar molestar mudar necesitar
  ocurrir odiar olvidar opinar organizar pasar pasear pegar pelar pelear pillar portar preguntar preocupar preparar presentar
  prometer quedar quitar rellenar reservar respetar respirar retrasar romper subir terminar tirar tocar trabajar viajar vomitar`.split(/\s+/));
// d = la voyelle qui change (o → ue, e → ie, e → i), gustar = se construit comme gustar, irr = irrégulier.
const PARTICULIERS = {
  // o → ue
  acostar: { d: "ue" }, acordar: { d: "ue" }, aprobar: { d: "ue" }, colgar: { d: "ue" }, contar: { d: "ue" },
  devolver: { d: "ue" }, encontrar: { d: "ue" }, soler: { d: "ue" },
  // e → ie
  atender: { d: "ie" }, despertar: { d: "ie" }, fregar: { d: "ie" }, hervir: { d: "ie" }, merendar: { d: "ie" },
  pensar: { d: "ie" }, perder: { d: "ie" }, preferir: { d: "ie" }, sentar: { d: "ie" }, sentir: { d: "ie" },
  // e → i
  pedir: { d: "i" }, servir: { d: "i" }, vestir: { d: "i" },
  // Comme gustar (« me gusta, te gusta… ») : on ne montre que la forme qui sert, avec me, te, le, nos, os, les.
  gustar: { gustar: true }, encantar: { gustar: true }, apetecer: { gustar: true }, molar: { gustar: true },
  parecer: { gustar: true }, costar: { gustar: true, d: "ue" },
  // Irréguliers : l'appli connaît les formes de ser, estar, tener, ir (controles.js) ; pour les autres, elle n'invente rien.
  ser: { irr: true }, estar: { irr: true }, tener: { irr: true }, ir: { irr: true },
  hacer: { irr: true }, poner: { irr: true }, salir: { irr: true }, ver: { irr: true }, dar: { irr: true },
  jugar: { irr: true }, enviar: { irr: true }, reenviar: { irr: true }, confiar: { irr: true },
  conocer: { irr: true }, agradecer: { irr: true }, convencer: { irr: true }, recoger: { irr: true }, acoger: { irr: true },
  caer: { irr: true }, "reír": { irr: true }, "freír": { irr: true }, conseguir: { irr: true },
};

// Où le livre explique chaque règle (vérifié dans PROGRAMME.md).
export const REGLES = {
  ar: { lecon: "U1-L1", texte: "Comme tous les verbes en -ar : on enlève -ar, on ajoute la terminaison." },
  ir: { lecon: "U1-L3", texte: "Comme tous les verbes en -ir : on enlève -ir, on ajoute la terminaison." },
  er: { lecon: "U1-L5", texte: "Comme tous les verbes en -er : on enlève -er, on ajoute la terminaison." },
  se: { lecon: "U3-L1", texte: "Un verbe en -se : devant le verbe, me, te, se, nos, os, se." },
  ue: { lecon: "U3-L4", texte: "Le o devient ue, sauf avec nosotros et vosotros." },
  ie: { lecon: "U3-L5", texte: "Le e devient ie, sauf avec nosotros et vosotros." },
  i: { lecon: "U6-L2", texte: "Le e devient i, sauf avec nosotros et vosotros." },
  gustar: { lecon: "U6-L1", texte: "Comme *gustar* : le verbe ne change pas, c'est le petit mot devant qui dit à qui (me, te, le, nos, os, les)." },
};
const LECON_IRREGULIER = { ser: "U1-L2", estar: "U1-L4", tener: "U2-L1", ir: "U3-L6" };

// Ce que l'appli sait d'un verbe du Sheet. « tener … años » → tener ; « comer (= déjeuner) » → comer ;
// « hacerse daño » → hacerse. Renvoie null si le mot n'est pas un verbe qu'on sait lire.
//   v : l'infinitif à conjuguer (avec -se), inf : sans -se, g : "ar" | "er" | "ir", se, d,
//   famille : "ar" | "er" | "ir" | "irr" | "autres" (pas encore vérifié), formes : true si l'appli connaît les 6 formes,
//   regles : les règles qui s'appliquent ({ lecon, texte }), dans l'ordre.
export function verbeDe(m) {
  if (sorteDe(m).cle !== "verbes") return null;
  const v = (m.es || "").replace(/\([^)]*\)/g, " ").trim().split(/[\s…]+/)[0].toLowerCase();
  const se = /[aeií]rse$/.test(v);
  const inf = se ? v.slice(0, -2) : v;
  if (!/[aeií]r$/.test(inf)) return null;
  const g = inf.slice(-2).replace("í", "i");
  // Pas encore vérifié : rangé dans « Autres verbes », sans formes.
  if (!PARTICULIERS[inf] && !REGULIERS.has(inf)) return { v, inf, g, se, famille: "autres", formes: false, regles: [] };
  const p = PARTICULIERS[inf] || {};
  if (p.irr) {
    const connu = irregulierConnu(inf);
    const regles = connu ? [{ lecon: LECON_IRREGULIER[inf], texte: "Verbe irrégulier : ses 6 formes s'apprennent par cœur." }] : [];
    if (connu && se) regles.push(REGLES.se);
    return { v, inf, g, se, famille: "irr", formes: connu, regles };
  }
  if (p.gustar) return { v, inf, g, se, d: p.d, famille: g, formes: true, gustar: true, regles: [REGLES.gustar] };
  return { v, inf, g, se, d: p.d, famille: g, formes: true, regles: [g, se && "se", p.d].filter(Boolean).map(k => REGLES[k]) };
}

// Les étiquettes d'un verbe dans la liste : « -se · o → ue », « irrégulier ».
export function etiquette(vb) {
  if (vb.famille === "irr") return "irrégulier";
  if (vb.famille === "autres") return "";
  return [vb.gustar && "comme gustar", vb.se && "-se", vb.d &&`${{ ue: "o", ie: "e", i: "e" }[vb.d]} → ${vb.d}`].filter(Boolean).join(" · ");
}
