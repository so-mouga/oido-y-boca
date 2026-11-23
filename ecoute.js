// L'écoute du jour se fait dans les applis faites pour ça. L'appli dit seulement quoi écouter.
// Une ressource à la fois, de la plus simple à la plus dure (d'après OBJECTIFS.md) ;
// « C'est trop facile » passe à la suivante.
// Le lien ouvre directement la bonne liste (déjà filtrée), et la consigne dit quoi prendre : rien à chercher.

export const ECOUTES = [
  { nom: "Dreaming Spanish", niveau: "Superbeginner", lien: "https://app.dreaming.com/spanish/browse?level=superbeginner",
    consigne: "Prends la première vidéo pas encore vue, de préférence avec un guide d'Espagne." },
  { nom: "Dreaming Spanish", niveau: "Beginner", lien: "https://app.dreaming.com/spanish/browse?level=beginner",
    consigne: "Prends la première vidéo pas encore vue, de préférence avec un guide d'Espagne." },
  { nom: "Español con Juan", niveau: "vidéos YouTube", lien: "https://www.youtube.com/@espanolconjuan" },
  { nom: "Easy Spanish", niveau: "micro-trottoirs sous-titrés", lien: "https://www.youtube.com/@EasySpanish" },
  { nom: "Coffee Break Spanish", niveau: "podcast", lien: "https://coffeebreaklanguages.com/spanish/" },
  { nom: "Españolistos", niveau: "podcast", lien: "https://espanolistos.com/" },
  { nom: "Notes in Spanish", niveau: "podcast", lien: "https://www.notesinspanish.com/" },
];
export const MINUTES_ECOUTE = 15;
// Dit pour toutes les ressources : on écoute d'une traite, sans pause ni dictionnaire.
export const SANS_TARRETER = "Écoute sans t'arrêter : pas besoin de tout comprendre.";
