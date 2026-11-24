// Ton dico : les mots et expressions des leçons faites (les cartes du Sheet), sans les phrases des exercices.
// Ici : les sortes de mots, la recherche, et ce que l'appli sait de chaque verbe.
// Les écrans sont dans ecrans/dico.js.

import { irregulierConnu } from "./controles.js?v=52";
import { mesMots, apprisEnAvance } from "./progression.js?v=52";
import { LECONS } from "./position.js?v=52";

// Les sortes du sommaire, et les catégories du Sheet qui vont dedans.
// « Mes mots » : les mots que j'ajoute moi-même, gardés sur le téléphone (pas dans le Sheet).
export const SORTES = [
  { cle: "verbes", nom: "Verbes", tag: "verbe", cats: ["verbe"] },
  { cle: "noms", nom: "Noms", tag: "nom", cats: ["nom"] },
  { cle: "adjectifs", nom: "Adjectifs", tag: "adjectif", cats: ["adjectif"] },
  { cle: "expressions", nom: "Expressions", tag: "expression", cats: ["expression", "question"] },
  { cle: "petits-mots", nom: "Petits mots", tag: "petit mot", cats: ["adverbe", "mot-outil"] },
  { cle: "mes-mots", nom: "Mes mots", tag: "à toi", cats: [] },
];
// Une catégorie inconnue (une nouvelle valeur dans le Sheet) va dans « Expressions » plutôt que de disparaître.
export const sorteDe = m => m.moi ? SORTES[5] : SORTES.find(s => s.cats.includes((m.categorie || "").trim().toLowerCase())) || SORTES[3];

// Mes mots, sous la même forme que ceux du Sheet (moi: true, sans leçon), du plus récent au plus ancien.
export const motsAMoi = () => mesMots().map(m => ({ ...m, moi: true, ex: m.ex || "" })).reverse();

// Un mot du livre « vu » : sa leçon est faite, ou je l'ai appris en avance.
export const motVu = (ctx, m) => ctx.pos.faites.has(m.lecon) || !!apprisEnAvance(m.id);

// Les mots du Dico : ceux des leçons faites et ceux appris en avance, dans l'ordre du Sheet (celui du livre), puis mes mots.
export const motsDuDico = ctx => [...ctx.mots.filter(m => motVu(ctx, m)), ...motsAMoi()];

// Les mots des leçons à venir (pas encore vus), de la leçon la plus proche à la plus lointaine.
const RANG = Object.fromEntries(LECONS.map((l, i) => [l.id, i]));
export const rangLecon = idLecon => RANG[idLecon] ?? 1e6;
export const motsAVenir = ctx => ctx.mots.filter(m => !motVu(ctx, m))
  .map((m, i) => ({ m, i })).sort((a, b) => rangLecon(a.m.lecon) - rangLecon(b.m.lecon) || a.i - b.i).map(x => x.m);

// Pour « Ajouter un mot » : les formes d'un mot à comparer, sans accents, majuscules, ni article
// (« barato / barata » → barato, barata ; « el piso » → piso ; « comer (= déjeuner) » → comer).
const ARTICLE = /^(el|la|los|las|un|una|unos|unas) /;
export const formesAComparer = es => (es || "").replace(/\([^)]*\)/g, " ").split("/")
  .map(f => normaliser(f).replace(ARTICLE, "")).filter(Boolean);
export const memeMot = (a, b) => { const fa = formesAComparer(a); return formesAComparer(b).some(f => fa.includes(f)); };

// D'où vient un de mes mots : « entendu le 24 nov. » (après l'écoute) ou « ajouté le 24 nov. » (depuis le Dico).
export const origineMonMot = m => `${m.via === "ecoute" ? "entendu" : "ajouté"} le ${new Date(m.le + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;

// La recherche ne tient compte ni des accents, ni des majuscules, ni de ¿ ¡ ? ! … : « etre » trouve « être ».
export const normaliser = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[¿¡?!…«»"().,;:=]/g, " ").replace(/\s+/g, " ").trim();

// Cherche dans l'espagnol et le français. D'abord les mots dont l'espagnol ou le français commence par la recherche,
// puis ceux dont un mot à l'intérieur commence par elle, puis ceux qui la contiennent seulement
// (« ser » : *ser* avant *descansar*, « se repo-ser »). À rang égal : ordre(m) s'il est donné (la leçon la plus proche), sinon l'ordre reçu.
export function chercher(mots, texte, ordre = () => 0) {
  const q = normaliser(texte);
  if (!q) return [];
  return mots.map((m, i) => {
    const es = normaliser(m.es), fr = normaliser(m.fr);
    const t = `${es} | ${fr}`;
    if (!t.includes(q)) return null;
    const rang = es.startsWith(q) || fr.startsWith(q) ? 0 : ` ${t}`.includes(` ${q}`) ? 1 : 2;
    return { m, i, rang, o: ordre(m) };
  }).filter(Boolean).sort((a, b) => a.rang - b.rang || a.o - b.o || a.i - b.i).map(x => x.m);
}

// ── Les verbes ──
// Le Sheet ne dit pas si un verbe est régulier. Les deux listes ci-dessous le disent pour les 160 verbes du Sheet,
// vérifiés un par un le 23 nov. 2026, plus les 13 verbes de grammaire ajoutés le même jour (Q63) (sans -se : « levantarse » → levantar),
// plus les 21 verbes des mots fréquents ajoutés le même jour (Q69).
// Un verbe qui n'est dans aucune des deux (ajouté au Sheet plus tard) n'a pas de formes : l'appli n'invente rien.
// Pour lui donner ses formes, le vérifier puis l'ajouter à l'une des deux listes.
const REGULIERS = new Set(`abrir aceptar aclarar acompañar acostumbrar adaptar adelgazar ahorrar alegrar alquilar apagar aprender
  apuntar arreglar avisar añadir bailar bajar bañar beber brindar cambiar cancelar casar cenar cocinar coincidir comer compartir
  confirmar contestar correr cortar creer cuidar cumplir currar decidir dejar desayunar descansar discutir duchar durar emocionar
  enamorar ensayar enterar entrenar equivocar esconder escribir esperar estirar explicar felicitar firmar flipar ganar grabar
  gritar hablar invitar jubilar lavar leer levantar ligar llamar llegar llevar llorar mejorar mezclar mirar molestar mudar necesitar
  ocurrir odiar olvidar opinar organizar pasar pasear pegar pelar pelear pillar portar preguntar preocupar preparar presentar
  prometer quedar quitar rellenar reservar respetar respirar retrasar romper subir terminar tirar tocar trabajar viajar vivir vomitar
  comprar deber enseñar entrar escuchar funcionar intentar pagar parar recibir usar`.split(/\s+/));
// d = la voyelle qui change (o → ue, e → ie, e → i), gustar = se construit comme gustar, irr = irrégulier.
const PARTICULIERS = {
  // o → ue
  acostar: { d: "ue" }, acordar: { d: "ue" }, aprobar: { d: "ue" }, colgar: { d: "ue" }, contar: { d: "ue" },
  devolver: { d: "ue" }, encontrar: { d: "ue" }, soler: { d: "ue" },
  poder: { d: "ue" }, volver: { d: "ue" }, dormir: { d: "ue" }, // ajoutés au Sheet le 23 nov. (Q63)
  probar: { d: "ue" }, recordar: { d: "ue" }, // mots fréquents (Q69)
  // e → ie
  atender: { d: "ie" }, despertar: { d: "ie" }, fregar: { d: "ie" }, hervir: { d: "ie" }, merendar: { d: "ie" },
  pensar: { d: "ie" }, perder: { d: "ie" }, querer: { d: "ie" }, empezar: { d: "ie" }, preferir: { d: "ie" }, sentar: { d: "ie" }, sentir: { d: "ie" },
  cerrar: { d: "ie" }, // mot fréquent (Q69)
  // e → i
  pedir: { d: "i" }, servir: { d: "i" }, vestir: { d: "i" },
  // Comme gustar (« me gusta, te gusta… ») : on ne montre que la forme qui sert, avec me, te, le, nos, os, les.
  gustar: { gustar: true }, encantar: { gustar: true }, apetecer: { gustar: true }, molar: { gustar: true },
  parecer: { gustar: true }, costar: { gustar: true, d: "ue" },
  // Irréguliers : l'appli connaît les formes de ser, estar, tener, ir, hacer, poner, dar, salir, decir, venir, jugar (controles.js) ;
  // pour les autres, elle n'invente rien.
  ser: { irr: true }, estar: { irr: true }, tener: { irr: true }, ir: { irr: true },
  hacer: { irr: true }, poner: { irr: true }, salir: { irr: true }, ver: { irr: true }, dar: { irr: true },
  jugar: { irr: true }, enviar: { irr: true }, reenviar: { irr: true }, confiar: { irr: true },
  conocer: { irr: true }, agradecer: { irr: true }, convencer: { irr: true }, recoger: { irr: true }, acoger: { irr: true },
  caer: { irr: true }, "reír": { irr: true }, "freír": { irr: true }, conseguir: { irr: true },
  // mots fréquents (Q69) : sé, digo, vengo, crezco, conduzco, supongo, sigo
  saber: { irr: true }, decir: { irr: true }, venir: { irr: true }, crecer: { irr: true },
  conducir: { irr: true }, suponer: { irr: true }, seguir: { irr: true },
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
const LECON_IRREGULIER = {
  ser: "U1-L2", estar: "U1-L4", tener: "U2-L1", ir: "U3-L6",
  hacer: "U7-L4", poner: "U7-L4", traer: "U7-L4", dar: "U7-L4", salir: "U7-L5", decir: "U7-L5", venir: "U7-L5", jugar: "U8-L5",
  // Ajoutés le 23 nov. (unités 9 à 15) : la leçon où arrive la carte du verbe.
  saber: "U1-L5", enviar: "U9-L2", ver: "U9-L3", recoger: "U10-L1", crecer: "U10-L6", conducir: "U13-L2", caer: "U13-L3", conocer: "U6-L5",
};

// Ce qui est irrégulier, dit précisément (vérifié forme par forme avec IRREGULIERS, controles.js).
// Les autres (ser, estar, ir) : « ses 6 formes s'apprennent par cœur ».
const CE_QUI_CHANGE = {
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
};

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
    const regles = connu ? [{ lecon: LECON_IRREGULIER[inf], texte: CE_QUI_CHANGE[inf] || "Verbe irrégulier : ses 6 formes s'apprennent par cœur." }] : [];
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
