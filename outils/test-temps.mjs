// Vérifie, forme par forme, les 3 temps du passé que l'appli calcule (controles.js) :
// passé composé (pc), passé simple (ps), imparfait (imp). Au moins un verbe pour chaque règle et chaque irrégulier.
// Les formes attendues sont tapées ici à la main, indépendamment de controles.js. Lancer depuis appli/ : node outils/test-temps.mjs
// Contre-vérification faite le 23 nov. 2026 avec verbecc (176 verbes du Dico × 4 temps = 4200 formes) :
// seules différences, les participes anciens de verbecc (atento, despierto) et pasar (erreur de verbecc).
import fs from "fs";
import os from "os";
import path from "path";

// [verbe, d (voyelle qui change), { pc, ps, imp }]
const ATTENDU = [
  // Réguliers
  ["trabajar", null, {
    pc: ["he trabajado", "has trabajado", "ha trabajado", "hemos trabajado", "habéis trabajado", "han trabajado"],
    ps: ["trabajé", "trabajaste", "trabajó", "trabajamos", "trabajasteis", "trabajaron"],
    imp: ["trabajaba", "trabajabas", "trabajaba", "trabajábamos", "trabajabais", "trabajaban"] }],
  ["comer", null, {
    pc: ["he comido", "has comido", "ha comido", "hemos comido", "habéis comido", "han comido"],
    ps: ["comí", "comiste", "comió", "comimos", "comisteis", "comieron"],
    imp: ["comía", "comías", "comía", "comíamos", "comíais", "comían"] }],
  ["vivir", null, {
    pc: ["he vivido", "has vivido", "ha vivido", "hemos vivido", "habéis vivido", "han vivido"],
    ps: ["viví", "viviste", "vivió", "vivimos", "vivisteis", "vivieron"],
    imp: ["vivía", "vivías", "vivía", "vivíamos", "vivíais", "vivían"] }],
  // -se : le pronom devant (devant haber au passé composé)
  ["levantarse", null, {
    pc: ["me he levantado", "te has levantado", "se ha levantado", "nos hemos levantado", "os habéis levantado", "se han levantado"],
    ps: ["me levanté", "te levantaste", "se levantó", "nos levantamos", "os levantasteis", "se levantaron"],
    imp: ["me levantaba", "te levantabas", "se levantaba", "nos levantábamos", "os levantabais", "se levantaban"] }],
  ["vestirse", "i", {
    pc: ["me he vestido", "te has vestido", "se ha vestido", "nos hemos vestido", "os habéis vestido", "se han vestido"],
    ps: ["me vestí", "te vestiste", "se vistió", "nos vestimos", "os vestisteis", "se vistieron"],
    imp: ["me vestía", "te vestías", "se vestía", "nos vestíamos", "os vestíais", "se vestían"] }],
  // Participes irréguliers (U9-L3, U9-L4) et en -ído
  ["hacer", null, {
    pc: ["he hecho", "has hecho", "ha hecho", "hemos hecho", "habéis hecho", "han hecho"],
    ps: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"],
    imp: ["hacía", "hacías", "hacía", "hacíamos", "hacíais", "hacían"] }],
  ["decir", null, {
    pc: ["he dicho", "has dicho", "ha dicho", "hemos dicho", "habéis dicho", "han dicho"],
    ps: ["dije", "dijiste", "dijo", "dijimos", "dijisteis", "dijeron"],
    imp: ["decía", "decías", "decía", "decíamos", "decíais", "decían"] }],
  ["ver", null, {
    pc: ["he visto", "has visto", "ha visto", "hemos visto", "habéis visto", "han visto"],
    ps: ["vi", "viste", "vio", "vimos", "visteis", "vieron"],
    imp: ["veía", "veías", "veía", "veíamos", "veíais", "veían"] }],
  ["poner", null, {
    pc: ["he puesto", "has puesto", "ha puesto", "hemos puesto", "habéis puesto", "han puesto"],
    ps: ["puse", "pusiste", "puso", "pusimos", "pusisteis", "pusieron"],
    imp: ["ponía", "ponías", "ponía", "poníamos", "poníais", "ponían"] }],
  ["escribir", null, {
    pc: ["he escrito", "has escrito", "ha escrito", "hemos escrito", "habéis escrito", "han escrito"],
    ps: ["escribí", "escribiste", "escribió", "escribimos", "escribisteis", "escribieron"] }],
  ["volver", "ue", {
    pc: ["he vuelto", "has vuelto", "ha vuelto", "hemos vuelto", "habéis vuelto", "han vuelto"],
    ps: ["volví", "volviste", "volvió", "volvimos", "volvisteis", "volvieron"],
    imp: ["volvía", "volvías", "volvía", "volvíamos", "volvíais", "volvían"] }],
  ["devolver", "ue", { pc: ["he devuelto", "has devuelto", "ha devuelto", "hemos devuelto", "habéis devuelto", "han devuelto"] }],
  ["romper", null, { pc: ["he roto", "has roto", "ha roto", "hemos roto", "habéis roto", "han roto"] }],
  ["abrir", null, {
    pc: ["he abierto", "has abierto", "ha abierto", "hemos abierto", "habéis abierto", "han abierto"],
    ps: ["abrí", "abriste", "abrió", "abrimos", "abristeis", "abrieron"] }],
  ["leer", null, {
    pc: ["he leído", "has leído", "ha leído", "hemos leído", "habéis leído", "han leído"],
    ps: ["leí", "leíste", "leyó", "leímos", "leísteis", "leyeron"],
    imp: ["leía", "leías", "leía", "leíamos", "leíais", "leían"] }],
  ["creer", null, { ps: ["creí", "creíste", "creyó", "creímos", "creísteis", "creyeron"] }],
  ["caer", null, {
    pc: ["he caído", "has caído", "ha caído", "hemos caído", "habéis caído", "han caído"],
    ps: ["caí", "caíste", "cayó", "caímos", "caísteis", "cayeron"] }],
  ["traer", null, {
    pc: ["he traído", "has traído", "ha traído", "hemos traído", "habéis traído", "han traído"],
    ps: ["traje", "trajiste", "trajo", "trajimos", "trajisteis", "trajeron"] }],
  // Passé simple : l'orthographe change avec yo (U12-L4)
  ["llegar", null, { ps: ["llegué", "llegaste", "llegó", "llegamos", "llegasteis", "llegaron"] }],
  ["pagar", null, { ps: ["pagué", "pagaste", "pagó", "pagamos", "pagasteis", "pagaron"] }],
  ["buscar", null, { ps: ["busqué", "buscaste", "buscó", "buscamos", "buscasteis", "buscaron"] }],
  ["empezar", "ie", { ps: ["empecé", "empezaste", "empezó", "empezamos", "empezasteis", "empezaron"] }],
  ["jugar", null, {
    ps: ["jugué", "jugaste", "jugó", "jugamos", "jugasteis", "jugaron"],
    imp: ["jugaba", "jugabas", "jugaba", "jugábamos", "jugabais", "jugaban"] }],
  // Passé simple : les -ir qui changent avec él et ellos (U12-L5) ; les -ar et -er ne changent pas
  ["pedir", "i", { ps: ["pedí", "pediste", "pidió", "pedimos", "pedisteis", "pidieron"] }],
  ["dormir", "ue", { ps: ["dormí", "dormiste", "durmió", "dormimos", "dormisteis", "durmieron"] }],
  ["preferir", "ie", { ps: ["preferí", "preferiste", "prefirió", "preferimos", "preferisteis", "prefirieron"] }],
  ["sentir", "ie", { ps: ["sentí", "sentiste", "sintió", "sentimos", "sentisteis", "sintieron"] }],
  ["contar", "ue", { ps: ["conté", "contaste", "contó", "contamos", "contasteis", "contaron"] }],
  ["perder", "ie", { ps: ["perdí", "perdiste", "perdió", "perdimos", "perdisteis", "perdieron"] }],
  // Passé simple irrégulier (unité 13 et autres)
  ["ser", null, {
    pc: ["he sido", "has sido", "ha sido", "hemos sido", "habéis sido", "han sido"],
    ps: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
    imp: ["era", "eras", "era", "éramos", "erais", "eran"] }],
  ["ir", null, {
    pc: ["he ido", "has ido", "ha ido", "hemos ido", "habéis ido", "han ido"],
    ps: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
    imp: ["iba", "ibas", "iba", "íbamos", "ibais", "iban"] }],
  ["tener", null, {
    pc: ["he tenido", "has tenido", "ha tenido", "hemos tenido", "habéis tenido", "han tenido"],
    ps: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"] }],
  ["estar", null, {
    ps: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron"],
    imp: ["estaba", "estabas", "estaba", "estábamos", "estabais", "estaban"] }],
  ["poder", "ue", { ps: ["pude", "pudiste", "pudo", "pudimos", "pudisteis", "pudieron"] }],
  ["venir", null, { ps: ["vine", "viniste", "vino", "vinimos", "vinisteis", "vinieron"] }],
  ["querer", "ie", { ps: ["quise", "quisiste", "quiso", "quisimos", "quisisteis", "quisieron"] }],
  ["dar", null, {
    ps: ["di", "diste", "dio", "dimos", "disteis", "dieron"],
    imp: ["daba", "dabas", "daba", "dábamos", "dabais", "daban"] }],
  ["saber", null, { ps: ["supe", "supiste", "supo", "supimos", "supisteis", "supieron"] }],
  ["conducir", null, { ps: ["conduje", "condujiste", "condujo", "condujimos", "condujisteis", "condujeron"] }],
  // Irréguliers seulement au présent : réguliers au passé
  ["salir", null, { ps: ["salí", "saliste", "salió", "salimos", "salisteis", "salieron"] }],
  ["conocer", null, { ps: ["conocí", "conociste", "conoció", "conocimos", "conocisteis", "conocieron"] }],
  ["recoger", null, { ps: ["recogí", "recogiste", "recogió", "recogimos", "recogisteis", "recogieron"] }],
  ["enviar", null, {
    pc: ["he enviado", "has enviado", "ha enviado", "hemos enviado", "habéis enviado", "han enviado"],
    ps: ["envié", "enviaste", "envió", "enviamos", "enviasteis", "enviaron"] }],
];

// controles.js importe ui.js (pour l'affichage) : on le charge sans cet import.
const ici = path.dirname(new URL(import.meta.url).pathname);
const source = fs.readFileSync(path.join(ici, "../controles.js"), "utf8").replace(/^import .*$/m, "const md = x => x;");
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "oyb-")), "controles.mjs");
fs.writeFileSync(tmp, source);
const { conjuguer, formesSurlignees } = await import(tmp);

let erreurs = 0, formes = 0;
for (const [v, d, parTemps] of ATTENDU) {
  for (const [t, attendu] of Object.entries(parTemps)) {
    const surlignees = formesSurlignees(v, d || undefined, t);
    attendu.forEach((f, p) => {
      formes++;
      const calcule = conjuguer(v, p, d || undefined, t);
      if (calcule !== f) { erreurs++; console.log(`✗ ${v} (${t}), personne ${p} : ${calcule} au lieu de ${f}`); }
      // Les formes surlignées (Dico, « Les 6 formes ») doivent dire la même chose, sans les **.
      if (surlignees[p].replace(/\*\*/g, "") !== f) { erreurs++; console.log(`✗ ${v} (${t}), surlignée ${p} : ${surlignees[p]}`); }
    });
  }
}
console.log(`${formes} formes vérifiées, ${erreurs} erreur(s).`);
process.exit(erreurs ? 1 : 0);
