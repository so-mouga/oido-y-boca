// Les exercices écrits à l'avance, une leçon à la fois (générés dans Claude Code à partir du livre et du tableau).
// Ils n'utilisent que les mots et la grammaire déjà vus. Les cartes, elles, viennent des 5 mots du tableau.
//
// ecrire : { consigne, fr, es: [réponses acceptées] }   → tu tapes la réponse, l'appli vérifie.
//          + v, p pour un verbe à conjuguer (p : 0 = yo … 5 = ellos) : l'explication se calcule toute seule.
//            + d ("ue", "ie" ou "i") pour un verbe qui change de voyelle (dormir, empezar, vestirse).
//            ⚠ Jamais de v sur un irrégulier que controles.js ne connaît pas (IRREGULIERS).
//          + expl (facultatif) : l'explication écrite, quand la règle de la leçon n'aide pas pour cette phrase.
// dire   : { fr, es }                                    → tu la dis à voix haute, tu compares, tu te notes.
//
// Unités prêtes : 1, 2 et 3. Les suivantes s'ajoutent au fil des leçons.

const T = "Traduis";
const C = "Complète";
const L = "Écris en lettres";

export const EXERCICES = {
  "U1-L1": {
    ecrire: [
      { consigne: T, fr: "Je ne comprends pas.", es: ["No entiendo."] },
      { consigne: T, fr: "Tu peux parler plus lentement ?", es: ["¿Puedes hablar más despacio?"] },
      { consigne: C, fr: "Nosotros ___ francés en casa. (hablar)", es: ["hablamos"], v: "hablar", p: 3 },
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
      { consigne: C, fr: "Blanca ___ española. (ser)", es: ["es"], v: "ser", p: 2 },
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
      { consigne: C, fr: "Nosotros ___ en un piso. (vivir)", es: ["vivimos"], v: "vivir", p: 3 },
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
      { consigne: C, fr: "Hoy ___ muy cansado. (estar, yo)", es: ["estoy"], v: "estar", p: 0 },
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
      { consigne: C, fr: "Nosotros ___ con mis suegros el domingo. (comer)", es: ["comemos"], v: "comer", p: 3 },
      { consigne: T, fr: "Tu as des frères et sœurs ?", es: ["¿Tienes hermanos?"] },
      { consigne: T, fr: "Blanca est ma compagne.", es: ["Blanca es mi pareja."] },
      { consigne: C, fr: "Mis suegros ___ en Huesca hoy. (estar)", es: ["están"], v: "estar", p: 5 },
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
      { consigne: C, fr: "Nosotros ___ dos hijos. (tener)", es: ["tenemos"], v: "tener", p: 3 },
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
      { fr: "Ça fait trois euros vingt.", es: "Son tres euros con veinte céntimos." },
      { fr: "La moitié de cent, c'est cinquante.", es: "La mitad de cien es cincuenta." },
      { fr: "Dis ce numéro de portable, comme en Espagne : 6 12 34 56 78", es: "seis, doce, treinta y cuatro, cincuenta y seis, setenta y ocho" },
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
      { fr: "Aujourd'hui, c'est lundi ; hier, c'était dimanche.", es: "Hoy es lunes, ayer fue domingo." },
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
      { fr: "Quelle est la date du mariage ?", es: "¿Cuál es la fecha de la boda?" },
      { fr: "Noël, c'est le 25 décembre.", es: "Navidad es el veinticinco de diciembre." },
    ],
  },
  "U3-L1": {
    ecrire: [
      { consigne: T, fr: "Je me lève à sept heures.", es: ["Me levanto a las siete."] },
      { consigne: C, fr: "Blanca ___ a las siete y media. (levantarse)", es: ["se levanta"], v: "levantarse", p: 2 },
      { consigne: C, fr: "Léo y Dorian ___ a las ocho. (vestirse)", es: ["se visten"], v: "vestirse", d: "i", p: 5 },
      { consigne: T, fr: "Je me réveille à sept heures et je me douche.", es: ["Me despierto a las siete y me ducho."] },
    ],
    dire: [
      { fr: "Je me réveille à sept heures moins le quart.", es: "Me despierto a las siete menos cuarto." },
      { fr: "À quelle heure tu te lèves ?", es: "¿A qué hora te levantas?" },
      { fr: "Nous prenons le petit-déjeuner à huit heures.", es: "Desayunamos a las ocho." },
    ],
  },
  "U3-L2": {
    ecrire: [
      { consigne: T, fr: "Nous déjeunons à deux heures.", es: ["Comemos a las dos."] },
      { consigne: T, fr: "À la maison, nous dînons à neuf heures.", es: ["En casa cenamos a las nueve."] },
      { consigne: C, fr: "Léo y Dorian ___ a las cinco y media. (merendar)", es: ["meriendan"], v: "merendar", d: "ie", p: 5 },
      { consigne: T, fr: "Le dîner est à neuf heures et demie.", es: ["La cena es a las nueve y media."] },
    ],
    dire: [
      { fr: "En Espagne, nous déjeunons à deux heures.", es: "En España comemos a las dos." },
      { fr: "À quelle heure vous dînez ? (vosotros)", es: "¿A qué hora cenáis?" },
      { fr: "Le déjeuner, c'est à quelle heure ?", es: "¿A qué hora es la comida?" },
    ],
  },
  "U3-L3": {
    ecrire: [
      { consigne: T, fr: "Je me douche avant de prendre le petit-déjeuner.", es: ["Me ducho antes de desayunar."] },
      { consigne: T, fr: "Je me lève tôt.", es: ["Me levanto temprano."] },
      { consigne: T, fr: "Le dimanche (tous les dimanches), nous dînons tard.", es: ["Los domingos cenamos tarde."] },
      { consigne: T, fr: "Après avoir pris le petit-déjeuner, j'emmène Léo à l'école.", es: ["Después de desayunar, llevo a Léo al cole.", "Después de desayunar, llevo a Léo al colegio."] },
    ],
    dire: [
      { fr: "Avant de travailler, je vais à la salle de sport.", es: "Antes de trabajar, voy al gimnasio." },
      { fr: "Je déjeune, et ensuite je travaille.", es: "Como y luego trabajo." },
      { fr: "Après avoir dîné, je parle espagnol avec Blanca.", es: "Después de cenar, hablo español con Blanca." },
    ],
  },
  "U3-L4": {
    ecrire: [
      { consigne: T, fr: "Je rentre de la salle de sport à une heure et demie.", es: ["Vuelvo del gimnasio a la una y media."] },
      { consigne: C, fr: "Hoy no ___ ir al gimnasio. (poder, yo)", es: ["puedo"], v: "poder", d: "ue", p: 0 },
      { consigne: C, fr: "Dorian ___ mucho. (dormir)", es: ["duerme"], v: "dormir", d: "ue", p: 2 },
      { consigne: C, fr: "Nosotros ___ a las diez. (volver)", es: ["volvemos"], v: "volver", d: "ue", p: 3 },
    ],
    dire: [
      { fr: "Aujourd'hui, je ne peux pas aller à la salle de sport.", es: "Hoy no puedo ir al gimnasio." },
      { fr: "Le samedi (tous les samedis), je fais les courses avec Blanca.", es: "Los sábados hago la compra con Blanca." },
      { fr: "Blanca cuisine, et moi, je m'entraîne.", es: "Blanca cocina y yo entreno." },
    ],
  },
  "U3-L5": {
    ecrire: [
      { consigne: C, fr: "Yo ___ a trabajar a las nueve y media. (empezar)", es: ["empiezo"], v: "empezar", d: "ie", p: 0 },
      { consigne: T, fr: "Je ne dîne jamais tard.", es: ["Nunca ceno tarde.", "No ceno nunca tarde."] },
      { consigne: C, fr: "Léo ___ comer en casa. (preferir)", es: ["prefiere"], v: "preferir", d: "ie", p: 2 },
      { consigne: T, fr: "D'habitude, je m'entraîne chaque jour.", es: ["Normalmente entreno cada día."] },
    ],
    dire: [
      { fr: "D'habitude je m'entraîne chaque jour, mais parfois je ne peux pas.", es: "Normalmente entreno cada día, pero a veces no puedo." },
      { fr: "Je ne dîne presque jamais à neuf heures.", es: "Casi nunca ceno a las nueve." },
      { fr: "Tu veux dîner à la maison ?", es: "¿Quieres cenar en casa?" },
    ],
  },
  "U3-L6": {
    ecrire: [
      { consigne: C, fr: "Blanca y yo ___ al gimnasio. (ir)", es: ["vamos"], v: "ir", p: 3 },
      { consigne: T, fr: "À cinq heures, je vais chercher Léo à l'école.", es: ["A las cinco voy a buscar a Léo al cole.", "A las cinco voy a buscar a Léo al colegio."] },
      { consigne: C, fr: "Léo y Dorian ___ a las nueve. (acostarse)", es: ["se acuestan"], v: "acostarse", d: "ue", p: 5 },
      { consigne: T, fr: "J'arrive à la maison à six heures.", es: ["Llego a casa a las seis."] },
    ],
    dire: [
      { fr: "Le dimanche (tous les dimanches), je me repose.", es: "Los domingos descanso." },
      { fr: "Je me couche à onze heures.", es: "Me acuesto a las once." },
      { fr: "Raconte ta journée en 4 phrases : le réveil, le travail, le sport, le coucher.", es: "Me despierto a las siete. Trabajo desde casa. Vuelvo del gimnasio a la una y media. Me acuesto a las once." },
    ],
  },
};
