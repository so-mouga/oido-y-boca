// Les exercices écrits à l'avance, une leçon à la fois (générés dans Claude Code à partir du livre et du tableau).
// Ils n'utilisent que les mots et la grammaire déjà vus. Les cartes, elles, viennent des 5 mots du tableau.
//
// ecrire : { consigne, fr, es: [réponses acceptées] }   → tu tapes la réponse, l'appli vérifie.
// dire   : { fr, es }                                    → tu la dis à voix haute, tu compares, tu te notes.
//
// Unités prêtes : 1 et 2. Les suivantes s'ajoutent au fil des leçons.

const T = "Traduis";
const C = "Complète";
const L = "Écris en lettres";

export const EXERCICES = {
  "U1-L1": {
    ecrire: [
      { consigne: T, fr: "Je ne comprends pas.", es: ["No entiendo."] },
      { consigne: T, fr: "Tu peux parler plus lentement ?", es: ["¿Puedes hablar más despacio?"] },
      { consigne: C, fr: "Nosotros ___ francés en casa. (hablar)", es: ["hablamos"] },
      { consigne: T, fr: "Comment on dit « fourchette » en espagnol ?", es: ["¿Cómo se dice fourchette en español?"] },
    ],
    dire: [
      { fr: "Je ne comprends pas. Tu peux parler plus lentement ?", es: "No entiendo. ¿Puedes hablar más despacio?" },
      { fr: "Tu peux répéter, s'il te plaît ?", es: "¿Puedes repetir, por favor?" },
      { fr: "Que veut dire « apetecer » ?", es: "¿Qué significa «apetecer»?" },
    ],
  },
  "U1-L2": {
    ecrire: [
      { consigne: T, fr: "Je m'appelle Kevin.", es: ["Me llamo Kevin."] },
      { consigne: C, fr: "Blanca ___ española. (ser)", es: ["es"] },
      { consigne: T, fr: "Léo a quatre ans.", es: ["Léo tiene cuatro años."] },
      { consigne: T, fr: "Quel est ton nom de famille ?", es: ["¿Cuál es tu apellido?"] },
    ],
    dire: [
      { fr: "Je m'appelle Kevin et je suis français.", es: "Me llamo Kevin y soy francés." },
      { fr: "Comment tu t'appelles ?", es: "¿Cómo te llamas?" },
      { fr: "Nous nous marions en juin.", es: "Nos casamos en junio." },
    ],
  },
  "U1-L3": {
    ecrire: [
      { consigne: T, fr: "J'habite à Huesca depuis cinq ans.", es: ["Vivo en Huesca desde hace cinco años."] },
      { consigne: C, fr: "Nosotros ___ en un piso. (vivir)", es: ["vivimos"] },
      { consigne: T, fr: "Tu habites dans un appartement ou dans une maison ?", es: ["¿Vives en un piso o en una casa?"] },
      { consigne: T, fr: "Huesca est une petite ville.", es: ["Huesca es una ciudad pequeña."] },
    ],
    dire: [
      { fr: "Nous habitons dans un appartement, en ville.", es: "Vivimos en un piso, en la ciudad." },
      { fr: "Où est-ce que tu habites ?", es: "¿Dónde vives?" },
      { fr: "Les parents de Blanca habitent dans un village.", es: "Los padres de Blanca viven en un pueblo." },
    ],
  },
  "U1-L4": {
    ecrire: [
      { consigne: T, fr: "Je travaille à la maison.", es: ["Trabajo desde casa.", "Trabajo en casa."] },
      { consigne: C, fr: "Hoy ___ muy cansado. (estar, yo)", es: ["estoy"] },
      { consigne: T, fr: "J'ai une réunion à dix heures.", es: ["Tengo una reunión a las diez."] },
      { consigne: T, fr: "Je suis dans mon bureau.", es: ["Estoy en mi despacho."] },
    ],
    dire: [
      { fr: "Je travaille à la maison, en français et en anglais.", es: "Trabajo desde casa, en francés y en inglés." },
      { fr: "Dans quelle entreprise tu travailles ?", es: "¿En qué empresa trabajas?" },
      { fr: "Blanca est à la maison.", es: "Blanca está en casa." },
    ],
  },
  "U1-L5": {
    ecrire: [
      { consigne: C, fr: "Nosotros ___ con mis suegros el domingo. (comer)", es: ["comemos"] },
      { consigne: T, fr: "Tu as des frères et sœurs ?", es: ["¿Tienes hermanos?"] },
      { consigne: T, fr: "Blanca est ma compagne.", es: ["Blanca es mi pareja."] },
      { consigne: C, fr: "Mis suegros ___ en Huesca hoy. (estar)", es: ["están"] },
    ],
    dire: [
      { fr: "Blanca est ma compagne. Nous nous marions en juin.", es: "Blanca es mi pareja. Nos casamos en junio." },
      { fr: "Tes cousins viennent au mariage ?", es: "¿Vienen tus primos a la boda?" },
      { fr: "Ce dimanche, nous mangeons avec mes beaux-parents.", es: "Este domingo comemos con mis suegros." },
    ],
  },
  "U1-L6": {
    ecrire: [
      { consigne: T, fr: "Je comprends un peu, mais je ne parle pas beaucoup.", es: ["Entiendo un poco, pero no hablo mucho."] },
      { consigne: T, fr: "Je ne parle pas encore bien espagnol.", es: ["Todavía no hablo bien español.", "Todavía no hablo bien el español.", "No hablo bien español todavía."] },
      { consigne: T, fr: "Moi aussi, je travaille à la maison.", es: ["Yo también trabajo desde casa.", "Yo también trabajo en casa."] },
      { consigne: T, fr: "J'apprends l'espagnol parce que j'habite en Espagne.", es: ["Aprendo español porque vivo en España.", "Aprendo el español porque vivo en España."] },
    ],
    dire: [
      { fr: "Je comprends déjà beaucoup de mots.", es: "Ya entiendo muchas palabras." },
      { fr: "Je comprends un peu, mais je ne parle pas encore beaucoup.", es: "Entiendo un poco, pero todavía no hablo mucho." },
      { fr: "Présente-toi en 3 phrases : ton nom, où tu habites, ton travail.", es: "Me llamo Kevin y soy francés. Vivo en Huesca desde hace cinco años. Trabajo desde casa." },
    ],
  },
  "U2-L1": {
    ecrire: [
      { consigne: T, fr: "Dorian a sept ans.", es: ["Dorian tiene siete años."] },
      { consigne: C, fr: "Nosotros ___ dos niños en casa. (tener)", es: ["tenemos"] },
      { consigne: L, fr: "15", es: ["quince"] },
      { consigne: T, fr: "Quand est ton anniversaire ?", es: ["¿Cuándo es tu cumpleaños?"] },
    ],
    dire: [
      { fr: "Léo a quatre ans et Dorian en a sept.", es: "Léo tiene cuatro años y Dorian tiene siete." },
      { fr: "Quel est ton numéro de téléphone ?", es: "¿Cuál es tu número de teléfono?" },
      { fr: "Compte de 11 à 20.", es: "once, doce, trece, catorce, quince, dieciséis, diecisiete, dieciocho, diecinueve, veinte" },
    ],
  },
  "U2-L2": {
    ecrire: [
      { consigne: L, fr: "45", es: ["cuarenta y cinco"] },
      { consigne: L, fr: "21", es: ["veintiuno"] },
      { consigne: T, fr: "Ça fait douze euros cinquante.", es: ["Son doce euros con cincuenta."] },
      { consigne: T, fr: "C'est à peu près quarante euros.", es: ["Son más o menos cuarenta euros."] },
    ],
    dire: [
      { fr: "Ça fait douze euros cinquante.", es: "Son doce euros con cincuenta." },
      { fr: "La moitié de cent, c'est cinquante.", es: "La mitad de cien es cincuenta." },
      { fr: "Dis ce numéro par deux chiffres : 61 23 45 67", es: "sesenta y uno, veintitrés, cuarenta y cinco, sesenta y siete" },
    ],
  },
  "U2-L3": {
    ecrire: [
      { consigne: T, fr: "Quelle heure est-il ?", es: ["¿Qué hora es?"] },
      { consigne: T, fr: "Il est une heure.", es: ["Es la una."] },
      { consigne: T, fr: "Il est huit heures et demie.", es: ["Son las ocho y media."] },
      { consigne: T, fr: "Je commence à travailler à neuf heures et demie.", es: ["Empiezo a trabajar a las nueve y media."] },
    ],
    dire: [
      { fr: "Il est trois heures moins le quart.", es: "Son las tres menos cuarto." },
      { fr: "À midi, je vais à la salle de sport.", es: "Al mediodía voy al gimnasio." },
      { fr: "Le soir, je parle espagnol avec Blanca.", es: "Por la noche hablo español con Blanca." },
    ],
  },
  "U2-L4": {
    ecrire: [
      { consigne: T, fr: "Aujourd'hui, c'est lundi.", es: ["Hoy es lunes."] },
      { consigne: T, fr: "Le jeudi (tous les jeudis), je ne vais pas à la salle de sport.", es: ["Los jueves no voy al gimnasio."] },
      { consigne: T, fr: "Le week-end, je ne travaille pas.", es: ["El fin de semana no trabajo.", "Los fines de semana no trabajo."] },
      { consigne: T, fr: "Demain, c'est mardi.", es: ["Mañana es martes."] },
    ],
    dire: [
      { fr: "Le jeudi, je ne vais pas à la salle de sport.", es: "Los jueves no voy al gimnasio." },
      { fr: "Je vais à la salle de sport quatre jours par semaine.", es: "Voy al gimnasio cuatro días a la semana." },
      { fr: "Demain matin, je travaille à la maison.", es: "Mañana por la mañana trabajo desde casa." },
    ],
  },
  "U2-L5": {
    ecrire: [
      { consigne: L, fr: "le 19 juin", es: ["el diecinueve de junio"] },
      { consigne: T, fr: "Quel jour sommes-nous ?", es: ["¿Qué día es hoy?"] },
      { consigne: L, fr: "2027", es: ["dos mil veintisiete"] },
      { consigne: T, fr: "Le mois prochain, c'est décembre.", es: ["El próximo mes es diciembre.", "El mes próximo es diciembre.", "El mes que viene es diciembre."] },
    ],
    dire: [
      { fr: "Nous nous marions le 19 juin 2027.", es: "Nos casamos el diecinueve de junio de dos mil veintisiete." },
      { fr: "Quand est ton anniversaire ?", es: "¿Cuándo es tu cumpleaños?" },
      { fr: "Noël, c'est le 25 décembre.", es: "Navidad es el veinticinco de diciembre." },
    ],
  },
};
