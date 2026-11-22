// Les petits retours sensoriels, volontairement rares.
// Sons « Clochette » seulement à trois moments : réponse juste, réponse ratée, fin de série.
// Vibrations : brève quand tu te notes ou coches, double quand c'est raté.

export function vibrer(motif = 12) {
  try { navigator.vibrate?.(motif); } catch { /* pas de vibreur : rien à faire */ }
}

// Les notes sont fabriquées sur place (aucun fichier à charger), dans un seul contexte audio réutilisé.
let audio = null;
function note(freq, debut, duree, volume = 0.12) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audio ||= new Ctx();
  if (audio.state === "suspended") audio.resume();
  const t0 = audio.currentTime + 0.02 + debut;
  const osc = audio.createOscillator();
  const vol = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(0, t0);
  vol.gain.linearRampToValueAtTime(volume, t0 + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + duree);
  osc.connect(vol).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duree + 0.05);
}

const SONS = {
  juste: () => { note(784, 0, 0.4); note(988, 0.11, 0.5); },                      // sol → si, qui monte
  rate: () => { note(330, 0, 0.35, 0.09); },                                       // une note grave, discrète
  fin: () => { note(784, 0, 0.45); note(988, 0.13, 0.45); note(1175, 0.26, 0.7); }, // sol → si → ré
};

export function son(nom) {
  try { SONS[nom]?.(); } catch { /* le son est un bonus : on n'insiste pas */ }
}
