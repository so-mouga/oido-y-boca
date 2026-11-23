// Sauvegarde automatique sur Google Drive, par le petit script du tableau (outils/sauvegarde.gs).
// L'appli envoie la progression quand elle s'ouvre et quand on la quitte, seulement si elle a changé.
// Le lien du script (adresse + « #clé ») est collé une fois et gardé sur le téléphone : jamais dans le code.

import { donneesSauvegarde, noterSauvegarde, lireSauvegarde, restaurer, enApercu } from "./progression.js?v=40";
import { dateCourte } from "./ui.js?v=40";

const CLE_LIEN = "oyb.google";           // { url, cle }
const CLE_ENVOI = "oyb.google.envoi";    // { empreinte, echec } : le dernier envoi réussi, et s'il a raté depuis

const lireJson = (cle, defaut) => { try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; } catch { return defaut; } };
const ecrireJson = (cle, v) => { try { localStorage.setItem(cle, JSON.stringify(v)); } catch { /* stockage indisponible */ } };

const lien = () => lireJson(CLE_LIEN, null);
export const googleBranche = () => !!lien();
export const envoiRate = () => !!lireJson(CLE_ENVOI, {}).echec;

// Une empreinte courte du texte, pour savoir s'il a changé depuis le dernier envoi sans tout garder en double.
function empreinte(texte) {
  let h = 5381;
  for (let i = 0; i < texte.length; i++) h = (h * 33 + texte.charCodeAt(i)) | 0;
  return `${texte.length}:${h}`;
}

// « https://script.google.com/macros/s/…/exec#clé » → { url, cle }, ou une erreur.
function lireLien(texte) {
  const m = (texte || "").trim().match(/^(https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec)#(\w{16,})$/);
  if (!m) throw new Error("ce n'est pas le lien donné par le script (il finit par « /exec# » suivi de la clé)");
  return { url: m[1], cle: m[2] };
}

async function appeler(requete) {
  const rep = await requete;
  if (!rep.ok) throw new Error(`Google répond ${rep.status}`);
  const d = await rep.json().catch(() => { throw new Error("réponse illisible : le script est-il bien déployé pour « tout le monde » ?"); });
  if (!d.ok) throw new Error(d.erreur || "refus du script");
  return d;
}

// La dernière sauvegarde sur Google : { le, etat } (au format de lireSauvegarde), ou null s'il n'y en a pas.
async function lireGoogle(l = lien()) {
  const d = await appeler(fetch(`${l.url}?cle=${encodeURIComponent(l.cle)}`));
  if (!d.le) return null;
  return { ...lireSauvegarde(JSON.stringify(d.progression)), le: d.le };
}

// Envoie la progression si elle a changé. « enPartant » : l'appli passe en arrière-plan, la requête doit survivre.
// Renvoie true si un envoi a réussi (l'écran peut alors afficher la nouvelle date).
export async function envoyerGoogle(jour, { force = false, enPartant = false } = {}) {
  const l = lien();
  if (!l || enApercu() || !jour) return false;
  const texte = donneesSauvegarde(jour);
  const e = empreinte(texte);
  const avant = lireJson(CLE_ENVOI, {});
  if (!force && avant.empreinte === e && !avant.echec) return false;
  try {
    await appeler(fetch(l.url, {
      method: "POST",
      // text/plain : pas de requête préalable du navigateur, que le script Google ne sait pas traiter.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ cle: l.cle, le: jour, progression: JSON.parse(texte) }),
      keepalive: enPartant && texte.length < 60000,
    }));
    ecrireJson(CLE_ENVOI, { empreinte: e });
    noterSauvegarde(jour);
    return true;
  } catch (err) {
    console.warn("Sauvegarde Google :", err.message);
    ecrireJson(CLE_ENVOI, { ...avant, echec: true });
    return false;
  }
}

// Quand on quitte l'appli (écran éteint, autre appli), on envoie ce qui a changé.
export function surveillerGoogle(jourCourant) {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") envoyerGoogle(jourCourant(), { enPartant: true });
  });
}

// Les deux liens du bas d'Aujourd'hui. Renvoie true si l'écran doit être redessiné.
export async function actionGoogle(ctx, quoi) {
  if (enApercu()) { alert("Pas en mode aperçu : rien n'y est enregistré."); return false; }
  try {
    if (quoi === "brancher") {
      const texte = prompt("Colle le lien donné par la fonction « lien » du script Google :");
      if (!texte) return false;
      const l = lireLien(texte);
      // Avant tout envoi : s'il y a déjà une sauvegarde (un nouveau téléphone, par exemple), proposer de la reprendre,
      // pour ne pas écraser la bonne progression par celle, vide, de ce téléphone.
      const existante = await lireGoogle(l);
      ecrireJson(CLE_LIEN, l);
      ecrireJson(CLE_ENVOI, {});
      if (existante && confirm(`Une sauvegarde du ${dateCourte(existante.le)} existe sur Google. La reprendre sur ce téléphone ?`)) {
        restaurer(existante);
      }
      await envoyerGoogle(ctx.jour, { force: true });
      alert(envoiRate() ? "Lien gardé, mais l'envoi a échoué : l'appli réessaiera." : "C'est branché : ta progression part sur Google toute seule.");
      return true;
    }
    if (quoi === "restaurer") {
      const s = await lireGoogle();
      if (!s) { alert("Il n'y a encore aucune sauvegarde sur Google."); return false; }
      if (!confirm(`Remplacer ta progression actuelle par la sauvegarde Google du ${dateCourte(s.le)} ?`)) return false;
      restaurer(s);
      return true;
    }
  } catch (err) {
    alert(`Sauvegarde Google impossible : ${err.message}.`);
  }
  return false;
}
