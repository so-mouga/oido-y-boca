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

const DOSSIER = "Oído y Boca – sauvegardes";
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

// L'appli envoie sa progression : { cle, le: "2026-11-23", progression: {…} }.
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, erreur: "envoi illisible" }); }
  if (!d || d.cle !== cle_()) return json_({ ok: false, erreur: "clé refusée" });
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
