// « On me comprend ? » (chantier 24, Q24-23 à Q24-26) : le micro de La Charla sur les « À dire » (leçons et Mes erreurs).
// La reconnaissance vocale du téléphone (es-ES, Google sur Android, avec du réseau) écoute la phrase ; l'appli colore
// les mots compris. Elle ne note jamais : c'est moi qui me note (la règle « la reconnaissance vocale ne note jamais »).
// Google est indulgent et corrige aussi la grammaire (« vivemos » peut devenir « vivimos ») : le vert est un indice.
// Sans reconnaissance (pas de réseau, micro refusé, navigateur sans elle) : l'enregistrement d'avant (enregistrement.js).

const Reco = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
let ko = false;      // la reconnaissance a échoué une fois (réseau, refus) : on n'insiste plus de la séance
let enCours = null;  // l'écoute en cours

export const reconnaissancePossible = () => !!Reco && !ko;
export const ecouteEnCours = () => !!enCours;

// Écoute une phrase. fin({ texte, alternatives }) ; texte vide = rien entendu. echec(erreur) : on passe à l'enregistrement.
export function ecouter({ fin, echec }) {
  if (!reconnaissancePossible()) return echec?.("indisponible");
  if (enCours) { try { enCours.stop(); } catch { /* déjà arrêtée */ } return; } // toucher pendant l'écoute : on finit
  const r = new Reco();
  r.lang = "es-ES"; r.interimResults = false; r.maxAlternatives = 3;
  enCours = r;
  let fini = false;
  r.onresult = ev => {
    fini = true;
    const alternatives = [...ev.results[0]].map(x => x.transcript);
    fin({ texte: alternatives[0] || "", alternatives });
  };
  r.onerror = ev => {
    if (fini) return;
    fini = true; enCours = null;
    if (ev.error === "no-speech" || ev.error === "aborted") return fin({ texte: "", alternatives: [] });
    ko = true; echec?.(ev.error);
  };
  r.onend = () => { if (enCours === r) enCours = null; if (!fini) { fini = true; fin({ texte: "", alternatives: [] }); } };
  try { r.start(); } catch { enCours = null; ko = true; echec?.("start"); }
}
export function arreterEcoute() { if (enCours) { try { enCours.abort(); } catch { /* rien */ } enCours = null; } }

// Les mots, sans accents ni ponctuation (comme La Charla).
export const mots = t => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter(Boolean);

// Chaque mot de la phrase, compris ou pas, d'après tout ce que le téléphone a proposé (ses 3 versions).
// Renvoie { liste: [{ w, oui }], n, sur }.
export function compris(phrase, alternatives) {
  const entendus = new Set(alternatives.flatMap(mots));
  const liste = String(phrase).split(/\s+/).filter(Boolean).map(w => ({ w, oui: mots(w).length > 0 && mots(w).every(x => entendus.has(x)) }));
  const vrais = liste.filter(x => mots(x.w).length);
  return { liste, n: vrais.filter(x => x.oui).length, sur: vrais.length };
}
