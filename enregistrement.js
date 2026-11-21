// Enregistre ta voix pendant le compte à rebours du mode Bouche, pour te réécouter à côté du modèle.
// Rien n'est gardé : l'enregistrement est effacé à la carte suivante, et rien n'est envoyé.
// Le micro est ouvert seulement pendant l'enregistrement, puis refermé.

const CLE_CHOIX = "oyb.enregistrer";
let enCours = null;   // { recorder, flux, morceaux }
let derniere = null;  // adresse locale (blob) du dernier enregistrement
let lecteur = null;

export function enregistrementActive() {
  try { return localStorage.getItem(CLE_CHOIX) !== "non"; } catch { return true; }
}
export function choisirEnregistrement(oui) {
  try { localStorage.setItem(CLE_CHOIX, oui ? "oui" : "non"); } catch { /* choix gardé pour la séance seulement */ }
}
export function enregistrementPossible() {
  return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

// Démarre l'enregistrement. Ne lève jamais d'erreur : si le micro est refusé, la carte marche sans.
export async function demarrerEnregistrement() {
  effacerEnregistrement();
  if (!enregistrementActive() || !enregistrementPossible()) return false;
  try {
    const flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const recorder = new MediaRecorder(flux);
    const morceaux = [];
    recorder.ondataavailable = e => { if (e.data.size) morceaux.push(e.data); };
    recorder.start();
    enCours = { recorder, flux, morceaux };
    return true;
  } catch {
    return false;
  }
}

// Arrête l'enregistrement et referme le micro. Renvoie true s'il y a quelque chose à réécouter.
export function arreterEnregistrement() {
  return new Promise(resolve => {
    const e = enCours;
    enCours = null;
    if (!e) return resolve(false);
    e.recorder.onstop = () => {
      e.flux.getTracks().forEach(t => t.stop());
      if (e.morceaux.length) {
        derniere = URL.createObjectURL(new Blob(e.morceaux, { type: e.recorder.mimeType || "audio/webm" }));
        resolve(true);
      } else resolve(false);
    };
    try { e.recorder.stop(); } catch { e.flux.getTracks().forEach(t => t.stop()); resolve(false); }
  });
}

export function aUnEnregistrement() { return !!derniere; }

export function reecouterEnregistrement(fin) {
  if (!derniere) return false;
  lecteur?.pause();
  lecteur = new Audio(derniere);
  lecteur.onended = lecteur.onerror = () => fin?.();
  lecteur.play().catch(() => fin?.());
  return true;
}

// Efface l'enregistrement précédent (et coupe un enregistrement oublié).
export function effacerEnregistrement() {
  lecteur?.pause();
  lecteur = null;
  if (enCours) {
    try { enCours.recorder.stop(); } catch { /* déjà arrêté */ }
    enCours.flux.getTracks().forEach(t => t.stop());
    enCours = null;
  }
  if (derniere) { URL.revokeObjectURL(derniere); derniere = null; }
}
