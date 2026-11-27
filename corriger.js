// Corrige une réponse tapée. Règles (décidées le 22 nov.) :
// la casse et la ponctuation ne comptent pas ; un accent oublié est signalé mais compté juste ;
// un ñ ou une lettre fausse compte faux.
// Avec { accents: true } (Mes erreurs, chantier 11 : la moitié des erreurs notées par le prof sont des accents),
// un accent oublié compte faux, comme une lettre ; la casse et la ponctuation (¿ ¡ compris) ne comptent toujours pas.
// Avec { enye: false } (la carte 5 « à l'oreille », chantier 24, réglage du prof) : un ñ oublié ne compte pas non plus
// (« accents », juste avec un rappel), puisqu'on ne l'écrit pas toujours en tapant ce qu'on entend.

const PONCTUATION = /[¿?¡!.,;:«»"“”'’()…\-–—]/g;

// Les mots, en minuscules, sans ponctuation. sansAccents retire á é í ó ú ü mais garde le ñ.
export function mots(texte, sansAccents, sansEnye = false) {
  let t = texte.toLowerCase().replace(PONCTUATION, " ");
  if (sansAccents && sansEnye) t = t.normalize("NFD").replace(/[̀-ͯ]/g, "");
  else if (sansAccents) t = t.replace(/ñ/g, "\u0001").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\u0001/g, "ñ");
  return t.split(/\s+/).filter(Boolean);
}

// Plus longue sous-suite commune de mots : dit quels mots de chaque côté correspondent.
function alignement(a, b) {
  const t = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  const okA = new Array(a.length).fill(false), okB = new Array(b.length).fill(false);
  for (let i = 0, j = 0; i < a.length && j < b.length;) {
    if (a[i] === b[j]) { okA[i] = okB[j] = true; i++; j++; }
    else if (t[i + 1][j] >= t[i][j + 1]) i++; else j++;
  }
  return { okA, okB, communs: t[0][0] };
}

// Renvoie { niveau: "juste" | "accents" | "presque" | "faux", attendu, okAttendu, okTape, motsTapes, motsAttendus, astuce }.
export function corriger(tape, reponses, { accents: stricts = false, enye = true } = {}) {
  const sansEnye = !stricts && !enye;
  const tapeNu = mots(tape, !stricts, sansEnye);
  for (const r of reponses) {
    if (tapeNu.join(" ") === mots(r, !stricts, sansEnye).join(" ")) {
      const accents = mots(tape, false).join(" ") === mots(r, false).join(" ");
      return { niveau: accents ? "juste" : "accents", attendu: r };
    }
  }
  // La réponse la plus proche, pour montrer où ça coince.
  let meilleur = null;
  for (const r of reponses) {
    const attendus = mots(r, !stricts, sansEnye);
    const al = alignement(tapeNu, attendus);
    const ecart = Math.max(attendus.length, tapeNu.length) - al.communs;
    if (!meilleur || ecart < meilleur.ecart) meilleur = { r, ecart, al, attendus };
  }
  const { r, ecart, al, attendus } = meilleur;
  // Un seul mot faux, et la différence n'est qu'un ñ : on le dit.
  const fautifs = attendus.filter((_, i) => !al.okB[i]);
  const tapesFautifs = tapeNu.filter((_, i) => !al.okA[i]);
  let astuce = "";
  if (fautifs.length === 1 && tapesFautifs.length === 1 && fautifs[0].includes("ñ") && fautifs[0].replace(/ñ/g, "n") === tapesFautifs[0]) {
    astuce = `« ${fautifs[0]} » prend un ñ : sans lui, c'est un autre mot.`;
  } else if (stricts && fautifs.length === 1 && tapesFautifs.length === 1 && mots(fautifs[0], true)[0] === tapesFautifs[0]) {
    astuce = `« ${fautifs[0]} » prend un accent : à l'oral, il dit où appuyer.`;
  }
  return {
    niveau: ecart <= 1 ? "presque" : "faux",
    attendu: r, astuce,
    tape: marquer(tape, al.okA), reponse: marquer(r, al.okB),
  };
}

// Découpe le texte tel qu'il a été écrit, et dit pour chaque morceau s'il est juste
// (un morceau sans lettres, comme « ¿ », compte juste).
function marquer(texte, ok) {
  let k = 0;
  return texte.trim().split(/\s+/).map(brut => {
    const n = mots(brut, true).length;
    const juste = ok.slice(k, k + n).every(Boolean);
    k += n;
    return { brut, juste };
  });
}
