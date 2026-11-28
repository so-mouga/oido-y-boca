// L'onglet « Astuces » du Google Sheet (chantier 26, étape 6 des décisions du 28 nov., 4 et 4 bis ; Q26-27 à Q26-33 ; maquette astuces).
// La liste commune des mots difficiles : le prof y note les mots où je bloque en séance (son astuce, une phrase perso, les dates
// des blocages, « mis de côté »), l'appli y écrit les mots qui entrent (origine « appli » ou « Kevin »), « mon astuce » et « retenu le ».
// La lecture est dans donnees.js (versAstuces → ctx.astuces), l'écriture passe par le script Google (sauvegarde-google.js).
//
// La clé d'une ligne = l'id du mot (« U1-L5|el cuñado / la cuñada », « moi-… ») ; un verbe hors Vocabulaire : son infinitif.
// Dans la liste « Mes mots en cours », un verbe a pour clé son infinitif : cleOnglet fait le lien.

import { lireDate } from "./donnees.js?v=88";
import { resoudre, cleDe, mettreMotEnCours, sortirDesCours } from "./motsencours.js?v=88";
import { difficile, noterDifficile, tousDifficiles, verbesEnCours, mettreEnCours, marquerEntre, dateEnCours, fichesCartes } from "./progression.js?v=88";

// La clé de la ligne d'un mot de la liste (clé de la liste → id du mot).
export const cleOnglet = (ctx, cle) => resoudre(ctx, cle)?.m?.id || cle;
// La ligne du prof pour un mot de la liste, ou null.
export const ligneDe = (ctx, cle) => ctx.astuces?.[cleOnglet(ctx, cle)] || null;

// « blocages en séance » : une date par blocage, séparées par « ; » (Q26-28). n = le nombre de blocages (au moins 1 pour une
// ligne créée par le prof) ; dernier = la date la plus récente (des blocages, sinon « ajouté le »), ou "" si aucune n'est lisible.
export function blocages(a) {
  const parts = (a.blocages || "").split(/[;,\n]+/).map(x => x.trim()).filter(Boolean);
  const datesBlocage = parts.map(lireDate).filter(Boolean).sort();
  const dates = [...datesBlocage, lireDate(a.ajoute)].filter(Boolean).sort();
  return { n: Math.max(parts.length, a.origine === "prof" ? 1 : 0), dernier: dates.at(-1) || "", dernierBlocage: datesBlocage.at(-1) || "" };
}

// Au lancement (« Aujourd'hui », hors aperçu) : les mots du prof entrent, les mots mis de côté sortent.
// - Un blocage noté entre le lendemain de sa date (Q26-29), une seule fois : « prof » garde le nombre de blocages déjà pris.
//   Un mot retiré ou retenu ne revient donc que par une nouvelle date. Sans date lisible : dès que l'appli voit la ligne.
// - « mis de côté = oui » (Q26-30) : le mot sort (sans « retenu le ») une fois ; ensuite je peux le remettre moi-même.
//   Il n'entre plus tout seul (entrerSiBloque), et ses blocages en cours ne le font pas entrer.
// Renvoie { entres: [es], sortis: [es] } (ce qui a bougé maintenant).
export function importerAstuces(ctx, jour) {
  const bouge = { entres: [], sortis: [] };
  for (const a of Object.values(ctx.astuces || {})) {
    const it = resoudre(ctx, a.cle);
    if (!it) continue; // un mot qui n'est (plus) ni dans Vocabulaire, ni dans Mes mots, ni dans les verbes
    const idMot = it.m?.id || a.cle;
    const cle = it.m ? cleDe(ctx, it.m) : a.cle;
    const d = difficile(idMot);
    const b = blocages(a);
    const dansListe = verbesEnCours().includes(cle);
    if (a.deCote) {
      if (!d.deCote) {
        noterDifficile(idMot, { deCote: true, prof: Math.max(b.n, d.prof || 0) });
        if (dansListe) { sortirDesCours(ctx, cle, null); noterDifficile(idMot, { deCoteLe: jour }); bouge.sortis.push(it.es); }
      } else if (b.n > (d.prof || 0)) noterDifficile(idMot, { prof: b.n });
      continue;
    }
    if (d.deCote) noterDifficile(idMot, { deCote: false });
    if (b.n <= (d.prof || 0)) continue;
    if (b.dernier && b.dernier >= jour) continue; // le lendemain du blocage
    noterDifficile(idMot, { prof: b.n });
    if (dansListe) continue;
    if (it.m) mettreMotEnCours(ctx, it.m, jour, "prof");
    else { mettreEnCours(cle, jour); marquerEntre(cle, cle, "prof"); }
    noterDifficile(idMot, { arriveLe: jour });
    bouge.entres.push(it.es);
  }
  return bouge;
}

// Les mots arrivés ou mis de côté aujourd'hui par le prof (le haut du Dico).
export function nouvellesDuProf(ctx) {
  const l = { arrives: [], deCote: [] };
  for (const [id, d] of Object.entries(tousDifficiles())) {
    const es = () => resoudre(ctx, id)?.es || id;
    if (d.arriveLe === ctx.jour) l.arrives.push(es());
    if (d.deCoteLe === ctx.jour) l.deCote.push(es());
  }
  return l;
}

// L'origine d'un mot entré avant l'étape 6 (Q26-32) : « appli » s'il a été bloqué (2 « Non » de suite ou 3 en tout), sinon « Kevin ».
function origineDe(idMot) {
  const d = difficile(idMot);
  if (d.origine) return d.origine;
  return (fichesCartes()[idMot]?.nons || 0) >= 2 || (d.non || 0) >= 3 ? "appli" : "Kevin";
}

// Les lignes que l'appli écrit (Q26-32) : un mot de la liste, ou un mot avec mon astuce ou une date « retenu le ».
// Le script ne crée la ligne (clé, mot, origine, ajouté le) que si elle n'existe pas ; il met toujours à jour « mon astuce » et « retenu le ».
export function lignesAstuces(ctx) {
  const d = tousDifficiles();
  const cles = new Set([...verbesEnCours(), ...Object.keys(d).filter(k => d[k].astuce || d[k].retenu)]);
  const lignes = [];
  for (const cle of cles) {
    const it = resoudre(ctx, cle);
    if (!it) continue;
    const idMot = it.m?.id || cle;
    const x = difficile(cle);
    lignes.push({ cle: idMot, mot: it.es, origine: origineDe(idMot),
      ajoute: dateEnCours(cle) || x.astuceLe || x.retenu || ctx.jour, astuce: x.astuce || "", retenu: x.retenu || "" });
  }
  return lignes;
}
