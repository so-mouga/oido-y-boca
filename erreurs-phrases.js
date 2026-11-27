// La réserve de « Mes erreurs » (point 8 quindecies) : pour chaque carte du carnet du prof, des phrases en français à traduire,
// écrites et vérifiées par Claude quand Kevin dit « remplis mes erreurs » (environ une fois par semaine ; procédure :
// outils/remplir-erreurs.md, vérification : outils/test-erreurs-phrases.mjs).
//
// La clé est celle de la carte dans carnet.js : « e: » + la bonne forme en minuscules, sans ponctuation, avec les accents
// (« Blanca está en Huesca » → "e:blanca está en huesca").
// Chaque phrase : { fr, es, piege, apres }
//   fr     : la phrase en français que Kevin traduit ;
//   es     : la phrase modèle, montrée après la réponse ;
//   piege  : le morceau que l'appli vérifie dans la réponse ; il doit n'avoir qu'une seule bonne écriture (« desde hace »,
//            pas « desde hace diez ») et se trouver tel quel dans « es » ;
//   apres  : la leçon à partir de laquelle la phrase peut sortir (tous ses mots sont vus à cette leçon).
// Environ 4 phrases par carte, simples (A1), tirées de la vraie vie de Kevin.

export const RESERVE = {
  // vivemos → vivimos (Verbes en -ir : nosotros → -imos)
  "e:vivimos": [
    { fr: "Nous habitons à Huesca.", es: "Vivimos en Huesca.", piege: "vivimos", apres: "U1-L3" },
    { fr: "Blanca et moi, nous habitons dans un appartement.", es: "Blanca y yo vivimos en un piso.", piege: "vivimos", apres: "U1-L3" },
    { fr: "Nous habitons dans le quartier depuis cinq ans.", es: "Vivimos en el barrio desde hace cinco años.", piege: "Vivimos", apres: "U1-L3" },
    { fr: "Nous habitons à Huesca, pas à Paris.", es: "Vivimos en Huesca, no en París.", piege: "Vivimos", apres: "U1-L3" },
  ],
};
