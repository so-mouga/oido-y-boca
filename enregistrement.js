// Enregistre ta voix pendant que tu tiens le bouton micro du mode Bouche, pour te réécouter à côté du modèle.
// Rien n'est gardé : l'enregistrement est effacé à la carte suivante, et rien n'est envoyé.
// Le micro est ouvert seulement pendant l'enregistrement, puis refermé.

let enCours = null;   // { recorder, flux, morceaux }
let derniere = null;  // adresse locale (blob) du dernier enregistrement
let lecteur = null;

export function enregistrementPossible() {
  return !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

// Démarre l'enregistrement et se résout quand le micro enregistre vraiment (true), ou false s'il est refusé.
// L'enregistrement précédent est gardé jusqu'à ce que le nouveau soit valable (un appui trop bref ne l'efface pas).
export async function demarrerEnregistrement() {
  lecteur?.pause();
  lecteur = null;
  if (enCours) await arreterEnregistrement(false);
  if (!enregistrementPossible()) return false;
  try {
    const flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const recorder = new MediaRecorder(flux);
    const morceaux = [];
    recorder.ondataavailable = e => { if (e.data.size) morceaux.push(e.data); };
    enCours = { recorder, flux, morceaux };
    await new Promise(resolve => { recorder.onstart = resolve; recorder.start(); });
    return enCours?.recorder === recorder;
  } catch {
    if (enCours) { enCours.flux.getTracks().forEach(t => t.stop()); enCours = null; }
    return false;
  }
}

export function enregistrementEnCours() { return !!enCours; }

// Arrête l'enregistrement et referme le micro.
// garder = false jette l'enregistrement (appui trop bref). Renvoie true s'il y a quelque chose à réécouter.
export function arreterEnregistrement(garder = true) {
  return new Promise(resolve => {
    const e = enCours;
    enCours = null;
    if (!e) return resolve(false);
    e.recorder.onstop = () => {
      e.flux.getTracks().forEach(t => t.stop());
      if (garder && e.morceaux.length) {
        if (derniere) URL.revokeObjectURL(derniere);
        derniere =URL.createObjectURL(new Blob(e.morceaux, { type: e.recorder.mimeType || "audio/webm" }));
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
