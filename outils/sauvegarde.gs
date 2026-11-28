// Sauvegarde automatique d'Oído y Boca dans ton Google Drive.
// Ce script ne vit pas dans l'appli : on le colle dans le tableau (Extensions → Apps Script).
//
// Mise en place, une seule fois :
//  1. Coller ce fichier à la place de Code.gs, enregistrer.
//  2. Déployer → Nouveau déploiement → type « Application web » ;
//     Exécuter en tant que : moi ; Qui a accès : tout le monde. Autoriser l'accès au Drive.
//  3. Choisir la fonction « lien » en haut, cliquer « Exécuter » : le journal affiche le lien à coller
//     dans l'appli (« Brancher la sauvegarde Google »), ou la clé et comment former ce lien.
//     Il contient une clé secrète : ne pas le publier.
//
// Ce que fait le script : il range chaque sauvegarde dans le dossier « Oído y Boca – sauvegardes »
// de ton Drive, un fichier par jour, et garde les 60 derniers jours (les plus vieux vont à la corbeille).
// Il ne touche à rien d'autre. Sans la clé, il ne répond rien.
//
// « Mes erreurs » (chantier 11) : avec « ?quoi=carnet », il lit aussi le carnet du prof (Google Doc « Espagnol – Carnet de suivi »),
// en lecture seule : le tableau de « 2. Mes erreurs fréquentes » et les paragraphes de « 4. Bilans », tels quels.
// C'est l'appli qui en fait des cartes (carnet.js) : si le prof change un peu la mise en forme, le script n'a pas à changer.
// Après avoir collé cette version : lancer une fois « testerCarnet » (Google demande l'accès aux Docs), puis
// Déployer → Gérer les déploiements → crayon → Version : « Nouvelle version » → Déployer.

//
// L'onglet « Soirs » (chantier 20) : l'appli envoie { cle, quoi: "soir", ligne: [date, leçon, …] } ; le script écrit la ligne de ce jour
// dans l'onglet « Soirs » du tableau (il le crée avec ses titres s'il n'existe pas), ou la remplace si ce jour y est déjà.
// Le prof la lit chaque matin. Après avoir collé cette version : lancer une fois « testerSoirs » (Google demande l'accès au tableau),
// puis Déployer → Gérer les déploiements → crayon → Version : « Nouvelle version » → Déployer.

//
// L'onglet « Astuces » (chantier 26, étape 6) : la liste commune des mots difficiles. Le prof écrit dans ses colonnes
// (astuce du prof, phrase perso, blocages en séance, mis de côté) ; l'appli envoie { cle, quoi: "astuces", lignes: [{ cle, mot, origine,
// ajoute, astuce, retenu }] }. Chaque colonne a un seul auteur : le script n'écrit que case par case, dans les colonnes de l'appli
// (clé, mot, origine, ajouté le pour une ligne nouvelle ; mon astuce, retenu le toujours), jamais la ligne entière.
// La ligne est retrouvée par sa clé (« U1-L5|el cuñado / la cuñada »), sinon ajoutée à la fin. Les colonnes sont retrouvées par leur titre.
// Tout est en texte (« @ ») : une date tapée par le prof reste du texte, et la lecture de l'appli ne perd pas de case.
// Après avoir collé cette version : lancer une fois « testerAstuces » AVANT que le prof n'écrive dans l'onglet (il le crée avec ses titres),
// puis Déployer → Gérer les déploiements → crayon → Version : « Nouvelle version » → Déployer.

const DOSSIER = "Oído y Boca – sauvegardes";
const TABLEAU = "1xG8SU6emfDAjz8Xxh_GTXEgxm5i_G2ixCXKIkcobKxQ"; // « Espagnol – Vocabulaire »
// Les mêmes titres que COLONNES_SOIRS dans donnees.js.
const COLONNES_SOIRS = ["fecha", "lección", "apuntado: bien dicho", "apuntado: errores", "lo que ha dicho bien", "un error",
  "¿ha mejorado? ¿dónde se bloquea?", "comida en español", "escucha"];
const GARDER = 60;
const CARNET = "1O4NmpsYuUI5BbBkOqrypKecP_wp9s2J23qGSutxFMHE"; // le Doc du carnet (privé : ce numéro seul ne l'ouvre pas)

// La clé secrète : créée au premier usage, gardée dans les propriétés du script (jamais dans le code).
function cle_() {
  const p = PropertiesService.getScriptProperties();
  let c = p.getProperty("CLE");
  if (!c) { c = Utilities.getUuid().replace(/-/g, ""); p.setProperty("CLE", c); }
  return c;
}

// À lancer à la main après le déploiement : affiche le lien à coller dans l'appli.
// Lancé depuis l'éditeur, Google donne souvent l'adresse de test (« /dev »), qui ne marche pas pour l'appli :
// il faut alors prendre l'adresse de l'application web (Déployer → Gérer les déploiements, elle finit par « /exec »).
function lien() {
  const url = ScriptApp.getService().getUrl() || "";
  if (url.endsWith("/exec")) Logger.log("Lien à coller dans l'appli :\n" + url + "#" + cle_());
  else Logger.log("Clé : " + cle_() + "\nLe lien à coller dans l'appli = l'URL de l'application web "
    + "(Déployer → Gérer les déploiements, elle finit par /exec), puis « # », puis cette clé.");
}

function dossier_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty("DOSSIER");
  if (id) try { return DriveApp.getFolderById(id); } catch (e) { /* dossier supprimé : on le recrée */ }
  const d = DriveApp.createFolder(DOSSIER);
  p.setProperty("DOSSIER", d.getId());
  return d;
}

function json_(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet)).setMimeType(ContentService.MimeType.JSON);
}

// Les sauvegardes, de la plus récente à la plus ancienne (le nom porte la date : progression-2026-11-23.json).
function fichiers_(dossier) {
  const liste = [];
  const it = dossier.getFiles();
  while (it.hasNext()) {
    const f = it.next();
    if (/^progression-\d{4}-\d{2}-\d{2}\.json$/.test(f.getName())) liste.push(f);
  }
  return liste.sort((a, b) => b.getName().localeCompare(a.getName()));
}

// L'onglet « Soirs », créé avec ses titres au premier soir. La date reste du texte (pas de conversion en date par Sheets).
function ongletSoirs_() {
  const classeur = SpreadsheetApp.openById(TABLEAU);
  let f = classeur.getSheetByName("Soirs");
  if (!f) {
    f = classeur.insertSheet("Soirs");
    f.getRange(1, 1, 1, COLONNES_SOIRS.length).setValues([COLONNES_SOIRS]).setFontWeight("bold");
    f.setFrozenRows(1);
    f.getRange("A:A").setNumberFormat("@");
  }
  return f;
}

// Écrit la ligne d'un soir, ou remplace celle du même jour.
function ecrireSoir_(ligne) {
  const f = ongletSoirs_();
  const valeurs = COLONNES_SOIRS.map((_, i) => String(ligne[i] == null ? "" : ligne[i]).slice(0, 2000));
  const dates = f.getLastRow() > 1 ? f.getRange(2, 1, f.getLastRow() - 1, 1).getDisplayValues().map(r => r[0]) : [];
  const i = dates.indexOf(valeurs[0]);
  const rang = i >= 0 ? i + 2 : f.getLastRow() + 1;
  f.getRange(rang, 1, 1, valeurs.length).setNumberFormat("@").setValues([valeurs]);
}

// Les mêmes titres que COLONNES_ASTUCES dans donnees.js.
const COLONNES_ASTUCES = ["clé", "mot", "origine", "ajouté le", "astuce du prof", "phrase perso", "blocages en séance", "mis de côté",
  "mon astuce", "retenu le"];
const cleAstuce_ = t => String(t || "").trim().replace(/\s*\|\s*/, "|");

// L'onglet « Astuces », créé avec ses titres, toutes ses colonnes en texte.
function ongletAstuces_() {
  const classeur = SpreadsheetApp.openById(TABLEAU);
  let f = classeur.getSheetByName("Astuces");
  if (!f) {
    f = classeur.insertSheet("Astuces");
    f.getRange(1, 1, f.getMaxRows(), COLONNES_ASTUCES.length).setNumberFormat("@");
    f.getRange(1, 1, 1, COLONNES_ASTUCES.length).setValues([COLONNES_ASTUCES]).setFontWeight("bold");
    f.setFrozenRows(1);
  }
  return f;
}

// { titre: numéro de colonne } ; un titre de l'appli qui manque (colonne supprimée) est remis au bout.
function colonnesAstuces_(f) {
  const n = Math.max(f.getLastColumn(), 1);
  const titres = f.getRange(1, 1, 1, n).getDisplayValues()[0].map(t => t.trim().toLowerCase());
  const c = {};
  COLONNES_ASTUCES.forEach(t => {
    let i = titres.indexOf(t);
    if (i < 0) { titres.push(t); i = titres.length - 1; f.getRange(1, i + 1).setNumberFormat("@").setValue(t).setFontWeight("bold"); }
    c[t] = i + 1;
  });
  return c;
}

function ecrireAstuces_(lignes) {
  const f = ongletAstuces_();
  const c = colonnesAstuces_(f);
  const dernier = f.getLastRow();
  const cles = dernier > 1 ? f.getRange(2, c["clé"], dernier - 1, 1).getDisplayValues().map(r => cleAstuce_(r[0])) : [];
  const ecrire = (rang, titre, v) => f.getRange(rang, c[titre]).setNumberFormat("@").setValue(String(v == null ? "" : v).slice(0, 2000));
  let n = 0;
  lignes.forEach(x => {
    const cle = cleAstuce_(x && x.cle);
    if (!cle) return;
    let i = cles.indexOf(cle);
    if (i < 0) {
      cles.push(cle);
      i = cles.length - 1;
      ecrire(i + 2, "clé", cle);
      ecrire(i + 2, "mot", x.mot);
      ecrire(i + 2, "origine", x.origine);
      ecrire(i + 2, "ajouté le", x.ajoute);
    }
    ecrire(i + 2, "mon astuce", x.astuce);
    ecrire(i + 2, "retenu le", x.retenu);
    n++;
  });
  return n;
}

// À lancer une fois à la main après avoir collé cette version : Google demande l'accès au tableau, l'onglet est créé s'il manque.
function testerAstuces() {
  const f = ongletAstuces_();
  colonnesAstuces_(f);
  Logger.log("Onglet « Astuces » prêt : " + Math.max(f.getLastRow() - 1, 0) + " ligne(s).");
}

// À lancer une fois à la main après avoir collé cette version : Google demande l'accès au tableau, puis le journal dit où en est l'onglet.
function testerSoirs() {
  const f = ongletSoirs_();
  Logger.log("Onglet « Soirs » prêt : " + (f.getLastRow() - 1) + " soir(s) déjà écrit(s).");
}

// L'appli envoie sa progression : { cle, le: "2026-11-23", progression: {…} },
// ou la ligne d'un soir : { cle, quoi: "soir", ligne: ["2026-11-27", "U1-L4", …] },
// ou les lignes « Astuces » : { cle, quoi: "astuces", lignes: [{ cle, mot, origine, ajoute, astuce, retenu }] }.
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, erreur: "envoi illisible" }); }
  if (!d || d.cle !== cle_()) return json_({ ok: false, erreur: "clé refusée" });
  if (d.quoi === "soir") {
    if (!Array.isArray(d.ligne) || !/^\d{4}-\d{2}-\d{2}$/.test(d.ligne[0] || "")) return json_({ ok: false, erreur: "soir incomplet" });
    const verrou = LockService.getScriptLock();
    verrou.waitLock(20000);
    try { ecrireSoir_(d.ligne); }
    catch (err) { return json_({ ok: false, erreur: "onglet Soirs : " + err.message }); }
    finally { verrou.releaseLock(); }
    return json_({ ok: true, le: d.ligne[0] });
  }
  if (d.quoi === "astuces") {
    if (!Array.isArray(d.lignes)) return json_({ ok: false, erreur: "astuces incomplètes" });
    const verrou = LockService.getScriptLock();
    verrou.waitLock(20000);
    try { return json_({ ok: true, lignes: ecrireAstuces_(d.lignes) }); }
    catch (err) { return json_({ ok: false, erreur: "onglet Astuces : " + err.message }); }
    finally { verrou.releaseLock(); }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.le || "") || !d.progression || typeof d.progression !== "object") {
    return json_({ ok: false, erreur: "sauvegarde incomplète" });
  }
  const verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    const dossier = dossier_();
    const nom = "progression-" + d.le + ".json";
    const texte = JSON.stringify(d.progression);
    const existant = dossier.getFilesByName(nom);
    if (existant.hasNext()) existant.next().setContent(texte);
    else dossier.createFile(nom, texte, "application/json");
    fichiers_(dossier).slice(GARDER).forEach(f => f.setTrashed(true));
  } finally {
    verrou.releaseLock();
  }
  return json_({ ok: true, le: d.le });
}

// Le carnet : { tableau: [[cellules], …], bilans: ["paragraphe", …] }. Une section commence à un titre (« 2. Mes erreurs fréquentes ») :
// un paragraphe en style titre, ou qui commence par un numéro. Le premier tableau après « erreurs » est le bon.
function carnet_() {
  const corps = DocumentApp.openById(CARNET).getBody();
  const T = DocumentApp.ElementType;
  let section = "";
  const tableau = [], bilans = [];
  for (let i = 0; i < corps.getNumChildren(); i++) {
    const el = corps.getChild(i);
    const type = el.getType();
    if (type === T.PARAGRAPH || type === T.LIST_ITEM) {
      const texte = el.getText().trim();
      if (!texte) continue;
      const titre = type === T.PARAGRAPH && el.asParagraph().getHeading() !== DocumentApp.ParagraphHeading.NORMAL;
      if (titre || /^\d+\.\s/.test(texte)) { section = texte.toLowerCase(); continue; }
      if (section.indexOf("bilan") >= 0) bilans.push(texte);
    } else if (type === T.TABLE && section.indexOf("erreurs") >= 0 && !tableau.length) {
      const t = el.asTable();
      for (let r = 0; r < t.getNumRows(); r++) {
        const ligne = t.getRow(r), cellules = [];
        for (let c = 0; c < ligne.getNumCells(); c++) cellules.push(ligne.getCell(c).getText().trim());
        tableau.push(cellules);
      }
    }
  }
  return { tableau, bilans };
}

// À lancer une fois à la main après avoir collé cette version : Google demande l'accès aux Docs, puis le journal dit ce qu'il a lu.
function testerCarnet() {
  const c = carnet_();
  Logger.log(c.tableau.length + " lignes dans le tableau des erreurs (avec la ligne des titres), "
    + c.bilans.filter(b => /^phrase personnalisée/i.test(b)).length + " phrase(s) personnalisée(s).");
}

// L'appli demande la dernière sauvegarde : ?cle=… → { ok, le, progression } (ou { ok, le: "" } s'il n'y en a pas).
// Ou le carnet du prof : ?cle=…&quoi=carnet → { ok, tableau, bilans }.
function doGet(e) {
  if ((e.parameter || {}).cle !== cle_()) return json_({ ok: false, erreur: "clé refusée" });
  if (e.parameter.quoi === "carnet") {
    try { return json_({ ok: true, ...carnet_() }); }
    catch (err) { return json_({ ok: false, erreur: "carnet illisible : " + err.message }); }
  }
  const derniere = fichiers_(dossier_())[0];
  if (!derniere) return json_({ ok: true, le: "" });
  return json_({ ok: true, le: derniere.getName().slice(12, 22), progression: JSON.parse(derniere.getBlob().getDataAsString()) });
}
