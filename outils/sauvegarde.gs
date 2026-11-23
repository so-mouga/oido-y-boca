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

const DOSSIER = "Oído y Boca – sauvegardes";
const GARDER = 60;

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

// L'appli demande la dernière sauvegarde : ?cle=… → { ok, le, progression } (ou { ok, le: "" } s'il n'y en a pas).
function doGet(e) {
  if ((e.parameter || {}).cle !== cle_()) return json_({ ok: false, erreur: "clé refusée" });
  const derniere = fichiers_(dossier_())[0];
  if (!derniere) return json_({ ok: true, le: "" });
  return json_({ ok: true, le: derniere.getName().slice(12, 22), progression: JSON.parse(derniere.getBlob().getDataAsString()) });
}
