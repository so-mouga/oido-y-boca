// Les petits retours sensoriels, volontairement rares :
// une vibration très brève quand tu te notes, et un son doux une seule fois, à la fin d'une série.

export function vibrer() {
  try { navigator.vibrate?.(12); } catch { /* pas de vibreur : rien à faire */ }
}

// Deux notes douces (sol puis do), environ 0,6 seconde, fabriquées sur place : aucun fichier à charger.
export function sonDeFin() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const t0 = ctx.currentTime + 0.02;
    [[784, 0], [1047, 0.16]].forEach(([freq, decalage]) => {
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      vol.gain.setValueAtTime(0, t0 + decalage);
      vol.gain.linearRampToValueAtTime(0.12, t0 + decalage + 0.02);
      vol.gain.exponentialRampToValueAtTime(0.0001, t0 + decalage + 0.45);
      osc.connect(vol).connect(ctx.destination);
      osc.start(t0 + decalage);
      osc.stop(t0 + decalage + 0.5);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* le son de fin est un bonus : on n'insiste pas */ }
}
