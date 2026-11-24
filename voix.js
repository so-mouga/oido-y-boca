// La voix espagnole du téléphone (synthèse vocale de Chrome).
// Choisit toute seule la meilleure voix d'Espagne.

let voix = null;

// Voix « amusantes » de certains systèmes, à ne jamais choisir toutes seules.
const FANTAISIE = /eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|bad news|bells|boing|bubbles|cellos|jester|organ|trinoids|whisper|zarvox|albert|fred|junior|ralph|kathy|superstar|wobble/i;

function choisir(liste) {
  const es = liste.filter(v => /^es/i.test(v.lang) && !FANTAISIE.test(v.name));
  const espagne = es.filter(v => /es[-_]ES/i.test(v.lang));
  // Ordre de préférence : une voix Google d'Espagne (Android), une voix en ligne, puis la première d'Espagne.
  return espagne.find(v => /google/i.test(v.name))
    || espagne.find(v => !v.localService)
    || espagne[0] || es[0] || null;
}

// Les voix arrivent parfois après le chargement de la page : on attend jusqu'à 2 secondes.
export function preparerVoix() {
  return new Promise(resolve => {
    if (!("speechSynthesis" in window)) return resolve(null);
    const essayer = () => { voix = choisir(speechSynthesis.getVoices()); return voix; };
    if (essayer()) return resolve(voix);
    const fin = setTimeout(() => resolve(essayer()), 2000);
    speechSynthesis.addEventListener("voiceschanged", () => { if (essayer()) { clearTimeout(fin); resolve(voix); } }, { once: true });
  });
}

export function voixChoisie() { return voix; }

// Rend le texte du tableau prononçable : « tener … años » → « tener años », « el cuñado / la cuñada » → « el cuñado, la cuñada ».
export function prononcable(texte) {
  return texte.replace(/…/g, " ").replace(/\s*\/\s*/g, ", ").replace(/\s{2,}/g, " ").trim();
}

function enonce(texte, lent, vitesse) {
  const e = new SpeechSynthesisUtterance(prononcable(texte));
  if (voix) e.voice = voix;
  e.lang = voix ? voix.lang : "es-ES";
  e.rate = vitesse || (lent ? 0.6 : 0.9);
  return e;
}

// Dit un ou plusieurs textes à la suite. Appelle fin() quand tout est dit.
// vitesse : pour les jeux (la Caseta de tiro), une vitesse de voix au choix ; sinon 0,9, ou 0,6 si lent.
export function dire(textes, { lent = false, fin, vitesse } = {}) {
  if (!("speechSynthesis" in window)) return false;
  speechSynthesis.cancel();
  const liste = [].concat(textes).filter(Boolean);
  liste.forEach((t, i) => {
    const e = enonce(t, lent, vitesse);
    if (i === liste.length - 1 && fin) e.onend = e.onerror = fin;
    speechSynthesis.speak(e);
  });
  return true;
}

export function taire() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }
