// La Charla : toutes les conversations, réunies bloc par bloc (5 unités par fichier), et la troupe.
//
// ── Le format d'une conversation (à suivre par les sessions de contenu) ──
// {
//   id: "u01-marta-vecina",       // unique, en minuscules : u<unité>-<perso>-<sujet>
//   lecon: "U1-L4",               // la leçon qui la débloque : toutes les réponses de Kevin n'utilisent que les mots
//                                 // et la grammaire vus jusqu'à cette leçon (vérifié par outils/test-charla.mjs)
//   perso: "marta",               // une fiche de TROUPE ci-dessous, ou une fiche écrite ici : { nom, qui, couleur: [habit, peau] }
//   lieu: "la nouvelle voisine, sur le palier", // en français, sous le nom : qui, où (lieux génériques, jamais un vrai établissement)
//   echanges: [                   // 4 échanges (5 plus tard)
//     {
//       lui: "¿Y dónde trabajas?",                 // son message (peut contenir quelques mots nouveaux : on peut les toucher)
//       ok: "Trabajo desde casa, con el ordenador.", // la bonne réponse de Kevin
//       pieges: [                                  // 1 ou plusieurs pièges (presque juste), un tiré au hasard à chaque partie
//         ["Trabajas desde casa.",                 //   ce que Kevin répond
//          "¿Yo? No, yo trabajo en una empresa. 😅", //   la réaction de la personne (en espagnol, drôle, gentille)
//          "<i>trabajas</i>, c'est « tu travailles ». Pour toi : <i>trabajo</i>.", // une ligne d'explication en français (<i> pour l'espagnol)
//          "personne"],                            //   facultatif : le type d'erreur (ERREURS dans charla.js)
//       ],
//       rires: [                                   // 1 ou plusieurs réponses pour rire : espagnol correct, mais à côté
//         ["Vivo en el gimnasio.", "¿En el gimnasio? 😄 ¡Qué deportista!", "Elle demande où tu travailles, pas où tu vis."],
//       ],
//       suite: "¡Qué bien, sin ir a la oficina!",  // ce qu'elle répond à la bonne réponse
//     },
//   ],
// }
// Règles : jamais de famille inventée (la vraie famille seulement, avec son vrai rôle) ; Blanca apparaît par messages,
// dans son vrai rôle ; Léo et Dorian seulement avec le rôle qu'ils ont déjà dans les exercices. Espagnol d'Espagne.

import { CHARLAS as U01 } from "./u01-05.js?v=72";
import { CHARLAS as U06 } from "./u06-10.js?v=72";
import { CHARLAS as U11 } from "./u11-15.js?v=72";
import { CHARLAS as U16 } from "./u16-20.js?v=72";
import { CHARLAS as U21 } from "./u21-25.js?v=72";

// La troupe : des inconnus de Huesca qui reviennent d'une charla à l'autre (couleur : [habit, peau] du petit portrait).
export const TROUPE = {
  marta: { nom: "Marta", qui: "ta voisine, bavarde", couleur: ["#7A3F8F", "#E8B98E"] },
  javier: { nom: "Javier", qui: "de la salle de sport, fou de sport", couleur: ["#0F8A83", "#C68B5E"] },
  camarero: { nom: "El camarero", qui: "le serveur du bar de la plaza, toujours pressé", couleur: ["#D8472A", "#F0C9A0"] },
  blanca: { nom: "Blanca", qui: "ta compagne, par messages", couleur: ["#E9A20B", "#E8B98E"], messages: true },
};

export const BLOCS = [
  { id: "u01-05", de: 1, a: 5, charlas: U01 },
  { id: "u06-10", de: 6, a: 10, charlas: U06 },
  { id: "u11-15", de: 11, a: 15, charlas: U11 },
  { id: "u16-20", de: 16, a: 20, charlas: U16 },
  { id: "u21-25", de: 21, a: 25, charlas: U21 },
];
export const CHARLAS = BLOCS.flatMap(b => b.charlas);
