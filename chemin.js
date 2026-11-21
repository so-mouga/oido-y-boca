// La structure du chemin jusqu'à la boda. Mise à jour dans l'atelier (Claude Code)
// chaque fois qu'une étape est écrite dans PROGRAMME.md.

export const BODA = { date: "2027-06-19", texte: "samedi 19 juin 2027" };

export const ETAPES = [
  {
    n: 1, nom: "Un présent solide", dates: "23 nov. → 27 déc.", ecrite: true,
    semaines: [
      { s: 1, theme: "Me présenter et ne pas me perdre", dates: "23 → 29 nov.", objectif: "Je sais me présenter en 1 minute, et je sais faire répéter quand je ne comprends pas." },
      { s: 2, theme: "Ma journée normale", dates: "30 nov. → 6 déc.", objectif: "Je sais raconter une journée normale, du réveil au coucher, avec les heures." },
      { s: 3, theme: "Ce que j'aime, et commander au bar", dates: "7 → 13 déc.", objectif: "Je sais dire ce que j'aime, ce que je n'aime pas, et commander seul au bar." },
      { s: 4, theme: "La maison, les courses et poser des questions", dates: "14 → 20 déc.", objectif: "Je sais me débrouiller au magasin, chez les voisins et à la maison, et poser des questions." },
      { s: 5, theme: "Noël en famille, révision et bilan", dates: "21 → 27 déc.", objectif: "Je tiens une petite conversation avec la famille de Blanca à Noël." },
    ],
    bilans: [{ apres: 5, date: "27 déc.", texte: "Bilan de l'étape 1 et défi oral avec Blanca" }],
  },
  { n: 2, nom: "Le passé", dates: "28 déc. → 28 fév.", ecrite: false, nbSemaines: 9 },
  { n: 3, nom: "L'avenir et la politesse", dates: "1er mars → 4 avr.", ecrite: false, nbSemaines: 5 },
  { n: 4, nom: "Conversation et mariage", dates: "5 avr. → 30 mai", ecrite: false, nbSemaines: 8 },
];

// Retrouve une semaine écrite et son étape, à partir de son numéro global.
export function trouverSemaine(numero) {
  for (const etape of ETAPES) {
    const sem = (etape.semaines || []).find(x => x.s === numero);
    if (sem) return { etape, semaine: sem };
  }
  return null;
}

// Nombre de semaines entières entre aujourd'hui et la boda.
export function semainesAvantBoda(aujourdhui = new Date()) {
  const jours = (new Date(BODA.date + "T12:00:00") - aujourdhui) / 86400000;
  return Math.max(0, Math.round(jours / 7));
}
