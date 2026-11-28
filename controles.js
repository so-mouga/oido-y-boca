// Les contrôles blancs : un par unité, pour préparer le vrai contrôle avec le prof.
// Les phrases sont écrites à l'avance, n'utilisent que ce qui a été vu dans l'unité,
// et ont été relues par Blanca (liste du 22 nov.). L'appli tire les questions au hasard à chaque essai.
//
// ecrit : les thèmes de la partie écrite. Chaque thème a des groupes de phrases et un nombre de questions :
//         on prend autant dans chaque groupe (nb / nombre de groupes), puis on complète au hasard.
//         Pour « mots », les questions viennent des mots de l'unité dans le tableau.
// Une phrase : { fr, es: [réponses acceptées], expl } ; pour le présent, { fr, v, p, es } et l'explication
// se construit toute seule à partir du verbe (v) et de la personne (p : 0 = yo … 5 = ellos).

import { md } from "./ui.js?v=81";
import { VERBES } from "./regles.js?v=81";

export const PERSONNES = ["yo", "tú", "él, ella", "nosotros", "vosotros", "ellos, ellas"];
const PRONOMS = ["me", "te", "se", "nos", "os", "se"]; // les verbes en -se
const TERMINAISONS = {
  ar: ["o", "as", "a", "amos", "áis", "an"],
  er: ["o", "es", "e", "emos", "éis", "en"],
  ir: ["o", "es", "e", "imos", "ís", "en"],
};
const IRREGULIERS = {
  ser: ["soy", "eres", "es", "somos", "sois", "son"],
  estar: ["estoy", "estás", "está", "estamos", "estáis", "están"],
  tener: ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
  ir: ["voy", "vas", "va", "vamos", "vais", "van"],
  // Ajoutés le 23 nov. (Q80), vérifiés forme par forme dans outils/test-irreguliers.mjs.
  hacer: ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
  poner: ["pongo", "pones", "pone", "ponemos", "ponéis", "ponen"],
  traer: ["traigo", "traes", "trae", "traemos", "traéis", "traen"],
  dar: ["doy", "das", "da", "damos", "dais", "dan"],
  salir: ["salgo", "sales", "sale", "salimos", "salís", "salen"],
  decir: ["digo", "dices", "dice", "decimos", "decís", "dicen"],
  venir: ["vengo", "vienes", "viene", "venimos", "venís", "vienen"],
  jugar: ["juego", "juegas", "juega", "jugamos", "jugáis", "juegan"],
  // Ajoutés pour les unités 9 à 15 (23 nov.), vérifiés dans outils/test-temps.mjs et contre-vérifiés avec verbecc.
  ver: ["veo", "ves", "ve", "vemos", "veis", "ven"],
  enviar: ["envío", "envías", "envía", "enviamos", "enviáis", "envían"],
  recoger: ["recojo", "recoges", "recoge", "recogemos", "recogéis", "recogen"],
  crecer: ["crezco", "creces", "crece", "crecemos", "crecéis", "crecen"],
  conducir: ["conduzco", "conduces", "conduce", "conducimos", "conducís", "conducen"],
  caer: ["caigo", "caes", "cae", "caemos", "caéis", "caen"],
  conocer: ["conozco", "conoces", "conoce", "conocemos", "conocéis", "conocen"],
  saber: ["sé", "sabes", "sabe", "sabemos", "sabéis", "saben"],
  // Ajouté pour l'unité 19 (24 nov.) : le e devient í, avec un accent (se fríe).
  "freír": ["frío", "fríes", "fríe", "freímos", "freís", "fríen"],
};

// ── Les temps du passé (unités 9 à 15) ──
// t : absent ou "present", "pc" (passé composé), "ps" (passé simple), "imp" (imparfait).
// lecon : la leçon où le livre l'explique. Un temps est « vu » quand cette leçon est faite.
export const TEMPS = {
  present: { nom: "présent", lecon: "U1-L1" },
  pc: { nom: "passé composé", livre: "pretérito perfecto", lecon: "U9-L1", ex: ["he hecho", "j'ai fait"] },
  ps: { nom: "passé simple", livre: "pretérito indefinido", lecon: "U12-L1", ex: ["hice", "j'ai fait (hier)"] },
  imp: { nom: "imparfait", livre: "imperfecto", lecon: "U14-L1", ex: ["hacía", "je faisais"] },
  // Ajoutés pour les unités 16 et 17 (24 nov., Q14-1 et Q14-2).
  fut: { nom: "futur", livre: "futuro simple", lecon: "U16-L4", ex: ["haré", "je ferai"] },
  cond: { nom: "conditionnel", livre: "condicional", lecon: "U17-L1", ex: ["haría", "je ferais"] },
};
export const ORDRE_TEMPS = ["present", "pc", "ps", "imp", "fut", "cond"];
const temps = t => (t && t !== "present" ? t : "present");

// Le passé composé : haber au présent + le participe. Les participes irréguliers, avec la leçon qui les explique.
const HABER = ["he", "has", "ha", "hemos", "habéis", "han"];
const PARTICIPES = {
  hacer: "hecho", decir: "dicho", ver: "visto", poner: "puesto", escribir: "escrito", // U9-L3
  volver: "vuelto", romper: "roto", abrir: "abierto", morir: "muerto", // U9-L4
  devolver: "devuelto", suponer: "supuesto", descubrir: "descubierto", resolver: "resuelto",
  "freír": "frito",
};
const LECON_PARTICIPE = { hacer: "U9-L3", decir: "U9-L3", ver: "U9-L3", poner: "U9-L3", escribir: "U9-L3",
  volver: "U9-L4", romper: "U9-L4", abrir: "U9-L4", morir: "U9-L4", devolver: "U9-L4" };

// L'imparfait : presque tout est régulier, sauf ser, ir, ver (U14-L3).
const IMP = {
  ar: ["aba", "abas", "aba", "ábamos", "abais", "aban"],
  er: ["ía", "ías", "ía", "íamos", "íais", "ían"],
  ir: ["ía", "ías", "ía", "íamos", "íais", "ían"],
};
const IRR_IMP = {
  ser: ["era", "eras", "era", "éramos", "erais", "eran"],
  ir: ["iba", "ibas", "iba", "íbamos", "ibais", "iban"],
  ver: ["veía", "veías", "veía", "veíamos", "veíais", "veían"],
};

// Le passé simple (indefinido). Les irréguliers, en entier, avec la leçon qui les explique (unité 13).
const PS = {
  ar: ["é", "aste", "ó", "amos", "asteis", "aron"],
  er: ["í", "iste", "ió", "imos", "isteis", "ieron"],
  ir: ["í", "iste", "ió", "imos", "isteis", "ieron"],
};
const IRR_PS = {
  ser: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
  ir: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
  tener: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"],
  estar: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron"],
  hacer: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"],
  poder: ["pude", "pudiste", "pudo", "pudimos", "pudisteis", "pudieron"],
  poner: ["puse", "pusiste", "puso", "pusimos", "pusisteis", "pusieron"],
  venir: ["vine", "viniste", "vino", "vinimos", "vinisteis", "vinieron"],
  decir: ["dije", "dijiste", "dijo", "dijimos", "dijisteis", "dijeron"],
  querer: ["quise", "quisiste", "quiso", "quisimos", "quisisteis", "quisieron"],
  dar: ["di", "diste", "dio", "dimos", "disteis", "dieron"],
  ver: ["vi", "viste", "vio", "vimos", "visteis", "vieron"],
  traer: ["traje", "trajiste", "trajo", "trajimos", "trajisteis", "trajeron"],
  saber: ["supe", "supiste", "supo", "supimos", "supisteis", "supieron"],
  conducir: ["conduje", "condujiste", "condujo", "condujimos", "condujisteis", "condujeron"],
  "freír": ["freí", "freíste", "frió", "freímos", "freísteis", "frieron"],
};
const LECON_IRR_PS = { ser: "U13-L1", ir: "U13-L1", tener: "U13-L2", estar: "U13-L2", hacer: "U13-L3", poder: "U13-L3",
  poner: "U13-L3", venir: "U13-L4", decir: "U13-L4", querer: "U13-L4", dar: "U13-L5" };

// Le futur et le conditionnel (unités 16 et 17) : l'infinitif entier + la terminaison, pareil pour -ar, -er, -ir.
// Les irréguliers gardent les terminaisons mais ont un radical court, le même aux deux temps (tendré, tendría).
const FUT = ["é", "ás", "á", "emos", "éis", "án"];
const COND = ["ía", "ías", "ía", "íamos", "íais", "ían"];
const RAD_FUT = {
  tener: "tendr", hacer: "har", poder: "podr", salir: "saldr", venir: "vendr", decir: "dir", // les 6 du livre (U16-L5)
  haber: "habr", // habrá (U16-L5)
  poner: "pondr", querer: "querr", saber: "sabr", caber: "cabr", valer: "valdr", suponer: "supondr", // pas dans le livre, mais justes
};
const LECON_FUT = { tener: "U16-L5", hacer: "U16-L5", poder: "U16-L5", salir: "U16-L5", venir: "U16-L5", decir: "U16-L5", haber: "U16-L5" };
const TERM_FC = { fut: FUT, cond: COND };
// Le radical : court pour un irrégulier, sinon l'infinitif entier, sans l'accent de freír ou reír (freiré).
const radFut = inf => ({ r: RAD_FUT[inf] || inf.replace("í", "i"), irr: !!RAD_FUT[inf] });

// Les formes irrégulières d'un temps (un tableau de 6), ou rien.
const irregulieres = (inf, t) => ({ present: IRREGULIERS, ps: IRR_PS, imp: IRR_IMP })[t]?.[inf];

// Les verbes qui changent de voyelle (d : "ue", "ie" ou "i") : la dernière voyelle du radical change,
// sauf avec nosotros et vosotros (contar → cuento… contamos ; vestirse → me visto).
// Au passé simple, seuls les verbes en -ir changent, et seulement avec él et ellos : o → u, e → i (durmió, pidió, sintió).
// ⚠ Un verbe irrégulier qui n'est pas dans IRREGULIERS ne doit pas avoir de champ v : il serait calculé comme régulier.
const AVANT = { ue: "o", ie: "e", i: "e" };
const APRES_PS = { ue: "u", ie: "i", i: "i" };
const change = (d, p) => d && p !== 3 && p !== 4;
const changePs = (g, d, p) => d && g === "ir" && (p === 2 || p === 5);

const decouper = v => {
  const se = v.endsWith("se") && v !== "se";
  const inf = se ? v.slice(0, -2) : v;
  return { se, inf, g: inf.slice(-2).replace("í", "i"), r: inf.slice(0, -2) };
};
// gras : la voyelle entre ** — celle qui change (c**ue**nto), ou celle qui ne change pas avec nosotros et vosotros (c**o**ntamos).
function radical(r, d, p, gras = false) {
  if (!change(d, p)) {
    if (!gras || !d) return r;
    const i = r.lastIndexOf(AVANT[d]);
    return i < 0 ? r : `${r.slice(0, i)}**${AVANT[d]}**${r.slice(i + 1)}`;
  }
  const i = r.lastIndexOf(AVANT[d]);
  return r.slice(0, i) + (gras ? `**${d}**` : d) + r.slice(i + 1);
}

// Passé simple régulier : { r, term } (le radical peut changer, la terminaison aussi).
// Avec yo, -car → -qué, -gar → -gué, -zar → -cé (pour garder le son) ; -ir qui change de voyelle : pidió, durmió ;
// radical en voyelle (leer, creer, caer) : le i entre deux voyelles devient y (leyó, leyeron) et prend un accent ailleurs (leíste).
function morceauxPs(g, r, d, p, gras = false) {
  let rad = r, term = PS[g][p], note = "";
  if (g === "ar" && p === 0) {
    const fin = r.slice(-1), neuf = { c: "qu", g: "gu", z: "c" }[fin];
    if (neuf) { rad = r.slice(0, -1) + neuf; note = "orthographe"; }
  }
  if (changePs(g, d, p)) {
    const i = r.lastIndexOf(AVANT[d]);
    rad = r.slice(0, i) + (gras ? `**${APRES_PS[d]}**` : APRES_PS[d]) + r.slice(i + 1);
    note = "voyelle";
  }
  if (g !== "ar" && /[aeo]$/.test(r)) {
    term = ["í", "íste", "yó", "ímos", "ísteis", "yeron"][p];
    note = note || "voyelle-y";
  }
  return { rad, term, note };
}

// Le participe : { f, irr } (« trabajado », « leído », « hecho »).
function participe(inf, g, r) {
  if (PARTICIPES[inf]) return { f: PARTICIPES[inf], irr: true };
  const term = g === "ar" ? "ado" : /[aeo]$/.test(r) ? "ído" : "ido";
  return { f: r + term, r, term, irr: false };
}

// La forme conjuguée : conjuguer("contar", 0, "ue") → "cuento" ; conjuguer("lavarse", 3) → "nos lavamos" ;
// conjuguer("hacer", 0, undefined, "pc") → "he hecho" ; conjuguer("pedir", 2, "i", "ps") → "pidió".
export function conjuguer(v, p, d, t) {
  t = temps(t);
  const { se, inf, g, r } = decouper(v);
  const irr = irregulieres(inf, t);
  let f;
  if (irr) f = irr[p];
  else if (t === "present") f = radical(r, d, p) + TERMINAISONS[g][p];
  else if (t === "pc") f = `${HABER[p]} ${participe(inf, g, r).f}`;
  else if (t === "imp") f = r + IMP[g][p];
  else if (TERM_FC[t]) f = radFut(inf).r + TERM_FC[t][p];
  else { const m = morceauxPs(g, r, d, p); f = m.rad + m.term; }
  return se ? `${PRONOMS[p]} ${f}` : f;
}
export const sixFormes = (v, d, t) => PERSONNES.map((_, p) => conjuguer(v, p, d, t));

// Pour le Dico et « Les 6 formes » des exercices : les 6 formes, terminaison et voyelle entre ** (« me ac**ue**st**o** »).
// Un irrégulier connu n'a rien de surligné : toute la forme s'apprend. Au passé composé : le participe (trabaj**ado**, **hecho**).
export const irregulierConnu = inf => !!IRREGULIERS[inf];
export function formesSurlignees(v, d, t) {
  t = temps(t);
  const { se, inf, g, r } = decouper(v);
  const irr = irregulieres(inf, t);
  return PERSONNES.map((_, p) => {
    let f;
    if (irr) f = irr[p];
    else if (t === "present") f = `${radical(r, d, p, true)}**${TERMINAISONS[g][p]}**`;
    else if (t === "pc") { const pa = participe(inf, g, r); f = `${HABER[p]} ${pa.irr ? `**${pa.f}**` : `${pa.r}**${pa.term}**`}`; }
    else if (t === "imp") f = `${r}**${IMP[g][p]}**`;
    else if (TERM_FC[t]) { const x = radFut(inf); f = x.irr ? `**${x.r}**${TERM_FC[t][p]}` : `${x.r}**${TERM_FC[t][p]}**`; }
    else { const m = morceauxPs(g, r, d, p, true); f = `${m.rad}**${m.term}**`; }
    return se ? `${PRONOMS[p]} ${f}` : f;
  });
}

const Maj = s => s[0].toUpperCase() + s.slice(1);
const tirets = t => t.map(x => `‑${x}`).join(", ");
// Le tiret insécable (‑) garde « -imos » en un seul morceau en fin de ligne.

// Les règles d'un verbe à un temps, de la plus particulière à la plus générale, chacune avec sa leçon (ou null).
// Le tableau « tout le verbe » les montre toutes ; « À retenir » seulement la première ; le Dico met le lien vers la leçon.
export function reglesDetaillees(v, d, t) {
  t = temps(t);
  const { se, inf, g, r } = decouper(v);
  const pronoms = se && { texte: "Devant le verbe : me, te, se, nos, os, se.", lecon: "U3-L1" };
  if (t === "present") {
    if (IRREGULIERS[inf]) return [{ texte: `*${Maj(inf)}* est irrégulier : ${IRREGULIERS[inf].join(", ")}.`, lecon: null }];
    return [
      // Les mêmes lignes que le Dico, les cartes et les leçons (regles.js, chantier 18, Q18-11).
      d && VERBES[d],
      pronoms,
      VERBES[g],
    ].filter(Boolean);
  }
  if (t === "pc") {
    const pa = participe(inf, g, r);
    return [
      pa.irr && { texte: `Participe irrégulier : **${pa.f}**.`, lecon: LECON_PARTICIPE[inf] || null },
      !pa.irr && pa.term === "ído" && { texte: `Participe en ‑ído, avec un accent : **${pa.f}**.`, lecon: null },
      se && { texte: "Me, te, se, nos, os, se se mettent devant *haber* (*me he levantado*).", lecon: "U9-L2" },
      { texte: `*Haber* au présent (he, has, ha, hemos, habéis, han) + le participe${pa.irr ? "" : " en ‑ado (‑ar) ou ‑ido (‑er, ‑ir)"}.`, lecon: "U9-L1" },
    ].filter(Boolean);
  }
  if (t === "imp") {
    if (IRR_IMP[inf]) return [{ texte: `*${Maj(inf)}* est un des 3 irréguliers de l'imparfait : ${IRR_IMP[inf].join(", ")}.`, lecon: "U14-L3" }, pronoms].filter(Boolean);
    return [pronoms, { texte: `Les verbes en ‑${g} à l'imparfait : on enlève ‑${g}, puis ${tirets(IMP[g])}.`, lecon: g === "ar" ? "U14-L1" : "U14-L2" }].filter(Boolean);
  }
  if (TERM_FC[t]) {
    const x = radFut(inf), nom = t === "fut" ? "Le futur" : "Le conditionnel";
    return [
      x.irr && { texte: `Radical court : **${x.r}‑** (pas *${inf}‑*)${t === "cond" ? `, le même qu'au futur (*${x.r}é*)` : ""}.`, lecon: LECON_FUT[inf] || null },
      pronoms,
      { texte: `${nom} : ${x.irr ? "le radical" : "l'infinitif entier"} + ${tirets(TERM_FC[t])}, pareil pour ‑ar, ‑er et ‑ir.`, lecon: TEMPS[t].lecon },
    ].filter(Boolean);
  }
  // Passé simple
  if (IRR_PS[inf]) {
    const meme = inf === "ser" || inf === "ir" ? " (*ser* et *ir* ont les mêmes formes)" : "";
    return [{ texte: `*${Maj(inf)}* est irrégulier au passé simple${meme} : ${IRR_PS[inf].join(", ")}.`, lecon: LECON_IRR_PS[inf] || null }, pronoms].filter(Boolean);
  }
  const yo = morceauxPs(g, r, d, 0), voyelleY = g !== "ar" && /[aeo]$/.test(r);
  return [
    changePs(g, d, 2) && { texte: `Avec él et ellos, le ${AVANT[d]} devient ${APRES_PS[d]} (*${conjuguer(inf, 2, d, "ps")}, ${conjuguer(inf, 5, d, "ps")}*).`, lecon: "U12-L5" },
    yo.note === "orthographe" && { texte: `Avec yo, l'orthographe change pour garder le son : **${yo.rad + yo.term}**.`, lecon: "U12-L4" },
    voyelleY && { texte: `Entre deux voyelles, le i devient y : *${conjuguer(inf, 2, d, "ps")}, ${conjuguer(inf, 5, d, "ps")}*.`, lecon: null },
    pronoms,
    { texte: `Les verbes en ‑${g} au passé simple : on enlève ‑${g}, puis ${tirets(PS[g])}.`, lecon: g === "ar" ? "U12-L1" : "U12-L2" },
  ].filter(Boolean);
}
export const reglesVerbe = (v, d, t) => reglesDetaillees(v, d, t).map(x => x.texte);
export const regleVerbe = (v, d, t) => reglesVerbe(v, d, t).join(" ");

// « *vivir*, avec *vosotros* : viv + **ís**. Les verbes en -ir : comme les -er (*como, comes*…), sauf… »
// « *contar*, avec *yo* : c**ue**nt + **o**. Le o devient ue, sauf avec nosotros et vosotros. »
// « *lavarse*, avec *yo* : **me** lav + **o**. Devant le verbe : me, te, se, nos, os, se. »
// « *abrir*, avec *él, ella*, au passé composé : **ha** + **abierto**. Participe irrégulier : abierto. »
export function explicationConjugaison(v, p, d, t) {
  t = temps(t);
  const { se, inf, g, r } = decouper(v);
  const avec = `*${v}*, avec *${PERSONNES[p]}*${t === "present" ? "" : `, ${t === "imp" ? "à l'" : "au "}${TEMPS[t].nom}`}`;
  const pronom = se ? `**${PRONOMS[p]}** ` : "";
  const devant = se ? " Devant le verbe : me, te, se, nos, os, se." : "";
  if (t === "present") {
    if (IRREGULIERS[inf]) return `${avec} : ${pronom}**${IRREGULIERS[inf][p]}**. *${Maj(inf)}* : ${IRREGULIERS[inf].join(", ")}.${devant}`;
    // La ligne du groupe et celle de la voyelle : les mêmes que sur les cartes, dans le Dico et la leçon (Q18-11).
    const groupe = ` ${VERBES[g].texte}`;
    const voyelle = !d ? "" : change(d, p)
      ? ` ${VERBES[d].texte}`
      : ` Avec ${PERSONNES[p]}, le ${AVANT[d]} ne change pas.`;
    return `${avec} : ${pronom}${radical(r, d, p, true)} + **${TERMINAISONS[g][p]}**.${voyelle}${devant}${d || se ? "" : groupe}`;
  }
  if (t === "pc") {
    const pa = participe(inf, g, r);
    const quoi = pa.irr ? ` Participe irrégulier : ${pa.f}.` : pa.term === "ído" ? ` Participe en ‑ído, avec un accent.`
      : g === "ar" ? " Les verbes en ‑ar : participe en ‑ado." : " Les verbes en ‑er et ‑ir : participe en ‑ido.";
    const ordre = se ? " Me, te, se… se mettent devant *haber*." : "";
    return `${avec} : **${se ? `${PRONOMS[p]} ` : ""}${HABER[p]}** + ${pa.irr ? `**${pa.f}**` : `${pa.r}**${pa.term}**`}.${quoi}${ordre}`;
  }
  if (TERM_FC[t]) {
    const x = radFut(inf), regles = reglesDetaillees(v, d, t).filter(y => !y.texte.startsWith("Devant")).map(y => y.texte);
    return `${avec} : ${pronom}${x.irr ? `**${x.r}**` : x.r} + **${TERM_FC[t][p]}**. ${regles.join(" ")}${devant}`;
  }
  const irr = irregulieres(inf, t);
  if (irr) return `${avec} : ${pronom}**${irr[p]}**. ${reglesDetaillees(v, d, t)[0].texte}`;
  if (t === "imp") return `${avec} : ${pronom}${r} + **${IMP[g][p]}**. Les verbes en ‑${g} : ${tirets(IMP[g])}.${devant}`;
  const m = morceauxPs(g, r, d, p, true);
  const regles = reglesDetaillees(v, d, t).filter(x => !x.texte.startsWith("Devant")).map(x => x.texte);
  // Avec él, un verbe en -ar : l'accent compte (hablo = je parle, habló = il a parlé).
  const accent = !m.note && p === 2 && g === "ar" && !IRREGULIERS[inf] && !d
    ? ` L'accent compte : *${conjuguer(inf, 0, d)}* (je, au présent) ≠ *${conjuguer(inf, 2, d, "ps")}* (il, au passé simple).` : "";
  const utiles = regles.filter(x => !x.startsWith("Avec yo") || p === 0).filter(x => !x.startsWith("Avec él") || p === 2 || p === 5);
  return `${avec} : ${pronom}${m.rad} + **${m.term}**. ${utiles.join(" ")}${accent}${devant}`;
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
            { fr: "Mi amigo ___ en una empresa.", v: "trabajar", p: 2, es: ["trabaja"] },
            { fr: "Vosotros ___ muy rápido.", v: "hablar", p: 4, es: ["habláis"] },
            { fr: "Léo y Dorian ___ español.", v: "hablar", p: 5, es: ["hablan"] },
          ],
          [
            { fr: "Yo ___ con mi suegro.", v: "comer", p: 0, es: ["como"] },
            { fr: "¿Tú ___ español?", v: "aprender", p: 1, es: ["aprendes"] },
            { fr: "Mi hermana ___ en el despacho.", v: "comer", p: 2, es: ["come"] },
            { fr: "Nosotros ___ español.", v: "aprender", p: 3, es: ["aprendemos"] },
            { fr: "Vosotros ___ en casa.", v: "comer", p: 4, es: ["coméis"] },
          ],
          [
            { fr: "Yo ___ en Huesca.", v: "vivir", p: 0, es: ["vivo"] },
            { fr: "¿Dónde ___ tú?", v: "vivir", p: 1, es: ["vives"] },
            { fr: "Mi cuñada ___ en Galicia.", v: "vivir", p: 2, es: ["vive"] },
            { fr: "Vosotros ___ en un piso.", v: "vivir", p: 4, es: ["vivís"] },
            { fr: "Mi hermana pequeña ___ en París.", v: "vivir", p: 2, es: ["vive"] },
          ],
          [
            { fr: "Yo ___ francés.", v: "ser", p: 0, es: ["soy"] },
            { fr: "Blanca y yo ___ pareja.", v: "ser", p: 3, es: ["somos"] },
            { fr: "Vosotros ___ españoles.", v: "ser", p: 4, es: ["sois"] },
            { fr: "Mis hermanas ___ francesas.", v: "ser", p: 5, es: ["son"] },
          ],
          [
            { fr: "Yo ___ cansado.", v: "estar", p: 0, es: ["estoy"] },
            { fr: "¿Dónde ___ tú?", v: "estar", p: 1, es: ["estás"] },
            { fr: "Nosotros ___ en casa.", v: "estar", p: 3, es: ["estamos"] },
            { fr: "Vosotros ___ en el despacho.", v: "estar", p: 4, es: ["estáis"] },
            { fr: "Mis padres ___ en la boda.", v: "estar", p: 5, es: ["están"], sens: "los padres = les parents" },
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
          { fr: "Mi hermana ___ en París.", es: ["está"], expl: ESTAR_LIEU },
          { fr: "Blanca y yo ___ cansados.", es: ["estamos"], expl: "*Estar* : un état du moment (la fatigue)." },
          { fr: "¿Dónde ___ Blanca?", es: ["está"], expl: ESTAR_LIEU },
        ]],
      },
      {
        nom: "En, desde hace", consigne: "Traduis", nb: 3,
        groupes: [
          [
            { fr: "J'habite à Huesca.", es: ["Vivo en Huesca."],
              expl: "« À » + une ville se dit **en** pour être ou habiter quelque part : *vivo en Huesca* (pas « a »)." },
            { fr: "Ma belle-sœur habite en Galice.", es: ["Mi cuñada vive en Galicia."], expl: EN_LIEU },
            { fr: "Je travaille dans une entreprise française.", es: ["Trabajo en una empresa francesa.", "Trabajo para una empresa francesa."],
              expl: "« Dans » + un lieu se dit **en** (pour être ou habiter quelque part)." },
          ],
          [
            { fr: "Je travaille à la maison depuis un an.",
              es: ["Trabajo en casa desde hace un año.", "Trabajo desde casa desde hace un año.", "Hace un año que trabajo en casa.", "Llevo un año trabajando en casa."],
              expl: "« Depuis » + une durée se dit **desde hace** (pas « durante »)." },
            { fr: "Mon ami habite en Espagne depuis un an.", es: ["Mi amigo vive en España desde hace un año."],
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
      + "Trabajo desde casa, en francés y en inglés. Blanca es mi pareja. Nos casamos en junio. Tengo tres hermanas. "
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
        ? { fr: `${q.fr} (${q.v})`, es: q.es, expl: explicationConjugaison(q.v, q.p), ...(q.sens && { sens: q.sens }) }
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
