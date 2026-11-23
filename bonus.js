// Le bonus de grammaire : « Encore 6 pour t'entraîner », à la fin d'une leçon qui a une règle à appliquer.
// Facultatif : il ne coche rien dans « Ta journée », ne crée pas de carte et ne touche pas à la révision.
// À chaque fois : 5 phrases tirées au hasard dans la réserve, puis 1 tableau « tout le verbe » (yo → ellos).
// Sans tableau (les nombres, l'heure, les dates) : 6 phrases.
//
// Une réserve : { nom, desc, consigne, phrases, tableaux }
//   nom  : ce qu'on entraîne (« verbes en -ar »), en haut de chaque question ;
//   desc : la phrase du bloc « Encore 6 » à la fin de la leçon ;
//   regle (facultatif) : l'explication des phrases sans verbe à conjuguer.
// Une phrase : { fr, v, p, d, sens } → la réponse et son explication se calculent (controles.js).
//   v : le verbe ; p : 0 = yo … 5 = ellos ; d : "ue", "ie" ou "i" pour un verbe qui change de voyelle ;
//   sens : le sens du verbe nouveau (« acheter »), affiché « comprar = acheter » ;
//   mot : un autre mot nouveau, affiché tel quel (« italiano = italien »), seul ou après le sens du verbe.
//   Sans v : { fr, es: [réponses acceptées], mot, expl }.
// Que des mots et de la grammaire déjà vus, sauf le mot nouveau dont le sens est donné.
// ⚠ Pas de v sur un verbe irrégulier que controles.js ne connaît pas (IRREGULIERS) : il serait calculé comme régulier.

const L = "Écris en lettres";

export const BONUS = {
  "U1-L1": {
    nom: "verbes en -ar", desc: "Les verbes en -ar, avec d'autres verbes que ceux du cours.",
    phrases: [
      { fr: "Mis primos ___ un piso en Huesca.", v: "buscar", p: 5, sens: "chercher" },
      { fr: "Yo ___ a Blanca.", v: "escuchar", p: 0, sens: "écouter" },
      { fr: "¿Tú ___ español?", v: "estudiar", p: 1, sens: "étudier" },
      { fr: "Blanca ___ en la boda.", v: "cantar", p: 2, sens: "chanter" },
      { fr: "Nosotros ___ un piso en la ciudad.", v: "comprar", p: 3, sens: "acheter" },
      { fr: "Vosotros ___ un ordenador.", v: "necesitar", p: 4, sens: "avoir besoin de" },
      { fr: "Mis hermanos ___ a Blanca.", v: "ayudar", p: 5, sens: "aider" },
      { fr: "Mi cuñado ___ mucho.", v: "viajar", p: 2, sens: "voyager" },
      { fr: "Nosotros ___ la reunión.", v: "preparar", p: 3, sens: "préparer" },
      { fr: "Tú ___ a Blanca en casa.", v: "esperar", p: 1, sens: "attendre" },
      { fr: "¿Vosotros ___ a los primos?", v: "visitar", p: 4, sens: "rendre visite à" },
    ],
    tableaux: [
      { v: "escuchar", sens: "écouter" }, { v: "comprar", sens: "acheter" }, { v: "cantar", sens: "chanter" },
      { v: "estudiar", sens: "étudier" }, { v: "mirar", sens: "regarder" }, { v: "ayudar", sens: "aider" },
    ],
  },
  "U1-L2": {
    nom: "ser", desc: "Le verbe ser, avec d'autres mots que ceux du cours.",
    phrases: [
      { fr: "Mis primos ___ italianos. (ser)", v: "ser", p: 5, mot: "italiano = italien" },
      { fr: "Yo ___ alto. (ser)", v: "ser", p: 0, mot: "alto = grand" },
      { fr: "¿Tú ___ alemán? (ser)", v: "ser", p: 1, mot: "alemán = allemand" },
      { fr: "Nosotros ___ simpáticos. (ser)", v: "ser", p: 3, mot: "simpático = sympathique" },
      { fr: "Vosotros ___ portugueses. (ser)", v: "ser", p: 4, mot: "portugués = portugais" },
      { fr: "Mi cuñada ___ médica. (ser)", v: "ser", p: 2, mot: "médica = médecin" },
      { fr: "Huesca ___ bonita. (ser)", v: "ser", p: 2, mot: "bonita = jolie" },
      { fr: "Léo y Dorian ___ rubios. (ser)", v: "ser", p: 5, mot: "rubio = blond" },
      { fr: "¿Vosotros ___ amigos? (ser)", v: "ser", p: 4, mot: "amigo = ami" },
      { fr: "Tú ___ joven. (ser)", v: "ser", p: 1, mot: "joven = jeune" },
    ],
    tableaux: [{ v: "ser" }],
  },
  "U1-L3": {
    nom: "verbes en -ir", desc: "Les verbes en -ir, avec d'autres verbes que ceux du cours.",
    phrases: [
      { fr: "Yo ___ en español.", v: "escribir", p: 0, sens: "écrire" },
      { fr: "¿Tú ___ en francés?", v: "escribir", p: 1, sens: "écrire" },
      { fr: "Blanca ___ la puerta.", v: "abrir", p: 2, sens: "ouvrir", mot: "la puerta = la porte" },
      { fr: "Nosotros ___ un piso.", v: "compartir", p: 3, sens: "partager" },
      { fr: "Vosotros ___ a casa.", v: "subir", p: 4, sens: "monter" },
      { fr: "Los padres de Blanca ___ a Kevin en el pueblo.", v: "recibir", p: 5, sens: "recevoir" },
      { fr: "Blanca ___ en español y en francés.", v: "escribir", p: 2, sens: "écrire" },
      { fr: "Vosotros ___ la puerta.", v: "abrir", p: 4, sens: "ouvrir", mot: "la puerta = la porte" },
      { fr: "¿Vosotros ___ un piso o una casa?", v: "compartir", p: 4, sens: "partager" },
      { fr: "Nosotros ___ a los padres de Blanca.", v: "recibir", p: 3, sens: "recevoir" },
    ],
    tableaux: [
      { v: "escribir", sens: "écrire" }, { v: "abrir", sens: "ouvrir" }, { v: "compartir", sens: "partager" },
      { v: "recibir", sens: "recevoir" }, { v: "subir", sens: "monter" }, { v: "decidir", sens: "décider" },
    ],
  },
  "U1-L4": {
    nom: "estar", desc: "Le verbe estar, avec d'autres mots que ceux du cours.",
    phrases: [
      { fr: "Yo ___ contento. (estar)", v: "estar", p: 0, mot: "contento = content" },
      { fr: "¿Tú ___ enfermo? (estar)", v: "estar", p: 1, mot: "enfermo = malade" },
      { fr: "Blanca ___ nerviosa. (estar)", v: "estar", p: 2, mot: "nerviosa = nerveuse" },
      { fr: "Nosotros ___ en la oficina. (estar)", v: "estar", p: 3, mot: "la oficina = le bureau (au travail)" },
      { fr: "Vosotros ___ tranquilos. (estar)", v: "estar", p: 4, mot: "tranquilo = calme" },
      { fr: "Los padres de Blanca ___ en el jardín. (estar)", v: "estar", p: 5, mot: "el jardín = le jardin" },
      { fr: "¿Dónde ___ la cocina? (estar)", v: "estar", p: 2, mot: "la cocina = la cuisine" },
      { fr: "Yo ___ ocupado. (estar)", v: "estar", p: 0, mot: "ocupado = occupé" },
      { fr: "Blanca y yo ___ muy contentos. (estar)", v: "estar", p: 3, mot: "contento = content" },
      { fr: "¿Vosotros ___ en el centro? (estar)", v: "estar", p: 4, mot: "el centro = le centre-ville" },
    ],
    tableaux: [{ v: "estar" }],
  },
  "U1-L5": {
    nom: "verbes en -er", desc: "Les verbes en -er, avec d'autres verbes que ceux du cours.",
    phrases: [
      { fr: "Yo ___ en español.", v: "leer", p: 0, sens: "lire" },
      { fr: "¿Tú ___ el español?", v: "comprender", p: 1, sens: "comprendre" },
      { fr: "Mi cuñado ___ el piso.", v: "vender", p: 2, sens: "vendre" },
      { fr: "Nosotros ___ en el pueblo.", v: "correr", p: 3, sens: "courir" },
      { fr: "Vosotros ___ con los suegros.", v: "beber", p: 4, sens: "boire" },
      { fr: "Mis primos ___ en francés.", v: "responder", p: 5, sens: "répondre" },
      { fr: "Mi hermana ___ en casa.", v: "leer", p: 2, sens: "lire" },
      { fr: "¿Vosotros ___ a Blanca?", v: "comprender", p: 4, sens: "comprendre" },
      { fr: "Mis suegros ___ la casa.", v: "vender", p: 5, sens: "vendre" },
      { fr: "Yo ___ con mis hermanos.", v: "correr", p: 0, sens: "courir" },
    ],
    tableaux: [
      { v: "beber", sens: "boire" }, { v: "leer", sens: "lire" }, { v: "correr", sens: "courir" },
      { v: "vender", sens: "vendre" }, { v: "comprender", sens: "comprendre" }, { v: "responder", sens: "répondre" },
    ],
  },
  "U1-L6": {
    nom: "les 3 groupes", desc: "Les verbes en -ar, -er et -ir mélangés, avec d'autres verbes que ceux du cours.",
    phrases: [
      { fr: "Yo ___ mucho, pero no hablo mucho.", v: "leer", p: 0, sens: "lire" },
      { fr: "Mis primos también ___ en Huesca.", v: "estudiar", p: 5, sens: "étudier" },
      { fr: "¿Tú ya ___ en español?", v: "escribir", p: 1, sens: "écrire" },
      { fr: "Mi cuñada todavía ___ en francés.", v: "responder", p: 2, sens: "répondre" },
      { fr: "Nosotros ___ el piso porque vivimos en una casa.", v: "vender", p: 3, sens: "vendre" },
      { fr: "Vosotros también ___ un piso.", v: "buscar", p: 4, sens: "chercher" },
      { fr: "Yo también ___ a mis suegros.", v: "ayudar", p: 0, sens: "aider" },
      { fr: "¿Vosotros ___ en el pueblo?", v: "correr", p: 4, sens: "courir" },
      { fr: "Blanca ___ la puerta.", v: "abrir", p: 2, sens: "ouvrir", mot: "la puerta = la porte" },
      { fr: "Nosotros ___ a los primos porque viven en el pueblo.", v: "visitar", p: 3, sens: "rendre visite à" },
      { fr: "Mis hermanos ___ el piso.", v: "compartir", p: 5, sens: "partager" },
    ],
    tableaux: [
      { v: "escuchar", sens: "écouter" }, { v: "beber", sens: "boire" }, { v: "escribir", sens: "écrire" },
      { v: "comprar", sens: "acheter" }, { v: "leer", sens: "lire" }, { v: "abrir", sens: "ouvrir" },
    ],
  },
  "U2-L1": {
    nom: "tener", desc: "Le verbe tener, avec d'autres mots que ceux du cours.",
    phrases: [
      { fr: "Mis suegros ___ un perro. (tener)", v: "tener", p: 5, mot: "el perro = le chien" },
      { fr: "Yo ___ un coche. (tener)", v: "tener", p: 0, mot: "el coche = la voiture" },
      { fr: "¿Tú ___ un gato? (tener)", v: "tener", p: 1, mot: "el gato = le chat" },
      { fr: "Mi cuñada ___ una bicicleta. (tener)", v: "tener", p: 2, mot: "la bicicleta = le vélo" },
      { fr: "Nosotros ___ un jardín. (tener)", v: "tener", p: 3, mot: "el jardín = le jardin" },
      { fr: "¿Vosotros ___ un perro? (tener)", v: "tener", p: 4, mot: "el perro = le chien" },
      { fr: "Léo ___ un amigo en el pueblo. (tener)", v: "tener", p: 2, mot: "el amigo = l'ami" },
      { fr: "Mis primos ___ una casa grande. (tener)", v: "tener", p: 5, mot: "grande = grand" },
      { fr: "¿Cuántos años ___ tu abuelo? (tener)", v: "tener", p: 2, mot: "el abuelo = le grand-père" },
      { fr: "Vosotros ___ una casa en el pueblo. (tener)", v: "tener", p: 4 },
    ],
    tableaux: [{ v: "tener" }],
  },
  "U2-L2": {
    nom: "les nombres de 20 à 100", desc: "D'autres nombres de 20 à 100, à écrire en lettres.", consigne: L,
    regle: "De 21 à 29, un seul mot (*veintiuno, veintidós*). Ensuite, les dizaines **y** les unités (*cuarenta y cinco*) : le *y* seulement entre les deux.",
    phrases: [
      { fr: "67", es: ["sesenta y siete"] }, { fr: "38", es: ["treinta y ocho"] }, { fr: "92", es: ["noventa y dos"] },
      { fr: "24", es: ["veinticuatro"] }, { fr: "56", es: ["cincuenta y seis"] }, { fr: "81", es: ["ochenta y uno"] },
      { fr: "73", es: ["setenta y tres"] }, { fr: "29", es: ["veintinueve"] }, { fr: "100", es: ["cien"] },
      { fr: "64", es: ["sesenta y cuatro"] }, { fr: "22", es: ["veintidós"] }, { fr: "26", es: ["veintiséis"] },
    ],
  },
  "U2-L3": {
    nom: "l'heure", desc: "D'autres heures, à écrire en espagnol.", consigne: "Écris l'heure",
    regle: "Une heure : **es la una**. Les autres : **son las** (*son las ocho*). Puis *y cuarto*, *y media*, *menos cuarto* (avec l'heure suivante).",
    phrases: [
      { fr: "Il est 4 h 15.", es: ["Son las cuatro y cuarto."] },
      { fr: "Il est 1 h 30.", es: ["Es la una y media."] },
      { fr: "Il est 10 h 45.", es: ["Son las once menos cuarto."] },
      { fr: "Il est 7 h.", es: ["Son las siete.", "Son las siete en punto."] },
      { fr: "Il est 2 h 30.", es: ["Son las dos y media."] },
      { fr: "Il est 12 h 15.", es: ["Son las doce y cuarto."] },
      { fr: "Il est 8 h 45.", es: ["Son las nueve menos cuarto."] },
      { fr: "Il est 1 h 15.", es: ["Es la una y cuarto."] },
      { fr: "Il est 6 h 30.", es: ["Son las seis y media."] },
      { fr: "Il est 12 h 45.", es: ["Es la una menos cuarto."] },
    ],
  },
  "U2-L5": {
    nom: "les dates", desc: "D'autres dates, à écrire en lettres.", consigne: L,
    regle: "La date : **el** + le jour + **de** + le mois (*el diecinueve de junio*), sans majuscule. L'année : *dos mil veintisiete*.",
    phrases: [
      { fr: "le 3 mars", es: ["el tres de marzo"] },
      { fr: "le 14 février", es: ["el catorce de febrero"] },
      { fr: "le 1er mai", es: ["el uno de mayo", "el primero de mayo"] },
      { fr: "le 30 avril", es: ["el treinta de abril"] },
      { fr: "le 12 octobre", es: ["el doce de octubre"] },
      { fr: "le 8 août", es: ["el ocho de agosto"] },
      { fr: "2026", es: ["dos mil veintiséis"] },
      { fr: "le 7 juillet 2027", es: ["el siete de julio de dos mil veintisiete"] },
      { fr: "le 25 septembre", es: ["el veinticinco de septiembre", "el veinticinco de setiembre"] },
      { fr: "le 16 janvier", es: ["el dieciséis de enero"] },
      { fr: "le 21 novembre", es: ["el veintiuno de noviembre"] },
    ],
  },
  "U3-L1": {
    nom: "verbes en -se", desc: "Les verbes en -se, avec d'autres verbes que ceux du cours.",
    phrases: [
      { fr: "Mi cuñado ___ a las ocho.", v: "afeitarse", p: 2, sens: "se raser" },
      { fr: "Yo ___ en casa el domingo.", v: "quedarse", p: 0, sens: "rester" },
      { fr: "¿Tú ___ por la mañana?", v: "afeitarse", p: 1, sens: "se raser" },
      { fr: "Léo y Dorian ___ a las siete.", v: "bañarse", p: 5, sens: "prendre un bain" },
      { fr: "Nosotros ___ en Huesca el fin de semana.", v: "quedarse", p: 3, sens: "rester" },
      { fr: "Vosotros ___ a las nueve.", v: "prepararse", p: 4, sens: "se préparer" },
      { fr: "Blanca ___ a las ocho y media.", v: "maquillarse", p: 2, sens: "se maquiller" },
      { fr: "Yo ___ a las siete y cuarto.", v: "peinarse", p: 0, sens: "se coiffer" },
      { fr: "¿Vosotros ___ en casa hoy?", v: "quedarse", p: 4, sens: "rester" },
      { fr: "Mis primos ___ por la noche.", v: "lavarse", p: 5, sens: "se laver" },
    ],
    tableaux: [
      { v: "lavarse", sens: "se laver" }, { v: "peinarse", sens: "se coiffer" }, { v: "afeitarse", sens: "se raser" },
      { v: "quedarse", sens: "rester" }, { v: "prepararse", sens: "se préparer" }, { v: "bañarse", sens: "prendre un bain" },
    ],
  },
  "U3-L4": {
    nom: "o → ue", desc: "Les verbes qui changent o → ue, avec d'autres verbes que ceux du cours.",
    phrases: [
      { fr: "Léo ___ de uno a veinte.", v: "contar", d: "ue", p: 2, sens: "compter" },
      { fr: "Yo no ___ el teléfono.", v: "encontrar", d: "ue", p: 0, sens: "trouver" },
      { fr: "¿Tú ___ el número de Blanca?", v: "recordar", d: "ue", p: 1, sens: "se souvenir de" },
      { fr: "El piso ___ mucho.", v: "costar", d: "ue", p: 2, sens: "coûter" },
      { fr: "Nosotros ___ de uno a cien en español.", v: "contar", d: "ue", p: 3, sens: "compter" },
      { fr: "¿Vosotros ___ el apellido de mi cuñado?", v: "recordar", d: "ue", p: 4, sens: "se souvenir de" },
      { fr: "Mis suegros no ___ el ordenador.", v: "encontrar", d: "ue", p: 5, sens: "trouver" },
      { fr: "Dorian ___ mucho por la noche.", v: "soñar", d: "ue", p: 2, sens: "rêver" },
      { fr: "Nosotros ___ mucho.", v: "soñar", d: "ue", p: 3, sens: "rêver" },
      { fr: "Mis primos ___ el ordenador el lunes.", v: "devolver", d: "ue", p: 5, sens: "rendre" },
    ],
    tableaux: [
      { v: "contar", d: "ue", sens: "compter" }, { v: "encontrar", d: "ue", sens: "trouver" },
      { v: "recordar", d: "ue", sens: "se souvenir de" }, { v: "soñar", d: "ue", sens: "rêver" },
      { v: "devolver", d: "ue", sens: "rendre" }, { v: "mostrar", d: "ue", sens: "montrer" },
    ],
  },
  "U3-L5": {
    nom: "e → ie", desc: "Les verbes qui changent e → ie, avec d'autres verbes que ceux du cours.",
    phrases: [
      { fr: "Yo ___ el teléfono cada día.", v: "perder", d: "ie", p: 0, sens: "perdre" },
      { fr: "Mis suegros ___ la casa a las diez.", v: "cerrar", d: "ie", p: 5, sens: "fermer" },
      { fr: "¿Tú ___ el español?", v: "entender", d: "ie", p: 1, sens: "comprendre" },
      { fr: "Léo nunca ___.", v: "mentir", d: "ie", p: 2, sens: "mentir" },
      { fr: "Nosotros ___ el despacho a las seis.", v: "cerrar", d: "ie", p: 3, sens: "fermer" },
      { fr: "¿Vosotros ___ a Léo?", v: "entender", d: "ie", p: 4, sens: "comprendre" },
      { fr: "Blanca casi nunca ___ el teléfono.", v: "perder", d: "ie", p: 2, sens: "perdre" },
      { fr: "Mis primos ___ a veces.", v: "mentir", d: "ie", p: 5, sens: "mentir" },
      { fr: "Vosotros ___ la empresa a las siete.", v: "cerrar", d: "ie", p: 4, sens: "fermer" },
      { fr: "Normalmente yo ___ a Blanca.", v: "entender", d: "ie", p: 0, sens: "comprendre" },
    ],
    tableaux: [
      { v: "cerrar", d: "ie", sens: "fermer" }, { v: "perder", d: "ie", sens: "perdre" },
      { v: "entender", d: "ie", sens: "comprendre" }, { v: "mentir", d: "ie", sens: "mentir" },
      { v: "defender", d: "ie", sens: "défendre" }, { v: "sentir", d: "ie", sens: "ressentir" },
    ],
  },
  "U3-L6": {
    nom: "ir, et a + el = al", desc: "Le verbe ir et a / al, avec d'autres lieux que ceux du cours.",
    phrases: [
      { fr: "Mis suegros ___ al pueblo el domingo. (ir)", v: "ir", p: 5 },
      { fr: "¿Tú ___ a la ciudad hoy? (ir)", v: "ir", p: 1 },
      { fr: "Los sábados vamos ___ parque. (a)", es: ["al"], mot: "el parque = le parc", expl: "*a* + *el* = **al** : *vamos al parque*." },
      { fr: "Dorian va ___ piscina. (a)", es: ["a la"], mot: "la piscina = la piscine", expl: "Avec *la*, rien ne change : **a la** piscina. Seul *a* + *el* devient *al*." },
      { fr: "Nosotros ___ al mercado. (ir)", v: "ir", p: 3, mot: "el mercado = le marché" },
      { fr: "¿Vosotros ___ a la playa? (ir)", v: "ir", p: 4, mot: "la playa = la plage" },
      { fr: "Yo voy ___ médico. (a)", es: ["al"], mot: "el médico = le médecin", expl: "*a* + *el* = **al** : *voy al médico*." },
      { fr: "Blanca ___ a la oficina. (ir)", v: "ir", p: 2, mot: "la oficina = le bureau (au travail)" },
      { fr: "Mañana voy ___ supermercado. (a)", es: ["al"], mot: "el supermercado = le supermarché", expl: "*a* + *el* = **al** : *voy al supermercado*." },
      { fr: "Yo ___ al gimnasio a las doce. (ir)", v: "ir", p: 0 },
    ],
    tableaux: [{ v: "ir" }],
  },
};
